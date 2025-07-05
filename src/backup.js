const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

console.log('🔑 Loaded API Key:', process.env.OPENROUTER_API_KEY);

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000", // change in prod
    "X-Title": "AI Math Generator"
  }
});

// ✅ Health check
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// 🧠 Utility: Parse plain-text fallback
function parseQuestionsFromText(raw) {
  const items = raw.split(/\n?\d+\.\s/).filter(Boolean);
  const questions = [];

  for (const item of items) {
    const parts = item.split(/Answer:\s*/i);
    const question = parts[0]?.trim();
    const answer = parts[1]?.trim() || '';
    if (question) {
      questions.push({ question, answer });
    }
  }

  return questions;
}

// 🧠 Utility: Extract JSON from GPT (remove ```json blocks)
function extractJsonArrayFromGPT(raw) {
  const match = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const jsonStr = match ? match[1] : raw;

  try {
    return JSON.parse(jsonStr);
  } catch (err) {
    console.warn("⚠️ JSON.parse failed:", err.message);
    return null; // signal fallback
  }
}

// 📘 /generate route
app.post('/generate', async (req, res) => {
  const { topic, difficulty = "medium", count = 5, includeExplanation = false } = req.body;

  if (!topic || topic.trim() === "") {
    return res.status(400).json({ error: 'Please provide a topic.' });
  }

  const allowedDifficulties = ["easy", "medium", "hard"];
  const difficultyLevel = allowedDifficulties.includes(difficulty.toLowerCase())
    ? difficulty.toLowerCase()
    : "medium";

  const numQuestions = Math.min(Math.max(parseInt(count) || 5, 1), 50);

  const formatNote = includeExplanation
    ? `Each item must have a question, the correct answer, and a step-by-step explanation in math notation.` +
      `\nReturn a raw JSON array like:\n[\n  { "question": "...", "answer": "...", "explanation": "..." }, ...\n]`
    : `Return ONLY a raw JSON array like:\n[\n  { "question": "...", "answer": "..." }, ...\n]`;

  const prompt = `
You are a helpful and professional math teacher.
Generate ${numQuestions} math questions on the topic "${topic}".
The questions must match ${difficultyLevel} difficulty.
${formatNote}
Do not include markdown or any extra text.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo-0613",
      messages: [
        { role: 'system', content: 'You are a helpful and professional math teacher.' },
        { role: 'user', content: prompt },
      ],
    });

    const raw = response.choices[0].message.content;
    console.log("📤 GPT Raw Output:", raw);

    let questions = extractJsonArrayFromGPT(raw);
    if (!questions) {
      questions = parseQuestionsFromText(raw); // fallback (without explanations)
    }

    if (!questions.length) {
      return res.status(500).json({ error: "Failed to parse GPT response" });
    }

    res.json({ questions });
  } catch (err) {
    console.error("❌ OpenAI Error:", err);
    res.status(500).json({ error: 'Failed to generate questions. Please try again.' });
  }
});

// 📗 /generate-similar route
app.post('/generate-similar', async (req, res) => {
  const { sample, difficulty = "medium", count = 5, includeExplanation = false } = req.body;

  if (!sample || sample.trim() === "") {
    return res.status(400).json({ error: 'Please provide a sample question.' });
  }

  const allowedDifficulties = ["easy", "medium", "hard"];
  const difficultyLevel = allowedDifficulties.includes(difficulty.toLowerCase())
    ? difficulty.toLowerCase()
    : "medium";

  const numQuestions = Math.min(Math.max(parseInt(count) || 5, 1), 50);

  const formatNote = includeExplanation
    ? `Each item must have a question, the correct answer, and a step-by-step explanation in math notation.` +
      `\nReturn a raw JSON array like:\n[\n  { "question": "...", "answer": "...", "explanation": "..." }, ...\n]`
    : `Return ONLY a raw JSON array like:\n[\n  { "question": "...", "answer": "..." }, ...\n]`;

  const prompt = `
You are a helpful and professional math teacher.
Generate ${numQuestions} math questions similar in type to:
"${sample}"
Each question must match ${difficultyLevel} difficulty.
${formatNote}
Do not include markdown formatting or extra text.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo-0613",
      messages: [
        { role: 'system', content: 'You are a helpful and professional math teacher.' },
        { role: 'user', content: prompt },
      ],
    });

    const raw = response.choices[0].message.content;
    console.log("📤 GPT Raw Output:", raw);

    let questions = extractJsonArrayFromGPT(raw);
    if (!questions) {
      questions = parseQuestionsFromText(raw); // fallback (without explanations)
    }

    if (!questions.length) {
      return res.status(500).json({ error: "Failed to parse GPT response" });
    }

    res.json({ questions });
  } catch (err) {
    console.error("❌ OpenAI Error:", err);
    res.status(500).json({ error: 'Failed to generate similar questions. Please try again.' });
  }
});


// ✅ Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
