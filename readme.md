# 📚 Library Search Engine: Hybrid Semantic Search

A high-performance search system built with **Node.js**, **Elasticsearch**, and **PostgreSQL**. This project migrates 68,000 book records into a hybrid search index that combines traditional keyword matching (BM25) with modern vector-based semantic understanding.

## 🚀 What We Accomplished
* **Massive Data Migration:** Streamed 68,000 rows from PostgreSQL to Elasticsearch without memory overflows using `pg-query-stream`.
* **Custom NLP Pipeline:** Built a specialized analyzer with **Stemming** (to handle word variations like "running" vs "run") and **Synonym Graphs** (to bridge the "vocabulary gap").
* **Semantic Integration:** Integrated a **FastAPI-based Embedding Service** (BGE model) to generate 768-dimensional vectors for every book.
* **Two-Pass Hybrid Search:** Developed a sophisticated search pipeline that uses **Reciprocal Rank Fusion (RRF)** to merge results from three different retrieval methods.

---

## 🛠️ Technical Architecture

### 1. Data Processing & Mapping
The index is configured with a dual-analyzer strategy:
* **Index Analyzer:** Used during migration to lowercase and stem text for efficient storage.
* **Search Analyzer:** Used during user queries to inject **Synonyms** (e.g., if a user searches for "whodunnit," it knows to look for "mystery").

### 2. The Search Pipeline (The "Two-Pass" Method)
Instead of a simple match, the `searchBook.js` logic follows this flow:
1.  **Vectorization:** Converts user text into a vector via the Embedding API.
2.  **Anchor Retrieval (Seed):** Finds the single most relevant "anchor" book using a combined KNN and Multi-match query.
3.  **Parallel Retrieval:** Simultaneously runs three searches:
    * **BM25:** Text-based keyword matching.
    * **Query-to-Doc:** Finding books similar to the search query.
    * **Doc-to-Doc:** Finding books similar to the "anchor" book found in step 2.
4.  **RRF Merging:** Merges results based on their rank position to solve the "score gap" problem between vectors and text.

---

## ⚠️ Challenges & Solutions

### 1. The SSL Handshake Error
* **Issue:** Node.js rejected the connection to Elasticsearch because of self-signed certificates used by default in ES v8+.
* **Solution:** Configured the `esClient` with `tls: { rejectUnauthorized: false }` for local development and ensured the `String()` constructor was used for the password to handle special characters like `@`.

### 2. The "Score Gap" Problem
* **Issue:** Vector similarity scores (0.0 to 1.0) and BM25 text scores (0.0 to 100+) cannot be added together—the text score always wins, drowning out the semantic meaning.
* **Solution:** We implemented **Reciprocal Rank Fusion (RRF)**. We ignore the raw scores and instead assign points based on a document's **position** in the results list.

### 3. Migration Latency (Embedding Bottleneck)
* **Issue:** Generating embeddings for 68,000 books one-by-one was too slow.
* **Solution:** Implemented **Batching** in `processBatch`. We collect 50 books at a time, send them to the FastAPI server in a single request, and use Elasticsearch's `bulk` API for high-speed insertion.

### 4. The "Operator" Dilemma
* **Issue:** Using a strict `AND` operator for multi-word searches (like "Harry Potter 1982") resulted in zero hits if a single word was missing.
* **Solution:** Switched to `minimum_should_match: "75%"`. This keeps the search accurate while allowing for a "forgiving" experience if the user adds extra descriptive words.

---

## ⚙️ Setup & Environment Variables
Create a `.env` file in the root directory with the following:

```env
ELASTIC_SEARCH_URL=https://localhost:9200
ELASTIC_SEARCH_USER=elastic
ELASTIC_SEARCH_PASS=your_password
PG_USER=postgres
PG_PASSWORD=your_password
PG_DATABASE=library_db
PG_HOST=localhost
PG_PORT=5432
INDEX_NAME=books
EMBEDDING_URL=http://localhost:8000
```

## 📈 Next Steps

- **Partial matching:** 
- **Field Filtering:** Add logic to filter by `published_year` or `categories` without affecting the semantic score.  
- **Pagination:** Implement `from` and `size` parameters for the frontend.  
- **Auto-Detection:** Use Regex to detect years in the search string and automatically apply them as filters.


todo -
1. Partial matching - done
2. simillarity search on filters - needs clarification / done
3. how to delete book ? - by file upload , /done
4. check weather elastic search do lowercassing if not mention any analyzer /done (if not emntioned it does by default for text fields , not keyword fields) / done
5. create filter api - /done
6. create delete api
7. for upload and delete book ... allow multiple file
8. create function for initial books fetching from database and store at elastic search
9. need to check/test every api
10. we need to recreate our index with new configuration . right now data comes from previous configuration
11. The "Strict" Mode Threshold
        In your search_with_expert_ranking function, you have this logic:

        JavaScript
        if (results.length === 0 || results[0]._score < 0.05) {
        // Try Relaxed Search
        }
        For "Cleo Coyle", because it is an exact author match, the BM25 score is likely high (e.g., 0.08).

        Because 0.08 > 0.05, your code thinks the search was a "Success."

        It skips the Relaxation mode.

        It sends only that one book to the Reranker.

        The Fix: Even if you find the exact book, you want the "neighbors" to fill the list. You should check results.length < 10 as well as the score.

        ```
            if (results.length < 10 || results[0]._score < 0.05) {
                console.log("Not enough results or low quality. Relaxing...");
                const relaxedResults = await two_pass_hybrid_search(queryText, true);
                
                // Merge them so we don't lose the exact match we already found
                const combined = [...results, ...relaxedResults];
                // Remove duplicates and keep top 15 for the reranker
                results = Array.from(new Map(combined.map(item => [item._id, item])).values()).slice(0, 15);
            }
        ```

12. move create index function to app.js 
13. change cross encoder model
14. i think that we have messedup with RRF and cross encoder score

extend - 
1. add in preprocessing to fetch published_year from other field
2. increase the no of fields 
3. add advance preprocessing when upload a file

apis - 
1. books - 
    1. /upload - excel file
    2. /delete - file or array of books
    3. /seach - query text
    4. /filter - query object


issue-
1. i found that for saerch query - Cleo Coyle , the books found with a very low scrore ... i think there is a issue with scoring


query- 
1. how root admin register ? student can also register as root admin