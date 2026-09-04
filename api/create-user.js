export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Methode non autorisee' });
  }

  const authHeader = req.headers.authorization || '';
  const callerToken = authHeader.replace('Bearer ', '').trim();
  if (!callerToken) {
    return res.status(401).json({ error: 'Non authentifie' });
  }

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_KEY;
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Configuration serveur manquante (verifie les variables d\'environnement Vercel)' });
  }

  try {
    // 1) Verifier que le jeton envoye correspond a un vrai utilisateur connecte
    const whoRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${callerToken}` }
    });
    if (!whoRes.ok) return res.status(401).json({ error: 'Session invalide, reconnecte-toi' });
    const callerUser = await whoRes.json();

    // 2) Verifier que cet utilisateur est bien "director" (verification cote serveur, via service_role, impossible a truquer depuis le navigateur)
    const roleRes = await fetch(`${SUPABASE_URL}/rest/v1/admin_profiles?id=eq.${callerUser.id}&select=role`, {
      headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` }
    });
    const roleData = await roleRes.json();
    const callerRole = roleData?.[0]?.role;
    if (callerRole !== 'director') {
      return res.status(403).json({ error: 'Seul le directeur peut ajouter des utilisateurs' });
    }

    // 3) Valider la demande
    const { email, password, role } = req.body || {};
    const allowedRoles = ['journaliste', 'redacteur_chef', 'technicien', 'chef_programme', 'director'];
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, mot de passe et role sont obligatoires' });
    }
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'Role invalide' });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ error: 'Le mot de passe doit faire au moins 8 caracteres' });
    }

    // 4) Creer le compte via l'API Admin Supabase (necessite la cle service_role)
    const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, email_confirm: true })
    });
    const createData = await createRes.json();
    if (!createRes.ok) {
      return res.status(400).json({ error: createData.msg || createData.error_description || 'Erreur lors de la creation du compte' });
    }

    // 5) Lui attribuer son role
    const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/admin_profiles`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({ id: createData.id, email, role })
    });
    if (!profileRes.ok) {
      const errText = await profileRes.text();
      return res.status(500).json({ error: 'Compte cree mais role non attribue: ' + errText });
    }

    return res.status(200).json({ ok: true, id: createData.id, email, role });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}