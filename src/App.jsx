
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
  fr: { accueil:'ACCUEIL', lire:'LIRE', retour:'RETOUR', flash:'FLASH', direct:'EN DIRECT', categories:'CATEGORIES', contact:'CONTACT', newsletter:'NEWSLETTER', ok:'OK', charger:'Chargement...', slogan1:SLOGAN_L1, slogan2:SLOGAN_L2, search:'Rechercher...', liveTitle:'DIRECT RIUS MULTIMEDIA', liveDesc:'Suivez tous nos directs depuis Lome', chat:'Chat en direct', abonner:"S'abonner", podcastTitle:'PODCASTS RIUS', podcastDesc:'Nos emissions audio', ecouter:'ECOUTER', enCours:'EN COURS', installer:'Installer RM', installDesc:'Acces rapide + hors-ligne', unesTitle:'KIOSQUE', unesDesc:'Les Unes du jour' },
  en: { accueil:'HOME', lire:'READ', retour:'BACK', flash:'BREAKING', direct:'LIVE', categories:'CATEGORIES', contact:'CONTACT', newsletter:'NEWSLETTER', ok:'OK', charger:'Loading...', slogan1:"So close to the news", slogan2:"See Verify Inform", search:'Search...', liveTitle:'LIVE RIUS', liveDesc:'Follow our live', chat:'Live chat', abonner:'Subscribe', podcastTitle:'RIUS PODCASTS', podcastDesc:'Listen', ecouter:'PLAY', enCours:'NOW PLAYING', installer:'Install RM', installDesc:'Fast access', unesTitle:'KIOSK', unesDesc:'Front pages' },
}

const CATS = ['ACCUEIL','POLITIQUE','CULTURE','SOCIETE','SANTE','SPORT','ENVIRONNEMENT','INTERNATIONAL','ESPACE BUSINESS','KIOSQUE']

function getYoutubeIdRaw(url){
  if(!url) return null
  if(url.includes('embed/')) return url.split('embed/')[1].split('?')[0].split('&')[0]
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
          if(b.type==='audio') return <div key={i} style={{background:'rgba(255,204,0,0.15)',border:'1px solid rgba(255,204,0,0.4)',padding:14,borderRadius:10}}><div style={{fontSize:11,fontWeight:900,color:'#ffcc00',marginBottom:6}}>Audio</div><audio controls src={b.url} style={{width:'100%'}} /></div>
          if(b.type==='youtube'||b.type==='video'){ const isYt=b.url && (b.url.includes('youtube')||b.url.includes('youtu.be')); return <div key={i} style={{borderRadius:10,overflow:'hidden',background:'black'}}>{isYt? <div style={{position:'relative',paddingBottom:'56.25%',height:0}}><iframe src={getYoutubeEmbed(b.url)} style={{position:'absolute',inset:0,width:'100%',height:'100%',border:0}} allowFullScreen loading="lazy" /></div>: <video controls src={b.url} style={{width:'100%'}} />}</div> }
          return null
        })}
      </div>
    )
  }
  return (
    <>
      <div style={{color:'white',fontSize:17,lineHeight:1.9,whiteSpace:'pre-wrap',fontFamily:'Inter, Georgia, serif'}}>{content}</div>
      {audio&&<div style={{marginTop:16}}><audio controls src={audio} style={{width:'100%'}} /></div>}
      {gallery&&gallery.length>0&&<div style={{display:'flex',flexDirection:'column',gap:12,marginTop:20}}>{gallery.map((it,i)=>(<div key={i}>{it.type==='video'?(it.url.includes('youtube')||it.url.includes('youtu.be')? <div style={{position:'relative',paddingBottom:'56.25%',height:0,background:'black',borderRadius:10,overflow:'hidden'}}><iframe src={getYoutubeEmbed(it.url)} style={{position:'absolute',inset:0,width:'100%',height:'100%',border:0}} allowFullScreen loading="lazy" /></div>:<video controls src={it.url} style={{width:'100%',borderRadius:10}} />):<img loading="lazy" src={it.url} style={{width:'100%',borderRadius:10}} alt="" />}</div>))}</div>}
    </>
  )
}

