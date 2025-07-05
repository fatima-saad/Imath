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

function extractJsonArrayFromGPT(raw) {
  const match = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const jsonStr = match ? match[1] : raw;

  try {
    return JSON.parse(jsonStr);
  } catch (err) {
    console.warn("⚠️ JSON.parse failed:", err.message);
    return null;
  }
}

module.exports = {
  parseQuestionsFromText,
  extractJsonArrayFromGPT,
};
