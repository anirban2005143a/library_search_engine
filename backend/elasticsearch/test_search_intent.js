import fs from "fs";
import path from "path";
import readline from "readline";
import { getSearchIntent } from "./utils.js";
import { connect_to_elastic_search } from "./elasticsearch.js";

export const testSearchIntent = async (filePath) => {
  await connect_to_elastic_search();

  const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity,
  });

  let total = 0;
  let correct = 0;
  let wrongCases = [];

  for await (const line of rl) {
    if (!line.trim()) continue;

    const [query, expected] = line.split("||").map((s) => s.trim());

    const predicted = await getSearchIntent(query);

    const isCorrect = predicted.intent === expected;

    console.log(`\nQuery: ${query}`);
    console.log(`Expected: ${expected}`);
    console.log(`Predicted: ${predicted.intent}`);
    console.log(`Result: ${isCorrect ? "✅" : "❌"}`);

    if (isCorrect) {
      correct++;
    } else {
      wrongCases.push({ query, expected, predicted: predicted.intent });
    }

    total++;
  }

  console.log("\n=========================");
  console.log(`Accuracy: ${((correct / total) * 100).toFixed(2)}%`);
  console.log(`Correct: ${correct}/${total}`);

  console.log("\n❌ Wrong Predictions:");
  console.table(wrongCases);
};

const textFilePath = path.join(
  "D:",
  "projects",
  "library search engine",
  "backend",
  "elasticsearch",
  "intent_test_cases.txt",
);
testSearchIntent(textFilePath);
