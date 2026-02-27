import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const API_URL = "https://motherpanel.com/api/v2";
  const API_KEY = process.env.MOTHER_PANEL_API_KEY || "b0ef21942953387ad901b31cd523fdb8";

  // Proxy for Top Up BD API
  app.post("/api/proxy", async (req, res) => {
    try {
      const { action, ...params } = req.body;
      
      const body = new URLSearchParams();
      body.append("key", API_KEY);
      body.append("action", action);
      
      Object.entries(params).forEach(([key, value]) => {
        body.append(key, String(value));
      });

      const response = await fetch(API_URL, {
        method: "POST",
        body: body,
      });

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("API Proxy Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
