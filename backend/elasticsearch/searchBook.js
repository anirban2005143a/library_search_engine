import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import {
  count_books_at_index,
  cross_encoder_ranking,
  getCleanedQuery,
  getSearchIntent,
  RRF_ranking,
} from "./utils.js";
import { connect_to_elastic_search, esClient } from "./elasticsearch.js";
import {
  getBatchEmbeddings,
  remove_unnecessary_attribute,
} from "../lib/utils.js";
import { v4 as uuidv4 } from "uuid";
import { redis } from "../redis/redis.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const indexName = process.env.INDEX_NAME;
// const topK =
//   Number(process.env.TOTAL_RESULT) < 0
//     ? 1
//     : Math.min(Number(process.env.TOTAL_RESULT), 50);
// const pageSize = Number(process.env.PAGE_SIZE);

const getSeedDoc = async (
  cleanQuery,
  // dynamicFields,
  // targetVector,
  queryEmbedding,
  num_candidates,
  minMatch = "80%",
) => {
  if (!cleanQuery || !queryEmbedding)
    throw new Error("All arguments are required to get seed document");

  if (Number(num_candidates) < 1)
    throw new Error("arg:num_candidates must be >= 1");

  const tasks = [
    // Task A: Enhanced BM25 (Keyword Search)
    esClient().search({
      index: indexName,
      size: num_candidates,
      query: {
        multi_match: {
          query: `${cleanQuery}`.trim(),
          fields: [
            "title^3", // highest priority
            "author^2.5",
            "publisher^1.5",
            "format^2",
            "type^1.5",
            "reading_level^1.5",
            "isbn^1",
          ],
          fuzziness: "AUTO",
          minimum_should_match: minMatch,
          type: "most_fields",
        },
      },
    }),

    // Task B: Semantic Search on Title Embedding
    esClient().search({
      index: indexName,
      knn: {
        field: "title_embedding", // Dynamically chosen: title_embedding or context_embedding
        query_vector: queryEmbedding,
        k: num_candidates || 30,
        num_candidates: (num_candidates || 30) * 2,
      },
    }),

    // Task C: Semantic Search on Context Embedding
    esClient().search({
      index: indexName,
      knn: {
        field: "context_embedding", // Dynamically chosen: title_embedding or context_embedding
        query_vector: queryEmbedding,
        k: num_candidates || 30,
        num_candidates: (num_candidates || 30) * 2,
      },
    }),
  ];

  const results = await Promise.all(tasks);

  console.log("start rrf ranking for seed");
  const topK_results = await RRF_ranking(
    results,
    "SEED_VECTOR",
    Math.ceil(num_candidates*1.5),
  );


  for (const doc of topK_results) {
    console.log(doc._source.title, doc.rrf_ranking_score);
  }

  //PREPARE DATA FOR CROSS-ENCODER
  console.log("start cross encoder ranking");
  const finalResults = await cross_encoder_ranking(
    topK_results,
    cleanQuery,
    "SEARCHING",
    1,
  );

  const seed_book_id = finalResults[0]?._id || null;

  let seed_book = null;
  try {
    const response = await esClient().get(
      {
        index: indexName,
        id: seed_book_id,
      },
      {
        ignore: [404],
      },
    );

    if (!response.found) {
      return null;
    }
    seed_book = response._source;
  } catch (error) {
    console.log(
      "Error while fetching seed book by ID from elastic search",
      error.message,
    );
  }
  console.log(seed_book);
  return seed_book;
};

