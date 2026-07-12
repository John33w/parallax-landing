import fs from "fs";

const envStr = fs.readFileSync(".env", "utf8");
const match = envStr.match(/VITE_GEMINI_API_KEY=(.*)/);
const apiKey = match ? match[1].trim() : null;

async function test() {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const json = await res.json();
  if (json.models) {
    console.log("Available models:");
    json.models.filter(m => m.supportedGenerationMethods.includes("generateContent")).forEach(m => console.log(m.name));
  } else {
    console.log(json);
  }
}
test();
