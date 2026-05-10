import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key found in .env");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // Note: The SDK doesn't have a direct listModels method on genAI, 
    // it's usually on the model or requires a direct fetch.
    // Let's try to fetch from the API directly.
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    if (data.models) {
      const geminiModels = data.models
        .filter((m: any) => m.name.toLowerCase().includes('gemini'))
        .map((m: any) => m.name);
      console.log("Available Gemini Models:", geminiModels);
    } else {
      console.log("No models found or error in response:", data);
    }
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
