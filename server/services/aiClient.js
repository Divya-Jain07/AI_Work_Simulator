import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

export const GROQ_BASE_URL = process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1';
export const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

const groqApiKey = process.env.GROQ_API_KEY?.trim();

const client = new OpenAI({
  apiKey: groqApiKey || 'missing_groq_api_key',
  baseURL: GROQ_BASE_URL
});

export const logAIError = (error) => {
  console.error(error.response?.data || error.message);
};

export const assertGroqConfigured = () => {
  if (!groqApiKey) {
    const error = new Error('GROQ_API_KEY is missing from server/.env');
    error.statusCode = 503;
    throw error;
  }
};

export const extractChatText = (completion) => {
  const content = completion?.choices?.[0]?.message?.content;

  if (typeof content === 'string' && content.trim()) {
    return content.trim();
  }

  if (Array.isArray(content)) {
    const text = content
      .map((part) => part?.text || part?.content)
      .filter(Boolean)
      .join('\n')
      .trim();

    if (text) {
      return text;
    }
  }

  throw new Error('Groq returned an empty response');
};

export const retryAIRequest = async (fn, retries = 2, delay = 600) => {
  try {
    return await fn();
  } catch (error) {
    logAIError(error);

    if (retries <= 0) {
      throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryAIRequest(fn, retries - 1, delay * 2);
  }
};

export const createChatCompletion = async ({
  messages,
  model = GROQ_MODEL,
  temperature = 0.65,
  maxTokens = 700,
  retries = 2
}) => {
  assertGroqConfigured();

  const completion = await retryAIRequest(() => client.chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens: maxTokens
  }), retries);

  return extractChatText(completion);
};

export default client;
