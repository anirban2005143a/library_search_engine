/**
 * Retrieves books based on exact metadata filters.
 * @param {Object} criteria - Key-value pairs (e.g., { publisher: "Scholastic", categories: "Fiction" })
 * @param {number} size - How many books to return (default 20)
 */

import { esClient, getBatchEmbeddings } from "./insertDataIntoElasticSearch.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const indexName = process.env.INDEX_NAME;

async function filterBooks(
  criteria,
  size = 10,
  page = 1,
  queryEmbedding = null,
) {
  const skip = (page - 1) * size;
  try {
    const mainMustClauses = Object.entries(criteria).map(([key, values]) => {
      const valueArray = Array.isArray(values) ? values : [values];

      // For the "categories" field, we will later add semantic kNN if queryEmbedding exists
      const isCategoryField = key === "categories";

      const shouldClauses = valueArray.map( (val , idx) => {
        const cleanVal = val.trim().toLowerCase();
        const words = cleanVal.split(/\s+/);
        const combinedWildcard = `*${words.join("*")}*`;

        const clauses = [
          // Tier 1: Exact/Fuzzy
          {
            match: {
              [key]: {
                query: cleanVal,
                fuzziness: "AUTO",
                operator: "and",
                boost: 3.0,
              },
            },
          },
          // Tier 2: Sequence Wildcard
          {
            wildcard: {
              [key]: {
                value: combinedWildcard,
                boost: 2.0,
                case_insensitive: true,
              },
            },
          },
          // Tier 3: Fragment Wildcard
          {
            bool: {
              must: words.map((word) => ({
                wildcard: {
                  [key]: {
                    value: `*${word}*`,
                    case_insensitive: true,
                  },
                },
              })),
              boost: 1.0,
            },
          },
        ];

        // Add kNN if category field AND embeddings are provided
        if (
          isCategoryField &&
          queryEmbedding &&
          Array.isArray(queryEmbedding)
        ) {
          clauses.push({
            function_score: {
              query: {
                knn: {
                  field: "genre_embedding",
                  query_vector: queryEmbedding[idx], // Use the embedding corresponding to this value
                  k: 50,
                  num_candidates: 100,
                },
              },
              boost: 2.0,
              boost_mode: "sum",
            },
          });
        }

        return { bool: { should: clauses } };
      });

      return {
        bool: {
          should: shouldClauses,
          minimum_should_match: 1,
        },
      };
    });

    const response = await esClient.search({
      index: indexName,
      size: size, // Limit
      // from: skip, // Offset (starts at 0)
      query: {
        bool: {
          must: mainMustClauses, // Cross-field AND
        },
      },
    });

    // Handle the TypeScript Union Type Error here:
    const totalValue =
      typeof response.hits.total === "number"
        ? response.hits.total
        : response.hits.total?.value || 0;
    return {
      total: totalValue, // Tells the UI how many pages to build
      results: response.hits.hits.map((hit) => ({
        id: hit._id,
        score: hit._score,
        ...hit._source,
      })),
    };
  } catch (error) {
    console.error("Filter Pipeline Error:", error);
    return [];
  }
}

// --- Examples of how to use this ---

async function runFilters() {
  const data = {
  categories: ["coming-of-age adventure in war"]
};

  if (data["categories"])
    data["categories"] = data["categories"].map((val) => val.toLowerCase());

  const embeddings = await getBatchEmbeddings(data["categories"]);

  const results = await filterBooks(data, 10, 1, embeddings);

  console.log(results);
}

// runFilters();