const parallel_retrieval = async (
  cleanQuery,
  queryEmbedding,
  // targetVector,
  seedBook = {},
  // fields = [],
  minMatch = "60%",
  k = 30,
) => {
  // 1. Validation: Only the absolute essentials should throw errors
  if (!cleanQuery || !queryEmbedding) {
    throw new Error(
      `Missing required search parameters: query, queryEmbedding.`,
    );
  }

  if (Number(k) < 1) throw new Error("arg:k must be >= 1");

  const tasks = [
    // Task A: Enhanced BM25 (Keyword Search)
    esClient().search({
      index: indexName,
      size: k,
      query: {
        multi_match: {
          query: `${cleanQuery}`.trim(),
          fields: [
            "title^3",
            "author^2.5",
            "publisher^1.5",
            "format^2",
            "type^1.5",
            "reading_level^1.5",
            "isbn^1",
          ],
          fuzziness: "AUTO",
          minimum_should_match: minMatch,
          type: "most_fields",
        },
      },
    }),

    // Task B: Semantic Search (Query Embedding)
    esClient().search({
      index: indexName,
      knn: {
        field: "title_embedding", // Dynamically chosen: title_embedding or context_embedding
        query_vector: queryEmbedding,
        k: k || 30,
        num_candidates: (k || 30) * 2,
      },
    }),

    // Task C: Semantic Search (Query Embedding)
    esClient().search({
      index: indexName,
      knn: {
        field: "context_embedding", // Dynamically chosen: title_embedding or context_embedding
        query_vector: queryEmbedding,
        k: k || 30,
        num_candidates: (k || 30) * 2,
      },
    }),
  ];

  // Task D & E: Neighbor Search (Anchor/Seed Vector)
  if (seedBook && Object.keys(seedBook).length > 0) {
    const seedbook_title_text =
      `${seedBook.type || ""} ${seedBook.title || ""} written by ${seedBook.author || ""} ${
        seedBook.publisher ? `published by ${seedBook.publisher}` : ""
      } ${seedBook.isbn ? `have ISBN: ${seedBook.isbn}` : ""} ${
        seedBook.reading_level ? `for ${seedBook.reading_level}` : ""
      } ${seedBook.format ? `with format ${seedBook.format}` : ""}`.toLowerCase();

    const categories = seedBook.categories
      ? seedBook.categories
          .split(",")
          .map((c) => c.trim())
          .join(", ")
      : "";
    const summary =
      seedBook.description && seedBook.description.length > 500
        ? seedBook.description.slice(0, 500) + "..."
        : seedBook.description || "No description available.";

    const contextText =
      categories || summary
        ? `This book is about ${categories}. Description: ${summary.slice(0)}`
        : "No description available for this book";

    const seedbook_context_text = contextText.toLowerCase();

    const seedbook_title_embedding = await getBatchEmbeddings([
      seedbook_title_text,
    ]).then((res) => res[0]);
    const seedbook_context_embedding = await getBatchEmbeddings([
      seedbook_context_text,
    ]).then((res) => res[0]);

    tasks.push(
      esClient().search({
        index: indexName,
        knn: {
          field: "title_embedding",
          query_vector: seedbook_title_embedding,
          k: k || 30,
          num_candidates: (k || 30) * 2,
        },
      }),
    );
    tasks.push(
      esClient().search({
        index: indexName,
        knn: {
          field: "context_embedding",
          query_vector: seedbook_context_embedding,
          k: k || 30,
          num_candidates: (k || 30) * 2,
        },
      }),
    );
  }

  return tasks;
};

const two_pass_hybrid_search = async (
  isRelaxed = false,
  cleanQuery = "",
  k = 5,
) => {
  try {
    // detect search intent
    // const { cleanQuery, intent, boosts, targetVector } = searchIntent;

    // Construct dynamic BM25 fields based on intent
    // const dynamicFields = [
    //   `title^${boosts.title}`,
    //   `author^${boosts.author}`,
    //   `description^${boosts.description}`,
    //   `categories^${boosts.categories}`,
    //   "publisher",
    //   `isbn^${boosts.isbn}`,
    //   `published_year^${boosts.published_year}`,
    // ];

    // console.log(`Intent Detected: ${intent} | Targeting: ${targetVector}`);

    //  GET QUERY EMBEDDING
    const queryEmbedding = await getBatchEmbeddings([cleanQuery]).then(
      (res) => res[0],
    );

    console.log("Embedding found . Lets starts processing ");
    console.log("index name", indexName);

    // INITIAL RETRIEVAL & QUERY EXPANSION (SEED)
    // We use the intent-based vector field to find the "Anchor" document
    const seedBook = await getSeedDoc(
      cleanQuery,
      // dynamicFields,
      // targetVector,
      queryEmbedding,
      5,
      isRelaxed ? "70%" : "80%",
    );

    // console.log("seed book " , seedBook)

    // PARALLEL RETRIEVALS
    console.log("start parallel searching");
    const tasks = await parallel_retrieval(
      cleanQuery,
      queryEmbedding,
      seedBook,
      // targetVector,
      // dynamicFields,
      isRelaxed ? "30%" : "40%",
      isRelaxed ? 2 * k + 30 : 2 * k,
    );
    const results = await Promise.all(tasks);

    // console.log(results[0].hits)

    // RANK-BASED MERGING (RRF)
    console.log("start rrf ranking");
    const topK_results = await RRF_ranking(
      results,
      "FINAL_RANKING",
      Math.ceil(k * 1.5),
    );
    for (const doc of topK_results) {
      console.log(doc._source.title, doc.rrf_ranking_score);
    }

    //remove the title_embedding_copy and context_embedding_copy from topK_results
    // console.log(
    //   "cleaning topK_results : remove the title_embedding_copy and context_embedding_copy from topK_results",
    // );
    // const clean_topK_results = remove_unnecessary_attribute(topK_results);

    //PREPARE DATA FOR CROSS-ENCODER
    console.log("start cross encoder ranking");
    const finalResults = await cross_encoder_ranking(
      topK_results,
      cleanQuery,
      "FINAL_SEARCH",
      k,
    );

    return finalResults;
  } catch (error) {
    console.error("Search Pipeline Error:", error);
    return [];
  }
};

