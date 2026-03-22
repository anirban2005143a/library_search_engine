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

async function filterBooks(criteria, size = 10, page = 1) {
  const skip = (page - 1) * size;
  try {
    const mainMustClauses = Object.entries(criteria).map(([key, values]) => {
      const valueArray = Array.isArray(values) ? values : [values];

      return {
        bool: {
          // Field-level OR: At least one string in the array must match
          should: valueArray.map((val) => {
            const cleanVal = val.trim().toLowerCase();
            const words = cleanVal.split(/\s+/);
            const combinedWildcard = `*${words.join("*")}*`;

            return {
              bool: {
                // Element-level Ranking: Scores are summed for the final rank
                should: [
                  // Tier 1: Exact/Typo - The "Gold Standard"
                  {
                    match: {
                      [key]: {
                        query: cleanVal,
                        fuzziness: "AUTO",
                        operator: "and",
                        boost: 3.0, // Massive gap to ensure exacts stay on top
                      },
                    },
                  },
                  // Tier 2: Sequence Wildcard - The "Smart Partial"
                  {
                    wildcard: {
                      [key]: {
                        value: combinedWildcard,
                        boost: 2.0,
                        case_insensitive: true,
                      },
                    },
                  },
                  // Tier 3: Fragment Wildcard - The "Safety Net"
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
                      boost: 1.0, // Lowest priority
                    },
                  },
                ],
              },
            };
          }),
          minimum_should_match: 1,
        },
      };
    });

    const response = await esClient.search({
      index: indexName,
      size: size, // Limit
      from: skip, // Offset (starts at 0)
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
  // 1. Filter by a single publisher
  //   const byPublisher = await filterBooks({ publisher: "Penguin" });

  //   // 2. Filter by category AND publisher
  //   const specificBooks = await filterBooks({
  //     publisher: "Scholastic",
  //     categories: "Juvenile Fiction",
  //   });

  // 3. Filter by multiple possible values (using an array)
  const multipleCategories = await filterBooks({
  "categories": ["histfic"]
});

  console.log(multipleCategories);
}

runFilters();
