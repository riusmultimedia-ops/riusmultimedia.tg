
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
  const [form, setForm] = useState({ id:null, title:'', category:'ACCUEIL', image:'', translations:{}, gallery:[], status:'draft', author:'' });
  const [myRole, setMyRole] = useState(null);
  const isDirector = myRole === 'director';
  const hasLandedRef = useRef(false);

  const TAB_ACCESS = {
    articles: ['journaliste','director'],
    flash: ['journaliste','director'],
    commentaires: ['journaliste','director'],
    radio: ['technicien','chef_programme','director'],
    videotv: ['technicien','chef_programme','director'],
    grille: ['technicien','chef_programme','director'],
    emissions: ['technicien','chef_programme','director'],
    annonces: ['chef_programme','director'],
    pubs: ['chef_programme','director'],
    kiosque: ['chef_programme','director'],
    encadres: ['chef_programme','director'],
    users: ['director'],
  };
  const canAccess = (tab) => !!myRole && (TAB_ACCESS[tab]||[]).includes(myRole);

  const landOnDefaultTab = (role) => {
    resetTabs();
    if(role==='technicien') setShowRadio(true);
    else if(role==='chef_programme') setShowAnnonces(true);
    // journaliste et director atterrissent sur l'editeur d'article par defaut
  };
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
  const [showEncadres, setShowEncadres] = useState(false);
  const [showGrille, setShowGrille] = useState(false);
  const [showEmissions, setShowEmissions] = useState(false);
  const [showCommentaires, setShowCommentaires] = useState(false);
  const resetTabs = () => { setShowArticles(false); setShowUsers(false); setShowFlash(false); setShowAnnonces(false); setShowPubs(false); setShowKiosque(false); setShowRadio(false); setShowVideoTV(false); setShowEncadres(false); setShowGrille(false); setShowEmissions(false); setShowCommentaires(false); };
  const allTabsHidden = !showArticles && !showUsers && !showFlash && !showAnnonces && !showPubs && !showKiosque && !showRadio && !showVideoTV && !showEncadres && !showGrille && !showEmissions && !showCommentaires;
  const [users, setUsers] = useState([]);
  const accessTokenRef = useRef(null);
  const refreshTimerRef = useRef(null);
  const [articles, setArticles] = useState([]);
  const [comments, setComments] = useState([]);
  const [flashes, setFlashes] = useState([]);
  const [annonces, setAnnonces] = useState([]);
  const [pubs, setPubs] = useState([]);
  const [radioPlaylist, setRadioPlaylist] = useState([]);
  const [videoPlaylist, setVideoPlaylist] = useState([]);
  const [unes, setUnes] = useState([]);
  const [encadres, setEncadres] = useState([]);
  const [newEncadreTitle, setNewEncadreTitle] = useState('');
  const [newEncadreAdvertiser, setNewEncadreAdvertiser] = useState('');
  const [newEncadreLink, setNewEncadreLink] = useState('');
  const [encadreMedia, setEncadreMedia] = useState([]);
  const [editingEncadreId, setEditingEncadreId] = useState(null);
  const [newFlash, setNewFlash] = useState('');
  const [newAnnonce, setNewAnnonce] = useState('');
  const [newPubImage, setNewPubImage] = useState('');
  const [newPubLink, setNewPubLink] = useState('');
  const [newPubSlot, setNewPubSlot] = useState('header');
  const [newRadioTitle, setNewRadioTitle] = useState('');
  const [newRadioIsJingle, setNewRadioIsJingle] = useState(false);
  const [newRadioIsAd, setNewRadioIsAd] = useState(false);
  const [newRadioAdTimes, setNewRadioAdTimes] = useState([]);
  const [adTimeInput, setAdTimeInput] = useState('');
  const [editingRadioId, setEditingRadioId] = useState(null);
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoFolder, setNewVideoFolder] = useState('');
  const [newVideoIsJingle, setNewVideoIsJingle] = useState(false);
  const [newVideoIsAd, setNewVideoIsAd] = useState(false);
  const [newVideoAdTimes, setNewVideoAdTimes] = useState([]);
  const [videoAdTimeInput, setVideoAdTimeInput] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [newRadioAudio, setNewRadioAudio] = useState('');
  const [newRadioAudioFilename, setNewRadioAudioFilename] = useState('');
  const [newRadioFolder, setNewRadioFolder] = useState('');
  const [newRadioImage, setNewRadioImage] = useState('');
  const [newUneImage, setNewUneImage] = useState('');
  const [newUneJournal, setNewUneJournal] = useState('');
  const [newUneTitle, setNewUneTitle] = useState('');
  const [newUneDate, setNewUneDate] = useState(new Date().toISOString().split('T')[0]);
  const [newUnePrice, setNewUnePrice] = useState('');
  const [newUnePdfPath, setNewUnePdfPath] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('journaliste');
  const [creatingUser, setCreatingUser] = useState(false);
  const [uploading, setUploading] = useState('');
  const [tvWatermark, setTvWatermark] = useState(null);
  const [savingWatermark, setSavingWatermark] = useState(false);
  const [programmeGrid, setProgrammeGrid] = useState([]);
  const [radioTimeBlocks, setRadioTimeBlocks] = useState([]);
  const [tvTimeBlocks, setTvTimeBlocks] = useState([]);
  const [newTvBlockFolder, setNewTvBlockFolder] = useState('');
  const [newTvBlockStart, setNewTvBlockStart] = useState('');
  const [newTvBlockEnd, setNewTvBlockEnd] = useState('');
  const [newTvBlockDays, setNewTvBlockDays] = useState([]);
  const [editingTvBlockId, setEditingTvBlockId] = useState(null);
  const [newBlockFolder, setNewBlockFolder] = useState('');
  const [reassignFolderName, setReassignFolderName] = useState('');
  const [reassignSelectedIds, setReassignSelectedIds] = useState(new Set());
  const [reassignTvFolderName, setReassignTvFolderName] = useState('');
  const [reassignTvSelectedIds, setReassignTvSelectedIds] = useState(new Set());
  const [newBlockStart, setNewBlockStart] = useState('');
  const [newBlockEnd, setNewBlockEnd] = useState('');
  const [newBlockDays, setNewBlockDays] = useState([]);
  const [editingBlockId, setEditingBlockId] = useState(null);
  const [newProgTitle, setNewProgTitle] = useState('');
  const [newProgDesc, setNewProgDesc] = useState('');
  const [newProgDays, setNewProgDays] = useState([]);
  const [newProgTime, setNewProgTime] = useState('');
  const [newProgType, setNewProgType] = useState('radio');
  const [editingProgId, setEditingProgId] = useState(null);
  const [emissions, setEmissions] = useState([]);
  const [newEmTitle, setNewEmTitle] = useState('');
  const [newEmDesc, setNewEmDesc] = useState('');
  const [newEmCategory, setNewEmCategory] = useState('radio');
  const [newEmMediaType, setNewEmMediaType] = useState('audio');
  const [newEmMediaUrl, setNewEmMediaUrl] = useState('');
  const [newEmImage, setNewEmImage] = useState('');
  const [newEmDate, setNewEmDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingEmId, setEditingEmId] = useState(null);
  const [search, setSearch] = useState('');
  const galleryInputRef = useRef(null);
  const blockFileRef = useRef({});
  const blockTextareaRef = useRef({});
  const wrapSelection = (blockId, marker) => {
    const el = blockTextareaRef.current[blockId];
    if(!el) return;
    const start = el.selectionStart, end = el.selectionEnd;
    if(start===end) return alert('Selectionne d\'abord le texte a mettre en forme');
    const block = blocks.find(b=>b.id===blockId);
    const text = block.content || '';
    const newText = text.slice(0,start) + marker + text.slice(start,end) + marker + text.slice(end);
    updateBlock(blockId, 'content', newText);
    setTimeout(()=>{ el.focus(); el.selectionStart=start; el.selectionEnd=end+marker.length*2 }, 0);
  };

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
    try{
      const saved = JSON.parse(localStorage.getItem('rius_admin_session')||'null')
      if(saved?.refresh_token){
        setCurrentUser({ user: saved.email, role:'admin' })
        setIsLogged(true)
        doRefresh(saved.refresh_token, saved.email)
      }
    }catch{}
    fetchArticles(); fetchFlashes(); fetchAnnonces(); fetchPubs(); fetchUnes(); fetchRadioPlaylist(); fetchVideoPlaylist(); fetchEncadres(); fetchTvWatermark(); fetchProgrammeGrid(); fetchEmissions(); fetchComments(); fetchRadioTimeBlocks(); fetchTvTimeBlocks();
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
    fetch(`${supabaseUrl}/rest/v1/articles?select=*&order=created_at.desc`, { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${accessTokenRef.current||supabaseKey}` } })
  .then(r=>r.json()).then(data=>{ if(Array.isArray(data)) setArticles(data); });
  };
  const fetchComments = () => {
    fetch(`${supabaseUrl}/rest/v1/comments?select=*&order=created_at.desc`, { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${accessTokenRef.current||supabaseKey}` } })
  .then(r=>r.json()).then(data=>{ if(Array.isArray(data)) setComments(data); }).catch(()=>{});
  };
  const handleDeleteComment = async (id) => {
    if(!confirm('Supprimer ce commentaire ?')) return;
    const res = await fetch(`${supabaseUrl}/rest/v1/comments?id=eq.${id}`, { method:'DELETE', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${accessTokenRef.current||supabaseKey}` } });
    if(res.ok) fetchComments(); else alert(await res.text());
  };
  const fetchFlashes = () => {
    fetch(`${supabaseUrl}/rest/v1/flash?select=*&order=created_at.desc`, { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${accessTokenRef.current||supabaseKey}` } })
  .then(r=>r.json()).then(data=>{ if(Array.isArray(data)) setFlashes(data); });
  };
  const fetchAnnonces = () => {
    fetch(`${supabaseUrl}/rest/v1/annonces_blanches?select=*&order=created_at.desc`, { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${accessTokenRef.current||supabaseKey}` } })
  .then(r=>r.json()).then(data=>{ if(Array.isArray(data)) setAnnonces(data); });
  };
  const fetchPubs = () => {
    fetch(`${supabaseUrl}/rest/v1/pubs?select=*&order=created_at.desc`, { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${accessTokenRef.current||supabaseKey}` } })
  .then(r=>r.json()).then(data=>{ if(Array.isArray(data)) setPubs(data); });
  };
  const fetchUnes = () => {
    fetch(`${supabaseUrl}/rest/v1/unes?select=*&order=date.desc`, { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${accessTokenRef.current||supabaseKey}` } })
  .then(r=>r.json()).then(data=>{ if(Array.isArray(data)) setUnes(data); }).catch(()=>{});
  };
  const fetchRadioPlaylist = () => {
    fetch(`${supabaseUrl}/rest/v1/radio_playlist?select=*&order=id.asc`, { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${accessTokenRef.current||supabaseKey}` } })
  .then(r=>r.json()).then(data=>{ if(Array.isArray(data)) setRadioPlaylist(data); }).catch(()=>{});
  };
  const fetchVideoPlaylist = () => {
    fetch(`${supabaseUrl}/rest/v1/video_playlist?select=*&order=id.asc`, { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${accessTokenRef.current||supabaseKey}` } })
  .then(r=>r.json()).then(data=>{ if(Array.isArray(data)) setVideoPlaylist(data); }).catch(()=>{});
  };
  const fetchEncadres = () => {
    fetch(`${supabaseUrl}/rest/v1/encadres?select=*&order=order_index.asc`, { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${accessTokenRef.current||supabaseKey}` } })
  .then(r=>r.json()).then(data=>{ if(Array.isArray(data)) setEncadres(data); }).catch(()=>{});
  };
  const fetchTvWatermark = () => {
    fetch(`${supabaseUrl}/rest/v1/tv_watermark?select=*&id=eq.1`, { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${accessTokenRef.current||supabaseKey}` } })
  .then(r=>r.json()).then(data=>{ if(Array.isArray(data)&&data[0]) setTvWatermark(data[0]); }).catch(()=>{});
  };
  const handleSaveWatermark = async () => {
    if(!tvWatermark) return;
    setSavingWatermark(true);
    try{
      const res = await fetch(`${supabaseUrl}/rest/v1/tv_watermark?id=eq.1`, { method:'PATCH', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${accessTokenRef.current||supabaseKey}`, 'Content-Type':'application/json', 'Prefer':'return=minimal' }, body: JSON.stringify({ enabled:tvWatermark.enabled, position:tvWatermark.position, label:tvWatermark.label, logo_url:tvWatermark.logo_url||null, size_px:tvWatermark.size_px||70, ticker_info_enabled:tvWatermark.ticker_info_enabled!==false, ticker_annonces_enabled:tvWatermark.ticker_annonces_enabled!==false, clock_enabled:tvWatermark.clock_enabled!==false, weather_enabled:tvWatermark.weather_enabled!==false, clock_weather_position:tvWatermark.clock_weather_position||'top-left', clock_color:tvWatermark.clock_color||'#ffffff', weather_color:tvWatermark.weather_color||'#ff3b3b' }) });
      if(res.ok) alert('Reglages de l\'incrustation enregistres!'); else alert(await res.text());
    }catch(e){ alert('Erreur: '+e.message) }
    finally{ setSavingWatermark(false) }
  };

  const fetchProgrammeGrid = () => {
    fetch(`${supabaseUrl}/rest/v1/programme_grid?select=*&order=time.asc`, { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${accessTokenRef.current||supabaseKey}` } })
  .then(r=>r.json()).then(data=>{ if(Array.isArray(data)) setProgrammeGrid(data); }).catch(()=>{});
  };
  const fetchRadioTimeBlocks = () => {
    fetch(`${supabaseUrl}/rest/v1/radio_time_blocks?select=*&order=start_time.asc`, { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${accessTokenRef.current||supabaseKey}` } })
  .then(r=>r.json()).then(data=>{ if(Array.isArray(data)) setRadioTimeBlocks(data); }).catch(()=>{});
  };
  const toggleBlockDay = (d) => setNewBlockDays(prev=> prev.includes(d)? prev.filter(x=>x!==d) : [...prev, d]);
  const resetBlockForm = () => { setNewBlockFolder(''); setNewBlockStart(''); setNewBlockEnd(''); setNewBlockDays([]); setEditingBlockId(null); };
  const handleAddTimeBlock = async () => {
    if(!newBlockFolder.trim()) return alert('Indique le nom du groupe/dossier a programmer');
    if(!newBlockStart || !newBlockEnd) return alert('Choisis une heure de debut et de fin');
    if(newBlockDays.length===0) return alert('Choisis au moins un jour');
    const dupBlock = radioTimeBlocks.find(b=> b.id!==editingBlockId && b.folder.trim().toLowerCase()===newBlockFolder.trim().toLowerCase());
    if(dupBlock) return alert(`Le groupe "${newBlockFolder.trim()}" est deja programme (${dupBlock.start_time} - ${dupBlock.end_time}). Modifie cette plage existante au lieu d'en creer une nouvelle, ou choisis un autre nom de groupe.`);
    const payload = { folder:newBlockFolder.trim(), start_time:newBlockStart, end_time:newBlockEnd, days:newBlockDays, active:true };
    const url = editingBlockId? `${supabaseUrl}/rest/v1/radio_time_blocks?id=eq.${editingBlockId}` : `${supabaseUrl}/rest/v1/radio_time_blocks`;
    const method = editingBlockId? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${accessTokenRef.current||supabaseKey}`, 'Content-Type':'application/json', 'Prefer':'return=minimal' }, body: JSON.stringify(payload) });
    if(res.ok){ resetBlockForm(); fetchRadioTimeBlocks(); alert(editingBlockId? 'Plage horaire modifiee!' : 'Plage horaire ajoutee!'); } else alert(await res.text());
  };
  const handleEditTimeBlock = (b) => { setEditingBlockId(b.id); setNewBlockFolder(b.folder||''); setNewBlockStart(b.start_time||''); setNewBlockEnd(b.end_time||''); setNewBlockDays(b.days||[]); };
  const handleDeleteTimeBlock = async (id) => { if(!confirm('Supprimer cette plage horaire?')) return; await fetch(`${supabaseUrl}/rest/v1/radio_time_blocks?id=eq.${id}`, { method:'DELETE', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${accessTokenRef.current||supabaseKey}` } }); fetchRadioTimeBlocks(); };
  const handleToggleTimeBlock = async (b) => { await fetch(`${supabaseUrl}/rest/v1/radio_time_blocks?id=eq.${b.id}`, { method:'PATCH', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${accessTokenRef.current||supabaseKey}`, 'Content-Type':'application/json' }, body: JSON.stringify({ active:!b.active }) }); fetchRadioTimeBlocks(); };
  const toggleReassignSelect = (id) => setReassignSelectedIds(prev=>{ const next=new Set(prev); if(next.has(id)) next.delete(id); else next.add(id); return next; });
  const handleReassignFolder = async () => {
    if(!reassignFolderName.trim()) return alert('Indique le nom du groupe a assigner');
    if(reassignSelectedIds.size===0) return alert('Coche au moins une piste');
    const targetFolder = reassignFolderName.trim();
    const destPool = radioPlaylist.filter(t=>t.folder===targetFolder);
    const selectedTracks = radioPlaylist.filter(t=>reassignSelectedIds.has(t.id));
    const toAssign = [];
    const conflicts = [];
    selectedTracks.forEach(t=>{
      const clash = t.original_filename && destPool.some(d=>d.original_filename===t.original_filename);
      if(clash) conflicts.push(t); else toAssign.push(t);
    });
    if(toAssign.length===0){
      return alert(`Impossible : toutes les pistes cochees portent un nom de fichier deja present dans le groupe "${targetFolder}".`);
    }
    if(conflicts.length>0 && !confirm(`${conflicts.length} piste(s) cochee(s) porte(nt) deja le meme nom de fichier dans "${targetFolder}" et seront ignorees (doublon evite). Continuer avec les ${toAssign.length} autre(s) ?`)) return;
    for(const t of toAssign){
      await fetch(`${supabaseUrl}/rest/v1/radio_playlist?id=eq.${t.id}`, { method:'PATCH', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${accessTokenRef.current||supabaseKey}`, 'Content-Type':'application/json' }, body: JSON.stringify({ folder: targetFolder }) });
    }
    setReassignSelectedIds(new Set()); setReassignFolderName('');
    fetchRadioPlaylist();
    alert(`${toAssign.length} piste(s) assignee(s) au groupe "${targetFolder}".${conflicts.length>0? ` ${conflicts.length} ignoree(s) (doublon evite).`:''}`);
  };
  const handleDeleteFolder = async (folderName) => {
    const tracks = radioPlaylist.filter(t=>t.folder===folderName);
    if(!confirm(`Supprimer definitivement le groupe "${folderName}" ET ses ${tracks.length} fichier(s) ? Cette action est irreversible.`)) return;
    for(const t of tracks){
      try{
        const marker = '/storage/v1/object/public/radio/';
        const idx = (t.url||'').indexOf(marker);
        if(idx>=0){
          const path = t.url.substring(idx+marker.length);
          await fetch(`${supabaseUrl}/storage/v1/object/radio/${path}`, { method:'DELETE', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${accessTokenRef.current||supabaseKey}` } });
        }
      }catch(e){ /* on continue meme si le fichier de stockage est deja absent */ }
      await fetch(`${supabaseUrl}/rest/v1/radio_playlist?id=eq.${t.id}`, { method:'DELETE', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${accessTokenRef.current||supabaseKey}` } });
    }
    // Nettoie aussi une eventuelle plage horaire encore associee a ce groupe
    const orphanBlocks = radioTimeBlocks.filter(b=>b.folder===folderName);
    for(const b of orphanBlocks){
      await fetch(`${supabaseUrl}/rest/v1/radio_time_blocks?id=eq.${b.id}`, { method:'DELETE', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${accessTokenRef.current||supabaseKey}` } });
    }
    fetchRadioPlaylist();
    fetchRadioTimeBlocks();
    alert(`Groupe "${folderName}" supprime avec ses ${tracks.length} fichier(s).`);
  };

  const toggleReassignTvSelect = (id) => setReassignTvSelectedIds(prev=>{ const next=new Set(prev); if(next.has(id)) next.delete(id); else next.add(id); return next; });
  const handleReassignTvFolder = async () => {
    if(!reassignTvFolderName.trim()) return alert('Indique le nom du groupe a assigner');
    if(reassignTvSelectedIds.size===0) return alert('Coche au moins une video');
    const targetFolder = reassignTvFolderName.trim();
    const destPool = videoPlaylist.filter(v=>v.folder===targetFolder);
    const selectedVideos = videoPlaylist.filter(v=>reassignTvSelectedIds.has(v.id));
    const toAssign = [];
    const conflicts = [];
    selectedVideos.forEach(v=>{
      const vid = getYtId(v.url||'');
      const clash = destPool.some(d=>getYtId(d.url||'')===vid);
      if(clash) conflicts.push(v); else toAssign.push(v);
    });
    if(toAssign.length===0){
      return alert(`Impossible : toutes les videos cochees existent deja dans le groupe "${targetFolder}".`);
    }
    if(conflicts.length>0 && !confirm(`${conflicts.length} video(s) cochee(s) existe(nt) deja dans "${targetFolder}" et seront ignorees (doublon evite). Continuer avec les ${toAssign.length} autre(s) ?`)) return;
    for(const v of toAssign){
      await fetch(`${supabaseUrl}/rest/v1/video_playlist?id=eq.${v.id}`, { method:'PATCH', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${accessTokenRef.current||supabaseKey}`, 'Content-Type':'application/json' }, body: JSON.stringify({ folder: targetFolder }) });
    }
    setReassignTvSelectedIds(new Set()); setReassignTvFolderName('');
    fetchVideoPlaylist();
    alert(`${toAssign.length} video(s) assignee(s) au groupe "${targetFolder}".${conflicts.length>0? ` ${conflicts.length} ignoree(s) (doublon evite).`:''}`);
  };
  const handleDeleteTvFolder = async (folderName) => {
    const videos = videoPlaylist.filter(v=>v.folder===folderName);
    if(!confirm(`Supprimer definitivement le groupe "${folderName}" ET ses ${videos.length} video(s) ? Cette action est irreversible (les liens YouTube eux-memes ne sont pas affectes, juste retires de ta playlist TV).`)) return;
    for(const v of videos){
      await fetch(`${supabaseUrl}/rest/v1/video_playlist?id=eq.${v.id}`, { method:'DELETE', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${accessTokenRef.current||supabaseKey}` } });
    }
    const orphanBlocks = tvTimeBlocks.filter(b=>b.folder===folderName);
    for(const b of orphanBlocks){
      await fetch(`${supabaseUrl}/rest/v1/tv_time_blocks?id=eq.${b.id}`, { method:'DELETE', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${accessTokenRef.current||supabaseKey}` } });
    }
    fetchVideoPlaylist();
    fetchTvTimeBlocks();
    alert(`Groupe "${folderName}" supprime avec ses ${videos.length} video(s).`);
  };

  const fetchTvTimeBlocks = () => {
    fetch(`${supabaseUrl}/rest/v1/tv_time_blocks?select=*&order=start_time.asc`, { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${accessTokenRef.current||supabaseKey}` } })
  .then(r=>r.json()).then(data=>{ if(Array.isArray(data)) setTvTimeBlocks(data); }).catch(()=>{});
  };
  const toggleTvBlockDay = (d) => setNewTvBlockDays(prev=> prev.includes(d)? prev.filter(x=>x!==d) : [...prev, d]);
  const resetTvBlockForm = () => { setNewTvBlockFolder(''); setNewTvBlockStart(''); setNewTvBlockEnd(''); setNewTvBlockDays([]); setEditingTvBlockId(null); };
  const handleAddTvTimeBlock = async () => {
    if(!newTvBlockFolder.trim()) return alert('Indique le nom du groupe a programmer');
    if(!newTvBlockStart || !newTvBlockEnd) return alert('Choisis une heure de debut et de fin');
    if(newTvBlockDays.length===0) return alert('Choisis au moins un jour');
    const dupBlock = tvTimeBlocks.find(b=> b.id!==editingTvBlockId && b.folder.trim().toLowerCase()===newTvBlockFolder.trim().toLowerCase());
    if(dupBlock) return alert(`Le groupe "${newTvBlockFolder.trim()}" est deja programme (${dupBlock.start_time} - ${dupBlock.end_time}). Modifie cette plage existante au lieu d'en creer une nouvelle, ou choisis un autre nom de groupe.`);
    const payload = { folder:newTvBlockFolder.trim(), start_time:newTvBlockStart, end_time:newTvBlockEnd, days:newTvBlockDays, active:true };
    const url = editingTvBlockId? `${supabaseUrl}/rest/v1/tv_time_blocks?id=eq.${editingTvBlockId}` : `${supabaseUrl}/rest/v1/tv_time_blocks`;
    const method = editingTvBlockId? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${accessTokenRef.current||supabaseKey}`, 'Content-Type':'application/json', 'Prefer':'return=minimal' }, body: JSON.stringify(payload) });
    if(res.ok){ resetTvBlockForm(); fetchTvTimeBlocks(); alert(editingTvBlockId? 'Plage horaire modifiee!' : 'Plage horaire ajoutee!'); } else alert(await res.text());
  };
  const handleEditTvTimeBlock = (b) => { setEditingTvBlockId(b.id); setNewTvBlockFolder(b.folder||''); setNewTvBlockStart(b.start_time||''); setNewTvBlockEnd(b.end_time||''); setNewTvBlockDays(b.days||[]); };
  const handleDeleteTvTimeBlock = async (id) => { if(!confirm('Supprimer cette plage horaire?')) return; await fetch(`${supabaseUrl}/rest/v1/tv_time_blocks?id=eq.${id}`, { method:'DELETE', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${accessTokenRef.current||supabaseKey}` } }); fetchTvTimeBlocks(); };
  const handleToggleTvTimeBlock = async (b) => { await fetch(`${supabaseUrl}/rest/v1/tv_time_blocks?id=eq.${b.id}`, { method:'PATCH', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${accessTokenRef.current||supabaseKey}`, 'Content-Type':'application/json' }, body: JSON.stringify({ active:!b.active }) }); fetchTvTimeBlocks(); };

  const toggleProgDay = (d) => setNewProgDays(prev=> prev.includes(d)? prev.filter(x=>x!==d) : [...prev, d]);
  const resetProgForm = () => { setNewProgTitle(''); setNewProgDesc(''); setNewProgDays([]); setNewProgTime(''); setNewProgType('radio'); setEditingProgId(null); };
  const handleAddProg = async () => {
    if(!newProgTitle.trim()) return alert('Mets un titre');
    if(!newProgTime) return alert('Choisis une heure');
    if(newProgDays.length===0) return alert('Choisis au moins un jour');
    const payload = { title:newProgTitle.trim(), description:newProgDesc.trim()||null, days:newProgDays, time:newProgTime, type:newProgType, active:true };
    const url = editingProgId? `${supabaseUrl}/rest/v1/programme_grid?id=eq.${editingProgId}` : `${supabaseUrl}/rest/v1/programme_grid`;
    const method = editingProgId? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${accessTokenRef.current||supabaseKey}`, 'Content-Type':'application/json', 'Prefer':'return=minimal' }, body: JSON.stringify(payload) });
    if(res.ok){ resetProgForm(); fetchProgrammeGrid(); alert(editingProgId? 'Programme modifie!' : 'Programme ajoute!'); } else alert(await res.text());
  };
  const handleEditProg = (p) => { setEditingProgId(p.id); setNewProgTitle(p.title||''); setNewProgDesc(p.description||''); setNewProgDays(p.days||[]); setNewProgTime(p.time||''); setNewProgType(p.type||'radio'); window.scrollTo(0,0); };
  const handleDeleteProg = async (id) => { if(!confirm('Supprimer ce programme?')) return; await fetch(`${supabaseUrl}/rest/v1/programme_grid?id=eq.${id}`, { method:'DELETE', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${accessTokenRef.current||supabaseKey}` } }); fetchProgrammeGrid(); };
  const handleToggleProg = async (p) => { await fetch(`${supabaseUrl}/rest/v1/programme_grid?id=eq.${p.id}`, { method:'PATCH', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${accessTokenRef.current||supabaseKey}`, 'Content-Type':'application/json' }, body: JSON.stringify({ active:!p.active }) }); fetchProgrammeGrid(); };

  const fetchEmissions = () => {
    fetch(`${supabaseUrl}/rest/v1/emissions?select=*&order=date_diffusion.desc`, { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${accessTokenRef.current||supabaseKey}` } })
  .then(r=>r.json()).then(data=>{ if(Array.isArray(data)) setEmissions(data); }).catch(()=>{});
  };
  const uploadEmissionAudio = async (file) => {
    if(!file) return null;
    setUploading('emission-audio');
    try{
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const res = await fetch(`${supabaseUrl}/storage/v1/object/radio/${fileName}`, { method:'POST', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${accessTokenRef.current||supabaseKey}`, 'x-upsert':'true', 'Content-Type':file.type }, body:file });
      if(!res.ok) throw new Error(await res.text());
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/radio/${fileName}`;
      setNewEmMediaUrl(publicUrl);
      return publicUrl;
    }catch(e){ alert('Erreur upload audio: '+e.message); return null; }
    finally{ setUploading(''); }
  };
  const uploadEmissionImage = async (file) => {
    if(!file) return null;
    let f=file;
    if(file.type.startsWith('image/')){ f = await compressImage(file, 700, 0.7); }
    setUploading('emission-image');
    try{
      const fileName = `EMISSION_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const res = await fetch(`${supabaseUrl}/storage/v1/object/images/${fileName}`, { method:'POST', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${accessTokenRef.current||supabaseKey}`, 'x-upsert':'true', 'Content-Type':f.type }, body:f });
      if(!res.ok) throw new Error(await res.text());
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/images/${fileName}`;
      setNewEmImage(publicUrl);
      return publicUrl;
    }catch(e){ alert('Erreur upload image: '+e.message); return null; }
    finally{ setUploading(''); }
  };
  const resetEmForm = () => { setNewEmTitle(''); setNewEmDesc(''); setNewEmCategory('radio'); setNewEmMediaType('audio'); setNewEmMediaUrl(''); setNewEmImage(''); setNewEmDate(new Date().toISOString().split('T')[0]); setEditingEmId(null); };
  const handleAddEmission = async () => {
    if(!newEmTitle.trim()) return alert('Mets un titre');
    if(!newEmMediaUrl.trim()) return alert(newEmMediaType==='audio'? 'Ajoute un fichier audio' : 'Colle un lien YouTube');
    const payload = { title:newEmTitle.trim(), description:newEmDesc.trim()||null, category:newEmCategory, media_type:newEmMediaType, media_url:newEmMediaUrl.trim(), image:newEmImage||null, date_diffusion:newEmDate, active:true };
    const url = editingEmId? `${supabaseUrl}/rest/v1/emissions?id=eq.${editingEmId}` : `${supabaseUrl}/rest/v1/emissions`;
    const method = editingEmId? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${accessTokenRef.current||supabaseKey}`, 'Content-Type':'application/json', 'Prefer':'return=minimal' }, body: JSON.stringify(payload) });
    if(res.ok){ resetEmForm(); fetchEmissions(); alert(editingEmId? 'Emission modifiee!' : 'Emission ajoutee!'); } else alert(await res.text());
  };
  const handleEditEmission = (e) => { setEditingEmId(e.id); setNewEmTitle(e.title||''); setNewEmDesc(e.description||''); setNewEmCategory(e.category||'radio'); setNewEmMediaType(e.media_type||'audio'); setNewEmMediaUrl(e.media_url||''); setNewEmImage(e.image||''); setNewEmDate(e.date_diffusion||new Date().toISOString().split('T')[0]); window.scrollTo(0,0); };
  const handleDeleteEmission = async (id) => { if(!confirm('Supprimer cette emission?')) return; await fetch(`${supabaseUrl}/rest/v1/emissions?id=eq.${id}`, { method:'DELETE', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${accessTokenRef.current||supabaseKey}` } }); fetchEmissions(); };
  const handleToggleEmission = async (e) => { await fetch(`${supabaseUrl}/rest/v1/emissions?id=eq.${e.id}`, { method:'PATCH', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${accessTokenRef.current||supabaseKey}`, 'Content-Type':'application/json' }, body: JSON.stringify({ active:!e.active }) }); fetchEmissions(); };

  const addBlock = (type, afterId=null) => {
    const newBlock = { id:uid(), type, content:'', url:'', caption:'', title:'', position:'center' }
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
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${accessTokenRef.current||supabaseKey}`, 'x-upsert': 'true', 'Content-Type': file.type },
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
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${accessTokenRef.current||supabaseKey}`, 'x-upsert': 'true', 'Content-Type': file.type },
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
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${accessTokenRef.current||supabaseKey}`, 'x-upsert': 'true', 'Content-Type': file.type },
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
    const targetFolder = newRadioFolder.trim()||null;
    const dup = radioPlaylist.find(t=> t.original_filename===file.name && (t.folder||null)===targetFolder);
    if(dup){ alert(`Ce fichier ("${file.name}") existe deja dans ${targetFolder? `le groupe "${targetFolder}"` : 'la playlist generale (sans groupe)'}. Change de groupe si tu veux quand meme l'importer, ou choisis un autre fichier.`); return null; }
    setUploading('radio-audio');
    try{
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const res = await fetch(`${supabaseUrl}/storage/v1/object/radio/${fileName}`, {
        method: 'POST',
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${accessTokenRef.current||supabaseKey}`, 'x-upsert': 'true', 'Content-Type': file.type },
        body: file
      });
      if(!res.ok) throw new Error(await res.text());
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/radio/${fileName}`;
      setNewRadioAudio(publicUrl);
      setNewRadioAudioFilename(file.name);
      return publicUrl;
    }catch(e){ alert('Erreur upload audio: '+e.message); return null; }
    finally{ setUploading(''); }
  };

  const [bulkImportProgress, setBulkImportProgress] = useState(null);
  const [bulkImportFolder, setBulkImportFolder] = useState('');
  const bulkImportCancelRef = useRef(false);
  const handleBulkImportRadio = async (fileList) => {
    const files = Array.from(fileList||[]).filter(f=>f.type.startsWith('audio/'));
    if(!files.length) return alert('Aucun fichier audio trouve dans la selection.');
    const folderName = bulkImportFolder.trim() || null;
    const confirmMsg = folderName
      ? `Importer ${files.length} fichier(s) audio dans le GROUPE "${folderName}" ?`
      : `⚠️ ATTENTION : le champ "Nom du groupe" est VIDE.\n\nImporter ${files.length} fichier(s) SANS groupe (playlist generale, pas de programmation par plage horaire possible) ?\n\nSi tu voulais un groupe, clique Annuler et remplis d'abord le champ ci-dessus.`;
    if(!confirm(confirmMsg)) return;
    bulkImportCancelRef.current = false;
    setBulkImportProgress({current:0, total:files.length, ok:0, skipped:0});
    let ok = 0, skipped = 0;
    // Cle "nomdufichier|||groupe" deja presentes, pour reperer les doublons deja en playlist ET ceux repetes dans le meme lot
    const seen = new Set(radioPlaylist.map(t=>`${t.original_filename||''}|||${t.folder||''}`));
    for(let i=0;i<files.length;i++){
      if(bulkImportCancelRef.current) break;
      const file = files[i];
      setBulkImportProgress({current:i+1, total:files.length, ok, skipped});
      const key = `${file.name}|||${folderName||''}`;
      if(seen.has(key)){ skipped++; setBulkImportProgress({current:i+1, total:files.length, ok, skipped}); continue; }
      try{
        const fileName = `${Date.now()}_${i}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const res = await fetch(`${supabaseUrl}/storage/v1/object/radio/${fileName}`, {
          method:'POST', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${accessTokenRef.current||supabaseKey}`, 'x-upsert':'true', 'Content-Type':file.type }, body:file
        });
        if(!res.ok) continue;
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/radio/${fileName}`;
        const title = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g,' ').trim() || 'Sans titre';
        const insertRes = await fetch(`${supabaseUrl}/rest/v1/radio_playlist`, {
          method:'POST', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${accessTokenRef.current||supabaseKey}`, 'Content-Type':'application/json', 'Prefer':'return=minimal' },
          body: JSON.stringify({ title, url:publicUrl, image:null, is_jingle:false, is_ad:false, ad_times:[], active:true, folder:folderName, original_filename:file.name })
        });
        if(insertRes.ok){ ok++; seen.add(key); setBulkImportProgress({current:i+1, total:files.length, ok, skipped}); }
      }catch(e){ /* on continue avec le fichier suivant */ }
    }
    const wasCancelled = bulkImportCancelRef.current;
    setBulkImportProgress(null);
    fetchRadioPlaylist();
    alert(`${ok} / ${files.length} piste(s) importee(s) avec succes.${skipped>0? ` ${skipped} ignoree(s) car deja presente(s) dans ce groupe.`:''}${wasCancelled? ' (Import arrete manuellement.)':''}`);
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
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${accessTokenRef.current||supabaseKey}`, 'x-upsert': 'true', 'Content-Type': f.type },
        body: f
      });
      if(!res.ok) throw new Error(await res.text());
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/radio/${fileName}`;
      setNewRadioImage(publicUrl);
      return publicUrl;
    }catch(e){ alert('Erreur upload pochette: '+e.message); return null; }
    finally{ setUploading(''); }
  };

  const uploadUnePdf = async (file) => {
    if(!file) return null;
    if(file.type!=='application/pdf') return alert('Merci de choisir un fichier PDF');
    setUploading('une-pdf');
    try{
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const res = await fetch(`${supabaseUrl}/storage/v1/object/kiosque-pdfs/${fileName}`, {
        method: 'POST',
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${accessTokenRef.current||supabaseKey}`, 'Content-Type': 'application/pdf' },
        body: file
      });
      if(!res.ok) throw new Error(await res.text());
      setNewUnePdfPath(fileName);
      return fileName;
    }catch(e){ alert('Erreur upload PDF: '+e.message); return null; }
    finally{ setUploading(''); }
  };

  const uploadWatermarkLogo = async (file) => {
    if(!file) return null;
    // Pas de compression ici : compressImage convertit en JPEG et detruit la transparence des PNG (fond qui devient noir)
    setUploading('watermark');
    try{
      const fileName = `WATERMARK_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const res = await fetch(`${supabaseUrl}/storage/v1/object/images/${fileName}`, {
        method: 'POST',
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${accessTokenRef.current||supabaseKey}`, 'x-upsert': 'true', 'Content-Type': file.type },
        body: file
      });
      if(!res.ok) throw new Error(await res.text());
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/images/${fileName}`;
      setTvWatermark(w=>({...w, logo_url: publicUrl}));
      return publicUrl;
    }catch(e){ alert('Erreur upload logo: '+e.message); return null; }
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
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${accessTokenRef.current||supabaseKey}`, 'x-upsert': 'true', 'Content-Type': f.type },
        body: f
      });
      if(!res.ok) throw new Error(await res.text());
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/images/${fileName}`;
      setNewUneImage(publicUrl);
      return publicUrl;
    }catch(e){ alert('Erreur upload Kiosque: '+e.message); return null; }
    finally{ setUploading(''); }
  };

  const encadreTextareaRef = useRef({});
  const wrapEncadreSelection = (mediaId, marker) => {
    const el = encadreTextareaRef.current[mediaId];
    if(!el) return;
    const start = el.selectionStart, end = el.selectionEnd;
    if(start===end) return alert('Selectionne d\'abord le texte a mettre en forme');
    const item = encadreMedia.find(m=>m.id===mediaId);
    const text = item.content || '';
    const newText = text.slice(0,start) + marker + text.slice(start,end) + marker + text.slice(end);
    updateEncadreMedia(mediaId, 'content', newText);
    setTimeout(()=>{ el.focus(); el.selectionStart=start; el.selectionEnd=end+marker.length*2 }, 0);
  };

  const uploadEncadreMedia = async (mediaId, file) => {
    if(!file) return null;
    let f = file;
    if(file.type.startsWith('image/')){ f = await compressImage(file, 1200, 0.7); }
    setUploading(`encadre-${mediaId}`);
    try{
      const fileName = `ENC_${mediaId}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const res = await fetch(`${supabaseUrl}/storage/v1/object/encadres/${fileName}`, {
        method: 'POST',
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${accessTokenRef.current||supabaseKey}`, 'x-upsert': 'true', 'Content-Type': f.type },
        body: f
      });
      if(!res.ok) throw new Error(await res.text());
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/encadres/${fileName}`;
      setEncadreMedia(prev => prev.map(m=> m.id===mediaId ? {...m, url: publicUrl} : m));
      return publicUrl;
    }catch(e){ alert('Erreur upload media encadre: '+e.message); return null; }
    finally{ setUploading(''); }
  };

  const addEncadreMedia = (type) => setEncadreMedia([...encadreMedia, {id:uid(), type, url:'', position:'bottom', caption:''}]);
  const updateEncadreMedia = (id, field, val) => setEncadreMedia(encadreMedia.map(m=> m.id===id? {...m, [field]:val}: m));
  const removeEncadreMedia = (id) => setEncadreMedia(encadreMedia.filter(m=>m.id!==id));

  const resetEncadreForm = () => {
    setNewEncadreTitle(''); setNewEncadreAdvertiser(''); setNewEncadreLink(''); setEncadreMedia([]); setEditingEncadreId(null);
  };

  const handleAddEncadre = async () => {
    if(!newEncadreTitle.trim() && !encadreMedia.some(m=> m.type==='text'? m.content?.trim() : m.url)) return alert('Ajoute au moins un titre ou un bloc de contenu');
    const payload = {
      title: newEncadreTitle.trim() || null,
      advertiser: newEncadreAdvertiser.trim() || null,
      link: newEncadreLink.trim() || null,
      media: encadreMedia.filter(m=> m.type==='text'? m.content?.trim() : m.url).map(({type, url, content, position, caption})=>({type, url: url||null, content: content||null, position, caption: caption||null})),
      active: true
    };
    const url = editingEncadreId? `${supabaseUrl}/rest/v1/encadres?id=eq.${editingEncadreId}` : `${supabaseUrl}/rest/v1/encadres`;
    const method = editingEncadreId? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${accessTokenRef.current||supabaseKey}`, 'Content-Type':'application/json', 'Prefer':'return=minimal' }, body: JSON.stringify(payload) });
    if(res.ok){ resetEncadreForm(); fetchEncadres(); alert(editingEncadreId? 'Encadre modifie!' : 'Encadre ajoute!'); } else alert(await res.text());
  };

  const handleEditEncadre = (enc) => {
    setEditingEncadreId(enc.id);
    setNewEncadreTitle(enc.title||'');
    setNewEncadreAdvertiser(enc.advertiser||'');
    setNewEncadreLink(enc.link||'');
    let media = (enc.media||[]).map(m=>({id:uid(), ...m}));
    if(enc.content && !media.some(m=>m.type==='text')) media = [{id:uid(), type:'text', content:enc.content, position:'center'}, ...media];
    setEncadreMedia(media);
    window.scrollTo(0,0);
  };
  const handleCancelEncadreEdit = () => resetEncadreForm();
  const handleDeleteEncadre = async (id) => { if(!confirm('Supprimer cet encadre?')) return; await fetch(`${supabaseUrl}/rest/v1/encadres?id=eq.${id}`, { method:'DELETE', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${accessTokenRef.current||supabaseKey}` } }); fetchEncadres(); };
  const handleToggleEncadre = async (enc) => { await fetch(`${supabaseUrl}/rest/v1/encadres?id=eq.${enc.id}`, { method:'PATCH', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${accessTokenRef.current||supabaseKey}`, 'Content-Type':'application/json' }, body: JSON.stringify({ active:!enc.active }) }); fetchEncadres(); };

  const AUTH_STORAGE_KEY = 'rius_admin_session'

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pwd = '';
    for(let i=0;i<14;i++) pwd += chars[Math.floor(Math.random()*chars.length)];
    setNewUserPassword(pwd);
  };

  const handleCreateUser = async () => {
    if(!newUserEmail.trim() || !newUserPassword.trim() || !newUserRole) return alert('Remplis tous les champs');
    setCreatingUser(true);
    try{
      const res = await fetch('/api/create-user', {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'Authorization': 'Bearer '+accessTokenRef.current },
        body: JSON.stringify({ email: newUserEmail.trim(), password: newUserPassword, role: newUserRole })
      });
      const data = await res.json();
      if(!res.ok){ alert(data.error || 'Erreur lors de la creation'); return; }
      alert(`Compte cree !\n\nEmail : ${data.email}\nMot de passe : ${newUserPassword}\nRole : ${data.role}\n\nTransmets ces identifiants a la personne de maniere securisee (pas par email ou SMS non chiffres si possible).`);
      setNewUserEmail(''); setNewUserPassword(''); setNewUserRole('journaliste');
    }catch(e){ alert('Erreur: '+e.message) }
    finally{ setCreatingUser(false) }
  };

  const persistSession = (session) => {
    accessTokenRef.current = session?.access_token || null
    try{
      if(session) localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
      else localStorage.removeItem(AUTH_STORAGE_KEY)
    }catch{}
  }

  const scheduleRefresh = (session) => {
    if(refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    if(!session?.refresh_token || !session?.expires_in) return
    const delay = Math.max(30000, (session.expires_in - 120) * 1000)
    refreshTimerRef.current = setTimeout(()=> doRefresh(session.refresh_token, session.email), delay)
  }

  const fetchMyRole = async (userId) => {
    if(!userId){ setMyRole(null); return }
    try{
      const res = await fetch(`${supabaseUrl}/rest/v1/admin_profiles?id=eq.${userId}&select=role`, { headers:{ 'apikey':supabaseKey, 'Authorization':'Bearer '+accessTokenRef.current } })
      const data = await res.json()
      const role = data?.[0]?.role || null
      setMyRole(role)
      if(!hasLandedRef.current){ hasLandedRef.current = true; landOnDefaultTab(role) }
    }catch{ setMyRole(null) }
  }

  const doRefresh = async (refreshToken, email) => {
    try{
      const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
        method:'POST', headers:{ 'apikey':supabaseKey, 'Content-Type':'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      })
      if(!res.ok) throw new Error('refresh failed')
      const data = await res.json()
      const session = { access_token:data.access_token, refresh_token:data.refresh_token, expires_in:data.expires_in, email: data.user?.email || email, uid: data.user?.id }
      persistSession(session)
      scheduleRefresh(session)
      fetchMyRole(session.uid)
    }catch{
      handleLogout()
    }
  }

  const handleLogin = async () => {
    try{
      const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method:'POST', headers:{ 'apikey':supabaseKey, 'Content-Type':'application/json' },
        body: JSON.stringify({ email:user.trim(), password:pass })
      })
      const data = await res.json()
      if(!res.ok || !data.access_token){ alert(data.error_description || data.msg || 'Identifiants incorrects'); return }
      const session = { access_token:data.access_token, refresh_token:data.refresh_token, expires_in:data.expires_in, email:data.user?.email||user.trim(), uid:data.user?.id }
      persistSession(session)
      scheduleRefresh(session)
      setCurrentUser({ user: session.email, role: 'admin' })
      setIsLogged(true)
      fetchMyRole(session.uid)
      setPass('')
      resetTabs();
    }catch(e){ alert('Erreur de connexion: '+e.message) }
  };

  const handleLogout = async () => {
    const token = accessTokenRef.current
    persistSession(null)
    if(refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    if(token){ try{ await fetch(`${supabaseUrl}/auth/v1/logout`, { method:'POST', headers:{ 'apikey':supabaseKey, 'Authorization':'Bearer '+token } }) }catch{} }
    setIsLogged(false); setCurrentUser(null); setUser(''); setPass(''); setMyRole(null); hasLandedRef.current = false;
    setForm({ id:null, title:'', category:'ACCUEIL', image:'', translations:{}, gallery:[], status:'draft', author:'' });
    setBlocks([{id:uid(), type:'text', content:''}])
    setGallery([]);
    setYoutubeInput(''); setYoutubeCaption('');
    resetTabs();
  };

  const handleChangeMyPass = async () => {
    const np = prompt('Nouveau mot de passe (8 caracteres minimum) :');
    if(!np || !np.trim()) return
    if(np.trim().length < 8) return alert('Le mot de passe doit faire au moins 8 caracteres')
    try{
      const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
        method:'PUT', headers:{ 'apikey':supabaseKey, 'Authorization':'Bearer '+accessTokenRef.current, 'Content-Type':'application/json' },
        body: JSON.stringify({ password: np.trim() })
      })
      if(res.ok) alert('Mot de passe change avec succes.')
      else { const d = await res.json(); alert(d.error_description || d.msg || 'Erreur lors du changement de mot de passe') }
    }catch(e){ alert('Erreur: '+e.message) }
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
        blocks: blocks,
        status: form.status || 'draft',
        author: form.author || null
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
        method, headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${accessTokenRef.current||supabaseKey}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
        body: JSON.stringify(payload)
      });
      if(!res.ok){
        const txt = await res.text()
        if(txt.includes('blocks')){
          delete payload.blocks
          res = await fetch(url, {
            method, headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${accessTokenRef.current||supabaseKey}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
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
    setForm({ id:null, title:'', category:'ACCUEIL', image:'', translations:{}, gallery:[], status:'draft', author:'' }); 
    setBlocks([{id:uid(), type:'text', content:''}])
    setGallery([]); setEditLang('fr'); fetchArticles(); setShowArticles(true);
  }

  const handleAddFlash = async () => {
    if(!newFlash.trim()) return;
    const res = await fetch(`${supabaseUrl}/rest/v1/flash`, {
      method:'POST', headers:{ 'apikey': supabaseKey, 'Authorization': `Bearer ${accessTokenRef.current||supabaseKey}`, 'Content-Type':'application/json', 'Prefer':'return=minimal' },
      body: JSON.stringify({ text: newFlash.trim(), active: true })
    });
    if(res.ok){ setNewFlash(''); fetchFlashes(); } else alert(await res.text());
  };
  const handleDeleteFlash = async (id) => { if(!confirm('Supprimer ce flash?')) return; await fetch(`${supabaseUrl}/rest/v1/flash?id=eq.${id}`, { method:'DELETE', headers:{ 'apikey': supabaseKey, 'Authorization': `Bearer ${accessTokenRef.current||supabaseKey}` } }); fetchFlashes(); };
  const handleToggleFlash = async (f) => { await fetch(`${supabaseUrl}/rest/v1/flash?id=eq.${f.id}`, { method:'PATCH', headers:{ 'apikey': supabaseKey, 'Authorization': `Bearer ${accessTokenRef.current||supabaseKey}`, 'Content-Type':'application/json' }, body: JSON.stringify({ active:!f.active }) }); fetchFlashes(); };

  const handleAddAnnonce = async () => {
    if(!newAnnonce.trim()) return;
    const res = await fetch(`${supabaseUrl}/rest/v1/annonces_blanches`, {
      method:'POST', headers:{ 'apikey': supabaseKey, 'Authorization': `Bearer ${accessTokenRef.current||supabaseKey}`, 'Content-Type':'application/json', 'Prefer':'return=minimal' },
      body: JSON.stringify({ text: newAnnonce.trim(), active: true })
    });
    if(res.ok){ setNewAnnonce(''); fetchAnnonces(); } else alert(await res.text());
  };
  const handleDeleteAnnonce = async (id) => { if(!confirm('Supprimer cette annonce?')) return; await fetch(`${supabaseUrl}/rest/v1/annonces_blanches?id=eq.${id}`, { method:'DELETE', headers:{ 'apikey': supabaseKey, 'Authorization': `Bearer ${accessTokenRef.current||supabaseKey}` } }); fetchAnnonces(); };
  const handleToggleAnnonce = async (a) => { await fetch(`${supabaseUrl}/rest/v1/annonces_blanches?id=eq.${a.id}`, { method:'PATCH', headers:{ 'apikey': supabaseKey, 'Authorization': `Bearer ${accessTokenRef.current||supabaseKey}`, 'Content-Type':'application/json' }, body: JSON.stringify({ active:!a.active }) }); fetchAnnonces(); };

  const handleAddPub = async () => { if(!newPubImage) return alert('Mets une image'); const res=await fetch(`${supabaseUrl}/rest/v1/pubs`, { method:'POST', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${accessTokenRef.current||supabaseKey}`, 'Content-Type':'application/json', 'Prefer':'return=minimal' }, body: JSON.stringify({ image:newPubImage, link:newPubLink||null, slot:newPubSlot, active:true }) }); if(res.ok){ setNewPubImage(''); setNewPubLink(''); setNewPubSlot('header'); fetchPubs(); alert('Pub ajoutee!'); } else alert(await res.text()); };
  const handleDeletePub = async (id) => { if(!confirm('Supprimer cette pub?')) return; await fetch(`${supabaseUrl}/rest/v1/pubs?id=eq.${id}`, { method:'DELETE', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${accessTokenRef.current||supabaseKey}` } }); fetchPubs(); };
  const handleTogglePub = async (p) => { await fetch(`${supabaseUrl}/rest/v1/pubs?id=eq.${p.id}`, { method:'PATCH', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${accessTokenRef.current||supabaseKey}`, 'Content-Type':'application/json' }, body: JSON.stringify({ active:!p.active }) }); fetchPubs(); };
  const handleChangePubSlot = async (p, slot) => { await fetch(`${supabaseUrl}/rest/v1/pubs?id=eq.${p.id}`, { method:'PATCH', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${accessTokenRef.current||supabaseKey}`, 'Content-Type':'application/json' }, body: JSON.stringify({ slot }) }); fetchPubs(); };

  const addAdTime = () => {
    if(!adTimeInput) return
    if(newRadioAdTimes.includes(adTimeInput)) return
    setNewRadioAdTimes([...newRadioAdTimes, adTimeInput].sort())
    setAdTimeInput('')
  }
  const removeAdTime = (t) => setNewRadioAdTimes(newRadioAdTimes.filter(x=>x!==t))

  const handleAddRadioTrack = async () => {
    if(!newRadioAudio) return alert('Ajoute un fichier audio');
    if(!newRadioTitle.trim()) return alert('Mets un titre pour la piste');
    if(newRadioIsAd && newRadioAdTimes.length===0) return alert('Ajoute au moins une heure de diffusion pour cette pub');
    const payload = { title:newRadioTitle.trim(), url:newRadioAudio, image:newRadioImage||null, is_jingle:newRadioIsJingle, is_ad:newRadioIsAd, ad_times:newRadioIsAd? newRadioAdTimes : [], active:true, folder:newRadioFolder.trim()||null, original_filename:newRadioAudioFilename||null };
    const url = editingRadioId? `${supabaseUrl}/rest/v1/radio_playlist?id=eq.${editingRadioId}` : `${supabaseUrl}/rest/v1/radio_playlist`;
    const method = editingRadioId? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${accessTokenRef.current||supabaseKey}`, 'Content-Type':'application/json', 'Prefer':'return=minimal' }, body: JSON.stringify(payload) });
    if(res.ok){ setNewRadioTitle(''); setNewRadioAudio(''); setNewRadioAudioFilename(''); setNewRadioFolder(''); setNewRadioImage(''); setNewRadioIsJingle(false); setNewRadioIsAd(false); setNewRadioAdTimes([]); setEditingRadioId(null); fetchRadioPlaylist(); alert(editingRadioId? 'Piste modifiee!' : 'Piste ajoutee a la radio!'); } else alert(await res.text());
  };
  const handleEditRadioTrack = (t) => { setEditingRadioId(t.id); setNewRadioTitle(t.title||''); setNewRadioAudio(t.url||''); setNewRadioAudioFilename(t.original_filename||''); setNewRadioFolder(t.folder||''); setNewRadioImage(t.image||''); setNewRadioIsJingle(!!t.is_jingle); setNewRadioIsAd(!!t.is_ad); setNewRadioAdTimes(t.ad_times||[]); window.scrollTo(0,0); };
  const handleCancelRadioEdit = () => { setEditingRadioId(null); setNewRadioTitle(''); setNewRadioAudio(''); setNewRadioAudioFilename(''); setNewRadioFolder(''); setNewRadioImage(''); setNewRadioIsJingle(false); setNewRadioIsAd(false); setNewRadioAdTimes([]); };
  const handleDeleteRadioTrack = async (id) => { if(!confirm('Supprimer cette piste?')) return; await fetch(`${supabaseUrl}/rest/v1/radio_playlist?id=eq.${id}`, { method:'DELETE', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${accessTokenRef.current||supabaseKey}` } }); fetchRadioPlaylist(); };
  const handleToggleRadioTrack = async (t) => { await fetch(`${supabaseUrl}/rest/v1/radio_playlist?id=eq.${t.id}`, { method:'PATCH', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${accessTokenRef.current||supabaseKey}`, 'Content-Type':'application/json' }, body: JSON.stringify({ active:!t.active }) }); fetchRadioPlaylist(); };

  const getYtId = (url) => getYoutubeId(url);
  const addVideoAdTime = () => {
    if(!videoAdTimeInput) return
    if(newVideoAdTimes.includes(videoAdTimeInput)) return
    setNewVideoAdTimes([...newVideoAdTimes, videoAdTimeInput].sort())
    setVideoAdTimeInput('')
  }
  const removeVideoAdTime = (t) => setNewVideoAdTimes(newVideoAdTimes.filter(x=>x!==t))

  const handleAddVideoTrack = async () => {
    if(!newVideoUrl.trim()) return alert('Colle un lien YouTube');
    const id = getYtId(newVideoUrl.trim());
    if(!id) return alert('Lien YouTube invalide');
    if(!newVideoTitle.trim()) return alert('Mets un titre pour la video');
    if(newVideoIsAd && newVideoAdTimes.length===0) return alert('Ajoute au moins une heure de diffusion pour cette pub');
    const targetFolder = newVideoFolder.trim()||null;
    const dup = videoPlaylist.find(v => v.id!==editingVideoId && getYtId(v.url||'')===id && (v.folder||null)===targetFolder);
    if(dup) return alert(`Cette video est deja dans ${targetFolder? `le groupe "${targetFolder}"`:'la playlist generale (sans groupe)'}. Change de groupe si tu veux quand meme l'ajouter.`);
    const thumb = getYoutubeThumb(newVideoUrl.trim());
    const payload = { title:newVideoTitle.trim(), url:newVideoUrl.trim(), image:thumb, is_jingle:newVideoIsJingle, is_ad:newVideoIsAd, ad_times:newVideoIsAd? newVideoAdTimes : [], active:true, folder:newVideoFolder.trim()||null };
    const url = editingVideoId? `${supabaseUrl}/rest/v1/video_playlist?id=eq.${editingVideoId}` : `${supabaseUrl}/rest/v1/video_playlist`;
    const method = editingVideoId? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${accessTokenRef.current||supabaseKey}`, 'Content-Type':'application/json', 'Prefer':'return=minimal' }, body: JSON.stringify(payload) });
    if(res.ok){ setNewVideoTitle(''); setNewVideoUrl(''); setNewVideoIsJingle(false); setNewVideoIsAd(false); setNewVideoAdTimes([]); setNewVideoFolder(''); setEditingVideoId(null); fetchVideoPlaylist(); alert(editingVideoId? 'Video modifiee!' : 'Video ajoutee a la playlist TV!'); } else alert(await res.text());
  };
  const handleEditVideoTrack = (v) => { setEditingVideoId(v.id); setNewVideoTitle(v.title||''); setNewVideoUrl(v.url||''); setNewVideoIsJingle(!!v.is_jingle); setNewVideoIsAd(!!v.is_ad); setNewVideoAdTimes(v.ad_times||[]); setNewVideoFolder(v.folder||''); window.scrollTo(0,0); };
  const handleCancelVideoEdit = () => { setEditingVideoId(null); setNewVideoTitle(''); setNewVideoUrl(''); setNewVideoIsJingle(false); setNewVideoIsAd(false); setNewVideoAdTimes([]); setNewVideoFolder(''); };
  const handleDeleteVideoTrack = async (id) => { if(!confirm('Supprimer cette video?')) return; await fetch(`${supabaseUrl}/rest/v1/video_playlist?id=eq.${id}`, { method:'DELETE', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${accessTokenRef.current||supabaseKey}` } }); fetchVideoPlaylist(); };
  const handleToggleVideoTrack = async (v) => { await fetch(`${supabaseUrl}/rest/v1/video_playlist?id=eq.${v.id}`, { method:'PATCH', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${accessTokenRef.current||supabaseKey}`, 'Content-Type':'application/json' }, body: JSON.stringify({ active:!v.active }) }); fetchVideoPlaylist(); };

  const handleAddUne = async () => {
    if(!newUneImage) return alert('Image obligatoire');
    const res=await fetch(`${supabaseUrl}/rest/v1/unes`, {
      method:'POST',
      headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${accessTokenRef.current||supabaseKey}`, 'Content-Type':'application/json', 'Prefer':'return=minimal' },
      body: JSON.stringify({ journal:newUneJournal.trim(), title:newUneTitle.trim()||newUneJournal.trim()||'Kiosque', image:newUneImage, date:newUneDate, price:newUnePrice?parseInt(newUnePrice,10):null, pdf_path:newUnePdfPath||null, active:true })
    });
    if(res.ok){ setNewUneImage(''); setNewUneJournal(''); setNewUneTitle(''); setNewUnePrice(''); setNewUnePdfPath(''); fetchUnes(); alert('Une ajoutee au Kiosque!'); } else { alert(await res.text()); }
  };
  const handleDeleteUne = async (id) => { if(!confirm('Supprimer cette Une?')) return; await fetch(`${supabaseUrl}/rest/v1/unes?id=eq.${id}`, { method:'DELETE', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${accessTokenRef.current||supabaseKey}` } }); fetchUnes(); };
  const handleToggleUne = async (u) => { await fetch(`${supabaseUrl}/rest/v1/unes?id=eq.${u.id}`, { method:'PATCH', headers:{ 'apikey':supabaseKey, 'Authorization':`Bearer ${accessTokenRef.current||supabaseKey}`, 'Content-Type':'application/json' }, body: JSON.stringify({ active:!u.active }) }); fetchUnes(); };

  const handleEdit = (art) => { 
    setForm({ id: art.id, title: art.title, category: art.category, image: art.image||'', translations: art.translations||{}, gallery: art.gallery||[], status: art.status||'draft', author: art.author||'' }); 
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
    setEditLang('fr'); resetTabs(); window.scrollTo(0,0); 
  };
  const handleDelete = async (id) => { if(!confirm('Supprimer definitivement cet article?')) return; const res = await fetch(`${supabaseUrl}/rest/v1/articles?id=eq.${id}`, { method: 'DELETE', headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${accessTokenRef.current||supabaseKey}` } }); if(res.ok) fetchArticles(); };
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
          <input type="email" placeholder="Email" value={user} onChange={e=>setUser(e.target.value)} style={{width:'100%',padding:12,marginBottom:10,borderRadius:10,border:'1px solid #d1d5db'}} autoComplete="username" />
          <input type="password" placeholder="Mot de passe" value={pass} onChange={e=>setPass(e.target.value)} style={{width:'100%',padding:12,marginBottom:14,borderRadius:10,border:'1px solid #d1d5db'}} autoComplete="current-password" />
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
          {canAccess('articles') && <button onClick={()=>{const v=!showArticles; resetTabs(); setShowArticles(v);}} style={{flex:'1 0 80px', padding:'10px', fontSize:11, borderRadius:10, border:'1px solid #c7d2fe', background: showArticles? '#2e4fb0':'white', color: showArticles? 'white':'#2e4fb0', fontWeight:800}}>Articles ({articles.length})</button>}
          {canAccess('flash') && <button onClick={()=>{const v=!showFlash; resetTabs(); setShowFlash(v);}} style={{flex:'1 0 80px', padding:'10px', fontSize:11, borderRadius:10, border:'1px solid #c7d2fe', background: showFlash? '#2e4fb0':'white', color: showFlash? 'white':'#2e4fb0', fontWeight:800}}>Flash ({flashes.length})</button>}
          {canAccess('commentaires') && <button onClick={()=>{const v=!showCommentaires; resetTabs(); setShowCommentaires(v);}} style={{flex:'1 0 100px', padding:'10px', fontSize:11, borderRadius:10, border:'1px solid #c7d2fe', background: showCommentaires? '#2e4fb0':'white', color: showCommentaires? 'white':'#2e4fb0', fontWeight:800}}>Commentaires ({comments.length})</button>}
          {canAccess('annonces') && <button onClick={()=>{const v=!showAnnonces; resetTabs(); setShowAnnonces(v);}} style={{flex:'1 0 90px', padding:'10px', fontSize:11, borderRadius:10, border:'1px solid #fde68a', background: showAnnonces? '#ffcc00':'white', color: '#0f2040', fontWeight:900}}>Annonces ({annonces.length})</button>}
          {canAccess('pubs') && <button onClick={()=>{const v=!showPubs; resetTabs(); setShowPubs(v);}} style={{flex:'1 0 80px', padding:'10px', fontSize:11, borderRadius:10, border:'1px solid #c7d2fe', background: showPubs? '#2e4fb0':'white', color: showPubs? 'white':'#2e4fb0', fontWeight:800}}>Pubs ({pubs.length})</button>}
          {canAccess('radio') && <button onClick={()=>{const v=!showRadio; resetTabs(); setShowRadio(v);}} style={{flex:'1 0 80px', padding:'10px', fontSize:11, borderRadius:10, border:'1px solid #bbf7d0', background: showRadio? '#16a34a':'white', color: showRadio? 'white':'#16a34a', fontWeight:800}}>Radio ({radioPlaylist.length})</button>}
          {canAccess('videotv') && <button onClick={()=>{const v=!showVideoTV; resetTabs(); setShowVideoTV(v);}} style={{flex:'1 0 80px', padding:'10px', fontSize:11, borderRadius:10, border:'1px solid #fecaca', background: showVideoTV? '#dc2626':'white', color: showVideoTV? 'white':'#dc2626', fontWeight:800}}>Videos TV ({videoPlaylist.length})</button>}
          {canAccess('grille') && <button onClick={()=>{const v=!showGrille; resetTabs(); setShowGrille(v);}} style={{flex:'1 0 80px', padding:'10px', fontSize:11, borderRadius:10, border:'1px solid #93c5fd', background: showGrille? '#1d4ed8':'white', color: showGrille? 'white':'#1d4ed8', fontWeight:800}}>Grille ({programmeGrid.length})</button>}
          {canAccess('emissions') && <button onClick={()=>{const v=!showEmissions; resetTabs(); setShowEmissions(v);}} style={{flex:'1 0 90px', padding:'10px', fontSize:11, borderRadius:10, border:'1px solid #99f6e4', background: showEmissions? '#0d9488':'white', color: showEmissions? 'white':'#0d9488', fontWeight:800}}>Emissions ({emissions.length})</button>}
          {canAccess('kiosque') && <button onClick={()=>{const v=!showKiosque; resetTabs(); setShowKiosque(v);}} style={{flex:'1 0 80px', padding:'10px', fontSize:11, borderRadius:10, border:'2px solid #ffcc00', background: showKiosque? '#0f2040':'white', color: showKiosque? '#ffcc00':'#0f2040', fontWeight:900}}>KIOSQUE ({unes.length})</button>}
          {canAccess('encadres') && <button onClick={()=>{const v=!showEncadres; resetTabs(); setShowEncadres(v);}} style={{flex:'1 0 90px', padding:'10px', fontSize:11, borderRadius:10, border:'2px solid #a855f7', background: showEncadres? '#a855f7':'white', color: showEncadres? 'white':'#a855f7', fontWeight:900}}>ESPACE BUSINESS ({encadres.length})</button>}
          {canAccess('users') && (<button onClick={()=>{const v=!showUsers; resetTabs(); setShowUsers(v);}} style={{flex:'1 0 70px', padding:'10px', fontSize:11, borderRadius:10, border:'1px solid #c7d2fe', background: showUsers? '#2e4fb0':'white', color: showUsers? 'white':'#2e4fb0', fontWeight:800}}>Users</button>)}
          {canAccess('articles') && <button onClick={resetTabs} style={{flex:'1 0 80px', padding:'10px', fontSize:11, borderRadius:10, border:'1px solid #c7d2fe', background: allTabsHidden? '#ffcc00':'white', color:'#0f2040', fontWeight:900}}>Nouveau</button>}
        </div>

        {showUsers? (
          <div style={{background:'white', padding:16, borderRadius:14, borderTop:'4px solid #2e4fb0'}}>
            <h3 style={{marginTop:0, color:'#2e4fb0'}}>Ajouter un utilisateur</h3>
            <div style={{border:'2px dashed #93c5fd', padding:14, borderRadius:12, background:'#f0f7ff', marginBottom:16}}>
              <label style={{fontSize:10,fontWeight:800,color:'#2e4fb0'}}>EMAIL</label>
              <input type="email" placeholder="prenom.nom@riusmultimedia.com" value={newUserEmail} onChange={e=>setNewUserEmail(e.target.value)} style={{width:'100%',padding:10,marginTop:4,marginBottom:10,borderRadius:8,border:'1px solid #c7d2fe'}} />

              <label style={{fontSize:10,fontWeight:800,color:'#2e4fb0'}}>MOT DE PASSE TEMPORAIRE</label>
              <div style={{display:'flex',gap:6,marginTop:4,marginBottom:10}}>
                <input type="text" placeholder="Au moins 8 caracteres" value={newUserPassword} onChange={e=>setNewUserPassword(e.target.value)} style={{flex:1,padding:10,borderRadius:8,border:'1px solid #c7d2fe'}} />
                <button type="button" onClick={generateRandomPassword} style={{background:'#e0e7ff',color:'#2e4fb0',border:0,borderRadius:8,padding:'0 14px',fontWeight:800,fontSize:11,cursor:'pointer'}}>Generer</button>
              </div>

              <label style={{fontSize:10,fontWeight:800,color:'#2e4fb0'}}>ROLE</label>
              <select value={newUserRole} onChange={e=>setNewUserRole(e.target.value)} style={{width:'100%',padding:10,marginTop:4,marginBottom:12,borderRadius:8,border:'1px solid #c7d2fe',fontWeight:700}}>
                <option value="journaliste">Journaliste (Articles, Flash)</option>
                <option value="technicien">Technicien (Radio, Videos TV)</option>
                <option value="chef_programme">Chef de programme (Annonces, Pubs, Kiosque, Espace Business, Radio, Videos TV)</option>
                <option value="director">Directeur (acces total)</option>
              </select>

              <button onClick={handleCreateUser} disabled={creatingUser} style={{width:'100%',padding:12,background: creatingUser?'#94a3b8':'#2e4fb0',color:'white',fontWeight:900,borderRadius:10,border:0,cursor:creatingUser?'default':'pointer',fontSize:13}}>{creatingUser? 'Creation...' : 'CREER LE COMPTE'}</button>
            </div>
            <div style={{fontSize:11, color:'#64748b', lineHeight:1.6}}>
              Communique l'email et le mot de passe a la personne de maniere securisee. Elle pourra changer son mot de passe une fois connectee (bouton "Mdp" en haut a droite).
              <br/><br/>
              <b>Pour retirer un acces :</b> Supabase &gt; Authentication &gt; Users &gt; supprimer la personne.
            </div>
          </div>
        ) : showCommentaires? (
          <div style={{background:'white', padding:16, borderRadius:14, borderTop:'4px solid #2e4fb0'}}>
            <h3 style={{marginTop:0, color:'#2e4fb0'}}>Moderation des commentaires</h3>
            <div style={{fontSize:11, color:'#64748b', marginBottom:14}}>Tous les commentaires postes par les visiteurs sur tes articles. Supprime ceux qui posent probleme.</div>
            {comments.map(c=>{
              const art = articles.find(a=>a.id===c.article_id)
              return (
                <div key={c.id} style={{border:'1px solid #e5e7eb', padding:12, borderRadius:10, marginBottom:8}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10,marginBottom:6}}>
                    <div>
                      <span style={{fontWeight:800,color:'#2e4fb0',fontSize:13}}>{c.name}</span>
                      <span style={{fontSize:10,color:'#94a3b8',marginLeft:8}}>{c.created_at? new Date(c.created_at).toLocaleString('fr-FR'):''}</span>
                    </div>
                    <button onClick={()=>handleDeleteComment(c.id)} style={{background:'#fee2e2',color:'#dc2626',border:0,borderRadius:6,padding:'6px 10px',fontSize:11,flexShrink:0,cursor:'pointer'}}>Supprimer</button>
                  </div>
                  <div style={{fontSize:13,color:'#0f2040',lineHeight:1.5,marginBottom:6}}>{c.comment}</div>
                  <div style={{fontSize:10,color:'#94a3b8',fontStyle:'italic'}}>Sur l'article : {art? art.title : `#${c.article_id} (article introuvable)`}</div>
                </div>
              )
            })}
            {comments.length===0 && <div style={{textAlign:'center',padding:30,color:'#64748b',fontSize:12}}>Aucun commentaire pour l'instant.</div>}
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
            <div style={{fontSize:11, color:'#64748b', marginBottom:12}}>Ces pistes jouent en boucle sur la page DIRECT &gt; RADIO quand tu n'es pas en direct sur YouTube. Coche "C'est un jingle" pour les sons courts qui doivent s'intercaler automatiquement entre deux pistes normales.</div>

            <div style={{border:'2px solid #16a34a', padding:12, borderRadius:12, background:'#ecfdf5', marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:900,color:'#16a34a',marginBottom:8}}>IMPORT EN MASSE (plusieurs pistes d'un coup)</div>
              <div style={{fontSize:10,color:'#64748b',marginBottom:10}}>Chaque fichier devient une piste normale, titree automatiquement d'apres son nom (modifiable ensuite). Les fichiers non-audio du dossier sont ignores.</div>
              <label style={{fontSize:10,fontWeight:800,color:'#16a34a'}}>NOM DU GROUPE (optionnel, ex: "Slow") - permet de le programmer sur une plage horaire plus bas</label>
              <input placeholder="Laisse vide pour un import normal (sans groupe)" value={bulkImportFolder} onChange={e=>setBulkImportFolder(e.target.value)} style={{width:'100%',padding:8,marginTop:4,marginBottom:10,borderRadius:8,border:'1px solid #86efac',fontSize:12}} />
              {bulkImportProgress ? (
                <>
                  <div style={{fontSize:12,fontWeight:700,color:'#16a34a',marginBottom:8}}>Import en cours... {bulkImportProgress.current} / {bulkImportProgress.total} ({bulkImportProgress.ok} reussis{bulkImportProgress.skipped>0? `, ${bulkImportProgress.skipped} doublons ignores`:''})</div>
                  <button type="button" onClick={()=>{ bulkImportCancelRef.current = true; }} style={{background:'#dc2626',color:'white',border:0,padding:'8px 16px',borderRadius:8,fontWeight:800,fontSize:12,cursor:'pointer'}}>✕ Arreter l'import</button>
                </>
              ) : (
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  <label style={{background:'#16a34a',color:'white',padding:'10px 16px',borderRadius:8,fontWeight:800,fontSize:12,cursor:'pointer'}}>
                    📁 Importer un dossier
                    <input type="file" webkitdirectory="" directory="" multiple accept="audio/*" onChange={e=>handleBulkImportRadio(e.target.files)} style={{display:'none'}} />
                  </label>
                  <label style={{background:'white',color:'#16a34a',border:'1px solid #16a34a',padding:'10px 16px',borderRadius:8,fontWeight:800,fontSize:12,cursor:'pointer'}}>
                    🎵 Importer plusieurs fichiers
                    <input type="file" multiple accept="audio/*" onChange={e=>handleBulkImportRadio(e.target.files)} style={{display:'none'}} />
                  </label>
                </div>
              )}
            </div>

            <div style={{border:'2px solid #7c3aed', padding:12, borderRadius:12, background:'#f5f3ff', marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:900,color:'#7c3aed',marginBottom:8}}>PROGRAMMATION PAR GROUPE (ex: 05h-07h jouer "Slow")</div>
              <div style={{fontSize:10,color:'#64748b',marginBottom:10}}>Pendant cette plage, seules les pistes du groupe indique sont jouees. En dehors des plages programmees, les pistes sans groupe jouent normalement.</div>
              {(()=>{ const folderCounts={}; radioPlaylist.forEach(t=>{ if(t.folder){ if(!folderCounts[t.folder]) folderCounts[t.folder]={count:0, lastDate:null}; folderCounts[t.folder].count++; if(t.created_at && (!folderCounts[t.folder].lastDate || t.created_at>folderCounts[t.folder].lastDate)) folderCounts[t.folder].lastDate=t.created_at } }); const names=Object.keys(folderCounts); if(!names.length) return null; return (
                <div style={{background:'white', border:'1px solid #ddd6fe', borderRadius:8, padding:10, marginBottom:12}}>
                  <div style={{fontSize:10,fontWeight:900,color:'#7c3aed',marginBottom:6}}>DOSSIERS EXISTANTS</div>
                  {names.map(n=>(<div key={n} style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,fontSize:11,color:'#334155',padding:'3px 0'}}><span>📁 <b>{n}</b> — {folderCounts[n].count} fichier{folderCounts[n].count>1?'s':''}{folderCounts[n].lastDate? `, dernier ajout le ${new Date(folderCounts[n].lastDate).toLocaleDateString('fr-FR')}`:''}</span><button type="button" onClick={()=>handleDeleteFolder(n)} style={{background:'#fee2e2',color:'#dc2626',border:0,borderRadius:6,padding:'3px 8px',fontSize:10,fontWeight:700,cursor:'pointer',flexShrink:0}}>🗑️ Supprimer ce groupe</button></div>))}
                </div>
              ) })()}
              {(()=>{ const orphans = radioPlaylist.filter(t=>!t.folder && !t.is_jingle && !t.is_ad); if(!orphans.length) return null; return (
                <div style={{background:'#fffbeb', border:'1px solid #fde68a', borderRadius:8, padding:10, marginBottom:12}}>
                  <div style={{fontSize:10,fontWeight:900,color:'#b45309',marginBottom:6}}>REASSIGNER UN GROUPE ({orphans.length} piste{orphans.length>1?'s':''} sans groupe)</div>
                  <div style={{maxHeight:150, overflowY:'auto', marginBottom:8}}>
                    {orphans.map(t=>(
                      <label key={t.id} style={{display:'flex',alignItems:'center',gap:6,fontSize:11,padding:'3px 0',cursor:'pointer'}}>
                        <input type="checkbox" checked={reassignSelectedIds.has(t.id)} onChange={()=>toggleReassignSelect(t.id)} />
                        {t.title}
                      </label>
                    ))}
                  </div>
                  <div style={{display:'flex',gap:6}}>
                    <input placeholder='Nom du groupe a assigner' value={reassignFolderName} onChange={e=>setReassignFolderName(e.target.value)} style={{flex:1,padding:8,borderRadius:8,border:'1px solid #fde68a',fontSize:12}} />
                    <button type="button" onClick={handleReassignFolder} style={{background:'#b45309',color:'white',border:0,borderRadius:8,padding:'0 14px',fontWeight:800,fontSize:11,cursor:'pointer'}}>Assigner</button>
                  </div>
                </div>
              ) })()}
              <label style={{fontSize:10,fontWeight:800,color:'#7c3aed'}}>NOM DU GROUPE *</label>
              <input placeholder='Ex: Slow' value={newBlockFolder} onChange={e=>setNewBlockFolder(e.target.value)} style={{width:'100%',padding:8,marginTop:4,marginBottom:10,borderRadius:8,border:'1px solid #ddd6fe',fontSize:12}} />
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                <div><label style={{fontSize:10,fontWeight:800,color:'#7c3aed'}}>DEBUT *</label><input type="time" value={newBlockStart} onChange={e=>setNewBlockStart(e.target.value)} style={{width:'100%',padding:8,marginTop:4,borderRadius:8,border:'1px solid #ddd6fe'}} /></div>
                <div><label style={{fontSize:10,fontWeight:800,color:'#7c3aed'}}>FIN *</label><input type="time" value={newBlockEnd} onChange={e=>setNewBlockEnd(e.target.value)} style={{width:'100%',padding:8,marginTop:4,borderRadius:8,border:'1px solid #ddd6fe'}} /></div>
              </div>
              <label style={{fontSize:10,fontWeight:800,color:'#7c3aed'}}>JOURS *</label>
              <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:6,marginBottom:12}}>
                {[['lun','Lun'],['mar','Mar'],['mer','Mer'],['jeu','Jeu'],['ven','Ven'],['sam','Sam'],['dim','Dim'],['tous','Tous les jours']].map(([val,label])=>(
                  <button key={val} type="button" onClick={()=>toggleBlockDay(val)} style={{padding:'6px 10px',borderRadius:20,border: newBlockDays.includes(val)? '2px solid #7c3aed':'1px solid #ddd6fe',background: newBlockDays.includes(val)? '#7c3aed':'white',color: newBlockDays.includes(val)? 'white':'#7c3aed',fontWeight:800,fontSize:11,cursor:'pointer'}}>{label}</button>
                ))}
              </div>
              <button onClick={handleAddTimeBlock} style={{width:'100%',padding:10,background:'#7c3aed',color:'white',fontWeight:900,borderRadius:8,border:0,cursor:'pointer',fontSize:12}}>{editingBlockId? 'METTRE A JOUR' : 'AJOUTER CETTE PLAGE'}</button>
              {editingBlockId && <button onClick={resetBlockForm} style={{width:'100%',marginTop:8,padding:8,background:'transparent',color:'#7c3aed',fontWeight:700,borderRadius:8,border:'1px solid #7c3aed',cursor:'pointer'}}>Annuler la modification</button>}
              {radioTimeBlocks.length>0 && <div style={{marginTop:14}}>
                {radioTimeBlocks.map(b=>(
                  <div key={b.id} style={{border:'1px solid #e5e7eb', padding:10, borderRadius:10, display:'flex', gap:10, alignItems:'center', marginBottom:6, flexWrap:'wrap', opacity:b.active?1:0.6}}>
                    <div style={{flex:1, minWidth:140}}>
                      <div style={{fontSize:12,fontWeight:700}}>{b.start_time} - {b.end_time} : "{b.folder}"</div>
                      <div style={{fontSize:10,color:'#64748b',marginTop:2}}>{(b.days||[]).join(', ')}</div>
                    </div>
                    <button onClick={()=>handleEditTimeBlock(b)} style={{background:'#ede9fe',color:'#7c3aed',border:0,borderRadius:6,padding:'6px 10px',fontSize:11}}>Modifier</button>
                    <button onClick={()=>handleToggleTimeBlock(b)} style={{background: b.active?'#dcfce7':'#fee2e2', border:0, borderRadius:6, padding:'6px 8px', fontSize:10}}>{b.active?'ON':'OFF'}</button>
                    <button onClick={()=>handleDeleteTimeBlock(b.id)} style={{background:'#fee2e2',color:'#dc2626',border:0,borderRadius:6,padding:'6px 10px',fontSize:11}}>Suppr</button>
                  </div>
                ))}
              </div>}
            </div>

            <div style={{border:'2px dashed #86efac', padding:12, borderRadius:12, background:'#f0fdf4', marginBottom:12}}>
              <label style={{fontSize:10,fontWeight:800,color:'#16a34a'}}>TITRE DE LA PISTE *</label>
              <input placeholder="Ex: Emission Societe - 12 aout" value={newRadioTitle} onChange={e=>setNewRadioTitle(e.target.value)} style={{width:'100%',padding:10,marginTop:4,marginBottom:10,borderRadius:8,border:'1px solid #bbf7d0',fontSize:12}} />
              <label style={{display:'flex',alignItems:'center',gap:8,fontSize:11,fontWeight:800,color:'#16a34a',marginBottom:10,cursor:'pointer'}}>
                <input type="checkbox" checked={newRadioIsJingle} onChange={e=>setNewRadioIsJingle(e.target.checked)} />
                C'est un jingle (s'intercale automatiquement entre les pistes, pas dans la numerotation)
              </label>
              <label style={{display:'flex',alignItems:'center',gap:8,fontSize:11,fontWeight:800,color:'#d97706',marginBottom:10,cursor:'pointer'}}>
                <input type="checkbox" checked={newRadioIsAd} onChange={e=>setNewRadioIsAd(e.target.checked)} />
                C'est une pub (diffusee a des heures precises que tu choisis)
              </label>
              {newRadioIsAd && (
                <div style={{border:'1px solid #fde68a', background:'#fffbeb', borderRadius:8, padding:10, marginBottom:12}}>
                  <label style={{fontSize:10,fontWeight:800,color:'#d97706'}}>HEURES DE DIFFUSION (ex: 07:50, 11:30, 18:55)</label>
                  <div style={{display:'flex',gap:6,marginTop:4}}>
                    <input type="time" value={adTimeInput} onChange={e=>setAdTimeInput(e.target.value)} style={{flex:1,padding:8,borderRadius:6,border:'1px solid #fde68a'}} />
                    <button type="button" onClick={addAdTime} style={{background:'#d97706',color:'white',border:0,borderRadius:6,padding:'0 14px',fontWeight:800,fontSize:11,cursor:'pointer'}}>+ Ajouter</button>
                  </div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:8}}>
                    {newRadioAdTimes.map(t=>(
                      <span key={t} style={{background:'#fde68a',color:'#92400e',padding:'4px 8px',borderRadius:20,fontSize:11,fontWeight:800,display:'flex',alignItems:'center',gap:6}}>
                        {t}
                        <button type="button" onClick={()=>removeAdTime(t)} style={{background:'none',border:0,color:'#92400e',cursor:'pointer',fontWeight:900}}>×</button>
                      </span>
                    ))}
                    {newRadioAdTimes.length===0 && <span style={{fontSize:11,color:'#92400e',opacity:0.7}}>Aucune heure ajoutee</span>}
                  </div>
                </div>
              )}
              <label style={{fontSize:10,fontWeight:800,color:'#16a34a'}}>GROUPE (optionnel, pour la programmation par plage horaire)</label>
              <input placeholder='Ex: Slow' value={newRadioFolder} onChange={e=>setNewRadioFolder(e.target.value)} style={{width:'100%',padding:8,marginTop:4,marginBottom:10,borderRadius:8,border:'1px solid #bbf7d0',fontSize:12}} />
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
                  <div style={{fontSize:12,fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:6}}>{t.is_jingle? <span style={{background:'#0f2040',color:'#ffcc00',fontSize:9,fontWeight:900,padding:'2px 6px',borderRadius:10}}>JINGLE</span> : t.is_ad? <span style={{background:'#fde68a',color:'#92400e',fontSize:9,fontWeight:900,padding:'2px 6px',borderRadius:10}}>PUB</span> : `${i+1}.`} {t.title}</div>
                  {t.is_ad && <div style={{fontSize:10,color:'#92400e',marginTop:2}}>Diffusion : {(t.ad_times||[]).join(', ')||'aucune heure'}</div>}
                  {t.folder && <div style={{fontSize:10,color:'#7c3aed',marginTop:2,fontWeight:700}}>📁 Groupe : {t.folder}</div>}
                  {t.created_at && <div style={{fontSize:9,color:'#94a3b8',marginTop:2}}>Ajoute le {new Date(t.created_at).toLocaleDateString('fr-FR')}</div>}
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

            {tvWatermark && (
              <div style={{border:'2px solid #16a34a', borderRadius:12, padding:14, background:'#f0fdf4', marginBottom:16}}>
                <div style={{fontSize:12,fontWeight:900,color:'#16a34a',marginBottom:10}}>BANDEAUX INFO / ANNONCES (bas de l'ecran TV)</div>
                <label style={{display:'flex',alignItems:'center',gap:8,fontSize:11,fontWeight:800,cursor:'pointer',marginBottom:8}}>
                  <input type="checkbox" checked={tvWatermark.ticker_info_enabled!==false} onChange={e=>setTvWatermark({...tvWatermark, ticker_info_enabled:e.target.checked})} />
                  Afficher le bandeau INFO (Flash)
                </label>
                <label style={{display:'flex',alignItems:'center',gap:8,fontSize:11,fontWeight:800,cursor:'pointer'}}>
                  <input type="checkbox" checked={tvWatermark.ticker_annonces_enabled!==false} onChange={e=>setTvWatermark({...tvWatermark, ticker_annonces_enabled:e.target.checked})} />
                  Afficher le bandeau ANNONCES
                </label>
                <div style={{fontSize:10,color:'#64748b',marginTop:6}}>Chacun peut etre active ou desactive independamment. Reprend automatiquement le contenu de tes onglets Flash et Annonces existants, rien d'autre a configurer.</div>
              </div>
            )}

            {tvWatermark && (
              <div style={{border:'2px solid #ea580c', borderRadius:12, padding:14, background:'#fff7ed', marginBottom:16}}>
                <div style={{fontSize:12,fontWeight:900,color:'#ea580c',marginBottom:10}}>HEURE / METEO (bas de l'ecran TV)</div>
                <label style={{display:'flex',alignItems:'center',gap:8,fontSize:11,fontWeight:800,cursor:'pointer',marginBottom:8}}>
                  <input type="checkbox" checked={tvWatermark.clock_enabled!==false} onChange={e=>setTvWatermark({...tvWatermark, clock_enabled:e.target.checked})} />
                  Afficher l'heure
                </label>
                <label style={{display:'flex',alignItems:'center',gap:8,fontSize:11,fontWeight:800,cursor:'pointer',marginBottom:12}}>
                  <input type="checkbox" checked={tvWatermark.weather_enabled!==false} onChange={e=>setTvWatermark({...tvWatermark, weather_enabled:e.target.checked})} />
                  Afficher la meteo
                </label>

                <label style={{fontSize:10,fontWeight:800,color:'#ea580c'}}>POSITION</label>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:6,marginBottom:12,maxWidth:260}}>
                  {[['top-left','Haut - Gauche'],['top-right','Haut - Droite'],['bottom-left','Bas - Gauche'],['bottom-right','Bas - Droite']].map(([val,label])=>(
                    <button key={val} type="button" onClick={()=>setTvWatermark({...tvWatermark, clock_weather_position:val})} style={{padding:'8px 6px',borderRadius:8,border: (tvWatermark.clock_weather_position||'top-left')===val? '2px solid #ea580c':'1px solid #fed7aa',background: (tvWatermark.clock_weather_position||'top-left')===val? '#ea580c':'white',color: (tvWatermark.clock_weather_position||'top-left')===val? 'white':'#ea580c',fontWeight:800,fontSize:11,cursor:'pointer'}}>{label}</button>
                  ))}
                </div>

                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,maxWidth:280}}>
                  <div>
                    <label style={{fontSize:10,fontWeight:800,color:'#ea580c'}}>COULEUR HEURE</label>
                    <input type="color" value={tvWatermark.clock_color||'#ffffff'} onChange={e=>setTvWatermark({...tvWatermark, clock_color:e.target.value})} style={{width:'100%',height:34,marginTop:4,borderRadius:6,border:'1px solid #fed7aa',cursor:'pointer'}} />
                  </div>
                  <div>
                    <label style={{fontSize:10,fontWeight:800,color:'#ea580c'}}>COULEUR METEO</label>
                    <input type="color" value={tvWatermark.weather_color||'#ff3b3b'} onChange={e=>setTvWatermark({...tvWatermark, weather_color:e.target.value})} style={{width:'100%',height:34,marginTop:4,borderRadius:6,border:'1px solid #fed7aa',cursor:'pointer'}} />
                  </div>
                </div>
                <div style={{fontSize:10,color:'#64748b',marginTop:10}}>Par defaut : heure en blanc, meteo en rouge. Change les couleurs ici si un fond te pose probleme de lisibilite.</div>
              </div>
            )}

            {tvWatermark && (
              <div style={{border:'2px solid #0f2040', borderRadius:12, padding:14, background:'#f8fafc', marginBottom:16}}>
                <div style={{fontSize:12,fontWeight:900,color:'#0f2040',marginBottom:10}}>INCRUSTATION LOGO / NOM (direct + rediffusions)</div>
                <label style={{display:'flex',alignItems:'center',gap:8,fontSize:11,fontWeight:800,marginBottom:10,cursor:'pointer'}}>
                  <input type="checkbox" checked={tvWatermark.enabled} onChange={e=>setTvWatermark({...tvWatermark, enabled:e.target.checked})} />
                  Afficher l'incrustation
                </label>
                <label style={{fontSize:10,fontWeight:800}}>LOGO (optionnel, sinon logo du site)</label>
                <div style={{display:'flex',alignItems:'center',gap:10,marginTop:4,marginBottom:10}}>
                  {tvWatermark.logo_url && <img src={tvWatermark.logo_url} style={{width:36,height:36,borderRadius:'50%',objectFit:'cover',border:'1px solid #c7d2fe'}} alt="" />}
                  <input type="file" accept="image/*" onChange={e=>uploadWatermarkLogo(e.target.files[0])} style={{flex:1,fontSize:11}} />
                  {tvWatermark.logo_url && <button type="button" onClick={()=>setTvWatermark({...tvWatermark, logo_url:null})} style={{background:'#fee2e2',color:'#dc2626',border:0,borderRadius:6,padding:'6px 10px',fontSize:10,cursor:'pointer'}}>Retirer</button>}
                </div>
                {uploading==='watermark' && <div style={{fontSize:11,color:'#0f2040',marginBottom:8}}>Upload logo...</div>}
                <label style={{fontSize:10,fontWeight:800}}>TEXTE AFFICHE (optionnel)</label>
                <div style={{fontSize:10,color:'#64748b',marginTop:2,marginBottom:4}}>Laisse vide si ton logo contient deja le nom \u2014 seul le logo s'affichera alors.</div>
                <input value={tvWatermark.label||''} onChange={e=>setTvWatermark({...tvWatermark, label:e.target.value})} style={{width:'100%',padding:8,marginTop:4,marginBottom:10,borderRadius:8,border:'1px solid #c7d2fe'}} />
                <label style={{fontSize:10,fontWeight:800}}>POSITION</label>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:6,marginBottom:12,maxWidth:260}}>
                  {[['top-left','Haut - Gauche'],['top-right','Haut - Droite'],['bottom-left','Bas - Gauche'],['bottom-right','Bas - Droite']].map(([val,label])=>(
                    <button key={val} type="button" onClick={()=>setTvWatermark({...tvWatermark, position:val})} style={{padding:'8px 6px',borderRadius:8,border: tvWatermark.position===val? '2px solid #0f2040':'1px solid #c7d2fe',background: tvWatermark.position===val? '#0f2040':'white',color: tvWatermark.position===val? 'white':'#0f2040',fontWeight:800,fontSize:11,cursor:'pointer'}}>{label}</button>
                  ))}
                </div>
                <label style={{fontSize:10,fontWeight:800}}>TAILLE DU LOGO ({tvWatermark.size_px||70}px de haut)</label>
                <input type="range" min="30" max="180" step="5" value={tvWatermark.size_px||70} onChange={e=>setTvWatermark({...tvWatermark, size_px:parseInt(e.target.value,10)})} style={{width:'100%',marginTop:6,marginBottom:4,maxWidth:280}} />
                <div style={{display:'flex',justifyContent:'space-between',fontSize:9,color:'#94a3b8',maxWidth:280,marginBottom:12}}><span>Petit</span><span>Grand</span></div>
                <button onClick={handleSaveWatermark} disabled={savingWatermark} style={{padding:'10px 18px',background: savingWatermark?'#94a3b8':'#0f2040',color:'white',fontWeight:900,borderRadius:8,border:0,cursor:savingWatermark?'default':'pointer',fontSize:12}}>{savingWatermark?'Enregistrement...':'Enregistrer les reglages'}</button>
              </div>
            )}

            <div style={{border:'2px solid #7c3aed', padding:12, borderRadius:12, background:'#f5f3ff', marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:900,color:'#7c3aed',marginBottom:8}}>PROGRAMMATION PAR GROUPE (ex: 18h-20h jouer "Reportages")</div>
              <div style={{fontSize:10,color:'#64748b',marginBottom:10}}>Attribue un groupe a une video dans le formulaire ci-dessous, puis programme ce groupe ici. Pendant cette plage, seules les videos du groupe indique sont jouees. En dehors, les videos sans groupe jouent normalement. Attention : contrairement a la radio, un changement de groupe peut couper une video en cours au moment de la bascule.</div>
              {(()=>{ const folderCounts={}; videoPlaylist.forEach(v=>{ if(v.folder){ if(!folderCounts[v.folder]) folderCounts[v.folder]={count:0, lastDate:null}; folderCounts[v.folder].count++; if(v.created_at && (!folderCounts[v.folder].lastDate || v.created_at>folderCounts[v.folder].lastDate)) folderCounts[v.folder].lastDate=v.created_at } }); const names=Object.keys(folderCounts); if(!names.length) return null; return (
                <div style={{background:'white', border:'1px solid #ddd6fe', borderRadius:8, padding:10, marginBottom:12}}>
                  <div style={{fontSize:10,fontWeight:900,color:'#7c3aed',marginBottom:6}}>GROUPES EXISTANTS</div>
                  {names.map(n=>(<div key={n} style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,fontSize:11,color:'#334155',padding:'3px 0'}}><span>📁 <b>{n}</b> — {folderCounts[n].count} video{folderCounts[n].count>1?'s':''}{folderCounts[n].lastDate? `, derniere ajoutee le ${new Date(folderCounts[n].lastDate).toLocaleDateString('fr-FR')}`:''}</span><button type="button" onClick={()=>handleDeleteTvFolder(n)} style={{background:'#fee2e2',color:'#dc2626',border:0,borderRadius:6,padding:'3px 8px',fontSize:10,fontWeight:700,cursor:'pointer',flexShrink:0}}>🗑️ Supprimer ce groupe</button></div>))}
                </div>
              ) })()}
              {(()=>{ const orphans = videoPlaylist.filter(v=>!v.folder && !v.is_jingle && !v.is_ad); if(!orphans.length) return null; return (
                <div style={{background:'#fffbeb', border:'1px solid #fde68a', borderRadius:8, padding:10, marginBottom:12}}>
                  <div style={{fontSize:10,fontWeight:900,color:'#b45309',marginBottom:6}}>REASSIGNER UN GROUPE ({orphans.length} video{orphans.length>1?'s':''} sans groupe)</div>
                  <div style={{maxHeight:150, overflowY:'auto', marginBottom:8}}>
                    {orphans.map(v=>(
                      <label key={v.id} style={{display:'flex',alignItems:'center',gap:6,fontSize:11,padding:'3px 0',cursor:'pointer'}}>
                        <input type="checkbox" checked={reassignTvSelectedIds.has(v.id)} onChange={()=>toggleReassignTvSelect(v.id)} />
                        {v.title}
                      </label>
                    ))}
                  </div>
                  <div style={{display:'flex',gap:6}}>
                    <input placeholder='Nom du groupe a assigner' value={reassignTvFolderName} onChange={e=>setReassignTvFolderName(e.target.value)} style={{flex:1,padding:8,borderRadius:8,border:'1px solid #fde68a',fontSize:12}} />
                    <button type="button" onClick={handleReassignTvFolder} style={{background:'#b45309',color:'white',border:0,borderRadius:8,padding:'0 14px',fontWeight:800,fontSize:11,cursor:'pointer'}}>Assigner</button>
                  </div>
                </div>
              ) })()}
              <label style={{fontSize:10,fontWeight:800,color:'#7c3aed'}}>NOM DU GROUPE *</label>
              <input placeholder='Ex: Reportages' value={newTvBlockFolder} onChange={e=>setNewTvBlockFolder(e.target.value)} style={{width:'100%',padding:8,marginTop:4,marginBottom:10,borderRadius:8,border:'1px solid #ddd6fe',fontSize:12}} />
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                <div><label style={{fontSize:10,fontWeight:800,color:'#7c3aed'}}>DEBUT *</label><input type="time" value={newTvBlockStart} onChange={e=>setNewTvBlockStart(e.target.value)} style={{width:'100%',padding:8,marginTop:4,borderRadius:8,border:'1px solid #ddd6fe'}} /></div>
                <div><label style={{fontSize:10,fontWeight:800,color:'#7c3aed'}}>FIN *</label><input type="time" value={newTvBlockEnd} onChange={e=>setNewTvBlockEnd(e.target.value)} style={{width:'100%',padding:8,marginTop:4,borderRadius:8,border:'1px solid #ddd6fe'}} /></div>
              </div>
              <label style={{fontSize:10,fontWeight:800,color:'#7c3aed'}}>JOURS *</label>
              <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:6,marginBottom:12}}>
                {[['lun','Lun'],['mar','Mar'],['mer','Mer'],['jeu','Jeu'],['ven','Ven'],['sam','Sam'],['dim','Dim'],['tous','Tous les jours']].map(([val,label])=>(
                  <button key={val} type="button" onClick={()=>toggleTvBlockDay(val)} style={{padding:'6px 10px',borderRadius:20,border: newTvBlockDays.includes(val)? '2px solid #7c3aed':'1px solid #ddd6fe',background: newTvBlockDays.includes(val)? '#7c3aed':'white',color: newTvBlockDays.includes(val)? 'white':'#7c3aed',fontWeight:800,fontSize:11,cursor:'pointer'}}>{label}</button>
                ))}
              </div>
              <button onClick={handleAddTvTimeBlock} style={{width:'100%',padding:10,background:'#7c3aed',color:'white',fontWeight:900,borderRadius:8,border:0,cursor:'pointer',fontSize:12}}>{editingTvBlockId? 'METTRE A JOUR' : 'AJOUTER CETTE PLAGE'}</button>
              {editingTvBlockId && <button onClick={resetTvBlockForm} style={{width:'100%',marginTop:8,padding:8,background:'transparent',color:'#7c3aed',fontWeight:700,borderRadius:8,border:'1px solid #7c3aed',cursor:'pointer'}}>Annuler la modification</button>}
              {tvTimeBlocks.length>0 && <div style={{marginTop:14}}>
                {tvTimeBlocks.map(b=>(
                  <div key={b.id} style={{border:'1px solid #e5e7eb', padding:10, borderRadius:10, display:'flex', gap:10, alignItems:'center', marginBottom:6, flexWrap:'wrap', opacity:b.active?1:0.6}}>
                    <div style={{flex:1, minWidth:140}}>
                      <div style={{fontSize:12,fontWeight:700}}>{b.start_time} - {b.end_time} : "{b.folder}"</div>
                      <div style={{fontSize:10,color:'#64748b',marginTop:2}}>{(b.days||[]).join(', ')}</div>
                    </div>
                    <button onClick={()=>handleEditTvTimeBlock(b)} style={{background:'#ede9fe',color:'#7c3aed',border:0,borderRadius:6,padding:'6px 10px',fontSize:11}}>Modifier</button>
                    <button onClick={()=>handleToggleTvTimeBlock(b)} style={{background: b.active?'#dcfce7':'#fee2e2', border:0, borderRadius:6, padding:'6px 8px', fontSize:10}}>{b.active?'ON':'OFF'}</button>
                    <button onClick={()=>handleDeleteTvTimeBlock(b.id)} style={{background:'#fee2e2',color:'#dc2626',border:0,borderRadius:6,padding:'6px 10px',fontSize:11}}>Suppr</button>
                  </div>
                ))}
              </div>}
            </div>

            <div style={{border:'2px dashed #fca5a5', padding:12, borderRadius:12, background:'#fef2f2', marginBottom:12}}>
              <label style={{fontSize:10,fontWeight:800,color:'#dc2626'}}>TITRE DE LA VIDEO *</label>
              <input placeholder="Ex: Reportage Marche de Lome" value={newVideoTitle} onChange={e=>setNewVideoTitle(e.target.value)} style={{width:'100%',padding:10,marginTop:4,marginBottom:10,borderRadius:8,border:'1px solid #fecaca',fontSize:12}} />
              <label style={{fontSize:10,fontWeight:800,color:'#dc2626'}}>LIEN YOUTUBE *</label>
              <input placeholder="https://www.youtube.com/watch?v=..." value={newVideoUrl} onChange={e=>setNewVideoUrl(e.target.value)} style={{width:'100%',padding:10,marginTop:4,borderRadius:8,border:'1px solid #fecaca',fontSize:12}} />
              {newVideoUrl && getYtId(newVideoUrl) && <img src={getYoutubeThumb(newVideoUrl)} style={{width:'100%',maxHeight:160,objectFit:'cover',borderRadius:8,marginTop:8}} alt="" />}
              <label style={{fontSize:10,fontWeight:800,color:'#dc2626',marginTop:10,display:'block'}}>GROUPE (optionnel, pour la programmation par plage horaire ci-dessus)</label>
              <input placeholder='Ex: Reportages' value={newVideoFolder} onChange={e=>setNewVideoFolder(e.target.value)} style={{width:'100%',padding:8,marginTop:4,borderRadius:8,border:'1px solid #fecaca',fontSize:12}} />
              <label style={{display:'flex',alignItems:'center',gap:8,fontSize:11,fontWeight:800,color:'#0f2040',marginTop:12,marginBottom:10,cursor:'pointer'}}>
                <input type="checkbox" checked={newVideoIsJingle} onChange={e=>setNewVideoIsJingle(e.target.checked)} />
                C'est un jingle video (s'intercale toutes les 3 a 5 videos)
              </label>
              <label style={{display:'flex',alignItems:'center',gap:8,fontSize:11,fontWeight:800,color:'#d97706',marginBottom:10,cursor:'pointer'}}>
                <input type="checkbox" checked={newVideoIsAd} onChange={e=>setNewVideoIsAd(e.target.checked)} />
                C'est une pub video (diffusee a des heures precises que tu choisis)
              </label>
              {newVideoIsAd && (
                <div style={{border:'1px solid #fde68a', background:'#fffbeb', borderRadius:8, padding:10, marginBottom:12}}>
                  <label style={{fontSize:10,fontWeight:800,color:'#d97706'}}>HEURES DE DIFFUSION (ex: 07:50, 11:30, 18:55)</label>
                  <div style={{display:'flex',gap:6,marginTop:4}}>
                    <input type="time" value={videoAdTimeInput} onChange={e=>setVideoAdTimeInput(e.target.value)} style={{flex:1,padding:8,borderRadius:6,border:'1px solid #fde68a'}} />
                    <button type="button" onClick={addVideoAdTime} style={{background:'#d97706',color:'white',border:0,borderRadius:6,padding:'0 14px',fontWeight:800,fontSize:11,cursor:'pointer'}}>+ Ajouter</button>
                  </div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:8}}>
                    {newVideoAdTimes.map(t=>(
                      <span key={t} style={{background:'#fde68a',color:'#92400e',padding:'4px 8px',borderRadius:20,fontSize:11,fontWeight:800,display:'flex',alignItems:'center',gap:6}}>
                        {t}
                        <button type="button" onClick={()=>removeVideoAdTime(t)} style={{background:'none',border:0,color:'#92400e',cursor:'pointer',fontWeight:900}}>×</button>
                      </span>
                    ))}
                    {newVideoAdTimes.length===0 && <span style={{fontSize:11,color:'#92400e',opacity:0.7}}>Aucune heure ajoutee</span>}
                  </div>
                </div>
              )}
              <button onClick={handleAddVideoTrack} style={{width:'100%',marginTop:10,padding:10,background:'#dc2626',color:'white',fontWeight:800,borderRadius:8,border:0}}>{editingVideoId? 'Modifier la video' : 'Ajouter a la playlist TV'}</button>
              {editingVideoId && <button onClick={handleCancelVideoEdit} style={{width:'100%',marginTop:8,padding:8,background:'transparent',color:'#dc2626',fontWeight:700,borderRadius:8,border:'1px solid #dc2626'}}>Annuler la modification</button>}
            </div>
            {videoPlaylist.map((v,i)=>(
              <div key={v.id} style={{border:'1px solid #e5e7eb', padding:8, borderRadius:10, display:'flex', gap:10, alignItems:'center', marginBottom:6, flexWrap:'wrap'}}>
                <img src={v.image} style={{width:60,height:36,objectFit:'cover',borderRadius:6}} alt="" />
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:6}}>{v.is_jingle? <span style={{background:'#0f2040',color:'#ffcc00',fontSize:9,fontWeight:900,padding:'2px 6px',borderRadius:10}}>JINGLE</span> : v.is_ad? <span style={{background:'#fde68a',color:'#92400e',fontSize:9,fontWeight:900,padding:'2px 6px',borderRadius:10}}>PUB</span> : `${i+1}.`} {v.title}</div>
                  {v.is_ad && <div style={{fontSize:10,color:'#92400e',marginTop:2}}>Diffusion : {(v.ad_times||[]).join(', ')||'aucune heure'}</div>}
                  {v.folder && <div style={{fontSize:10,color:'#7c3aed',marginTop:2,fontWeight:700}}>📁 Groupe : {v.folder}</div>}
                  {v.created_at && <div style={{fontSize:9,color:'#94a3b8',marginTop:2}}>Ajoutee le {new Date(v.created_at).toLocaleDateString('fr-FR')}</div>}
                </div>
                <button onClick={()=>handleEditVideoTrack(v)} style={{background:'#dbeafe',color:'#2e4fb0',border:0,borderRadius:6,padding:'6px 10px',fontSize:11}}>Modifier</button>
                <button onClick={()=>handleToggleVideoTrack(v)} style={{background: v.active?'#dcfce7':'#fee2e2', border:0, borderRadius:6, padding:'4px 8px', fontSize:10}}>{v.active?'ON':'OFF'}</button>
                <button onClick={()=>handleDeleteVideoTrack(v.id)} style={{background:'#fee2e2',color:'#dc2626',border:0,borderRadius:6,padding:'6px 10px',fontSize:11}}>Suppr</button>
              </div>
            ))}
            {videoPlaylist.length===0 && <div style={{textAlign:'center',padding:30,color:'#64748b',fontSize:12}}>Aucune video pour l'instant. Ajoute ta premiere video ci-dessus.</div>}
          </div>
        ) : showGrille? (
          <div style={{background:'white', padding:16, borderRadius:14, borderTop:'4px solid #1d4ed8'}}>
            <h3 style={{marginTop:0, color:'#1d4ed8'}}>Grille des programmes</h3>
            <div style={{fontSize:11, color:'#64748b', marginBottom:12}}>Dis a tes auditeurs/spectateurs ce qui passe et a quelle heure. N'est pas liee aux fichiers audio/video eux-memes.</div>
            <div style={{border:'2px dashed #93c5fd', padding:12, borderRadius:12, background:'#eff6ff', marginBottom:12}}>
              <label style={{fontSize:10,fontWeight:800,color:'#1d4ed8'}}>TITRE *</label>
              <input placeholder="Ex: Debat Politique" value={newProgTitle} onChange={e=>setNewProgTitle(e.target.value)} style={{width:'100%',padding:10,marginTop:4,marginBottom:10,borderRadius:8,border:'1px solid #bfdbfe',fontSize:12}} />
              <label style={{fontSize:10,fontWeight:800,color:'#1d4ed8'}}>DESCRIPTION (optionnel)</label>
              <input placeholder="Ex: Debat en direct avec des invites" value={newProgDesc} onChange={e=>setNewProgDesc(e.target.value)} style={{width:'100%',padding:10,marginTop:4,marginBottom:10,borderRadius:8,border:'1px solid #bfdbfe',fontSize:12}} />
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                <div><label style={{fontSize:10,fontWeight:800,color:'#1d4ed8'}}>HEURE *</label><input type="time" value={newProgTime} onChange={e=>setNewProgTime(e.target.value)} style={{width:'100%',padding:10,marginTop:4,borderRadius:8,border:'1px solid #bfdbfe'}} /></div>
                <div><label style={{fontSize:10,fontWeight:800,color:'#1d4ed8'}}>TYPE</label>
                  <select value={newProgType} onChange={e=>setNewProgType(e.target.value)} style={{width:'100%',padding:10,marginTop:4,borderRadius:8,border:'1px solid #bfdbfe',fontWeight:700}}>
                    <option value="radio">📻 Radio</option>
                    <option value="tv">📺 TV</option>
                  </select>
                </div>
              </div>
              <label style={{fontSize:10,fontWeight:800,color:'#1d4ed8'}}>JOURS *</label>
              <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:6,marginBottom:12}}>
                {[['lun','Lun'],['mar','Mar'],['mer','Mer'],['jeu','Jeu'],['ven','Ven'],['sam','Sam'],['dim','Dim'],['tous','Tous les jours']].map(([val,label])=>(
                  <button key={val} type="button" onClick={()=>toggleProgDay(val)} style={{padding:'6px 10px',borderRadius:20,border: newProgDays.includes(val)? '2px solid #1d4ed8':'1px solid #bfdbfe',background: newProgDays.includes(val)? '#1d4ed8':'white',color: newProgDays.includes(val)? 'white':'#1d4ed8',fontWeight:800,fontSize:11,cursor:'pointer'}}>{label}</button>
                ))}
              </div>
              <button onClick={handleAddProg} style={{width:'100%',padding:12,background:'#1d4ed8',color:'white',fontWeight:900,borderRadius:10,border:0, cursor:'pointer', fontSize:13}}>{editingProgId? 'METTRE A JOUR' : 'AJOUTER AU PROGRAMME'}</button>
              {editingProgId && <button onClick={resetProgForm} style={{width:'100%',marginTop:8,padding:10,background:'transparent',color:'#1d4ed8',fontWeight:700,borderRadius:10,border:'1px solid #1d4ed8',cursor:'pointer'}}>Annuler la modification</button>}
            </div>
            {programmeGrid.map(p=>(
              <div key={p.id} style={{border:'1px solid #e5e7eb', padding:10, borderRadius:10, display:'flex', gap:10, alignItems:'center', marginBottom:6, flexWrap:'wrap', opacity:p.active?1:0.6}}>
                <span style={{background: p.type==='tv'?'#fee2e2':'#dcfce7', color: p.type==='tv'?'#dc2626':'#16a34a', fontSize:9, fontWeight:900, padding:'3px 8px', borderRadius:10}}>{p.type==='tv'?'📺 TV':'📻 RADIO'}</span>
                <div style={{flex:1, minWidth:140}}>
                  <div style={{fontSize:12,fontWeight:700}}>{p.time} - {p.title}</div>
                  <div style={{fontSize:10,color:'#64748b',marginTop:2}}>{(p.days||[]).join(', ')}</div>
                </div>
                <button onClick={()=>handleEditProg(p)} style={{background:'#dbeafe',color:'#1d4ed8',border:0,borderRadius:6,padding:'6px 10px',fontSize:11}}>Modifier</button>
                <button onClick={()=>handleToggleProg(p)} style={{background: p.active?'#dcfce7':'#fee2e2', border:0, borderRadius:6, padding:'6px 8px', fontSize:10}}>{p.active?'ON':'OFF'}</button>
                <button onClick={()=>handleDeleteProg(p.id)} style={{background:'#fee2e2',color:'#dc2626',border:0,borderRadius:6,padding:'6px 10px',fontSize:11}}>Suppr</button>
              </div>
            ))}
            {programmeGrid.length===0 && <div style={{textAlign:'center',padding:30,color:'#64748b',fontSize:12}}>Aucun programme pour l'instant. Ajoute ta premiere ligne ci-dessus.</div>}
          </div>
        ) : showEmissions? (
          <div style={{background:'white', padding:16, borderRadius:14, borderTop:'4px solid #0d9488'}}>
            <h3 style={{marginTop:0, color:'#0d9488'}}>Emissions passees (archive)</h3>
            <div style={{fontSize:11, color:'#64748b', marginBottom:12}}>Contenu consultable a tout moment, separe de la playlist en boucle Radio/TV.</div>
            <div style={{border:'2px dashed #5eead4', padding:12, borderRadius:12, background:'#f0fdfa', marginBottom:12}}>
              <label style={{fontSize:10,fontWeight:800,color:'#0d9488'}}>TITRE *</label>
              <input placeholder="Ex: Emission Societe du 12 aout" value={newEmTitle} onChange={e=>setNewEmTitle(e.target.value)} style={{width:'100%',padding:10,marginTop:4,marginBottom:10,borderRadius:8,border:'1px solid #99f6e4',fontSize:12}} />
              <label style={{fontSize:10,fontWeight:800,color:'#0d9488'}}>DESCRIPTION (optionnel)</label>
              <textarea placeholder="Resume de l'emission..." value={newEmDesc} onChange={e=>setNewEmDesc(e.target.value)} style={{width:'100%',minHeight:70,padding:10,marginTop:4,marginBottom:10,borderRadius:8,border:'1px solid #99f6e4',fontSize:12}} />
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                <div><label style={{fontSize:10,fontWeight:800,color:'#0d9488'}}>CATEGORIE</label>
                  <select value={newEmCategory} onChange={e=>setNewEmCategory(e.target.value)} style={{width:'100%',padding:10,marginTop:4,borderRadius:8,border:'1px solid #99f6e4',fontWeight:700}}>
                    <option value="radio">📻 Radio</option>
                    <option value="tv">📺 TV</option>
                  </select>
                </div>
                <div><label style={{fontSize:10,fontWeight:800,color:'#0d9488'}}>DATE DE DIFFUSION</label><input type="date" value={newEmDate} onChange={e=>setNewEmDate(e.target.value)} style={{width:'100%',padding:10,marginTop:4,borderRadius:8,border:'1px solid #99f6e4'}} /></div>
              </div>
              <label style={{fontSize:10,fontWeight:800,color:'#0d9488'}}>TYPE DE MEDIA</label>
              <div style={{display:'flex',gap:8,marginTop:6,marginBottom:10}}>
                <button type="button" onClick={()=>{setNewEmMediaType('audio'); setNewEmMediaUrl('')}} style={{flex:1,padding:'8px',borderRadius:8,border: newEmMediaType==='audio'?'2px solid #0d9488':'1px solid #99f6e4',background: newEmMediaType==='audio'?'#0d9488':'white',color: newEmMediaType==='audio'?'white':'#0d9488',fontWeight:800,fontSize:11,cursor:'pointer'}}>🎧 Audio</button>
                <button type="button" onClick={()=>{setNewEmMediaType('video'); setNewEmMediaUrl('')}} style={{flex:1,padding:'8px',borderRadius:8,border: newEmMediaType==='video'?'2px solid #0d9488':'1px solid #99f6e4',background: newEmMediaType==='video'?'#0d9488':'white',color: newEmMediaType==='video'?'white':'#0d9488',fontWeight:800,fontSize:11,cursor:'pointer'}}>🎬 Video (YouTube)</button>
              </div>
              {newEmMediaType==='audio' ? (
                <div>
                  <input type="file" accept="audio/*" onChange={e=>uploadEmissionAudio(e.target.files[0])} style={{width:'100%',fontSize:12,marginBottom:6}} />
                  {uploading==='emission-audio' && <div style={{fontSize:11,color:'#0d9488',marginBottom:6}}>Upload audio...</div>}
                  {newEmMediaUrl && <audio controls src={newEmMediaUrl} style={{width:'100%',marginBottom:10}} />}
                </div>
              ) : (
                <input placeholder="https://www.youtube.com/watch?v=..." value={newEmMediaUrl} onChange={e=>setNewEmMediaUrl(e.target.value)} style={{width:'100%',padding:10,marginBottom:10,borderRadius:8,border:'1px solid #99f6e4',fontSize:12}} />
              )}
              <label style={{fontSize:10,fontWeight:800,color:'#0d9488'}}>MINIATURE (optionnel)</label>
              <input type="file" accept="image/*" onChange={e=>uploadEmissionImage(e.target.files[0])} style={{width:'100%',fontSize:12,marginTop:4,marginBottom:8}} />
              {uploading==='emission-image' && <div style={{fontSize:11,color:'#0d9488',marginBottom:8}}>Upload image...</div>}
              {newEmImage && <img src={newEmImage} style={{width:'100%',maxHeight:160,objectFit:'cover',borderRadius:8,marginBottom:10}} alt="" />}
              <button onClick={handleAddEmission} style={{width:'100%',padding:12,background:'#0d9488',color:'white',fontWeight:900,borderRadius:10,border:0, cursor:'pointer', fontSize:13}}>{editingEmId? 'METTRE A JOUR' : 'AJOUTER A L\u2019ARCHIVE'}</button>
              {editingEmId && <button onClick={resetEmForm} style={{width:'100%',marginTop:8,padding:10,background:'transparent',color:'#0d9488',fontWeight:700,borderRadius:10,border:'1px solid #0d9488',cursor:'pointer'}}>Annuler la modification</button>}
            </div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:10}}>
              {emissions.map(e=>(
                <div key={e.id} style={{border:'1px solid #e5e7eb', borderRadius:10, overflow:'hidden', background: e.active? 'white':'#f1f5f9', opacity: e.active?1:0.6}}>
                  <div style={{position:'relative', aspectRatio:'16/9', background:'#f5f5f5'}}>
                    {e.image && <img src={e.image} style={{width:'100%',height:'100%',objectFit:'cover'}} alt="" />}
                    <span style={{position:'absolute',top:6,left:6,background: e.category==='tv'?'#fee2e2':'#dcfce7', color: e.category==='tv'?'#dc2626':'#16a34a', fontSize:9, fontWeight:900, padding:'3px 8px', borderRadius:10}}>{e.category==='tv'?'📺 TV':'📻 RADIO'}</span>
                  </div>
                  <div style={{padding:8}}>
                    <div style={{fontSize:11,fontWeight:800,lineHeight:1.2}}>{e.title?.substring(0,40)}</div>
                    <div style={{fontSize:10,color:'#64748b',marginTop:4}}>{e.date_diffusion? new Date(e.date_diffusion).toLocaleDateString('fr-FR'):''}</div>
                    <div style={{display:'flex',gap:6,marginTop:8}}>
                      <button onClick={()=>handleEditEmission(e)} style={{flex:1,background:'#dbeafe', color:'#1d4ed8', border:0, borderRadius:6, padding:'6px', fontSize:10, fontWeight:800}}>Modifier</button>
                      <button onClick={()=>handleToggleEmission(e)} style={{flex:1,background: e.active?'#dcfce7':'#fee2e2', border:0, borderRadius:6, padding:'6px', fontSize:10, fontWeight:800}}>{e.active?'ON':'OFF'}</button>
                      <button onClick={()=>handleDeleteEmission(e.id)} style={{flex:1,background:'#fee2e2',color:'#dc2626',border:0,borderRadius:6,padding:'6px',fontSize:10}}>Suppr</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {emissions.length===0 && <div style={{textAlign:'center',padding:30,color:'#64748b',fontSize:12}}>Aucune emission pour l'instant. Ajoute la premiere ci-dessus.</div>}
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
                <div style={{border:'2px solid #16a34a',borderRadius:10,padding:12,background:'#f0fdf4'}}>
                  <div style={{fontSize:11,fontWeight:900,color:'#16a34a',marginBottom:8}}>VENTE DU PDF (optionnel)</div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                    <div><label style={{fontSize:10,fontWeight:800}}>PRIX (FCFA)</label><input type="number" placeholder="Ex: 1000" value={newUnePrice} onChange={e=>setNewUnePrice(e.target.value)} style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #bbf7d0',marginTop:4}} /></div>
                    <div><label style={{fontSize:10,fontWeight:800}}>FICHIER PDF</label><input type="file" accept="application/pdf" onChange={e=>uploadUnePdf(e.target.files[0])} style={{width:'100%',fontSize:11,marginTop:6}} />{uploading==='une-pdf' && <div style={{fontSize:11,color:'#16a34a',marginTop:4}}>Upload...</div>}{newUnePdfPath && <div style={{fontSize:11,color:'#16a34a',marginTop:4}}>✓ PDF pret</div>}</div>
                  </div>
                  <div style={{fontSize:10,color:'#64748b',marginTop:8}}>Laisse vide si cette Une est juste une image gratuite (comme avant). Remplis les deux champs pour la vendre.</div>
                </div>
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
                    {u.price&&<div style={{fontSize:11,fontWeight:900,color:'#16a34a',marginTop:2}}>{u.price} FCFA {u.pdf_path?'(PDF pret)':'(PDF manquant !)'}</div>}
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
        ) : showEncadres? (
          <div style={{background:'white', padding:16, borderRadius:14, borderTop:'4px solid #a855f7'}}>
            <h3 style={{marginTop:0, color:'#7e22ce', display:'flex', alignItems:'center', gap:8}}>ESPACE BUSINESS - Encadres publicitaires <span style={{background:'#7e22ce',color:'white',padding:'2px 8px',borderRadius:10,fontSize:10}}>{encadres.length} encadres</span></h3>
            <div style={{fontSize:11, color:'#64748b', marginBottom:12}}>Chaque encadre peut contenir un titre, un texte, et autant d'images/sons/videos que tu veux, chacun positionnable (gauche, droite, haut, bas, centre).</div>
            <div style={{border:'3px solid #a855f7', padding:14, borderRadius:12, background:'#faf5ff', marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:900, marginBottom:10, color:'#7e22ce'}}>{editingEncadreId? 'MODIFIER L\'ENCADRE' : 'AJOUTER UN NOUVEL ENCADRE'}</div>
              <div style={{display:'grid', gap:10}}>
                <div><label style={{fontSize:10,fontWeight:800}}>NOM DE L'ANNONCEUR (optionnel)</label><input placeholder="Ex: Boutique Kekeli" value={newEncadreAdvertiser} onChange={e=>setNewEncadreAdvertiser(e.target.value)} style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #e9d5ff',marginTop:4}} /></div>
                <div><label style={{fontSize:10,fontWeight:800}}>TITRE</label><input placeholder="Ex: Grande promo de rentree" value={newEncadreTitle} onChange={e=>setNewEncadreTitle(e.target.value)} style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #e9d5ff',marginTop:4}} /></div>
                <div><label style={{fontSize:10,fontWeight:800}}>LIEN EXTERNE (optionnel)</label><input placeholder="https://..." value={newEncadreLink} onChange={e=>setNewEncadreLink(e.target.value)} style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #e9d5ff',marginTop:4}} /></div>

                <div style={{border:'2px solid #a855f7',borderRadius:10,padding:12,background:'white'}}>
                  <div style={{fontSize:11,fontWeight:900,color:'#7e22ce',marginBottom:8}}>MEDIAS ({encadreMedia.length})</div>
                  {encadreMedia.map((m)=>(
                    <div key={m.id} style={{border:'1px solid #e9d5ff', borderRadius:10, padding:10, marginBottom:8, background:'#faf5ff'}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
                        <span style={{fontSize:10, fontWeight:900, background:'#e9d5ff', color:'#7e22ce', padding:'2px 8px', borderRadius:20}}>{m.type.toUpperCase()}</span>
                        <button type="button" onClick={()=>removeEncadreMedia(m.id)} style={{border:0, background:'#ef4444', color:'white', borderRadius:6, cursor:'pointer', padding:'2px 8px', fontSize:11}}>X</button>
                      </div>
                      <label style={{fontSize:10,fontWeight:800}}>POSITION</label>
                      <select value={m.position} onChange={e=>updateEncadreMedia(m.id,'position',e.target.value)} style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #e9d5ff',marginTop:4,marginBottom:8,fontSize:12,fontWeight:700}}>
                        <option value="top">Haut</option>
                        <option value="bottom">Bas</option>
                        <option value="left">Gauche</option>
                        <option value="right">Droite</option>
                        <option value="center">Centre</option>
                      </select>
                      {m.type==='text' && (
                        <div>
                          <div style={{display:'flex', gap:6, marginBottom:6}}>
                            <button type="button" onClick={()=>wrapEncadreSelection(m.id,'**')} title="Gras" style={{width:32,height:28,border:'1px solid #ddd',borderRadius:6,background:'white',fontWeight:900,cursor:'pointer',fontSize:13}}>G</button>
                            <button type="button" onClick={()=>wrapEncadreSelection(m.id,'_')} title="Italique" style={{width:32,height:28,border:'1px solid #ddd',borderRadius:6,background:'white',fontStyle:'italic',cursor:'pointer',fontSize:13}}>I</button>
                            <button type="button" onClick={()=>wrapEncadreSelection(m.id,'~')} title="Texte plus petit" style={{width:32,height:28,border:'1px solid #ddd',borderRadius:6,background:'white',cursor:'pointer',fontSize:10,fontWeight:800}}>T-</button>
                            <span style={{fontSize:9,color:'#94a3b8',alignSelf:'center'}}>Selectionne du texte puis clique G/I/T-</span>
                          </div>
                          <textarea ref={el=>encadreTextareaRef.current[m.id]=el} placeholder="Ecris ton texte ici..." value={m.content||''} onChange={e=>updateEncadreMedia(m.id,'content',e.target.value)} style={{width:'100%', minHeight:80, padding:10, borderRadius:8, border:'1px solid #e9d5ff', fontSize:13}} />
                        </div>
                      )}
                      {m.type==='image' && (
                        <div>
                          <input type="file" accept="image/*" onChange={e=>uploadEncadreMedia(m.id, e.target.files[0])} style={{width:'100%',fontSize:11, marginBottom:6}} />
                          {uploading===`encadre-${m.id}` && <div style={{fontSize:11, color:'#7e22ce'}}>Upload...</div>}
                          <input placeholder="ou URL image" value={m.url} onChange={e=>updateEncadreMedia(m.id,'url',e.target.value)} style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #e9d5ff',fontSize:11, marginBottom:6}} />
                          {m.url && <img src={m.url} style={{width:'100%', maxHeight:160, objectFit:'cover', borderRadius:8}} alt="" />}
                        </div>
                      )}
                      {m.type==='audio' && (
                        <div>
                          <input type="file" accept="audio/*" onChange={e=>uploadEncadreMedia(m.id, e.target.files[0])} style={{width:'100%',fontSize:11, marginBottom:6}} />
                          {uploading===`encadre-${m.id}` && <div style={{fontSize:11, color:'#7e22ce'}}>Upload...</div>}
                          <input placeholder="ou URL audio MP3" value={m.url} onChange={e=>updateEncadreMedia(m.id,'url',e.target.value)} style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #e9d5ff',fontSize:11}} />
                          {m.url && <audio controls src={m.url} style={{width:'100%', marginTop:8}} />}
                        </div>
                      )}
                      {m.type==='video' && (
                        <div>
                          <input placeholder="URL YouTube ou MP4" value={m.url} onChange={e=>updateEncadreMedia(m.id,'url',e.target.value)} style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #e9d5ff',fontSize:11}} />
                        </div>
                      )}
                      {m.type!=='text' && <input placeholder="Legende (optionnel)" value={m.caption||''} onChange={e=>updateEncadreMedia(m.id,'caption',e.target.value)} style={{width:'100%',padding:6,borderRadius:6,border:'1px solid #e9d5ff',fontSize:11, marginTop:6}} />}
                    </div>
                  ))}
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:6, marginTop:6}}>
                    <button type="button" onClick={()=>addEncadreMedia('text')} style={{background:'#0f2040', color:'white', border:0, padding:'10px', borderRadius:10, fontWeight:800, fontSize:11, cursor:'pointer'}}>+ TEXTE</button>
                    <button type="button" onClick={()=>addEncadreMedia('image')} style={{background:'#16a34a', color:'white', border:0, padding:'10px', borderRadius:10, fontWeight:800, fontSize:11, cursor:'pointer'}}>+ IMAGE</button>
                    <button type="button" onClick={()=>addEncadreMedia('audio')} style={{background:'#d97706', color:'white', border:0, padding:'10px', borderRadius:10, fontWeight:800, fontSize:11, cursor:'pointer'}}>+ AUDIO</button>
                    <button type="button" onClick={()=>addEncadreMedia('video')} style={{background:'#dc2626', color:'white', border:0, padding:'10px', borderRadius:10, fontWeight:800, fontSize:11, cursor:'pointer'}}>+ VIDEO</button>
                  </div>
                </div>

                <button onClick={handleAddEncadre} style={{width:'100%',padding:12,background:'#7e22ce',color:'white',fontWeight:900,borderRadius:10,border:0, cursor:'pointer', fontSize:13}}>{editingEncadreId? 'METTRE A JOUR L\'ENCADRE' : 'AJOUTER L\'ENCADRE'}</button>
                {editingEncadreId && <button onClick={handleCancelEncadreEdit} style={{width:'100%',padding:10,background:'transparent',color:'#7e22ce',fontWeight:700,borderRadius:10,border:'1px solid #7e22ce', cursor:'pointer'}}>Annuler la modification</button>}
              </div>
            </div>

            {encadres.map(enc=>(
              <div key={enc.id} style={{border:'1px solid #e9d5ff', padding:10, borderRadius:12, marginBottom:8, background: enc.active? 'white':'#f8fafc', opacity: enc.active?1:0.6}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:10}}>
                  <div style={{flex:1, minWidth:0}}>
                    {enc.advertiser && <div style={{fontSize:10, fontWeight:900, color:'#7e22ce', textTransform:'uppercase'}}>{enc.advertiser}</div>}
                    <div style={{fontWeight:800, fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{enc.title || '(sans titre)'}</div>
                    <div style={{fontSize:10, color:'#64748b', marginTop:2}}>{(enc.media||[]).length} media(s)</div>
                  </div>
                  <button onClick={()=>handleEditEncadre(enc)} style={{background:'#ede9fe',color:'#7e22ce',border:0,borderRadius:8,padding:'8px 12px',fontSize:12,cursor:'pointer'}}>Modifier</button>
                  <button onClick={()=>handleToggleEncadre(enc)} style={{background: enc.active?'#dcfce7':'#fee2e2', border:0, borderRadius:6, padding:'8px', fontSize:10, fontWeight:800}}>{enc.active?'ON':'OFF'}</button>
                  <button onClick={()=>handleDeleteEncadre(enc.id)} style={{background:'#fee2e2',color:'#dc2626',border:0,borderRadius:8,padding:'8px 12px',fontSize:12,cursor:'pointer'}}>Suppr</button>
                </div>
              </div>
            ))}
            {encadres.length===0 && <div style={{textAlign:'center',padding:30,color:'#64748b',fontSize:12}}>Aucun encadre pour l'instant. Ajoute ton premier encadre ci-dessus. Pense a creer la table <code>encadres</code> et le bucket <code>encadres</code> dans Supabase si ce n'est pas fait.</div>}
          </div>
        ) : showArticles? (
          <div style={{background:'white', padding:14, borderRadius:14, borderTop:'4px solid #2e4fb0'}}>
            <input placeholder="Rechercher..." value={search} onChange={e=>setSearch(e.target.value)} style={{width:'100%', padding:'11px 12px', borderRadius:10, border:'1px solid #c7d2fe', marginBottom:12}} />
            {filtered.map(a=>{
              const statusInfo = a.status==='published'? {label:'Publie', bg:'#dcfce7', color:'#16a34a'} : a.status==='pending_review'? {label:'En attente', bg:'#fef3c7', color:'#b45309'} : {label:'Brouillon', bg:'#e2e8f0', color:'#475569'}
              return (
              <div key={a.id} style={{border:'1px solid #e0e7ff', padding:10, borderRadius:12, display:'flex', gap:10, alignItems:'center', marginBottom:6}}>
                <img src={a.image} style={{width:54,height:54,objectFit:'cover',borderRadius:8}} alt="" />
                <div style={{flex:1, minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:2}}>
                    <span style={{background:statusInfo.bg,color:statusInfo.color,fontSize:9,fontWeight:900,padding:'2px 7px',borderRadius:10}}>{statusInfo.label}</span>
                  </div>
                  <div style={{fontWeight:800,fontSize:13,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.title}</div>
                  <div style={{fontSize:11,color:'#64748b'}}>{a.category}</div>
                </div>
                <button onClick={()=>handleEdit(a)} style={{background:'#2e4fb0',color:'white',border:0,borderRadius:8,padding:'8px 12px',fontSize:12,cursor:'pointer'}}>Edit</button>
                {isDirector && <button onClick={()=>handleDelete(a.id)} style={{background:'#fee2e2',color:'#dc2626',border:0,borderRadius:8,padding:'8px 12px',fontSize:12,cursor:'pointer'}}>Suppr</button>}
              </div>
            )})}
          </div>
        ) : canAccess('articles') ? (
          <div style={{background:'white', padding:16, borderRadius:14, borderTop:'4px solid #2e4fb0'}}>
            <div style={{display:'flex', gap:6, marginBottom:12, flexWrap:'wrap', alignItems:'center'}}>
              <span style={{fontSize:11, fontWeight:900}}>Langue :</span>
              {LANGS.map(l=><button key={l} onClick={()=>setEditLang(l)} style={{padding:'6px 10px', borderRadius:20, border:'1px solid #c7d2fe', background: editLang===l?'#2e4fb0':'white', color:editLang===l?'white':'#2e4fb0', fontWeight:800, fontSize:11, cursor:'pointer'}}>{LABELS[l]}</button>)}
              <button onClick={handleAutoTranslate} disabled={translating} style={{marginLeft:8, background: translating?'#94a3b8':'#ffcc00', color:'#0f2040', border:0, borderRadius:20, padding:'6px 14px', fontWeight:900, fontSize:11, cursor:'pointer'}}>{translating?'Traduction...':'Traduire auto'}</button>
            </div>
            <div style={{display:'grid', gap:12}}>
              <div><label style={{fontSize:11,fontWeight:800,color:'#2e4fb0'}}>TITRE * [{editLang.toUpperCase()}]</label><input placeholder="Titre..." value={editLang==='fr'? form.title : (form.translations[editLang]?.title||'')} onChange={e=>{ if(editLang==='fr') setForm({...form,title:e.target.value}); else setForm({...form, translations:{...form.translations, [editLang]:{...form.translations[editLang], title:e.target.value}}}) }} style={{width:'100%',padding:'12px',marginTop:4,borderRadius:10,border:'1px solid #c7d2fe',fontWeight:700,fontSize:14}} /></div>
              {editLang==='fr' && <div><label style={{fontSize:11,fontWeight:800,color:'#2e4fb0'}}>AUTEUR (optionnel, sinon "Rius Multimedia" par defaut)</label><input placeholder="Ex: Marius Attor" value={form.author||''} onChange={e=>setForm({...form, author:e.target.value})} style={{width:'100%',padding:'10px',marginTop:4,borderRadius:10,border:'1px solid #c7d2fe',fontSize:13}} /></div>}
              {!isDirector && form.id && form.status==='published' && (
                <div style={{background:'#fee2e2',border:'2px solid #ef4444',borderRadius:10,padding:12,fontSize:12,color:'#991b1b',fontWeight:700}}>
                  Cet article est deja publie. Seul le directeur peut le modifier ou le depublier.
                </div>
              )}

              <div><label style={{fontSize:11,fontWeight:800,color:'#2e4fb0'}}>CATEGORIE</label><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={{width:'100%',padding:'12px',marginTop:4,borderRadius:10,border:'1px solid #c7d2fe'}}><option>ACCUEIL</option><option>POLITIQUE</option><option>CULTURE</option><option>SOCIETE</option><option>SANTE</option><option>SPORT</option><option>ENVIRONNEMENT</option><option>INTERNATIONAL</option><option>ESPACE BUSINESS</option></select></div>

              <div style={{border:'2px solid #f59e0b', padding:12, borderRadius:12, background:'#fffbeb'}}>
                <label style={{fontSize:11,fontWeight:800,color:'#b45309'}}>STATUT EDITORIAL</label>
                <select value={form.status||'draft'} onChange={e=>setForm({...form,status:e.target.value})} style={{width:'100%',padding:'12px',marginTop:4,borderRadius:10,border:'1px solid #fcd34d',fontWeight:700}}>
                  <option value="draft">Brouillon (visible par l'equipe uniquement)</option>
                  <option value="pending_review">En attente de publication</option>
                  {isDirector && <option value="published">Publie (visible sur le site)</option>}
                </select>
                {!isDirector && <div style={{fontSize:10,color:'#b45309',marginTop:6}}>Seul le directeur peut publier un article sur le site. Choisis "En attente de publication" quand c'est pret pour lui.</div>}
              </div>
              
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
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8, flexWrap:'wrap', gap:8}}>
                      <span style={{fontSize:10, fontWeight:900, background: block.type==='text'?'#dbeafe': block.type==='image'?'#dcfce7': block.type==='audio'?'#fef3c7':'#fee2e2', color:'#0f2040', padding:'2px 8px', borderRadius:20}}>
                        {block.type.toUpperCase()} #{idx+1}
                      </span>
                      <select value={block.position||'center'} onChange={e=>updateBlock(block.id,'position',e.target.value)} style={{padding:'4px 8px',borderRadius:6,border:'1px solid #ddd',fontSize:10,fontWeight:700}}>
                        <option value="top">Haut</option>
                        <option value="bottom">Bas</option>
                        <option value="left">Gauche</option>
                        <option value="right">Droite</option>
                        <option value="center">Centre</option>
                      </select>
                      <div style={{display:'flex', gap:4}}>
                        <button type="button" onClick={()=>moveBlock(block.id,'up')} style={{border:'1px solid #ddd', background:'white', borderRadius:6, cursor:'pointer', fontSize:12, padding:'2px 6px'}}>UP</button>
                        <button type="button" onClick={()=>moveBlock(block.id,'down')} style={{border:'1px solid #ddd', background:'white', borderRadius:6, cursor:'pointer', fontSize:12, padding:'2px 6px'}}>DOWN</button>
                        <button type="button" onClick={()=>removeBlock(block.id)} style={{border:0, background:'#ef4444', color:'white', borderRadius:6, cursor:'pointer', padding:'2px 8px', fontSize:11}}>X</button>
                      </div>
                    </div>

                    {block.type==='text' && (
                      <div>
                        <div style={{display:'flex', gap:6, marginBottom:6}}>
                          <button type="button" onClick={()=>wrapSelection(block.id,'**')} title="Gras" style={{width:32,height:28,border:'1px solid #ddd',borderRadius:6,background:'white',fontWeight:900,cursor:'pointer',fontSize:13}}>G</button>
                          <button type="button" onClick={()=>wrapSelection(block.id,'_')} title="Italique" style={{width:32,height:28,border:'1px solid #ddd',borderRadius:6,background:'white',fontStyle:'italic',cursor:'pointer',fontSize:13}}>I</button>
                          <button type="button" onClick={()=>wrapSelection(block.id,'~')} title="Texte plus petit" style={{width:32,height:28,border:'1px solid #ddd',borderRadius:6,background:'white',cursor:'pointer',fontSize:10,fontWeight:800}}>T-</button>
                          <span style={{fontSize:10,color:'#94a3b8',alignSelf:'center'}}>Selectionne du texte puis clique G (gras), I (italique) ou T- (plus petit)</span>
                        </div>
                        <textarea ref={el=>blockTextareaRef.current[block.id]=el} placeholder="Ecris ton texte ici..." value={block.content} onChange={e=>updateBlock(block.id,'content',e.target.value)} style={{width:'100%', minHeight:90, padding:10, borderRadius:8, border:'1px solid #c7d2fe', fontSize:13}} />
                      </div>
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
                {form.id && <button onClick={()=>{setForm({ id:null, title:'', category:'ACCUEIL', image:'', translations:{}, gallery:[], status:'draft', author:'' }); setBlocks([{id:uid(), type:'text', content:''}]); setGallery([]);}} style={{flex:1,padding:'14px',background:'#e0e7ff',borderRadius:12,border:0,fontWeight:800,cursor:'pointer', color:'#2e4fb0'}}>Annuler</button>}
                <button onClick={handlePublish} disabled={!isDirector && form.id && form.status==='published'} style={{flex:2,padding:'14px',background: (!isDirector && form.id && form.status==='published')? '#94a3b8' : form.status==='published'? '#16a34a' : form.id? '#f59e0b' : '#2e4fb0',color:'white',fontWeight:900,borderRadius:12,border:0,cursor:(!isDirector && form.id && form.status==='published')?'not-allowed':'pointer',fontSize:14}}>{form.status==='published'? (form.id?'METTRE A JOUR (PUBLIE)':'PUBLIER') : form.status==='pending_review'? 'SOUMETTRE POUR VALIDATION' : (form.id?'ENREGISTRER LE BROUILLON':'ENREGISTRER EN BROUILLON')}</button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{background:'white', padding:30, borderRadius:14, textAlign:'center', color:'#64748b'}}>
            Ton compte n'a pas acces a cette section. Utilise l'un des onglets disponibles ci-dessus.
          </div>
        )}
      </div>
    </div>
  );
}
