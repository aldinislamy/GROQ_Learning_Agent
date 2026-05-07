export default async function handler(req, res) {
  // Hanya terima POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS — izinkan request dari frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const { messages, model } = req.body;

    // Validasi input
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages harus berupa array' });
    }

    // Ambil API Key dari environment variable Vercel (AMAN!)
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API Key tidak dikonfigurasi di server' });
    }

    // Kirim ke Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || 'llama-3.3-70b-versatile',
        messages,
        max_tokens: 1200,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Groq API error' });
    }

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: 'Server error: ' + error.message });
  }
}
