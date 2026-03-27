import { esClient } from "./elasticsearch.js";

/**
 * Deletes a single book document from the specified index.
 * @param {string} indexName - The name of the index.
 * @param {string} bookId - The Elasticsearch document _id.
 */

export const delete_book_from_elasticsearch = async (indexName, bookId) => {
  if (!indexName || !bookId) {
    throw new Error("Missing required parameters: indexName or bookId");
  }

  try {
    const response = await esClient().delete({
      index: indexName,
      id: bookId,
      // refresh: true, // Uncomment if you need the deletion to be visible in searches immediately
    });

    console.log(`Book with ID ${bookId} deleted from ${indexName}`);
    return response;
  } catch (error) {
    if (error.meta && error.meta.statusCode === 404) {
      throw new Error(`Book with ID ${bookId} not found. Nothing to delete.`);
    }
    console.error("Error deleting book:", error);
    throw error;
  }
};
