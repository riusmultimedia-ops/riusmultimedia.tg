export const config = {
  matcher: '/',
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

function stripHtml(str) {
  return String(str || '').replace(/<[^>]*>/g, '').replace(/\*\*/g, '').replace(/_/g, '').trim();
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const articleId = url.searchParams.get('a');
  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();
  const isBot = BOT_PATTERNS.some((p) => userAgent.includes(p));

  if (!isBot || !articleId) {
    return; // Laisse passer normalement (vrai visiteur, ou pas d'article precise)
  }

  try {
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
    const SUPABASE_KEY = process.env.VITE_SUPABASE_KEY;
    if (!SUPABASE_URL || !SUPABASE_KEY) return;

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/articles?id=eq.${encodeURIComponent(articleId)}&select=title,image,content&status=eq.published`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const data = await res.json();
    const article = Array.isArray(data) ? data[0] : null;
    if (!article) return;

    const title = escapeHtml(article.title || 'Rius Multimédia');
    const image = article.image || `${url.origin}/logo.png`;
    const rawExcerpt = stripHtml(article.content).substring(0, 160);
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

    return new Response(html, {
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  } catch (e) {
    return; // en cas d'erreur, on laisse passer normalement plutot que de casser le site
  }
}
