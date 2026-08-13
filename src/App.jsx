
import React, { useEffect, useState, useRef } from 'react'
import Admin from './Admin'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

const SLOGAN_L1 = "Si pres de l'info, si pres de vous"
const SLOGAN_L2 = "Voir Verifier Informer"
const YOUTUBE_HANDLE = "Marius-Kodzo-ATTOR"
const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@" + YOUTUBE_HANDLE
const YOUTUBE_CHANNEL_ID = "UCu9_CRwzXzSwt-n-3eWfkfw"

const LANGS = { fr:{label:'FR'}, en:{label:'EN'}, es:{label:'ES'}, de:{label:'DE'}, ar:{label:'AR'}, zh:{label:'ZH'} }

const UI = {
  fr: { accueil:'ACCUEIL', lire:'Lire', retour:'Retour', flash:'FLASH', direct:'EN DIRECT', categories:'CATEGORIES', contact:'CONTACT', newsletter:'NEWSLETTER', ok:'OK', charger:'Chargement...', slogan1:SLOGAN_L1, slogan2:SLOGAN_L2, search:'Rechercher...', liveTitle:'DIRECT RIUS MULTIMEDIA', liveDesc:'Suivez tous nos directs depuis Lome', chat:'Chat en direct', abonner:"S'abonner", podcastTitle:'PODCASTS RIUS', podcastDesc:'Nos emissions audio', ecouter:'Ecouter', enCours:'EN COURS', installer:'Installer RM', installDesc:'Acces rapide + hors-ligne', unesTitle:'KIOSQUE - LES UNES', unesDesc:'Toutes les premieres pages de la presse' },
  en: { accueil:'HOME', lire:'READ', retour:'BACK', flash:'BREAKING', direct:'LIVE', categories:'CATEGORIES', contact:'CONTACT', newsletter:'NEWSLETTER', ok:'OK', charger:'Loading...', slogan1:"So close to the news", slogan2:"See Verify Inform", search:'Search...', liveTitle:'LIVE RIUS', liveDesc:'Follow our live', chat:'Live chat', abonner:'Subscribe', podcastTitle:'RIUS PODCASTS', podcastDesc:'Listen', ecouter:'PLAY', enCours:'NOW PLAYING', installer:'Install RM', installDesc:'Fast access', unesTitle:'KIOSK', unesDesc:'Front pages' },
  es: { accueil:'INICIO', lire:'LEER', retour:'VOLVER', flash:'ULTIMO', direct:'EN DIRECTO', categories:'CATEGORIAS', contact:'CONTACTO', newsletter:'BOLETIN', ok:'OK', charger:'Cargando...', slogan1:"Tan cerca de la noticia", slogan2:"Ver Verificar Informar", search:'Buscar...', liveTitle:'EN DIRECTO', liveDesc:'Sigue nuestros directos', chat:'Chat', abonner:'Suscribirse', podcastTitle:'PODCASTS', podcastDesc:'Escucha', ecouter:'ESCUCHAR', enCours:'REPRODUCIENDO', installer:'Instalar RM', installDesc:'Acceso rapido', unesTitle:'KIOSCO', unesDesc:'Portadas' },
  de: { accueil:'START', lire:'LESEN', retour:'ZURUCK', flash:'EILMELDUNG', direct:'LIVE', categories:'KATEGORIEN', contact:'KONTAKT', newsletter:'NEWSLETTER', ok:'OK', charger:'Laden...', slogan1:"So nah an der Info", slogan2:"Sehen Prufen Informieren", search:'Suchen...', liveTitle:'LIVE', liveDesc:'Live aus Lome', chat:'Live-Chat', abonner:'Abonnieren', podcastTitle:'PODCASTS', podcastDesc:'Unsere Sendungen', ecouter:'HOREN', enCours:'LAUFT', installer:'RM Installieren', installDesc:'Schnellzugriff', unesTitle:'KIOSK', unesDesc:'Titelseiten' },
  ar: { accueil:'الرئيسية', lire:'اقرأ', retour:'رجوع', flash:'عاجل', direct:'مباشر', categories:'الفئات', contact:'اتصل بنا', newsletter:'النشرة', ok:'حسنا', charger:'تحميل...', slogan1:"قريب جدا من الخبر", slogan2:"شاهد تحقق أبلغ", search:'بحث...', liveTitle:'مباشر', liveDesc:'تابع البث', chat:'دردشة', abonner:'اشترك', podcastTitle:'بودكاست', podcastDesc:'استمع', ecouter:'استمع', enCours:'قيد التشغيل', installer:'ثبت RM', installDesc:'وصول سريع', unesTitle:'كشك', unesDesc:'الصفحات الأولى' },
  zh: { accueil:'首页', lire:'阅读', retour:'返回', flash:'快讯', direct:'直播', categories:'分类', contact:'联系', newsletter:'通讯', ok:'确定', charger:'加载中...', slogan1:"离资讯如此之近", slogan2:"看见 核实 告知", search:'搜索...', liveTitle:'直播', liveDesc:'来自洛美的直播', chat:'聊天', abonner:'订阅', podcastTitle:'播客', podcastDesc:'收听', ecouter:'收听', enCours:'正在播放', installer:'安装 RM', installDesc:'快速访问', unesTitle:'报亭', unesDesc:'头版' },
}

