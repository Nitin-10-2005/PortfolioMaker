// A simple Node.js server using Express to handle API requests and serve static files.

const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies and serve static files from the 'public' directory
app.use(express.json());
app.use(express.static('public'));

// Secure endpoint to handle AI portfolio generation
app.post('/generate-portfolio', async (req, res) => {
    const { prompt, schema } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: "API key not configured on the server." });
    }
    if (!prompt || !schema) {
        return res.status(400).json({ error: "Prompt and schema are required." });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema
        }
    };

    try {
        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!apiResponse.ok) {
            const errorBody = await apiResponse.json();
            console.error('API Error:', errorBody);
            throw new Error(`API request failed: ${errorBody.error.message}`);
        }

        const result = await apiResponse.json();
        res.json(result);

    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Secure endpoint to handle AI theme generation
app.post('/generate-theme', async (req, res) => {
    const { prompt, schema } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

     if (!apiKey) {
        return res.status(500).json({ error: "API key not configured on the server." });
    }
    if (!prompt || !schema) {
        return res.status(400).json({ error: "Prompt and schema are required." });
    }
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema
        }
    };

    try {
        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!apiResponse.ok) {
            const errorBody = await apiResponse.json();
             console.error('API Error:', errorBody);
            throw new Error(`API request failed: ${errorBody.error.message}`);
        }
        
        const result = await apiResponse.json();
        res.json(result);

    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: error.message });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
