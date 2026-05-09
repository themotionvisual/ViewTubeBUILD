
import { SYSTEM_PROMPTS } from './intelligence';
import { consultBrain, annotateSystemPrompt } from '../../services/brain';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export async function callGemini(prompt: string, systemPrompt: string) {
  if (!API_KEY) {
    throw new Error('Gemini API Key missing. Add VITE_GEMINI_API_KEY to your .env file.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `SYSTEM: ${systemPrompt}\n\nUSER DATA: ${prompt}` }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'API Call Failed');
  }

  const data = await response.json();
  return JSON.parse(data.candidates[0].content.parts[0].text);
}

export async function generateOracleReport(data: string) {
  const packet = await consultBrain('omni-brain');
  const enrichedPrompt = annotateSystemPrompt(SYSTEM_PROMPTS.ORACLE, packet);
  return callGemini(data, enrichedPrompt);
}

export async function generateArchitectDiagnosis(context: string) {
  const packet = await consultBrain('omni-brain');
  const enrichedPrompt = annotateSystemPrompt(SYSTEM_PROMPTS.ARCHITECT, packet);
  return callGemini(context, enrichedPrompt);
}

export async function generateKeywordResearch(concept: string, niche: string) {
  const packet = await consultBrain('omni-brain');
  const enrichedPrompt = annotateSystemPrompt(SYSTEM_PROMPTS.KEYWORD, packet);
  return callGemini(`Topic: ${concept}\nNiche: ${niche}`, enrichedPrompt);
}
