/**
 * Searches for books across multiple text fields.
 * @param {string} searchTerm - The text the user is looking for.
 */

import { getBatchEmbeddings } from "./insertDataIntoElasticSearch.js";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import {
  checkTitleExists,
  count_books_at_index,
  getSearchIntent,
} from "./utils.js";
import { connect_to_elastic_search, esClient } from "./elasticsearch.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const indexName = process.env.INDEX_NAME;

const getSeedDoc = async (
  queryText,
  dynamicFields,
  targetVector,
  queryEmbedding,
) => {
  if (!queryText || !dynamicFields || !queryEmbedding || !targetVector)
    throw new Error("All arguments are required to get seed document");

  const seedResponse = await esClient().search({
    index: indexName,
    size: 1, // Still getting 1 for the vector, but making the query stronger
    query: {
      multi_match: {
        query: queryText,
        type: "best_fields",
        fields: dynamicFields,
        fuzziness: "AUTO",
        operator: "or",
        minimum_should_match: "50%",
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
  expandedTerms,
  targetVector,
  queryEmbedding,
  expandedTermsEmbedding,
  seedVector = null,
  options = { fields: [], minMatch: "50%", k: 50 },
) => {
  // 1. Validation: Only the absolute essentials should throw errors
  if (
    !cleanQuery ||
    !targetVector ||
    !queryEmbedding ||
    !expandedTermsEmbedding
  ) {
    throw new Error(
      `Missing required search parameters: query, targetVector, expandedTermsEmbedding, or embedding.`,
    );
  }

  // 2. Prepare the Tasks array
  const tasks = [
    // Task A: Enhanced BM25 (Keyword Search)
    esClient().search({
      index: indexName,
      size: 50,
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query: `${cleanQuery}`.trim(),
                fields: options.fields,
                fuzziness: "AUTO",
                minimum_should_match: "30%",
                boost: 2.0,
              },
            },
          ],
          should: [
            {
              multi_match: {
                query: expandedTerms || "",
                fields: ["categories^2", "description"],
                fuzziness: 2,
                boost: 1.0,
              },
            },
          ],
        },
      },

      // 🔹 Vector (semantic) search — MUST be top-level
      knn: {
        field: "context_embedding",
        query_vector: expandedTermsEmbedding,
        k: 50,
        num_candidates: 100, // important for recall
        boost: 0.5,
      },
    }),

    // Task B: Semantic Search (Query Embedding)
    esClient().search({
      index: indexName,
      knn: {
        field: targetVector, // Dynamically chosen: title_embedding or context_embedding
        query_vector: queryEmbedding,
        k: options.k || 50,
        num_candidates: (options.k || 50) * 2,
      },
    }),
  ];

  // Task C: Neighbor Search (Anchor/Seed Vector)
  // Only triggers if a high-confidence "Seed" document was found in Pass 1
  if (seedVector && seedVector.length > 0) {
    tasks.push(
      esClient().search({
        index: indexName,
        knn: {
          field: "context_embedding",
          query_vector: seedVector,
          k: options.k || 50,
          num_candidates: (options.k || 50) * 2,
        },
      }),
    );
  }

  return tasks;
};

