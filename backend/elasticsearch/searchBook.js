/**
 * Searches for books across multiple text fields.
 * @param {string} searchTerm - The text the user is looking for.
 */

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
import { getBatchEmbeddings } from "../lib/utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const indexName = process.env.INDEX_NAME;

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
        type: "best_fields",
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
  seedBook = {},
  fields = [],
  minMatch = "40%",
  k = 30,
) => {
  // 1. Validation: Only the absolute essentials should throw errors
  if (!cleanQuery || !queryEmbedding) {
    throw new Error(
      `Missing required search parameters: query, queryEmbedding.`,
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
        },
      },
    }),

    // Task B: Semantic Search (Query Embedding)
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

export const two_pass_hybrid_search = async (
  isRelaxed = false,
  searchIntent = {},
  topK = 30,
) => {
  try {
    // 1. Intent & Routing
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

    console.log(dynamicFields);

    console.log(`Intent Detected: ${intent} | Targeting: ${targetVector}`);

    // --- STEP 1: GET QUERY EMBEDDING ---
    const queryEmbedding = await getBatchEmbeddings([cleanQuery]).then(
      (res) => res[0],
    );

    console.log("Embedding found . Lets starts processing ");
    console.log("index name", indexName);

    // --- STEP 2: INITIAL RETRIEVAL & QUERY EXPANSION (SEED) ---
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

    // --- STEP 3: PARALLEL RETRIEVALS ---
    console.log("start parallel searching");
    const tasks = await parallel_retrieval(
      cleanQuery,
      queryEmbedding,
      seedBook,
      dynamicFields,
      isRelaxed ? "30%" : "40%",
      isRelaxed ? topK+30 : topK,
    );
    const results = await Promise.all(tasks);

    // --- STEP 4: RANK-BASED MERGING (RRF) ---
    console.log("start rrf ranking");
    const topK_results = await RRF_ranking(results, Math.floor(topK*1.5) , intent);
    for (const doc of topK_results) {
      console.log(doc._source.title, doc.rrf_ranking_score);
    }

    //remove the title_embedding_copy and context_embedding_copy from topK_results
    console.log(
      "cleaning topK_results : remove the title_embedding_copy and context_embedding_copy from topK_results",
    );
    const clean_topK_results = topK_results.map((doc) => {
      const newDoc = { ...doc };

      delete newDoc._source.title_embedding_copy;
      delete newDoc._source.context_embedding_copy;

      return newDoc;
    });

    // --- STEP 5: PREPARE DATA FOR CROSS-ENCODER ---
    console.log("start cross encoder ranking");
    const finalResults = await cross_encoder_ranking(clean_topK_results, cleanQuery , intent , topK);

    return finalResults;
  } catch (error) {
    console.error("Search Pipeline Error:", error);
    return [];
  }
};

export const search_with_relaxation = async (queryText, topK = 30) => {
  try {
    const searchIntent = getSearchIntent(queryText);

    console.log(searchIntent)

    // --- STEP 1: INITIAL SEARCH (STRICT MODE) ---
    let results = await two_pass_hybrid_search(false, searchIntent, topK);

    // --- STEP 2: STEP-DOWN / RELAXATION (FAILURE HANDLING) ---
    // If no results or top score is very poor (< 0.001 in our refined RRF)
    if (results.length < 3 || results[0].final_score < 0.001) {
      console.log(
        "Strict search yielded low quality. Retrying with Relaxation...",
      );
      results = await two_pass_hybrid_search(true, searchIntent);
    }

    return results;
  } catch (error) {
    console.error("Relaxation Search Pipeline Error:", error);
    return [];
  }
};

async function runSearch() {
  await connect_to_elastic_search();
  // const matches = await two_pass_hybrid_search("Harry Potter and the Philosopher's Stone");
  const matches = await search_with_relaxation("35850500000000", 10);
  // console.log("matches", matches);
  matches.forEach((el) => {
    console.log({
      _id: el._id,
      title: el._source.title,
      author: el._source.author,
      categories: el._source.categories,
      description: el._source.description,
      rrf_ranking_score: el.rrf_ranking_score,
      ce_score: el.ce_score,
      final_score: el.final_score,
    });
  });

  // const count = await count_books_at_index()
  // console.log(`Total documents in index: ${count}`);
  // await checkTitleExists("Harry Potter and the Philosopher's Stone");
}

runSearch();
