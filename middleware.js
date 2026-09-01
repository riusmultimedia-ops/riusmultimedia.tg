export const config = {
  matcher: ['/', '/sitemap.xml', '/robots.txt'],
};

const BOT_PATTERNS = [
  'facebookexternalhit', 'facebot', 'twitterbot', 'whatsapp', 'linkedinbot',
  'telegrambot', 'slackbot', 'discordbot', 'pinterest', 'redditbot', 'skypeuripreview', 'vkshare'
];

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function stripHtml(str) {
  return String(str || '').replace(/<[^>]*>/g, '').replace(/\*\*/g, '').replace(/_/g, '').trim();
}

async function handleRobots(url) {
  const body = `User-agent: *
Allow: /

Sitemap: ${url.origin}/sitemap.xml
`;
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}

async function handleSitemap(url) {
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  const SUPABASE_KEY = process.env.VITE_SUPABASE_KEY;

  const staticPages = [
    { path: '/', priority: '1.0' },
  ];

  let articleEntries = [];
  try {
    if (SUPABASE_URL && SUPABASE_KEY) {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/articles?select=id,created_at&status=eq.published&order=created_at.desc&limit=1000`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        articleEntries = data.map((a) => ({
          loc: `${url.origin}/?a=${a.id}`,
          lastmod: a.created_at ? new Date(a.created_at).toISOString().split('T')[0] : null,
        }));
      }
    }
  } catch (e) {
    // en cas d'erreur Supabase, on renvoie quand meme le sitemap avec juste les pages statiques
  }

  const staticXml = staticPages
    .map((p) => `  <url>\n    <loc>${escapeXml(url.origin + p.path)}</loc>\n    <priority>${p.priority}</priority>\n  </url>`)
    .join('\n');

  const articlesXml = articleEntries
    .map((a) => `  <url>\n    <loc>${escapeXml(a.loc)}</loc>${a.lastmod ? `\n    <lastmod>${a.lastmod}</lastmod>` : ''}\n    <priority>0.8</priority>\n  </url>`)
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${staticXml}\n${articlesXml}\n</urlset>`;

  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
}

async function handleSocialPreview(url) {
  const articleId = url.searchParams.get('a');
  if (!articleId) return;

  try {
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
    const SUPABASE_KEY = process.env.VITE_SUPABASE_KEY;
    if (!SUPABASE_URL || !SUPABASE_KEY) return;

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/articles?id=eq.${encodeURIComponent(articleId)}&select=title,image,content,chapeau&status=eq.published`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const data = await res.json();
    const article = Array.isArray(data) ? data[0] : null;
    if (!article) return;

    const title = escapeHtml(article.title || 'Rius Multimédia');
    const image = article.image || `${url.origin}/logo.png`;
    const rawExcerpt = (article.chapeau && article.chapeau.trim()) ? article.chapeau.trim() : stripHtml(article.content).substring(0, 160);
    const description = escapeHtml(rawExcerpt || 'Rius Multimédia — Voir, Vérifier, Informer.');
    const pageUrl = url.href;

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<title>${title}</title>
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${image}" />
<meta property="og:type" content="article" />
<meta property="og:url" content="${pageUrl}" />
<meta property="og:site_name" content="Rius Multimédia" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${image}" />
</head>
<body>
<p>${title}</p>
</body>
</html>`;

    return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } });
  } catch (e) {
    return;
  }
}

export default async function middleware(request) {
  const url = new URL(request.url);

  if (url.pathname === '/robots.txt') {
    return handleRobots(url);
  }

  if (url.pathname === '/sitemap.xml') {
    return handleSitemap(url);
  }

  // Racine du site : uniquement pour les robots des reseaux sociaux, sur un lien d'article
  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();
  const isBot = BOT_PATTERNS.some((p) => userAgent.includes(p));
  if (isBot) {
    const preview = await handleSocialPreview(url);
    if (preview) return preview;
  }

  return; // vrai visiteur, ou rien a faire : on laisse passer normalement
}
