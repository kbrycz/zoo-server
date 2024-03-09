const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_KEY);

// Function to read the pre-prompt from the file
function readPrePrompt() {
    const filePath = path.join(__dirname, 'zooPrePrompt.txt');
    return fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
}

const prePrompt = readPrePrompt();

async function generateContent(question) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const fullPrompt = `${prePrompt} Question: ${question}`;
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    return response.text(); // Adjust based on actual method to get text
  } catch (err) {
    console.error("Error in generateContent:", err);
    throw err;
  }
}

router.get('/ask', async (req, res) => {
    const question = req.query.question;
    if (!question) {
        return res.status(400).send({ error: "Please provide a question." });
    }

    try {
        const answer = await generateContent(question);
        res.send({ answer });
    } catch (err) {
        console.error("Error in /ask:", err.message);
        res.status(500).send({ error: "An error occurred while generating the answer. Please try again later." });
    }
});

module.exports = router;
