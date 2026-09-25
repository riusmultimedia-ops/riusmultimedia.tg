import React, { useState, useEffect } from 'react'

export function AdBanner({pubs, format='leaderboard'}){
  const [idx,setIdx]=useState(0)
  useEffect(()=>{ if(!pubs||pubs.length<=1) return; const id=setInterval(()=>setIdx(p=>(p+1)%pubs.length),6000); return()=>clearInterval(id) },[pubs&&pubs.length])
  if(!pubs||!pubs.length) return null
  const current=pubs[idx]
  // Le rapport largeur/hauteur (aspectRatio) remplace une hauteur fixe en pixels : sur un ecran
  // etroit, la largeur ET la hauteur retrecissent dans les memes proportions, donc l'image garde
  // sa bonne forme au lieu d'etre zoomee/rognee sur les cotes (ce qui donnait l'effet "coupe").
  const dims = format==='leaderboard'? {maxWidth:728,aspectRatio:'728/90'} : format==='mpu'? {maxWidth:300,aspectRatio:'300/250'} : format==='half-page'? {maxWidth:300,aspectRatio:'300/600'} : {maxWidth:'100%',aspectRatio:'4/1'}
  return (
    <div style={{textAlign:'center',margin:'0 auto'}}>
      <div style={{fontSize:9,color:'rgba(255,255,255,0.4)',fontWeight:800,letterSpacing:'0.06em',marginBottom:5,textTransform:'uppercase'}}>Publicité</div>
      <a href={current.link||'#'} target="_blank" rel="noreferrer" style={{...dims,width:'100%',background:'white',borderRadius:6,overflow:'hidden',display:'block',margin:'0 auto'}}>
        <img src={current.image} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} alt="Publicité" loading="lazy" />
      </a>
    </div>
  )
}
