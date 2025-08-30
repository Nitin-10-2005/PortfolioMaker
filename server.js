const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// --- FIX STARTS HERE ---
// Explicitly serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// --- FIX ENDS HERE ---

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generic AI generation endpoint
async function handleAIGeneration(req, res, modelName) {
    const { prompt, schema } = req.body;
    if (!prompt || !schema) {
        return res.status(400).json({ error: 'Prompt and schema are required.' });
    }

    try {
        const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: schema
            }
        });

        const result = await model.generateContent(prompt);
        const response = result.response;
        res.json(JSON.parse(response.text()));
    } catch (error) {
        console.error('AI generation error:', error);
        res.status(500).json({ error: 'Failed to generate content from AI.', details: error.message });
    }
}

// API endpoint for generating portfolio content
app.post('/generate-portfolio', (req, res) => {
    handleAIGeneration(req, res, 'gemini-1.5-flash-latest');
});

// API endpoint for generating themes
app.post('/generate-theme', (req, res) => {
    handleAIGeneration(req, res, 'gemini-1.5-flash-latest');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

