const openai = require('../config/openaiClient');

async function chatCompletion(prompt) {
  const response = await openai.chat.completions.create({
    model: "openai/gpt-3.5-turbo-0613",
    messages: [
      { role: 'system', content: 'You are a helpful and professional math teacher.' },
      { role: 'user', content: prompt }
    ],
  });

  return response.choices[0].message.content;
}

module.exports = { chatCompletion };
