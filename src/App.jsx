import React, { useEffect, useState } from 'react'
import Admin from './Admin'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sswbiiurbnclsxqstrmu.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'sb_publishable_nO-86ly83b8Pup6WZwCsZw_OfIUZsiR'
const YOUTUBE_HANDLE = "Marius-Kodzo-ATTOR"
const YOUTUBE_CHANNEL_URL = `https://www.youtube.com/@${YOUTUBE_HANDLE}`

const LANGS = { fr:{label:'FR'}, en:{label:'EN'} }
const UI = {
  fr: { accueil:'ACCUEIL', lire:'▶ LIRE', retour:'← RETOUR', flash:'FLASH', categories:'CATEGORIES', slogan1:"Si près de l'info", slogan2:"Voir Vérifier Informer", search:'Rechercher...' },
  en: { accueil:'HOME', lire:'▶ READ', retour:'← BACK', flash:'BREAKING', categories:'CATEGORIES', slogan1:"So close to news", slogan2:"See Verify Inform", search:'Search...' }
}
const CATS = ['ACCUEIL','POLITIQUE','CULTURE','SOCIETE','SANTE','SPORT','INTERNATIONAL']

function getYoutubeIdRaw(url){
  if(!url) return null
  if(url.includes('embed/')) return url.split('embed/')[1]?.split('?')[0]
  let id=url.split('v=')[1]; if(!id) id=url.split('youtu.be/')[1]
  if(id) id=id.split('&')[0].split('?')[0]
  return id||null
}
const getYoutubeThumb = (url)=>{ const id=getYoutubeIdRaw(url); return id? `https://img.youtube.com/vi/${id}/hqdefault.jpg`:null }

function InstallBanner({deferredPrompt,setDeferredPrompt,T}){
  const [show,setShow]=useState(false)
  useEffect(()=>{ if(deferredPrompt){ const t=setTimeout(()=>setShow(true),5000); return()=>clearTimeout(t)}},[deferredPrompt])
  if(!show||!deferredPrompt) return null
  return <div style={{position:'fixed',bottom:16,left:12,right:12,background:'#0f2040',color:'white',padding:12,borderRadius:14,display:'flex',justifyContent:'space-between',zIndex:99999,border:'2px solid #ffcc00'}}><div>Installer RM</div><button onClick={()=>setShow(false)}>X</button></div>
}

function RenderBlocks({blocks,content}){
  if(blocks && blocks.length>0){
    return <div style={{display:'flex',flexDirection:'column',gap:18}}>{blocks.map((b,i)=>{
      if(b.type==='text') return <p key={i} style={{fontSize:15,lineHeight:1.7,margin:0}}>{b.content}</p>
      if(b.type==='image') return <img key={i} src={b.url} style={{width:'100%',borderRadius:10}} alt="" />
      return null
    })}</div>
  }
  return <p style={{fontSize:15,lineHeight:1.7,whiteSpace:'pre-wrap'}}>{content}</p>
}

