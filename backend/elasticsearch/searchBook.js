import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import {
  count_books_at_index,
  cross_encoder_ranking,
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
const topK =
  Number(process.env.TOTAL_RESULT) < 0
    ? 1
    : Math.min(Number(process.env.TOTAL_RESULT), 50);
const pageSize = Number(process.env.PAGE_SIZE);

const getSeedDoc = async (
  cleanQuery,
  dynamicFields,
  targetVector,
  queryEmbedding,
) => {
  if (!cleanQuery || !dynamicFields || !queryEmbedding || !targetVector)
    throw new Error("All arguments are required to get seed document");

  const seedResponse = await esClient().search({
    index: indexName,
    size: 1, // Still getting 1 for the vector, but making the query stronger
    query: {
      multi_match: {
        query: cleanQuery,
        type: "most_fields",
        fields: dynamicFields,
        fuzziness: "AUTO",
        operator: "or",
        minimum_should_match: "70%",
      },
    },
    knn: {
      field: targetVector, // Dynamically use title_embedding or context_embedding
      query_vector: queryEmbedding,
      k: 5,
      num_candidates: 50,
    },
  });

  return seedResponse;
};

const parallel_retrieval = async (
  cleanQuery,
  queryEmbedding,
  targetVector,
  seedBook = {},
  fields = [],
  minMatch = "40%",
  k = 30,
) => {
  // 1. Validation: Only the absolute essentials should throw errors
  if (!cleanQuery || !queryEmbedding || !targetVector) {
    throw new Error(
      `Missing required search parameters: query, queryEmbedding , targetVector.`,
    );
  }

  if (!Array.isArray(fields) || fields.length == 0) {
    throw new Error("Fields should be non empty array");
  }

  const tasks = [
    // Task A: Enhanced BM25 (Keyword Search)
    esClient().search({
      index: indexName,
      size: k,
      query: {
        multi_match: {
          query: `${cleanQuery}`.trim(),
          fields: fields,
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
        field: targetVector, // Dynamically chosen: title_embedding or context_embedding
        query_vector: queryEmbedding,
        k: k || 30,
        num_candidates: (k || 30) * 2,
      },
    }),
  ];

  // Task C: Neighbor Search (Anchor/Seed Vector)
  if (seedBook && Object.keys(seedBook).length > 0) {
    tasks.push(
      esClient().search({
        index: indexName,
        knn: {
          field: "title_embedding",
          query_vector: seedBook.title_embedding_copy,
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
          query_vector: seedBook.context_embedding_copy,
          k: k || 30,
          num_candidates: (k || 30) * 2,
        },
      }),
    );
  }

  return tasks;
};

const two_pass_hybrid_search = async (isRelaxed = false, searchIntent = {}) => {
  try {
    // detect search intent
    const { cleanQuery, intent, boosts, targetVector } = searchIntent;

    // Construct dynamic BM25 fields based on intent
    const dynamicFields = [
      `title^${boosts.title}`,
      `author^${boosts.author}`,
      `description^${boosts.description}`,
      `categories^${boosts.categories}`,
      "publisher",
      `isbn^${boosts.isbn}`,
      `published_year^${boosts.published_year}`,
    ];

    console.log(`Intent Detected: ${intent} | Targeting: ${targetVector}`);

    //  GET QUERY EMBEDDING
    const queryEmbedding = await getBatchEmbeddings([cleanQuery]).then(
      (res) => res[0],
    );

    console.log("Embedding found . Lets starts processing ");
    console.log("index name", indexName);

    // INITIAL RETRIEVAL & QUERY EXPANSION (SEED)
    // We use the intent-based vector field to find the "Anchor" document
    const seedResponse = await getSeedDoc(
      cleanQuery,
      dynamicFields,
      targetVector,
      queryEmbedding,
    );

    // Get the total count safely
    const total = seedResponse.hits.total;
    const totalValue = typeof total === "number" ? total : total?.value || 0;

    let seedBook = null;
    if (totalValue > 0 && seedResponse.hits.hits.length > 0) {
      seedBook = seedResponse.hits.hits[0]._source;
    }

    // console.log("seed book " , seedBook)

    // PARALLEL RETRIEVALS
    console.log("start parallel searching");
    const tasks = await parallel_retrieval(
      cleanQuery,
      queryEmbedding,
      targetVector,
      seedBook,
      dynamicFields,
      isRelaxed ? "30%" : "40%",
      isRelaxed ? 2 * topK + 30 : 2 * topK,
    );
    const results = await Promise.all(tasks);

    // console.log(results[0].hits)

    // RANK-BASED MERGING (RRF)
    console.log("start rrf ranking");
    const topK_results = await RRF_ranking(results, intent);
    for (const doc of topK_results) {
      console.log(doc._source.title, doc.rrf_ranking_score);
    }

    //remove the title_embedding_copy and context_embedding_copy from topK_results
    console.log(
      "cleaning topK_results : remove the title_embedding_copy and context_embedding_copy from topK_results",
    );
    const clean_topK_results = remove_unnecessary_attribute(topK_results);

    //PREPARE DATA FOR CROSS-ENCODER
    console.log("start cross encoder ranking");
    const finalResults = await cross_encoder_ranking(
      clean_topK_results,
      cleanQuery,
      intent,
    );

    return finalResults;
  } catch (error) {
    console.error("Search Pipeline Error:", error);
    return [];
  }
};

const search_with_relaxation = async (queryText, searchId) => {
  if (!queryText) throw new Error("Please provide valide query");
  if (!searchId) throw new Error("Please provide searchId");

  try {
    const searchIntent = await getSearchIntent(queryText);

    console.log(searchIntent);

    //  INITIAL SEARCH (STRICT MODE)
    let results = await two_pass_hybrid_search(false, searchIntent);

    // STEP-DOWN / RELAXATION (FAILURE HANDLING) If no results or top score is very poor (< 0.001 in our refined RRF)
    if (results.length < 3 || results[0].final_score < 0.001) {
      console.log(
        "Strict search yielded low quality. Retrying with Relaxation...",
      );
      results = await two_pass_hybrid_search(true, searchIntent);
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

    return searchId;
  } catch (error) {
    console.error("Relaxation Search Pipeline Error:", error);
    throw new Error(`Relaxation Search Pipeline Error: ${error.message}`);
  }
};

export const search_book_with_page_number = async (
  queryText = null,
  searchId,
  page = 1,
) => {
  if (!queryText) throw new Error("Invalid query");

  page = parseInt(page);

  if (page < 1 || page > Math.ceil(topK / pageSize))
    throw new Error("Invalide page size");

  if (!searchId) searchId = uuidv4();

  let previousQuery = await redis.get(`search:query:${searchId}`);

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
    await search_with_relaxation(queryText , searchId);
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
  // const matches = await two_pass_hybrid_search("Harry Potter and the Philosopher's Stone");
  // const matches = await search_with_relaxation("Salem Falls", 10);
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

  const count = await count_books_at_index();
  console.log(`Total documents in index: ${count}`);
  // await checkTitleExists("Harry Potter and the Philosopher's Stone");
}

// runSearch();
