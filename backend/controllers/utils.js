import axios from "axios";
import { z } from "zod";

export const preprocess_uploaded_file = async (formData) => {
  if (!formData) {
    throw new Error("Form data not found");
  }

  const pythonResponse = await axios.post(
    `${process.env.PYTHON_SERVER_URL}/preprocess`, // your Python API
    formData,
    {
      headers: {
        ...formData.getHeaders(), // 🔥 VERY IMPORTANT
      },
    },
  );

  const processedData = pythonResponse.data;

  if (!Array.isArray(processedData)) {
    return res.status(500).json({
      message: "Invalid response from preprocessing service",
    });
  }

  return processedData;
};
