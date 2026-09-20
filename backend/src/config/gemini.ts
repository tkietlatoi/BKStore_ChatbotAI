import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';

export const getGeminiChatModel = (temperature = 0.4) => {
  return new ChatGoogleGenerativeAI({
    model: 'gemini-1.5-flash',
    apiKey: apiKey,
    temperature,
    maxRetries: 2,
  });
};

export const getGeminiEmbeddings = () => {
  return new GoogleGenerativeAIEmbeddings({
    model: 'text-embedding-004',
    apiKey: apiKey,
  });
};
