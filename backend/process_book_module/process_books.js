import { add_data_on_database } from "../db/db.js";
import {
  create_index,
  is_index_exists,
} from "../elasticsearch/elasticsearch.js";
import { process_uploaded_books } from "../elasticsearch/insertBooks.js";

export const ProcessBooks = async (books = []) => {
  if (!Array.isArray(books)) throw new Error("arg:books must be an array");
  if (books.length == 0) throw new Error("arg:books length can not be 0");
  if (books.length > 50)
    throw new Error("arg:books length can not be greater than 50");

  // Save to DB
  await add_data_on_database(books);
  console.log("uploading to postgresql successfully");

  // Ensure index exists
  if (!is_index_exists(INDEX_NAME)) await create_index(INDEX_NAME);

  //insert into elastic search
  await process_uploaded_books(batch);

  await new Promise((res, rej) => {
    setTimeout(() => {
      res(5);
    }, 5000);
  });

  console.log("uploading to elastic-search successfully");
};
