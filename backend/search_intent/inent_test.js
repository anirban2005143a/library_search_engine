// import fs from "fs";
// import readline from "readline";
// import { getSearchIntent } from "../elasticsearch/utils.js";
// import { connect_to_elastic_search } from "../elasticsearch/elasticsearch.js";

// export const testIntentDetection = async () => {
//     await connect_to_elastic_search();
//   const fileStream = fs.createReadStream("intent_test_cases.txt");

//   const rl = readline.createInterface({
//     input: fileStream,
//     crlfDelay: Infinity,
//   });

//   let total = 0;
//   let correct = 0;

//   for await (const line of rl) {
//     if (!line || line.startsWith("#")) continue;

//     const [query, expected] = line.split("||").map(s => s.trim());

//     try {
//       const result = await getSearchIntent(query);

//       const isCorrect = result.intent === expected;
//       total++;

//       if (isCorrect) correct++;

//       console.log(`\nQuery: ${query}`);
//       console.log(`Expected: ${expected}`);
//       console.log(`Predicted: ${result.intent}`);
//       console.log(`Result: ${isCorrect ? "✅ Correct" : "❌ Wrong"}`);

//     } catch (err) {
//       console.error("Error testing query:", query, err.message);
//     }
//   }

//   console.log("\n=====================");
//   console.log(`Total: ${total}`);
//   console.log(`Correct: ${correct}`);
//   console.log(`Accuracy: ${((correct / total) * 100).toFixed(2)}%`);
// };

// testIntentDetection()