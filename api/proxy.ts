import { MOTHER_PANEL_CONFIG } from '../motherpanel.config';

export default async function handler(req: any, res: any) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
      res.status(200).json(data);
    } catch (e) {
      console.error("Failed to parse MotherPanel response:", text);
      res.status(500).json({ error: "Invalid response from provider API" });
    }
  } catch (error) {
    console.error("API Proxy Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
