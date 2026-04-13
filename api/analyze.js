export const config = {
  maxDuration: 30,
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error:
        "Missing API key. Set GEMINI_API_KEY (recommended) or GOOGLE_API_KEY in Vercel: Project → Settings → Environment Variables (Production/Preview/Development), then redeploy.",
    });
  }

  const { imageData, mediaType } = req.body;
  if (!imageData) return res.status(400).json({ error: "No image data provided" });

  const prompt = `You are a road condition assessment expert. Analyze this road image carefully and respond ONLY with a valid JSON object — no markdown, no backticks, no extra text.

{
  "condition": "Good|Moderate|Poor|Critical",
  "score": <integer 0-100, where 100 is perfect road>,
  "surface_type": "<e.g. asphalt, concrete, gravel, dirt>",
  "distress_level": "<None|Low|Medium|High|Severe>",
  "issues": ["<detected issue 1>", "<detected issue 2>"],
  "critical_issues": ["<only truly dangerous issues, empty array if none>"],
  "summary": "<2 sentence plain-English assessment of the road condition>",
  "recommended_action": "<specific maintenance or safety recommendation>"
}

Evaluate: cracks, potholes, surface wear, lane markings, drainage, smoothness, debris, structural damage.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: mediaType || "image/jpeg",
                    data: imageData,
                  },
                },
                { text: prompt },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data.error?.message || "Gemini API error";
      return res.status(response.status).json({ error: errMsg });
    }

    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    let parsed;
    try {
      parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch {
      parsed = {
        condition: "Moderate",
        score: 50,
        surface_type: "Unknown",
        distress_level: "Medium",
        issues: ["Could not parse detailed analysis"],
        critical_issues: [],
        summary: raw.slice(0, 300),
        recommended_action: "Manual inspection recommended.",
      };
    }

    res.status(200).json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
