import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import {
  cross_encoder_ranking,
  getCleanedQuery,
  remove_irrelevent_books,
  RRF_ranking,
  setDynamicFields,
} from "./utils.js";
import { connect_to_elastic_search, esClient } from "./elasticsearch.js";
import {
  getBatchEmbeddings,
  remove_unnecessary_attribute,
} from "../lib/utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const indexName = process.env.INDEX_NAME;

const getSeedDoc = async (
  cleanQuery,
  dynamicFields,
  queryEmbedding,
  k,
  intent = "GENERAL_SEARCH",
  minMatch = "80%",
) => {
  if (!cleanQuery || !queryEmbedding)
    throw new Error("All arguments are required to get seed document");

  if (Number(k) < 1) throw new Error("arg:k must be >= 1");

  const tasks = [
    // Task A: Enhanced BM25 (Keyword Search)
    esClient().search({
      index: indexName,
      size: k,
      query: {
        multi_match: {
          query: `${cleanQuery}`.trim(),
          fields: dynamicFields,
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
        k: k || 30,
        num_candidates: (k || 30) * 2,
      },
    }),

    // Task C: Semantic Search on Context Embedding
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

  const results = await Promise.all(tasks);

  console.log("start rrf ranking for seed");
  const topK_results = await RRF_ranking(
    results,
    `SEED_VECTOR-${intent}`,
    Math.ceil(k * 1.5),
  );

  for (const doc of topK_results) {
    console.log(doc._source.title, doc.rrf_ranking_score);
  }

  //PREPARE DATA FOR CROSS-ENCODER
  console.log("start cross encoder ranking");
  const finalResults = await cross_encoder_ranking(
    topK_results,
    cleanQuery,
    `SEARCHING-${intent}`,
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
  dynamicFields = null,
  minMatch = "60%",
  k = 30,
) => {
  // 1. Validation: Only the absolute essentials should throw errors
  if (!cleanQuery || !queryEmbedding || !dynamicFields) {
    throw new Error(
      `Missing required search parameters: query, queryEmbedding, dynamicFields`,
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
          fields: dynamicFields,
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
  intent = "GENERAL_SEARCH",
) => {
  try {
    if (!cleanQuery) throw new Error("Please provide a valid query");
    if (Number(k) < 1) throw new Error("arg:k must be >= 1");

    //  GET QUERY EMBEDDING
    const queryEmbedding = await getBatchEmbeddings([cleanQuery]).then(
      (res) => res[0],
    );

    console.log("Embedding found . Lets starts processing ");
    console.log("index name", indexName);

    const dynamicFields = setDynamicFields(intent);

    console.log(dynamicFields);

    // INITIAL RETRIEVAL & QUERY EXPANSION (SEED)
    const seedBook = await getSeedDoc(
      cleanQuery,
      dynamicFields,
      queryEmbedding,
      5,
      intent,
      isRelaxed ? "70%" : "80%",
    );

    // PARALLEL RETRIEVALS
    console.log("start parallel searching");

    const tasks = await parallel_retrieval(
      cleanQuery,
      queryEmbedding,
      seedBook,
      // targetVector,
      dynamicFields,
      isRelaxed ? "30%" : "40%",
      isRelaxed ? 2 * k + 30 : 2 * k,
    );

    const results = await Promise.all(tasks);

    // RANK-BASED MERGING (RRF)
    console.log(`start rrf ranking, k=${k}, k*1.5=${Math.ceil(k * 1.5)}`);

    const topK_results = await RRF_ranking(
      results,
      `FINAL_RANKING-${intent}`,
      Math.ceil(k * 1.5),
    );

    for (const doc of topK_results) {
      console.log(doc._source.title, doc.rrf_ranking_score);
    }

    //PREPARE DATA FOR CROSS-ENCODER
    console.log("start cross encoder ranking");
    const finalResults = await cross_encoder_ranking(
      topK_results,
      cleanQuery,
      `FINAL_SEARCH-${intent}`,
      k,
    );

    return finalResults;
  } catch (error) {
    console.error("Search Pipeline Error:", error);
    return [];
  }
};

const search_book = async (
  queryText = null,
  intent = "GENERAL_SEARCH",
  k = 5,
) => {
  if (!queryText) throw new Error("Please provide valide query");
  if (Number(k) < 1) throw new Error("arg:k must be >= 1");

  const cleanQuery = getCleanedQuery(queryText);
  let results = []

  try {
    //  INITIAL SEARCH (STRICT MODE)
    let AllResults = await two_pass_hybrid_search(
      false,
      cleanQuery,
      2 * k,
      intent,
    );

    // STEP-DOWN / RELAXATION (FAILURE HANDLING)
    if (AllResults.length < 3 || AllResults[0].final_score < 0.001) {
      console.log(
        "Strict search yielded low quality. Retrying with Relaxation...",
      );
      AllResults = await two_pass_hybrid_search(
        true,
        cleanQuery,
        2 * k,
        intent,
      );
    }

    if (!Array.isArray(AllResults)) throw new Error("results must be an array");

    console.log(AllResults);

    // remove irrelevent docs
    results = remove_irrelevent_books(AllResults);

  } catch (error) {
    console.error("Relaxation Search Pipeline Error:", error);
    throw new Error(`Relaxation Search Pipeline Error: ${error.message}`);
  }

  return {
    books: results.slice(0,k),
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

export { search_book };
