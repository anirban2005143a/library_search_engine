/**
 * Searches for books across multiple text fields.
 * @param {string} searchTerm - The text the user is looking for.
 */

import { esClient, getBatchEmbeddings } from "./insertDataIntoElasticSearch.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { checkTitleExists, countResponse } from "./utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const indexName = process.env.INDEX_NAME;

const getSeedDoc = async (queryText, queryEmbedding) => {
  const seedResponse = await esClient.search({
    index: indexName,
    size: 1, // Still getting 1 for the vector, but making the query stronger
    query: {
      multi_match: {
        query: queryText,
        type: "best_fields",
        fields: [
          "title^3",
          "author^2",
          "description^2",
          "publisher^2",
          "categories",
          "published_year",
          "isbn",
        ], // Heavy boost on title
        fuzziness: "AUTO", // Helps with "pottre" -> "potter"
        operator: "or",
        minimum_should_match: "50%"
      },
    },
    knn: {
      field: "embedding", // Ensure this matches your migration field name!
      query_vector: queryEmbedding,
      k: 5,
      num_candidates: 50,
    },
  });

  return seedResponse;
};

const parallel_retrieval = async (
  queryText,
  queryEmbedding,
  seedVector = null,
) => {
  const tasks = [
    // BM25
    esClient.search({
      index: indexName,
      size: 50,
      query: {
        multi_match: {
          query: queryText,
          fields: [
            "title^3", // ^3 "boosts" the title so it's more important
            "author^2", // ^2 makes author more important than description
            "description",
            "publisher",
            "categories^2",
            "published_year",
            "isbn",
          ],
          fuzziness: "AUTO",
          minimum_should_match: "75%",
        },
      },
    }),
    // Query embedding search
    esClient.search({
      index: indexName,
      knn: {
        field: "embedding",
        query_vector: queryEmbedding,
        k: 50,
        num_candidates: 100,
      },
    }),
  ];

  // Only add seed search if we actually found a seed vector
  if (seedVector) {
    tasks.push(
      esClient.search({
        index: indexName,
        knn: {
          field: "embedding",
          query_vector: seedVector,
          k: 50,
          num_candidates: 150,
        },
      }),
    );
  }

  return tasks;
};

export const two_pass_hybrid_search = async(queryText)=> {
  try {
    // --- STEP 1: GET QUERY EMBEDDING ---
    const queryEmbedding = await getBatchEmbeddings([queryText]).then(
      (res) => res[0],
    );

    console.log("Embedding found . Lets starts processing ");
    console.log("index name", indexName);

    // --- STEP 2: INITIAL RETRIEVAL (SEED DOCUMENT) ---
    const seedResponse = await getSeedDoc(queryText, queryEmbedding);

    // Get the total count safely
    const total = seedResponse.hits.total;
    const totalValue = typeof total === "number" ? total : total?.value || 0;

    let seedVector = null;
    if (totalValue > 0 && seedResponse.hits.hits.length > 0) {
      // IMPORTANT: Verify if your field is 'embedding' or 'embedding_copy'
      seedVector = seedResponse.hits.hits[0]._source.embedding_copy;
      console.log(`Anchor found: ${seedResponse.hits.hits[0]._source.title}`);
    }

    // --- STEP 3: PARALLEL RETRIEVALS ---
    const tasks = await parallel_retrieval(
      queryText,
      queryEmbedding,
      seedVector,
    );

    const results = await Promise.all(tasks);
    const bm25Hits = results[0].hits.hits;
    const queryVecHits = results[1].hits.hits;
    const seedVecHits = results[2] ? results[2].hits.hits : [];

    // --- STEP 4: RANK-BASED MERGING (RRF-STYLE) ---
    // This solves the "Score Gap" problem by using position instead of raw numbers.
    const scoreMap = new Map();
    const docMap = new Map();

    const applyRankScore = (hits, weight) => {
      hits.forEach((hit, index) => {
        const id = hit._id;
        const rank = index + 1;
        const currentScore = scoreMap.get(id) || 0;

        // RRF formula: weight / (rank + k) where k is a smoothing constant (default 60)
        const rankScore = weight / (60 + rank);
        scoreMap.set(id, currentScore + rankScore);

        if (!docMap.has(id)) docMap.set(id, hit);
      });
    };

    applyRankScore(bm25Hits, 1.0); // Strongest weight for exact keywords
    applyRankScore(queryVecHits, 0.7); // High weight for semantic meaning
    applyRankScore(seedVecHits, 0.4); // Supporting weight for similar neighbors

    // --- STEP 5: FINAL SCORING & TEXTUAL BOOSTING ---
    const finalResults = Array.from(scoreMap.entries())
      .map(([id, score]) => {
        const doc = docMap.get(id);
        const title = doc._source.title?.toLowerCase() || "";
        const query = queryText.toLowerCase();

        // Small "Exact Match" nudge
        let finalBoost = 0;
        if (title === query) finalBoost = 0.1;
        else if (title.includes(query)) finalBoost = 0.05;

        return {
          ...doc,
          _score: score + finalBoost, // Assigning to _score for consistency
        };
      })
      .sort((a, b) => b._score - a._score)
      .slice(0, 10);

    return finalResults;
  } catch (error) {
    console.error("Search Pipeline Error:", error);
    return [];
  }
}

async function runSearch() {
  // const matches = await two_pass_hybrid_search("Harry Potter and the Philosopher's Stone");
  const matches = await two_pass_hybrid_search("whodunnit");
  console.log("matches", matches);

  // console.log(`Total documents in index: ${countResponse.count}`);
  // await checkTitleExists("Harry Potter and the Philosopher's Stone");
}

// runSearch();