export const two_pass_hybrid_search = async (queryText, isRelaxed = false) => {
  try {
    // 1. Intent & Routing
    const { cleanQuery, intent, boosts, targetVector } =
      getSearchIntent(queryText);

    // Construct dynamic BM25 fields based on intent
    const dynamicFields = [
      `title^${boosts.title}`,
      `author^${boosts.author}`,
      `description^${boosts.description}`,
      `categories^${boosts.categories}`,
      "publisher",
      "isbn",
      "published_year",
    ];

    console.log(`Intent Detected: ${intent} | Targeting: ${targetVector}`);

    // --- STEP 1: GET QUERY EMBEDDING ---
    const queryEmbedding = await getBatchEmbeddings([queryText]).then(
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

    let seedVector = null;
    let expandedTerms = "";
    if (totalValue > 0 && seedResponse.hits.hits.length > 0) {
      const anchor = seedResponse.hits.hits[0]._source;
      // Step 2 Improvement: Use context_embedding_copy specifically for similarity
      seedVector = anchor.context_embedding_copy;

      // Query Expansion: Extract categories or unique title words to help the second pass
      expandedTerms = anchor.categories
        ? anchor.categories.split(",").slice(0, 2).join(" ")
        : "";
      console.log(
        `Anchor found: ${anchor.title}. Expanding query with: ${expandedTerms}`,
      );
    }

    // --- STEP 3: PARALLEL RETRIEVALS ---
    const expandedTermsEmbedding = await getBatchEmbeddings([
      expandedTerms,
    ]).then((res) => res[0]);
    const tasks = await parallel_retrieval(
      cleanQuery,
      expandedTerms,
      targetVector,
      queryEmbedding,
      expandedTermsEmbedding,
      seedVector,
      {
        fields: dynamicFields,
        minMatch: isRelaxed ? "15%" : "35%",
        k: isRelaxed ? 150 : 50,
      },
    );

    const results = await Promise.all(tasks);
    const bm25Hits = results[0].hits.hits;
    const queryVecHits = results[1].hits.hits;
    const seedVecHits = results[2] ? results[2].hits.hits : [];

    // --- STEP 4: RANK-BASED MERGING (RRF) ---
    const scoreMap = new Map();
    const docMap = new Map();

    const applyRefinedRRF = (hits, weight, source) => {
      hits.forEach((hit, index) => {
        const id = hit._id;
        const rank = index + 1;

        // Standard RRF formula
        let rankScore = weight / (20 + rank);

        // --- REFINEMENT LOGIC ---
        // Source Trust: Boost Lexical matches if they are highly ranked
        if (source === "bm25" && rank < 3) rankScore *= 1.2;

        // Recency Decay: Books older than 30 years get a slight penalty
        const year = parseInt(hit._source.published_year);
        const currentYear = new Date().getFullYear();
        if (currentYear - year > 30) rankScore *= 0.9;

        const currentTotal = scoreMap.get(id) || 0;
        scoreMap.set(id, currentTotal + rankScore);
        if (!docMap.has(id)) docMap.set(id, hit);
      });
    };

    applyRefinedRRF(bm25Hits, 1.0, "bm25"); // Strongest weight for exact keywords
    applyRefinedRRF(queryVecHits, 0.8, "knn"); // High weight for semantic meaning
    if (seedVecHits) applyRefinedRRF(seedVecHits, 0.5, "seed"); // Supporting weight for similar neighbors

    // --- STEP 5: FINAL SCORING & TEXTUAL BOOSTING ---
    const finalResults = Array.from(scoreMap.entries())
      .map(([id, score]) => {
        const doc = docMap.get(id);
        const title = doc._source.title?.toLowerCase() || "";
        const lowerCleanQuery = cleanQuery.toLowerCase();

        let finalBoost = 0;
        // Exact title match gets a significant nudge
        if (title === lowerCleanQuery) finalBoost = 0.2;
        else if (title.includes(lowerCleanQuery)) finalBoost = 0.1;

        return {
          ...doc,
          _score: score + finalBoost,
        };
      })
      .sort((a, b) => b._score - a._score)
      .slice(0, 10);

    return finalResults;
  } catch (error) {
    console.error("Search Pipeline Error:", error);
    return [];
  }
};

/**
 * MASTER SEARCH FUNCTION
 * Handles: Intent, Hybrid Retrieval, Seed-Expansion, RRF Refinement,
 * Relaxation Waterfall, and Cross-Encoder Reranking.
 */
export const search_with_expert_ranking = async (queryText) => {
  try {
    // --- STEP 1: INITIAL SEARCH (STRICT MODE) ---
    let results = await two_pass_hybrid_search(queryText, false);

    // --- STEP 2: STEP-DOWN / RELAXATION (FAILURE HANDLING) ---
    // If no results or top score is very poor (< 0.05 in our refined RRF)
    if (results.length === 0 || results[0]._score < 0.05) {
      console.log(
        "Strict search yielded low quality. Retrying with Relaxation...",
      );
      results = await two_pass_hybrid_search(queryText, true);
    }

    // If still no results after relaxation, return empty
    if (results.length === 0) return [];

    // --- STEP 3: THE TRUE SECOND PASS (CROSS-ENCODER RERANKING) ---
    // We send the query and the top 15 results to the Python Reranker
    try {
      const documentsForRerank = results.map((hit) => ({
        id: hit._id,
        text: `${hit._source.title} ${hit._source.categories}: ${hit._source.description}`,
      }));

      const rerankResponse = await axios.post(
        `${process.env.PYTHON_SERVER_URL}/rerank`,
        {
          query: queryText,
          documents: documentsForRerank,
        },
      );

      // Map the new scores back to our documents
      const rerankedScores = rerankResponse.data; // Expected format: { id: score }

      results = results
        .map((hit) => {
          const rerankScore = rerankedScores[hit._id] || 0;
          return {
            ...hit,
            _score: hit._score * 0.3 + rerankScore * 0.7,
          };
        })
        .sort((a, b) => b._score - a._score);
    } catch (rerankError) {
      console.error(
        "Reranking failed, falling back to refined RRF scores:",
        rerankError,
      );
      // If Python server is down, we still have our RRF results as fallback
    }

    return results;
  } catch (error) {
    console.error("Expert Search Pipeline Error:", error);
    return [];
  }
};

async function runSearch() {
  await connect_to_elastic_search();
  // const matches = await two_pass_hybrid_search("Harry Potter and the Philosopher's Stone");
  const matches = await search_with_expert_ranking("Cleo Coyle");
  console.log("matches", matches);

  // const count = await count_books_at_index()
  // console.log(`Total documents in index: ${count}`);
  // await checkTitleExists("Harry Potter and the Philosopher's Stone");
}

runSearch();
