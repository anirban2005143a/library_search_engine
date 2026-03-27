/**
 * Retrieves books based on exact metadata filters.
 * @param {Object} criteria - Key-value pairs (e.g., { publisher: "Scholastic", categories: "Fiction" })
 * @param {number} size - How many books to return (default 20)
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { colsRequired } from "../db/db.js";
import { connect_to_elastic_search, esClient } from "./elasticsearch.js";
import {
  getBatchEmbeddings,
  remove_unnecessary_attribute,
} from "../lib/utils.js";
import { cross_encoder_ranking, maxGapCutoff } from "./utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const indexName = process.env.INDEX_NAME;

export const filterBooks = async (
  criteria,
  size = 10,
  page = 1,
  queryEmbedding = null,
) => {
  const skip = (page - 1) * size;
  try {
    const mainMustClauses = Object.entries(criteria)
      .filter(([key]) => colsRequired.includes(key.toLowerCase()))
      .map(([key, values]) => {
        const valueArray = Array.isArray(values) ? values : [values];

        // For the "categories" field, we will later add semantic kNN if queryEmbedding exists
        const isCategoryField = key === "categories" || key === "description";

        const shouldClauses = valueArray.map((val, idx) => {
          const cleanVal = val.trim().toLowerCase();
          const words = cleanVal.split(/\s+/);
          const combinedWildcard = `*${words.join("*")}*`;

          const clauses = [
            // Tier 1: Exact
            {
              match: {
                [key]: {
                  query: cleanVal,
                  minimum_should_match: "80%",
                  boost: isCategoryField ? 2 : 5, // exact match gets higher weight
                },
              },
            },
            // Tier 1: Exact/Fuzzy
            {
              match: {
                [key]: {
                  query: cleanVal,
                  fuzziness: "AUTO",
                  minimum_should_match: "70%",
                  boost: isCategoryField ? 2 : 3.0,
                },
              },
            },
            // Tier 2: Sequence Wildcard
            {
              wildcard: {
                [key]: {
                  value: combinedWildcard,
                  boost: isCategoryField ? 1 : 2.0,
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
                    field: "context_embedding",
                    query_vector: queryEmbedding[idx], // Use the embedding corresponding to this value
                    k: 20,
                    num_candidates: 50,
                  },
                },
                boost: isCategoryField ? 6.0 : 3.0,
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

    const response = await esClient().search({
      index: indexName,
      size: size, // Limit
      // from: skip, // Offset (starts at 0)
      query: {
        bool: {
          must: mainMustClauses, // Cross-field AND
        },
      },
    });

    const results = remove_unnecessary_attribute(response.hits.hits);
    if (criteria["categories"] || criteria["description"]) {
      const category_text = criteria["categories"]
        ? Array.isArray(criteria["categories"])
          ? criteria["categories"].join(", ")
          : criteria["categories"].split(" ").join(", ")
        : " ";
      const description_text = criteria["description"]
        ? Array.isArray(criteria["description"])
          ? criteria["description"].join(", ")
          : criteria["description"].split(" ").join(", ")
        : "";

      const ranked_result = await cross_encoder_ranking(
        results,
        criteria["categories"]
          ? `Categories: ${category_text}`
          : `Description: ${description_text}`,
        "FILTERING",
        results.length,
      );
      return ranked_result;
    }
    return results;
  } catch (error) {
    console.error("Filter Pipeline Error:", error);
    return [];
  }
};

// --- Examples of how to use this ---

async function runFilters() {
  await connect_to_elastic_search();

  const data = { categories: ["coming of age adventure"] };

  console.log("query:", data);

  if (data["categories"]) {
    data["categories"] = Array.isArray(data["categories"])
      ? data["categories"]
      : [data["categories"]];
    data["categories"] = data["categories"].map((val) => val.toLowerCase());
  }

  if (data["description"]) {
    data["description"] = Array.isArray(data["description"])
      ? data["description"]
      : [data["description"]];
    data["description"] = data["description"].map((val) => val.toLowerCase());
  }

  const embeddings = await getBatchEmbeddings(data["categories"]);

  let results = await filterBooks(data, 10, 1, embeddings);

  const scores = results.map((doc)=>{
    if(doc.final_score) return doc.final_score
  })

  if(scores.length > 0){
    results = maxGapCutoff(results , scores , {
      minDocs:1 ,
      maxDocs:scores.length
    })
  }

  results.forEach((el) => {
    console.log({
      _id: el._id,
      title: el._source?.title,
      author: el._source?.author,
      categories: el._source?.categories,
      description: el._source?.description,
      _score: el._score,
      ce_score: el.ce_score || undefined,
      final_score: el.final_score,
    });
  });
}

// runFilters();
