import React, { useState, useEffect, useRef, useCallback } from 'react'
import { AdBanner } from './AdBanner'

// ==================================================================
// Couleurs du site, reprises pour une coherence visuelle
// ==================================================================
const C = {
  bg: '#2e4fb0',
  panel: '#24417f',
  gold: '#ffcc00',
  green: '#a8ff00',
  red: '#ff5b5b',
  white: '#ffffff',
}

// ==================================================================
// Ecran de fin de jeu commun (victoire / defaite / score)
// ==================================================================
function GameResultBanner({ text, sub, color=C.gold, onReplay }){
  return (
    <div style={{textAlign:'center', padding:'18px 10px', background:'rgba(0,0,0,0.2)', borderRadius:12, marginTop:14}}>
      <div style={{fontSize:20, fontWeight:900, color}}>{text}</div>
      {sub && <div style={{fontSize:13, color:'rgba(255,255,255,0.8)', marginTop:6}}>{sub}</div>}
      <button onClick={onReplay} style={{marginTop:12, background:C.gold, color:'#0f2040', border:0, borderRadius:20, padding:'10px 24px', fontWeight:900, fontSize:13, cursor:'pointer'}}>🔄 Rejouer</button>
    </div>
  )
}

// ==================================================================
// 1) MEMORY — jeu de paires
// ==================================================================
const MEMORY_EMOJIS = ['🐘','🦁','🐒','🦒','🐊','🦓','🐆','🦜','🌍','⚽','🎵','📻','📺','☀️','🌴','🥁']
function shuffleArr(arr){ const a=[...arr]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]] } return a }

