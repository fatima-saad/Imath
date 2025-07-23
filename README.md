# 📘 AI Math Question Generator API

This is a simple Node.js + Express API that uses OpenRouter (OpenAI-compatible) to generate math questions using GPT. It supports:
- Generating math questions by topic
- Generating similar questions from a sample
- Parsing both JSON and plain text responses

---

## 🚀 Features

- `/generate` — Generate new math questions by topic
- `/generate-similar` — Generate questions similar to a sample
- GPT fallback handling: works even when output is not valid JSON

---

## 📁 Project Structure
```
.
├── index.js                 # App entry point
├── routes/
│   └── api.js               # API route handlers
├── controllers/
│   └── questionController.js # Route controller logic
├── services/
│   └── openaiService.js     # GPT/OpenAI API call logic
├── config/
│   └── openaiClient.js      # OpenAI/OpenRouter config
├── utils/
│   └── parser.js            # Helper functions to parse GPT output
├── .env                     # Environment variables
└── package.json
```

---

## 📦 Requirements

- Node.js (v18+ recommended)
- OpenRouter API key

---

## 🛠️ Setup

1. **Clone the project**
   ```bash
   git clone https://github.com/your-username/ai-math-generator-api.git
   cd ai-math-generator-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a `.env` file**
   ```env
   OPENROUTER_API_KEY=your-api-key-here
   PORT=3000
   ```

4. **Run the server**
   ```bash
   npm start
   ```
   Server will run at: `http://localhost:3000`

---

## 📫 API Endpoints

### `GET /ping`
Check if the server is running.
```bash
curl http://localhost:3000/ping
```

### `POST /generate`
Generate math questions by topic.
```json
{
  "topic": "fractions",
  "difficulty": "medium",
  "count": 5,
  "includeExplanation": false
}
```

### `POST /generate-similar`
Generate similar questions from a sample.
```json
{
  "sample": "What is 5 + 7?",
  "difficulty": "easy",
  "count": 3,
  "includeExplanation": true
}
```

---

## 📘 Notes

- If GPT returns poorly formatted text, the app uses a fallback parser to still extract questions.
- Works with any OpenAI-compatible API, like OpenRouter.

---

## 🧪 Testing
You can test using:
- Postman / Insomnia
- `curl`
- A frontend (React, Vue, etc.)

---

## 📄 License
MIT — Use it freely, modify it, improve it.
