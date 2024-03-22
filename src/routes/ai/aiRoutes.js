const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');
const requireAuth = require('../../middlewares/requireAuth')

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_KEY);

const TORTOISE_FILEPATH = path.join(__dirname, 'zooPrePrompt.txt');
const POST_HELPER_FILEPATH = path.join(__dirname, 'postHelperPrePrompt.txt');
const HELP_SCREEN_FILEPATH = path.join(__dirname, 'helper.txt');


// Function to read the pre-prompt from the file
function readPrePrompt(filePath) {
    return fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
}

const tortoisePrePrompt = readPrePrompt(TORTOISE_FILEPATH);
const postHelperPrePrompt = readPrePrompt(POST_HELPER_FILEPATH);
const helpScreenPrePrompt = readPrePrompt(HELP_SCREEN_FILEPATH);

async function generateContent(question, prePrompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const fullPrompt = `${prePrompt} Question: ${question}`;
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    return response.text();
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
        const answer = await generateContent(question, tortoisePrePrompt);
        res.send({ answer });
    } catch (err) {
        console.error("Error in /ask:", err.message);
        res.status(500).send({ error: "An error occurred while generating the answer. Please try again later." });
    }
});

router.get('/postHelp', async (req, res) => {
  const question = req.query.question;
  if (!question) {
      return res.status(400).send({ error: "Please provide a question." });
  }

  try {
      const answer = await generateContent(question, postHelperPrePrompt);
      res.send({ answer });
  } catch (err) {
      console.error("Error in /ask:", err.message);
      res.status(500).send({ error: "An error occurred while generating the answer. Please try again later." });
  }
});

router.get('/getHelp', async (req, res) => {
  const question = req.query.question;
  if (!question) {
      return res.status(400).send({ error: "Please provide a question." });
  }

  try {
      const answer = await generateContent(question, helpScreenPrePrompt);
      res.send({ answer });
  } catch (err) {
      console.error("Error in /ask:", err.message);
      res.status(500).send({ error: "An error occurred while generating the answer. Please try again later." });
  }
});

module.exports = router;