function MemoryGame(){
  const [level, setLevel] = useState(null) // 8 ou 16 paires
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)
  const [locked, setLocked] = useState(false)

  const start = (nPairs) => {
    const chosen = MEMORY_EMOJIS.slice(0, nPairs)
    setCards(shuffleArr([...chosen, ...chosen]).map((emoji,i)=>({ id:i, emoji })))
    setFlipped([]); setMatched([]); setMoves(0); setLocked(false); setLevel(nPairs)
  }

  const onFlip = (idx) => {
    if(locked || flipped.includes(idx) || matched.includes(idx)) return
    const next = [...flipped, idx]
    setFlipped(next)
    if(next.length===2){
      setLocked(true); setMoves(m=>m+1)
      const [a,b] = next
      if(cards[a].emoji === cards[b].emoji){
        setTimeout(()=>{ setMatched(m=>[...m,a,b]); setFlipped([]); setLocked(false) }, 500)
      } else {
        setTimeout(()=>{ setFlipped([]); setLocked(false) }, 900)
      }
    }
  }

  const won = level && matched.length === cards.length

  if(!level){
    return (
      <div style={{textAlign:'center', padding:20}}>
        <div style={{fontSize:14, color:'white', marginBottom:16}}>Choisis la difficulte :</div>
        <div style={{display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap'}}>
          <button onClick={()=>start(6)} style={btnStyle()}>Facile (6 paires)</button>
          <button onClick={()=>start(10)} style={btnStyle()}>Moyen (10 paires)</button>
          <button onClick={()=>start(16)} style={btnStyle()}>Difficile (16 paires)</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{padding:'10px 4px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12, padding:'0 6px'}}>
        <div style={{color:'white', fontWeight:800, fontSize:13}}>Coups : {moves}</div>
        <button onClick={()=>setLevel(null)} style={{background:'transparent', border:'1px solid rgba(255,255,255,0.4)', color:'white', borderRadius:8, padding:'6px 12px', fontSize:11, cursor:'pointer'}}>Changer</button>
      </div>
      <div style={{display:'grid', gridTemplateColumns:`repeat(${cards.length<=12?4:5}, 1fr)`, gap:8, maxWidth:420, margin:'0 auto'}}>
        {cards.map((c,idx)=>{
          const isUp = flipped.includes(idx) || matched.includes(idx)
          return (
            <div key={c.id} onClick={()=>onFlip(idx)} style={{
              aspectRatio:'1', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center',
              fontSize: cards.length<=12?28:22, cursor:'pointer', userSelect:'none',
              background: isUp? 'white' : 'linear-gradient(135deg,#ffcc00,#ff9d00)',
              transition:'transform 0.15s', border: matched.includes(idx)? `2px solid ${C.green}` : '2px solid transparent'
            }}>{isUp? c.emoji : '❓'}</div>
          )
        })}
      </div>
      {won && <GameResultBanner text="🎉 Bravo, toutes les paires trouvees !" sub={`En ${moves} coups`} color={C.green} onReplay={()=>start(level)} />}
    </div>
  )
}

// ==================================================================
// 2) MORPION — tic-tac-toe vs ordinateur
// ==================================================================
const TTT_LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
function tttWinner(b){
  for(const [a,c,d] of TTT_LINES){ if(b[a] && b[a]===b[c] && b[a]===b[d]) return b[a] }
  return b.every(x=>x) ? 'draw' : null
}
function tttBestMove(b, ai, human){
  // 1) gagner si possible
  for(let i=0;i<9;i++){ if(!b[i]){ const t=[...b]; t[i]=ai; if(tttWinner(t)===ai) return i } }
  // 2) bloquer l'adversaire
  for(let i=0;i<9;i++){ if(!b[i]){ const t=[...b]; t[i]=human; if(tttWinner(t)===human) return i } }
  // 3) centre, puis coin, puis le reste
  if(!b[4]) return 4
  const corners=[0,2,6,8].filter(i=>!b[i])
  if(corners.length) return corners[Math.floor(Math.random()*corners.length)]
  const rest=[0,1,2,3,4,5,6,7,8].filter(i=>!b[i])
  return rest[Math.floor(Math.random()*rest.length)]
}
function TicTacToe(){
  const [board, setBoard] = useState(Array(9).fill(null))
  const [turn, setTurn] = useState('player')
  const [score, setScore] = useState({player:0, ai:0, draw:0})
  const winner = tttWinner(board)

  useEffect(()=>{
    if(winner || turn!=='ai') return
    const t = setTimeout(()=>{
      const move = tttBestMove(board, 'O', 'X')
      setBoard(b=>{ const nb=[...b]; nb[move]='O'; return nb })
      setTurn('player')
    }, 500)
    return ()=>clearTimeout(t)
  },[turn, board, winner])

  useEffect(()=>{
    if(!winner) return
    setScore(s=> winner==='draw'? {...s, draw:s.draw+1} : winner==='X'? {...s, player:s.player+1} : {...s, ai:s.ai+1})
  },[winner])

  const play = (i) => {
    if(board[i] || winner || turn!=='player') return
    const nb=[...board]; nb[i]='X'; setBoard(nb); setTurn('ai')
  }
  const reset = () => { setBoard(Array(9).fill(null)); setTurn('player') }

  return (
    <div style={{textAlign:'center', padding:10}}>
      <div style={{display:'flex', justifyContent:'center', gap:20, marginBottom:14, fontSize:12, color:'white', fontWeight:800}}>
        <div>😀 Toi : {score.player}</div>
        <div>🤝 Nul : {score.draw}</div>
        <div>🤖 Ordi : {score.ai}</div>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6, width:240, margin:'0 auto'}}>
        {board.map((v,i)=>(
          <div key={i} onClick={()=>play(i)} style={{
            aspectRatio:'1', background:'white', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:36, fontWeight:900, cursor: v||winner? 'default':'pointer',
            color: v==='X'? C.bg : C.red
          }}>{v}</div>
        ))}
      </div>
      {!winner && <div style={{marginTop:14, color:'rgba(255,255,255,0.75)', fontSize:12}}>{turn==='player'? "A toi de jouer (X)" : "L'ordinateur reflechit..."}</div>}
      {winner && <GameResultBanner
        text={winner==='draw'? '🤝 Match nul !' : winner==='X'? '🎉 Tu as gagne !' : '🤖 L\'ordinateur gagne'}
        color={winner==='X'? C.green : winner==='draw'? C.gold : C.red}
        onReplay={reset} />}
    </div>
  )
}

// ==================================================================
// 3) PUISSANCE 4 vs ordinateur
// ==================================================================
const C4_ROWS=6, C4_COLS=7
function c4EmptyBoard(){ return Array.from({length:C4_ROWS},()=>Array(C4_COLS).fill(null)) }
function c4DropRow(board, col){ for(let r=C4_ROWS-1;r>=0;r--){ if(!board[r][col]) return r } return -1 }
function c4CheckWinner(board){
  const dirs=[[0,1],[1,0],[1,1],[1,-1]]
  for(let r=0;r<C4_ROWS;r++) for(let c=0;c<C4_COLS;c++){
    const p = board[r][c]; if(!p) continue
    for(const [dr,dc] of dirs){
      let ok=true
      for(let k=1;k<4;k++){ const rr=r+dr*k, cc=c+dc*k; if(rr<0||rr>=C4_ROWS||cc<0||cc>=C4_COLS||board[rr][cc]!==p){ ok=false; break } }
      if(ok) return p
    }
  }
  if(board.every(row=>row.every(x=>x))) return 'draw'
  return null
}
function c4BestCol(board, ai, human){
  const validCols = Array.from({length:C4_COLS},(_,c)=>c).filter(c=>c4DropRow(board,c)>=0)
  for(const c of validCols){ const r=c4DropRow(board,c); const t=board.map(row=>[...row]); t[r][c]=ai; if(c4CheckWinner(t)===ai) return c }
  for(const c of validCols){ const r=c4DropRow(board,c); const t=board.map(row=>[...row]); t[r][c]=human; if(c4CheckWinner(t)===human) return c }
  const center = validCols.includes(3)? 3 : validCols[Math.floor(Math.random()*validCols.length)]
  return center
}
function Connect4(){
  const [board, setBoard] = useState(c4EmptyBoard())
  const [turn, setTurn] = useState('player')
  const [score, setScore] = useState({player:0, ai:0, draw:0})
  const winner = c4CheckWinner(board)

  useEffect(()=>{
    if(winner || turn!=='ai') return
    const t = setTimeout(()=>{
      const col = c4BestCol(board, 'jaune', 'rouge')
      const row = c4DropRow(board, col)
      if(row>=0){ setBoard(b=>{ const nb=b.map(r=>[...r]); nb[row][col]='jaune'; return nb }) }
      setTurn('player')
    }, 600)
    return ()=>clearTimeout(t)
  },[turn, board, winner])

  useEffect(()=>{
    if(!winner) return
    setScore(s=> winner==='draw'? {...s, draw:s.draw+1} : winner==='rouge'? {...s, player:s.player+1} : {...s, ai:s.ai+1})
  },[winner])

  const play = (col) => {
    if(winner || turn!=='player') return
    const row = c4DropRow(board, col); if(row<0) return
    const nb = board.map(r=>[...r]); nb[row][col]='rouge'; setBoard(nb); setTurn('ai')
  }
  const reset = () => { setBoard(c4EmptyBoard()); setTurn('player') }

  return (
    <div style={{textAlign:'center', padding:10}}>
      <div style={{display:'flex', justifyContent:'center', gap:20, marginBottom:14, fontSize:12, color:'white', fontWeight:800}}>
        <div>🔴 Toi : {score.player}</div>
        <div>🤝 Nul : {score.draw}</div>
        <div>🟡 Ordi : {score.ai}</div>
      </div>
      <div style={{display:'inline-block', background:'#1a3366', padding:8, borderRadius:10}}>
        {board.map((row,r)=>(
          <div key={r} style={{display:'flex'}}>
            {row.map((cell,c)=>(
              <div key={c} onClick={()=>play(c)} style={{
                width:32, height:32, margin:2, borderRadius:'50%', cursor: winner?'default':'pointer',
                background: cell==='rouge'? C.red : cell==='jaune'? C.gold : 'rgba(255,255,255,0.15)'
              }}></div>
            ))}
          </div>
        ))}
      </div>
      {!winner && <div style={{marginTop:14, color:'rgba(255,255,255,0.75)', fontSize:12}}>{turn==='player'? "A toi (rouge), clique une colonne" : "L'ordinateur reflechit..."}</div>}
      {winner && <GameResultBanner
        text={winner==='draw'? '🤝 Match nul !' : winner==='rouge'? '🎉 Tu as gagne !' : '🤖 L\'ordinateur gagne'}
        color={winner==='rouge'? C.green : winner==='draw'? C.gold : C.red}
        onReplay={reset} />}
    </div>
  )
}

// ==================================================================
// 4) QUIZ CULTURE GENERALE
// ==================================================================
const QUIZ_QUESTIONS = [
  { q:"Quelle est la capitale du Togo ?", opts:["Lomé","Kara","Sokodé","Atakpamé"], a:0 },
  { q:"Quel fleuve traverse plusieurs pays d'Afrique de l'Ouest, dont le Togo voisin ?", opts:["Le Nil","Le Congo","Le Niger","Le Zambèze"], a:2 },
  { q:"En quelle année le Togo a-t-il obtenu son indépendance ?", opts:["1958","1960","1962","1965"], a:1 },
  { q:"Quelle est la monnaie utilisée au Togo ?", opts:["Le Cedi","Le Franc CFA","Le Naira","Le Dalasi"], a:1 },
  { q:"Quel est le plus grand océan du monde ?", opts:["Atlantique","Indien","Pacifique","Arctique"], a:2 },
  { q:"Combien de continents y a-t-il sur Terre ?", opts:["5","6","7","8"], a:2 },
  { q:"Quelle planete est surnommee la 'planete rouge' ?", opts:["Venus","Mars","Jupiter","Saturne"], a:1 },
  { q:"Quel est l'animal le plus grand du monde ?", opts:["L'elephant d'Afrique","La girafe","La baleine bleue","Le requin blanc"], a:2 },
  { q:"Combien de joueurs y a-t-il dans une equipe de football sur le terrain ?", opts:["9","10","11","12"], a:2 },
  { q:"Quelle est la langue officielle du Togo ?", opts:["L'anglais","Le francais","Le portugais","L'espagnol"], a:1 },
  { q:"Quel organe du corps humain pompe le sang ?", opts:["Le foie","Le cœur","Le poumon","Le rein"], a:1 },
  { q:"Combien font 7 x 8 ?", opts:["54","56","58","64"], a:1 },
  { q:"Quel est le plus long fleuve d'Afrique ?", opts:["Le Congo","Le Niger","Le Nil","Le Zambèze"], a:2 },
  { q:"Quelle est la couleur obtenue en melangeant le bleu et le jaune ?", opts:["Violet","Orange","Vert","Marron"], a:2 },
  { q:"En quelle saison recolte-t-on generalement le cacao au Togo/en Afrique de l'Ouest ?", opts:["Saison seche","Saison des pluies","Les deux selon la periode","Jamais recolte"], a:2 },
]
function QuizGame(){
  const [order] = useState(()=>shuffleArr(QUIZ_QUESTIONS.map((_,i)=>i)))
  const [idx, setIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [picked, setPicked] = useState(null)
  const [finished, setFinished] = useState(false)

  const qi = order[idx]
  const q = QUIZ_QUESTIONS[qi]

  const pick = (i) => {
    if(picked!==null) return
    setPicked(i)
    if(i===q.a) setScore(s=>s+1)
    setTimeout(()=>{
      if(idx+1 >= order.length){ setFinished(true) }
      else { setIdx(idx+1); setPicked(null) }
    }, 900)
  }
  const reset = () => { setIdx(0); setScore(0); setPicked(null); setFinished(false); window.location.reload() }

  if(finished){
    const pct = Math.round(score/order.length*100)
    return <div style={{padding:20}}>
      <GameResultBanner
        text={pct>=70? '🏆 Excellent !' : pct>=40? '👍 Pas mal !' : '💪 Continue a t\'entrainer !'}
        sub={`Score final : ${score} / ${order.length} (${pct}%)`}
        color={pct>=70? C.green : C.gold}
        onReplay={reset} />
    </div>
  }

  return (
    <div style={{padding:'10px 6px', maxWidth:480, margin:'0 auto'}}>
      <div style={{display:'flex', justifyContent:'space-between', fontSize:12, color:'rgba(255,255,255,0.75)', marginBottom:10}}>
        <span>Question {idx+1} / {order.length}</span>
        <span>Score : {score}</span>
      </div>
      <div style={{background:'rgba(255,255,255,0.08)', borderRadius:12, padding:18}}>
        <div style={{color:'white', fontSize:16, fontWeight:800, marginBottom:16}}>{q.q}</div>
        <div style={{display:'flex', flexDirection:'column', gap:8}}>
          {q.opts.map((opt,i)=>{
            let bg = 'white', color='#0f2040'
            if(picked!==null){
              if(i===q.a){ bg=C.green; color='white' }
              else if(i===picked){ bg=C.red; color='white' }
              else { bg='rgba(255,255,255,0.3)' }
            }
            return <button key={i} onClick={()=>pick(i)} style={{ background:bg, color, border:0, borderRadius:10, padding:'12px 14px', fontSize:13, fontWeight:700, textAlign:'left', cursor: picked===null?'pointer':'default' }}>{opt}</button>
          })}
        </div>
      </div>
    </div>
  )
}

// ==================================================================
// 5) PENDU (Hangman)
// ==================================================================
const HANGMAN_WORDS = [
  'TOGO','LOME','RADIO','TELEVISION','MULTIMEDIA','JOURNAL','MUSIQUE','FOOTBALL',
  'SOLEIL','FAMILLE','ECOLE','MARCHE','VOYAGE','CULTURE','SAGESSE','LIBERTE',
  'AFRIQUE','OCEAN','MONTAGNE','ELEPHANT'
]
const HANGMAN_MAX_ERRORS = 7
function HangmanGame(){
  const [word, setWord] = useState(()=>HANGMAN_WORDS[Math.floor(Math.random()*HANGMAN_WORDS.length)])
  const [guessed, setGuessed] = useState([])
  const errors = guessed.filter(l=>!word.includes(l)).length
  const lost = errors >= HANGMAN_MAX_ERRORS
  const won = word.split('').every(l=>guessed.includes(l))
  const over = lost || won

  const guess = (l) => { if(over || guessed.includes(l)) return; setGuessed(g=>[...g,l]) }
  const reset = () => { setWord(HANGMAN_WORDS[Math.floor(Math.random()*HANGMAN_WORDS.length)]); setGuessed([]) }

  const ALPHABET = 'AZERTYUIOPQSDFGHJKLMWXCVBN'.split('')
  const stages = ['🙂','😐','😟','😧','😰','😵','💀','⚰️']

  return (
    <div style={{textAlign:'center', padding:10}}>
      <div style={{fontSize:60, marginBottom:8}}>{stages[Math.min(errors, stages.length-1)]}</div>
      <div style={{fontSize:12, color:'rgba(255,255,255,0.7)', marginBottom:14}}>Erreurs : {errors} / {HANGMAN_MAX_ERRORS}</div>
      <div style={{display:'flex', justifyContent:'center', gap:8, flexWrap:'wrap', marginBottom:20}}>
        {word.split('').map((l,i)=>(
          <div key={i} style={{width:28, borderBottom:'3px solid white', fontSize:22, fontWeight:900, color:'white'}}>
            {guessed.includes(l) || lost ? l : ''}
          </div>
        ))}
      </div>
      <div style={{display:'flex', flexWrap:'wrap', justifyContent:'center', gap:6, maxWidth:400, margin:'0 auto'}}>
        {ALPHABET.map(l=>{
          const used = guessed.includes(l)
          const correct = used && word.includes(l)
          return <button key={l} onClick={()=>guess(l)} disabled={used||over} style={{
            width:30, height:30, borderRadius:6, border:0, fontWeight:900, fontSize:12, cursor: used||over?'default':'pointer',
            background: used? (correct? C.green : C.red) : 'white', color: used? 'white' : '#0f2040', opacity: over&&!used? 0.4:1
          }}>{l}</button>
        })}
      </div>
      {over && <GameResultBanner
        text={won? '🎉 Bravo, tu as trouve le mot !' : `😔 Perdu... le mot etait ${word}`}
        color={won? C.green : C.red}
        onReplay={reset} />}
    </div>
  )
}

// ==================================================================
// 6) SERPENT (Snake) — canvas + clavier + swipe tactile
// ==================================================================
function SnakeGame(){
  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)
  const [running, setRunning] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const stateRef = useRef(null)
  const GRID = 18, CELL = 16

  const initState = () => ({
    snake: [{x:9,y:9},{x:8,y:9},{x:7,y:9}],
    dir: {x:1,y:0}, nextDir: {x:1,y:0},
    food: {x:13,y:9},
  })

  const placeFood = (snake) => {
    let f
    do { f = { x:Math.floor(Math.random()*GRID), y:Math.floor(Math.random()*GRID) } }
    while(snake.some(s=>s.x===f.x && s.y===f.y))
    return f
  }

  const draw = useCallback(() => {
    const canvas = canvasRef.current; if(!canvas) return
    const ctx = canvas.getContext('2d')
    const st = stateRef.current; if(!st) return
    ctx.fillStyle = '#0f2040'; ctx.fillRect(0,0,GRID*CELL,GRID*CELL)
    ctx.fillStyle = C.red
    ctx.fillRect(st.food.x*CELL, st.food.y*CELL, CELL-1, CELL-1)
    st.snake.forEach((s,i)=>{
      ctx.fillStyle = i===0? C.green : C.gold
      ctx.fillRect(s.x*CELL, s.y*CELL, CELL-1, CELL-1)
    })
  },[])

  const start = () => {
    stateRef.current = initState()
    setScore(0); setGameOver(false); setRunning(true)
    draw()
  }

  useEffect(()=>{
    if(!running) return
    const interval = setInterval(()=>{
      const st = stateRef.current; if(!st) return
      st.dir = st.nextDir
      const head = { x: st.snake[0].x + st.dir.x, y: st.snake[0].y + st.dir.y }
      if(head.x<0||head.x>=GRID||head.y<0||head.y>=GRID || st.snake.some(s=>s.x===head.x&&s.y===head.y)){
        setRunning(false); setGameOver(true)
        setBest(b=>Math.max(b, score))
        return
      }
      st.snake.unshift(head)
      if(head.x===st.food.x && head.y===st.food.y){
        setScore(s=>s+1)
        st.food = placeFood(st.snake)
      } else {
        st.snake.pop()
      }
      draw()
    }, 130)
    return ()=>clearInterval(interval)
  },[running, draw, score])

  useEffect(()=>{
    const onKey = (e) => {
      const st = stateRef.current; if(!st || !running) return
      if(e.key==='ArrowUp' && st.dir.y===0){ st.nextDir={x:0,y:-1}; e.preventDefault() }
      else if(e.key==='ArrowDown' && st.dir.y===0){ st.nextDir={x:0,y:1}; e.preventDefault() }
      else if(e.key==='ArrowLeft' && st.dir.x===0){ st.nextDir={x:-1,y:0}; e.preventDefault() }
      else if(e.key==='ArrowRight' && st.dir.x===0){ st.nextDir={x:1,y:0}; e.preventDefault() }
    }
    window.addEventListener('keydown', onKey)
    return ()=>window.removeEventListener('keydown', onKey)
  },[running])

  const touchStart = useRef(null)
  const onTouchStart = (e) => { touchStart.current = { x:e.touches[0].clientX, y:e.touches[0].clientY } }
  const onTouchEnd = (e) => {
    const st = stateRef.current; if(!st || !running || !touchStart.current) return
    const dx = e.changedTouches[0].clientX - touchStart.current.x
    const dy = e.changedTouches[0].clientY - touchStart.current.y
    if(Math.abs(dx) > Math.abs(dy)){
      if(dx>20 && st.dir.x===0) st.nextDir={x:1,y:0}
      else if(dx<-20 && st.dir.x===0) st.nextDir={x:-1,y:0}
    } else {
      if(dy>20 && st.dir.y===0) st.nextDir={x:0,y:1}
      else if(dy<-20 && st.dir.y===0) st.nextDir={x:0,y:-1}
    }
  }

  const setDir = (dx,dy) => { const st=stateRef.current; if(!st||!running) return; if(dx!==0 && st.dir.x===0) st.nextDir={x:dx,y:0}; if(dy!==0 && st.dir.y===0) st.nextDir={x:0,y:dy} }

  return (
    <div style={{textAlign:'center', padding:10}}>
      <div style={{display:'flex', justifyContent:'center', gap:20, marginBottom:10, fontSize:12, color:'white', fontWeight:800}}>
        <div>🍎 Score : {score}</div>
        <div>🏆 Record : {best}</div>
      </div>
      <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} style={{display:'inline-block', border:'3px solid #1a3366', borderRadius:8, overflow:'hidden', touchAction:'none'}}>
        <canvas ref={canvasRef} width={GRID*CELL} height={GRID*CELL} style={{display:'block'}} />
      </div>
      {!running && !gameOver && (
        <div style={{marginTop:16}}>
          <button onClick={start} style={btnStyle()}>▶ Commencer</button>
        </div>
      )}
      {running && (
        <div style={{marginTop:14}}>
          <div style={{display:'flex', justifyContent:'center'}}><button onClick={()=>setDir(0,-1)} style={arrowBtn()}>⬆️</button></div>
          <div style={{display:'flex', justifyContent:'center', gap:40}}>
            <button onClick={()=>setDir(-1,0)} style={arrowBtn()}>⬅️</button>
            <button onClick={()=>setDir(1,0)} style={arrowBtn()}>➡️</button>
          </div>
          <div style={{display:'flex', justifyContent:'center'}}><button onClick={()=>setDir(0,1)} style={arrowBtn()}>⬇️</button></div>
          <div style={{fontSize:10, color:'rgba(255,255,255,0.6)', marginTop:6}}>Fleches du clavier ou glisser le doigt sur l'ecran</div>
        </div>
      )}
      {gameOver && <GameResultBanner text="💥 Perdu !" sub={`Score : ${score}`} color={C.red} onReplay={start} />}
    </div>
  )
}

