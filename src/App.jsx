import React, { useEffect, useState, useRef } from 'react'
import Admin from './Admin'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || 'https://sswbiiurbnclsxqstrmu.supabase.co').split('xtfenrkhxmzptfkjxx').join('sswbiiurbnclsxqstrmu')
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'sb_publishable_nO-86ly83b8Pup6WZwCsZw_OfIUZsiR'
const SLOGAN_L1 = "Si près de l'info, si près de vous"
const SLOGAN_L2 = "Voir Vérifier Informer"
const YOUTUBE_HANDLE = "Marius-Kodzo-ATTOR"
const YOUTUBE_CHANNEL_URL = `https://www.youtube.com/@${YOUTUBE_HANDLE}`
const YOUTUBE_CHANNEL_ID = "UCu9_CRwzXzSwt-n-3eWfkfw"

const LANGS = {
  fr: { label: '🇫🇷 FR' },
  en: { label: '🇬🇧 EN' },
  es: { label: '🇪🇸 ES' },
  de: { label: '🇩🇪 DE' },
  ar: { label: '🇸🇦 AR' },
  zh: { label: '🇨🇳 ZH' },
}

const UI = {
  fr: { accueil:'ACCUEIL', lire:'▶ LIRE', retour:'← RETOUR', flash:'FLASH', direct:'EN DIRECT', categories:'CATÉGORIES', contact:'CONTACT', newsletter:'NEWSLETTER', ok:'OK', charger:'Chargement...', slogan1:SLOGAN_L1, slogan2:SLOGAN_L2, search:'Rechercher...', liveTitle:'DIRECT RIUS MULTIMEDIA', liveDesc:'Suivez tous nos directs depuis Lomé', chat:'Chat en direct', abonner:"S'abonner", podcastTitle:'PODCASTS RIUS', podcastDesc:'Nos émissions audio', ecouter:'▶ ÉCOUTER', enCours:'EN COURS' },
  en: { accueil:'HOME', lire:'▶ READ', retour:'← BACK', flash:'BREAKING', direct:'LIVE', categories:'CATEGORIES', contact:'CONTACT', newsletter:'NEWSLETTER', ok:'OK', charger:'Loading...', slogan1:"So close to the news, so close to you", slogan2:"See Verify Inform", search:'Search...', liveTitle:'LIVE RIUS MULTIMEDIA', liveDesc:'Follow our live shows', chat:'Live chat', abonner:'Subscribe', podcastTitle:'RIUS PODCASTS', podcastDesc:'Listen to our shows', ecouter:'▶ PLAY', enCours:'NOW PLAYING' },
  es: { accueil:'INICIO', lire:'▶ LEER', retour:'← VOLVER', flash:'ÚLTIMO', direct:'EN DIRECTO', categories:'CATEGORÍAS', contact:'CONTACTO', newsletter:'BOLETÍN', ok:'OK', charger:'Cargando...', slogan1:"Tan cerca de la noticia", slogan2:"Ver Verificar Informar", search:'Buscar...', liveTitle:'EN DIRECTO', liveDesc:'Sigue nuestros directos', chat:'Chat', abonner:'Suscribirse', podcastTitle:'PODCASTS', podcastDesc:'Escucha nuestras emisiones', ecouter:'▶ ESCUCHAR', enCours:'REPRODUCIENDO' },
  de: { accueil:'START', lire:'▶ LESEN', retour:'← ZURÜCK', flash:'EILMELDUNG', direct:'LIVE', categories:'KATEGORIEN', contact:'KONTAKT', newsletter:'NEWSLETTER', ok:'OK', charger:'Laden...', slogan1:"So nah an der Info", slogan2:"Sehen Prüfen Informieren", search:'Suchen...', liveTitle:'LIVE', liveDesc:'Live aus Lomé', chat:'Live-Chat', abonner:'Abonnieren', podcastTitle:'PODCASTS', podcastDesc:'Unsere Sendungen', ecouter:'▶ HÖREN', enCours:'LÄUFT' },
  ar: { accueil:'الرئيسية', lire:'▶ اقرأ', retour:'← رجوع', flash:'عاجل', direct:'مباشر', categories:'الفئات', contact:'اتصل بنا', newsletter:'النشرة', ok:'حسنا', charger:'تحميل...', slogan1:"قريب جدا من الخبر", slogan2:"شاهد تحقق أبلغ", search:'بحث...', liveTitle:'مباشر', liveDesc:'تابع البث المباشر', chat:'دردشة', abonner:'اشترك', podcastTitle:'بودكاست', podcastDesc:'استمع لبرامجنا', ecouter:'▶ استمع', enCours:'قيد التشغيل' },
  zh: { accueil:'首页', lire:'▶ 阅读', retour:'← 返回', flash:'快讯', direct:'直播', categories:'分类', contact:'联系', newsletter:'通讯', ok:'确定', charger:'加载中...', slogan1:"离资讯如此之近", slogan2:"看见 核实 告知", search:'搜索...', liveTitle:'直播', liveDesc:'来自洛美的直播', chat:'聊天', abonner:'订阅', podcastTitle:'播客', podcastDesc:'收听我们的节目', ecouter:'▶ 收听', enCours:'正在播放' },
}

const CATS = ['ACCUEIL','POLITIQUE','CULTURE','SOCIÉTÉ','SANTÉ','SPORT','ENVIRONNEMENT','INTERNATIONAL','ESPACE BUSINESS']



