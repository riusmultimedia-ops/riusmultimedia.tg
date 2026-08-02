let users = [{ user: 'Rius', pass: 'Rius2025', role: 'admin' }];

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json(users);
  }
  if (req.method === 'POST') {
    users = req.body;
    return res.status(200).json({ ok: true });
  }
}