import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { MOTHER_PANEL_CONFIG } from "./motherpanel.config";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Proxy for Top Up BD API
  app.post("/api/proxy", async (req, res) => {
    try {
      const { action, ...params } = req.body;
      
      const body = new URLSearchParams();
      body.append("key", MOTHER_PANEL_CONFIG.API_KEY);
      body.append("action", action);
      
      Object.entries(params).forEach(([key, value]) => {
        body.append(key, String(value));
      });

      const response = await fetch(MOTHER_PANEL_CONFIG.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: body.toString(),
      });

      const text = await response.text();
      try {
        const data = JSON.parse(text);
        res.json(data);
      } catch (e) {
        console.error("Failed to parse MotherPanel response:", text);
        res.status(500).json({ error: "Invalid response from provider API" });
      }
    } catch (error) {
      console.error("API Proxy Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Payment Verification Endpoint
  app.post("/api/verify-transaction", async (req, res) => {
    try {
      const { transactionId, amount, method } = req.body;

      // IMPORTANT: Here you should call your real Payment Gateway API (e.g., Shurjopay, SSLCommerz, or custom Nagad/bKash API)
      // For now, we will simulate a successful verification if the ID is between 8 and 12 characters.
      // In a real app, you would verify if this transactionId actually exists and matches the amount.
      
      const isValid = transactionId && transactionId.length >= 8 && transactionId.length <= 16 && /^[A-Z0-9]+$/i.test(transactionId);

      if (isValid) {
        res.json({ success: true, message: "Transaction verified successfully!" });
      } else {
        res.status(400).json({ success: false, message: "Invalid Transaction ID format. Must be 8-16 alphanumeric characters." });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: "Verification failed." });
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
