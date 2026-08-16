
import React, { useState, useEffect, useRef } from 'react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const YOUTUBE_STUDIO = 'https://studio.youtube.com/';
const SLOGAN_L1 = "Si pres de l'info, si pres de vous";
const SLOGAN_L2 = "Voir Verifier Informer";

const LANGS = ['fr','en','es','de','ar','zh'];
const LABELS = { fr:'FR', en:'EN', es:'ES', de:'DE', ar:'AR', zh:'ZH' };

const PUB_SLOTS = [
  { value:'header', label:'Bandeau Header (toutes pages) - 728x90' },
  { value:'home-band', label:'Accueil - Bandeau apres le carrousel - 728x90' },
  { value:'home-infeed', label:'Accueil - Carte dans la grille d\'articles' },
  { value:'sidebar', label:'Article - Encart sidebar - 300x250' },
  { value:'article-incontent', label:'Article - Bandeau sous l\'image - 728x90' },
];
const slotLabel = (v) => (PUB_SLOTS.find(s=>s.value===v)?.label) || 'Bandeau Header (toutes pages) - 728x90';

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

const uid = () => Math.random().toString(36).slice(2,9)

export default function Admin() {
  const [isLogged, setIsLogged] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [blocks, setBlocks] = useState([{id:uid(), type:'text', content:''}]);
  const [form, setForm] = useState({ id:null, title:'', category:'ACCUEIL', image:'', translations:{}, gallery:[] });
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
  const [showRadio, setShowRadio] = useState(false);
  const [showVideoTV, setShowVideoTV] = useState(false);
  const [showKiosque, setShowKiosque] = useState(false);
  const [users, setUsers] = useState([{ user: 'Rius', pass: 'Rius2025', role: 'admin' }]);
  const [articles, setArticles] = useState([]);
  const [flashes, setFlashes] = useState([]);
  const [annonces, setAnnonces] = useState([]);
  const [pubs, setPubs] = useState([]);
  const [radioPlaylist, setRadioPlaylist] = useState([]);
  const [videoPlaylist, setVideoPlaylist] = useState([]);
  const [unes, setUnes] = useState([]);
  const [newFlash, setNewFlash] = useState('');
  const [newAnnonce, setNewAnnonce] = useState('');
  const [newPubImage, setNewPubImage] = useState('');
  const [newPubLink, setNewPubLink] = useState('');
  const [newPubSlot, setNewPubSlot] = useState('header');
  const [newRadioTitle, setNewRadioTitle] = useState('');
  const [editingRadioId, setEditingRadioId] = useState(null);
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [newRadioAudio, setNewRadioAudio] = useState('');
  const [newRadioImage, setNewRadioImage] = useState('');
  const [newUneImage, setNewUneImage] = useState('');
  const [newUneJournal, setNewUneJournal] = useState('');
  const [newUneTitle, setNewUneTitle] = useState('');
  const [newUneDate, setNewUneDate] = useState(new Date().toISOString().split('T')[0]);
  const [newU, setNewU] = useState('');
  const [newP, setNewP] = useState('');
  const [uploading, setUploading] = useState('');
  const [search, setSearch] = useState('');
  const galleryInputRef = useRef(null);
  const blockFileRef = useRef({});

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
    fetchArticles(); fetchFlashes(); fetchAnnonces(); fetchPubs(); fetchUnes(); fetchRadioPlaylist(); fetchVideoPlaylist();
  }, []);

  useEffect(() => {
    if(!isLogged) return;
    const resetTimer = () => setLastActivity(Date.now());
    const events = ['mousemove','keydown','click','scroll','touchstart'];
    if (typeof window !== 'undefined') events.forEach(e=> window.addEventListener(e, resetTimer));
    const interval = setInterval(()=>{
      const diff = Date.now() - lastActivity;
      if(diff > TIMEOUT_MIN * 60 * 1000){
        alert(`Session expiree apres ${TIMEOUT_MIN} min d'inactivite`);
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
  const fetchUnes = () => {
    fetch(`${supabaseUrl}/rest/v1/unes?select=*&order=date.desc`, { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } })
  .then(r=>r.json()).then(data=>{ if(Array.isArray(data)) setUnes(data); }).catch(()=>{});
  };
  const fetchRadioPlaylist = () => {
    fetch(`${supabaseUrl}/rest/v1/radio_playlist?select=*&order=id.asc`, { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } })
  .then(r=>r.json()).then(data=>{ if(Array.isArray(data)) setRadioPlaylist(data); }).catch(()=>{});
  };
  const fetchVideoPlaylist = () => {
    fetch(`${supabaseUrl}/rest/v1/video_playlist?select=*&order=id.asc`, { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } })
  .then(r=>r.json()).then(data=>{ if(Array.isArray(data)) setVideoPlaylist(data); }).catch(()=>{});
  };

  const addBlock = (type, afterId=null) => {
    const newBlock = { id:uid(), type, content:'', url:'', caption:'', title:'' }
    if(type==='text') newBlock.content=''
    if(afterId){
      const idx = blocks.findIndex(b=>b.id===afterId)
      const copy=[...blocks]
      copy.splice(idx+1,0,newBlock)
      setBlocks(copy)
    } else {
      setBlocks([...blocks, newBlock])
    }
  }
  const updateBlock = (id, field, val) => {
    setBlocks(blocks.map(b=> b.id===id? {...b, [field]:val}: b))
  }
  const removeBlock = (id) => {
    if(blocks.length===1) return alert('Garde au moins 1 bloc')
    setBlocks(blocks.filter(b=>b.id!==id))
  }
  const moveBlock = (id, dir) => {
    const idx=blocks.findIndex(b=>b.id===id)
    const nIdx=dir==='up'? idx-1: idx+1
    if(nIdx<0 || nIdx>=blocks.length) return
    const copy=[...blocks]
    const tmp=copy[idx]; copy[idx]=copy[nIdx]; copy[nIdx]=tmp
    setBlocks(copy)
  }

  const uploadUne = async (file) => {
    if(!file) return null;
    if(file.type.startsWith('image/')){ file = await compressImage(file); }
    setUploading('UNE');
    try{
      const fileName = `UNE_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const res = await fetch(`${supabaseUrl}/storage/v1/object/images/${fileName}`, {
        method: 'POST',
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'x-upsert': 'true', 'Content-Type': file.type },
        body: file
      });
      if(!res.ok) throw new Error(await res.text());
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/images/${fileName}`;
      setForm(f=>({...f, image: publicUrl}));
      return publicUrl;
    }catch(e){ alert('Erreur upload Une: '+e.message); return null; }
    finally{ setUploading(''); }
  };

  const uploadBloc = async (blockId, file) => {
    if(!file || !blockId) return null;
    if(file.type.startsWith('image/')){ file = await compressImage(file); }
    setUploading(`block-${blockId}`);
    try{
      const fileName = `BLOC_${blockId}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const res = await fetch(`${supabaseUrl}/storage/v1/object/images/${fileName}`, {
        method: 'POST',
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'x-upsert': 'true', 'Content-Type': file.type },
        body: file
      });
      if(!res.ok) throw new Error(await res.text());
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/images/${fileName}`;
      setBlocks(prev => prev.map(b=> b.id===blockId ? {...b, url: publicUrl} : b));
      return publicUrl;
    }catch(e){ alert('Erreur upload bloc: '+e.message); return null; }
    finally{ setUploading(''); }
  };

  const uploadFile = async (bucket, file, isPub=false, blockId=null) => {
    if(isPub) {
      if(!file) return null;
      if(file.type.startsWith('image/')){ file = await compressImage(file); }
      setUploading('pubs');
      try{
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const res = await fetch(`${supabaseUrl}/storage/v1/object/pubs/${fileName}`, {
          method: 'POST',
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'x-upsert': 'true', 'Content-Type': file.type },
          body: file
        });
        if(!res.ok) throw new Error(await res.text());
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/pubs/${fileName}`;
        setNewPubImage(publicUrl);
        return publicUrl;
      }catch(e){ alert('Erreur upload: '+e.message); return null; }
      finally{ setUploading(''); }
    }
    if(blockId) return uploadBloc(blockId, file);
    return uploadUne(file);
  };

  const uploadRadioAudio = async (file) => {
    if(!file) return null;
    setUploading('radio-audio');
    try{
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const res = await fetch(`${supabaseUrl}/storage/v1/object/radio/${fileName}`, {
        method: 'POST',
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'x-upsert': 'true', 'Content-Type': file.type },
        body: file
      });
      if(!res.ok) throw new Error(await res.text());
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/radio/${fileName}`;
      setNewRadioAudio(publicUrl);
      return publicUrl;
    }catch(e){ alert('Erreur upload audio: '+e.message); return null; }
    finally{ setUploading(''); }
  };

  const uploadRadioImage = async (file) => {
    if(!file) return null;
    let f=file;
    if(file.type.startsWith('image/')){ f = await compressImage(file, 500, 0.7); }
    setUploading('radio-image');
    try{
      const fileName = `COVER_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const res = await fetch(`${supabaseUrl}/storage/v1/object/radio/${fileName}`, {
        method: 'POST',
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'x-upsert': 'true', 'Content-Type': f.type },
        body: f
      });
      if(!res.ok) throw new Error(await res.text());
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/radio/${fileName}`;
      setNewRadioImage(publicUrl);
      return publicUrl;
    }catch(e){ alert('Erreur upload pochette: '+e.message); return null; }
    finally{ setUploading(''); }
  };

  const uploadKiosqueImage = async (file) => {
    if(!file) return null;
    let f=file;
    if(file.type.startsWith('image/')){ f = await compressImage(file, 900, 0.7); }
    setUploading('kiosque');
    try{
      const fileName = `KIOSQUE_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const res = await fetch(`${supabaseUrl}/storage/v1/object/images/${fileName}`, {
        method: 'POST',
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'x-upsert': 'true', 'Content-Type': f.type },
        body: f
      });
      if(!res.ok) throw new Error(await res.text());
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/images/${fileName}`;
      setNewUneImage(publicUrl);
      return publicUrl;
    }catch(e){ alert('Erreur upload Kiosque: '+e.message); return null; }
    finally{ setUploading(''); }
  };

  const saveUsers = (newList) => {
    setUsers(newList);
    fetch('/api/users', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(newList) });
  };

  const handleLogin = () => {
    const found = users.find(u => u.user === user && u.pass === pass);
    if (found) { setCurrentUser(found); setIsLogged(true); setShowUsers(false); setShowArticles(false); setShowFlash(false); setShowAnnonces(false); setShowPubs(false); setShowKiosque(false); }
    else alert('Identifiants incorrects');
  };

  const handleLogout = () => {
    setIsLogged(false); setCurrentUser(null); setUser(''); setPass('');
    setForm({ id:null, title:'', category:'ACCUEIL', image:'', translations:{}, gallery:[] });
    setBlocks([{id:uid(), type:'text', content:''}])
    setGallery([]);
    setYoutubeInput(''); setYoutubeCaption('');
    setShowUsers(false); setShowArticles(false); setShowFlash(false); setShowAnnonces(false); setShowPubs(false); setShowKiosque(false);
  };

  const handleChangeMyPass = () => {
    const np = prompt(`Nouveau mot de passe pour ${currentUser.user} :`);
    if(np && np.trim()){
      const newList = users.map(x=> x.user===currentUser.user? {...x, pass:np.trim()}:x);
      saveUsers(newList);
      alert('Mot de passe change : ' + np.trim());
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
    if(!form.title ||!blocks.some(b=>b.type==='text'&&b.content)) return alert('Ecris d abord titre et un bloc texte en FR')
    setTranslating(true)
    let newTrans = {...form.translations}
    const fullText = blocks.filter(b=>b.type==='text').map(b=>b.content).join(' ').slice(0,800)
    for(let lang of LANGS){
      if(lang==='fr') continue
      const tTitle = await translateText(form.title, lang)
      const tContent = await translateText(fullText, lang)
      newTrans[lang] = { title: tTitle, content: tContent }
    }
    setForm(f=>({...f, translations: newTrans}))
    setTranslating(false)
    alert('Traduit en 5 langues!')
  }

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
    if(!id) return alert('Lien YouTube invalide.')
    const url = youtubeInput.trim()
    setBlocks([...blocks, {id:uid(), type:'youtube', url, caption: youtubeCaption}])
    setGallery([...gallery, {type:'video', url, caption: youtubeCaption}])
    setYoutubeInput('')
    setYoutubeCaption('')
  }

  const handlePublish = async () => {
    if(!form.title) return alert('Titre obligatoire');
    if(!blocks.some(b=> (b.type==='text'&&b.content.trim()) || b.url)) return alert('Ajoute au moins un bloc texte ou media');
    try{
      const textContent = blocks.filter(b=>b.type==='text').map(b=>b.content).join('\n\n')
      const firstAudio = blocks.find(b=>b.type==='audio')?.url || null
      const firstVideo = blocks.find(b=>b.type==='video' || b.type==='youtube')?.url || null
      const compiledGallery = [
        ...blocks.filter(b=>b.type!=='text').map(b=>({type: b.type==='audio'?'audio': b.type==='image'?'image':'video', url:b.url, caption:b.caption||'', title:b.title||''})),
        ...gallery
      ].filter(g=>g.url)

      let payload = { 
        title: form.title, 
        category: form.category, 
        image: form.image, 
        video: firstVideo, 
        audio: firstAudio, 
        content: textContent || "Contenu en blocs", 
        translations: form.translations, 
        gallery: compiledGallery.length? compiledGallery : null,
        blocks: blocks
      }
      if(!payload.image && compiledGallery.length){
        const firstYt = compiledGallery.find(g=> g.url && (g.url.includes('youtube') || g.url.includes('youtu.be')))
        if(firstYt){
          const thumb = getYoutubeThumb(firstYt.url)
          if(thumb) payload.image = thumb
        }
        if(!payload.image){
          const firstImg = compiledGallery.find(g=>g.type==='image')
          if(firstImg) payload.image = firstImg.url
        }
      }

      let url = form.id? `${supabaseUrl}/rest/v1/articles?id=eq.${form.id}` : `${supabaseUrl}/rest/v1/articles`
      let method = form.id? 'PATCH' : 'POST'
      let res = await fetch(url, {
        method, headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
        body: JSON.stringify(payload)
      });
      if(!res.ok){
        const txt = await res.text()
        if(txt.includes('blocks')){
          delete payload.blocks
          res = await fetch(url, {
            method, headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
            body: JSON.stringify(payload)
          });
          if(res.ok) alert('Publie sans colonne blocks (ajoute colonne blocks jsonb dans Supabase).');
          else alert(txt)
          if(res.ok){ afterPublish() }
          return
        } else {
          alert(txt)
          return
        }
      }
      alert(form.id?'Article modifie!':'Article publie!')
      afterPublish()
    }catch(e){ alert(e.message) }
  };

  const afterPublish = () => {
    setForm({ id:null, title:'', category:'ACCUEIL', image:'', translations:{}, gallery:[] }); 
    setBlocks([{id:uid(), type:'text', content:''}])
    setGallery([]); setEditLang('fr'); fetchArticles(); setShowArticles(true);
  }

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

  const handleAddPub = async () => { if(!newPubImage) return alert('Mets une image'); const res=await fetch(`${supabaseUrl}/rest/v1/pubs`, { method:'POST', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${supabaseKey}`, 'Content-Type':'application/json', 'Prefer':'return=minimal' }, body: JSON.stringify({ image:newPubImage, link:newPubLink||null, slot:newPubSlot, active:true }) }); if(res.ok){ setNewPubImage(''); setNewPubLink(''); setNewPubSlot('header'); fetchPubs(); alert('Pub ajoutee!'); } else alert(await res.text()); };
  const handleDeletePub = async (id) => { if(!confirm('Supprimer cette pub?')) return; await fetch(`${supabaseUrl}/rest/v1/pubs?id=eq.${id}`, { method:'DELETE', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${supabaseKey}` } }); fetchPubs(); };
  const handleTogglePub = async (p) => { await fetch(`${supabaseUrl}/rest/v1/pubs?id=eq.${p.id}`, { method:'PATCH', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${supabaseKey}`, 'Content-Type':'application/json' }, body: JSON.stringify({ active:!p.active }) }); fetchPubs(); };
  const handleChangePubSlot = async (p, slot) => { await fetch(`${supabaseUrl}/rest/v1/pubs?id=eq.${p.id}`, { method:'PATCH', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${supabaseKey}`, 'Content-Type':'application/json' }, body: JSON.stringify({ slot }) }); fetchPubs(); };

  const handleAddRadioTrack = async () => {
    if(!newRadioAudio) return alert('Ajoute un fichier audio');
    if(!newRadioTitle.trim()) return alert('Mets un titre pour la piste');
    const payload = { title:newRadioTitle.trim(), url:newRadioAudio, image:newRadioImage||null, active:true };
    const url = editingRadioId? `${supabaseUrl}/rest/v1/radio_playlist?id=eq.${editingRadioId}` : `${supabaseUrl}/rest/v1/radio_playlist`;
    const method = editingRadioId? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${supabaseKey}`, 'Content-Type':'application/json', 'Prefer':'return=minimal' }, body: JSON.stringify(payload) });
    if(res.ok){ setNewRadioTitle(''); setNewRadioAudio(''); setNewRadioImage(''); setEditingRadioId(null); fetchRadioPlaylist(); alert(editingRadioId? 'Piste modifiee!' : 'Piste ajoutee a la radio!'); } else alert(await res.text());
  };
  const handleEditRadioTrack = (t) => { setEditingRadioId(t.id); setNewRadioTitle(t.title||''); setNewRadioAudio(t.url||''); setNewRadioImage(t.image||''); window.scrollTo(0,0); };
  const handleCancelRadioEdit = () => { setEditingRadioId(null); setNewRadioTitle(''); setNewRadioAudio(''); setNewRadioImage(''); };
  const handleDeleteRadioTrack = async (id) => { if(!confirm('Supprimer cette piste?')) return; await fetch(`${supabaseUrl}/rest/v1/radio_playlist?id=eq.${id}`, { method:'DELETE', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${supabaseKey}` } }); fetchRadioPlaylist(); };
  const handleToggleRadioTrack = async (t) => { await fetch(`${supabaseUrl}/rest/v1/radio_playlist?id=eq.${t.id}`, { method:'PATCH', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${supabaseKey}`, 'Content-Type':'application/json' }, body: JSON.stringify({ active:!t.active }) }); fetchRadioPlaylist(); };

  const getYtId = (url) => getYoutubeId(url);
  const handleAddVideoTrack = async () => {
    if(!newVideoUrl.trim()) return alert('Colle un lien YouTube');
    const id = getYtId(newVideoUrl.trim());
    if(!id) return alert('Lien YouTube invalide');
    if(!newVideoTitle.trim()) return alert('Mets un titre pour la video');
    const thumb = getYoutubeThumb(newVideoUrl.trim());
    const payload = { title:newVideoTitle.trim(), url:newVideoUrl.trim(), image:thumb, active:true };
    const url = editingVideoId? `${supabaseUrl}/rest/v1/video_playlist?id=eq.${editingVideoId}` : `${supabaseUrl}/rest/v1/video_playlist`;
    const method = editingVideoId? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${supabaseKey}`, 'Content-Type':'application/json', 'Prefer':'return=minimal' }, body: JSON.stringify(payload) });
    if(res.ok){ setNewVideoTitle(''); setNewVideoUrl(''); setEditingVideoId(null); fetchVideoPlaylist(); alert(editingVideoId? 'Video modifiee!' : 'Video ajoutee a la playlist TV!'); } else alert(await res.text());
  };
  const handleEditVideoTrack = (v) => { setEditingVideoId(v.id); setNewVideoTitle(v.title||''); setNewVideoUrl(v.url||''); window.scrollTo(0,0); };
  const handleCancelVideoEdit = () => { setEditingVideoId(null); setNewVideoTitle(''); setNewVideoUrl(''); };
  const handleDeleteVideoTrack = async (id) => { if(!confirm('Supprimer cette video?')) return; await fetch(`${supabaseUrl}/rest/v1/video_playlist?id=eq.${id}`, { method:'DELETE', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${supabaseKey}` } }); fetchVideoPlaylist(); };
  const handleToggleVideoTrack = async (v) => { await fetch(`${supabaseUrl}/rest/v1/video_playlist?id=eq.${v.id}`, { method:'PATCH', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${supabaseKey}`, 'Content-Type':'application/json' }, body: JSON.stringify({ active:!v.active }) }); fetchVideoPlaylist(); };

  const handleAddUne = async () => {
    if(!newUneImage) return alert('Image obligatoire');
    const res=await fetch(`${supabaseUrl}/rest/v1/unes`, {
      method:'POST',
      headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${supabaseKey}`, 'Content-Type':'application/json', 'Prefer':'return=minimal' },
      body: JSON.stringify({ journal:newUneJournal.trim(), title:newUneTitle.trim()||newUneJournal.trim()||'Kiosque', image:newUneImage, date:newUneDate, active:true })
    });
    if(res.ok){ setNewUneImage(''); setNewUneJournal(''); setNewUneTitle(''); fetchUnes(); alert('Une ajoutee au Kiosque!'); } else { alert(await res.text()); }
  };
  const handleDeleteUne = async (id) => { if(!confirm('Supprimer cette Une?')) return; await fetch(`${supabaseUrl}/rest/v1/unes?id=eq.${id}`, { method:'DELETE', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${supabaseKey}` } }); fetchUnes(); };
  const handleToggleUne = async (u) => { await fetch(`${supabaseUrl}/rest/v1/unes?id=eq.${u.id}`, { method:'PATCH', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${supabaseKey}`, 'Content-Type':'application/json' }, body: JSON.stringify({ active:!u.active }) }); fetchUnes(); };

  const handleEdit = (art) => { 
    setForm({ id: art.id, title: art.title, category: art.category, image: art.image||'', translations: art.translations||{}, gallery: art.gallery||[] }); 
    if(art.blocks && Array.isArray(art.blocks) && art.blocks.length){
      setBlocks(art.blocks)
    } else {
      let b = []
      if(art.content) b.push({id:uid(), type:'text', content: art.content})
      if(art.gallery && Array.isArray(art.gallery)){
        art.gallery.forEach(g=>{
          if(g.type==='video' && (g.url.includes('youtube')||g.url.includes('youtu.be'))) b.push({id:uid(), type:'youtube', url:g.url, caption:g.caption||''})
          else b.push({id:uid(), type:g.type, url:g.url, caption:g.caption||'', content:''})
        })
      }
      if(b.length===0) b=[{id:uid(), type:'text', content:''}]
      setBlocks(b)
    }
    setGallery(art.gallery||[]);
    setEditLang('fr'); setShowArticles(false); setShowUsers(false); setShowFlash(false); setShowAnnonces(false); setShowPubs(false); setShowKiosque(false); window.scrollTo(0,0); 
  };
  const handleDelete = async (id) => { if(!confirm('Supprimer definitivement cet article?')) return; const res = await fetch(`${supabaseUrl}/rest/v1/articles?id=eq.${id}`, { method: 'DELETE', headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }); if(res.ok) fetchArticles(); };
  const handleAddUser = () => { if(!newU ||!newP) return; saveUsers([...users, { user: newU, pass: newP, role: 'journaliste' }]); setNewU(''); setNewP(''); };
  const handleDeleteUser = (u) => { if(u==='Rius') return alert('On ne supprime pas le compte principal'); if(confirm(`Supprimer ${u}?`)) saveUsers(users.filter(x=>x.user!==u)); };
  const filtered = articles.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));

  const currentTitle = editLang==='fr'? form.title : (form.translations[editLang]?.title || '')

  if(!isLogged){
    return(
      <div style={{minHeight:'100vh', background:'#2e4fb0', display:'flex', justifyContent:'center', alignItems:'center', padding:16}}>
        <form onSubmit={e=>{e.preventDefault(); handleLogin();}} style={{background:'white', padding:28, borderRadius:16, width:390}}>
          <div style={{textAlign:'center', marginBottom:18}}>
            <img src="/logo.png" style={{width:74, height:74, borderRadius:'50%'}} alt="" />
            <h2 style={{margin:'10px 0 6px', color:'#2e4fb0'}}>Rius Multimedia</h2>
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
          <button onClick={handleChangeMyPass} style={{background:'#ffcc00', color:'#0f2040', border:0, borderRadius:8, padding:'7px 12px', fontSize:11, fontWeight:900, cursor:'pointer'}}>Mdp</button>
          <button onClick={handleLogout} style={{background:'white', color:'#2e4fb0', border:0, borderRadius:8, padding:'7px 12px', fontSize:11, fontWeight:800, cursor:'pointer'}}>Deconnexion</button>
        </div>
      </div>

      <div style={{maxWidth:900, margin:'20px auto', padding:'0 12px'}}>
        <div style={{display:'flex', gap:6, marginBottom:16, overflowX:'auto', flexWrap:'wrap'}}>
          <button onClick={()=>{setShowArticles(!showArticles); setShowUsers(false); setShowFlash(false); setShowAnnonces(false); setShowPubs(false); setShowKiosque(false); setShowRadio(false); setShowVideoTV(false);}} style={{flex:'1 0 80px', padding:'10px', fontSize:11, borderRadius:10, border:'1px solid #c7d2fe', background: showArticles? '#2e4fb0':'white', color: showArticles? 'white':'#2e4fb0', fontWeight:800}}>Articles ({articles.length})</button>
          <button onClick={()=>{setShowFlash(!showFlash); setShowArticles(false); setShowUsers(false); setShowAnnonces(false); setShowPubs(false); setShowKiosque(false); setShowRadio(false); setShowVideoTV(false);}} style={{flex:'1 0 80px', padding:'10px', fontSize:11, borderRadius:10, border:'1px solid #c7d2fe', background: showFlash? '#2e4fb0':'white', color: showFlash? 'white':'#2e4fb0', fontWeight:800}}>Flash ({flashes.length})</button>
          <button onClick={()=>{setShowAnnonces(!showAnnonces); setShowArticles(false); setShowUsers(false); setShowFlash(false); setShowPubs(false); setShowKiosque(false); setShowRadio(false); setShowVideoTV(false);}} style={{flex:'1 0 90px', padding:'10px', fontSize:11, borderRadius:10, border:'1px solid #fde68a', background: showAnnonces? '#ffcc00':'white', color: '#0f2040', fontWeight:900}}>Annonces ({annonces.length})</button>
          <button onClick={()=>{setShowPubs(!showPubs); setShowArticles(false); setShowUsers(false); setShowFlash(false); setShowAnnonces(false); setShowKiosque(false); setShowRadio(false); setShowVideoTV(false);}} style={{flex:'1 0 80px', padding:'10px', fontSize:11, borderRadius:10, border:'1px solid #c7d2fe', background: showPubs? '#2e4fb0':'white', color: showPubs? 'white':'#2e4fb0', fontWeight:800}}>Pubs ({pubs.length})</button>
          <button onClick={()=>{setShowRadio(!showRadio); setShowArticles(false); setShowUsers(false); setShowFlash(false); setShowAnnonces(false); setShowPubs(false); setShowKiosque(false); setShowVideoTV(false);}} style={{flex:'1 0 80px', padding:'10px', fontSize:11, borderRadius:10, border:'1px solid #bbf7d0', background: showRadio? '#16a34a':'white', color: showRadio? 'white':'#16a34a', fontWeight:800}}>Radio ({radioPlaylist.length})</button>
          <button onClick={()=>{setShowVideoTV(!showVideoTV); setShowArticles(false); setShowUsers(false); setShowFlash(false); setShowAnnonces(false); setShowPubs(false); setShowKiosque(false); setShowRadio(false);}} style={{flex:'1 0 80px', padding:'10px', fontSize:11, borderRadius:10, border:'1px solid #fecaca', background: showVideoTV? '#dc2626':'white', color: showVideoTV? 'white':'#dc2626', fontWeight:800}}>Videos TV ({videoPlaylist.length})</button>
          <button onClick={()=>{setShowKiosque(!showKiosque); setShowArticles(false); setShowUsers(false); setShowFlash(false); setShowAnnonces(false); setShowPubs(false); setShowRadio(false); setShowVideoTV(false);}} style={{flex:'1 0 80px', padding:'10px', fontSize:11, borderRadius:10, border:'2px solid #ffcc00', background: showKiosque? '#0f2040':'white', color: showKiosque? '#ffcc00':'#0f2040', fontWeight:900}}>KIOSQUE ({unes.length})</button>
          {currentUser.role==='admin'&&(<button onClick={()=>{setShowUsers(!showUsers); setShowArticles(false); setShowFlash(false); setShowAnnonces(false); setShowPubs(false); setShowKiosque(false); setShowRadio(false); setShowVideoTV(false);}} style={{flex:'1 0 70px', padding:'10px', fontSize:11, borderRadius:10, border:'1px solid #c7d2fe', background: showUsers? '#2e4fb0':'white', color: showUsers? 'white':'#2e4fb0', fontWeight:800}}>Users</button>)}
          <button onClick={()=>{setShowArticles(false); setShowUsers(false); setShowFlash(false); setShowAnnonces(false); setShowPubs(false); setShowKiosque(false); setShowRadio(false); setShowVideoTV(false);}} style={{flex:'1 0 80px', padding:'10px', fontSize:11, borderRadius:10, border:'1px solid #c7d2fe', background:!showArticles &&!showUsers &&!showFlash &&!showAnnonces &&!showPubs &&!showKiosque &&!showRadio &&!showVideoTV? '#ffcc00':'white', color:'#0f2040', fontWeight:900}}>Nouveau</button>
        </div>

        {showUsers? (
          <div style={{background:'white', padding:16, borderRadius:14, borderTop:'4px solid #2e4fb0'}}>
            <h3 style={{marginTop:0, color:'#2e4fb0'}}>Gestion utilisateurs</h3>
            {users.map(u=>(<div key={u.user} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #eef2ff',fontSize:13}}><span><b>{u.user}</b></span><button onClick={()=>handleDeleteUser(u.user)} style={{color:'#ef4444',background:'none',border:0,fontSize:11,cursor:'pointer',fontWeight:700}}>Supprimer</button></div>))}
            <div style={{marginTop:14, display:'flex',gap:6}}><input placeholder="Nouvel user" value={newU} onChange={e=>setNewU(e.target.value)} style={{flex:1,padding:10,borderRadius:10,border:'1px solid #c7d2fe'}}/><input placeholder="Mot de passe" value={newP} onChange={e=>setNewP(e.target.value)} style={{flex:1,padding:10,borderRadius:10,border:'1px solid #c7d2fe'}}/><button onClick={handleAddUser} style={{background:'#2e4fb0',color:'white',borderRadius:10,border:0,padding:'0 16px',fontWeight:800}}>AJOUTER</button></div>
          </div>
        ) : showFlash? (
          <div style={{background:'white', padding:16, borderRadius:14, borderTop:'4px solid #ffcc00'}}>
            <h3 style={{marginTop:0, color:'#0f2040'}}>Bande noire - Infos Flash</h3>
            <div style={{display:'flex', gap:6, marginBottom:14}}>
              <input placeholder="Ex: Togo : Ouverture du marche..." value={newFlash} onChange={e=>setNewFlash(e.target.value)} style={{flex:1,padding:11,borderRadius:10,border:'1px solid #c7d2fe'}} />
              <button onClick={handleAddFlash} style={{background:'#0f2040',color:'white',borderRadius:10,border:0,padding:'0 16px',fontWeight:800,cursor:'pointer'}}>Ajouter</button>
            </div>
            {flashes.map(f=>(
              <div key={f.id} style={{border:'1px solid #e5e7eb', padding:10, borderRadius:10, display:'flex', gap:10, alignItems:'center', marginBottom:6}}>
                <div style={{flex:1, fontSize:13}}>{f.text}</div>
                <button onClick={()=>handleToggleFlash(f)} style={{background: f.active?'#dcfce7':'#fee2e2', border:0, borderRadius:6, padding:'4px 8px', fontSize:10}}>{f.active?'ON':'OFF'}</button>
                <button onClick={()=>handleDeleteFlash(f.id)} style={{background:'#fee2e2',color:'#dc2626',border:0,borderRadius:6,padding:'6px 10px',fontSize:11}}>Suppr</button>
              </div>
            ))}
          </div>
        ) : showAnnonces? (
          <div style={{background:'white', padding:16, borderRadius:14, borderTop:'4px solid #0f2040'}}>
            <h3 style={{marginTop:0, color:'#0f2040'}}>Bande blanche - Annonces defilantes</h3>
            <div style={{display:'flex', gap:6, marginBottom:14}}>
              <input placeholder="Ex: EN DIRECT 20h : Debat Politique" value={newAnnonce} onChange={e=>setNewAnnonce(e.target.value)} style={{flex:1,padding:11,borderRadius:10,border:'1px solid #c7d2fe'}} />
              <button onClick={handleAddAnnonce} style={{background:'#0f2040',color:'#ffcc00',borderRadius:10,border:0,padding:'0 16px',fontWeight:800,cursor:'pointer'}}>Ajouter</button>
            </div>
            {annonces.map(a=>(
              <div key={a.id} style={{border:'1px solid #e5e7eb', padding:10, borderRadius:10, display:'flex', gap:10, alignItems:'center', marginBottom:6}}>
                <div style={{flex:1, fontSize:13}}>{a.text}</div>
                <button onClick={()=>handleToggleAnnonce(a)} style={{background: a.active?'#dcfce7':'#fee2e2', border:0, borderRadius:6, padding:'4px 8px', fontSize:10}}>{a.active?'ON':'OFF'}</button>
                <button onClick={()=>handleDeleteAnnonce(a.id)} style={{background:'#fee2e2',color:'#dc2626',border:0,borderRadius:6,padding:'6px 10px',fontSize:11}}>Suppr</button>
              </div>
            ))}
          </div>
        ) : showPubs? (
          <div style={{background:'white', padding:16, borderRadius:14, borderTop:'4px solid #2e4fb0'}}>
            <h3 style={{marginTop:0, color:'#2e4fb0'}}>Espaces publicitaires</h3>
            <div style={{fontSize:11, color:'#64748b', marginBottom:12}}>5 emplacements disponibles sur le site : header, accueil (bandeau + grille), article (sidebar + sous l'image).</div>
            <div style={{border:'2px dashed #93c5fd', padding:12, borderRadius:12, background:'#f0f7ff', marginBottom:12}}>
              <label style={{fontSize:10,fontWeight:800,color:'#2e4fb0'}}>EMPLACEMENT</label>
              <select value={newPubSlot} onChange={e=>setNewPubSlot(e.target.value)} style={{width:'100%',padding:10,marginTop:4,marginBottom:10,borderRadius:8,border:'1px solid #c7d2fe',fontSize:12,fontWeight:700}}>
                {PUB_SLOTS.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <input type="file" accept="image/*" onChange={e=>uploadFile('pubs', e.target.files[0], true)} style={{width:'100%',fontSize:12}} />
              {uploading==='pubs' && <div style={{fontSize:11,color:'#2e4fb0',marginTop:6}}>Upload...</div>}
              {newPubImage && <img src={newPubImage} style={{width:'100%', height:80, objectFit:'cover', borderRadius:8, marginTop:8}} alt="" />}
              <input placeholder="Lien de la pub" value={newPubLink} onChange={e=>setNewPubLink(e.target.value)} style={{width:'100%',padding:8,marginTop:8,borderRadius:8,border:'1px solid #c7d2fe',fontSize:11}} />
              <button onClick={handleAddPub} style={{width:'100%',marginTop:8,padding:10,background:'#2e4fb0',color:'white',fontWeight:800,borderRadius:8,border:0}}>Ajouter</button>
            </div>
            {pubs.map(p=>(
              <div key={p.id} style={{border:'1px solid #e5e7eb', padding:8, borderRadius:10, display:'flex', gap:10, alignItems:'center', marginBottom:6, flexWrap:'wrap'}}>
                <img src={p.image} style={{width:70,height:36,objectFit:'cover',borderRadius:6}} alt="" />
                <div style={{flex:'1 1 140px', minWidth:0}}>
                  <select value={p.slot||'header'} onChange={e=>handleChangePubSlot(p, e.target.value)} style={{width:'100%',padding:6,borderRadius:6,border:'1px solid #c7d2fe',fontSize:10,fontWeight:700}}>
                    {PUB_SLOTS.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <div style={{fontSize:10, color:'#64748b', marginTop:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{p.link || 'Pas de lien'}</div>
                </div>
                <button onClick={()=>handleTogglePub(p)} style={{background: p.active?'#dcfce7':'#fee2e2', border:0, borderRadius:6, padding:'4px 8px', fontSize:10}}>{p.active?'ON':'OFF'}</button>
                <button onClick={()=>handleDeletePub(p.id)} style={{background:'#fee2e2',color:'#dc2626',border:0,borderRadius:6,padding:'6px 10px',fontSize:11}}>Suppr</button>
              </div>
            ))}
          </div>
        ) : showRadio? (
          <div style={{background:'white', padding:16, borderRadius:14, borderTop:'4px solid #16a34a'}}>
            <h3 style={{marginTop:0, color:'#16a34a'}}>Radio - Playlist de secours</h3>
            <div style={{fontSize:11, color:'#64748b', marginBottom:12}}>Ces pistes jouent en boucle sur la page DIRECT &gt; RADIO quand tu n'es pas en direct sur YouTube.</div>
            <div style={{border:'2px dashed #86efac', padding:12, borderRadius:12, background:'#f0fdf4', marginBottom:12}}>
              <label style={{fontSize:10,fontWeight:800,color:'#16a34a'}}>TITRE DE LA PISTE *</label>
              <input placeholder="Ex: Emission Societe - 12 aout" value={newRadioTitle} onChange={e=>setNewRadioTitle(e.target.value)} style={{width:'100%',padding:10,marginTop:4,marginBottom:10,borderRadius:8,border:'1px solid #bbf7d0',fontSize:12}} />
              <label style={{fontSize:10,fontWeight:800,color:'#16a34a'}}>FICHIER AUDIO (MP3) *</label>
              <input type="file" accept="audio/*" onChange={e=>uploadRadioAudio(e.target.files[0])} style={{width:'100%',fontSize:12,marginTop:4}} />
              {uploading==='radio-audio' && <div style={{fontSize:11,color:'#16a34a',marginTop:6}}>Upload audio...</div>}
              {newRadioAudio && <audio controls src={newRadioAudio} style={{width:'100%',marginTop:8}} />}
              <label style={{fontSize:10,fontWeight:800,color:'#16a34a',marginTop:10,display:'block'}}>POCHETTE (optionnel)</label>
              <input type="file" accept="image/*" onChange={e=>uploadRadioImage(e.target.files[0])} style={{width:'100%',fontSize:12,marginTop:4}} />
              {uploading==='radio-image' && <div style={{fontSize:11,color:'#16a34a',marginTop:6}}>Upload pochette...</div>}
              {newRadioImage && <img src={newRadioImage} style={{width:60,height:60,objectFit:'cover',borderRadius:8,marginTop:8}} alt="" />}
              <button onClick={handleAddRadioTrack} style={{width:'100%',marginTop:10,padding:10,background:'#16a34a',color:'white',fontWeight:800,borderRadius:8,border:0}}>{editingRadioId? 'Modifier la piste' : 'Ajouter a la playlist'}</button>
              {editingRadioId && <button onClick={handleCancelRadioEdit} style={{width:'100%',marginTop:8,padding:8,background:'transparent',color:'#16a34a',fontWeight:700,borderRadius:8,border:'1px solid #16a34a'}}>Annuler la modification</button>}
            </div>
            {radioPlaylist.map((t,i)=>(
              <div key={t.id} style={{border:'1px solid #e5e7eb', padding:8, borderRadius:10, display:'flex', gap:10, alignItems:'center', marginBottom:6}}>
                <img src={t.image||'/logo.png'} style={{width:40,height:40,objectFit:'cover',borderRadius:6}} alt="" />
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{i+1}. {t.title}</div>
                </div>
                <button onClick={()=>handleEditRadioTrack(t)} style={{background:'#dbeafe',color:'#2e4fb0',border:0,borderRadius:6,padding:'6px 10px',fontSize:11}}>Modifier</button>
                <button onClick={()=>handleToggleRadioTrack(t)} style={{background: t.active?'#dcfce7':'#fee2e2', border:0, borderRadius:6, padding:'4px 8px', fontSize:10}}>{t.active?'ON':'OFF'}</button>
                <button onClick={()=>handleDeleteRadioTrack(t.id)} style={{background:'#fee2e2',color:'#dc2626',border:0,borderRadius:6,padding:'6px 10px',fontSize:11}}>Suppr</button>
              </div>
            ))}
            {radioPlaylist.length===0 && <div style={{textAlign:'center',padding:30,color:'#64748b',fontSize:12}}>Aucune piste pour l'instant. Ajoute ta premiere piste ci-dessus.</div>}
          </div>
        ) : showVideoTV? (
          <div style={{background:'white', padding:16, borderRadius:14, borderTop:'4px solid #dc2626'}}>
            <h3 style={{marginTop:0, color:'#dc2626'}}>TV - Videos de secours</h3>
            <div style={{fontSize:11, color:'#64748b', marginBottom:12}}>Ces videos jouent en boucle sur la page DIRECT &gt; TV quand tu n'es pas en direct sur YouTube. Colle simplement des liens YouTube.</div>
            <div style={{border:'2px dashed #fca5a5', padding:12, borderRadius:12, background:'#fef2f2', marginBottom:12}}>
              <label style={{fontSize:10,fontWeight:800,color:'#dc2626'}}>TITRE DE LA VIDEO *</label>
              <input placeholder="Ex: Reportage Marche de Lome" value={newVideoTitle} onChange={e=>setNewVideoTitle(e.target.value)} style={{width:'100%',padding:10,marginTop:4,marginBottom:10,borderRadius:8,border:'1px solid #fecaca',fontSize:12}} />
              <label style={{fontSize:10,fontWeight:800,color:'#dc2626'}}>LIEN YOUTUBE *</label>
              <input placeholder="https://www.youtube.com/watch?v=..." value={newVideoUrl} onChange={e=>setNewVideoUrl(e.target.value)} style={{width:'100%',padding:10,marginTop:4,borderRadius:8,border:'1px solid #fecaca',fontSize:12}} />
              {newVideoUrl && getYtId(newVideoUrl) && <img src={getYoutubeThumb(newVideoUrl)} style={{width:'100%',maxHeight:160,objectFit:'cover',borderRadius:8,marginTop:8}} alt="" />}
              <button onClick={handleAddVideoTrack} style={{width:'100%',marginTop:10,padding:10,background:'#dc2626',color:'white',fontWeight:800,borderRadius:8,border:0}}>{editingVideoId? 'Modifier la video' : 'Ajouter a la playlist TV'}</button>
              {editingVideoId && <button onClick={handleCancelVideoEdit} style={{width:'100%',marginTop:8,padding:8,background:'transparent',color:'#dc2626',fontWeight:700,borderRadius:8,border:'1px solid #dc2626'}}>Annuler la modification</button>}
            </div>
            {videoPlaylist.map((v,i)=>(
              <div key={v.id} style={{border:'1px solid #e5e7eb', padding:8, borderRadius:10, display:'flex', gap:10, alignItems:'center', marginBottom:6, flexWrap:'wrap'}}>
                <img src={v.image} style={{width:60,height:36,objectFit:'cover',borderRadius:6}} alt="" />
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{i+1}. {v.title}</div>
                </div>
                <button onClick={()=>handleEditVideoTrack(v)} style={{background:'#dbeafe',color:'#2e4fb0',border:0,borderRadius:6,padding:'6px 10px',fontSize:11}}>Modifier</button>
                <button onClick={()=>handleToggleVideoTrack(v)} style={{background: v.active?'#dcfce7':'#fee2e2', border:0, borderRadius:6, padding:'4px 8px', fontSize:10}}>{v.active?'ON':'OFF'}</button>
                <button onClick={()=>handleDeleteVideoTrack(v.id)} style={{background:'#fee2e2',color:'#dc2626',border:0,borderRadius:6,padding:'6px 10px',fontSize:11}}>Suppr</button>
              </div>
            ))}
            {videoPlaylist.length===0 && <div style={{textAlign:'center',padding:30,color:'#64748b',fontSize:12}}>Aucune video pour l'instant. Ajoute ta premiere video ci-dessus.</div>}
          </div>
        ) : showKiosque? (
          <div style={{background:'white', padding:16, borderRadius:14, borderTop:'4px solid #ffcc00'}}>
            <h3 style={{marginTop:0, color:'#0f2040', display:'flex', alignItems:'center', gap:8}}>KIOSQUE - Gestion des Unes <span style={{background:'#0f2040',color:'#ffcc00',padding:'2px 8px',borderRadius:10,fontSize:10}}>{unes.length} Unes</span></h3>
            <div style={{border:'3px solid #0f2040', padding:14, borderRadius:12, background:'#fffbeb', marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:900, marginBottom:10, color:'#0f2040'}}>AJOUTER UNE NOUVELLE UNE</div>
              <div style={{display:'grid', gap:10}}>
                <div>
                  <label style={{fontSize:10,fontWeight:800}}>IMAGE UNE (JPG de la premiere page) *</label>
                  <input type="file" accept="image/*" onChange={e=>uploadKiosqueImage(e.target.files[0])} style={{width:'100%',fontSize:12,marginTop:4}} />
                  {uploading==='kiosque' && <div style={{fontSize:11,color:'#0f2040',marginTop:6}}>Upload Kiosque...</div>}
                  {newUneImage && <img src={newUneImage} style={{width:'100%', maxHeight:300, objectFit:'contain', borderRadius:10, marginTop:8, border:'2px solid #ffcc00', background:'white'}} alt="" />}
                  <input placeholder="ou colle URL image Une" value={newUneImage} onChange={e=>setNewUneImage(e.target.value)} style={{width:'100%',padding:8,marginTop:8,borderRadius:8,border:'1px solid #c7d2fe',fontSize:11}} />
                </div>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                  <div><label style={{fontSize:10,fontWeight:800}}>JOURNAL (optionnel)</label><input placeholder="Ex: Togo Matin" value={newUneJournal} onChange={e=>setNewUneJournal(e.target.value)} style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #c7d2fe',marginTop:4}} /></div>
                  <div><label style={{fontSize:10,fontWeight:800}}>DATE</label><input type="date" value={newUneDate} onChange={e=>setNewUneDate(e.target.value)} style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #c7d2fe',marginTop:4}} /></div>
                </div>
                <div><label style={{fontSize:10,fontWeight:800}}>TITRE / GROS TITRE (optionnel)</label><input placeholder="Ex: Economie : Port de Lome bat des records" value={newUneTitle} onChange={e=>setNewUneTitle(e.target.value)} style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #c7d2fe',marginTop:4}} /></div>
                <button onClick={handleAddUne} style={{width:'100%',padding:12,background:'#0f2040',color:'#ffcc00',fontWeight:900,borderRadius:10,border:0, cursor:'pointer', fontSize:13}}>AJOUTER AU KIOSQUE</button>
              </div>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:10}}>
              {unes.map(u=>(
                <div key={u.id} style={{border:'1px solid #e5e7eb', borderRadius:10, overflow:'hidden', background: u.active? 'white':'#f1f5f9', opacity: u.active?1:0.6}}>
                  <div style={{position:'relative', aspectRatio:'3/4', background:'#f5f5f5'}}>
                    <img src={u.image} style={{width:'100%',height:'100%',objectFit:'cover'}} alt="" />
                    {u.journal&&<div style={{position:'absolute',top:6,left:6,background:'#0f2040',color:'#ffcc00',padding:'2px 6px',borderRadius:4,fontSize:9,fontWeight:900}}>{u.journal}</div>}
                  </div>
                  <div style={{padding:8}}>
                    <div style={{fontSize:11,fontWeight:800,lineHeight:1.2}}>{u.title?.substring(0,40)}</div>
                    <div style={{fontSize:10,color:'#64748b',marginTop:4}}>{u.date? new Date(u.date).toLocaleDateString('fr-FR'):''}</div>
                    <div style={{display:'flex',gap:6,marginTop:8}}>
                      <button onClick={()=>handleToggleUne(u)} style={{flex:1,background: u.active?'#dcfce7':'#fee2e2', border:0, borderRadius:6, padding:'6px', fontSize:10, fontWeight:800}}>{u.active?'ON':'OFF'}</button>
                      <button onClick={()=>handleDeleteUne(u.id)} style={{flex:1,background:'#fee2e2',color:'#dc2626',border:0,borderRadius:6,padding:'6px',fontSize:10}}>Suppr</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {unes.length===0 && <div style={{textAlign:'center',padding:30,color:'#64748b',fontSize:12}}>Aucune Une pour l'instant. Ajoute ta premiere Une ci-dessus. Pense a creer la table <code>unes</code> dans Supabase si ce n'est pas fait.</div>}
          </div>
        ) : showArticles? (
          <div style={{background:'white', padding:14, borderRadius:14, borderTop:'4px solid #2e4fb0'}}>
            <input placeholder="Rechercher..." value={search} onChange={e=>setSearch(e.target.value)} style={{width:'100%', padding:'11px 12px', borderRadius:10, border:'1px solid #c7d2fe', marginBottom:12}} />
            {filtered.map(a=>(
              <div key={a.id} style={{border:'1px solid #e0e7ff', padding:10, borderRadius:12, display:'flex', gap:10, alignItems:'center', marginBottom:6}}>
                <img src={a.image} style={{width:54,height:54,objectFit:'cover',borderRadius:8}} alt="" />
                <div style={{flex:1, minWidth:0}}><div style={{fontWeight:800,fontSize:13,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.title}</div><div style={{fontSize:11,color:'#64748b'}}>{a.category}</div></div>
                <button onClick={()=>handleEdit(a)} style={{background:'#2e4fb0',color:'white',border:0,borderRadius:8,padding:'8px 12px',fontSize:12,cursor:'pointer'}}>Edit</button>
                <button onClick={()=>handleDelete(a.id)} style={{background:'#fee2e2',color:'#dc2626',border:0,borderRadius:8,padding:'8px 12px',fontSize:12,cursor:'pointer'}}>Suppr</button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{background:'white', padding:16, borderRadius:14, borderTop:'4px solid #2e4fb0'}}>
            <div style={{display:'flex', gap:6, marginBottom:12, flexWrap:'wrap', alignItems:'center'}}>
              <span style={{fontSize:11, fontWeight:900}}>Langue :</span>
              {LANGS.map(l=><button key={l} onClick={()=>setEditLang(l)} style={{padding:'6px 10px', borderRadius:20, border:'1px solid #c7d2fe', background: editLang===l?'#2e4fb0':'white', color:editLang===l?'white':'#2e4fb0', fontWeight:800, fontSize:11, cursor:'pointer'}}>{LABELS[l]}</button>)}
              <button onClick={handleAutoTranslate} disabled={translating} style={{marginLeft:8, background: translating?'#94a3b8':'#ffcc00', color:'#0f2040', border:0, borderRadius:20, padding:'6px 14px', fontWeight:900, fontSize:11, cursor:'pointer'}}>{translating?'Traduction...':'Traduire auto'}</button>
            </div>
            <div style={{display:'grid', gap:12}}>
              <div><label style={{fontSize:11,fontWeight:800,color:'#2e4fb0'}}>TITRE * [{editLang.toUpperCase()}]</label><input placeholder="Titre..." value={editLang==='fr'? form.title : (form.translations[editLang]?.title||'')} onChange={e=>{ if(editLang==='fr') setForm({...form,title:e.target.value}); else setForm({...form, translations:{...form.translations, [editLang]:{...form.translations[editLang], title:e.target.value}}}) }} style={{width:'100%',padding:'12px',marginTop:4,borderRadius:10,border:'1px solid #c7d2fe',fontWeight:700,fontSize:14}} /></div>
              <div><label style={{fontSize:11,fontWeight:800,color:'#2e4fb0'}}>CATEGORIE</label><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={{width:'100%',padding:'12px',marginTop:4,borderRadius:10,border:'1px solid #c7d2fe'}}><option>ACCUEIL</option><option>POLITIQUE</option><option>CULTURE</option><option>SOCIETE</option><option>SANTE</option><option>SPORT</option><option>ENVIRONNEMENT</option><option>INTERNATIONAL</option><option>ESPACE BUSINESS</option></select></div>
              
              <div style={{border:'2px dashed #93c5fd', padding:12, borderRadius:12, background:'#f0f7ff'}}>
                <div style={{fontSize:11,fontWeight:900,color:'#2e4fb0', marginBottom:6}}>PHOTO PRINCIPALE</div>
                <input type="file" accept="image/*" onChange={e=>uploadUne(e.target.files[0])} style={{width:'100%',fontSize:12}} />
                {uploading==='UNE' && <div style={{fontSize:11,color:'#2e4fb0',marginTop:6}}>Upload...</div>}
                {form.image && <img src={form.image} style={{width:'100%', maxHeight:180, objectFit:'cover', borderRadius:10, marginTop:8}} alt="" />}
                <input placeholder="ou colle un lien image" value={form.image} onChange={e=>setForm({...form,image:e.target.value})} style={{width:'100%',padding:'8px',marginTop:8,borderRadius:8,border:'1px solid #c7d2fe',fontSize:11}} />
              </div>

              <div style={{border:'3px solid #0f2040', padding:14, borderRadius:14, background:'#f8fafc'}}>
                <div style={{fontSize:13,fontWeight:900,color:'#0f2040', marginBottom:10, display:'flex', justifyContent:'space-between'}}>
                  <span>EDITEUR ARTICLE PAR BLOCS</span>
                  <span style={{fontSize:10, background:'#0f2040', color:'white', padding:'2px 8px', borderRadius:10}}>{blocks.length} blocs</span>
                </div>

                {blocks.map((block, idx)=>(
                  <div key={block.id} style={{background:'white', border:'2px solid #e2e8f0', borderRadius:12, padding:10, marginBottom:10, position:'relative'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
                      <span style={{fontSize:10, fontWeight:900, background: block.type==='text'?'#dbeafe': block.type==='image'?'#dcfce7': block.type==='audio'?'#fef3c7':'#fee2e2', color:'#0f2040', padding:'2px 8px', borderRadius:20}}>
                        {block.type.toUpperCase()} #{idx+1}
                      </span>
                      <div style={{display:'flex', gap:4}}>
                        <button type="button" onClick={()=>moveBlock(block.id,'up')} style={{border:'1px solid #ddd', background:'white', borderRadius:6, cursor:'pointer', fontSize:12, padding:'2px 6px'}}>UP</button>
                        <button type="button" onClick={()=>moveBlock(block.id,'down')} style={{border:'1px solid #ddd', background:'white', borderRadius:6, cursor:'pointer', fontSize:12, padding:'2px 6px'}}>DOWN</button>
                        <button type="button" onClick={()=>removeBlock(block.id)} style={{border:0, background:'#ef4444', color:'white', borderRadius:6, cursor:'pointer', padding:'2px 8px', fontSize:11}}>X</button>
                      </div>
                    </div>

                    {block.type==='text' && (
                      <textarea placeholder="Ecris ton texte ici..." value={block.content} onChange={e=>updateBlock(block.id,'content',e.target.value)} style={{width:'100%', minHeight:90, padding:10, borderRadius:8, border:'1px solid #c7d2fe', fontSize:13}} />
                    )}

                    {block.type==='image' && (
                      <div>
                        <input type="file" accept="image/*" onChange={e=>uploadBloc(block.id, e.target.files[0])} style={{width:'100%',fontSize:11, marginBottom:6}} />
                        {uploading===`block-${block.id}` && <div style={{fontSize:11, color:'#2e4fb0'}}>Upload...</div>}
                        <input placeholder="ou URL image" value={block.url} onChange={e=>updateBlock(block.id,'url',e.target.value)} style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #ddd',fontSize:11, marginBottom:6}} />
                        {block.url && <img src={block.url} style={{width:'100%', maxHeight:180, objectFit:'cover', borderRadius:8}} alt="" />}
                        <input placeholder="Legende image" value={block.caption||''} onChange={e=>updateBlock(block.id,'caption',e.target.value)} style={{width:'100%',padding:6,borderRadius:6,border:'1px solid #ddd',fontSize:11, marginTop:6}} />
                      </div>
                    )}

                    {block.type==='audio' && (
                      <div>
                        <input type="file" accept="audio/*" onChange={e=>uploadFile('audios', e.target.files[0], false, block.id)} style={{width:'100%',fontSize:11, marginBottom:6}} />
                        <input placeholder="ou URL audio MP3" value={block.url} onChange={e=>updateBlock(block.id,'url',e.target.value)} style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #ddd',fontSize:11}} />
                        {block.url && <audio controls src={block.url} style={{width:'100%', marginTop:8}} />}
                      </div>
                    )}

                    {(block.type==='video' || block.type==='youtube') && (
                      <div>
                        <input placeholder="URL YouTube ou MP4" value={block.url} onChange={e=>updateBlock(block.id,'url',e.target.value)} style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #ddd',fontSize:11}} />
                      </div>
                    )}
                  </div>
                ))}

                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:6, marginTop:12}}>
                  <button type="button" onClick={()=>addBlock('text')} style={{background:'#0f2040', color:'white', border:0, padding:'10px', borderRadius:10, fontWeight:800, fontSize:11, cursor:'pointer'}}>TEXTE</button>
                  <button type="button" onClick={()=>addBlock('image')} style={{background:'#16a34a', color:'white', border:0, padding:'10px', borderRadius:10, fontWeight:800, fontSize:11, cursor:'pointer'}}>IMAGE</button>
                  <button type="button" onClick={()=>addBlock('audio')} style={{background:'#d97706', color:'white', border:0, padding:'10px', borderRadius:10, fontWeight:800, fontSize:11, cursor:'pointer'}}>AUDIO</button>
                  <button type="button" onClick={()=>addBlock('youtube')} style={{background:'#dc2626', color:'white', border:0, padding:'10px', borderRadius:10, fontWeight:800, fontSize:11, cursor:'pointer'}}>VIDEO</button>
                </div>
              </div>

              <div style={{display:'flex',gap:8}}>
                {form.id && <button onClick={()=>{setForm({ id:null, title:'', category:'ACCUEIL', image:'', translations:{}, gallery:[] }); setBlocks([{id:uid(), type:'text', content:''}]); setGallery([]);}} style={{flex:1,padding:'14px',background:'#e0e7ff',borderRadius:12,border:0,fontWeight:800,cursor:'pointer', color:'#2e4fb0'}}>Annuler</button>}
                <button onClick={handlePublish} style={{flex:2,padding:'14px',background: form.id? '#f59e0b' : '#2e4fb0',color:'white',fontWeight:900,borderRadius:12,border:0,cursor:'pointer',fontSize:14}}>{form.id? 'METTRE A JOUR' : 'PUBLIER'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
