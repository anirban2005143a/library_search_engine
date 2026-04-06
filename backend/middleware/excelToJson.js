import multer from "multer";
import * as XLSX from "xlsx";

// Setup multer to store file in memory temporarily
const storage = multer.memoryStorage();
export const upload = multer({ storage });

import { EXCEL_COLUMN_MAP } from "../consts/excel_column_map.js";


/*
excelToJsonMiddleware checks 
if req.file has content -> file was uploaded -> make an array -> set to req.body
else if req.body already came with something -> check if it has an object or array -> make an array -> set to req.body
*/

export const excelToJsonMiddleware = (req, res, next) => {
  // Scenario A: User uploaded an Excel File
  if (req.file) {
    try {
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json(sheet);

      // Normalize the keys (to handle the case where 
      // user sends the excel file with a column First name but we need the firstName)
      const normalizedData = rawData.map((row) => {
        const newRow = {};
        for (const key in row) {
          // Look up if the Excel header has a mapped DB key
          const targetKey = EXCEL_COLUMN_MAP[key] || key; 
          newRow[targetKey] = row[key];
        }
        return newRow;
      });

      // overwrite req.body with the array of objects
      req.body = normalizedData;
      return next();
    } catch (error) {
      return res.status(400).json({ message: "Invalid Excel format" });
    }
  }

  // Scenario B: User sent JSON from the "Add Multiple Users" form
  // We check if req.body is already an array or object
  if (req.body && (Array.isArray(req.body) || typeof req.body === 'object')) {
    // If they sent a single object by mistake, wrap it in an array to stay consistent
    if (!Array.isArray(req.body)) {
      req.body = [req.body];
    }
    return next();
  }

  return res.status(400).json({ message: "No user data or file provided" });
};