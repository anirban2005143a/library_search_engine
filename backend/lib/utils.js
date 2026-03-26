import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

/**
 * Call FastAPI for embeddings
 */
export const getBatchEmbeddings = async (sentences) => {
  // Validate input
  if (
    !Array.isArray(sentences) ||
    !sentences.every((s) => typeof s === "string")
  ) {
    return null;
  }
  try {
    const response = await axios.post(
      `${process.env.PYTHON_SERVER_URL}/embedding`,
      { sentences },
    );

    const data = await response.data;
    return data.embeddings;
  } catch (error) {
    console.log("Error while embedding", error);
    throw error;
  }
};
