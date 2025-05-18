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
        // setting CORS headers (cross origin resource sharing)
        res.set('Access-Control-Allow-Origin', 'https://ooochicken.web.app')

        // preflight OPTIONS request (check if the request is allowed)
    if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Methods', 'POST'); // specify allowed methods
        res.set('Access-Control-Allow-Headers', 'Content-Type'); // specify allowed headers
        res.set('Access-Control-Max-Age', '3600'); // how long the preflight response can be cached (in seconds)
        return res.status(204).send(''); // Respond with no content (success)
    }

    // handle POST request
    if (req.method !== 'POST') {
        try {
            const prompt = req.body.prompt;
            
            // status code 400: bad request (client error)
            if (!prompt) {
                return res.status(400).send({ error: 'Prompt is required.' });
            }

            const apiKey = await geminiApiKeySecret.value(); // access secret value
            const result = await getGeminiResponse(prompt, apiKey); // pass apiKey to API

            // sucessful request
            res.status(200).send({ result: result });

        } catch (error) {
            // console.error("Cloud Function Error:", error);
            // status code 500: internal server error (server error)
            res.status(500).send({ error: error.message || 'Failed to generate text.' });
        }
    }
});

/*
exports.helloWorld = functions.https.onRequest((request, response) => {
  console.log("Hello world function started.");
  response.send("Hello from Firebase!");
});
*/