const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const { message } = req.body;

  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3',
        prompt: message,
        stream: false
      })
    });

    const data = await response.json();

    res.json({ reply: data.response });

  } catch (error) {
    console.error('Ollama error:', error);
    res.status(500).json({ reply: 'Local AI error.' });
  }
});

module.exports = router;
