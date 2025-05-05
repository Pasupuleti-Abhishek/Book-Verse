const express = require('express');
const axios = require('axios');
const cors = require('cors'); // To handle CORS for frontend-backend communication

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // Enable CORS for the frontend
app.use(express.json()); // Middleware to parse JSON bodies

// Route to handle OpenAI API call
app.post('/api/openai', async (req, res) => {
  const { query } = req.body;

  try {
    // Send request to OpenAI API for summary generation
    const response = await axios.post('https://api.openai.com/v1/completions', {
      model: 'text-davinci-003',
      prompt: `Provide a summary for the book titled "${query}".`,
      max_tokens: 200
    }, {
      headers: {
        'Authorization': `Bearer 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`  // Replace with your actual OpenAI API key
      }
    });

    // Send the summary back to the frontend
    res.json({ summary: response.data.choices[0].text.trim() });
  } catch (error) {
    console.error('Error with OpenAI request:', error);
    res.status(500).send('Error retrieving OpenAI summary');
  }
});

// Fetch books using Google Books API (for book search functionality)
app.get('/api/books', async (req, res) => {
  const { query } = req.query;
  try {
    // Fetch book data from Google Books API
    const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${query}`);
    res.json(response.data.items);
  } catch (error) {
    res.status(500).send('Error retrieving book data.');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