const CATS = ['ACCUEIL','POLITIQUE','CULTURE','SOCIETE','SANTE','SPORT','ENVIRONNEMENT','INTERNATIONAL','ESPACE BUSINESS','KIOSQUE']

function getYoutubeIdRaw(url){
  if(!url) return null
  if(url.includes('embed/')) return url.split('embed/')[1]?.split('?')[0]?.split('&')[0]
  let id=url.split('v=')[1]; if(!id) id=url.split('youtu.be/')[1]
  if(id) id=id.split('&')[0].split('?')[0]
  return id||null
}
const getYoutubeThumb = (url) => { const id=getYoutubeIdRaw(url); return id? 'https://img.youtube.com/vi/'+id+'/hqdefault.jpg':null }
const getYoutubeEmbed = (url) => { const id=getYoutubeIdRaw(url); return id? 'https://www.youtube.com/embed/'+id:url }

function InstallBanner({deferredPrompt, setDeferredPrompt, T}){
  const [show,setShow]=useState(false)
  useEffect(()=>{ if(deferredPrompt){ const t=setTimeout(()=>setShow(true),5000); return()=>clearTimeout(t) } },[deferredPrompt])
  if(!show||!deferredPrompt) return null
  return (
    <div style={{position:'fixed', bottom:16, left:12, right:12, background:'#0f2040', color:'white', padding:'12px 14px', borderRadius:14, display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 10px 30px rgba(0,0,0,0.5)', zIndex:99999, border:'2px solid #ffcc00'}}>
      <div style={{display:'flex', alignItems:'center', gap:10}}><img src="/logo.png" style={{width:42,height:42,borderRadius:'50%'}} alt="" /><div><div style={{fontWeight:900,fontSize:13}}>{T.installer}</div><div style={{fontSize:10,opacity:0.8}}>{T.installDesc}</div></div></div>
      <div style={{display:'flex',gap:8,alignItems:'center'}}><button onClick={()=>setShow(false)} style={{background:'transparent',color:'white',border:0,fontSize:11,opacity:0.7}}>Plus tard</button><button onClick={async()=>{ deferredPrompt.prompt(); const {outcome}=await deferredPrompt.userChoice; if(outcome==='accepted'){ setShow(false); setDeferredPrompt(null) } }} style={{background:'#ffcc00',color:'black',border:0,padding:'10px 16px',borderRadius:10,fontWeight:900,fontSize:12}}>INSTALLER</button></div>
    </div>
  )
}

function RenderBlocks({blocks, content, gallery, audio}){
  if(blocks && Array.isArray(blocks) && blocks.length>0){
    return (
      <div style={{display:'flex',flexDirection:'column',gap:18}}>
        {blocks.map((b,i)=>{
          if(b.type==='text') return <div key={i} style={{color:'white',fontSize:17,lineHeight:1.9,whiteSpace:'pre-wrap',fontFamily:'Inter, Georgia, serif'}}>{b.content}</div>
          if(b.type==='image') return <div key={i}><img loading="lazy" src={b.url} style={{width:'100%',borderRadius:10,display:'block'}} alt="" />{b.caption&&<div style={{fontSize:12,fontStyle:'italic',color:'rgba(255,255,255,0.6)',marginTop:6}}>{b.caption}</div>}</div>
          if(b.type==='audio') return <div key={i} style={{background:'rgba(255,204,0,0.15)',border:'1px solid rgba(255,204,0,0.4)',padding:14,borderRadius:10}}><div style={{fontSize:11,fontWeight:900,color:'#ffcc00',marginBottom:6}}>Audio {b.title||''}</div><audio controls src={b.url} style={{width:'100%'}} />{b.caption&&<div style={{fontSize:11,color:'rgba(255,255,255,0.6)',marginTop:6}}>{b.caption}</div>}</div>
          if(b.type==='youtube'||b.type==='video'){ const isYt=b.url?.includes('youtube')||b.url?.includes('youtu.be'); return <div key={i} style={{borderRadius:10,overflow:'hidden',background:'black'}}>{isYt? <div style={{position:'relative',paddingBottom:'56.25%',height:0}}><iframe src={getYoutubeEmbed(b.url)} style={{position:'absolute',inset:0,width:'100%',height:'100%',border:0}} allowFullScreen loading="lazy" /></div>: <video controls src={b.url} style={{width:'100%'}} />}{b.caption&&<div style={{padding:'8px 12px',fontSize:12,color:'rgba(255,255,255,0.6)',background:'rgba(0,0,0,0.3)'}}>{b.caption}</div>}</div> }
          return null
        })}
      </div>
    )
  }
  return (<><div style={{color:'white',fontSize:17,lineHeight:1.9,whiteSpace:'pre-wrap',fontFamily:'Inter, Georgia, serif'}}>{content}</div>{audio&&<div style={{marginTop:16}}><audio controls src={audio} style={{width:'100%'}} /></div>}{gallery&&gallery.length>0&&<div style={{display:'flex',flexDirection:'column',gap:12,marginTop:20}}>{gallery.map((it,i)=>(<div key={i}>{it.type==='video'?(it.url.includes('youtube')||it.url.includes('youtu.be')? <div style={{position:'relative',paddingBottom:'56.25%',height:0,background:'black',borderRadius:10,overflow:'hidden'}}><iframe src={getYoutubeEmbed(it.url)} style={{position:'absolute',inset:0,width:'100%',height:'100%',border:0}} allowFullScreen loading="lazy" /></div>:<video controls src={it.url} style={{width:'100%',borderRadius:10}} />):<img loading="lazy" src={it.url} style={{width:'100%',borderRadius:10}} alt="" />}{it.caption&&<div style={{fontSize:12,fontStyle:'italic',color:'rgba(255,255,255,0.6)',marginTop:4}}>{it.caption}</div>}</div>))}</div>}</>)
}

const HeroCarousel = React.memo(function HeroCarousel({items, openArticle, T, allItems}){
  const [idx, setIdx] = useState(0); const [hover, setHover] = useState(false);
  const safeItems = (items||[]).filter(a=>a&&(a.image||(a.gallery&&a.gallery[0]&&a.gallery[0].url)||getYoutubeThumb(a.video||''))).map(a=>{ if(!a.image){ if(a.gallery&&a.gallery[0]&&a.gallery[0].url){ a={...a, image: a.gallery[0].url.includes('youtube')||a.gallery[0].url.includes('youtu.be')? (getYoutubeThumb(a.gallery[0].url)||''):a.gallery[0].url } } else if(a.video){ a={...a, image: getYoutubeThumb(a.video)||''} } } return a; });
  useEffect(()=>{ if(hover||safeItems.length<=1) return; const id=setInterval(()=>setIdx(i=>(i+1)%safeItems.length),4500); return()=>clearInterval(id) },[safeItems.length, hover]);
  if(!safeItems.length){ const fb=(items||[])[0]; if(fb&&fb.image){ return (<div className="hero-main" style={{position:'relative',overflow:'hidden',minHeight:360,height:360,display:'flex',flexDirection:'column',justifyContent:'flex-end',padding:'24px'}}><img src={fb.image} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}} alt="" loading="lazy" /><div style={{position:'absolute',inset:0,background:'linear-gradient(rgba(46,79,176,0.15), rgba(46,79,176,0.92))'}}></div><div style={{position:'relative',zIndex:1}}><span style={{background:'#d4ff00',color:'black',padding:'5px 10px',borderRadius:4,fontWeight:900,fontSize:10}}> {fb.category}</span><h1 style={{fontSize:28,lineHeight:1.05,margin:'12px 0',fontWeight:900,maxWidth:600,color:'white'}}>{fb.title}</h1><button onClick={()=>{ if(allItems[0]) openArticle(allItems[0]) }} style={{background:'#ffcc00',border:0,padding:'11px 20px',borderRadius:6,fontWeight:900,marginTop:12,width:'fit-content',color:'#0d1b4a',cursor:'pointer'}}>{T.lire}</button></div></div>); } return <div style={{flex:'0 0 68%',padding:40,color:'white'}}>Chargement...</div>; }
  const current=safeItems[idx]||safeItems[0]; const isVideo=(current.video&&(current.video.includes('youtube')||current.video.includes('youtu.be')))||(current.gallery&&current.gallery[0]&&(current.gallery[0].type==='video'||current.gallery[0].url?.includes('youtube')||current.gallery[0].url?.includes('youtu.be')));
  return (<div className="hero-main" onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)} style={{position:'relative',overflow:'hidden',background:'#000',minHeight:360,height:360}}><img src={current.image||''} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}} alt="" /><div style={{position:'absolute',inset:0,background:'linear-gradient(rgba(46,79,176,0.15), rgba(46,79,176,0.88))'}}></div>{isVideo&&<div style={{position:'absolute',top:20,right:20,background:'rgba(255,0,0,0.85)',color:'white',padding:'4px 8px',borderRadius:4,fontSize:10,fontWeight:900,zIndex:2}}>VIDEO</div>}<div style={{position:'relative',zIndex:1,display:'flex',flexDirection:'column',justifyContent:'flex-end',padding:'22px 24px',height:'100%',boxSizing:'border-box',minHeight:360}}><span style={{background:'#d4ff00',color:'black',padding:'5px 10px',borderRadius:4,fontWeight:900,fontSize:10,width:'fit-content'}}> {current.category}</span><h1 style={{fontSize:28,lineHeight:1.08,margin:'12px 0',fontWeight:900,maxWidth:620,color:'white',textShadow:'0 2px 12px rgba(0,0,0,0.6)'}}>{current.title}</h1><button onClick={()=>{ const orig=allItems[idx]||allItems[0]; if(orig) openArticle(orig) }} style={{background:'#ffcc00',border:0,padding:'10px 18px',borderRadius:6,fontWeight:900,marginTop:10,width:'fit-content',color:'#0d1b4a',cursor:'pointer'}}>{T.lire}</button></div>{hover&&<><button onClick={()=>setIdx(p=>p>0?p-1:safeItems.length-1)} style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',background:'transparent',border:0,color:'white',fontSize:38,fontWeight:300,cursor:'pointer',zIndex:2,textShadow:'0 2px 8px rgba(0,0,0,0.8)',lineHeight:1}}>‹</button><button onClick={()=>setIdx(p=>p<safeItems.length-1?p+1:0)} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'transparent',border:0,color:'white',fontSize:38,fontWeight:300,cursor:'pointer',zIndex:2,textShadow:'0 2px 8px rgba(0,0,0,0.8)',lineHeight:1}}>›</button></>}</div>)
})

