import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;
if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
}

export interface SearchPost {
  id: string;
  title: string;
  content?: string;
  [key: string]: any;
}

export interface SearchResult {
  matchedIds: string[];
  message: string;
  verseRef?: string;
  verseText?: string;
}

export const searchBlogsWithGemini = async (query: string, posts: SearchPost[]): Promise<SearchResult> => {
  if (!query.trim()) {
    return { matchedIds: posts.map(p => p.id), message: '' };
  }

  if (!genAI) {
    console.warn("Gemini API key is missing. Falling back to simple keyword search.");
    const lowerQuery = query.toLowerCase();
    const matchedIds = posts
      .filter(p => p.title.toLowerCase().includes(lowerQuery) || (p.content && p.content.toLowerCase().includes(lowerQuery)))
      .map(p => p.id);
    return { matchedIds, message: '' };
  }

  const modelsToTry = ["gemini-3.1-flash-lite", "gemini-3-flash-preview", "gemini-flash-latest", "gemini-2.5-flash", "gemma-4-26b-a4b-it"];

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: { responseMimeType: "application/json" }
      });

      // Prepare a catalog using truncated raw content
      const blogCatalog = posts.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content ? post.content.replace(/<[^>]*>?/gm, '').substring(0, 1500) : post.excerpt || ''
      }));

      const prompt = `You are an intelligent semantic search engine and an empathetic, optimistic assistant.
The user has provided the following search query: "${query}"

Below is a catalog of blog posts represented as a JSON array. Each post has an "id", "title", and "content".
Your task is to conceptually analyze the user's query and find the posts that best match their intent.

MATCHING RULES:
1. For queries about "lonely", "sad", or "isolated": Prioritize and return any posts in the catalog that discuss "love", "God's love", or "comfort". You MUST search the catalog for posts containing these themes. (Exception: DO NOT return posts about "Marriage" or romantic relationships).
2. For queries about "addiction" or "sin": Return ONLY posts that specifically discuss recovery, breaking free, or overcoming. Do not return generic "God's love" posts for addiction.
3. Be optimistic in your message. If no posts fit, return an empty array [].

You must return ONLY a JSON object with four fields:
1. "matchedIds": A JSON array containing ONLY the "id" strings of the blog posts that fit the rules above. If none fit, return [].
2. "message": A casual, friendly, optimistic, and faithful response. STRICT LIMIT: MAXIMUM 3 SENTENCES AND UNDER 40 WORDS.
3. "verseRef": A short, relevant Bible verse reference. YOU MUST ALWAYS PROVIDE A BIBLE VERSE FOR ANY SEARCH QUERY, EVEN IF NO BLOGS MATCH.
4. "verseText": The text of the bible verse. YOU MUST ALWAYS PROVIDE THIS FOR ANY SEARCH QUERY.

Blogs Catalog:
${JSON.stringify(blogCatalog)}

Example JSON Response:
\`\`\`json
{
  "matchedIds": ["id1", "id2"],
  "message": "It takes courage to seek change! I've found some wonderful posts that talk about finding grace and strength in difficult times. I hope these words bring you comfort and a new perspective.",
  "verseRef": "Isaiah 41:10",
  "verseText": "So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand."
}
\`\`\`
`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      let cleanText = text.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.substring(7);
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.substring(3);
      }
      if (cleanText.endsWith('```')) {
        cleanText = cleanText.substring(0, cleanText.length - 3);
      }
      cleanText = cleanText.trim();
      
      try {
        const parsed = JSON.parse(cleanText);
        return {
          matchedIds: Array.isArray(parsed.matchedIds) ? parsed.matchedIds.map((id: any) => String(id)) : [],
          message: parsed.message || '',
          verseRef: parsed.verseRef || '',
          verseText: parsed.verseText || ''
        };
      } catch (parseError) {
        console.error("Failed to parse Gemini response:", text, parseError);
        return { matchedIds: [], message: '', verseRef: '', verseText: '' };
      }
    } catch (error: any) {
      console.warn(`Model ${modelName} failed:`, error.message);
      lastError = error;
      if (!error.message?.includes('not found') && !error.message?.includes('supported')) {
        // We'll still continue to be safe
      }
    }
  }

  console.error("All Gemini models failed. Last error:", lastError);
  return { matchedIds: [], message: '' };
}
