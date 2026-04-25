require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Model to use for Gemma 4 (Using standard OpenRouter identifier for Gemma, 
// though Gemma 4 specifically might map to Google's latest open models like gemma-7b or gemma-2-27b on OpenRouter. 
// We'll use google/gemma-7b-it as a placeholder if gemma-4 is not available, but user said 'Gemma 4', 
// we will just specify a known Gemma model for stability)
const GEMMA_MODEL = 'google/gemma-4-31b-it'; 

async function callLLM(systemPrompt, userPrompt, jsonMode = false) {
    if (!OPENROUTER_API_KEY) {
        throw new Error("Missing OPENROUTER_API_KEY environment variable");
    }

    try {
        const payload = {
            model: GEMMA_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ]
        };

        if (jsonMode) {
            payload.response_format = { type: "json_object" };
        }

        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", payload, {
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("Error calling OpenRouter API:", error.response?.data || error.message);
        throw new Error("Failed to communicate with AI provider");
    }
}

app.post('/analyze', async (req, res) => {
    try {
        const { region, population, damage, income } = req.body;

        // Calculate score (normalize population since it's now an absolute number instead of 1-10)
        const popScale = Math.min(10, Math.log10(Number(population) || 1) * 2);
        const score = (Number(damage) * 0.5) + (popScale * 0.3) - (Number(income) * 0.2);

        const prompt = `You are an AI fairness auditor. Given the following decision data:
* Region: ${region}
* Population: ${population}
* Damage Level: ${damage}
* Income Level: ${income}
* Score: ${score.toFixed(2)}

Perform the following:
1. Explain why this score was assigned
2. Detect if the decision is biased
3. Give a fairness score (0-100)
4. Suggest improvements

Return response in strict JSON format EXACTLY like this:
{
  "explanation": "string",
  "bias_detected": boolean,
  "fairness_score": number,
  "suggestion": "string"
}`;

        const aiResponseText = await callLLM(prompt, "Please analyze the data and output ONLY valid JSON.", true);
        
        let aiResult = {};
        try {
            // Remove markdown code blocks if the LLM adds them
            const cleanedText = aiResponseText.replace(/```json/g, "").replace(/```/g, "").trim();
            aiResult = JSON.parse(cleanedText);
        } catch (e) {
            console.error("Failed to parse JSON from AI:", aiResponseText);
            return res.status(500).json({ error: "AI returned invalid format", raw: aiResponseText });
        }

        res.json({
            score: score.toFixed(2),
            ...aiResult
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/fix-bias', async (req, res) => {
    try {
        const { region, population, damage, income } = req.body;

        // Re-Calculate score with reduced income weight
        const popScale = Math.min(10, Math.log10(Number(population) || 1) * 2);
        const score = (Number(damage) * 0.5) + (popScale * 0.3) - (Number(income) * 0.05);

        const prompt = `You are an AI fairness auditor. We have adjusted the decision model to reduce bias by lowering the penalty for income.
Given the new following decision data:
* Region: ${region}
* Population: ${population}
* Damage Level: ${damage}
* Income Level: ${income}
* New Adjusted Score: ${score.toFixed(2)}

Perform the following:
1. Explain why this new score is more or less fair
2. Detect if the decision is still biased
3. Give a new fairness score (0-100)
4. Suggest any further improvements

Return response in strict JSON format EXACTLY like this:
{
  "explanation": "string",
  "bias_detected": boolean,
  "fairness_score": number,
  "suggestion": "string"
}`;

        const aiResponseText = await callLLM(prompt, "Please analyze the updated data and output ONLY valid JSON.", true);
        
        let aiResult = {};
        try {
            const cleanedText = aiResponseText.replace(/```json/g, "").replace(/```/g, "").trim();
            aiResult = JSON.parse(cleanedText);
        } catch (e) {
            console.error("Failed to parse JSON from AI:", aiResponseText);
            return res.status(500).json({ error: "AI returned invalid format", raw: aiResponseText });
        }

        res.json({
            score: score.toFixed(2),
            ...aiResult
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/ask', async (req, res) => {
    try {
        const { question, context_data } = req.body;

        const systemPrompt = `You are an AI fairness auditor assistant for FairSight AI. Use the provided context about a resource allocation decision to answer the user's question directly, clearly, and concisely.
        
Context Data:
${JSON.stringify(context_data, null, 2)}`;

        const answer = await callLLM(systemPrompt, question, false);

        res.json({ answer });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`FairSight AI Server running on port ${PORT}`);
});
