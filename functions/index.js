/*const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
*/
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();

const { onRequest } = require("firebase-functions/v2/https");
// const { GoogleGenerativeAI } = require("@google/generative-ai");
const { defineSecret } = require("firebase-functions/params");
const geminiApiKeySecret = defineSecret("GEMINI_API_KEY");

// Define environment variables using params
// const geminiApiKey = getSecret("GEMINI_API_KEY");

const { getGeminiResponse } = require('./gemini.js');

exports.generateText = onRequest(
    { secrets: [geminiApiKeySecret] },
    async (req, res) => {
    try {
        const prompt = req.body.prompt;

        if (!prompt) {
            return res.status(400).send({ error: 'Prompt is required.' });
        }

        const apiKey = await geminiApiKeySecret.value(); // access secret value
        const result = await getGeminiResponse(prompt, apiKey); // Pass apiKey

        res.status(200).send({ result: result });

    } catch (error) {
        console.error("Cloud Function Error:", error);
        res.status(500).send({ error: error.message || 'Failed to generate text.' });
    }
});

/*
exports.helloWorld = functions.https.onRequest((request, response) => {
  console.log("Hello world function started.");
  response.send("Hello from Firebase!");
});
*/