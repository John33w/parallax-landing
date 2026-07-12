import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

// Load .env
const env = fs.readFileSync(".env", "utf-8");
const apiKey = env.split("\n").find(l => l.startsWith("VITE_GEMINI_API_KEY")).split("=")[1].replace(/"/g, '').trim();

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

async function test() {
  const start = Date.now();
  const result = await model.generateContent("Extract 5 keywords/synonyms from: 'I wanna come out of addiction and know more about god'. Output JSON array of strings.");
  console.log("Time:", Date.now() - start, "ms");
  console.log(result.response.text());
}
test();
