const { chatCompletion } = require('../services/openaiService');
const { extractJsonArrayFromGPT, parseQuestionsFromText } = require('../utils/parser');


const allowedDifficulties = ["easy", "medium", "hard"];

function validateDifficulty(level) {
  return allowedDifficulties.includes(level.toLowerCase()) ? level.toLowerCase() : "medium";
}

function formatPrompt({ topic, sample, count, difficulty, includeExplanation, isSimilar = false }) {
  const formatNote = includeExplanation
    ? `Each item must have a question, the correct answer, and a step-by-step explanation in math notation.
Return a raw JSON array like:
[
  { "question": "...", "answer": "...", "explanation": "..." }, ...
]`
    : `Return ONLY a raw JSON array like:
[
  { "question": "...", "answer": "..." }, ...
]`;

  const base = `You are a helpful and professional math teacher.
Generate ${count} math questions ${isSimilar ? `similar in type to:\n"${sample}"` : `on the topic "${topic}"`}.\nEach question must match ${difficulty} difficulty.
${formatNote}
Do not include markdown or any extra text.`;

  return base;
}

async function generateQuestions(req, res) {
  const { topic, difficulty = "medium", count = 5, includeExplanation = false } = req.body;
  if (!topic || topic.trim() === "") return res.status(400).json({ error: 'Please provide a topic.' });

  const level = validateDifficulty(difficulty);
  const safeCount = Math.min(Math.max(parseInt(count) || 5, 1), 50);

  const prompt = formatPrompt({ topic, count: safeCount, difficulty: level, includeExplanation });

  try {
    const raw = await chatCompletion(prompt);
    let questions = extractJsonArrayFromGPT(raw) || parseQuestionsFromText(raw);

    if (!questions.length) return res.status(500).json({ error: "Failed to parse GPT response" });

    res.json({ questions });
  } catch (err) {
    console.error("❌ Error generating questions:", err);
    res.status(500).json({ error: 'Failed to generate questions.' });
  }
}

async function generateSimilarQuestions(req, res) {
  const { sample, difficulty = "medium", count = 5, includeExplanation = false } = req.body;
  if (!sample || sample.trim() === "") return res.status(400).json({ error: 'Please provide a sample question.' });

  const level = validateDifficulty(difficulty);
  const safeCount = Math.min(Math.max(parseInt(count) || 5, 1), 50);

  const prompt = formatPrompt({ sample, count: safeCount, difficulty: level, includeExplanation, isSimilar: true });

  try {
    const raw = await chatCompletion(prompt);
    let questions = extractJsonArrayFromGPT(raw) || parseQuestionsFromText(raw);

    if (!questions.length) return res.status(500).json({ error: "Failed to parse GPT response" });

    res.json({ questions });
  } catch (err) {
    console.error("❌ Error generating similar questions:", err);
    res.status(500).json({ error: 'Failed to generate similar questions.' });
  }
}

module.exports = { generateQuestions, generateSimilarQuestions };
