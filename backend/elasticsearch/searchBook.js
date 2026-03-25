/**
 * Searches for books across multiple text fields.
 * @param {string} searchTerm - The text the user is looking for.
 */

import { getBatchEmbeddings } from "./insertDataIntoElasticSearch.js";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { MinMaxScaler } from "./min_max_scaler.js";
import {
  getSearchIntent,
  levenshteinDistance,
  rerankWithDynamicQuartiles,
} from "./utils.js";
import { connect_to_elastic_search, esClient } from "./elasticsearch.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const scaler = new MinMaxScaler();
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
  targetVector,
  queryEmbedding,
  seedVector = null,
  intent = "GENERAL_SEARCH",
  options = { fields: [], minMatch: "50%", k: 50 },
) => {
  // 1. Validation: Only the absolute essentials should throw errors
  if (!cleanQuery || !targetVector || !queryEmbedding) {
    throw new Error(
      `Missing required search parameters: query, targetVector, expandedTermsEmbedding, or embedding.`,
    );
  }

  const tasks = [
    // Task A: Enhanced BM25 (Keyword Search)
    esClient().search({
      index: indexName,
      size: 30,
      query: {
        multi_match: {
          query: `${cleanQuery}`.trim(),
          fields: options.fields,
          fuzziness: "AUTO",
          minimum_should_match: "40%",
          // boost: 2.0,
        },
      },

      // 🔹 Vector (semantic) search — MUST be top-level
      // knn: {
      //   field: "title_embedding",
      //   query_vector: expandedTermsEmbedding,
      //   k: 50,
      //   num_candidates: 100, // important for recall
      //   boost: 1.5,
      // },
    }),

    // Task B: Semantic Search (Query Embedding)
    esClient().search({
      index: indexName,
      knn: {
        field: "context_embedding", // Dynamically chosen: title_embedding or context_embedding
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

export const two_pass_hybrid_search = async (
  isRelaxed = false,
  searchIntent = {},
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
      "isbn",
      "published_year",
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

    let seedVector = null;
    let expandedTerms = "";
    if (totalValue > 0 && seedResponse.hits.hits.length > 0) {
      const anchor = seedResponse.hits.hits[0]._source;
      // Step 2 Improvement: Use context_embedding_copy specifically for similarity
      seedVector = anchor.context_embedding_copy;

      // Query Expansion: Extract categories or unique title words to help the second pass
      expandedTerms = anchor.categories
        ? anchor.categories.split(",").slice(0, 2).join(",")
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
      // expandedTerms,
      targetVector,
      queryEmbedding,
      seedVector,
      // expandedTermsEmbedding,
      intent,
      {
        fields: dynamicFields,
        minMatch: isRelaxed ? "15%" : "35%",
        k: isRelaxed ? 150 : 20,
      },
    );

    const results = await Promise.all(tasks);
    const bm25Hits = results[0].hits.hits;
    const queryVecHits = results[1].hits.hits;
    const seedVecHits = results[2] ? results[2].hits.hits : [];

    // --- STEP 4: RANK-BASED MERGING (RRF) ---
    const scoreMap = new Map();
    const docMap = new Map();

    // const applyRefinedRRF = (hits, weight, source) => {
    //   hits.forEach((hit, index) => {
    //     const id = hit._id;
    //     const rank = index + 1;

    //     // Standard RRF formula
    //     let rankScore = weight / (20 + rank);

    //     // --- REFINEMENT LOGIC ---
    //     // Source Trust: Boost Lexical matches if they are highly ranked
    //     if (source === "bm25" && rank < 3) rankScore *= 1.2;

    //     // Recency Decay: Books older than 30 years get a slight penalty
    //     const year = parseInt(hit._source.published_year);
    //     const currentYear = new Date().getFullYear();
    //     if (currentYear - year > 30) rankScore *= 0.9;

    //     const currentTotal = scoreMap.get(id) || 0;
    //     scoreMap.set(id, currentTotal + rankScore);
    //     if (!docMap.has(id)) docMap.set(id, hit);
    //   });
    // };

    const applyRefinedRRF = (hits, weight, source) => {
      hits.forEach((hit, index) => {
        const id = hit._id;
        const rank = index + 1;

        // 1. Standard RRF formula (Using 60 is more stable for small datasets)
        const k = 60;
        let rankScore = weight / (k + rank);

        // 2. Combine Scores
        const currentTotal = scoreMap.get(id) || 0;
        scoreMap.set(id, currentTotal + rankScore);

        if (!docMap.has(id)) docMap.set(id, hit);
      });
    };

    applyRefinedRRF(bm25Hits, 1.0, "bm25"); // Strongest weight for exact keywords
    applyRefinedRRF(
      queryVecHits,
      intent == "NAVIGATIONAL_LOOKUP" || intent == "AUTHOR_SEARCH" ? 0.1 : 0.5,
      "knn",
    ); // High weight for semantic meaning
    if (seedVecHits)
      applyRefinedRRF(
        seedVecHits,
        intent == "NAVIGATIONAL_LOOKUP" || intent == "AUTHOR_SEARCH"
          ? 0.8
          : 0.3,
        "seed",
      ); // Supporting weight for similar neighbors

    // --- STEP 5: FINAL SCORING & TEXTUAL BOOSTING ---
    const lowerQuery = cleanQuery.toLowerCase();
    const currentYear = new Date().getFullYear();

    const finalResults = Array.from(scoreMap.entries())
      .map(([id, score]) => {
        const doc = docMap.get(id);
        const title = doc._source.title?.toLowerCase() || "";

        let finalScore = score;
        // 1. Recency Penalty (Apply ONCE)
        const year = parseInt(doc._source.published_year);
        if (currentYear - year > 30) {
          finalScore *= 0.9;
        }

        // 2. Title Match Multipliers (Instead of hardcoded addition)
        if (title === lowerQuery) {
          finalScore *= 2.0; // Double the score for exact match
        } else if (levenshteinDistance(title, lowerQuery) < 3) {
          finalScore *= 1.5; // 50% boost for near match
        } else if (title.includes(lowerQuery)) {
          finalScore *= 1.2; // 20% boost for partial match
        }

        return {
          ...doc,
          _score: finalScore,
        };
      })
      .filter((hit) => hit._score > 0.005)
      .sort((a, b) => b._score - a._score);
    // .slice(0, 10);

    return {
      results: finalResults,
      seedDoc: seedResponse.hits.hits[0]._source,
    };
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
    const searchIntent = getSearchIntent(queryText);

    // check for numeric searching
    // let results = await result_for_numeric_lookup(searchIntent);
    // if (results.length > 0 && searchIntent.isIdentifierQuery) return results;

    // --- STEP 1: INITIAL SEARCH (STRICT MODE) ---
    let { results, seedDoc } = await two_pass_hybrid_search(
      false,
      searchIntent,
    );

    // --- STEP 2: STEP-DOWN / RELAXATION (FAILURE HANDLING) ---
    // If no results or top score is very poor (< 0.05 in our refined RRF)
    if (results.length < 3 || results[0]._score < 0.001) {
      console.log(
        "Strict search yielded low quality. Retrying with Relaxation...",
      );
      results = await two_pass_hybrid_search(true, searchIntent);
    }

    // If still no results after relaxation, return empty
    if (results.length === 0) return [];

    results.forEach((el) => {
      console.log(el._source.title, el._score);
    });

    // --- STEP 3: THE TRUE SECOND PASS (CROSS-ENCODER RERANKING) ---
    // We send the query and the top 15 results to the Python Reranker
    try {
      // const documentsForRerank = results.map((hit) => ({
      //   id: hit._id,
      //   text: `${hit._source.title} ${hit._source.categories}: ${hit._source.description}`,
      // }));

      // const rerankResponse = await axios.post(
      //   `${process.env.PYTHON_SERVER_URL}/rerank`,
      //   {
      //     query:
      //       searchIntent.intent == "NAVIGATIONAL_LOOKUP" ||
      //       searchIntent.intent == "AUTHOR_SEARCH"
      //         ? `The book is about ${seedDoc.categories} . Description is ${seedDoc.description}`
      //         : searchIntent.cleanQuery,
      //     documents: documentsForRerank,
      //   },
      // );

      // // Map the new scores back to our documents
      // const rerankedScores = rerankResponse.data; // Expected format: { id: score }

      // // 1. Extract raw scores into arrays
      // const rrfRaw = results.map((r) => [r._score]); // Needs to be 2D array [[s1], [s2]...]
      // const ceRaw = results.map((r) => [rerankedScores[r._id] || 0]);

      // // 2. Scale them
      // const rrfScaled = scaler.fitTransform(rrfRaw);
      // const ceScaled = scaler.fitTransform(ceRaw);

      // // 3. Define weight strategy based on intent
      // const weightMap = {
      //   AUTHOR_SEARCH: { rrf: 0.7, ce: 0.3 }, // Keyword is king for names
      //   NAVIGATIONAL_LOOKUP: { rrf: 0.3, ce: 0.7 }, // Titles need exact matches
      //   DESCRIPTION_SEARCH: { rrf: 0.2, ce: 0.8 }, // Vibe/Plot needs semantic deep-dive
      //   GENERAL_SEARCH: { rrf: 0.4, ce: 0.6 }, // Standard hybrid balance
      // };

      // const { rrf: weightRRF, ce: weightCE } = weightMap[searchIntent.intent];

      // results = results
      //   .map((hit, index) => {
      //     const rrfScore = rrfScaled[index][0];
      //     const ceScore = ceScaled[index][0];
      //     return {
      //       ...hit,
      //       _metadata: {
      //         intent: searchIntent.intent, // Good for debugging
      //         rrfContribution: (rrfScore * weightRRF).toFixed(4),
      //         ceContribution: (ceScore * weightCE).toFixed(4),
      //       },
      //       _score: rrfScore * weightRRF + ceScore * weightCE,
      //     };
      //   })
      //   .sort((a, b) => b._score - a._score)
      //   .slice(0, 10);

      // return rerankWithDynamicQuartiles(
      //   results,
      //   rrfScaled,
      //   ceScaled,
      //   searchIntent.intent,
      // ).slice(0, 10);

      return results.slice(0,10)
    } catch (rerankError) {
      console.error(
        "Reranking failed, falling back to refined RRF scores:",
        rerankError,
      );
    }
    // If Python server is down, we still have our RRF results as fallback
    return results;
  } catch (error) {
    console.error("Expert Search Pipeline Error:", error);
    return [];
  }
};

async function runSearch() {
  await connect_to_elastic_search();
  // const matches = await two_pass_hybrid_search("Harry Potter and the Philosopher's Stone");
  const matches = await search_with_expert_ranking("mystery in a coffee shop");
  console.log("matches", matches);
  // matches.forEach((el) => {
  //   console.log({
  //     title: el._source.title,
  //     categories: el._source.categories,
  //     author: el._source.author,
  //   });
  // });

  // const count = await count_books_at_index()
  // console.log(`Total documents in index: ${count}`);
  // await checkTitleExists("Harry Potter and the Philosopher's Stone");
}

runSearch();
