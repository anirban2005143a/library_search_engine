import { connect_to_elastic_search, create_index, delete_index } from "../elasticsearch/elasticsearch.js";
import { uploading_queue } from "./queue.js";


// 1. Clear old BullMQ jobs
await uploading_queue.obliterate({ force: true });

console.log("BullMQ uploading_queue completely cleared");

// 2. Connect Elasticsearch
await connect_to_elastic_search();

// 3. Reset Elasticsearch index
await delete_index(process.env.INDEX_NAME);
await create_index(process.env.INDEX_NAME, true);

// 4. Start worker ONLY after Elasticsearch is ready
await import("./upload.worker.js");

console.log("Book Upload Worker Started...");