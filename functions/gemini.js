/*
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// function to get a response from Gemini
export async function getGeminiResponse(prompt) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
}
*/

const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.getGeminiResponse = async (prompt, apiKey) => {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get Gemini response.");
    }
};