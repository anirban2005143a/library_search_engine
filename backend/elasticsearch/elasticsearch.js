import { Client } from "@elastic/elasticsearch";
import { VECTOR_GAP_SYNONYMS } from "./utils.js";

let elastic_search_client = null;

export const connect_to_elastic_search = async () => {
  if (elastic_search_client) return;

  elastic_search_client = new Client({
    node: process.env.ELASTIC_SEARCH_URL,
    tls: { rejectUnauthorized: false },
    auth: {
      username: process.env.ELASTIC_SEARCH_USER,
      password: String(process.env.ELASTIC_SEARCH_PASS),
    },
  });

  // Optional: test connection
  await elastic_search_client.ping().catch((err) => {
    console.error("Elasticsearch ping failed:", err);
    throw new Error("Unable to connect to Elasticsearch");
  });

  console.log("Elasticsearch connected successfully");
};
console.log(elastic_search_client)

export const esClient = () => {
  if (!elastic_search_client) {
    throw new Error("Elasticsearch is not connected");
  }
  return elastic_search_client;
};

export const create_index = async (indexName) => {
  if (!indexName) throw new Error("Index name not provided");

  const exists = await is_index_exists(indexName);
  if (exists) {
    await delete_index(indexName);
    console.log(`Deleted index: ${indexName}`);
  }

  await esClient().indices.create({
    index: indexName,
    settings: {
      analysis: {
        filter: {
          my_synonyms: {
            type: "synonym_graph",
            synonyms: VECTOR_GAP_SYNONYMS,
          },
          my_stemmer: {
            type: "stemmer",
            name: "english",
          },
        },
        analyzer: {
          // 1. Used when storing the 68k books (No synonyms here)
          my_index_analyzer: {
            tokenizer: "standard",
            filter: ["lowercase", "my_stemmer"],
          },
          // 2. Used only when a user types in the search bar
          my_search_analyzer: {
            tokenizer: "standard",
            filter: ["lowercase", "my_synonyms", "my_stemmer"],
          },
        },
      },
    },
    mappings: {
      properties: {
        title: {
          type: "text",
          analyzer: "my_index_analyzer",
          search_analyzer: "my_search_analyzer",
        },
        author: {
          type: "text",
          fields: { keyword: { type: "keyword" } },
        },
        categories: {
          type: "text",
          fields: { keyword: { type: "keyword" } },
          analyzer: "my_index_analyzer",
          search_analyzer: "my_search_analyzer",
        },
        description: {
          type: "text",
          analyzer: "my_index_analyzer",
          search_analyzer: "my_search_analyzer",
        },
        publisher: {
          type: "text",
          fields: { keyword: { type: "keyword" } },
        },
        published_year: {
          type: "text",
          fields: { keyword: { type: "keyword" } },
        },
        isbn: {
          type: "text",
          fields: { keyword: { type: "keyword" } },
        },
        title_embedding: {
          type: "dense_vector",
          dims: 768, // ✅ BGE model = 768
          index: true,
          similarity: "cosine",
        },
        context_embedding: {
          type: "dense_vector",
          dims: 768, // same as your BGE model
          index: true,
          similarity: "cosine",
        },
        title_embedding_copy: {
          type: "float",
          index: false,
        },
        context_embedding_copy: {
          type: "float",
          index: false,
        },
      },
    },
  });
};

export const is_index_exists = async (indexName) => {
  if (!indexName) throw new Error("Index name not provided");

  const exists = await esClient().indices.exists({ index: indexName });
  return exists;
};

export const delete_index = async (indexName) => {
  if (!indexName) throw new Error("Index name not provided");

  await esClient().indices.delete({ index: indexName });
};
