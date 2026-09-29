import axios from "axios";
import { z } from "zod";

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

  return processedData;
};