function arrowBtn(){
  return { width:44, height:44, borderRadius:10, border:0, background:'rgba(255,255,255,0.15)', color:'white', fontSize:18, margin:4, cursor:'pointer' }
}
function btnStyle(){
  return { background:C.gold, color:'#0f2040', border:0, borderRadius:20, padding:'12px 20px', fontWeight:900, fontSize:13, cursor:'pointer' }
}


// ==================================================================
// 7) PUZZLE A GLISSIERE (taquin / 15-puzzle)
// ==================================================================
function isSolvable(tiles, size){
  const flat = tiles.filter(t=>t!==null)
  let inversions = 0
  for(let i=0;i<flat.length;i++) for(let j=i+1;j<flat.length;j++) if(flat[i]>flat[j]) inversions++
  if(size % 2 === 1) return inversions % 2 === 0
  const emptyRow = Math.floor(tiles.indexOf(null) / size)
  const emptyRowFromBottom = size - emptyRow
  return (inversions + emptyRowFromBottom) % 2 === 0
}
function shuffledPuzzle(size){
  let tiles
  do {
    tiles = shuffleArr([...Array(size*size-1)].map((_,i)=>i+1).concat([null]))
  } while(!isSolvable(tiles, size) || tiles.every((t,i)=> t===(i===size*size-1? null : i+1)))
  return tiles
}
function SlidingPuzzle(){
  const [size, setSize] = useState(null)
  const [tiles, setTiles] = useState([])
  const [moves, setMoves] = useState(0)

  const start = (n) => { setSize(n); setTiles(shuffledPuzzle(n)); setMoves(0) }
  const won = size && tiles.every((t,i)=> t===(i===size*size-1? null : i+1))

  const move = (idx) => {
    if(won) return
    const emptyIdx = tiles.indexOf(null)
    const row = Math.floor(idx/size), col = idx%size
    const erow = Math.floor(emptyIdx/size), ecol = emptyIdx%size
    const adjacent = (row===erow && Math.abs(col-ecol)===1) || (col===ecol && Math.abs(row-erow)===1)
    if(!adjacent) return
    const nt = [...tiles]; nt[emptyIdx]=tiles[idx]; nt[idx]=null
    setTiles(nt); setMoves(m=>m+1)
  }

  if(!size){
    return (
      <div style={{textAlign:'center', padding:20}}>
        <div style={{fontSize:14, color:'white', marginBottom:16}}>Choisis la difficulte :</div>
        <div style={{display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap'}}>
          <button onClick={()=>start(3)} style={btnStyle()}>Facile (3x3)</button>
          <button onClick={()=>start(4)} style={btnStyle()}>Difficile (4x4)</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{textAlign:'center', padding:10}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12, maxWidth:320, margin:'0 auto 12px'}}>
        <div style={{color:'white', fontWeight:800, fontSize:13}}>Coups : {moves}</div>
        <button onClick={()=>setSize(null)} style={{background:'transparent', border:'1px solid rgba(255,255,255,0.4)', color:'white', borderRadius:8, padding:'6px 12px', fontSize:11, cursor:'pointer'}}>Changer</button>
      </div>
      <div style={{display:'grid', gridTemplateColumns:`repeat(${size}, 1fr)`, gap:6, width: size===3?240:300, margin:'0 auto'}}>
        {tiles.map((t,idx)=>(
          <div key={idx} onClick={()=>move(idx)} style={{
            aspectRatio:'1', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:24, fontWeight:900, cursor: t?'pointer':'default',
            background: t? 'white':'transparent', color:'#0f2040',
            boxShadow: t? '0 2px 6px rgba(0,0,0,0.3)':'none'
          }}>{t}</div>
        ))}
      </div>
      {won && <GameResultBanner text="🎉 Puzzle resolu !" sub={`En ${moves} coups`} color={C.green} onReplay={()=>start(size)} />}
    </div>
  )
}

// ==================================================================
// 8) SUDOKU
// ==================================================================
function sudokuValid(grid, row, col, val){
  for(let i=0;i<9;i++){ if(grid[row][i]===val || grid[i][col]===val) return false }
  const br=Math.floor(row/3)*3, bc=Math.floor(col/3)*3
  for(let r=br;r<br+3;r++) for(let c=bc;c<bc+3;c++) if(grid[r][c]===val) return false
  return true
}
function sudokuGenerateFull(){
  const grid = Array.from({length:9},()=>Array(9).fill(0))
  const fill = (pos) => {
    if(pos===81) return true
    const row=Math.floor(pos/9), col=pos%9
    const nums = shuffleArr([1,2,3,4,5,6,7,8,9])
    for(const n of nums){
      if(sudokuValid(grid,row,col,n)){
        grid[row][col]=n
        if(fill(pos+1)) return true
        grid[row][col]=0
      }
    }
    return false
  }
  fill(0)
  return grid
}
function sudokuMakePuzzle(difficulty){
  const full = sudokuGenerateFull()
  const puzzle = full.map(r=>[...r])
  const toRemove = difficulty==='facile'? 35 : difficulty==='moyen'? 45 : 52
  let removed = 0
  const cells = shuffleArr(Array.from({length:81},(_,i)=>i))
  for(const idx of cells){
    if(removed>=toRemove) break
    const r=Math.floor(idx/9), c=idx%9
    puzzle[r][c]=0
    removed++
  }
  return { puzzle, solution:full }
}
function SudokuGame(){
  const [difficulty, setDifficulty] = useState(null)
  const [puzzle, setPuzzle] = useState(null)
  const [solution, setSolution] = useState(null)
  const [grid, setGrid] = useState(null)
  const [fixed, setFixed] = useState(null)
  const [selected, setSelected] = useState(null)
  const [wrongCells, setWrongCells] = useState([])

  const start = (diff) => {
    const { puzzle:p, solution:s } = sudokuMakePuzzle(diff)
    setDifficulty(diff); setPuzzle(p); setSolution(s)
    setGrid(p.map(r=>[...r])); setFixed(p.map(r=>r.map(v=>v!==0)))
    setSelected(null); setWrongCells([])
  }

  const won = grid && grid.every((row,r)=>row.every((v,c)=>v===solution[r][c]))

  const place = (val) => {
    if(!selected || won) return
    const [r,c] = selected
    if(fixed[r][c]) return
    const ng = grid.map(row=>[...row]); ng[r][c]=val; setGrid(ng)
    setWrongCells(wc=>wc.filter(([wr,wc2])=>!(wr===r&&wc2===c)))
  }
  const checkGrid = () => {
    const wrongs = []
    grid.forEach((row,r)=>row.forEach((v,c)=>{ if(v!==0 && v!==solution[r][c]) wrongs.push([r,c]) }))
    setWrongCells(wrongs)
  }
  const clearCell = () => {
    if(!selected) return
    const [r,c] = selected
    if(fixed[r][c]) return
    const ng = grid.map(row=>[...row]); ng[r][c]=0; setGrid(ng)
  }

  if(!difficulty){
    return (
      <div style={{textAlign:'center', padding:20}}>
        <div style={{fontSize:14, color:'white', marginBottom:16}}>Choisis la difficulte :</div>
        <div style={{display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap'}}>
          <button onClick={()=>start('facile')} style={btnStyle()}>Facile</button>
          <button onClick={()=>start('moyen')} style={btnStyle()}>Moyen</button>
          <button onClick={()=>start('difficile')} style={btnStyle()}>Difficile</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{textAlign:'center', padding:10}}>
      <button onClick={()=>setDifficulty(null)} style={{background:'transparent', border:'1px solid rgba(255,255,255,0.4)', color:'white', borderRadius:8, padding:'6px 12px', fontSize:11, cursor:'pointer', marginBottom:12}}>Changer de niveau</button>
      <div style={{display:'inline-block', background:'#0f2040', padding:3, borderRadius:6}}>
        {grid.map((row,r)=>(
          <div key={r} style={{display:'flex'}}>
            {row.map((v,c)=>{
              const isSel = selected && selected[0]===r && selected[1]===c
              const isWrong = wrongCells.some(([wr,wc])=>wr===r&&wc===c)
              return (
                <div key={c} onClick={()=>!fixed[r][c] && setSelected([r,c])} style={{
                  width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:15, fontWeight: fixed[r][c]? 900:700, cursor: fixed[r][c]?'default':'pointer',
                  background: isWrong? '#ffcccc' : isSel? '#fff3b0' : 'white',
                  color: fixed[r][c]? '#0f2040' : isWrong? C.red : '#2e4fb0',
                  borderRight: (c+1)%3===0 && c!==8? '2px solid #0f2040':'1px solid #ccc',
                  borderBottom: (r+1)%3===0 && r!==8? '2px solid #0f2040':'1px solid #ccc',
                }}>{v||''}</div>
              )
            })}
          </div>
        ))}
      </div>
      <div style={{display:'flex', justifyContent:'center', gap:6, flexWrap:'wrap', marginTop:14, maxWidth:280, marginLeft:'auto', marginRight:'auto'}}>
        {[1,2,3,4,5,6,7,8,9].map(n=>(
          <button key={n} onClick={()=>place(n)} style={{width:32, height:32, borderRadius:6, border:0, background:C.gold, color:'#0f2040', fontWeight:900, fontSize:14, cursor:'pointer'}}>{n}</button>
        ))}
        <button onClick={clearCell} style={{width:32, height:32, borderRadius:6, border:0, background:'rgba(255,255,255,0.2)', color:'white', fontWeight:900, fontSize:14, cursor:'pointer'}}>✕</button>
      </div>
      <div style={{marginTop:12}}>
        <button onClick={checkGrid} style={{background:'rgba(255,255,255,0.15)', color:'white', border:0, borderRadius:20, padding:'8px 18px', fontWeight:800, fontSize:12, cursor:'pointer'}}>✓ Verifier ma grille</button>
      </div>
      {won && <GameResultBanner text="🎉 Sudoku resolu, bravo !" color={C.green} onReplay={()=>start(difficulty)} />}
    </div>
  )
}

// ==================================================================
// JEUX POUR LES PETITS (des 3 ans) — glisser-deposer tactile, coloriage, puzzles, tri des couleurs
// Aucune lecture necessaire : gros boutons, images, pas de "perdu", encouragements a la fin.
// ==================================================================
function KidStyles(){
  return <style>{`
    @keyframes riusShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-7px)}40%{transform:translateX(7px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
    @keyframes riusPop{0%{transform:scale(0.6);opacity:0}70%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
    .riusShake{animation:riusShake .45s}
    .riusPop{animation:riusPop .35s}
  `}</style>
}

// Glisser-deposer qui marche au doigt ET a la souris (pointer events). "begin" est a brancher
// sur onPointerDown d'un element ; les zones de depot portent l'attribut data-drop="...".
// Un simple toucher (sans deplacement) appelle onTap : sert d'alternative "touche puis touche la case".
function useDragDrop({ onDrop, onTap }){
  const [drag, setDrag] = useState(null)
  const ref = useRef(null)
  const cb = useRef({ onDrop, onTap })
  cb.current = { onDrop, onTap }
  const begin = (e, id) => {
    if(e.button !== undefined && e.button !== 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    ref.current = { id, sx:e.clientX, sy:e.clientY, moved:false }
    setDrag({ id, x:e.clientX, y:e.clientY, dx:e.clientX-rect.left, dy:e.clientY-rect.top, w:rect.width, h:rect.height })
    const move = (ev) => {
      const r = ref.current; if(!r) return
      if(Math.abs(ev.clientX-r.sx)+Math.abs(ev.clientY-r.sy) > 8) r.moved = true
      setDrag(d => d ? { ...d, x:ev.clientX, y:ev.clientY } : d)
    }
    const clean = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', cancel) }
    const up = (ev) => {
      clean()
      const r = ref.current; ref.current = null; setDrag(null)
      if(!r) return
      if(!r.moved){ if(cb.current.onTap) cb.current.onTap(r.id); return }
      const target = document.elementsFromPoint(ev.clientX, ev.clientY).find(el => el.dataset && el.dataset.drop)
      cb.current.onDrop(r.id, target ? target.dataset.drop : null)
    }
    const cancel = () => { clean(); ref.current = null; setDrag(null) }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', cancel)
  }
  return { drag, begin }
}

function DragGhost({ drag, children }){
  if(!drag) return null
  return (
    <div style={{ position:'fixed', left:drag.x-drag.dx, top:drag.y-drag.dy, width:drag.w, height:drag.h, pointerEvents:'none', zIndex:9999,
      transform:'scale(1.12) rotate(-4deg)', filter:'drop-shadow(0 8px 10px rgba(0,0,0,0.35))' }}>{children}</div>
  )
}

function LevelPicker({ intro, levels, onPick }){
  return (
    <div style={{textAlign:'center'}}>
      <p style={{color:'rgba(255,255,255,0.85)', fontSize:14, margin:'0 0 16px'}}>{intro}</p>
      <div style={{display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap'}}>
        {levels.map(lv=>(
          <button key={lv.label} onClick={()=>onPick(lv)} style={{...btnStyle(), padding:'16px 22px', fontSize:15, borderRadius:16, minWidth:110}}>
            <div style={{fontSize:32}}>{lv.emoji}</div>{lv.label}
          </button>
        ))}
      </div>
    </div>
  )
}

const KID_COLORS = [
  { id:'rouge', hex:'#e53935' }, { id:'bleu', hex:'#1e88e5' }, { id:'vert', hex:'#43a047' },
  { id:'jaune', hex:'#fdd835' }, { id:'orange', hex:'#fb8c00' }, { id:'violet', hex:'#8e24aa' },
  { id:'rose', hex:'#ec407a' },
]
const kidHex = (id) => (KID_COLORS.find(c=>c.id===id) || KID_COLORS[0]).hex

function BrickSvg({ color, size=72 }){
  return (
    <svg viewBox="0 0 60 40" width={size} height={size*40/60} style={{display:'block'}}>
      <rect x="10" y="4" width="14" height="10" rx="3" fill={color} stroke="rgba(0,0,0,0.35)" strokeWidth="1.5" />
      <rect x="36" y="4" width="14" height="10" rx="3" fill={color} stroke="rgba(0,0,0,0.35)" strokeWidth="1.5" />
      <rect x="3" y="12" width="54" height="25" rx="5" fill={color} stroke="rgba(0,0,0,0.35)" strokeWidth="1.5" />
      <rect x="8" y="16" width="44" height="5" rx="2.5" fill="rgba(255,255,255,0.35)" />
    </svg>
  )
}
function CarSvg({ color, size=84 }){
  return (
    <svg viewBox="0 0 80 44" width={size} height={size*44/80} style={{display:'block'}}>
      <path d="M17 20 L26 6 H53 L64 20 Z" fill={color} stroke="rgba(0,0,0,0.35)" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M26 19 L31 9 H39 V19 Z" fill="#d6efff" />
      <path d="M43 19 V9 H51 L58 19 Z" fill="#d6efff" />
      <rect x="3" y="18" width="74" height="17" rx="7" fill={color} stroke="rgba(0,0,0,0.35)" strokeWidth="1.5" />
      <rect x="68" y="22" width="7" height="5" rx="2" fill="#fff59d" />
      <circle cx="22" cy="35" r="8" fill="#263238" /><circle cx="22" cy="35" r="3.2" fill="#cfd8dc" />
      <circle cx="58" cy="35" r="8" fill="#263238" /><circle cx="58" cy="35" r="3.2" fill="#cfd8dc" />
    </svg>
  )
}

// ==================================================================
// 8) RANGE LES BRIQUES / 9) LE GARAGE — meme mecanique : glisser chaque objet vers sa couleur
// ==================================================================
const SORT_LEVELS = [
  { label:'Petit', emoji:'🐣', colors:3, per:2 },
  { label:'Moyen', emoji:'🐥', colors:4, per:3 },
  { label:'Grand', emoji:'🐔', colors:5, per:3 },
]
function SortGame({ kind }){
  const isCar = kind === 'car'
  const [level, setLevel] = useState(null)
  const [items, setItems] = useState([])
  const [placed, setPlaced] = useState({})
  const [selected, setSelected] = useState(null)
  const [shake, setShake] = useState(null)

  const start = (lv) => {
    const list = []
    KID_COLORS.slice(0, lv.colors).forEach(c=>{ for(let i=0;i<lv.per;i++) list.push({ id:c.id+i, color:c.id }) })
    setItems(shuffleArr(list)); setPlaced({}); setSelected(null); setShake(null); setLevel(lv)
  }
  const tryPlace = (itemId, binColor) => {
    const it = items.find(x=>x.id===itemId)
    if(!it || !binColor) return
    if(it.color === binColor){ setPlaced(p=>({ ...p, [itemId]:true })); setSelected(null) }
    else { setShake(itemId); setTimeout(()=>setShake(null), 500) }
  }
  const { drag, begin } = useDragDrop({
    onDrop: (id, target) => tryPlace(id, target && target.startsWith('bin:') ? target.slice(4) : null),
    onTap: (id) => setSelected(s => s===id ? null : id),
  })
  const visual = (color, size) => isCar ? <CarSvg color={kidHex(color)} size={size} /> : <BrickSvg color={kidHex(color)} size={size} />

  if(!level){
    return (<div><KidStyles /><LevelPicker levels={SORT_LEVELS} onPick={start}
      intro={isCar ? 'Glisse chaque voiture sur la place de la même couleur !' : 'Glisse chaque brique dans la boîte de la même couleur !'} /></div>)
  }
  const remaining = items.filter(i=>!placed[i.id])
  const won = items.length>0 && remaining.length===0
  const bins = KID_COLORS.slice(0, level.colors)
  return (
    <div style={{userSelect:'none', WebkitUserSelect:'none'}}>
      <KidStyles />
      <p style={{color:'rgba(255,255,255,0.8)', fontSize:13, margin:'0 0 10px', textAlign:'center'}}>
        {isCar ? '🚗 Glisse (ou touche) chaque voiture, puis sa place de parking' : '🧱 Glisse (ou touche) chaque brique, puis sa boîte'}
      </p>
      <div style={{display:'flex', flexWrap:'wrap', gap:10, justifyContent:'center', minHeight:70, padding:'10px 6px', background:'rgba(0,0,0,0.15)', borderRadius:14}}>
        {remaining.map(it=>(
          <div key={it.id} className={shake===it.id ? 'riusShake' : ''} onPointerDown={e=>begin(e, it.id)}
            style={{ touchAction:'none', cursor:'grab', padding:4, borderRadius:12,
              opacity: drag && drag.id===it.id ? 0.25 : 1,
              outline: selected===it.id ? '3px solid '+C.gold : 'none', background: selected===it.id ? 'rgba(255,204,0,0.2)' : 'transparent' }}>
            {visual(it.color, isCar ? 84 : 72)}
          </div>
        ))}
        {won && <div style={{color:C.green, fontWeight:900, fontSize:16, alignSelf:'center'}}>Tout est rangé !</div>}
      </div>
      <div style={{display:'flex', flexWrap:'wrap', gap:12, justifyContent:'center', marginTop:16}}>
        {bins.map(c=>{
          const inside = items.filter(i=>i.color===c.id && placed[i.id])
          return (
            <div key={c.id} data-drop={'bin:'+c.id} onClick={()=>{ if(selected) tryPlace(selected, c.id) }}
              style={ isCar
                ? { width:132, minHeight:96, borderRadius:10, background:'#455a64', border:'3px dashed '+c.hex, padding:6, boxSizing:'border-box', display:'flex', flexWrap:'wrap', gap:2, alignContent:'center', justifyContent:'center', position:'relative', cursor:'pointer' }
                : { width:118, minHeight:92, borderRadius:'8px 8px 18px 18px', background:c.hex+'40', borderStyle:'solid', borderColor:c.hex, borderWidth:'8px 3px 3px 3px', padding:6, boxSizing:'border-box', display:'flex', flexWrap:'wrap', gap:2, alignContent:'center', justifyContent:'center', position:'relative', cursor:'pointer' } }>
              <div style={{position:'absolute', top:4, left:6, width:16, height:16, borderRadius:'50%', background:c.hex, border:'2px solid #fff'}} />
              {inside.length===0 && isCar && <div style={{color:'rgba(255,255,255,0.35)', fontWeight:900, fontSize:34}}>P</div>}
              {inside.map(it=>(<div key={it.id} className="riusPop" style={{pointerEvents:'none'}}>{visual(it.color, isCar ? 46 : 40)}</div>))}
            </div>
          )
        })}
      </div>
      <DragGhost drag={drag}>{drag && (()=>{ const it = items.find(x=>x.id===drag.id); return it ? visual(it.color, drag.w-8) : null })()}</DragGhost>
      {won && <GameResultBanner text="🎉 Bravo !" sub="Tout est bien rangé" color={C.green} onReplay={()=>start(level)} />}
      <div style={{textAlign:'center', marginTop:12}}>
        <button onClick={()=>setLevel(null)} style={{...btnStyle(), background:'rgba(255,255,255,0.15)', color:'white', padding:'8px 16px', fontSize:12}}>↩ Changer de niveau</button>
      </div>
    </div>
  )
}
function BrickSortGame(){ return <SortGame kind="brick" /> }
function GarageGame(){ return <SortGame kind="car" /> }

// ==================================================================
// DESSINS (coloriage + puzzle) — 4 dessins definis une seule fois, 300 x 300
// t : rect | circle | ellipse | poly ; f : couleur "de vrai" (utilisee par le puzzle)
// ==================================================================
const PETAL_SHAPES = Array.from({length:6}, (_,k)=>{
  const a = k*60, rad = a*Math.PI/180
  return { t:'ellipse', cx:150+40*Math.sin(rad), cy:112-40*Math.cos(rad), rx:19, ry:32, r:a, f: k%2 ? '#ff8ab5' : '#ff5c9d' }
})
const DRAWINGS = [
  { id:'maison', name:'Maison', emoji:'🏠', shapes:[
    { t:'rect', x:0, y:0, w:300, h:300, f:'#bfe6ff' },
    { t:'circle', cx:245, cy:55, r:28, f:'#ffd93b' },
    { t:'ellipse', cx:70, cy:52, rx:40, ry:16, f:'#ffffff' },
    { t:'ellipse', cx:98, cy:42, rx:24, ry:14, f:'#ffffff' },
    { t:'rect', x:0, y:215, w:300, h:85, f:'#6cc24a' },
    { t:'poly', p:'128,240 172,240 195,300 105,300', f:'#d7ccc8' },
    { t:'rect', x:190, y:68, w:26, h:50, f:'#8d6e63' },
    { t:'rect', x:70, y:130, w:160, h:110, f:'#ffb74d' },
    { t:'poly', p:'55,135 150,58 245,135', f:'#e53935' },
    { t:'rect', x:130, y:175, w:40, h:65, f:'#6d4c41' },
    { t:'rect', x:88, y:158, w:32, h:32, f:'#81d4fa' },
    { t:'rect', x:182, y:158, w:32, h:32, f:'#81d4fa' },
  ]},
  { id:'poisson', name:'Poisson', emoji:'🐠', shapes:[
    { t:'rect', x:0, y:0, w:300, h:300, f:'#4fc3f7' },
    { t:'rect', x:0, y:255, w:300, h:45, f:'#f5deb3' },
    { t:'ellipse', cx:45, cy:225, rx:11, ry:36, f:'#2e7d32' },
    { t:'ellipse', cx:262, cy:222, rx:11, ry:38, f:'#2e7d32' },
    { t:'poly', p:'210,150 272,102 272,198', f:'#ff9800' },
    { t:'poly', p:'112,108 150,66 188,108', f:'#ff7043' },
    { t:'ellipse', cx:150, cy:150, rx:78, ry:52, f:'#ffb300' },
    { t:'ellipse', cx:152, cy:172, rx:24, ry:12, r:-20, f:'#ff7043' },
    { t:'circle', cx:106, cy:136, r:14, f:'#ffffff' },
    { t:'circle', cx:103, cy:136, r:6, f:'#222222' },
    { t:'circle', cx:58, cy:110, r:11, f:'#e1f5fe' },
    { t:'circle', cx:76, cy:80, r:8, f:'#e1f5fe' },
    { t:'circle', cx:52, cy:62, r:6, f:'#e1f5fe' },
  ]},
  { id:'fleur', name:'Fleur', emoji:'🌸', shapes:[
    { t:'rect', x:0, y:0, w:300, h:300, f:'#c8f0ff' },
    { t:'ellipse', cx:62, cy:48, rx:36, ry:14, f:'#ffffff' },
    { t:'circle', cx:250, cy:50, r:24, f:'#ffd93b' },
    { t:'rect', x:0, y:238, w:300, h:62, f:'#7ed957' },
    { t:'rect', x:142, y:130, w:16, h:115, f:'#388e3c' },
    { t:'ellipse', cx:112, cy:200, rx:32, ry:12, r:-30, f:'#4caf50' },
    { t:'ellipse', cx:188, cy:184, rx:32, ry:12, r:30, f:'#4caf50' },
    ...PETAL_SHAPES,
    { t:'circle', cx:150, cy:112, r:26, f:'#ffd93b' },
  ]},
  { id:'voiture', name:'Voiture', emoji:'🚗', shapes:[
    { t:'rect', x:0, y:0, w:300, h:300, f:'#bbdefb' },
    { t:'circle', cx:245, cy:52, r:26, f:'#ffd93b' },
    { t:'rect', x:0, y:215, w:300, h:85, f:'#607d8b' },
    { t:'rect', x:30, y:262, w:50, h:9, f:'#ffffff' },
    { t:'rect', x:125, y:262, w:50, h:9, f:'#ffffff' },
    { t:'rect', x:220, y:262, w:50, h:9, f:'#ffffff' },
    { t:'poly', p:'88,168 116,118 196,118 226,168', f:'#e53935' },
    { t:'rect', x:38, y:162, w:224, h:54, rx:16, f:'#e53935' },
    { t:'poly', p:'104,168 124,130 150,130 150,168', f:'#b3e5fc' },
    { t:'poly', p:'160,130 190,130 208,168 160,168', f:'#b3e5fc' },
    { t:'circle', cx:90, cy:216, r:26, f:'#37474f' },
    { t:'circle', cx:210, cy:216, r:26, f:'#37474f' },
    { t:'circle', cx:90, cy:216, r:10, f:'#cfd8dc' },
    { t:'circle', cx:210, cy:216, r:10, f:'#cfd8dc' },
    { t:'circle', cx:250, cy:184, r:9, f:'#fff59d' },
  ]},
]

function DrawingSvg({ shapes, fills, onShape, viewBox='0 0 300 300', width='100%', height }){
  return (
    <svg viewBox={viewBox} width={width} height={height} style={{display:'block', touchAction:'manipulation'}}>
      {shapes.map((s,i)=>{
        const common = {
          fill: fills ? (fills[i] || '#ffffff') : s.f,
          stroke:'#1a2a4a', strokeWidth:2.5, strokeLinejoin:'round',
          onClick: onShape ? ()=>onShape(i) : undefined,
          style: { cursor: onShape ? 'pointer' : 'default' },
        }
        if(s.t==='rect') return <rect key={i} {...common} x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx||0} />
        if(s.t==='circle') return <circle key={i} {...common} cx={s.cx} cy={s.cy} r={s.r} />
        if(s.t==='ellipse') return <ellipse key={i} {...common} cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} transform={s.r ? `rotate(${s.r} ${s.cx} ${s.cy})` : undefined} />
        return <polygon key={i} {...common} points={s.p} />
      })}
    </svg>
  )
}

// ==================================================================
// 10) COLORIAGE MAGIQUE — on choisit une couleur puis on touche une partie du dessin
// ==================================================================
const PAINT_COLORS = ['#e53935','#fb8c00','#fdd835','#7ed957','#43a047','#26c6da','#1e88e5','#8e24aa','#ec407a','#8d6e63','#263238','#ffffff']
function ColoringGame(){
  const [drawing, setDrawing] = useState(null)
  const [fills, setFills] = useState({})
  const [color, setColor] = useState(PAINT_COLORS[0])

  if(!drawing){
    return (
      <div style={{textAlign:'center'}}>
        <p style={{color:'rgba(255,255,255,0.85)', fontSize:14, margin:'0 0 16px'}}>🎨 Choisis un dessin à colorier !</p>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:14}}>
          {DRAWINGS.map(d=>(
            <div key={d.id} onClick={()=>{ setDrawing(d); setFills({}) }} style={{background:'rgba(255,255,255,0.1)', borderRadius:14, padding:10, cursor:'pointer', border:'1px solid rgba(255,255,255,0.2)'}}>
              <div style={{borderRadius:8, overflow:'hidden', background:'#fff'}}><DrawingSvg shapes={d.shapes} fills={{}} /></div>
              <div style={{color:'white', fontWeight:800, fontSize:13, marginTop:6}}>{d.emoji} {d.name}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div style={{userSelect:'none', WebkitUserSelect:'none'}}>
      <div style={{maxWidth:420, margin:'0 auto', background:'#fff', borderRadius:12, overflow:'hidden', boxShadow:'0 4px 14px rgba(0,0,0,0.3)'}}>
        <DrawingSvg shapes={drawing.shapes} fills={fills} onShape={(i)=>setFills(f=>({ ...f, [i]: color }))} />
      </div>
      <div style={{display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center', marginTop:14}}>
        {PAINT_COLORS.map(c=>(
          <button key={c} onClick={()=>setColor(c)} aria-label={'Couleur '+c}
            style={{ width:42, height:42, borderRadius:'50%', background:c, cursor:'pointer', padding:0,
              border: color===c ? '4px solid '+C.gold : '3px solid rgba(255,255,255,0.6)',
              transform: color===c ? 'scale(1.18)' : 'none', boxShadow:'0 2px 6px rgba(0,0,0,0.3)' }} />
        ))}
      </div>
      <div style={{display:'flex', gap:10, justifyContent:'center', marginTop:14, flexWrap:'wrap'}}>
        <button onClick={()=>setFills({})} style={btnStyle()}>🧽 Tout effacer</button>
        <button onClick={()=>setDrawing(null)} style={{...btnStyle(), background:'rgba(255,255,255,0.15)', color:'white'}}>🖼️ Autre dessin</button>
      </div>
    </div>
  )
}

// ==================================================================
// 11) PUZZLE EN DESSINS — glisser chaque morceau a sa place (le dessin apparait en filigrane)
// ==================================================================
const JIGSAW_LEVELS = [
  { label:'4 pièces', emoji:'🧩', cols:2, rows:2 },
  { label:'6 pièces', emoji:'🧩', cols:3, rows:2 },
  { label:'9 pièces', emoji:'🧩', cols:3, rows:3 },
]
const JIGSAW_BOARD = 270
function PictureJigsaw(){
  const [lv, setLv] = useState(JIGSAW_LEVELS[0])
  const [drawing, setDrawing] = useState(null)
  const [tray, setTray] = useState([])
  const [placed, setPlaced] = useState({})
  const [selected, setSelected] = useState(null)
  const [shake, setShake] = useState(null)

  const cw = JIGSAW_BOARD / lv.cols, ch = JIGSAW_BOARD / lv.rows
  const vw = 300 / lv.cols, vh = 300 / lv.rows
  const total = lv.cols * lv.rows

  const startWith = (d) => {
    setDrawing(d); setTray(shuffleArr(Array.from({length:total}, (_,i)=>i))); setPlaced({}); setSelected(null); setShake(null)
  }
  const tryPlace = (pieceId, slot) => {
    if(slot === null || slot === undefined) return
    if(pieceId === slot){ setPlaced(p=>({ ...p, [pieceId]:true })); setSelected(null) }
    else { setShake(pieceId); setTimeout(()=>setShake(null), 500) }
  }
  const { drag, begin } = useDragDrop({
    onDrop: (id, target) => tryPlace(id, target && target.startsWith('slot:') ? Number(target.slice(5)) : null),
    onTap: (id) => setSelected(s => s===id ? null : id),
  })
  const pieceView = (id, w, h) => {
    const c = id % lv.cols, r = Math.floor(id / lv.cols)
    return <DrawingSvg shapes={drawing.shapes} viewBox={`${c*vw} ${r*vh} ${vw} ${vh}`} width={w} height={h} />
  }

  if(!drawing){
    return (
      <div style={{textAlign:'center'}}>
        <p style={{color:'rgba(255,255,255,0.85)', fontSize:14, margin:'0 0 12px'}}>🧩 Choisis la difficulté, puis un dessin</p>
        <div style={{display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap', marginBottom:16}}>
          {JIGSAW_LEVELS.map(l=>(
            <button key={l.label} onClick={()=>setLv(l)} style={{...btnStyle(), padding:'10px 16px',
              background: lv.label===l.label ? C.gold : 'rgba(255,255,255,0.15)', color: lv.label===l.label ? '#0f2040' : 'white'}}>{l.label}</button>
          ))}
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:14}}>
          {DRAWINGS.map(d=>(
            <div key={d.id} onClick={()=>startWith(d)} style={{background:'rgba(255,255,255,0.1)', borderRadius:14, padding:10, cursor:'pointer', border:'1px solid rgba(255,255,255,0.2)'}}>
              <div style={{borderRadius:8, overflow:'hidden'}}><DrawingSvg shapes={d.shapes} /></div>
              <div style={{color:'white', fontWeight:800, fontSize:13, marginTop:6}}>{d.emoji} {d.name}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  const remaining = tray.filter(id=>!placed[id])
  const won = remaining.length === 0
  return (
    <div style={{userSelect:'none', WebkitUserSelect:'none'}}>
      <KidStyles />
      <p style={{color:'rgba(255,255,255,0.8)', fontSize:13, margin:'0 0 10px', textAlign:'center'}}>Glisse (ou touche) chaque morceau, puis sa place</p>
      <div style={{position:'relative', width:JIGSAW_BOARD, height:JIGSAW_BOARD, margin:'0 auto', borderRadius:10, overflow:'hidden', background:'rgba(255,255,255,0.08)', boxShadow:'0 4px 14px rgba(0,0,0,0.3)'}}>
        <div style={{position:'absolute', inset:0, opacity:0.22}}><DrawingSvg shapes={drawing.shapes} width={JIGSAW_BOARD} height={JIGSAW_BOARD} /></div>
        <div style={{position:'absolute', inset:0, display:'grid', gridTemplateColumns:`repeat(${lv.cols}, ${cw}px)`, gridTemplateRows:`repeat(${lv.rows}, ${ch}px)`}}>
          {Array.from({length:total}, (_,i)=>(
            <div key={i} data-drop={'slot:'+i} onClick={()=>{ if(selected!==null) tryPlace(selected, i) }}
              style={{ boxSizing:'border-box', border:'1.5px dashed rgba(255,255,255,0.45)', overflow:'hidden', cursor:'pointer' }}>
              {placed[i] && <div className="riusPop" style={{pointerEvents:'none'}}>{pieceView(i, cw, ch)}</div>}
            </div>
          ))}
        </div>
      </div>
      <div style={{display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center', marginTop:16, minHeight:ch+8}}>
        {remaining.map(id=>(
          <div key={id} className={shake===id ? 'riusShake' : ''} onPointerDown={e=>begin(e, id)}
            style={{ touchAction:'none', cursor:'grab', width:cw, height:ch, borderRadius:8, overflow:'hidden', border:'2px solid #fff', boxSizing:'border-box',
              opacity: drag && drag.id===id ? 0.25 : 1, outline: selected===id ? '3px solid '+C.gold : 'none' }}>
            {pieceView(id, cw-4, ch-4)}
          </div>
        ))}
      </div>
      <DragGhost drag={drag}>{drag && <div style={{width:'100%', height:'100%', borderRadius:8, overflow:'hidden', border:'2px solid #fff', boxSizing:'border-box'}}>{pieceView(drag.id, cw-4, ch-4)}</div>}</DragGhost>
      {won && <GameResultBanner text="🎉 Bravo !" sub="Le dessin est complet" color={C.green} onReplay={()=>startWith(drawing)} />}
      <div style={{textAlign:'center', marginTop:12}}>
        <button onClick={()=>setDrawing(null)} style={{...btnStyle(), background:'rgba(255,255,255,0.15)', color:'white', padding:'8px 16px', fontSize:12}}>↩ Autre dessin</button>
      </div>
    </div>
  )
}

// ==================================================================
// 12) TRI DES COULEURS — on verse les liquides d'un tube a l'autre (tube = touche, puis destination)
// ==================================================================
const LIQUID_COLORS = ['#e53935','#1e88e5','#43a047','#fdd835','#fb8c00','#8e24aa','#ec407a','#26c6da']
const TUBE_CAP = 4
const LIQUID_LEVELS = [
  { label:'Petit', emoji:'🐣', colors:2 },
  { label:'Moyen', emoji:'🐥', colors:4 },
  { label:'Grand', emoji:'🐔', colors:6 },
]
const tubeDone = (t) => t.length===0 || (t.length===TUBE_CAP && t.every(c=>c===t[0]))
function makeLiquidTubes(n){
  let tubes = []
  for(let tries=0; tries<200; tries++){
    const units = []
    for(let c=0;c<n;c++) for(let k=0;k<TUBE_CAP;k++) units.push(c)
    const sh = shuffleArr(units)
    tubes = Array.from({length:n}, (_,i)=>sh.slice(i*TUBE_CAP, (i+1)*TUBE_CAP))
    if(!tubes.some(t=>tubeDone(t))) break
  }
  return [...tubes, [], []]
}
function pourTubes(tubes, from, to){
  if(from===to) return null
  const src = tubes[from], dst = tubes[to]
  if(!src.length) return null
  const color = src[src.length-1]
  if(dst.length && dst[dst.length-1]!==color) return null
  const room = TUBE_CAP - dst.length
  if(room<=0) return null
  let n = 0
  for(let i=src.length-1; i>=0 && src[i]===color; i--) n++
  const k = Math.min(n, room)
  const next = tubes.map(t=>[...t])
  next[from] = src.slice(0, src.length-k)
  next[to] = [...dst, ...Array(k).fill(color)]
  return next
}
function WaterSortGame(){
  const [level, setLevel] = useState(null)
  const [tubes, setTubes] = useState([])
  const [history, setHistory] = useState([])
  const [selected, setSelected] = useState(null)

  const start = (lv) => { setLevel(lv); setTubes(makeLiquidTubes(lv.colors)); setHistory([]); setSelected(null) }
  const onTube = (i) => {
    if(selected===null){ if(tubes[i].length) setSelected(i); return }
    if(selected===i){ setSelected(null); return }
    const next = pourTubes(tubes, selected, i)
    if(next){ setHistory(h=>[...h, tubes]); setTubes(next); setSelected(null) }
    else setSelected(tubes[i].length ? i : null)
  }
  const undo = () => { if(!history.length) return; setTubes(history[history.length-1]); setHistory(h=>h.slice(0,-1)); setSelected(null) }
  if(!level){
    return <LevelPicker levels={LIQUID_LEVELS} onPick={start} intro="🧪 Verse les liquides pour avoir une seule couleur par tube !" />
  }
  const won = tubes.length>0 && tubes.every(tubeDone)
  return (
    <div>
      <p style={{color:'rgba(255,255,255,0.8)', fontSize:13, margin:'0 0 14px', textAlign:'center'}}>Touche un tube, puis le tube où verser</p>
      <div style={{display:'flex', flexWrap:'wrap', gap:14, justifyContent:'center', paddingTop:16}}>
        {tubes.map((t,i)=>(
          <div key={i} onClick={()=>!won && onTube(i)} style={{
            width:48, height:TUBE_CAP*34+10, boxSizing:'border-box', padding:3, cursor:'pointer',
            borderStyle:'solid', borderWidth:'0 3px 3px 3px', borderColor: selected===i ? C.gold : 'rgba(255,255,255,0.7)',
            borderRadius:'0 0 26px 26px', background:'rgba(255,255,255,0.08)',
            display:'flex', flexDirection:'column-reverse', gap:2, overflow:'hidden',
            transform: selected===i ? 'translateY(-16px)' : 'none', transition:'transform .15s' }}>
            {t.map((c,k)=>(<div key={k} style={{ height:32, borderRadius: k===0 ? '0 0 20px 20px' : 4, background:LIQUID_COLORS[c] }} />))}
          </div>
        ))}
      </div>
      {won && <GameResultBanner text="🎉 Bravo !" sub={`Réussi en ${history.length} versements`} color={C.green} onReplay={()=>start(level)} />}
      <div style={{display:'flex', gap:10, justifyContent:'center', marginTop:18, flexWrap:'wrap'}}>
        <button onClick={undo} disabled={!history.length} style={{...btnStyle(), opacity:history.length?1:0.4}}>↩ Annuler</button>
        <button onClick={()=>start(level)} style={btnStyle()}>🔄 Recommencer</button>
        <button onClick={()=>setLevel(null)} style={{...btnStyle(), background:'rgba(255,255,255,0.15)', color:'white'}}>Changer de niveau</button>
      </div>
    </div>
  )
}

// ==================================================================
// PAGE PRINCIPALE — grille de selection des jeux
// ==================================================================
const GAMES_LIST = [
  { id:'memory', title:'Memory', desc:'Retrouve toutes les paires', emoji:'🧠', component:MemoryGame },
  { id:'morpion', title:'Morpion', desc:'Contre l\'ordinateur', emoji:'⭕', component:TicTacToe },
  { id:'puissance4', title:'Puissance 4', desc:'Contre l\'ordinateur', emoji:'🔴', component:Connect4 },
  { id:'quiz', title:'Quiz Culture Generale', desc:'15 questions varies', emoji:'❓', component:QuizGame },
  { id:'pendu', title:'Pendu', desc:'Devine le mot mystere', emoji:'🔤', component:HangmanGame },
  { id:'snake', title:'Serpent', desc:'Jeu de reflexes classique', emoji:'🐍', component:SnakeGame },
  { id:'taquin', title:'Puzzle a glissiere', desc:'Remets les nombres en ordre', emoji:'🧩', component:SlidingPuzzle },
  { id:'sudoku', title:'Sudoku', desc:'3 niveaux de difficulte', emoji:'🔢', component:SudokuGame },
  { id:'coloriage', title:'Coloriage magique', desc:'Colorie de beaux dessins', emoji:'🎨', component:ColoringGame, age:'Dès 3 ans' },
  { id:'briques', title:'Range les briques', desc:'Chaque brique dans sa boîte', emoji:'🧱', component:BrickSortGame, age:'Dès 3 ans' },
  { id:'garage', title:'Le garage', desc:'Gare chaque voiture à sa place', emoji:'🚗', component:GarageGame, age:'Dès 3 ans' },
  { id:'puzzle-dessins', title:'Puzzle en dessins', desc:'Reconstitue le dessin', emoji:'🖼️', component:PictureJigsaw, age:'Dès 3 ans' },
  { id:'liquides', title:'Tri des couleurs', desc:'Verse les liquides par couleur', emoji:'🧪', component:WaterSortGame, age:'Dès 5 ans' },
]

export default function GamesPage({pubsTop, pubsMid}){
  const [activeGame, setActiveGame] = useState(null)

  if(activeGame){
    const game = GAMES_LIST.find(g=>g.id===activeGame)
    const GameComp = game.component
    return (
      <div style={{maxWidth:900, margin:'0 auto', padding:'20px 14px'}}>
        <button onClick={()=>setActiveGame(null)} style={{background:'transparent', border:'1px solid rgba(255,255,255,0.4)', color:'white', borderRadius:20, padding:'8px 16px', fontSize:12, cursor:'pointer', marginBottom:16}}>← Retour aux jeux</button>
        <h2 style={{color:'white', fontSize:20, marginTop:0, marginBottom:16}}>{game.emoji} {game.title}</h2>
        <div key={activeGame}><GameComp /></div>
        {pubsMid && pubsMid.length>0 && <div style={{marginTop:28, paddingTop:20, borderTop:'1px solid rgba(255,255,255,0.12)'}}><AdBanner pubs={pubsMid} format="leaderboard" /></div>}
      </div>
    )
  }

  return (
    <div style={{maxWidth:900, margin:'0 auto', padding:'24px 14px'}}>
      <h2 style={{color:'white', fontSize:22, marginTop:0}}>🎮 Espace Jeux</h2>
      <p style={{color:'rgba(255,255,255,0.75)', fontSize:13, marginBottom:16}}>Des jeux gratuits pour se detendre en famille — enfants, jeunes et adultes !</p>
      {pubsTop && pubsTop.length>0 && <div style={{marginBottom:20}}><AdBanner pubs={pubsTop} format="leaderboard" /></div>}
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:14}}>
        {GAMES_LIST.map(g=>(
          <div key={g.id} onClick={()=>setActiveGame(g.id)} style={{
            background:'rgba(255,255,255,0.08)', borderRadius:14, padding:'20px 14px', textAlign:'center',
            cursor:'pointer', border:'1px solid rgba(255,255,255,0.12)', transition:'transform 0.15s'
          }}>
            <div style={{fontSize:38, marginBottom:8}}>{g.emoji}</div>
            <div style={{color:'white', fontWeight:800, fontSize:14}}>{g.title}</div>
            <div style={{color:'rgba(255,255,255,0.6)', fontSize:11, marginTop:4}}>{g.desc}</div>
            {g.age && <div style={{display:'inline-block', marginTop:8, background:C.green, color:'#0f2040', fontSize:10, fontWeight:900, borderRadius:10, padding:'2px 8px'}}>{g.age}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
