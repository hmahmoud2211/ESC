const express = require('express');
const axios = require('axios');
const fs = require('fs');
const router = express.Router();

// Get Groq API key from environment variable
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Add your product info here
const productInfo = `
ESC Fit Club Products:
- ESC T-shirt: 100% cotton, available in S/M/L/XL, price $25
- ESC Water Bottle: 750ml, BPA-free, price $15
- ESC Gym Bag: Large, waterproof, price $40
`;

// Test endpoint to verify backend connectivity
router.get('/test', (req, res) => {
    console.log('GET /api/chatbot/test called');
    res.json({ response: 'Chatbot backend is working!' });
});

router.post('/', async (req, res) => {
    console.log('POST /api/chatbot called');
    const userMessage = req.body.message;
    if (!userMessage) {
        console.log('No message provided');
        return res.status(400).json({ error: 'No message provided' });
    }
    
    // Check if API key is configured
    if (!GROQ_API_KEY) {
        console.error('GROQ_API_KEY is not configured');
        return res.status(500).json({ 
            response: "Sorry, the chatbot service is not configured. Please contact the administrator." 
        });
    }
    
    try {
        console.log('Sending request to Groq API...');
        const groqRes = await axios.post(
            GROQ_API_URL,
            {
                model: 'llama3-8b-8192',
                messages: [
                    {
                        role: 'system',
                        content: `You are an assistant for the ESC Fit Club website. Only answer questions about this website and its products. Here is information about the products:\n${productInfo}\nIf you do not know the answer or it is not related to ESC Fit Club, say: \"Sorry, I can only answer questions about ESC Fit Club and its products.\"`
                    },
                    { role: 'user', content: userMessage }
                ],
                temperature: 1,
                max_tokens: 1024,
                top_p: 1,
                stream: false
            },
            {
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        const botMessage = groqRes.data.choices[0].message.content;
        console.log('Groq API success:', botMessage);
        res.json({ response: botMessage });
    } catch (error) {
        // Log error to file for debugging
        const errorLog = `[${new Date().toISOString()}] Groq API error: ${error.response ? JSON.stringify(error.response.data) : error.message}\n`;
        try {
            fs.appendFileSync('groq_error.log', errorLog);
        } catch (fileErr) {
            console.error('Failed to write to groq_error.log:', fileErr);
        }
        console.error('Groq API error:', error.response ? error.response.data : error.message);
        res.status(500).json({ response: "Sorry, I'm having trouble connecting to the AI service right now. Please try again later.", details: error.response ? error.response.data : error.message });
    }
});

module.exports = router; 