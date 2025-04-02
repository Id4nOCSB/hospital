const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Chatbot endpoint
app.post('/api/chat', async (req, res) => {
    const { query } = req.body;

    if (!query) {
        return res.status(400).send('Query is required');
    }

    try {
        // Example: Simulate a response from OpenAI API
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a helpful assistant providing information about hospitals in Ontario.' },
                { role: 'user', content: query }
            ],
            max_tokens: 150
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer YOUR_OPENAI_API_KEY` // Replace with your OpenAI API key
            }
        });

        const botResponse = response.data.choices[0].message.content.trim();
        res.json(botResponse);
    } catch (error) {
        console.error('Error fetching chatbot response:', error.message);
        res.status(500).send('Error fetching chatbot response');
    }
});

// Function to fetch chat response
async function fetchChatResponse(query) {
    try {
        const response = await fetch('http://localhost:3000/api/chat', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching chat response:', error);
        return 'Sorry, I am having trouble connecting to the server. Please try again later.';
    }
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});