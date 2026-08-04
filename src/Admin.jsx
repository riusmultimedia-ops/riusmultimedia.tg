
import React, { useState, useEffect, useRef } from 'react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const YOUTUBE_STUDIO = 'https://studio.youtube.com/';
const SLOGAN_L1 = "Si près de l'info, si près de vous";
const SLOGAN_L2 = "Voir Vérifier Informer";

const LANGS = ['fr','en','es','de','ar','zh'];
const LABELS = { fr:'🇫🇷 FR', en:'🇬🇧 EN', es:'🇪🇸 ES', de:'🇩🇪 DE', ar:'🇸🇦 AR', zh:'🇨🇳 ZH' };

const Slogan = ({ size = 1 }) => (
  <div style={{ textAlign: 'center', lineHeight: 1.2 }}>
    <div style={{ fontSize: size === 1? 12 : 10, fontWeight: 700 }}>{SLOGAN_L1}</div>
    <div style={{ fontSize: size === 1? 10 : 8, fontWeight: 900, letterSpacing: 0.5, marginTop: 2, opacity: 0.9 }}>{SLOGAN_L2}</div>
  </div>
);

const getYoutubeId = (url) => {
  if(!url) return null
  if(url.includes('embed/')) return url.split('embed/')[1]?.split('?')[0]
  let id=url.split('v=')[1]; if(!id) id=url.split('youtu.be/')[1]
  if(id) id=id.split('&')[0].split('?')[0]
  return id || null
}
const getYoutubeThumb = (url) => {
  const id = getYoutubeId(url)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
}

