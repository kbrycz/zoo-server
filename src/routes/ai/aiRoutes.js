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

router.get('/postHelp', async (req, res) => {
    const post = req.query.post;
  
    if (!post) {
      console.log("Please provide post details: " + post)
      return res.status(400).send({ error: "Please provide post details." });
    }
  
    // Attempt to parse the post object from the query
    let postDetails;
    try {
      postDetails = JSON.parse(post);
    } catch (err) {
      console.log("Invalid post details format: " + post)
      return res.status(400).send({ error: "Invalid post details format." });
    }
  
    // Construct a prompt string from the post object
    const prompt = constructPromptFromPost(postDetails);
  
    try {
      const answer = await generateContent(prompt, postHelperPrePrompt);
      res.send({ answer });
    } catch (err) {
      console.error("Error in /postHelp:", err.message);
      res.status(500).send({ error: "An error occurred while generating the answer. Please try again later." });
    }
  });

// Helper function to construct a prompt string from the post object
function constructPromptFromPost(post) {
    const { title, description, postType, date, link } = post;
    let prompt = "";
  
    if (title) prompt += `Title: ${title}\n`;
    if (description) prompt += `Description: ${description}\n`;
    if (postType) prompt += `Type: ${postType === '0' ? 'Event' : 'Internal'}\n`;
    if (date) prompt += `Date: ${date}\n`;
    if (link) prompt += `Link: ${link}\n`;
  
    // Add more details or modify the prompt structure as needed
    return prompt;
  }

module.exports = router;
