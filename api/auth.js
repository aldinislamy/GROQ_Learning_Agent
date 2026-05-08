export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

  try {
    const { action, email, password } = req.body;

    let endpoint = '';
    if (action === 'signup') endpoint = `${SUPABASE_URL}/auth/v1/signup`;
    else if (action === 'login') endpoint = `${SUPABASE_URL}/auth/v1/token?grant_type=password`;
    else return res.status(400).json({ error: 'Action tidak valid' });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(400).json({ error: data.error_description || data.msg || 'Auth gagal' });
    }

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: 'Server error: ' + error.message });
  }
}
