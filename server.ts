import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Lazy-loaded GenAI Client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: AI Diagnostics/Observations Action Evaluator
  app.post("/api/ai/suggest", async (req, res) => {
    try {
      const { hiveName, breed, healthScore, status, temp, humidity, observations } = req.body;
      const ai = getGenAI();

      if (!ai) {
        // Fallback mock recommendations if API key is not configured or is the default pattern
        const offlineAdvice = `[Demo Mode Notice: GEMINI_API_KEY is not set in Secrets. Showing expert local recommendations.]

Beekeeping Advisory:
1. Since the status of Hive "${hiveName || "Alpha"}" is marked "${status || "Under Observation"}" with a health score of ${healthScore || 75}%, perform a gentle frame-by-frame colony count.
2. Given the local telemetry (Temperature: ${temp || 34}°C, Humidity: ${humidity || 55}%), ensure the entrance reducer is set to optimize ventilation and check for signs of varroa mites immediately.
3. Beekeepers should monitor honey stores. If water supply is scarce, place a shallow water feeder with floating stones near the hive entrance.`;
        return res.json({ advice: offlineAdvice });
      }

      const prompt = `You are a Master Beekeeping Veterinarian and Apiary Operations Expert. 
Evaluate this hive status and write a brief, highly actionable 3-4 bullet plan with specific treatment and hive diagnostics recommendations.

Hive details:
- Name: ${hiveName}
- Variety/Breed of bees: ${breed}
- Current Health Score: ${healthScore}/100
- Operational Status: ${status}
- Telemetry: Temperature: ${temp}°C, Humidity: ${humidity}%
- Beekeeper's Observations: ${observations || "No observations written yet."}

Response requirements:
- Be encouraging, practical, and highly scientific.
- Provide temperature and humidity-appropriate advice for beekeepers.
- Mention specific apiary steps (e.g. hive ventilation check, swarm control, honey store checks, or disease screening) matching the hive state.
- Keep the length around 150-200 words.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({ advice: response.text || "No recommendations generated." });
    } catch (err: any) {
      console.error("AI suggest error:", err);
      res.status(500).json({ error: "Failed to generate tips", details: err.message });
    }
  });

  // API Route: Beekeeping General chat
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { messages } = req.body; // array of { sender: 'user'|'assistant', text: string }
      const ai = getGenAI();

      if (!ai) {
        const lastMessage = messages[messages.length - 1]?.text?.toLowerCase() || "";
        let reply = "Hello! I am your Honey Bee Advisor. It looks like you haven't configured a GEMINI_API_KEY in the Secrets panel yet, so I am running in Demo Mode.\n\nAsk me anything about honey, swarm prevention, queen breeding, or hive temperature management!";
        if (lastMessage.includes("honey") || lastMessage.includes("harvest")) {
          reply = "In local demo mode: Honey is usually harvested when at least 80% of the comb frame is capped with wax. The moisture content should be below 18.6% to prevent fermentation. Which honey blend is your favorite? Clover and Wildflower are incredible entry blends!";
        } else if (lastMessage.includes("queen") || lastMessage.includes("swarm")) {
          reply = "In local demo mode: Swarming is the natural replication of honey bee colonies. To prevent it, ensure your colonies have ample brood space (add a super comb), inspect for queen cells weekly in spring, or perform an artificial split if double queens are emerging.";
        }
        return res.json({ reply });
      }

      // Convert messages to GenAI format or standard instruction chat
      const formattedContents = messages.map((m: any) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction: "You are 'Barnaby', an expert master beekeeper and apiary manager with 40 years of commercial apiculture experience. You love bees, organic golden honey, and helping farmers maximize beehive output while maintaining the highest queen and bees livestock health standard. Keep responses warm, professional, authentic, and packed with practical apiary-vibe tips. Use bullet points occasionally for clarity."
        }
      });

      res.json({ reply: response.text || "Could not generate reply." });
    } catch (err: any) {
      console.error("AI chat error:", err);
      res.status(500).json({ error: "Failed to get response", details: err.message });
    }
  });

  // Serve static assets in development & production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