export default function Admin() {
  const [isLogged, setIsLogged] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [form, setForm] = useState({ id:null, title:'', category:'ACCUEIL', image:'', video:'', audio:'', content:'', translations:{}, gallery:[] });
  const [gallery, setGallery] = useState([]);
  const [youtubeInput, setYoutubeInput] = useState('');
  const [youtubeCaption, setYoutubeCaption] = useState('');
  const [editLang, setEditLang] = useState('fr');
  const [translating, setTranslating] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [showArticles, setShowArticles] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [showAnnonces, setShowAnnonces] = useState(false);
  const [showPubs, setShowPubs] = useState(false);
  const [users, setUsers] = useState([{ user: 'Rius', pass: 'Rius2025', role: 'admin' }]);
  const [articles, setArticles] = useState([]);
  const [flashes, setFlashes] = useState([]);
  const [annonces, setAnnonces] = useState([]);
  const [pubs, setPubs] = useState([]);
  const [newFlash, setNewFlash] = useState('');
  const [newAnnonce, setNewAnnonce] = useState('');
  const [newPubImage, setNewPubImage] = useState('');
  const [newPubLink, setNewPubLink] = useState('');
  const [newU, setNewU] = useState('');
  const [newP, setNewP] = useState('');
  const [uploading, setUploading] = useState('');
  const [search, setSearch] = useState('');
  const galleryInputRef = useRef(null);

  const compressImage = (file, maxW=1280, quality=0.65) => {
    return new Promise((resolve)=>{
      if(!file.type.startsWith('image/')) return resolve(file);
      const img = new Image();
      img.onload = ()=>{
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        if(w > maxW){ h = h * (maxW / w); w = maxW; }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(function(blob){
          if(blob) resolve(new File([blob], file.name, {type:'image/jpeg'}));
          else resolve(file);
        }, 'image/jpeg', quality);
      };
      img.onerror = function(){ resolve(file); };
      img.src = URL.createObjectURL(file);
    });
  };

  const TIMEOUT_MIN = 5;
  const [lastActivity, setLastActivity] = useState(Date.now());
  
  useEffect(() => {
    fetch('/api/users').then(r=>r.json()).then(data=>{ if(data?.length) setUsers(data); }).catch(()=>{});
    fetchArticles(); fetchFlashes(); fetchAnnonces(); fetchPubs();
  }, []);

  useEffect(() => {
    if(!isLogged) return;
    const resetTimer = () => setLastActivity(Date.now());
    const events = ['mousemove','keydown','click','scroll','touchstart'];
    if (typeof window !== 'undefined') events.forEach(e=> window.addEventListener(e, resetTimer));
    const interval = setInterval(()=>{
      const diff = Date.now() - lastActivity;
      if(diff > TIMEOUT_MIN * 60 * 1000){
        alert(`Session expirée après ${TIMEOUT_MIN} min d'inactivité`);
        handleLogout();
      }
    }, 60000);
    return ()=>{
      if (typeof window !== 'undefined') events.forEach(e=> window.removeEventListener(e, resetTimer));
      clearInterval(interval);
    };
  }, [isLogged, lastActivity]);

  const fetchArticles = () => {
    fetch(`${supabaseUrl}/rest/v1/articles?select=*&order=created_at.desc`, { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } })
  .then(r=>r.json()).then(data=>{ if(Array.isArray(data)) setArticles(data); });
  };
  const fetchFlashes = () => {
    fetch(`${supabaseUrl}/rest/v1/flash?select=*&order=created_at.desc`, { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } })
  .then(r=>r.json()).then(data=>{ if(Array.isArray(data)) setFlashes(data); });
  };
  const fetchAnnonces = () => {
    fetch(`${supabaseUrl}/rest/v1/annonces_blanches?select=*&order=created_at.desc`, { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } })
  .then(r=>r.json()).then(data=>{ if(Array.isArray(data)) setAnnonces(data); });
  };
  const fetchPubs = () => {
    fetch(`${supabaseUrl}/rest/v1/pubs?select=*&order=created_at.desc`, { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } })
  .then(r=>r.json()).then(data=>{ if(Array.isArray(data)) setPubs(data); });
  };

  const saveUsers = (newList) => {
    setUsers(newList);
    fetch('/api/users', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(newList) });
  };

  const handleLogin = () => {
    const found = users.find(u => u.user === user && u.pass === pass);
    if (found) { setCurrentUser(found); setIsLogged(true); setShowUsers(false); setShowArticles(false); setShowFlash(false); setShowAnnonces(false); setShowPubs(false); }
    else alert('Identifiants incorrects');
  };

  const handleLogout = () => {
    setIsLogged(false); setCurrentUser(null); setUser(''); setPass('');
    setForm({ id:null, title:'', category:'ACCUEIL', image:'', video:'', audio:'', content:'', translations:{}, gallery:[] });
    setGallery([]);
    setYoutubeInput(''); setYoutubeCaption('');
    setShowUsers(false); setShowArticles(false); setShowFlash(false); setShowAnnonces(false); setShowPubs(false);
  };

  const handleChangeMyPass = () => {
    const np = prompt(`Nouveau mot de passe pour ${currentUser.user} :`);
    if(np && np.trim()){
      const newList = users.map(x=> x.user===currentUser.user? {...x, pass:np.trim()}:x);
      saveUsers(newList);
      alert('✅ Mot de passe changé : ' + np.trim());
    }
  };

  const translateText = async (text, target) => {
    if(!text || target==='fr') return text
    const q=encodeURIComponent(text.slice(0,450))
    try{
      const res=await fetch(`https://api.mymemory.translated.net/get?q=${q}&langpair=fr|${target}`)
      const data=await res.json()
      return data?.responseData?.translatedText || text
    }catch{ return text }
  }

  const handleAutoTranslate = async () => {
    if(!form.title ||!form.content) return alert('Écris d abord titre et contenu en FR')
    setTranslating(true)
    let newTrans = {...form.translations}
    for(let lang of LANGS){
      if(lang==='fr') continue
      const tTitle = await translateText(form.title, lang)
      const tContent = await translateText(form.content.slice(0,800), lang)
      newTrans[lang] = { title: tTitle, content: tContent }
    }
    setForm(f=>({...f, translations: newTrans}))
    setTranslating(false)
    alert('✅ Traduit en 5 langues!')
  }

  const uploadFile = async (bucket, file, isPub=false) => {
    if(!file) return null;
    if(file.type.startsWith('image/')){ file = await compressImage(file); }
    setUploading(isPub?'pubs':bucket);
    try{
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const target = isPub?'pubs':bucket
      const res = await fetch(`${supabaseUrl}/storage/v1/object/${target}/${fileName}`, {
        method: 'POST',
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'x-upsert': 'true', 'Content-Type': file.type },
        body: file
      });
      if(!res.ok) throw new Error(await res.text());
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${target}/${fileName}`;
      if(isPub) setNewPubImage(publicUrl);
      else if(bucket === 'images') setForm(f=>({...f, image: publicUrl}));
      else if(bucket === 'audios') setForm(f=>({...f, audio: publicUrl}));
      return publicUrl;
    }catch(e){ alert('Erreur upload: '+e.message); return null; }
    finally{ setUploading(''); }
  };

  const uploadGalleryFiles = async (files) => {
    const fileList = Array.from(files);
    setUploading('gallery');
    for(const file of fileList){
      const url = await uploadFile('media', file);
      if(url){
        const type = file.type.startsWith('video') ? 'video' : 'image';
        setGallery(g=>[...g, {type, url, caption:''}]);
      }
    }
    setUploading('');
  };

  const addGalleryUrl = (type) => setGallery([...gallery, {type, url:'', caption:''}]);
  const updateGallery = (i, field, val) => { const c=[...gallery]; c[i][field]=val; setGallery(c); };
  const removeGallery = (i) => setGallery(gallery.filter((_,idx)=>idx!==i));
  const moveGallery = (i, dir) => {
    const c=[...gallery]; const ni = dir==='up'? i-1 : i+1;
    if(ni<0 || ni>=c.length) return;
    const tmp=c[i]; c[i]=c[ni]; c[ni]=tmp; setGallery(c);
  };

  const handleAddYoutube = () => {
    if(!youtubeInput.trim()) return alert('Colle un lien YouTube');
    const id = getYoutubeId(youtubeInput.trim())
    if(!id) return alert('Lien YouTube invalide. Ex: https://youtu.be/abc123 ou https://www.youtube.com/watch?v=abc123')
    const url = youtubeInput.trim()
    setGallery([...gallery, {type:'video', url, caption: youtubeCaption}])
    setYoutubeInput('')
    setYoutubeCaption('')
  }

  const handlePublish = async () => {
    if(!form.title||!form.content) return alert('Titre et contenu obligatoires');
    try{
      const payload = { title: form.title, category: form.category, image: form.image, video: form.video || null, audio: form.audio || null, content: form.content, translations: form.translations, gallery: gallery.length? gallery : null }
      // Si pas d'image principale mais video youtube dans gallery, on met la miniature auto en image
      if(!payload.image && gallery.length){
        const firstYt = gallery.find(g=> g.url && (g.url.includes('youtube') || g.url.includes('youtu.be')))
        if(firstYt){
          const thumb = getYoutubeThumb(firstYt.url)
          if(thumb) payload.image = thumb
        }
      }
      const url = form.id? `${supabaseUrl}/rest/v1/articles?id=eq.${form.id}` : `${supabaseUrl}/rest/v1/articles`
      const method = form.id? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method, headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
        body: JSON.stringify(payload)
      });
      if(res.ok){ alert(form.id?'Article modifié!':'Article publié!'); setForm({ id:null, title:'', category:'ACCUEIL', image:'', video:'', audio:'', content:'', translations:{}, gallery:[] }); setGallery([]); setEditLang('fr'); fetchArticles(); setShowArticles(true); }
      else alert(await res.text());
    }catch(e){ alert(e.message) }
  };

  const handleAddFlash = async () => {
    if(!newFlash.trim()) return;
    const res = await fetch(`${supabaseUrl}/rest/v1/flash`, {
      method:'POST', headers:{ 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type':'application/json', 'Prefer':'return=minimal' },
      body: JSON.stringify({ text: newFlash.trim(), active: true })
    });
    if(res.ok){ setNewFlash(''); fetchFlashes(); } else alert(await res.text());
  };
  const handleDeleteFlash = async (id) => { if(!confirm('Supprimer ce flash?')) return; await fetch(`${supabaseUrl}/rest/v1/flash?id=eq.${id}`, { method:'DELETE', headers:{ 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }); fetchFlashes(); };
  const handleToggleFlash = async (f) => { await fetch(`${supabaseUrl}/rest/v1/flash?id=eq.${f.id}`, { method:'PATCH', headers:{ 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type':'application/json' }, body: JSON.stringify({ active:!f.active }) }); fetchFlashes(); };

  const handleAddAnnonce = async () => {
    if(!newAnnonce.trim()) return;
    const res = await fetch(`${supabaseUrl}/rest/v1/annonces_blanches`, {
      method:'POST', headers:{ 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type':'application/json', 'Prefer':'return=minimal' },
      body: JSON.stringify({ text: newAnnonce.trim(), active: true })
    });
    if(res.ok){ setNewAnnonce(''); fetchAnnonces(); } else alert(await res.text());
  };
  const handleDeleteAnnonce = async (id) => { if(!confirm('Supprimer cette annonce?')) return; await fetch(`${supabaseUrl}/rest/v1/annonces_blanches?id=eq.${id}`, { method:'DELETE', headers:{ 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }); fetchAnnonces(); };
  const handleToggleAnnonce = async (a) => { await fetch(`${supabaseUrl}/rest/v1/annonces_blanches?id=eq.${a.id}`, { method:'PATCH', headers:{ 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type':'application/json' }, body: JSON.stringify({ active:!a.active }) }); fetchAnnonces(); };

  const handleAddPub = async () => { if(!newPubImage) return alert('Mets une image'); const res=await fetch(`${supabaseUrl}/rest/v1/pubs`, { method:'POST', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${supabaseKey}`, 'Content-Type':'application/json', 'Prefer':'return=minimal' }, body: JSON.stringify({ image:newPubImage, link:newPubLink||null, active:true }) }); if(res.ok){ setNewPubImage(''); setNewPubLink(''); fetchPubs(); alert('Pub ajoutée!'); } };
  const handleDeletePub = async (id) => { if(!confirm('Supprimer cette pub?')) return; await fetch(`${supabaseUrl}/rest/v1/pubs?id=eq.${id}`, { method:'DELETE', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${supabaseKey}` } }); fetchPubs(); };
  const handleTogglePub = async (p) => { await fetch(`${supabaseUrl}/rest/v1/pubs?id=eq.${p.id}`, { method:'PATCH', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${supabaseKey}`, 'Content-Type':'application/json' }, body: JSON.stringify({ active:!p.active }) }); fetchPubs(); };

  const handleEdit = (art) => { 
    setForm({ id: art.id, title: art.title, category: art.category, image: art.image||'', video: art.video||'', audio: art.audio||'', content: art.content||'', translations: art.translations||{}, gallery: art.gallery||[] }); 
    setGallery(art.gallery||[]);
    setEditLang('fr'); setShowArticles(false); setShowUsers(false); setShowFlash(false); setShowAnnonces(false); setShowPubs(false); window.scrollTo(0,0); 
  };
  const handleDelete = async (id) => { if(!confirm('Supprimer définitivement cet article?')) return; const res = await fetch(`${supabaseUrl}/rest/v1/articles?id=eq.${id}`, { method: 'DELETE', headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }); if(res.ok) fetchArticles(); };
  const handleAddUser = () => { if(!newU ||!newP) return; saveUsers([...users, { user: newU, pass: newP, role: 'journaliste' }]); setNewU(''); setNewP(''); };
  const handleDeleteUser = (u) => { if(u==='Rius') return alert('On ne supprime pas le compte principal'); if(confirm(`Supprimer ${u}?`)) saveUsers(users.filter(x=>x.user!==u)); };
  const filtered = articles.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));

  const currentTitle = editLang==='fr'? form.title : (form.translations[editLang]?.title || '')
  const currentContent = editLang==='fr'? form.content : (form.translations[editLang]?.content || '')

  if(!isLogged){
    return(
      <div style={{minHeight:'100vh', background:'#2e4fb0', display:'flex', justifyContent:'center', alignItems:'center', padding:16}}>
        <form onSubmit={e=>{e.preventDefault(); handleLogin();}} style={{background:'white', padding:28, borderRadius:16, width:390}}>
          <div style={{textAlign:'center', marginBottom:18}}>
            <img src="/logo.png" style={{width:74, height:74, borderRadius:'50%'}} alt="" />
            <h2 style={{margin:'10px 0 6px', color:'#2e4fb0'}}>Rius Multimédia</h2>
            <div style={{color:'#444'}}><Slogan size={1} /></div>
          </div>
          <input placeholder="Utilisateur" value={user} onChange={e=>setUser(e.target.value)} style={{width:'100%',padding:12,marginBottom:10,borderRadius:10,border:'1px solid #d1d5db'}} />
          <input type="password" placeholder="Mot de passe" value={pass} onChange={e=>setPass(e.target.value)} style={{width:'100%',padding:12,marginBottom:14,borderRadius:10,border:'1px solid #d1d5db'}} />
          <button type="submit" style={{width:'100%',padding:12,background:'#2e4fb0',color:'white',fontWeight:800,borderRadius:10,border:0, cursor:'pointer'}}>SE CONNECTER</button>
        </form>
      </div>
    );
  }

  return(
    <div style={{minHeight:'100vh', background:'#eef2ff', fontFamily:'Inter, Arial'}}>
      <style>{`* {box-sizing:border-box} input, select, textarea{outline:none} input:focus, select:focus, textarea:focus{border-color:#2e4fb0!important}`}</style>

      <div style={{background:'#2e4fb0', color:'white', padding:'12px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:10, borderBottom:'3px solid #ffcc00'}}>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <img src="/logo.png" style={{width:40, height:40, borderRadius:'50%'}} alt="" />
          <div>
            <div style={{display:'flex', alignItems:'center', gap:6}}><b style={{fontSize:14}}>Rius Admin</b><span style={{background:'#ffcc00', color:'#0f2040', padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:900}}>{currentUser.user}</span></div>
            <div style={{fontSize:9, marginTop:3}}>{SLOGAN_L1} - {SLOGAN_L2}</div>
          </div>
        </div>
        <div style={{display:'flex', gap:6}}>
          <button onClick={handleChangeMyPass} style={{background:'#ffcc00', color:'#0f2040', border:0, borderRadius:8, padding:'7px 12px', fontSize:11, fontWeight:900, cursor:'pointer'}}>🔑 Mdp</button>
          <button onClick={handleLogout} style={{background:'white', color:'#2e4fb0', border:0, borderRadius:8, padding:'7px 12px', fontSize:11, fontWeight:800, cursor:'pointer'}}>Déconnexion</button>
        </div>
      </div>

      <div style={{maxWidth:900, margin:'20px auto', padding:'0 12px'}}>
        <div style={{display:'flex', gap:6, marginBottom:16, overflowX:'auto'}}>
          <button onClick={()=>{setShowArticles(!showArticles); setShowUsers(false); setShowFlash(false); setShowAnnonces(false); setShowPubs(false);}} style={{flex:'1 0 80px', padding:'10px', fontSize:11, borderRadius:10, border:'1px solid #c7d2fe', background: showArticles? '#2e4fb0':'white', color: showArticles? 'white':'#2e4fb0', fontWeight:800}}>📰 Articles ({articles.length})</button>
          <button onClick={()=>{setShowFlash(!showFlash); setShowArticles(false); setShowUsers(false); setShowAnnonces(false); setShowPubs(false);}} style={{flex:'1 0 80px', padding:'10px', fontSize:11, borderRadius:10, border:'1px solid #c7d2fe', background: showFlash? '#2e4fb0':'white', color: showFlash? 'white':'#2e4fb0', fontWeight:800}}>⚡ Flash ({flashes.length})</button>
          <button onClick={()=>{setShowAnnonces(!showAnnonces); setShowArticles(false); setShowUsers(false); setShowFlash(false); setShowPubs(false);}} style={{flex:'1 0 90px', padding:'10px', fontSize:11, borderRadius:10, border:'1px solid #fde68a', background: showAnnonces? '#ffcc00':'white', color: '#0f2040', fontWeight:900}}>📢 Annonces ({annonces.length})</button>
          <button onClick={()=>{setShowPubs(!showPubs); setShowArticles(false); setShowUsers(false); setShowFlash(false); setShowAnnonces(false);}} style={{flex:'1 0 80px', padding:'10px', fontSize:11, borderRadius:10, border:'1px solid #c7d2fe', background: showPubs? '#2e4fb0':'white', color: showPubs? 'white':'#2e4fb0', fontWeight:800}}>📢 Pubs ({pubs.length})</button>
          {currentUser.role==='admin'&&(<button onClick={()=>{setShowUsers(!showUsers); setShowArticles(false); setShowFlash(false); setShowAnnonces(false); setShowPubs(false);}} style={{flex:'1 0 70px', padding:'10px', fontSize:11, borderRadius:10, border:'1px solid #c7d2fe', background: showUsers? '#2e4fb0':'white', color: showUsers? 'white':'#2e4fb0', fontWeight:800}}>👥 Users</button>)}
          <button onClick={()=>{setShowArticles(false); setShowUsers(false); setShowFlash(false); setShowAnnonces(false); setShowPubs(false);}} style={{flex:'1 0 80px', padding:'10px', fontSize:11, borderRadius:10, border:'1px solid #c7d2fe', background:!showArticles &&!showUsers &&!showFlash &&!showAnnonces &&!showPubs? '#ffcc00':'white', color:'#0f2040', fontWeight:900}}>✍ Nouveau</button>
        </div>

        {showUsers? (
          <div style={{background:'white', padding:16, borderRadius:14, borderTop:'4px solid #2e4fb0'}}>
            <h3 style={{marginTop:0, color:'#2e4fb0'}}>Gestion utilisateurs</h3>
            {users.map(u=>(<div key={u.user} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #eef2ff',fontSize:13}}><span><b>{u.user}</b></span><button onClick={()=>handleDeleteUser(u.user)} style={{color:'#ef4444',background:'none',border:0,fontSize:11,cursor:'pointer',fontWeight:700}}>Supprimer</button></div>))}
            <div style={{marginTop:14, display:'flex',gap:6}}><input placeholder="Nouvel user" value={newU} onChange={e=>setNewU(e.target.value)} style={{flex:1,padding:10,borderRadius:10,border:'1px solid #c7d2fe'}}/><input placeholder="Mot de passe" value={newP} onChange={e=>setNewP(e.target.value)} style={{flex:1,padding:10,borderRadius:10,border:'1px solid #c7d2fe'}}/><button onClick={handleAddUser} style={{background:'#2e4fb0',color:'white',borderRadius:10,border:0,padding:'0 16px',fontWeight:800}}>AJOUTER</button></div>
          </div>
        ) : showFlash? (
          <div style={{background:'white', padding:16, borderRadius:14, borderTop:'4px solid #ffcc00'}}>
            <h3 style={{marginTop:0, color:'#0f2040'}}>⚡ Bande noire - Infos Flash</h3>
            <div style={{display:'flex', gap:6, marginBottom:14}}>
              <input placeholder="Ex: Togo : Ouverture du marché..." value={newFlash} onChange={e=>setNewFlash(e.target.value)} style={{flex:1,padding:11,borderRadius:10,border:'1px solid #c7d2fe'}} />
              <button onClick={handleAddFlash} style={{background:'#0f2040',color:'white',borderRadius:10,border:0,padding:'0 16px',fontWeight:800,cursor:'pointer'}}>Ajouter</button>
            </div>
            {flashes.map(f=>(
              <div key={f.id} style={{border:'1px solid #e5e7eb', padding:10, borderRadius:10, display:'flex', gap:10, alignItems:'center', marginBottom:6}}>
                <div style={{flex:1, fontSize:13}}>{f.text}</div>
                <button onClick={()=>handleToggleFlash(f)} style={{background: f.active?'#dcfce7':'#fee2e2', border:0, borderRadius:6, padding:'4px 8px', fontSize:10}}>{f.active?'ON':'OFF'}</button>
                <button onClick={()=>handleDeleteFlash(f.id)} style={{background:'#fee2e2',color:'#dc2626',border:0,borderRadius:6,padding:'6px 10px',fontSize:11}}>🗑</button>
              </div>
            ))}
          </div>
        ) : showAnnonces? (
          <div style={{background:'white', padding:16, borderRadius:14, borderTop:'4px solid #0f2040'}}>
            <h3 style={{marginTop:0, color:'#0f2040'}}>📢 Bande blanche - Annonces défilantes</h3>
            <div style={{display:'flex', gap:6, marginBottom:14}}>
              <input placeholder="Ex: 🔴 EN DIRECT 20h : Débat Politique" value={newAnnonce} onChange={e=>setNewAnnonce(e.target.value)} style={{flex:1,padding:11,borderRadius:10,border:'1px solid #c7d2fe'}} />
              <button onClick={handleAddAnnonce} style={{background:'#0f2040',color:'#ffcc00',borderRadius:10,border:0,padding:'0 16px',fontWeight:800,cursor:'pointer'}}>Ajouter</button>
            </div>
            {annonces.map(a=>(
              <div key={a.id} style={{border:'1px solid #e5e7eb', padding:10, borderRadius:10, display:'flex', gap:10, alignItems:'center', marginBottom:6}}>
                <div style={{flex:1, fontSize:13}}>{a.text}</div>
                <button onClick={()=>handleToggleAnnonce(a)} style={{background: a.active?'#dcfce7':'#fee2e2', border:0, borderRadius:6, padding:'4px 8px', fontSize:10}}>{a.active?'ON':'OFF'}</button>
                <button onClick={()=>handleDeleteAnnonce(a.id)} style={{background:'#fee2e2',color:'#dc2626',border:0,borderRadius:6,padding:'6px 10px',fontSize:11}}>🗑</button>
              </div>
            ))}
          </div>
        ) : showPubs? (
          <div style={{background:'white', padding:16, borderRadius:14, borderTop:'4px solid #2e4fb0'}}>
            <h3 style={{marginTop:0, color:'#2e4fb0'}}>📢 Pubs Header - 728x90</h3>
            <div style={{border:'2px dashed #93c5fd', padding:12, borderRadius:12, background:'#f0f7ff', marginBottom:12}}>
              <input type="file" accept="image/*" onChange={e=>uploadFile('pubs', e.target.files[0], true)} style={{width:'100%',fontSize:12}} />
              {uploading==='pubs' && <div style={{fontSize:11,color:'#2e4fb0',marginTop:6}}>⏳ Upload...</div>}
              {newPubImage && <img src={newPubImage} style={{width:'100%', height:80, objectFit:'cover', borderRadius:8, marginTop:8}} alt="" />}
              <input placeholder="Lien de la pub" value={newPubLink} onChange={e=>setNewPubLink(e.target.value)} style={{width:'100%',padding:8,marginTop:8,borderRadius:8,border:'1px solid #c7d2fe',fontSize:11}} />
              <button onClick={handleAddPub} style={{width:'100%',marginTop:8,padding:10,background:'#2e4fb0',color:'white',fontWeight:800,borderRadius:8,border:0}}>➕ Ajouter</button>
            </div>
            {pubs.map(p=>(
              <div key={p.id} style={{border:'1px solid #e5e7eb', padding:8, borderRadius:10, display:'flex', gap:10, alignItems:'center', marginBottom:6}}>
                <img src={p.image} style={{width:90,height:40,objectFit:'cover',borderRadius:6}} alt="" />
                <div style={{flex:1, fontSize:11, overflow:'hidden'}}>{p.link || 'Pas de lien'}</div>
                <button onClick={()=>handleTogglePub(p)} style={{background: p.active?'#dcfce7':'#fee2e2', border:0, borderRadius:6, padding:'4px 8px', fontSize:10}}>{p.active?'ON':'OFF'}</button>
                <button onClick={()=>handleDeletePub(p.id)} style={{background:'#fee2e2',color:'#dc2626',border:0,borderRadius:6,padding:'6px 10px',fontSize:11}}>🗑</button>
              </div>
            ))}
          </div>
        ) : showArticles? (
          <div style={{background:'white', padding:14, borderRadius:14, borderTop:'4px solid #2e4fb0'}}>
            <input placeholder="🔍 Rechercher..." value={search} onChange={e=>setSearch(e.target.value)} style={{width:'100%', padding:'11px 12px', borderRadius:10, border:'1px solid #c7d2fe', marginBottom:12}} />
            {filtered.map(a=>(
              <div key={a.id} style={{border:'1px solid #e0e7ff', padding:10, borderRadius:12, display:'flex', gap:10, alignItems:'center', marginBottom:6}}>
                <img src={a.image} style={{width:54,height:54,objectFit:'cover',borderRadius:8}} alt="" />
                <div style={{flex:1, minWidth:0}}><div style={{fontWeight:800,fontSize:13,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.title}</div><div style={{fontSize:11,color:'#64748b'}}>{a.category} {a.gallery?.length? `• ${a.gallery.length} médias`:''} {a.gallery?.some(g=>g.url.includes('youtube')||g.url.includes('youtu.be'))? '• YouTube':''}</div></div>
                <button onClick={()=>handleEdit(a)} style={{background:'#2e4fb0',color:'white',border:0,borderRadius:8,padding:'8px 12px',fontSize:12,cursor:'pointer'}}>✏</button>
                <button onClick={()=>handleDelete(a.id)} style={{background:'#fee2e2',color:'#dc2626',border:0,borderRadius:8,padding:'8px 12px',fontSize:12,cursor:'pointer'}}>🗑</button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{background:'white', padding:16, borderRadius:14, borderTop:'4px solid #2e4fb0'}}>
            <div style={{display:'flex', gap:6, marginBottom:12, flexWrap:'wrap', alignItems:'center'}}>
              <span style={{fontSize:11, fontWeight:900}}>Langue édition :</span>
              {LANGS.map(l=><button key={l} onClick={()=>setEditLang(l)} style={{padding:'6px 10px', borderRadius:20, border:'1px solid #c7d2fe', background: editLang===l?'#2e4fb0':'white', color:editLang===l?'white':'#2e4fb0', fontWeight:800, fontSize:11, cursor:'pointer'}}>{LABELS[l]}</button>)}
              <button onClick={handleAutoTranslate} disabled={translating} style={{marginLeft:8, background: translating?'#94a3b8':'#ffcc00', color:'#0f2040', border:0, borderRadius:20, padding:'6px 14px', fontWeight:900, fontSize:11, cursor:'pointer'}}>{translating?'⏳ Traduction...':'🌐 Traduire auto'}</button>
            </div>
            <div style={{display:'grid', gap:12}}>
              <div><label style={{fontSize:11,fontWeight:800,color:'#2e4fb0'}}>TITRE * [{editLang.toUpperCase()}]</label><input placeholder="Titre accrocheur..." value={currentTitle} onChange={e=>{ if(editLang==='fr') setForm({...form,title:e.target.value}); else setForm({...form, translations:{...form.translations, [editLang]:{...form.translations[editLang], title:e.target.value, content: currentContent}}}) }} style={{width:'100%',padding:'12px',marginTop:4,borderRadius:10,border:'1px solid #c7d2fe',fontWeight:700,fontSize:14}} /></div>
              <div><label style={{fontSize:11,fontWeight:800,color:'#2e4fb0'}}>CATÉGORIE</label><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={{width:'100%',padding:'12px',marginTop:4,borderRadius:10,border:'1px solid #c7d2fe'}}><option>ACCUEIL</option><option>POLITIQUE</option><option>CULTURE</option><option>SOCIÉTÉ</option><option>SANTÉ</option><option>SPORT</option><option>ENVIRONNEMENT</option><option>INTERNATIONAL</option><option>ESPACE BUSINESS</option></select></div>
              
              <div style={{border:'2px dashed #93c5fd', padding:12, borderRadius:12, background:'#f0f7ff'}}>
                <div style={{fontSize:11,fontWeight:900,color:'#2e4fb0', marginBottom:6}}>📷 PHOTO PRINCIPALE</div>
                <input type="file" accept="image/*" onChange={e=>uploadFile('images', e.target.files[0])} style={{width:'100%',fontSize:12}} />
                {uploading==='images' && <div style={{fontSize:11,color:'#2e4fb0',marginTop:6}}>⏳ Upload...</div>}
                {form.image && <img src={form.image} style={{width:'100%', maxHeight:180, objectFit:'cover', borderRadius:10, marginTop:8}} alt="" />}
                <input placeholder="ou colle un lien image" value={form.image} onChange={e=>setForm({...form,image:e.target.value})} style={{width:'100%',padding:'8px',marginTop:8,borderRadius:8,border:'1px solid #c7d2fe',fontSize:11}} />
              </div>

              {/* YOUTUBE DEDIE - NOUVEAU */}
              <div style={{border:'2px solid #ff0000', padding:14, borderRadius:12, background:'#fff0f0'}}>
                <div style={{fontSize:12,fontWeight:900,color:'#b91c1c', marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <span>🎥 VIDÉO YOUTUBE (0 Mo Supabase - Recommandé)</span>
                  <a href={YOUTUBE_STUDIO} target="_blank" rel="noreferrer" style={{fontSize:10, background:'#ff0000', color:'white', padding:'3px 8px', borderRadius:12, textDecoration:'none'}}>Ouvrir YouTube Studio</a>
                </div>
                <div style={{display:'flex', gap:6}}>
                  <input placeholder="Colle lien YouTube: https://youtu.be/... ou https://www.youtube.com/watch?v=..." value={youtubeInput} onChange={e=>setYoutubeInput(e.target.value)} style={{flex:1,padding:'10px',borderRadius:8,border:'1px solid #fca5a5',fontSize:12}} />
                  <button type="button" onClick={handleAddYoutube} style={{background:'#ff0000', color:'white', border:0, padding:'0 14px', borderRadius:8, fontWeight:900, fontSize:12, cursor:'pointer'}}>➕ Ajouter</button>
                </div>
                <input placeholder="Légende vidéo (optionnel)" value={youtubeCaption} onChange={e=>setYoutubeCaption(e.target.value)} style={{width:'100%',padding:'8px',marginTop:6,borderRadius:8,border:'1px solid #fca5a5',fontSize:11}} />
                {youtubeInput && getYoutubeId(youtubeInput) && (
                  <div style={{marginTop:10, display:'flex', gap:10, background:'white', padding:8, borderRadius:8, border:'1px solid #fecaca'}}>
                    <img src={getYoutubeThumb(youtubeInput)} style={{width:120, height:68, objectFit:'cover', borderRadius:6}} alt="" />
                    <div style={{fontSize:11}}><b style={{color:'#b91c1c'}}>Aperçu :</b><br/>ID: {getYoutubeId(youtubeInput)}<br/><span style={{color:'#16a34a', fontWeight:700}}>✅ 0 Mo utilisé sur Supabase</span><br/><span style={{fontSize:10, color:'#666'}}>Sera affiché comme sur DW/BBC avec ▶</span></div>
                  </div>
                )}
                <div style={{fontSize:10, color:'#666', marginTop:6}}>💡 Astuce: Tu peux ajouter plusieurs vidéos YouTube. Elles apparaîtront dans l'article les unes sous les autres + en miniature auto dans le body.</div>
              </div>

              {/* GALERIE MULTI */}
              <div style={{border:'2px solid #ffcc00', padding:14, borderRadius:12, background:'#fffbe6'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10, flexWrap:'wrap', gap:8}}>
                  <div style={{fontSize:11,fontWeight:900,color:'#92400e'}}>🖼🎬 GALERIE PLEIN ARTICLE ({gallery.length} médias)</div>
                  <div style={{display:'flex', gap:6}}>
                    <button type="button" onClick={()=>galleryInputRef.current.click()} style={{background:'#000', color:'white', border:0, padding:'6px 10px', borderRadius:8, fontWeight:800, fontSize:11, cursor:'pointer'}}>{uploading==='gallery'?'⏳...':'📁 PC'}</button>
                    <button type="button" onClick={()=>addGalleryUrl('image')} style={{background:'#2e4fb0', color:'white', border:0, padding:'6px 10px', borderRadius:8, fontWeight:700, fontSize:11, cursor:'pointer'}}>+ Image URL</button>
                    <button type="button" onClick={()=>addGalleryUrl('video')} style={{background:'#ff0000', color:'white', border:0, padding:'6px 10px', borderRadius:8, fontWeight:800, fontSize:11, cursor:'pointer'}}>+ Vidéo URL</button>
                  </div>
                </div>

                <input ref={galleryInputRef} type="file" multiple accept="image/*,video/*" onChange={e=>uploadGalleryFiles(e.target.files)} style={{display:'none'}} />

                <div onDragOver={e=>{e.preventDefault(); e.currentTarget.style.background='#fff3a0'}} onDragLeave={e=>e.currentTarget.style.background='white'} onDrop={e=>{e.preventDefault(); e.currentTarget.style.background='white'; uploadGalleryFiles(e.dataTransfer.files)}} style={{border:'2px dashed #facc15', background:'white', padding:12, borderRadius:10, textAlign:'center', marginBottom:10, fontSize:11, color:'#666'}}>
                  Glisse ici plusieurs images/vidéos depuis ton PC<br/><span style={{fontSize:10}}>JPG, PNG, MP4, MOV - Upload auto vers Supabase</span>
                </div>

                {gallery.length===0 && <div style={{fontSize:11, opacity:0.6, textAlign:'center', padding:8}}>Aucun média. Ajoute des vidéos YouTube ci-dessus (0 Mo) ou des images depuis ton PC.</div>}

                {gallery.map((item,i)=>(
                  <div key={i} style={{background:'white', padding:8, borderRadius:10, marginBottom:8, border: item.url.includes('youtube')||item.url.includes('youtu.be') ? '1px solid #fca5a5' : '1px solid #fde68a', display:'flex', gap:10}}>
                    <div style={{width:64, height:48, borderRadius:6, overflow:'hidden', background:'#000', flexShrink:0}}>
                      {item.url.includes('youtube')||item.url.includes('youtu.be') ? <img src={getYoutubeThumb(item.url)} style={{width:'100%',height:'100%',objectFit:'cover'}} alt="" /> : item.type==='video' ? <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',background:'#000',color:'white'}}>▶</div> : <img src={item.url} style={{width:'100%',height:'100%',objectFit:'cover'}} alt="" />}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{display:'flex', gap:4, marginBottom:4}}><span style={{background: item.url.includes('youtube')||item.url.includes('youtu.be') ? '#ff0000' : item.type==='image'?'#162f6b':'#ff0000', color:'white', padding:'1px 5px', borderRadius:4, fontSize:9, fontWeight:800}}>{item.url.includes('youtube')||item.url.includes('youtu.be')? 'YOUTUBE' : item.type.toUpperCase()} #{i+1} {item.url.includes('youtube')||item.url.includes('youtu.be')? '• 0 Mo':''}</span></div>
                      <input value={item.url} onChange={e=>updateGallery(i,'url',e.target.value)} placeholder={item.type==='image'?'URL image':'URL YouTube / mp4'} style={{padding:6, borderRadius:6, border:'1px solid #ddd', width:'100%', marginBottom:4, fontSize:11}} />
                      <input value={item.caption} onChange={e=>updateGallery(i,'caption',e.target.value)} placeholder="Légende (optionnel)" style={{padding:6, borderRadius:6, border:'1px solid #ddd', width:'100%', fontSize:11}} />
                    </div>
                    <div style={{display:'flex', flexDirection:'column', gap:3}}>
                      <button type="button" onClick={()=>moveGallery(i,'up')} style={{border:'1px solid #ddd', background:'white', borderRadius:4, cursor:'pointer', fontSize:11}}>↑</button>
                      <button type="button" onClick={()=>moveGallery(i,'down')} style={{border:'1px solid #ddd', background:'white', borderRadius:4, cursor:'pointer', fontSize:11}}>↓</button>
                      <button type="button" onClick={()=>removeGallery(i)} style={{border:0, background:'#ff3b3b', color:'white', borderRadius:4, cursor:'pointer', padding:'2px 6px', fontSize:11}}>✕</button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{border:'1px solid #bfdbfe', padding:12, borderRadius:12, background:'#eff6ff', opacity:0.7}}>
                <div style={{fontSize:11,fontWeight:900,color:'#2e4fb0'}}>🎥 VIDÉO YOUTUBE (ancienne - gardée pour compatibilité)</div>
                <input placeholder="https://youtube.com/watch?v=..." value={form.video} onChange={e=>setForm({...form,video:e.target.value})} style={{width:'100%',padding:'10px',marginTop:8,borderRadius:8,border:'1px solid #bfdbfe',fontSize:12}} />
                <div style={{fontSize:10, color:'#666', marginTop:4}}>Utilise plutôt le champ rouge YouTube ci-dessus, plus pratique.</div>
              </div>
              <div style={{border:'1px solid #fde68a', padding:12, borderRadius:12, background:'#fffbeb'}}>
                <div style={{fontSize:11,fontWeight:900,color:'#92400e'}}>🎧 AUDIO / PODCAST</div>
                <input type="file" accept="audio/*" onChange={e=>uploadFile('audios', e.target.files[0])} style={{width:'100%',fontSize:12, marginTop:6}} />
                {uploading==='audios' && <div style={{fontSize:11,color:'#d97706',marginTop:6}}>⏳ Upload...</div>}
                {form.audio && <audio controls src={form.audio} style={{width:'100%', marginTop:8}}></audio>}
              </div>
              <div><label style={{fontSize:11,fontWeight:800,color:'#2e4fb0'}}>CONTENU * [{editLang.toUpperCase()}]</label><textarea placeholder="Rédige ton article..." value={currentContent} onChange={e=>{ if(editLang==='fr') setForm({...form,content:e.target.value}); else setForm({...form, translations:{...form.translations, [editLang]:{...form.translations[editLang], content:e.target.value, title: currentTitle}}}) }} style={{width:'100%',padding:'12px',height:180,marginTop:4,borderRadius:10,border:'1px solid #c7d2fe',fontSize:13}} /></div>
              <div style={{display:'flex',gap:8}}>
                {form.id && <button onClick={()=>{setForm({ id:null, title:'', category:'ACCUEIL', image:'', video:'', audio:'', content:'', translations:{}, gallery:[] }); setGallery([]);}} style={{flex:1,padding:'14px',background:'#e0e7ff',borderRadius:12,border:0,fontWeight:800,cursor:'pointer', color:'#2e4fb0'}}>Annuler</button>}
                <button onClick={handlePublish} style={{flex:2,padding:'14px',background: form.id? '#f59e0b' : '#2e4fb0',color:'white',fontWeight:900,borderRadius:12,border:0,cursor:'pointer',fontSize:14}}>{form.id? '💾 METTRE À JOUR' : '🚀 PUBLIER'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
