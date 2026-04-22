import { getActiveModel, getAiClient, executeWithRetry, cleanJsonString } from "./gemini"
import { Type } from "@google/genai"

export interface CollabPeer {
  id: string
  name: string
  handle: string
  subscriberCount: number
  thumbnail: string
  nicheMatch: number // 0-100
  collabIdea?: string
  outreachMessage?: string
}

const COLLAB_IDEA_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    peers: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          handle: { type: Type.STRING },
          subscriberCount: { type: Type.NUMBER },
          nicheMatch: { type: Type.NUMBER },
          collabIdea: { type: Type.STRING },
          outreachMessage: { type: Type.STRING },
          thumbnail: { type: Type.STRING }
        },
        required: ["id", "name", "handle", "subscriberCount", "nicheMatch", "collabIdea", "outreachMessage"]
      }
    }
  },
  required: ["peers"]
}

export const generateCollabOpportunities = async (
  myChannelName: string,
  myNiche: string,
  mySubCount: number
): Promise<CollabPeer[]> => {
  const prompt = `
    You are a YouTube Collaboration Expert. 
    User Channel: "${myChannelName}"
    Niche: "${myNiche}"
    Subscriber Count: ${mySubCount}

    TASK:
    1. Identify 6-8 REALISTIC peer channels that would be perfect for collaboration.
    2. These should be in the same niche, similar subscriber count (${mySubCount} +/- 30%), and compatible styles.
    3. For each, generate:
       - A specific, high-value collaboration video idea (e.g., "A competitive 1v1 challenge in [Topic]").
       - A professional, persuasive outreach message that explains the mutual benefits (audience growth, shared expertise).
       - A "nicheMatch" score (0-100).
    
    OUTPUT: Return a JSON array of "peers" following the provided schema. 
    Use realistic placeholders or real search-grounding if available. (Assume search grounding is enabled).
  `

  try {
    const ai = getAiClient()
    const model = getActiveModel("analysis")
    
    const result = await executeWithRetry(async () => {
      const response = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: COLLAB_IDEA_SCHEMA,
          tools: [{ googleSearch: {} }] as any
        }
      })
      
      const text = response.text
      if (!text) throw new Error("No collaboration data returned")
      const cleaned = cleanJsonString(text)
      return JSON.parse(cleaned).peers as CollabPeer[]
    })
    
    return result
  } catch (error) {
    console.error("[CollabEngine] Generation failed:", error)
    // Fallback Mock Data if AI fails or key missing
    return [
      {
        id: "mock-1",
        name: "Creator X",
        handle: "@creatorx",
        subscriberCount: mySubCount * 1.1,
        thumbnail: "https://i.pravatar.cc/150?u=mock1",
        nicheMatch: 95,
        collabIdea: "A joint deep-dive commentary on the latest industry trends.",
        outreachMessage: "Hey Creator X! I've been following your work on [Topic] and love your style. Since we share a similar audience, I think a collab video about [Topic] would be massive for both our channels. What do you think?"
      }
    ]
  }
}