export default function App(){
  if(typeof window!=='undefined'&&window.location.pathname==='/admin') return <Admin />
  const [lang,setLang]=useState(()=>{ if(typeof window==='undefined') return 'fr'; return localStorage.getItem('rius_lang')||'fr' })
  const [articles,setArticles]=useState([]); const [flashes,setFlashes]=useState([]); const [annonces,setAnnonces]=useState([]); const [pubs,setPubs]=useState([]); const [unes,setUnes]=useState([]); const [selectedUne,setSelectedUne]=useState(null); const [currentPub,setCurrentPub]=useState(0); const [actif,setActif]=useState('ACCUEIL'); const [meteo,setMeteo]=useState({temp:'32C',icon:'Soleil'}); const [dateJour,setDateJour]=useState(''); const [heureTU,setHeureTU]=useState(''); const [deferredPrompt,setDeferredPrompt]=useState(null); const [selected,setSelected]=useState(null); const [newsletterEmail,setNewsletterEmail]=useState(''); const [contactForm,setContactForm]=useState({name:'',email:'',subject:'',message:''}); const [contactStatus,setContactStatus]=useState(''); const [translatedCache,setTranslatedCache]=useState({}); const [searchTerm,setSearchTerm]=useState(''); const [searchHistory,setSearchHistory]=useState(()=>{ if(typeof window==='undefined') return []; try{return JSON.parse(localStorage.getItem('rius_search_hist')||'[]')}catch{return []} }); const [currentAudio,setCurrentAudio]=useState(null); const audioRef=useRef(null); const T=UI[lang]||UI.fr

  useEffect(()=>{ const h=(e)=>{ e.preventDefault(); setDeferredPrompt(e) }; window.addEventListener('beforeinstallprompt',h); return()=>window.removeEventListener('beforeinstallprompt',h) },[])
  useEffect(()=>{ if(typeof window==='undefined') return; localStorage.setItem('rius_lang',lang); document.documentElement.dir=lang==='ar'?'rtl':'ltr'; document.documentElement.lang=lang; const locale=lang==='zh'?'zh-CN':lang==='ar'?'ar-EG':lang; const d=new Date().toLocaleDateString(locale,{weekday:'long',day:'numeric',month:'short',year:'numeric'}); setDateJour(d.charAt(0).toUpperCase()+d.slice(1)) },[lang])
  useEffect(()=>{ const up=()=>{ const now=new Date(); const h=now.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit',timeZone:'UTC'}); setHeureTU(h+' TU') }; up(); const id=setInterval(up,60000); return()=>clearInterval(id) },[])
  useEffect(()=>{ 
    fetch('https://api.open-meteo.com/v1/forecast?latitude=6.1319&longitude=1.2228&current=temperature_2m,weather_code&timezone=Africa/Lome').then(r=>r.json()).then(data=>{ const temp=Math.round(data.current.temperature_2m); const code=data.current.weather_code; let icon='Soleil'; if(code>1&&code<4) icon='Nuage'; if(code>=45) icon='Brouillard'; if(code>=51) icon='Pluie'; if(code>=95) icon='Orage'; setMeteo({temp:temp+'C',icon}) }).catch(()=>{}); 
    if(!supabaseUrl || !supabaseKey) return;
    fetch(supabaseUrl+'/rest/v1/articles?select=*&order=id.desc',{headers:{'apikey':supabaseKey,'Authorization':'Bearer '+supabaseKey}}).then(r=>r.json()).then(d=>{ if(Array.isArray(d)) setArticles(d) }); 
    fetch(supabaseUrl+'/rest/v1/flash?select=*&active=eq.true&order=created_at.desc&limit=15',{headers:{'apikey':supabaseKey,'Authorization':'Bearer '+supabaseKey}}).then(r=>r.json()).then(d=>{ if(Array.isArray(d)&&d.length>0) setFlashes(d.map(x=>x.text)) }).catch(()=>{}); 
    fetch(supabaseUrl+'/rest/v1/annonces_blanches?select=*&active=eq.true&order=created_at.desc&limit=15',{headers:{'apikey':supabaseKey,'Authorization':'Bearer '+supabaseKey}}).then(r=>r.json()).then(d=>{ if(Array.isArray(d)&&d.length>0) setAnnonces(d.map(x=>x.text)) }).catch(()=>{}); 
    fetch(supabaseUrl+'/rest/v1/pubs?select=*&active=eq.true&order=created_at.desc',{headers:{'apikey':supabaseKey,'Authorization':'Bearer '+supabaseKey}}).then(r=>r.json()).then(d=>{ if(Array.isArray(d)&&d.length>0) setPubs(d) }).catch(()=>{});
    fetch(supabaseUrl+'/rest/v1/unes?select=*&order=date.desc&limit=50',{headers:{'apikey':supabaseKey,'Authorization':'Bearer '+supabaseKey}}).then(r=>r.json()).then(d=>{ if(Array.isArray(d)&&d.length>0) setUnes(d) }).catch(()=>{});
  },[])
  useEffect(()=>{ if(pubs.length<=1) return; const id=setInterval(()=>setCurrentPub(p=>(p+1)%pubs.length),5000); return()=>clearInterval(id) },[pubs])

  const translateText=async(text,target)=>{ if(!text||target==='fr') return text; try{ const q=encodeURIComponent(text.slice(0,450)); const res=await fetch('https://api.mymemory.translated.net/get?q='+q+'&langpair=fr|'+target); const data=await res.json(); return data?.responseData?.translatedText||text }catch{return text} }
  const getTranslated=(art)=>{ if(!art) return art; if(lang==='fr') return art; if(art.translations&&art.translations[lang]&&art.translations[lang].title){ return {...art,title:art.translations[lang].title,content:art.translations[lang].content||art.content} } if(translatedCache[art.id]?.[lang]){ return {...art,...translatedCache[art.id][lang]} } return art }
  const handleLiveTranslate=async(art)=>{ if(lang==='fr'||art.translations?.[lang]||translatedCache[art.id]?.[lang]) return; const title=await translateText(art.title,lang); const content=await translateText(art.content.slice(0,800),lang); setTranslatedCache(p=>({...p,[art.id]:{...p[art.id],[lang]:{title,content}}})) }
  useEffect(()=>{ if(lang!=='fr'&&articles.length){ articles.slice(0,8).forEach(a=>{ if(!a.translations?.[lang]) handleLiveTranslate(a) }) } },[lang,articles])
  const openArticle=(art)=>{ const td=getTranslated(art); setSelected(td); if(lang!=='fr'&&!art.translations?.[lang]) handleLiveTranslate(art); window.scrollTo(0,0) }
  const handleNewsletter=async()=>{ if(!newsletterEmail) return alert('Mets ton email'); await fetch('https://formsubmit.co/ajax/rius.multimedia@gmail.com',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({_subject:'Newsletter: '+newsletterEmail,email:newsletterEmail})}); alert('Merci!'); setNewsletterEmail('') }
  const handleContact=async(e)=>{ e.preventDefault(); if(!contactForm.name||!contactForm.email||!contactForm.message){ alert('Remplis tous les champs'); return } setContactStatus('Envoi...'); try{ await fetch('https://formsubmit.co/ajax/rius.multimedia@gmail.com',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({_subject:'CONTACT RIUS: '+(contactForm.subject||'Nouveau message'),name:contactForm.name,email:contactForm.email,subject:contactForm.subject,message:contactForm.message})}); setContactStatus('Message envoye avec succes !'); setContactForm({name:'',email:'',subject:'',message:''}); setTimeout(()=>setContactStatus(''),4000) }catch{ setContactStatus('Erreur, reessaie') } }
  const articlesForSearch=searchTerm? articles.filter(a=>{ const q=searchTerm.toLowerCase(); return (a.title?.toLowerCase().includes(q)||a.content?.toLowerCase().includes(q)||a.category?.toLowerCase().includes(q)) }) : articles
  const filteredArticles=actif==='RECHERCHE'? articlesForSearch:articles
  const handleSearch=(term)=>{ const t=term||searchTerm; if(!t.trim()) return; const hist=[t,...searchHistory.filter(h=>h!==t)].slice(0,5); setSearchHistory(hist); try{localStorage.setItem('rius_search_hist',JSON.stringify(hist))}catch{}; setActif('RECHERCHE') }
  const podcastArticles=filteredArticles.filter(a=>a.audio); const articlePrincipal=(actif==='RECHERCHE'? articlesForSearch:filteredArticles)[0]? getTranslated((actif==='RECHERCHE'? articlesForSearch:filteredArticles)[0]):null; const autres=(actif==='RECHERCHE'? articlesForSearch:filteredArticles).slice(1,5).map(getTranslated)
  const flashList=flashes.length? flashes:['Rius Multimedia - '+T.slogan1,'Lome '+meteo.temp+' '+meteo.icon+' - '+dateJour]
  const [commentName,setCommentName]=useState(''); const [commentText,setCommentText]=useState(''); const [comments,setComments]=useState(()=>{ try{ const v=localStorage.getItem('rius_comments'); return v?JSON.parse(v):{} }catch{return{}} })
  const annoncesList=annonces.length? annonces:['EN DIRECT a 20h TU','Emission Speciale Societe vendredi 20h TU','A LIRE : '+(articles[0]?.title||'Actu disponible'),'ESPACE BUSINESS : Votre pub ici']

  if(selected){
    const disp=getTranslated(articles.find(a=>a.id===selected.id)||selected); const readingTime=Math.max(1,Math.ceil((disp.content||'').length/800)); 
    return(
      <div style={{margin:0,fontFamily:'Inter,Arial,sans-serif',background:'#2e4fb0'}}>
        <style>{`*{box-sizing:border-box}html,body{margin:0;padding:0;overflow-x:clip}@keyframes defile{0%{transform:translateX(100%)}100%{transform:translateX(-100%)}}.live-text{animation:defile 120s linear infinite;white-space:nowrap;display:inline-block}.live-text2{animation:defile 90s linear infinite;white-space:nowrap;display:inline-block}.dot{width:8px;height:8px;background:#ff3b3b;border-radius:50%;display:inline-block}.yellow-dot{width:8px;height:8px;background:#ffcc00;border-radius:50%;display:inline-block;flex-shrink:0}`}</style>
        <div style={{position:'sticky',top:0,zIndex:1000,width:'100%'}}><div style={{background:'black',color:'white',padding:'0 10px',fontSize:11,display:'flex',gap:8,alignItems:'center',overflow:'hidden',height:26}}><div style={{display:'flex',alignItems:'center',gap:6,background:'#d4ff00',color:'black',padding:'3px 10px',fontWeight:900,borderRadius:4,flexShrink:0}}><span className="dot"></span> {T.flash}</div><div style={{overflow:'hidden',flex:1}}><div className="live-text" style={{display:'flex',alignItems:'center'}}>{flashList.map((txt,i)=>(<span key={i} style={{display:'inline-flex',alignItems:'center',gap:8,marginRight:36,whiteSpace:'nowrap'}}><span className="yellow-dot"></span>{txt}</span>))}</div></div></div></div>
        <div style={{maxWidth:1280,margin:'0 auto',display:'flex',gap:24,padding:'24px 18px 0'}}><div style={{flex:'1 1 0',minWidth:0,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:12,overflow:'hidden'}}><div style={{padding:'24px 24px 12px'}}><div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}><span style={{background:'#ffcc00',color:'black',padding:'5px 12px',borderRadius:20,fontWeight:900,fontSize:11}}>{disp.category}</span></div><h1 style={{color:'white',fontSize:32,lineHeight:1.15,fontWeight:900,margin:'14px 0 10px'}}>{disp.title}</h1></div>{disp.image && <img src={disp.image} style={{width:'100%',maxHeight:520,objectFit:'cover',display:'block'}} alt="" loading="lazy" />}<div style={{padding:'24px'}}><RenderBlocks blocks={disp.blocks} content={disp.content} gallery={disp.gallery} audio={disp.audio} /></div><div style={{padding:'0 24px 24px'}}><button onClick={()=>setSelected(null)} style={{background:'#ffcc00',border:0,padding:'10px 18px',borderRadius:6,fontWeight:900,cursor:'pointer'}}>{T.retour}</button></div></div></div>
      </div>
    )
  }

  return(
    <div style={{margin:0,fontFamily:'Inter,Arial,sans-serif',background:'#162f6b'}}>
      <style>{`*{box-sizing:border-box}html,body{margin:0;padding:0;overflow-x:clip}@keyframes defile{0%{transform:translateX(100%)}100%{transform:translateX(-100%)}}.live-text{animation:defile 120s linear infinite;white-space:nowrap;display:inline-block}.live-text2{animation:defile 90s linear infinite;white-space:nowrap;display:inline-block}.dot{width:8px;height:8px;background:#ff3b3b;border-radius:50%;display:inline-block}.yellow-dot{width:8px;height:8px;background:#ffcc00;border-radius:50%;display:inline-block}`}</style>
      <div style={{position:'sticky',top:0,zIndex:1000,width:'100%'}}><div style={{background:'black',color:'white',padding:'0 10px',fontSize:11,display:'flex',gap:8,alignItems:'center',overflow:'hidden',height:26}}><div style={{display:'flex',alignItems:'center',gap:6,background:'#d4ff00',color:'black',padding:'3px 10px',fontWeight:900,borderRadius:4,flexShrink:0}}><span className="dot"></span> {T.flash}</div><div style={{overflow:'hidden',flex:1}}><div className="live-text" style={{display:'flex',alignItems:'center'}}>{flashList.map((txt,i)=>(<span key={i} style={{display:'inline-flex',alignItems:'center',gap:8,marginRight:36,whiteSpace:'nowrap'}}><span className="yellow-dot"></span>{txt}</span>))}</div></div></div><header style={{background:'rgba(46,79,176,0.88)',color:'white',height:'88px',padding:'0 22px 0 18px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}><div style={{display:'flex',alignItems:'center',gap:12}}><img src="/logo.png" style={{width:74,height:74,borderRadius:'50%',border:'3px solid rgba(255,255,255,0.9)'}} alt="" /><div><div style={{fontSize:18}}><span>Rius</span><span style={{color:'#ffcc00',fontWeight:900,marginLeft:5}}>Multimedia</span></div><div style={{fontSize:10}}>{T.slogan1}</div></div></div><div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6}}><select value={lang} onChange={e=>setLang(e.target.value)} style={{background:'rgba(0,0,0,0.35)',color:'white',border:'1px solid rgba(255,255,255,0.5)',borderRadius:12,padding:'2px 6px',fontSize:10}}>{Object.entries(LANGS).map(([code,l])=><option key={code} value={code} style={{color:'black'}}>{l.label}</option>)}</select></div></header><div style={{background:'white',color:'#0f2040',fontWeight:900,fontSize:11,display:'flex',alignItems:'center',height:26,overflow:'hidden'}}><div style={{background:'#0f2040',color:'#ffcc00',padding:'0 12px',height:'100%',display:'flex',alignItems:'center'}}>ANNONCES</div><div style={{flex:1,overflow:'hidden',display:'flex',alignItems:'center'}}><div className="live-text2" style={{display:'flex',alignItems:'center',fontWeight:700,color:'#333'}}>{annoncesList.map((txt,i)=>(<span key={i} style={{marginRight:50,whiteSpace:'nowrap'}}>{txt}</span>))}</div></div></div><nav style={{background:'rgba(0,0,0,0.25)',minHeight:32,height:32,display:'flex',alignItems:'center',padding:'0 8px',justifyContent:'space-between'}}><div style={{display:'flex',alignItems:'center',overflowX:'auto'}}>{CATS.map((item,idx)=>(<div key={item} style={{display:'flex',alignItems:'center',flexShrink:0}}><a href="#" onClick={e=>{e.preventDefault();setActif(item)}} style={{color:actif===item?'#ffcc00':'white',textDecoration:'none',padding:'0 7px',fontSize:10,fontWeight:900,whiteSpace:'nowrap',height:32,display:'flex',alignItems:'center',borderBottom:actif===item?'3px solid #ffcc00':'3px solid transparent'}}>{item}</a>{idx<CATS.length-1&&<span style={{color:'rgba(255,255,255,0.5)',fontSize:9,margin:'0 1px'}}>|</span>}</div>))}</div><div style={{display:'flex',alignItems:'center',flexShrink:0,marginLeft:12}}><input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') handleSearch() }} placeholder={T.search} style={{border:'none',outline:'none',fontSize:11,padding:'4px 8px',borderRadius:12}} /><button onClick={()=>handleSearch()} style={{background:'#ffcc00',border:'none',borderRadius:'0 12px 12px 0',height:26,padding:'0 12px',fontWeight:900,fontSize:11,cursor:'pointer',marginLeft:4}}>Search</button></div></nav></div>

      {actif==='ACCUEIL'?(
        <div style={{background:'#2e4fb0',minHeight:'100vh',padding:'20px'}}><h2 style={{color:'white'}}>Accueil - {filteredArticles.length} articles</h2><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>{filteredArticles.slice(0,9).map(a=>{const tc=getTranslated(a); return <div key={a.id} onClick={()=>openArticle(a)} style={{background:'white',cursor:'pointer',borderRadius:10,overflow:'hidden'}}><img src={a.image} loading="lazy" style={{width:'100%',height:150,objectFit:'cover'}} alt="" /><div style={{padding:10,fontWeight:700,fontSize:13}}>{tc.title}</div></div>})}</div></div>
      ): actif==='KIOSQUE'?(
        <div style={{background:'#0f2040',color:'white',minHeight:'100vh',padding:'20px 16px'}}>
          <div style={{maxWidth:1400,margin:'0 auto'}}>
            <h2 style={{color:'#ffcc00',margin:'0 0 6px 0'}}>KIOSQUE - LES UNES DU JOUR</h2>
            <p style={{opacity:0.7,fontSize:12,margin:'0 0 16px 0'}}>{dateJour} - {unes.length||8} Unes disponibles</p>
            {selectedUne && (
              <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.92)',zIndex:10000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setSelectedUne(null)}>
                <div style={{position:'relative',maxWidth:900,width:'100%',background:'#111',borderRadius:12,overflow:'hidden'}} onClick={e=>e.stopPropagation()}>
                  <div style={{display:'flex',justifyContent:'space-between',padding:12,background:'#1a1a1a'}}><span>{selectedUne.journal}</span><button onClick={()=>setSelectedUne(null)} style={{background:'rgba(255,255,255,0.12)',border:0,color:'white',width:32,height:32,borderRadius:'50%',cursor:'pointer'}}>X</button></div>
                  <img src={selectedUne.image} style={{width:'100%',maxHeight:'80vh',objectFit:'contain',background:'white'}} alt="" />
                </div>
              </div>
            )}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:16}}>
              {(unes.length? unes : [
                {id:1,journal:'Rius Quotidien',title:'Politique nationale',date:new Date().toISOString(),image:'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600'},
                {id:2,journal:'Togo Matin',title:'Economie Port Lome',date:new Date().toISOString(),image:'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600'},
                {id:3,journal:'L Union',title:'Societe Education',date:new Date().toISOString(),image:'https://images.unsplash.com/photo-1546422904-90eab23c3d7e?w=600'},
                {id:4,journal:'Le Canard',title:'Sport Eperviers',date:new Date().toISOString(),image:'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=600'},
                {id:5,journal:'Liberte',title:'Culture Festival',date:new Date().toISOString(),image:'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=600'},
                {id:6,journal:'Togo Presse',title:'International CEDEAO',date:new Date().toISOString(),image:'https://images.unsplash.com/photo-1523995462485-3d171b5c8fa9?w=600'},
                {id:7,journal:'Le Messager',title:'Sante Vaccination',date:new Date().toISOString(),image:'https://images.unsplash.com/photo-1557683316-973673baf926?w=600'},
                {id:8,journal:'Forum',title:'Environnement Reboisement',date:new Date().toISOString(),image:'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600'},
              ]).map((une)=>(
                <div key={une.id} onClick={()=>setSelectedUne(une)} style={{background:'white',borderRadius:12,overflow:'hidden',cursor:'pointer'}}>
                  <div style={{position:'relative',background:'#f5f5f5',aspectRatio:'3/4',overflow:'hidden'}}>
                    <img src={une.image} loading="lazy" style={{width:'100%',height:'100%',objectFit:'cover'}} alt="" />
                    <div style={{position:'absolute',top:8,left:8,background:'#0f2040',color:'#ffcc00',padding:'4px 8px',borderRadius:6,fontSize:9,fontWeight:900}}>{une.journal}</div>
                  </div>
                  <div style={{padding:'10px 12px',color:'#0f2040'}}><div style={{fontSize:11,fontWeight:800}}>{une.title}</div><div style={{fontSize:10,opacity:0.6}}>{new Date(une.date).toLocaleDateString('fr-FR')}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ):(
        <div style={{padding:'20px 16px',minHeight:400,background:'#0f2040',color:'white'}}><h2>{actif}</h2><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginTop:16}}>{filteredArticles.filter(a=>a.category===actif).map(a=>{const tc=getTranslated(a); return <div key={a.id} onClick={()=>openArticle(a)} style={{background:'white',cursor:'pointer',borderRadius:10,overflow:'hidden',color:'black'}}><img src={a.image} loading="lazy" style={{width:'100%',height:170,objectFit:'cover'}} alt="" /><div style={{padding:10,fontWeight:700,fontSize:13}}>{tc.title}</div></div>})}</div></div>
      )}
    </div>
  )
}