const HeroCarousel = React.memo(function HeroCarousel({items, openArticle, T, allItems}){
  const [idx, setIdx] = useState(0)
  const [hover, setHover] = useState(false)
  const safeItems = (items||[]).filter(a=>a&&(a.image||(a.gallery&&a.gallery[0]&&a.gallery[0].url)||getYoutubeThumb(a.video||''))).map(a=>{ if(!a.image){ if(a.gallery&&a.gallery[0]&&a.gallery[0].url){ a={...a, image: a.gallery[0].url.includes('youtube')||a.gallery[0].url.includes('youtu.be')? (getYoutubeThumb(a.gallery[0].url)||''):a.gallery[0].url } } else if(a.video){ a={...a, image: getYoutubeThumb(a.video)||''} } } return a; })
  useEffect(()=>{ if(hover||safeItems.length<=1) return; const id=setInterval(()=>setIdx(i=>(i+1)%safeItems.length),4500); return()=>clearInterval(id) },[safeItems.length, hover])
  if(!safeItems.length){
    const fb=(items||[])[0]
    if(fb&&fb.image){
      return (
        <div style={{position:'relative',overflow:'hidden',minHeight:360,height:360,display:'flex',flexDirection:'column',justifyContent:'flex-end',padding:'24px',flex:'0 0 68%'}}>
          <img src={fb.image} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}} alt="" loading="lazy" />
          <div style={{position:'absolute',inset:0,background:'linear-gradient(rgba(46,79,176,0.15), rgba(46,79,176,0.92))'}}></div>
          <div style={{position:'relative',zIndex:1}}>
            <span style={{background:'#d4ff00',color:'black',padding:'5px 10px',borderRadius:4,fontWeight:900,fontSize:10}}>{fb.category}</span>
            <h1 style={{fontSize:28,lineHeight:1.05,margin:'12px 0',fontWeight:900,maxWidth:600,color:'white'}}>{fb.title}</h1>
            <button onClick={()=>{ if(allItems[0]) openArticle(allItems[0]) }} style={{background:'#ffcc00',border:0,padding:'11px 20px',borderRadius:6,fontWeight:900,marginTop:12,width:'fit-content',color:'#0d1b4a',cursor:'pointer'}}>{T.lire}</button>
          </div>
        </div>
      )
    }
    return <div style={{flex:'0 0 68%',padding:40,color:'white'}}>{T.charger}</div>
  }
  const current=safeItems[idx]||safeItems[0]
  const isVideo=(current.video&&(current.video.includes('youtube')||current.video.includes('youtu.be')))||(current.gallery&&current.gallery[0]&&(current.gallery[0].type==='video'||current.gallery[0].url?.includes('youtube')||current.gallery[0].url?.includes('youtu.be')))
  return (
    <div onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)} style={{position:'relative',overflow:'hidden',background:'#000',minHeight:360,height:360,flex:'0 0 68%'}}>
      <img src={current.image||''} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}} alt="" />
      <div style={{position:'absolute',inset:0,background:'linear-gradient(rgba(46,79,176,0.15), rgba(46,79,176,0.88))'}}></div>
      {isVideo&&<div style={{position:'absolute',top:20,right:20,background:'rgba(255,0,0,0.85)',color:'white',padding:'4px 8px',borderRadius:4,fontSize:10,fontWeight:900,zIndex:2}}>VIDEO</div>}
      <div style={{position:'relative',zIndex:1,display:'flex',flexDirection:'column',justifyContent:'flex-end',padding:'22px 24px',height:'100%',boxSizing:'border-box',minHeight:360}}>
        <span style={{background:'#d4ff00',color:'black',padding:'5px 10px',borderRadius:4,fontWeight:900,fontSize:10,width:'fit-content'}}>{current.category}</span>
        <h1 style={{fontSize:28,lineHeight:1.08,margin:'12px 0',fontWeight:900,maxWidth:620,color:'white',textShadow:'0 2px 12px rgba(0,0,0,0.6)'}}>{current.title}</h1>
        <button onClick={()=>{ const orig=allItems[idx]||allItems[0]; if(orig) openArticle(orig) }} style={{background:'#ffcc00',border:0,padding:'10px 18px',borderRadius:6,fontWeight:900,marginTop:10,width:'fit-content',color:'#0d1b4a',cursor:'pointer'}}>{T.lire}</button>
      </div>
      {hover&&<><button onClick={()=>setIdx(p=>p>0?p-1:safeItems.length-1)} style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',background:'transparent',border:0,color:'white',fontSize:38,fontWeight:300,cursor:'pointer',zIndex:2}}>‹</button><button onClick={()=>setIdx(p=>p<safeItems.length-1?p+1:0)} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'transparent',border:0,color:'white',fontSize:38,fontWeight:300,cursor:'pointer',zIndex:2}}>›</button></>}
    </div>
  )
})

