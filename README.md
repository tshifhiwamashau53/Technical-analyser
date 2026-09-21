# Technical-analyser

This repo is a browser-based chart-image analysis app with an optional OpenAI-powered API.

What it contains:
- `index.html` – UI for uploading a chart image
- `styles.css` – styling for the app
- `app.js` – client-side rendering and chart analysis
- `server.js` – Express API that calls OpenAI Vision/analysis models
- `package.json` – Node dependencies and scripts

How to run locally:
1. Install dependencies:
   npm install
2. Create a `.env` file from `.env.example` and add your OpenAI key:
   OPENAI_API_KEY=your_api_key_here
3. Start the app:
   npm start
4. Open http://localhost:3000 in your browser

API endpoints:
- GET /api/health
- GET /api/config
- POST /api/analyze

The `/api/analyze` endpoint accepts a JSON body like:
{
  "imageData": "data:image/png;base64,...",
  "prompt": "Analyze this chart image and return structured JSON."
}

The front-end will automatically call the API when available, and falls back to its built-in local analysis if the API is unavailable.
