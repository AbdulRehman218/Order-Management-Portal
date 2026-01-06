export const chatWithAi = async (req, res) => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("[OpenRouter Proxy] Error: OPENROUTER_API_KEY is missing in environment variables.");
      return res.status(500).json({ message: "OPENROUTER_API_KEY not configured on server" });
    }
    
    console.log("[OpenRouter Proxy] Received request for model:", req.body?.model);
    
    const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    const model = req.body?.model || "google/gemini-2.0-flash-001";
    
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.CLIENT_URL || "http://localhost:5173", // Optional, for OpenRouter rankings
          "X-Title": "Order Management Portal" // Optional, for OpenRouter rankings
        },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
          temperature: req.body?.temperature || 0.7,
          max_tokens: req.body?.max_completion_tokens || 4096,
          top_p: req.body?.top_p || 1
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API Error: ${response.status} ${errorText}`);
      }

      if (!response.body) throw new Error("No response body from OpenRouter");

      // Pipe the stream to the response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        res.write(chunk);
      }
      res.end();

    } catch (apiError) {
      console.error("[OpenRouter Proxy] API Error:", apiError.message);
      if (!res.headersSent) {
        return res.status(502).json({ message: `OpenRouter API Error: ${apiError.message}` });
      }
      res.end(); 
    }
  } catch (e) {
    console.error("[OpenRouter Proxy] Internal Error:", e.message);
    if (!res.headersSent) {
      res.status(500).json({ message: e.message });
    }
  }
};
