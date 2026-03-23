import { two_pass_hybrid_search } from "../elasticsearch/searchBook.js";
import FormData from "form-data";
import { preprocess_uploaded_file } from "./utils.js";
import { add_data_on_database } from "../db/db.js";
import { processBatch } from "../elasticsearch/insertDataIntoElasticSearch.js";

export const searchBookBySearchQuery = async (req, res) => {
  try {
    const { search_query } = req.body;
    if (!search_query) {
      return res
        .status(400)
        .json({ error: true, message: "Search query required." });
    }
    const result = await two_pass_hybrid_search("whodunnit");

    return res.status(200).json({ result, error: false });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: true, message: error.message });
  }
};

export const uploadBooks = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // 🔹 Send file to Python server
    const formData = new FormData();

    // ✅ Important: include filename
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const processedData = await preprocess_uploaded_file(formData);

    // add on database
    await add_data_on_database(processedData);

    //add on elastic search
    const batchSize = 50; // adjust as needed
    for (let i = 0; i < processedData.length; i += batchSize) {
      const batch = processedData.slice(i, i + batchSize);
      await processBatch(batch); 
    }

    return res.status(200).json({
      success: true,
      message: "all done" ,
    });

  } catch (error) {
    console.error("Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.response?.data || error.message,
    });
  }
};

export const delete_book = async (req , res)=>{
  
}
