import axios from "axios";
import { v4 as uuidv4 } from "uuid";

export const preprocess_uploaded_file = async (formData) => {
  if (!formData) {
    throw new Error("Form data not found");
  }

  const pythonResponse = await axios.post(
    `${process.env.PYTHON_SERVER_URL}/preprocess`, 
    formData,
    {
      headers: {
        ...formData.getHeaders(), 
      },
    },
  );

  const processedData = pythonResponse.data;

  if (!Array.isArray(processedData)) {
    return processedData;
  }

  return processedData.map((book) => ({
    ...book,
    id: typeof book.id === "string" && book.id.trim() ? book.id.trim() : uuidv4(),
  }));
};
