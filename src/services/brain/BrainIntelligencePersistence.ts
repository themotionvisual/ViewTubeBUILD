const endpoint = (channelId: string) => `/api/brain-intelligence?channelId=${encodeURIComponent(channelId)}`

export const loadPersistedBrainIntelligence = async (channelId: string) => {
 const response = await fetch(endpoint(channelId), { credentials: "include" })
 if (response.status === 401) return null
 if (!response.ok) throw new Error(`Brain intelligence load failed (${response.status}).`)
 return response.json() as Promise<{ channelId: string; events: unknown[]; observations: unknown[] }>
}

export const persistBrainIntelligence = async (input: { channelId: string; events?: unknown[]; observations?: unknown[] }) => {
 const response = await fetch(endpoint(input.channelId), {
  method: "PUT",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ events: input.events || [], observations: input.observations || [] }),
 })
 if (response.status === 401) return null
 if (!response.ok) throw new Error(`Brain intelligence persistence failed (${response.status}).`)
 return response.json()
}