const search_with_relaxation = async (
  queryText,
  searchId,
  k = 5,
  pageSize = 5,
) => {
  if (!queryText) throw new Error("Please provide valide query");
  if (!searchId) throw new Error("Please provide searchId");
  if (Number(k) < 1) throw new Error("arg:k must be >= 1");
  if (Number(pageSize) < 1) throw new Error("arg:pageSize must be >= 1");

  const cleanQuery = getCleanedQuery(queryText);

  try {
    // const searchIntent = await getSearchIntent(queryText);

    // console.log(searchIntent);

    //  INITIAL SEARCH (STRICT MODE)
    let results = await two_pass_hybrid_search(false, cleanQuery, k);

    // STEP-DOWN / RELAXATION (FAILURE HANDLING) If no results or top score is very poor (< 0.001 in our refined RRF)
    if (results.length < 3 || results[0].final_score < 0.001) {
      console.log(
        "Strict search yielded low quality. Retrying with Relaxation...",
      );
      results = await two_pass_hybrid_search(true, cleanQuery, k);
    }

    if (!Array.isArray(results)) throw new Error("results must be an array");

    //store topk results in cache using redis (with page size 10)
    const pipeline = redis.pipeline();
    const TTL = 600; // 10 minutes

    // Chunk the results into pages
    for (let i = 0; i < results.length; i += pageSize) {
      const pageNumber = Math.floor(i / pageSize) + 1;
      const slice = results.slice(i, i + pageSize);

      // Store each slice as its own key
      const key = `search:${searchId}:page:${pageNumber}`;
      pipeline.setex(key, TTL, JSON.stringify(slice));
      console.log(
        `[DEBUG] Caching page ${pageNumber} with ${slice.length} items under key: ${key}`,
      );
    }

    const totalPages = Math.ceil(results.length / pageSize);
    console.log(`[DEBUG] Storing total pages: ${totalPages}`);

    await pipeline.exec();
    console.log(
      `[INFO] Successfully cached ${results.length} results in ${totalPages} pages for searchId: ${searchId}`,
    );

    console.log("Cached user search query");

    // return searchId;
  } catch (error) {
    console.error("Relaxation Search Pipeline Error:", error);
    throw new Error(`Relaxation Search Pipeline Error: ${error.message}`);
  }
};

export const search_book_with_page_number = async (
  queryText = null,
  searchId,
  totalCount = 5,
  pageSize = 5,
  page = 1,
) => {
  if (!queryText) throw new Error("Invalid query");

  page = parseInt(page);

  if (page < 1 || page > Math.ceil(totalCount / pageSize))
    throw new Error("Invalide page size");

  if (!searchId) searchId = uuidv4();

  let previousQuery = await redis.get(`search:query:${searchId}`);
  queryText = getCleanedQuery(queryText);

  // If query changed → new search
  if (
    !previousQuery ||
    (previousQuery?.trim() || "") !== (queryText?.trim() || "")
  ) {
    // delete all previous pages
    const oldKeys = await redis.keys(`search:${searchId}:page:*`);
    if (oldKeys.length) await redis.del(oldKeys);

    // delete old query
    await redis.del(`search:query:${searchId}`);

    // assign new searchId
    searchId = uuidv4();

    // store the query with expiry
    await redis.setex(`search:query:${searchId}`, 600, queryText);
  }

  let key = `search:${searchId}:page:${page}`;
  let data = await redis.get(key);

  // Either the search expired or the user requested a non-existent page (then compute the search)
  if (!data) {
    await search_with_relaxation(queryText, searchId);
    key = `search:${searchId}:page:${page}`;
    data = await redis.get(key);

    if (!data) {
      throw new Error("Page does not exist");
    }
  }

  let results = [];
  try {
    results = data ? JSON.parse(data) : [];
  } catch (err) {
    console.error(`[ERROR] Failed to parse Redis data for key: ${key}`, err);
    throw new Error("Failed to parse cached results");
  }

  return {
    searchId,
    data: results,
    page,
  };
};

async function runSearch() {
  await connect_to_elastic_search();
  // const matches = await search_book_with_page_number("Salem Falls", 10);
  // console.log("matches", matches);
  // matches.forEach((el) => {
  //   console.log({
  //     _id: el._id,
  //     title: el._source.title,
  //     author: el._source.author,
  //     categories: el._source.categories,
  //     description: el._source.description,
  //     rrf_ranking_score: el.rrf_ranking_score,
  //     ce_score: el.ce_score,
  //     final_score: el.final_score,
  //   });
  // });

  // const count = await count_books_at_index();
  // console.log(`Total documents in index: ${count}`);
  // await checkTitleExists("Harry Potter and the Philosopher's Stone");
}

// runSearch();