export default function App(){
  if(typeof window!=='undefined'&&window.location.pathname==='/admin') return <Admin />
  const [lang,setLang]=useState(()=>{ if(typeof window==='undefined') return 'fr'; return localStorage.getItem('rius_lang')||'fr' })
  const [articles,setArticles]=useState([])
  const [flashes,setFlashes]=useState([])
  const [annonces,setAnnonces]=useState([])
  const [pubs,setPubs]=useState([])
  const [unes,setUnes]=useState([])
  const [selectedUne,setSelectedUne]=useState(null)
  const [currentPub,setCurrentPub]=useState(0)
  const [actif,setActif]=useState('ACCUEIL')
  const [meteo,setMeteo]=useState({temp:'32°C',icon:'Soleil'})
  const [dateJour,setDateJour]=useState('')
  const [heureTU,setHeureTU]=useState('')
  const [deferredPrompt,setDeferredPrompt]=useState(null)
  const [selected,setSelected]=useState(null)
  const [newsletterEmail,setNewsletterEmail]=useState('')
  const [contactForm,setContactForm]=useState({name:'',email:'',subject:'',message:''})
  const [contactStatus,setContactStatus]=useState('')
  const [translatedCache,setTranslatedCache]=useState({})
  const [searchTerm,setSearchTerm]=useState('')
  const [currentAudio,setCurrentAudio]=useState(null)
  const audioRef=useRef(null)
  const T=UI[lang]||UI.fr

  useEffect(()=>{ const h=(e)=>{ e.preventDefault(); setDeferredPrompt(e) }; window.addEventListener('beforeinstallprompt',h); return()=>window.removeEventListener('beforeinstallprompt',h) },[])
  useEffect(()=>{ if(typeof window==='undefined') return; localStorage.setItem('rius_lang',lang); document.documentElement.lang=lang },[lang])
  useEffect(()=>{ const up=()=>{ const now=new Date(); const h=now.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit',timeZone:'UTC'}); setHeureTU(h+' TU') }; up(); const id=setInterval(up,60000); return()=>clearInterval(id) },[])
  useEffect(()=>{
    if(!supabaseUrl || !supabaseKey) return
    fetch(supabaseUrl+'/rest/v1/articles?select=*&order=id.desc',{headers:{'apikey':supabaseKey,'Authorization':'Bearer '+supabaseKey}}).then(r=>r.json()).then(d=>{ if(Array.isArray(d)) setArticles(d) })
    fetch(supabaseUrl+'/rest/v1/flash?select=*&active=eq.true&order=created_at.desc&limit=15',{headers:{'apikey':supabaseKey,'Authorization':'Bearer '+supabaseKey}}).then(r=>r.json()).then(d=>{ if(Array.isArray(d)&&d.length>0) setFlashes(d.map(x=>x.text)) }).catch(()=>{})
    fetch(supabaseUrl+'/rest/v1/annonces_blanches?select=*&active=eq.true&order=created_at.desc&limit=15',{headers:{'apikey':supabaseKey,'Authorization':'Bearer '+supabaseKey}}).then(r=>r.json()).then(d=>{ if(Array.isArray(d)&&d.length>0) setAnnonces(d.map(x=>x.text)) }).catch(()=>{})
    fetch(supabaseUrl+'/rest/v1/pubs?select=*&active=eq.true&order=created_at.desc',{headers:{'apikey':supabaseKey,'Authorization':'Bearer '+supabaseKey}}).then(r=>r.json()).then(d=>{ if(Array.isArray(d)&&d.length>0) setPubs(d) }).catch(()=>{})
    fetch(supabaseUrl+'/rest/v1/unes?select=*&order=date.desc&limit=50',{headers:{'apikey':supabaseKey,'Authorization':'Bearer '+supabaseKey}}).then(r=>r.json()).then(d=>{ if(Array.isArray(d)&&d.length>0) setUnes(d) }).catch(()=>{})
  },[])
  useEffect(()=>{ if(pubs.length<=1) return; const id=setInterval(()=>setCurrentPub(p=>(p+1)%pubs.length),5000); return()=>clearInterval(id) },[pubs])

  const getTranslated=(art)=>{ if(!art) return art; if(lang==='fr') return art; if(art.translations&&art.translations[lang]&&art.translations[lang].title){ return {...art,title:art.translations[lang].title,content:art.translations[lang].content||art.content} } if(translatedCache[art.id]?.[lang]){ return {...art,...translatedCache[art.id][lang]} } return art }
  const openArticle=(art)=>{ const td=getTranslated(art); setSelected(td); window.scrollTo(0,0) }
  const handleNewsletter=async()=>{ if(!newsletterEmail) return alert('Mets ton email'); await fetch('https://formsubmit.co/ajax/rius.multimedia@gmail.com',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({_subject:'Newsletter: '+newsletterEmail,email:newsletterEmail})}); alert('Merci!'); setNewsletterEmail('') }
  const handleContact=async(e)=>{ e.preventDefault(); if(!contactForm.name||!contactForm.email||!contactForm.message){ alert('Remplis tous les champs'); return } setContactStatus('Envoi...'); try{ await fetch('https://formsubmit.co/ajax/rius.multimedia@gmail.com',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({_subject:'CONTACT RIUS: '+(contactForm.subject||'Nouveau message'),name:contactForm.name,email:contactForm.email,subject:contactForm.subject,message:contactForm.message})}); setContactStatus('Message envoye!'); setContactForm({name:'',email:'',subject:'',message:''}); setTimeout(()=>setContactStatus(''),4000) }catch{ setContactStatus('Erreur') } }
  const handleSearch=()=>{ if(!searchTerm.trim()) return; setActif('RECHERCHE') }

  const articlesForSearch=searchTerm? articles.filter(a=>{ const q=searchTerm.toLowerCase(); return (a.title?.toLowerCase().includes(q)||a.content?.toLowerCase().includes(q)||a.category?.toLowerCase().includes(q)) }) : articles
  const filteredArticles=actif==='RECHERCHE'? articlesForSearch:articles
  const podcastArticles=filteredArticles.filter(a=>a.audio)
  const autres=(actif==='RECHERCHE'? articlesForSearch:filteredArticles).slice(1,5).map(getTranslated)
  const flashList=flashes.length? flashes:['Rius Multimedia - '+T.slogan1,'Lome '+meteo.temp+' - '+dateJour]
  const annoncesList=annonces.length? annonces:['EN DIRECT a 20h TU','Emission Speciale vendredi 20h TU','A LIRE : '+(articles[0]?.title||'Actu disponible')]

  if(selected){
    const disp=getTranslated(articles.find(a=>a.id===selected.id)||selected)
    return (
      <div style={{margin:0,fontFamily:'Inter,Arial,sans-serif',background:'#2e4fb0',minHeight:'100vh'}}>
        <div style={{background:'black',color:'white',padding:'6px 10px',fontSize:11,display:'flex',gap:8,alignItems:'center',height:26}}>
          <div style={{background:'#d4ff00',color:'black',padding:'3px 10px',fontWeight:900,borderRadius:4}}>{T.flash}</div>
          <div style={{flex:1,overflow:'hidden'}}>{flashList[0]}</div>
        </div>
        <div style={{maxWidth:1280,margin:'0 auto',padding:'24px 18px'}}>
          <div style={{background:'rgba(255,255,255,0.06)',borderRadius:12,overflow:'hidden',padding:24}}>
            <span style={{background:'#ffcc00',color:'black',padding:'5px 12px',borderRadius:20,fontWeight:900,fontSize:11}}>{disp.category}</span>
            <h1 style={{color:'white',fontSize:32,fontWeight:900,marginTop:14}}>{disp.title}</h1>
            {disp.image && <img src={disp.image} style={{width:'100%',maxHeight:520,objectFit:'cover',marginTop:16,borderRadius:10}} alt="" loading="lazy" />}
            <div style={{marginTop:20}}><RenderBlocks blocks={disp.blocks} content={disp.content} gallery={disp.gallery} audio={disp.audio} /></div>
            <button onClick={()=>setSelected(null)} style={{background:'#ffcc00',border:0,padding:'10px 18px',borderRadius:6,fontWeight:900,marginTop:20,cursor:'pointer'}}>{T.retour}</button>
          </div>
        </div>
        <InstallBanner deferredPrompt={deferredPrompt} setDeferredPrompt={setDeferredPrompt} T={T} />
      </div>
    )
  }

  return (
    <div style={{margin:0,fontFamily:'Inter,Arial,sans-serif',background:'#162f6b',minHeight:'100vh'}}>
      <div style={{position:'sticky',top:0,zIndex:1000,width:'100%'}}>
        <div style={{background:'black',color:'white',padding:'0 10px',fontSize:11,display:'flex',gap:8,alignItems:'center',height:26}}>
          <div style={{background:'#d4ff00',color:'black',padding:'3px 10px',fontWeight:900,borderRadius:4}}>{T.flash}</div>
          <div style={{flex:1,overflow:'hidden',whiteSpace:'nowrap'}}>{flashList.join('  |  ')}</div>
        </div>
        <header style={{background:'rgba(46,79,176,0.95)',color:'white',height:88,padding:'0 18px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,borderBottom:'1px solid rgba(255,255,255,0.15)'}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <img src="/logo.png" style={{width:74,height:74,borderRadius:'50%',border:'3px solid white'}} alt="" />
            <div><div style={{fontSize:18}}><span style={{fontFamily:'cursive'}}>Rius</span><span style={{color:'#ffcc00',fontWeight:900,marginLeft:5}}>Multimedia</span></div><div style={{fontSize:10}}>{T.slogan1}</div></div>
          </div>
          <div style={{flex:1,display:'flex',justifyContent:'center',padding:'0 12px'}}>
            {pubs.length>0? <a href={pubs[currentPub]?.link||'#'} target="_blank" rel="noreferrer" style={{maxWidth:728,height:76,background:'white',borderRadius:6,overflow:'hidden',display:'block',width:'100%'}}><img src={pubs[currentPub]?.image} style={{width:'100%',height:'100%',objectFit:'cover'}} alt="" /></a> : <div style={{maxWidth:728,height:76,background:'rgba(0,0,0,0.2)',borderRadius:6,width:'100%'}}></div>}
          </div>
          <select value={lang} onChange={e=>setLang(e.target.value)} style={{background:'rgba(0,0,0,0.35)',color:'white',border:'1px solid rgba(255,255,255,0.5)',borderRadius:12,padding:'2px 6px',fontSize:10}}>{Object.entries(LANGS).map(([c,l])=><option key={c} value={c} style={{color:'black'}}>{l.label}</option>)}</select>
        </header>
        <div style={{background:'white',color:'#0f2040',fontWeight:900,fontSize:11,display:'flex',alignItems:'center',height:26}}>
          <div style={{background:'#0f2040',color:'#ffcc00',padding:'0 12px',height:'100%',display:'flex',alignItems:'center'}}>ANNONCES</div>
          <div style={{flex:1,overflow:'hidden',paddingLeft:10}}>{annoncesList.join('  |  ')}</div>
          <div style={{padding:'0 12px',fontSize:10,background:'#f8f8f8',height:'100%',display:'flex',alignItems:'center',gap:10}}><span>Lome {meteo.temp}</span><span style={{background:'#0f2040',color:'#ffcc00',padding:'3px 10px',borderRadius:10}}>{heureTU}</span></div>
        </div>
        <nav style={{background:'rgba(0,0,0,0.4)',minHeight:32,height:32,display:'flex',alignItems:'center',padding:'0 8px',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',overflowX:'auto',gap:2}}>
            {CATS.map((item)=>(
              <a key={item} href="#" onClick={(e)=>{e.preventDefault();setActif(item)}} style={{color:actif===item?'#ffcc00':'white',textDecoration:'none',padding:'0 7px',fontSize:10,fontWeight:900,whiteSpace:'nowrap',height:32,display:'flex',alignItems:'center',borderBottom:actif===item?'3px solid #ffcc00':'3px solid transparent'}}>{item}</a>
            ))}
            <span style={{color:'rgba(255,255,255,0.5)',margin:'0 4px'}}>|</span>
            <a href="#" onClick={(e)=>{e.preventDefault();setActif('DIRECT')}} style={{color:'#ff3b3b',textDecoration:'none',padding:'0 7px',fontSize:10,fontWeight:900,height:32,display:'flex',alignItems:'center',borderBottom:actif==='DIRECT'?'3px solid #ff3b3b':'3px solid transparent'}}>DIRECT</a>
            <a href="#" onClick={(e)=>{e.preventDefault();setActif('PODCAST')}} style={{color:'#a8ff00',textDecoration:'none',padding:'0 7px',fontSize:10,fontWeight:900,height:32,display:'flex',alignItems:'center',marginLeft:6,borderBottom:actif==='PODCAST'?'3px solid #a8ff00':'3px solid transparent'}}>PODCAST</a>
            <a href="#" onClick={(e)=>{e.preventDefault();setActif('CONTACT')}} style={{color:'#ffcc00',textDecoration:'none',padding:'0 7px',fontSize:10,fontWeight:900,height:32,display:'flex',alignItems:'center',marginLeft:6,borderBottom:actif==='CONTACT'?'3px solid #ffcc00':'3px solid transparent'}}>CONTACT</a>
          </div>
          <div style={{display:'flex',alignItems:'center',flexShrink:0,marginLeft:12}}>
            <input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') handleSearch() }} placeholder={T.search} style={{border:'none',outline:'none',fontSize:11,padding:'4px 8px',borderRadius:'12px 0 0 12px',width:140}} />
            <button onClick={()=>handleSearch()} style={{background:'#ffcc00',border:'none',borderRadius:'0 12px 12px 0',height:24,padding:'0 10px',fontWeight:900,fontSize:11,cursor:'pointer'}}>Search</button>
          </div>
        </nav>
      </div>

      <InstallBanner deferredPrompt={deferredPrompt} setDeferredPrompt={setDeferredPrompt} T={T} />

      {actif==='ACCUEIL' && (
        <div style={{background:'#2e4fb0',minHeight:'100vh'}}>
          <div style={{display:'flex',width:'100%',minHeight:360,height:360,alignItems:'stretch'}}>
            {filteredArticles[0] ? <HeroCarousel items={filteredArticles.slice(0,5).map(getTranslated)} openArticle={openArticle} T={T} allItems={filteredArticles} /> : <div style={{flex:'0 0 68%',padding:40,color:'white'}}>{T.charger}</div>}
            <div style={{flex:'0 0 32%',background:'#132a56',borderLeft:'1px solid rgba(255,255,255,0.1)',display:'flex',flexDirection:'column',padding:'4px 8px',height:360,justifyContent:'space-between'}}>
              {autres.map((a,i)=>{ const orig=filteredArticles[i+1]; if(!orig) return null; const img=a.image||getYoutubeThumb(orig.video)||''; return (
                <div key={i} onClick={()=>openArticle(orig)} style={{display:'flex',gap:10,padding:'6px',borderBottom:'1px solid rgba(255,255,255,0.12)',cursor:'pointer',alignItems:'center',flex:1}}>
                  <div style={{width:84,height:52,borderRadius:4,overflow:'hidden',background:'#000',flexShrink:0}}>{img&&<img src={img} style={{width:'100%',height:'100%',objectFit:'cover'}} alt="" loading="lazy" />}</div>
                  <div style={{flex:1,minWidth:0}}><div style={{fontSize:9,color:'#ffcc00',fontWeight:900}}>{a.category}</div><div style={{fontSize:12,fontWeight:700,color:'white',lineHeight:1.25,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{a.title}</div></div>
                </div>
              )})}
            </div>
          </div>
          <div style={{maxWidth:1400,margin:'0 auto',padding:'28px 18px 40px'}}>
            <h2 style={{color:'#00d4ff',fontSize:20,fontWeight:900,margin:'0 0 18px 0'}}>Reportages et analyses</h2>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3, 1fr)',gap:'22px 18px'}}>
              {filteredArticles.slice(5,26).map((c,i)=>{ const tc=getTranslated(c); const img=tc.image||getYoutubeThumb(c.video)||''; const excerpt=(tc.content||'').replace(/<[^>]*>/g,'').substring(0,135); return (
                <div key={i} onClick={()=>openArticle(c)} style={{cursor:'pointer',display:'flex',flexDirection:'column'}}>
                  <div style={{position:'relative',width:'100%',aspectRatio:'16/9',background:'#0a1a3a',borderRadius:6,overflow:'hidden'}}>{img&&<img src={img} style={{width:'100%',height:'100%',objectFit:'cover'}} alt="" loading="lazy" />}</div>
                  <div style={{padding:'10px 0 0 0'}}><div style={{fontSize:10,fontWeight:800,color:'rgba(255,255,255,0.7)',textTransform:'uppercase',marginBottom:6}}><span style={{color:'#ffcc00'}}>{tc.category}</span> | {c.created_at? new Date(c.created_at).toLocaleDateString('fr-FR'):''}</div><h3 style={{color:'white',fontSize:16.5,fontWeight:900,lineHeight:1.25,margin:'0 0 6px 0'}}>{tc.title}</h3><p style={{color:'rgba(255,255,255,0.7)',fontSize:12.5,lineHeight:1.45,margin:0}}>{excerpt}...</p></div>
                </div>
              )})}
            </div>
          </div>
        </div>
      )}

      {actif==='KIOSQUE' && (
        <div style={{background:'#0f2040',color:'white',minHeight:'100vh',padding:'20px 16px'}}>
          <div style={{maxWidth:1400,margin:'0 auto'}}>
            <h2 style={{color:'#ffcc00',margin:'0 0 6px 0'}}>KIOSQUE - LES UNES DU JOUR</h2>
            <p style={{opacity:0.7,fontSize:12,margin:'0 0 16px 0'}}>Kiosque presse - {new Date().toLocaleDateString('fr-FR')} - {unes.length||8} Unes</p>
            {selectedUne && (
              <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.92)',zIndex:10000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setSelectedUne(null)}>
                <div style={{maxWidth:900,width:'100%',background:'#111',borderRadius:12,overflow:'hidden'}} onClick={e=>e.stopPropagation()}>
                  <div style={{display:'flex',justifyContent:'space-between',padding:12,background:'#1a1a1a'}}><span>{selectedUne.journal}</span><button onClick={()=>setSelectedUne(null)} style={{background:'rgba(255,255,255,0.12)',border:0,color:'white',width:32,height:32,borderRadius:'50%',cursor:'pointer'}}>X</button></div>
                  <img src={selectedUne.image} style={{width:'100%',maxHeight:'80vh',objectFit:'contain',background:'white'}} alt="" />
                </div>
              </div>
            )}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:16}}>
              {(unes.length? unes : [
                {id:1,journal:'Rius Quotidien',title:'Politique nationale a la Une',date:new Date().toISOString(),image:'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600'},
                {id:2,journal:'Togo Matin',title:'Economie Port de Lome',date:new Date().toISOString(),image:'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600'},
                {id:3,journal:'L Union',title:'Societe Education',date:new Date().toISOString(),image:'https://images.unsplash.com/photo-1546422904-90eab23c3d7e?w=600'},
                {id:4,journal:'Le Canard',title:'Sport Eperviers',date:new Date().toISOString(),image:'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=600'},
                {id:5,journal:'Liberte',title:'Culture Festival',date:new Date().toISOString(),image:'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=600'},
                {id:6,journal:'Togo Presse',title:'International CEDEAO',date:new Date().toISOString(),image:'https://images.unsplash.com/photo-1523995462485-3d171b5c8fa9?w=600'},
              ]).map((une)=>(
                <div key={une.id} onClick={()=>setSelectedUne(une)} style={{background:'white',borderRadius:12,overflow:'hidden',cursor:'pointer'}}>
                  <div style={{position:'relative',aspectRatio:'3/4',background:'#f5f5f5'}}><img src={une.image} loading="lazy" style={{width:'100%',height:'100%',objectFit:'cover'}} alt="" /><div style={{position:'absolute',top:8,left:8,background:'#0f2040',color:'#ffcc00',padding:'4px 8px',borderRadius:6,fontSize:9,fontWeight:900}}>{une.journal}</div></div>
                  <div style={{padding:'10px 12px',color:'#0f2040'}}><div style={{fontSize:11,fontWeight:800}}>{une.title}</div><div style={{fontSize:10,opacity:0.6}}>{new Date(une.date).toLocaleDateString('fr-FR')}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {actif==='DIRECT' && (
        <div style={{background:'#0f2040',color:'white',minHeight:'100vh',padding:20}}><h2 style={{color:'#ff3b3b'}}>DIRECT RIUS MULTIMEDIA</h2><div style={{marginTop:16,background:'black',borderRadius:12,overflow:'hidden',border:'2px solid #ff3b3b'}}><iframe width="100%" height="520" src={'https://www.youtube.com/embed/live_stream?channel='+YOUTUBE_CHANNEL_ID} style={{border:0}} allowFullScreen loading="lazy" title="Direct"></iframe></div></div>
      )}

      {actif==='PODCAST' && (
        <div style={{background:'#0f2040',color:'white',minHeight:'100vh',padding:20}}><h2 style={{color:'#a8ff00'}}>PODCASTS RIUS</h2><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginTop:16}}>{podcastArticles.map(a=>{ const tc=getTranslated(a); return <div key={a.id} onClick={()=>setCurrentAudio(a)} style={{background:'rgba(255,255,255,0.07)',borderRadius:12,overflow:'hidden',cursor:'pointer'}}><img src={a.image} loading="lazy" style={{width:'100%',height:150,objectFit:'cover'}} alt="" /><div style={{padding:10}}><div style={{fontSize:10,color:'#a8ff00',fontWeight:900}}>{a.category}</div><div style={{fontWeight:700,fontSize:13,marginTop:4}}>{tc.title}</div></div></div>})}</div></div>
      )}

      {actif==='CONTACT' && (
        <div style={{background:'#0f2040',color:'white',minHeight:'100vh',padding:'20px 16px'}}><h2 style={{color:'#ffcc00'}}>CONTACTEZ-NOUS</h2><form onSubmit={handleContact} style={{background:'white',color:'#0f2040',borderRadius:14,padding:20,maxWidth:600,marginTop:16}}><input value={contactForm.name} onChange={e=>setContactForm({...contactForm,name:e.target.value})} placeholder="Nom" style={{width:'100%',padding:'10px',borderRadius:8,border:'1px solid #ddd',marginBottom:10}} /><input value={contactForm.email} onChange={e=>setContactForm({...contactForm,email:e.target.value})} placeholder="Email" style={{width:'100%',padding:'10px',borderRadius:8,border:'1px solid #ddd',marginBottom:10}} /><textarea value={contactForm.message} onChange={e=>setContactForm({...contactForm,message:e.target.value})} placeholder="Message" style={{width:'100%',padding:'10px',borderRadius:8,border:'1px solid #ddd',minHeight:120,marginBottom:10}}></textarea><button type="submit" style={{background:'#0d1b4a',color:'white',border:0,padding:'12px 20px',borderRadius:8,fontWeight:900,width:'100%',cursor:'pointer'}}>{contactStatus||'ENVOYER'}</button></form></div>
      )}

      {actif!=='ACCUEIL' && actif!=='KIOSQUE' && actif!=='DIRECT' && actif!=='PODCAST' && actif!=='CONTACT' && actif!=='RECHERCHE' && (
        <div style={{padding:'20px 16px',minHeight:400,background:'#0f2040',color:'white'}}><h2>{actif}</h2><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginTop:16}}>{filteredArticles.filter(a=>a.category===actif).map(a=>{const tc=getTranslated(a); return <div key={a.id} onClick={()=>openArticle(a)} style={{background:'white',cursor:'pointer',borderRadius:10,overflow:'hidden',color:'black'}}><img src={a.image} loading="lazy" style={{width:'100%',height:170,objectFit:'cover'}} alt="" /><div style={{padding:10,fontWeight:700,fontSize:13}}>{tc.title}</div></div>})}</div></div>
      )}

      {actif==='RECHERCHE' && (
        <div style={{background:'#0f2040',color:'white',minHeight:'100vh',padding:'20px 16px'}}><h2>Resultats pour {searchTerm}</h2><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginTop:16}}>{articlesForSearch.map(a=>{const tc=getTranslated(a); return <div key={a.id} onClick={()=>openArticle(a)} style={{background:'white',cursor:'pointer',borderRadius:10,overflow:'hidden',color:'black'}}><img src={a.image} loading="lazy" style={{width:'100%',height:170,objectFit:'cover'}} alt="" /><div style={{padding:10}}><div style={{fontSize:9,fontWeight:900,color:'#2e4fb0'}}>{a.category}</div><div style={{fontWeight:700,fontSize:13,marginTop:4}}>{tc.title}</div></div></div>})}</div></div>
      )}

      <footer style={{background:'linear-gradient(180deg, #3a62d1 0%, #2f52b6 100%)',color:'white',borderTop:'1px solid rgba(255,204,0,0.25)',marginTop:0}}>
        <div style={{padding:'36px 24px 24px',maxWidth:1400,margin:'0 auto',display:'grid',gridTemplateColumns:'1.4fr 0.7fr 1fr 1.2fr',gap:32}}>
          <div><div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}><img src="/logo.png" style={{width:42,height:42,borderRadius:'50%'}} alt="" /><div><div style={{fontSize:19}}><span style={{fontFamily:'cursive'}}>Rius</span><span style={{color:'#ffcc00',fontWeight:900,marginLeft:6}}>Multimedia</span></div><div style={{fontSize:11}}>{T.slogan1}</div></div></div><div style={{fontSize:11,color:'rgba(255,255,255,0.55)',maxWidth:300}}>Media togolais independant. Voir, Verifier, Informer.</div></div>
          <div><h4 style={{color:'#ffcc00',fontSize:12,fontWeight:900,marginBottom:14}}>CATEGORIES</h4>{['Politique','Societe','Sport','Culture','Sante','International'].map(l=>(<a key={l} href="#" onClick={e=>{e.preventDefault();setActif(l.toUpperCase())}} style={{display:'block',color:'rgba(255,255,255,0.65)',textDecoration:'none',fontSize:12.5,marginBottom:9}}>{l}</a>))}</div>
          <div><h4 style={{color:'#ffcc00',fontSize:12,fontWeight:900,marginBottom:14}}>CONTACT</h4><div style={{fontSize:12,color:'rgba(255,255,255,0.65)'}}><div>Lome, Togo</div><div>rius.multimedia@gmail.com</div></div></div>
          <div><h4 style={{color:'#ffcc00',fontSize:12,fontWeight:900,marginBottom:14}}>NEWSLETTER</h4><div style={{display:'flex',background:'rgba(255,255,255,0.07)',borderRadius:10,padding:4}}><input value={newsletterEmail} onChange={e=>setNewsletterEmail(e.target.value)} placeholder="Votre email" style={{flex:1,padding:'10px 12px',border:'none',fontSize:12,background:'transparent',color:'white',outline:'none'}} /><button onClick={handleNewsletter} style={{background:'#ffcc00',color:'#000',border:'none',padding:'0 18px',borderRadius:'6px',fontWeight:900,fontSize:12,cursor:'pointer'}}>OK</button></div></div>
        </div>
        <div style={{borderTop:'1px solid rgba(255,255,255,0.06)',padding:'12px 24px',display:'flex',justifyContent:'space-between',fontSize:10.5,color:'rgba(255,255,255,0.35)',maxWidth:1400,margin:'0 auto'}}><span>Concu avec passion a Lome - 2026</span><span>© Rius Multimedia</span></div>
      </footer>
    </div>
  )
}
