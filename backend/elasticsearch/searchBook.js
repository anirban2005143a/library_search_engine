/**
 * Searches for books across multiple text fields.
 * @param {string} searchTerm - The text the user is looking for.
 */

import { esClient } from "./insertDataIntoElasticSearch.js";

async function searchBooks(searchTerm) {
  const indexName = 'books';

  try {
    const response = await esClient.search({
      index: indexName,
      body: {
        query: {
          multi_match: {
            query: searchTerm,
            // These fields must match your PG columns exactly
            fields: [
              'title^3',       // ^3 "boosts" the title so it's more important
              'author^2',      // ^2 makes author more important than description
              'description',
              'publisher',
              'categories',
              "published_year",
              "isbn"
            ],
            // 'AUTO' allows 1 typo for short words, 2 for long ones
            fuzziness: 'AUTO', 
            // operator: 'and'    // Ensures all words in search are present

            /* REPLACED 'operator: and' with logic below:
                "75%" means if a user types 4 words, at least 3 must match.
                This is much better for user experience than a strict "and".
            */
            minimum_should_match: "75%"
          }
        },
        // Return the top 10 most relevant results
        size: 5 
      }
    });

    // Extract the source data from the results
    const results = response.hits.hits.map(hit => ({
      id: hit._id,
      score: hit._score, // How well it matched
      ...hit._source     // The actual book data
    }));

    console.log(`Found ${results.length} matches:`);
    return results;

  } catch (err) {
    console.error('Search error:', err);
    return [];
  }
}

// Example usage:
async function runSearch() {
  const matches = await searchBooks('dark ');
  console.log(matches);
}

runSearch();