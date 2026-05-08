export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

  // Ambil token dari header
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': authHeader,
    'Prefer': 'return=representation'
  };

  try {
    const { table, action, data, filter, id } = req.body || req.query;

    // Helper: query Supabase REST API
    async function supabase(method, path, body) {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
        method, headers,
        body: body ? JSON.stringify(body) : undefined
      });
      const d = await r.json();
      if (!r.ok) throw new Error(JSON.stringify(d));
      return d;
    }

    // GET — ambil data
    if (req.method === 'GET') {
      const { table, filter } = req.query;
      const query = filter ? `${table}?${filter}&order=created_at.asc` : `${table}?order=created_at.asc`;
      const data = await supabase('GET', query);
      return res.status(200).json(data);
    }

    // POST — insert data
    if (req.method === 'POST') {
      const { table, data } = req.body;
      const result = await supabase('POST', table, data);
      return res.status(200).json(result);
    }

    // PUT — update data
    if (req.method === 'PUT') {
      const { table, data, filter } = req.body;
      const result = await supabase('PATCH', `${table}?${filter}`, data);
      return res.status(200).json(result);
    }

    // DELETE — hapus data
    if (req.method === 'DELETE') {
      const { table, filter } = req.body;
      await supabase('DELETE', `${table}?${filter}`);
      return res.status(200).json({ success: true });
    }

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