function HeroCarousel({items, openArticle, T, allItems}){
  const [idx, setIdx] = useState(0);
  const [hover, setHover] = useState(false);
  const safeItems = (items||[]).filter(function(a){ return a && (a.image || (a.gallery && a.gallery[0] && a.gallery[0].url)); }).map(function(a){ 
    if(!a.image && a.gallery && a.gallery[0]){ a = {...a, image: a.gallery[0].url}; }
    return a;
  });
  useEffect(()=>{
    if(hover || safeItems.length<=1) return;
    const id = setInterval(function(){ setIdx(function(i){ return (i+1)%safeItems.length; }); }, 4500);
    return function(){ clearInterval(id); };
  }, [safeItems.length, hover]);
  if(!safeItems.length){
    const fallback = (items||[])[0];
    if(fallback && fallback.image){
      return (
        <div className="hero-main" style={{backgroundImage:'linear-gradient(rgba(46,79,176,0.18), rgba(46,79,176,0.92)), url('+fallback.image+')', backgroundSize:'cover', backgroundPosition:'center', padding:'24px', display:'flex', flexDirection:'column', justifyContent:'flex-end'}}>
          <span style={{background:'#d4ff00', color:'black', padding:'5px 10px', borderRadius:4, fontWeight:900, fontSize:10, width:'fit-content'}}>• {fallback.category}</span>
          <h1 style={{fontSize:32, lineHeight:1.05, margin:'12px 0', fontWeight:900, maxWidth:600, color:'white'}}>{fallback.title}</h1>
          <button onClick={function(){ if(allItems[0]) openArticle(allItems[0]); }} style={{background:'#ffcc00', border:0, padding:'11px 20px', borderRadius:6, fontWeight:900, marginTop:12, width:'fit-content', color:'#0d1b4a', cursor:'pointer'}}>{T.lire}</button>
        </div>
      );
    }
    return <div style={{flex:'0 0 68%', padding:40, color:'white'}}>Chargement...</div>;
  }
  const current = safeItems[idx] || safeItems[0];
  const isVideo = current.gallery && current.gallery[0] && current.gallery[0].type==='video';
  return (
    <div className="hero-main" onMouseEnter={function(){setHover(true);}} onMouseLeave={function(){setHover(false);}} style={{position:'relative', overflow:'hidden', background:'#000', minHeight:380}}>
      <div style={{position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(46,79,176,0.18), rgba(46,79,176,0.92)), url('+(current.image||'')+')', backgroundSize:'cover', backgroundPosition:'center', transition:'background-image 0.5s ease'}}></div>
      {isVideo && <div style={{position:'absolute', top:20, right:20, background:'rgba(255,0,0,0.8)', color:'white', padding:'4px 8px', borderRadius:4, fontSize:10, fontWeight:900, zIndex:2}}>▶ VIDEO</div>}
      <div style={{position:'relative', zIndex:1, display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:'24px', height:'100%', boxSizing:'border-box', minHeight:380}}>
        <span style={{background:'#d4ff00', color:'black', padding:'5px 10px', borderRadius:4, fontWeight:900, fontSize:10, width:'fit-content'}}>• {current.category}</span>
        <h1 style={{fontSize:32, lineHeight:1.05, margin:'12px 0', fontWeight:900, maxWidth:600, color:'white'}}>{current.title}</h1>
        <button onClick={function(){ const orig = allItems[idx] || allItems[0]; if(orig) openArticle(orig); }} style={{background:'#ffcc00', border:0, padding:'11px 20px', borderRadius:6, fontWeight:900, marginTop:12, width:'fit-content', color:'#0d1b4a', cursor:'pointer'}}>{T.lire}</button>
      </div>
      {hover && (
        <>
          <button onClick={function(){ setIdx(function(p){ return p>0?p-1:safeItems.length-1; }); }} style={{position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', background:'transparent', border:0, color:'white', fontSize:38, fontWeight:300, cursor:'pointer', zIndex:2, textShadow:'0 2px 8px rgba(0,0,0,0.8)', lineHeight:1}}>‹</button>
          <button onClick={function(){ setIdx(function(p){ return p<safeItems.length-1?p+1:0; }); }} style={{position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'transparent', border:0, color:'white', fontSize:38, fontWeight:300, cursor:'pointer', zIndex:2, textShadow:'0 2px 8px rgba(0,0,0,0.8)', lineHeight:1}}>›</button>
        </>
      )}
    </div>
  );
}



export default function App() {
  if (typeof window !== 'undefined' && window.location.pathname === '/admin') return <Admin />
  const [lang, setLang] = useState(() => { if (typeof window === 'undefined') return 'fr'; return localStorage.getItem('rius_lang') || 'fr' })
  const [articles, setArticles] = useState([])
  const [flashes, setFlashes] = useState([])
  const [annonces, setAnnonces] = useState([])
  const [pubs, setPubs] = useState([])
  const [currentPub, setCurrentPub] = useState(0)
  const [actif, setActif] = useState('ACCUEIL')
  const [meteo, setMeteo] = useState({ temp: '32°C', icon: '☀' })
  const [dateJour, setDateJour] = useState('')
  const [heureTU, setHeureTU] = useState('')
  const [selected, setSelected] = useState(null)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [contactForm, setContactForm] = useState({name:'', email:'', subject:'', message:''})
  const [contactStatus, setContactStatus] = useState('')
  const [translatedCache, setTranslatedCache] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [searchHistory, setSearchHistory] = useState(()=>{ if (typeof window === 'undefined') return []; try{return JSON.parse(localStorage.getItem('rius_search_hist')||'[]')}catch{return []} })
  const [currentAudio, setCurrentAudio] = useState(null)
  const audioRef = useRef(null)
  const T = UI[lang] || UI.fr

  useEffect(() => {
    if (typeof window !== 'undefined') document.body.style.background='#2e4fb0';
    if (typeof window === 'undefined') return;
    localStorage.setItem('rius_lang', lang)
    document.documentElement.dir = lang==='ar'?'rtl':'ltr'
    document.documentElement.lang = lang
    const locale = lang==='zh'?'zh-CN':lang==='ar'?'ar-EG':lang
    const d = new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })
    setDateJour(d.charAt(0).toUpperCase()+d.slice(1))
  }, [lang])

  useEffect(()=>{
    const updateHeure = ()=>{
      const now = new Date()
      const h = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
      setHeureTU(h + ' TU')
    }
    updateHeure()
    const id = setInterval(updateHeure, 60000)
    return ()=>clearInterval(id)
  },[])

  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=6.1319&longitude=1.2228&current=temperature_2m,weather_code&timezone=Africa/Lome')
      .then(r=>r.json()).then(data=>{
        const temp = Math.round(data.current.temperature_2m)
        const code = data.current.weather_code
        let icon='☀'; if(code>1&&code<4) icon='⛅'; if(code>=45) icon='🌫'; if(code>=51) icon='🌧'; if(code>=95) icon='⛈'
        setMeteo({ temp: temp+'°C', icon })
      }).catch(()=>{})
    fetch(`${supabaseUrl}/rest/v1/articles?select=*&order=id.desc`, { headers:{ 'apikey':supabaseKey, 'Authorization':'Bearer '+supabaseKey } }).then(r=>r.json()).then(d=>{ if(Array.isArray(d)) setArticles(d) })
    fetch(`${supabaseUrl}/rest/v1/flash?select=*&active=eq.true&order=created_at.desc&limit=15`, { headers:{ 'apikey':supabaseKey, 'Authorization':'Bearer '+supabaseKey } }).then(r=>r.json()).then(d=>{ if(Array.isArray(d)&&d.length>0) setFlashes(d.map(x=>x.text)) }).catch(()=>{})
    fetch(`${supabaseUrl}/rest/v1/annonces_blanches?select=*&active=eq.true&order=created_at.desc&limit=15`, { headers:{ 'apikey':supabaseKey, 'Authorization':'Bearer '+supabaseKey } }).then(r=>r.json()).then(d=>{ if(Array.isArray(d)&&d.length>0) setAnnonces(d.map(x=>x.text)) }).catch(()=>{})
    fetch(`${supabaseUrl}/rest/v1/pubs?select=*&active=eq.true&order=created_at.desc`, { headers:{ 'apikey':supabaseKey, 'Authorization':'Bearer '+supabaseKey } }).then(r=>r.json()).then(d=>{ if(Array.isArray(d)&&d.length>0) setPubs(d) }).catch(()=>{})
  }, [])

  useEffect(()=>{ if(pubs.length<=1) return; const id=setInterval(()=>setCurrentPub(p=>(p+1)%pubs.length),5000); return()=>clearInterval(id)},[pubs])

  const getYoutubeId = (url) => {
    if(!url) return null
    if(url.includes('embed/')) return url
    let id=url.split('v=')[1]; if(!id) id=url.split('youtu.be/')[1]
    if(id) id=id.split('&')[0]
    return id? 'https://www.youtube.com/embed/'+id : url
  }

  const translateText = async (text, target) => {
    if(!text || target==='fr') return text
    try{
      const q=encodeURIComponent(text.slice(0,450))
      const res=await fetch(`https://api.mymemory.translated.net/get?q=${q}&langpair=fr|${target}`)
      const data=await res.json()
      return data?.responseData?.translatedText || text
    }catch{ return text }
  }

  const getTranslated = (art) => {
    if(!art) return art
    if(lang==='fr') return art
    if(art.translations && art.translations[lang] && art.translations[lang].title){
      return {...art, title: art.translations[lang].title, content: art.translations[lang].content || art.content }
    }
    if(translatedCache[art.id]?.[lang]){
      return {...art,...translatedCache[art.id][lang]}
    }
    return art
  }

  const handleLiveTranslate = async (art) => {
    if(lang==='fr' || art.translations?.[lang] || translatedCache[art.id]?.[lang]) return
    const title=await translateText(art.title, lang)
    const content=await translateText(art.content.slice(0,800), lang)
    setTranslatedCache(p=>({...p, [art.id]:{...p[art.id], [lang]:{title, content}}}))
  }

  useEffect(()=>{
    if(lang!=='fr' && articles.length){
      articles.slice(0,8).forEach(a=>{ if(!a.translations?.[lang]) handleLiveTranslate(a) })
    }
  },[lang, articles])

  const openArticle = (art) => {
    const td = getTranslated(art)
    setSelected(td)
    if(lang!=='fr' &&!art.translations?.[lang]) handleLiveTranslate(art)
    window.scrollTo(0,0)
  }

  const handleNewsletter = async () => {
    if(!newsletterEmail) return alert('Mets ton email')
    await fetch('https://formsubmit.co/ajax/rius.multimedia@gmail.com', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ _subject:'Newsletter: '+newsletterEmail, email: newsletterEmail }) })
    alert('Merci!'); setNewsletterEmail('')
  }

  const handleContact = async (e) => {
    e.preventDefault()
    if(!contactForm.name || !contactForm.email || !contactForm.message) { alert('Remplis tous les champs'); return }
    setContactStatus('Envoi...')
    try{
      await fetch('https://formsubmit.co/ajax/rius.multimedia@gmail.com', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ _subject: `CONTACT RIUS: ${contactForm.subject || 'Nouveau message'}`, name: contactForm.name, email: contactForm.email, subject: contactForm.subject, message: contactForm.message }) })
      setContactStatus('Message envoyé avec succès !')
      setContactForm({name:'', email:'', subject:'', message:''})
      setTimeout(()=>setContactStatus(''), 4000)
    }catch{
      setContactStatus('Erreur, réessaie')
    }
  }

  const articlesForSearch = searchTerm? articles.filter(a => {
    const q = searchTerm.toLowerCase()
    return (a.title?.toLowerCase().includes(q) || a.content?.toLowerCase().includes(q) || a.category?.toLowerCase().includes(q))
  }) : articles
  const filteredArticles = actif==='RECHERCHE' ? articlesForSearch : articles
  const handleSearch = (term) => {
    const t = term || searchTerm
    if(!t.trim()) return
    const hist = [t, ...searchHistory.filter(h=>h!==t)].slice(0,5)
    setSearchHistory(hist)
    localStorage.setItem('rius_search_hist', JSON.stringify(hist))
    setActif('RECHERCHE')
  }
  const podcastArticles = filteredArticles.filter(a=>a.audio)
  const articlePrincipal = (actif==='RECHERCHE'? articlesForSearch : filteredArticles)[0]? getTranslated((actif==='RECHERCHE'? articlesForSearch : filteredArticles)[0]) : null
  const autres = (actif==='RECHERCHE'? articlesForSearch : filteredArticles).slice(1,4).map(getTranslated)
  const flashList = flashes.length? flashes : [`Rius Multimédia - ${T.slogan1}`, `Lomé ${meteo.temp} ${meteo.icon} - ${dateJour}`]
  const annoncesList = annonces.length? annonces : [`🔴 EN DIRECT à 20h TU`, `📢 Emission Spéciale Société vendredi 20h TU`, `📰 A LIRE : ${articles[0]?.title || 'Actu disponible'}`, `💼 ESPACE BUSINESS : Votre pub ici`]

  if(selected){
    const disp=getTranslated(articles.find(a=>a.id===selected.id) || selected)
    return(
      <div style={{background:'linear-gradient(180deg, #193071 0%, #1e3a85 100%)', minHeight:'100vh', fontFamily:'Inter,Arial'}}>
        <style>{`* {box-sizing:border-box} body{margin:0} .sep-full{height:48px!important; width:1px!important; background:#ffffff!important; display:inline-block!important; opacity:0.9!important} .sep-small{opacity:0.9!important; color:#ffffff!important}`}</style>
        <header style={{background:'rgba(46,79,176,0.70)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', color:'white', padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <b style={{cursor:'pointer'}} onClick={()=>setSelected(null)}>RIUS MULTIMEDIA</b>
          <button onClick={()=>setSelected(null)} style={{background:'#ffcc00', border:0, padding:'8px 14px', borderRadius:6, fontWeight:800, cursor:'pointer'}}>{T.retour}</button>
        </header>
        <div style={{maxWidth:850, margin:'24px auto', background:'white', padding:0, borderRadius:16, overflow:'hidden', boxShadow:'0 10px 40px rgba(0,0,0,0.2)'}}>
          <div style={{padding:28}}>
            <span style={{background:'#ffcc00', padding:'6px 12px', fontWeight:900, fontSize:11, borderRadius:6}}>{disp.category}</span>
            <h1 style={{marginTop:16, fontSize:28, lineHeight:1.15, fontWeight:900, color:'#0f2040'}}>{disp.title}</h1>
          </div>
          
          {/* Media principal */}
          {disp.video && !disp.gallery ? <div style={{position:'relative', paddingBottom:'56.25%', height:0, margin:'0 0', overflow:'hidden'}}><iframe src={getYoutubeId(disp.video)} style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', border:0}} allowFullScreen></iframe></div> : null}
          {disp.image && !disp.gallery && !disp.video ? <img src={disp.image} style={{width:'100%', maxHeight:520, objectFit:'cover'}} alt="" /> : null}

          {/* Galerie multiple images / videos en plein article */}
          {disp.gallery && Array.isArray(disp.gallery) && disp.gallery.length>0 && (
            <div style={{display:'flex', flexDirection:'column', gap:16, padding:'0 0'}}>
              {disp.gallery.map((item, idx) => (
                <div key={idx} style={{width:'100%', borderRadius:12, overflow:'hidden', background:'#f5f5f5'}}>
                  {item.type==='video' ? (
                    item.url.includes('youtube') || item.url.includes('youtu.be') ? (
                      <div style={{position:'relative', paddingBottom:'56.25%', height:0}}><iframe src={getYoutubeId(item.url)} style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', border:0}} allowFullScreen></iframe></div>
                    ) : (
                      <video controls src={item.url} style={{width:'100%', maxHeight:600}} />
                    )
                  ) : (
                    <img src={item.url} style={{width:'100%', height:'auto', display:'block'}} alt={"media-"+idx} />
                  )}
                  {item.caption && <div style={{padding:'8px 14px', fontSize:12, color:'#555', background:'white', fontStyle:'italic'}}>{item.caption}</div>}
                </div>
              ))}
            </div>
          )}

          <div style={{padding:28}}>
            {disp.audio && <div style={{background:'#fff8e1', border:'1px solid #ffcc00', padding:14, borderRadius:12, marginBottom:20}}><div style={{fontWeight:900, fontSize:11, marginBottom:8, color:'#162f6b'}}>🎧 PODCAST / AUDIO</div><audio controls src={disp.audio} style={{width:'100%'}}></audio></div>}
            <p style={{lineHeight:1.8, fontSize:17, whiteSpace:'pre-wrap', color:'#1a1a1a'}}>{disp.content}</p>
          </div>
        </div>
      </div>
    )
  }

  return(
    <div style={{margin:0, fontFamily:'Inter,Arial,sans-serif', background:'#162f6b'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        *{box-sizing:border-box}
        html{scrollbar-width:none; -ms-overflow-style:none; scroll-behavior:smooth}
        html{margin:0; padding:0} body{margin:0; padding:0; overflow-x:clip}
        /* Scrollbar verticale 1px : invisible -> blanc survol -> jaune clic */
        ::-webkit-scrollbar{width:1px !important; height:1px !important}
        ::-webkit-scrollbar-track{background:#0f2040 !important}
        ::-webkit-scrollbar-thumb{background:transparent !important; border-radius:10px !important; transition:background 0.2s ease !important}
        html:hover ::-webkit-scrollbar-thumb, body:hover ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.35) !important}
        html:active ::-webkit-scrollbar-thumb, body:active ::-webkit-scrollbar-thumb, ::-webkit-scrollbar-thumb:active, ::-webkit-scrollbar-thumb:hover{background:#ffcc00 !important}
        @supports (scrollbar-width: thin){
          html{scrollbar-width:thin; scrollbar-color: transparent #0f2040}
          html:hover{scrollbar-color: rgba(255,255,255,0.35) #0f2040}
          html:active{scrollbar-color: #ffcc00 #0f2040}
        }
        .nav-scroll::-webkit-scrollbar{display:none !important; height:0 !important}
        .nav-scroll{scrollbar-width:none !important}
        @media (max-width:768px){
          .ticker-bar{height:32px !important; font-size:10px !important}
          .ticker-right{padding:0 8px !important; gap:6px !important; border-left:1px solid #eee !important; margin-right:10px !important}
          .hide-mobile{display:none !important}
          .main-nav{display:flex !important; flex-direction:column !important; align-items:stretch !important; padding:0 !important; min-height:auto !important; width:100% !important; overflow:visible !important}
          .nav-scroll{display:flex !important; flex:0 0 48px !important; width:100% !important; min-width:100% !important; max-width:100vw !important; overflow-x:auto !important; overflow-y:hidden !important; -webkit-overflow-scrolling:touch !important; background:#0e1d48 !important; backdrop-filter:blur(12px) !important; order:1; visibility:visible !important; opacity:1 !important}
          .nav-scroll a{flex-shrink:0 !important; display:flex !important}
          .search-compact{order:2 !important; width:100% !important; margin:0 !important; padding:8px 12px !important; background:#0a1636 !important; backdrop-filter:blur(12px) !important; display:flex !important; justify-content:flex-start !important}
          .search-compact div{width:140px !important}
          .main-nav > .sep-full{display:none !important}
          .grid-2{grid-template-columns:1fr}
        }
        @keyframes defile{0%{transform:translateX(100%)}100%{transform:translateX(-100%)}}
        @keyframes pulse{0%{box-shadow:0 0 0 0 rgba(255,59,59,0.7)}70%{box-shadow:0 0 0 10px rgba(255,59,59,0)}100%{box-shadow:0 0 0 0 rgba(255,59,59,0)}}
        @keyframes blink{0%,50%{opacity:1}51%,100%{opacity:0}}
        .dot{width:8px;height:8px;background:#ff3b3b;border-radius:50%;display:inline-block;animation:pulse 2s infinite}
        .dot-blink{width:7px;height:7px;background:#ff3b3b;border-radius:50%;display:inline-block;animation:blink 1s infinite}
        .dot-green{width:8px;height:8px;background:#a8ff00;border-radius:50%;display:inline-block;animation:pulse 2s infinite}
        .live-text{animation:defile 120s linear infinite;white-space:nowrap;display:inline-block}
        .live-text2{animation:defile 90s linear infinite;white-space:nowrap;display:inline-block}
        .nav-scroll{overflow-x:auto; scrollbar-width:none; display:flex; align-items:center; flex:1; gap:0; min-width:0; -webkit-overflow-scrolling:touch}
        .nav-scroll::-webkit-scrollbar{display:none}
        .nav-white:hover{color:#ffcc00!important}
        .hero-container{display:flex; min-height:520px}
        .hero-main{flex:0 0 68%; position:relative; display:flex; flex-direction:column; justify-content:flex-end; padding:32px; color:white; background-size:cover; background-position:center}
        .hero-side{flex:0 0 32%; background:#132a56; display:flex; flex-direction:column; border-left:1px solid rgba(255,255,255,0.1)}
        .grid-4{display:grid; grid-template-columns:repeat(4,1fr); gap:14px; padding:18px 16px}
        .grid-pod{display:grid; grid-template-columns:repeat(3,1fr); gap:14px; padding:18px 20px}
        .footer-grid{display:grid; grid-template-columns:1.6fr 1fr 1fr 1.3fr; gap:28px; padding:36px 20px}
        .yellow-dot{width:8px;height:8px;background:#ffcc00;border-radius:50%;display:inline-block;flex-shrink:0}
        .sep-full{width:1px; height:48px; background:#ffffff; margin:0 6px; flex-shrink:0; display:inline-block; opacity:0.9}
        .sep-small{color:#ffffff; font-size:9px; margin:0 1px; opacity:0.85}
        @media(max-width:900px){.header-banner{display:none!important}.header-main{height:auto!important; padding:10px 12px!important}.hero-container{flex-direction:column!important}.hero-main{flex:1 1 100%!important; min-height:420px!important; padding:20px!important}.grid-4{grid-template-columns:1fr 1fr!important}.grid-pod{grid-template-columns:1fr 1fr!important}.footer-grid{grid-template-columns:1fr 1fr!important}.search-compact{width:100%!important}.direct-grid{flex-direction:column!important}}
        @media(max-width:600px){.grid-4{grid-template-columns:1fr!important}.grid-pod{grid-template-columns:1fr!important}.footer-grid{grid-template-columns:1fr!important}}
        .sep-full{height:48px!important; width:1px!important; background:#ffffff!important; display:inline-block!important; opacity:0.9!important} .sep-small{opacity:0.9!important; color:#ffffff!important}
      `}</style>

      <div style={{position:'sticky', top:0, zIndex:1000, width:'100%', background:'transparent'}}>
        <div style={{background:'black', color:'white', padding:'0 10px', fontSize:11, display:'flex', gap:8, alignItems:'center', overflow:'hidden', height:26, minHeight:26, overflow:'hidden'}}>
          <div style={{display:'flex', alignItems:'center', gap:6, background:'#d4ff00', color:'black', padding:'3px 10px', fontWeight:900, borderRadius:4, flexShrink:0}}><span className="dot"></span> {T.flash}</div>
          <div style={{overflow:'hidden', flex:1}}><div className="live-text" style={{display:'flex', alignItems:'center'}}>{flashList.map((txt,i)=>(<span key={i} style={{display:'inline-flex', alignItems:'center', gap:8, marginRight:36, whiteSpace:'nowrap'}}><span className="yellow-dot"></span>{txt}</span>))}</div></div>
        </div>

        <header className="header-main" style={{background:'rgba(46,79,176,0.88)', backdropFilter:'blur(12px) saturate(180%)', WebkitBackdropFilter:'blur(12px)', borderBottom:'1px solid rgba(255,255,255,0.15)', color:'white', height:'88px', padding:'0 22px 0 18px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12}}>
          <div style={{display:'flex', alignItems:'center', gap:12, flexShrink:0, minWidth:240}}>
            <img src="/logo.png" style={{width:74, height:74, borderRadius:'50%', border:'3px solid rgba(255,255,255,0.9)', boxShadow:'0 4px 15px rgba(0,0,0,0.4)'}} alt="Rius Multimédia" />
            <div style={{lineHeight:1.15, display:'flex', flexDirection:'column', alignItems:'center'}}>
              <div style={{fontSize:18}}><span style={{fontFamily:'cursive'}}>Rius</span><span style={{color:'#ffcc00', fontWeight:900, marginLeft:5}}>Multimédia</span></div>
              <div style={{marginTop:4, textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center'}}>
                <div style={{fontSize:10, fontWeight:800, fontStyle:'italic', lineHeight:1.2, textAlign:'center'}}>{T.slogan1}</div>
                <div style={{fontSize:8, opacity:0.8, fontWeight:400, fontStyle:'normal', letterSpacing:'0.3px', marginTop:3, textAlign:'center'}}>{T.slogan2}</div>
              </div>
            </div>
          </div>
          <div className="header-banner" style={{flex:1, height:'100%', display:'flex', alignItems:'center', justifyContent:'center', padding:'0 12px', marginLeft:8}}>
            {pubs.length>0? <a href={pubs[currentPub]?.link || '#'} target="_blank" rel="noreferrer" style={{width:'100%', maxWidth:728, height:76, background:'white', borderRadius:6, overflow:'hidden', display:'block'}}><img src={pubs[currentPub]?.image} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="pub" /></a> : <div style={{width:'100%', maxWidth:728, height:76, background:'rgba(0,0,0,0.2)', border:'1px dashed rgba(255,255,255,0.3)', borderRadius:6, overflow:'hidden'}}><img src="/banniere.jpg" style={{width:'100%', height:'100%', objectFit:'cover'}} alt="" /></div>}
          </div>
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:6, flexShrink:0, width:110, marginRight:4, paddingRight:4}}>
            <select value={lang} onChange={e=>setLang(e.target.value)} style={{background:'rgba(0,0,0,0.35)', color:'white', border:'1px solid rgba(255,255,255,0.5)', borderRadius:12, padding:'2px 6px', fontSize:10, fontWeight:800, cursor:'pointer', width:'76px', height:'24px', textAlign:'center'}}>{Object.entries(LANGS).map(([code,l])=><option key={code} value={code} style={{color:'black'}}>{l.label}</option>)}</select>
            <div style={{display:'flex', flexDirection:'row', gap:6, alignItems:'center', justifyContent:'center'}}>
              <a href="https://web.facebook.com/profile.php?id=61590642726989" target="_blank" rel="noreferrer"><img src="/logo-facebook.png" style={{width:20, height:20, borderRadius:'50%', background:'white', objectFit:'cover'}} alt="FB" /></a>
              <a href={`${YOUTUBE_CHANNEL_URL}?sub_confirmation=1`} target="_blank" rel="noreferrer"><img src="/logo-youtube.png" style={{width:20, height:20, borderRadius:'50%', background:'white', objectFit:'cover'}} alt="YT" /></a>
              <a href="https://www.tiktok.com/@rius_multimedia?_r=1&_t=ZN-97y7NnHOElC" target="_blank" rel="noreferrer"><img src="/logo-tiktok.png" style={{width:20, height:20, borderRadius:'50%', background:'white', objectFit:'cover'}} alt="TikTok" /></a>
              <a href="https://whatsapp.com/channel/0029VbD2cS4I7BeFr0A0I01R" target="_blank" rel="noreferrer"><img src="/logo-whatsapp.png" style={{width:20, height:20, borderRadius:'50%', background:'white', objectFit:'cover'}} alt="WA" /></a>
            </div>
          </div>
        </header>

                <div className="ticker-bar" style={{background:'white', color:'#0f2040', fontWeight:900, fontSize:11, display:'flex', alignItems:'center', height:26, minHeight:26, overflow:'hidden', width:'100%', position:'relative'}}>
          <div style={{display:'flex', alignItems:'center', background:'#0f2040', color:'#ffcc00', padding:'0 12px', height:'100%', gap:6, flexShrink:0, fontSize:10, zIndex:3}}>📢 ANNONCES</div>
          <div style={{flex:1, minWidth:0, overflow:'hidden', background:'white', height:'100%', display:'flex', alignItems:'center'}}>
            <div className="live-text2" style={{display:'flex', alignItems:'center', fontWeight:700, color:'#333', whiteSpace:'nowrap'}}>
              {annoncesList.map((txt,i)=>(<span key={i} style={{marginRight:50, whiteSpace:'nowrap', display:'inline-flex', alignItems:'center', gap:8}}><span style={{width:6, height:6, background:'#2e4fb0', borderRadius:'50%', display:'inline-block', flexShrink:0}}></span>{txt}</span>))}
            </div>
          </div>
          <div className="ticker-right" style={{display:'flex', gap:10, padding:'0 12px', flexShrink:0, borderLeft:'2px solid #eee', fontSize:10, background:'#f8f8f8', height:'100%', alignItems:'center', zIndex:3}}>
            <span className="hide-mobile">📍 Lomé {meteo.icon} {meteo.temp}</span>
            <span className="hide-mobile" style={{color:'#2e4fb0', fontWeight:800}}>📅 {dateJour}</span>
            <span style={{background:'#2e4fb0', color:'#ffcc00', padding:'3px 10px', borderRadius:10, whiteSpace:'nowrap', marginRight:16}}>🕒 {heureTU}</span>
          </div>
        </div>

        <nav className="main-nav" style={{background:'transparent', backdropFilter:'blur(14px) saturate(160%)', WebkitBackdropFilter:'blur(14px) saturate(160%)', minHeight:32, height:32, display:'flex', alignItems:'center', padding:'0 8px 0 10px', gap:0, justifyContent:'space-between', flexWrap:'nowrap', width:'100%', position:'relative', zIndex:10, overflow:'hidden'}}>
          <div className="nav-scroll" style={{display:'flex', alignItems:'center', flex:1, minWidth:0, overflowX:'auto', overflowY:'hidden', WebkitOverflowScrolling:'touch'}}>
            {CATS.map((item, idx)=>(
              <div key={item} style={{display:'flex', alignItems:'center', flexShrink:0}}>
                <a href="#" className="nav-white" onClick={e=>{e.preventDefault(); setSearchTerm(''); setActif(item)}} style={{color:actif===item?'#ffcc00':'white', textDecoration:'none', padding:'0 7px', height:32, fontSize:10, fontWeight:900, whiteSpace:'nowrap', borderBottom:actif===item?'2px solid #ffcc00':'2px solid transparent', display:'flex', alignItems:'center', transition:'color 0.2s'}}>{item}</a>
                {idx === CATS.length -1? <span className="sep-full" style={{marginLeft:8, marginRight:10, height:32, width:1, background:'#ffffff', opacity:0.95}}></span> : <span className="sep-small">│</span>}
              </div>
            ))}
            <div style={{display:'flex', alignItems:'center', flexShrink:0}}>
              <a href="#" onClick={e=>{e.preventDefault(); setSearchTerm(''); setActif('DIRECT')}} style={{color:'#ff3b3b', textDecoration:'none', padding:'0 7px', height:32, fontSize:10, fontWeight:900, whiteSpace:'nowrap', borderBottom:actif==='DIRECT'?'2px solid #ff3b3b':'2px solid transparent', display:'flex', alignItems:'center', gap:6}}><span className="dot-blink"></span>DIRECT</a>
              <span className="sep-small">│</span>
            </div>
            <div style={{display:'flex', alignItems:'center', flexShrink:0}}>
              <a href="#" onClick={e=>{e.preventDefault(); setSearchTerm(''); setActif('PODCAST')}} style={{color:'#a8ff00', textDecoration:'none', padding:'0 7px', height:32, fontSize:10, fontWeight:900, whiteSpace:'nowrap', borderBottom:actif==='PODCAST'?'2px solid #a8ff00':'2px solid transparent', display:'flex', alignItems:'center'}}>PODCAST</a>
              <span className="sep-small">│</span>
            </div>
            <a href="#" onClick={e=>{e.preventDefault(); setSearchTerm(''); setActif('CONTACT')}} style={{color:'#ffcc00', textDecoration:'none', padding:'0 7px', height:32, fontSize:10, fontWeight:900, whiteSpace:'nowrap', borderBottom:actif==='CONTACT'?'2px solid #ffcc00':'2px solid transparent', display:'flex', alignItems:'center', flexShrink:0}}>CONTACT</a>
          </div>
          <span className="sep-full" style={{height:32, width:1, background:"#ffffff", margin:"0 18px 0 2px", flexShrink:0, display:"inline-block", opacity:0.95}}></span>
          <div className="search-compact" style={{display:'flex', alignItems:'center', flexShrink:0, marginLeft:8, marginRight:16, position:'relative'}}>
            <div style={{display:'flex', alignItems:'center', background:'white', borderRadius:'20px 0 0 20px', padding:'0 0 0 10px', width:170, height:26, boxShadow:'inset 0 0 0 1.2px #2e4fb0', borderRight:'none'}}>
              <input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') handleSearch() }} placeholder={T.search} style={{border:'none', outline:'none', fontSize:11, fontWeight:700, flex:1, background:'transparent', color:'#0d1b4a', width:'100%'}} />
            </div>
            <button onClick={()=>handleSearch()} style={{background:'white', color:'#0d1b4a', border:'none', boxShadow:'inset 0 0 0 1.2px #2e4fb0', borderRadius:'0 20px 20px 0', height:26, padding:'0 12px', fontWeight:900, fontSize:11, cursor:'pointer', marginLeft:-1}}>🔍</button>
          </div>
        </nav>
      </div>

            {actif==='ACCUEIL'?(
        <div style={{background:'#2e4fb0', minHeight:'100vh'}}>
          <div className="hero-container">
            {articlePrincipal? <HeroCarousel items={filteredArticles.slice(0,5).map(getTranslated)} openArticle={openArticle} T={T} allItems={filteredArticles} /> : <div style={{flex:'0 0 68%', padding:40, color:'white'}}>{searchTerm? `Aucun résultat pour "${searchTerm}"` : T.charger}</div>}
            <div className="hero-side" style={{background:'#2e4fb0', borderLeft:'1px solid rgba(255,255,255,0.1)', display:'flex', flexDirection:'column', gap:0, padding:8}}>
              {autres.map((a,i)=>{
                const orig = filteredArticles[i+1];
                if(!orig) return null;
                const tc = getTranslated(orig);
                const img = tc.image || (orig.gallery && orig.gallery[0] && orig.gallery[0].url) || '';
                const isVid = orig.gallery && orig.gallery[0] && orig.gallery[0].type==='video';
                return (
                  <div key={i} onClick={()=>openArticle(orig)} style={{display:'flex', gap:10, padding:'8px 6px', borderBottom:'1px solid rgba(255,255,255,0.12)', cursor:'pointer', alignItems:'center'}}>
                    <div style={{width:84, height:52, borderRadius:4, overflow:'hidden', background:'#000', flexShrink:0, position:'relative'}}>
                      {img && <img src={img} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="" />}
                      {isVid && <div style={{position:'absolute', bottom:2, left:2, background:'white', color:'black', width:14, height:10, fontSize:7, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:1}}>▶</div>}
                    </div>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontSize:9, color:'#ffcc00', fontWeight:900, textTransform:'uppercase'}}>{tc.category}</div>
                      <div style={{fontSize:12, fontWeight:700, color:'white', lineHeight:1.25, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', marginTop:2}}>{tc.title}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div style={{maxWidth:1400, margin:'0 auto', padding:'28px 18px 40px'}}>
            <h2 style={{color:'#00d4ff', fontSize:20, fontWeight:900, margin:'0 0 18px 0'}}>Reportages et analyses</h2>
            <div className="bbc-grid" style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'20px 18px'}}>
              {filteredArticles.slice(5, 26).map((c,i)=>{
                const tc=getTranslated(c);
                const isVideo = c.gallery && c.gallery[0] && c.gallery[0].type==='video';
                const img = tc.image || (c.gallery && c.gallery[0] && c.gallery[0].url) || '';
                const excerpt = (tc.content || '').replace(/<[^>]*>/g,'').substring(0,130);
                return (
                  <div key={i} onClick={()=>openArticle(c)} style={{cursor:'pointer'}}>
                    <div style={{position:'relative', width:'100%', aspectRatio:'16/9', background:'#000', borderRadius:6, overflow:'hidden'}}>
                      {img && <img src={img} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="" />}
                      {isVideo && <div style={{position:'absolute', bottom:8, left:8, background:'white', color:'black', width:28, height:22, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:2, fontSize:10}}>▶</div>}
                    </div>
                    <div style={{padding:'10px 0 0 0'}}>
                      <div style={{fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.7)', textTransform:'uppercase', marginBottom:6}}><span style={{color:'#ffcc00'}}>{tc.category}</span> | {c.created_at ? new Date(c.created_at).toLocaleDateString('fr-FR') : ''}</div>
                      <h3 style={{color:'white', fontSize:16.5, fontWeight:900, lineHeight:1.25, margin:'0 0 6px 0'}}>{tc.title}</h3>
                      <p style={{color:'rgba(255,255,255,0.7)', fontSize:12.5, lineHeight:1.45, margin:0}}>{excerpt}...</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ): actif==='DIRECT'?(
        <div style={{background:'#2e4fb0', color:'white', minHeight:'100vh', padding:20}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10, marginBottom:14}}>
            <h2 style={{color:'#ff3b3b', margin:0, display:'flex', alignItems:'center', gap:8}}><span className="dot-blink"></span> {T.liveTitle}</h2>
            <div style={{display:'flex', gap:8}}>
              <a href={YOUTUBE_CHANNEL_URL} target="_blank" rel="noreferrer" style={{background:'#ff0000', color:'white', padding:'8px 14px', borderRadius:20, fontWeight:900, fontSize:11, textDecoration:'none'}}>▶ Voir sur YouTube</a>
              <a href={`${YOUTUBE_CHANNEL_URL}?sub_confirmation=1`} target="_blank" rel="noreferrer" style={{background:'white', color:'black', padding:'8px 14px', borderRadius:20, fontWeight:900, fontSize:11, textDecoration:'none'}}>{T.abonner}</a>
            </div>
          </div>
          <p style={{opacity:0.8, fontSize:12, marginTop:0}}>{T.liveDesc} - {YOUTUBE_CHANNEL_URL}</p>
          <div className="direct-grid" style={{display:'flex', gap:14, marginTop:16}}>
            <div style={{flex:2, background:'black', borderRadius:12, overflow:'hidden', border:'2px solid #ff3b3b', minHeight:400}}>
              <iframe width="100%" height="520" src={`https://www.youtube.com/embed/live_stream?channel=${YOUTUBE_CHANNEL_ID}`} style={{border:0, display:'block'}} allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" title="Direct Rius"></iframe>
            </div>
            <div style={{flex:1, background:'#111', borderRadius:12, border:'1px solid rgba(255,255,255,0.15)', overflow:'hidden', minHeight:400, display:'flex', flexDirection:'column'}}>
              <div style={{padding:'10px 12px', background:'#1a1a1a', fontWeight:900, fontSize:11, borderBottom:'1px solid rgba(255,255,255,0.1)'}}>💬 {T.chat}</div>
              <div style={{padding:20, fontSize:11, opacity:0.6, flex:1}}>Le chat YouTube s'affiche ici quand tu es en live.<br/><br/>Tes abonnés peuvent discuter en direct depuis YouTube.</div>
              <div style={{padding:10, background:'#0f0f0f'}}><a href={`${YOUTUBE_CHANNEL_URL}/live`} target="_blank" rel="noreferrer" style={{background:'#ff0000', color:'white', padding:'8px 12px', borderRadius:8, fontSize:11, fontWeight:800, textDecoration:'none', display:'block', textAlign:'center'}}>Ouvrir le chat sur YouTube</a></div>
            </div>
          </div>
          <div style={{marginTop:16, background:'rgba(255,255,255,0.06)', borderRadius:10, padding:14}}>
            <h4 style={{margin:'0 0 8px 0', fontSize:12, color:'#ffcc00'}}>Dernières vidéos de la chaîne</h4>
            <iframe width="100%" height="300" src={`https://www.youtube.com/embed?listType=user&list=${YOUTUBE_HANDLE}`} style={{border:0, borderRadius:8}} allowFullScreen title="Playlist"></iframe>
          </div>
        </div>
      ): actif==='PODCAST'?(
        <div style={{background:'#2e4fb0', color:'white', minHeight:'100vh', paddingBottom:90}}>
          <div style={{padding:'22px 20px 10px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10}}>
            <div>
              <h2 style={{color:'#a8ff00', margin:0, display:'flex', alignItems:'center', gap:8}}><span className="dot-green"></span> {T.podcastTitle}</h2>
              <p style={{margin:'6px 0 0 0', opacity:0.7, fontSize:11}}>{T.podcastDesc} • {podcastArticles.length} émissions</p>
            </div>
            <a href={`${YOUTUBE_CHANNEL_URL}/podcasts`} target="_blank" rel="noreferrer" style={{background:'#a8ff00', color:'black', padding:'8px 14px', borderRadius:20, fontWeight:900, fontSize:11, textDecoration:'none'}}>▶ Voir aussi sur YouTube</a>
          </div>

          {currentAudio && (
            <div style={{position:'sticky', top:48, zIndex:900, background:'#132a56', border:'1px solid #a8ff00', borderRadius:12, margin:'10px 20px', padding:14, display:'flex', gap:14, alignItems:'center', boxShadow:'0 8px 30px rgba(0,0,0,0.5)'}}>
              <img src={currentAudio.image || '/logo.png'} style={{width:60, height:60, borderRadius:10, objectFit:'cover', border:'2px solid #a8ff00'}} alt="" />
              <div style={{flex:1, minWidth:0}}>
                <div style={{display:'flex', alignItems:'center', gap:6}}><span style={{background:'#a8ff00', color:'black', fontSize:8, fontWeight:900, padding:'2px 6px', borderRadius:10}}>{T.enCours}</span><span style={{fontSize:10, opacity:0.7}}>{currentAudio.category}</span></div>
                <div style={{fontWeight:900, fontSize:13, marginTop:4, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{currentAudio.title}</div>
                <audio ref={audioRef} controls autoPlay src={currentAudio.audio} style={{width:'100%', marginTop:8, height:32}}></audio>
              </div>
              <button onClick={()=>setCurrentAudio(null)} style={{background:'rgba(255,255,255,0.12)', border:0, color:'white', borderRadius:'50%', width:30, height:30, cursor:'pointer', flexShrink:0}}>✕</button>
            </div>
          )}

          <div className="grid-pod">
            {podcastArticles.map(a=>{
              const tc=getTranslated(a);
              const isActive = currentAudio?.id===a.id;
              return (
                <div key={a.id} onClick={()=>setCurrentAudio(a)} style={{background: isActive? '#1a3d7a' : 'rgba(255,255,255,0.07)', border: isActive? '2px solid #a8ff00' : '1px solid rgba(255,255,255,0.08)', borderRadius:14, overflow:'hidden', cursor:'pointer'}}>
                  <div style={{position:'relative'}}>
                    <img src={a.image} style={{width:'100%', height:180, objectFit:'cover'}} alt="" />
                    <span style={{position:'absolute', bottom:10, left:10, background:'#a8ff00', color:'black', padding:'4px 10px', borderRadius:20, fontSize:9, fontWeight:900, display:'flex', alignItems:'center', gap:4}}><span className="dot-green" style={{width:6, height:6}}></span> PODCAST</span>
                    <span style={{position:'absolute', top:10, right:10, background: isActive? '#a8ff00' : 'rgba(0,0,0,0.75)', color: isActive? 'black' : 'white', padding:'6px 10px', borderRadius:20, fontSize:11, fontWeight:900}}>{isActive? '■' : '▶'}</span>
                  </div>
                  <div style={{padding:14}}>
                    <div style={{fontSize:10, color:'#a8ff00', fontWeight:900}}>{a.category}</div>
                    <div style={{fontWeight:800, fontSize:14, lineHeight:1.3, marginTop:6}}>{tc.title}</div>
                    <div style={{fontSize:11, opacity:0.6, marginTop:8, display:'flex', alignItems:'center', gap:6}}><span style={{background:'white', color:'#0f2040', padding:'3px 8px', borderRadius:10, fontSize:9, fontWeight:900}}>{T.ecouter}</span> Audio disponible</div>
                  </div>
                </div>
              )
            })}
          </div>

          {podcastArticles.length===0 && (
            <div style={{padding:60, textAlign:'center', opacity:0.8}}>
              <div style={{fontSize:50}}>🎙️</div>
              <h3 style={{color:'#a8ff00'}}>Aucun podcast audio pour l'instant</h3>
              <p style={{fontSize:13, maxWidth:400, margin:'10px auto'}}>Pour ajouter un podcast : va dans ton <b>/admin</b> et ajoute un article avec un lien audio (mp3). Il apparaîtra automatiquement ici.</p>
            </div>
          )}
        </div>
      ): actif==='CONTACT'?(
        <div style={{background:'#2e4fb0', color:'white', minHeight:'100vh', padding:'20px 16px'}}>
          <div style={{maxWidth:1100, margin:'0 auto'}}>
            <h2 style={{color:'#ffcc00', margin:'0 0 6px 0', display:'flex', alignItems:'center', gap:10}}>✉️ CONTACTEZ-NOUS</h2>
            <p style={{opacity:0.7, fontSize:12, margin:'0 0 20px 0'}}>Une info, une pub, un reportage ? L'équipe Rius Multimédia vous répond en moins de 24h.</p>

            <div style={{display:'grid', gridTemplateColumns:'1.2fr 0.8fr', gap:16}} className="direct-grid">
              <form onSubmit={handleContact} style={{background:'white', color:'#0f2040', borderRadius:14, padding:20}}>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
                  <div><label style={{fontSize:10, fontWeight:900}}>NOM COMPLET *</label><input value={contactForm.name} onChange={e=>setContactForm({...contactForm, name:e.target.value})} placeholder="Votre Prénom et NOM" style={{width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #ddd', marginTop:4, fontSize:13}} /></div>
                  <div><label style={{fontSize:10, fontWeight:900}}>EMAIL *</label><input type="email" value={contactForm.email} onChange={e=>setContactForm({...contactForm, email:e.target.value})} placeholder="vous@email.com" style={{width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #ddd', marginTop:4, fontSize:13}} /></div>
                </div>
                <div style={{marginTop:12}}><label style={{fontSize:10, fontWeight:900}}>SUJET</label><select value={contactForm.subject} onChange={e=>setContactForm({...contactForm, subject:e.target.value})} style={{width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #ddd', marginTop:4, fontSize:13}}><option value="">Choisir un sujet</option><option>Proposition d'article / Info</option><option>Publicité / Espace Business</option><option>Invitation / Reportage</option><option>Podcast / Interview</option><option>Autre</option></select></div>
                <div style={{marginTop:12}}><label style={{fontSize:10, fontWeight:900}}>MESSAGE *</label><textarea value={contactForm.message} onChange={e=>setContactForm({...contactForm, message:e.target.value})} placeholder="Votre message..." rows={6} style={{width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #ddd', marginTop:4, fontSize:13, resize:'none'}}></textarea></div>
                <button type="submit" style={{marginTop:14, background:'#0d1b4a', color:'white', border:0, padding:'12px 20px', borderRadius:8, fontWeight:900, width:'100%', cursor:'pointer', fontSize:13}}>{contactStatus? contactStatus : '📨 ENVOYER LE MESSAGE'}</button>
                <div style={{fontSize:10, opacity:0.6, marginTop:8, textAlign:'center'}}>Réponse garantie sous 24h sur rius.multimedia@gmail.com</div>
              </form>

              <div style={{display:'flex', flexDirection:'column', gap:12}}>
                <div style={{background:'#132a56', borderRadius:14, padding:16, border:'1px solid rgba(255,255,255,0.1)'}}>
                  <h4 style={{color:'#ffcc00', margin:'0 0 10px 0', fontSize:13}}>📍 NOS COORDONNÉES</h4>
                  <div style={{fontSize:13, lineHeight:1.6}}><b>Lomé, Togo</b><br/>📧 rius.multimedia@gmail.com<br/>📺 {YOUTUBE_HANDLE}<br/>⏰ Lun - Sam : 08h - 20h TU</div>
                  <div style={{display:'flex', gap:8, marginTop:12}}>
                    <a href="https://web.facebook.com/profile.php?id=61590642726989" target="_blank" rel="noreferrer" style={{background:'white', width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', textDecoration:'none'}}>📘</a>
                    <a href={`${YOUTUBE_CHANNEL_URL}?sub_confirmation=1`} target="_blank" rel="noreferrer" style={{background:'#ff0000', width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', textDecoration:'none', color:'white'}}>▶</a>
                    <a href="https://whatsapp.com/channel/0029VbD2cS4I7BeFr0A0I01R" target="_blank" rel="noreferrer" style={{background:'#25D366', width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', textDecoration:'none'}}>💬</a>
                    <a href="https://www.tiktok.com/@rius_multimedia" target="_blank" rel="noreferrer" style={{background:'black', width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', textDecoration:'none'}}>🎵</a>
                  </div>
                </div>

                <div style={{background:'white', borderRadius:14, overflow:'hidden', height:260}}>
                  <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.7!2d1.22!3d6.13!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1023e3a5!2sLomé%2C%20Togo!5e0!3m2!1sfr!2stg!4v1" width="100%" height="100%" style={{border:0}} loading="lazy" title="Carte Lome"></iframe>
                </div>

                <div style={{background:'#a8ff00', color:'black', borderRadius:14, padding:14}}>
                  <div style={{fontWeight:900, fontSize:12}}>💼 ESPACE BUSINESS</div>
                  <div style={{fontSize:11, marginTop:4, lineHeight:1.4}}>Vous voulez faire de la pub sur Rius Multimédia ? Bannière, article sponsorisé, direct ?</div>
                  <a href="mailto:rius.multimedia@gmail.com?subject=Pub%20Espace%20Business" style={{background:'black', color:'#a8ff00', padding:'8px 12px', borderRadius:8, display:'inline-block', marginTop:8, fontWeight:900, fontSize:11, textDecoration:'none'}}>Demander un devis →</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      ): actif==='RECHERCHE'?(
        <div style={{background:'#2e4fb0', color:'white', minHeight:'100vh', padding:'20px 16px'}}>
          <div style={{maxWidth:1000, margin:'0 auto'}}>
            <h2 style={{margin:'0 0 6px 0'}}>🔍 Résultats pour "<span style={{color:'#ffcc00'}}>{searchTerm}</span>"</h2>
            <p style={{opacity:0.7, fontSize:12, margin:'0 0 16px 0'}}>{articlesForSearch.length} article(s) trouvé(s) dans titre, contenu et catégorie</p>
            <div className="grid-4" style={{padding:0}}>
              {articlesForSearch.map(a=>{const tc=getTranslated(a); return <div key={a.id} onClick={()=>openArticle(a)} style={{background:'white', cursor:'pointer', borderRadius:10, overflow:'hidden', color:'black'}}><img src={a.image} style={{width:'100%', height:170, objectFit:'cover'}} alt="" /><div style={{padding:10}}><div style={{fontSize:9, fontWeight:900, color:'#2e4fb0'}}>{a.category}</div><div style={{fontWeight:700, fontSize:13, marginTop:4}}>{tc.title}</div></div></div>})}
            </div>
            {articlesForSearch.length===0 && <div style={{textAlign:'center', padding:40, opacity:0.7}}><div style={{fontSize:40}}>🔍</div><p>Aucun article ne correspond à "{searchTerm}"<br/>Essaie avec un autre mot-clé</p><button onClick={()=>{setSearchTerm(''); setActif('ACCUEIL')}} style={{background:'#ffcc00', border:0, padding:'8px 14px', borderRadius:6, fontWeight:900, cursor:'pointer', marginTop:10}}>Retour accueil</button></div>}
          </div>
        </div>
      ):(
        <div style={{padding:'20px 16px', minHeight:400, background:'#2e4fb0', color:'white'}}>
          <h2>{actif}</h2>
          <div className="grid-4" style={{padding:0, marginTop:16}}>
            {filteredArticles.filter(a=>a.category===actif).map(a=>{const tc=getTranslated(a); return <div key={a.id} onClick={()=>openArticle(a)} style={{background:'white', cursor:'pointer', borderRadius:10, overflow:'hidden', color:'black'}}><img src={a.image} style={{width:'100%', height:170, objectFit:'cover'}} alt="" /><div style={{padding:10, fontWeight:700, fontSize:13}}>{tc.title}</div></div>})}
          </div>
        </div>
      )}

      <footer style={{background:'linear-gradient(180deg, #3a62d1 0%, #2f52b6 100%)', color:'white', borderTop:'1px solid rgba(255,255,255,0.15)', position:'relative', boxShadow:'0 1px 0 rgba(255,255,255,0.12) inset'}}>
        <div className="footer-grid" style={{padding:'36px 24px 24px', maxWidth:1400, margin:'0 auto', display:'grid', gridTemplateColumns:'1.4fr 0.7fr 1fr 1.2fr', gap:32}}>
          <div>
            <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:12}}>
              <div style={{width:58, height:58, borderRadius:'50%', background:'radial-gradient(circle at 30% 30%, #1e3a8a, #000)', border:'2px solid rgba(255,204,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 20px rgba(255,204,0,0.15)'}}>
                <img src="/logo.png" style={{width:42, height:42, borderRadius:'50%'}} alt="Rius" />
              </div>
              <div>
                <div style={{fontSize:19, lineHeight:1}}><span style={{fontFamily:'cursive', fontWeight:400}}>Rius</span><span style={{color:'#ffcc00', fontWeight:900, marginLeft:6}}>Multimédia</span></div>
                <div style={{marginTop:4}}>
                  <div style={{fontSize:11, fontWeight:800, fontStyle:'italic'}}>{T.slogan1}</div>
                  <div style={{fontSize:10, fontWeight:400, fontStyle:'normal', opacity:0.7, textAlign:'center', marginTop:2}}>{T.slogan2}</div>
                </div>
              </div>
            </div>
            <div style={{fontSize:11, color:'rgba(255,255,255,0.55)', lineHeight:1.5, marginTop:8, maxWidth:300}}>Média togolais indépendant. Voir, Vérifier, Informer. Au plus près de l'info, au plus près de vous.</div>
          </div>
          <div>
            <h4 style={{color:'#ffcc00', fontSize:12, fontWeight:900, letterSpacing:'0.08em', marginBottom:14, textTransform:'uppercase'}}>{T.categories}</h4>
            {['Politique','Société','Sport','Culture','Santé','International'].map(l=>(
              <a key={l} href="#" onClick={e=>{e.preventDefault(); setActif(l.toUpperCase())}} style={{display:'block', color:'rgba(255,255,255,0.65)', textDecoration:'none', fontSize:12.5, marginBottom:9}}>› {l}</a>
            ))}
          </div>
          <div>
            <h4 style={{color:'#ffcc00', fontSize:12, fontWeight:900, letterSpacing:'0.08em', marginBottom:14, textTransform:'uppercase'}}>{T.contact}</h4>
            <div style={{fontSize:12, color:'rgba(255,255,255,0.65)', lineHeight:1.8}}>
              <div>📍 Lomé, Togo</div>
              <div>✉️ rius.multimedia@gmail.com</div>
              <div style={{color:'#ffcc00', fontWeight:600}}>▶ {YOUTUBE_HANDLE}</div>
            </div>
          </div>
          <div>
            <h4 style={{color:'#ffcc00', fontSize:12, fontWeight:900, letterSpacing:'0.08em', marginBottom:14, textTransform:'uppercase'}}>{T.newsletter}</h4>
            <div style={{fontSize:11.5, color:'rgba(255,255,255,0.55)', marginBottom:10}}>Recevez les dernières actus directement par email.</div>
            <div style={{display:'flex', background:'rgba(255,255,255,0.07)', borderRadius:10, padding:4, border:'1px solid rgba(255,255,255,0.08)'}}>
              <input value={newsletterEmail} onChange={e=>setNewsletterEmail(e.target.value)} placeholder="Votre email" style={{flex:1, padding:'10px 12px', borderRadius:'6px', border:'none', fontSize:12, background:'transparent', color:'white', outline:'none'}} />
              <button onClick={handleNewsletter} style={{background:'#ffcc00', color:'#000', border:'none', padding:'0 18px', borderRadius:'6px', fontWeight:900, fontSize:12, cursor:'pointer'}}>OK</button>
            </div>
            <div style={{marginTop:14, fontSize:10, color:'rgba(255,255,255,0.35)', textAlign:'center'}}>
              <div>© 2026 Rius Multimédia • Tous droits réservés</div>
              <div style={{marginTop:4, letterSpacing:'0.06em', opacity:0.7, fontSize:10.5, fontStyle:'normal', fontWeight:400}}>Voir Vérifier Informer</div>
            </div>
          </div>
        </div>
        <div style={{borderTop:'1px solid rgba(255,255,255,0.06)', padding:'12px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:10.5, color:'rgba(255,255,255,0.35)', maxWidth:1400, margin:'0 auto'}}>
          <span>Conçu avec ❤️ à Lomé</span>
          <span style={{display:'flex', gap:16}}><a href="#" style={{color:'inherit', textDecoration:'none'}}>Mentions légales</a><a href="#" style={{color:'inherit', textDecoration:'none'}}>Confidentialité</a><a href="#" style={{color:'inherit', textDecoration:'none'}}>Contact</a></span>
        </div>
      </footer>
    </div>
  )
}