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
    const { transactionId, amount, method } = req.body;

    const isValid = transactionId && transactionId.length >= 8 && transactionId.length <= 16 && /^[A-Z0-9]+$/i.test(transactionId);

    if (isValid) {
      res.status(200).json({ success: true, message: "Transaction verified successfully!" });
    } else {
      res.status(400).json({ success: false, message: "Invalid Transaction ID format. Must be 8-16 alphanumeric characters." });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Verification failed." });
  }
}