function SiteHeader({T, flashList, actif, setActif, setSelected, searchTerm, setSearchTerm}){
  const handleSearch = ()=>{ if(searchTerm.trim()) setActif('RECHERCHE') }
  return (
    <div style={{position:'sticky',top:0,zIndex:1000,width:'100%'}}>
      <div style={{background:'black',color:'white',height:26,display:'flex',alignItems:'center',padding:'0 10px',fontSize:11,overflow:'hidden'}}>
        <span style={{background:'#d4ff00',color:'black',padding:'2px 8px',fontWeight:900,borderRadius:4,marginRight:8,flexShrink:0}}>FLASH</span>
        <div style={{flex:1,overflow:'hidden'}}><span className="flash-track">{(flashList.length? flashList.join(' ••• ') : 'Bienvenue sur Rius Multimédia - L info en continu depuis Lomé ••• ') + (flashList.length? ' ••• ' + flashList.join(' ••• ') : '')}</span></div>
      </div>
      <div style={{background:'#2e4fb0',color:'white',height:64,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 16px'}}>
        <div style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer'}} onClick={()=>{setSelected(null); setActif('ACCUEIL')}}>
          <img src="/logo.png" style={{width:40,height:40,borderRadius:'50%'}} alt="" />
          <span style={{fontWeight:900,fontSize:18}}>Rius <span style={{color:'#ffcc00'}}>Multimédia</span></span>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSearch()} placeholder={T.search} style={{padding:'6px 10px',borderRadius:20,border:0,fontSize:12,width:140}} />
          <button onClick={handleSearch} style={{background:'#ffcc00',border:0,padding:'6px 12px',borderRadius:20,fontWeight:900,fontSize:11,cursor:'pointer'}}>OK</button>
        </div>
      </div>
      <div style={{background:'white',borderBottom:'1px solid #eee',padding:'6px 10px',fontSize:11,textAlign:'center',color:'#2e4fb0',fontWeight:700}}>📢 Annonces • Espace pub disponible • Contact: rius.multimedia@gmail.com</div>
      <nav style={{background:'#0f2040',display:'flex',gap:4,padding:'6px 10px',overflowX:'auto'}}>
        {CATS.map(c=><button key={c} onClick={()=>{setActif(c); setSelected(null)}} style={{background:actif===c?'#ffcc00':'transparent',color:actif===c?'black':'white',border:0,padding:'6px 12px',borderRadius:20,fontWeight:800,fontSize:11,cursor:'pointer',whiteSpace:'nowrap'}}>{c}</button>)}
      </nav>
    </div>
  )
}

function SiteFooter({T}){
  return (
    <footer style={{background:'#0f2040',color:'white',padding:'30px 20px',marginTop:20}}>
      <div style={{maxWidth:1100,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:20}}>
        <div><h4 style={{color:'#ffcc00'}}>Rius Multimédia</h4><p style={{fontSize:12,opacity:0.7}}>Voir Vérifier Informer. Média togolais indépendant.</p></div>
        <div><h4 style={{color:'#ffcc00'}}>Catégories</h4>{CATS.slice(1).map(c=><div key={c} style={{fontSize:12,opacity:0.7,marginBottom:4}}>{c}</div>)}</div>
        <div><h4 style={{color:'#ffcc00'}}>Contact</h4><div style={{fontSize:12,opacity:0.7}}>Lomé, Togo<br/>rius.multimedia@gmail.com</div></div>
      </div>
      <div style={{textAlign:'center',marginTop:20,fontSize:10,opacity:0.5}}>© 2026 Rius Multimédia - Conçu avec ❤ à Lomé</div>
    </footer>
  )
}

export default function App(){
  if(typeof window!=='undefined' && window.location.pathname==='/admin') return <Admin />
  const [lang,setLang]=useState('fr')
  const T=UI[lang]||UI.fr
  const [articles,setArticles]=useState([])
  const [annonces,setAnnonces]=useState([])
  const [pubs,setPubs]=useState([])
  const [flashes,setFlashes]=useState([])
  const [actif,setActif]=useState('ACCUEIL')
  const [selected,setSelected]=useState(null)
  const [searchTerm,setSearchTerm]=useState('')
  const [commentName,setCommentName]=useState('')
  const [commentText,setCommentText]=useState('')
  const [comments,setComments]=useState(()=>{ try{ const v=localStorage.getItem('rius_comments'); return v?JSON.parse(v):{} }catch{return{}} })
  const [deferredPrompt,setDeferredPrompt]=useState(null)
  const [currentPub,setCurrentPub]=useState(0)

  const flashList = flashes.length? flashes : ['Bienvenue sur Rius Multimédia - L info en continu depuis Lomé']
  const annoncesList = annonces.length? annonces : ['Votre pub ici - Contactez-nous']

  useEffect(()=>{
    const h=(e)=>{ e.preventDefault(); setDeferredPrompt(e) }
    window.addEventListener('beforeinstallprompt',h)
    return()=>window.removeEventListener('beforeinstallprompt',h)
  },[])

  useEffect(()=>{
    async function load(){
      try{
        const res = await fetch(`${supabaseUrl}/rest/v1/articles?select=*&order=created_at.desc`, {headers:{apikey:supabaseKey, Authorization:`Bearer ${supabaseKey}`}})
        const data = await res.json()
        if(Array.isArray(data)) setArticles(data)
      }catch{}
      try{
        const res = await fetch(`${supabaseUrl}/rest/v1/annonces?select=*`, {headers:{apikey:supabaseKey, Authorization:`Bearer ${supabaseKey}`}})
        const d = await res.json()
        if(Array.isArray(d)) setAnnonces(d.map(x=>x.text||x.message||''))
      }catch{}
      try{
        const res = await fetch(`${supabaseUrl}/rest/v1/pubs?select=*`, {headers:{apikey:supabaseKey, Authorization:`Bearer ${supabaseKey}`}})
        const d = await res.json()
        if(Array.isArray(d)) setPubs(d)
      }catch{}
      try{
        const res = await fetch(`${supabaseUrl}/rest/v1/flashes?select=*&order=created_at.desc&limit=5`, {headers:{apikey:supabaseKey, Authorization:`Bearer ${supabaseKey}`}})
        const d = await res.json()
        if(Array.isArray(d)) setFlashes(d.map(x=>x.text||x.message||''))
      }catch{}
    }
    load()
    const iv=setInterval(()=>setCurrentPub(p=>p+1),5000)
    return()=>clearInterval(iv)
  },[])

  const getTranslated = (a)=>a||{}
  const openArticle = (a)=>{ setSelected(a); window.scrollTo(0,0) }

  const filtered = articles.filter(a=>{
    if(actif==='ACCUEIL') return true
    if(actif==='RECHERCHE') return searchTerm && (a.title||'').toLowerCase().includes(searchTerm.toLowerCase())
    return (a.category||'').toUpperCase()===actif
  })

  if(selected){
    const disp=getTranslated(selected)
    const readingTime=Math.max(1,Math.ceil((disp.content||'').length/800))
    const articleComments=comments[disp.id]||[]
    const addComment=()=>{
      if(!commentName.trim()||!commentText.trim()) return alert('Remplis nom et commentaire')
      const newC={id:Date.now(),name:commentName,text:commentText,date:new Date().toLocaleString('fr-FR')}
      const updated={...comments,[disp.id]:[newC,...articleComments]}
      setComments(updated)
      localStorage.setItem('rius_comments',JSON.stringify(updated))
      setCommentName(''); setCommentText('')
    }
    const pubTop = pubs[0]
    const pubMid = pubs[1]||pubs[0]

    return (
      <div style={{margin:0,fontFamily:'Inter,Arial,sans-serif',background:'#2e4fb0'}}>
        <style>{`
          *{box-sizing:border-box}html,body{margin:0;padding:0;overflow-y:scroll!important}
          ::-webkit-scrollbar{width:8px!important;height:8px!important}
          ::-webkit-scrollbar-track{background:#0f2040!important}
          ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.35)!important;border-radius:10px!important}
          ::-webkit-scrollbar-thumb:hover{background:#ffcc00!important}
          @keyframes defile{0%{transform:translateX(100%)}100%{transform:translateX(-100%)}}
          .flash-track{animation:defile 60s linear infinite;white-space:nowrap;display:inline-block}
          @media(max-width:900px){.article-layout{flex-direction:column!important;padding:12px!important}.article-side{width:100%!important}}
        `}</style>

        <SiteHeader T={T} flashList={flashList} actif={actif} setActif={setActif} setSelected={setSelected} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        <div className="article-layout" style={{maxWidth:1280,margin:'0 auto',display:'flex',gap:24,padding:'24px 18px 0'}}>
          <div style={{flex:'1 1 0',minWidth:0,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:12,overflow:'hidden'}}>
            
            {pubTop && (
              <div style={{background:'white',padding:8,textAlign:'center',borderBottom:'1px solid #eee'}}>
                <div style={{fontSize:9,opacity:0.5,marginBottom:4}}>PUBLICITE</div>
                <img src={pubTop.image||pubTop.image_url} style={{maxWidth:'100%',height:'auto',maxHeight:90,objectFit:'contain'}} alt="pub" />
              </div>
            )}

            <div style={{padding:'24px'}}>
              <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap',marginBottom:12}}>
                <span style={{background:'#ffcc00',color:'black',padding:'5px 12px',borderRadius:20,fontWeight:900,fontSize:11}}>{disp.category||'ACTU'}</span>
                <span style={{fontSize:11,color:'rgba(255,255,255,0.7)'}}>{readingTime} min • {disp.created_at? new Date(disp.created_at).toLocaleDateString('fr-FR'):''}</span>
              </div>
              <h1 style={{color:'white',fontSize:32,lineHeight:1.15,fontWeight:900,margin:'0 0 12px'}}>{disp.title}</h1>
              <div style={{display:'flex',gap:8,margin:'12px 0'}}>
                <button onClick={()=>{ const url=window.location.href; if(navigator.share){ navigator.share({title:disp.title,url}) } else { navigator.clipboard.writeText(url); alert('Lien copie') } }} style={{background:'#25D366',color:'white',border:0,padding:'8px 14px',borderRadius:20,fontWeight:800,fontSize:12,cursor:'pointer'}}>Partager</button>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window!=='undefined'?window.location.href:'')}`} target="_blank" rel="noreferrer" style={{background:'#1877F2',color:'white',padding:'8px 14px',borderRadius:20,fontWeight:800,fontSize:12,textDecoration:'none'}}>Facebook</a>
              </div>
              {disp.image && <img src={disp.image} style={{width:'100%',borderRadius:12,margin:'16px 0',maxHeight:500,objectFit:'cover'}} alt="" />}
              <div style={{color:'white'}}>
                <RenderBlocks blocks={disp.blocks} content={disp.content} />
              </div>

              {pubMid && (
                <div style={{margin:'28px 0',background:'rgba(255,255,255,0.08)',padding:12,borderRadius:10,textAlign:'center'}}>
                  <div style={{fontSize:9,opacity:0.5,marginBottom:6}}>PUBLICITE</div>
                  <img src={pubMid.image||pubMid.image_url} style={{maxWidth:'100%',height:'auto',maxHeight:250,objectFit:'contain',borderRadius:8}} alt="pub" />
                </div>
              )}

              <div style={{marginTop:30,background:'rgba(0,0,0,0.2)',padding:16,borderRadius:12}}>
                <h3 style={{color:'#ffcc00',margin:'0 0 12px',fontSize:14}}>💬 Commentaires ({articleComments.length})</h3>
                <div style={{display:'flex',gap:8,marginBottom:12}}>
                  <input value={commentName} onChange={e=>setCommentName(e.target.value)} placeholder="Votre nom" style={{padding:'8px 10px',borderRadius:8,border:0,flex:1,fontSize:12}} />
                </div>
                <textarea value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Votre commentaire..." style={{width:'100%',padding:'10px',borderRadius:8,border:0,minHeight:70,fontSize:12}} />
                <button onClick={addComment} style={{marginTop:8,background:'#ffcc00',border:0,padding:'8px 16px',borderRadius:8,fontWeight:900,fontSize:12,cursor:'pointer'}}>Publier</button>
                <div style={{marginTop:16,display:'flex',flexDirection:'column',gap:10}}>
                  {articleComments.map(c=><div key={c.id} style={{background:'rgba(255,255,255,0.08)',padding:10,borderRadius:8}}><div style={{fontWeight:800,fontSize:12,color:'#ffcc00'}}>{c.name} <span style={{fontWeight:400,opacity:0.6,fontSize:10}}>{c.date}</span></div><div style={{fontSize:12,marginTop:4}}>{c.text}</div></div>)}
                </div>
              </div>
            </div>
          </div>

          <div className="article-side" style={{width:320,flexShrink:0}}>
            <div style={{background:'white',borderRadius:12,padding:14,marginBottom:16}}>
              <h4 style={{margin:'0 0 10px',fontSize:12,fontWeight:900}}>🔥 TENDANCES</h4>
              {articles.slice(0,5).map(a=><div key={a.id} onClick={()=>openArticle(a)} style={{display:'flex',gap:8,marginBottom:10,cursor:'pointer'}}><img src={a.image} style={{width:60,height:45,objectFit:'cover',borderRadius:6}} alt="" /><div style={{fontSize:11,fontWeight:700,lineHeight:1.2}}>{(a.title||'').slice(0,60)}</div></div>)}
            </div>
            <div style={{background:'white',borderRadius:12,padding:14}}>
              <h4 style={{margin:'0 0 10px',fontSize:12,fontWeight:900}}>📰 A LIRE AUSSI</h4>
              {articles.filter(x=>x.id!==disp.id).slice(0,9).map(a=><div key={a.id} onClick={()=>openArticle(a)} style={{padding:'8px 0',borderBottom:'1px solid #eee',fontSize:12,fontWeight:600,cursor:'pointer'}}>{a.title}</div>)}
            </div>
          </div>
        </div>

        <SiteFooter T={T} />
        <InstallBanner deferredPrompt={deferredPrompt} setDeferredPrompt={setDeferredPrompt} T={T} />
      </div>
    )
  }

  function renderMain(){
    if(actif==='ACCUEIL'){
      return (
        <div style={{background:'#2e4fb0',minHeight:'100vh',padding:20}}>
          <div style={{maxWidth:1200,margin:'0 auto'}}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16}}>
              {filtered.slice(0,12).map(a=><div key={a.id} onClick={()=>openArticle(a)} style={{background:'white',borderRadius:12,overflow:'hidden',cursor:'pointer'}}><img src={a.image} style={{width:'100%',height:160,objectFit:'cover'}} alt="" /><div style={{padding:12}}><div style={{fontSize:10,fontWeight:900,color:'#2e4fb0'}}>{a.category}</div><div style={{fontWeight:800,fontSize:13,marginTop:4}}>{a.title}</div></div></div>)}
            </div>
          </div>
        </div>
      )
    }
    if(actif==='RECHERCHE'){
      return (
        <div style={{background:'#0f2040',color:'white',minHeight:'100vh',padding:20}}>
          <div style={{maxWidth:1000,margin:'0 auto'}}>
            <h2>Resultats pour "{searchTerm}" ({filtered.length})</h2>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:16,marginTop:16}}>
              {filtered.map(a=><div key={a.id} onClick={()=>openArticle(a)} style={{background:'white',color:'black',borderRadius:10,overflow:'hidden',cursor:'pointer'}}><img src={a.image} style={{width:'100%',height:140,objectFit:'cover'}} alt="" /><div style={{padding:10,fontWeight:700,fontSize:13}}>{a.title}</div></div>)}
            </div>
          </div>
        </div>
      )
    }
    return (
      <div style={{background:'#0f2040',color:'white',minHeight:'60vh',padding:20}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <h2>{actif}</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:16,marginTop:16}}>
            {filtered.map(a=><div key={a.id} onClick={()=>openArticle(a)} style={{background:'white',color:'black',borderRadius:10,overflow:'hidden',cursor:'pointer'}}><img src={a.image} style={{width:'100%',height:140,objectFit:'cover'}} alt="" /><div style={{padding:10,fontWeight:700,fontSize:13}}>{a.title}</div></div>)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{margin:0,fontFamily:'Inter,Arial,sans-serif',background:'#162f6b'}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');*{box-sizing:border-box}html,body{margin:0;padding:0;overflow-y:scroll!important}::-webkit-scrollbar{width:8px!important;height:8px!important}::-webkit-scrollbar-track{background:#0f2040!important}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.35)!important;border-radius:10px!important}::-webkit-scrollbar-thumb:hover{background:#ffcc00!important}
          @keyframes defile{0%{transform:translateX(100%)}100%{transform:translateX(-100%)}}
          .flash-track{animation:defile 60s linear infinite;white-space:nowrap;display:inline-block}`}</style>
      <SiteHeader T={T} flashList={flashList} actif={actif} setActif={setActif} setSelected={setSelected} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      {renderMain()}
      <SiteFooter T={T} />
      <InstallBanner deferredPrompt={deferredPrompt} setDeferredPrompt={setDeferredPrompt} T={T} />
    </div>
  )
}
