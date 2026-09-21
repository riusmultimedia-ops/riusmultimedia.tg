import React, { useState, useEffect, useRef, useCallback, useReducer } from 'react'
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
// OUTILS COMMUNS (clavier + glissement du doigt)
// ==================================================================
function useKeyDown(handler, active=true){
  const ref = useRef(handler)
  ref.current = handler
  useEffect(()=>{
    if(!active) return
    const f = (e) => ref.current(e)
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  }, [active])
}
function useSwipe(onDir){
  const st = useRef(null)
  const cb = useRef(onDir)
  cb.current = onDir
  return {
    onPointerDown: (e) => { st.current = { x:e.clientX, y:e.clientY } },
    onPointerUp: (e) => {
      const s = st.current; st.current = null
      if(!s) return
      const dx = e.clientX - s.x, dy = e.clientY - s.y
      if(Math.max(Math.abs(dx), Math.abs(dy)) < 24) return
      if(Math.abs(dx) > Math.abs(dy)) cb.current(dx > 0 ? 'right' : 'left')
      else cb.current(dy > 0 ? 'down' : 'up')
    },
    style: { touchAction:'none' },
  }
}
function DirPad({ onDir }){
  const b = { ...btnStyle(), width:58, height:58, padding:0, fontSize:22, borderRadius:16 }
  return (
    <div style={{display:'grid', gridTemplateColumns:'repeat(3,58px)', gridTemplateRows:'repeat(2,58px)', gap:6, justifyContent:'center', marginTop:14}}>
      <div /><button style={b} onClick={()=>onDir('up')} aria-label="Haut">▲</button><div />
      <button style={b} onClick={()=>onDir('left')} aria-label="Gauche">◀</button>
      <button style={b} onClick={()=>onDir('down')} aria-label="Bas">▼</button>
      <button style={b} onClick={()=>onDir('right')} aria-label="Droite">▶</button>
    </div>
  )
}
const DIR_KEYS = { ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right', w:'up', s:'down', a:'left', d:'right', z:'up', q:'left' }

// ==================================================================
// 13) LES OMBRES / 14) FORMES RIGOLOTES — chaque image glisse sur son ombre (ou dans son trou)
// ==================================================================
const ANIMAL_EMOJIS = ['🐶','🐱','🐭','🐰','🦊','🐻','🐼','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐘','🦒','🐢','🐟','🦆','🐴','🐑']
const MATCH_LEVELS = [
  { label:'Petit', emoji:'🐣', n:3 },
  { label:'Moyen', emoji:'🐥', n:4 },
  { label:'Grand', emoji:'🐔', n:6 },
]
function ShapeSvg({ kind, color, size=64, hole=false }){
  const p = {
    fill: hole ? 'rgba(0,0,0,0.45)' : color,
    stroke: hole ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.35)',
    strokeWidth: hole ? 2.5 : 2, strokeLinejoin:'round', strokeDasharray: hole ? '5 4' : undefined,
  }
  let body
  if(kind==='cercle') body = <circle cx="32" cy="32" r="26" {...p} />
  else if(kind==='carre') body = <rect x="8" y="8" width="48" height="48" rx="5" {...p} />
  else if(kind==='triangle') body = <polygon points="32,6 58,56 6,56" {...p} />
  else if(kind==='etoile') body = <polygon points="32,5 39,24 59,25 43,38 49,58 32,46 15,58 21,38 5,25 25,24" {...p} />
  else if(kind==='coeur') body = <path d="M32 56 C8 38 4 22 14 14 C22 8 30 12 32 20 C34 12 42 8 50 14 C60 22 56 38 32 56 Z" {...p} />
  else if(kind==='rectangle') body = <rect x="4" y="18" width="56" height="28" rx="4" {...p} />
  else body = <polygon points="32,4 58,32 32,60 6,32" {...p} />
  return <svg viewBox="0 0 64 64" width={size} height={size} style={{display:'block'}}>{body}</svg>
}
const SHAPE_KINDS = [
  { id:'cercle', color:'#e53935' }, { id:'carre', color:'#1e88e5' }, { id:'triangle', color:'#43a047' },
  { id:'etoile', color:'#fdd835' }, { id:'coeur', color:'#ec407a' }, { id:'losange', color:'#8e24aa' }, { id:'rectangle', color:'#fb8c00' },
]
function DropMatchGame({ intro, hint, levels, makeItems }){
  const [level, setLevel] = useState(null)
  const [items, setItems] = useState([])
  const [slots, setSlots] = useState([])
  const [tray, setTray] = useState([])
  const [placed, setPlaced] = useState({})
  const [selected, setSelected] = useState(null)
  const [shake, setShake] = useState(null)
  const SLOT = 88, ITEM = 68

  const start = (lv) => {
    const list = makeItems(lv)
    setItems(list); setSlots(shuffleArr(list.map(i=>i.id))); setTray(shuffleArr(list.map(i=>i.id)))
    setPlaced({}); setSelected(null); setShake(null); setLevel(lv)
  }
  const byId = (id) => items.find(i=>i.id===id)
  const tryPlace = (itemId, slotId) => {
    if(!slotId) return
    if(itemId === slotId){ setPlaced(p=>({ ...p, [itemId]:true })); setSelected(null) }
    else { setShake(itemId); setTimeout(()=>setShake(null), 500) }
  }
  const { drag, begin } = useDragDrop({
    onDrop: (id, target) => tryPlace(id, target && target.startsWith('slot:') ? target.slice(5) : null),
    onTap: (id) => setSelected(s => s===id ? null : id),
  })
  if(!level) return (<div><KidStyles /><LevelPicker levels={levels} onPick={start} intro={intro} /></div>)

  const remaining = tray.filter(id=>!placed[id])
  const won = items.length>0 && remaining.length===0
  return (
    <div style={{userSelect:'none', WebkitUserSelect:'none'}}>
      <KidStyles />
      <p style={{color:'rgba(255,255,255,0.8)', fontSize:13, margin:'0 0 12px', textAlign:'center'}}>{hint}</p>
      <div style={{display:'flex', flexWrap:'wrap', gap:12, justifyContent:'center', padding:'14px 8px', background:'rgba(0,0,0,0.15)', borderRadius:14}}>
        {slots.map(id=>{
          const it = byId(id)
          return (
            <div key={id} data-drop={'slot:'+id} onClick={()=>{ if(selected) tryPlace(selected, id) }}
              style={{ width:SLOT, height:SLOT, borderRadius:16, background:'rgba(255,255,255,0.14)', border:'2px dashed rgba(255,255,255,0.4)',
                display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <div className={placed[id] ? 'riusPop' : ''} style={{pointerEvents:'none'}}>{placed[id] ? it.node(ITEM) : it.hole(ITEM)}</div>
            </div>
          )
        })}
      </div>
      <div style={{display:'flex', flexWrap:'wrap', gap:12, justifyContent:'center', marginTop:16, minHeight:ITEM+16}}>
        {remaining.map(id=>{
          const it = byId(id)
          return (
            <div key={id} className={shake===id ? 'riusShake' : ''} onPointerDown={e=>begin(e, id)}
              style={{ touchAction:'none', cursor:'grab', padding:6, borderRadius:14, opacity: drag && drag.id===id ? 0.25 : 1,
                outline: selected===id ? '3px solid '+C.gold : 'none', background: selected===id ? 'rgba(255,204,0,0.2)' : 'transparent' }}>
              {it.node(ITEM)}
            </div>
          )
        })}
      </div>
      <DragGhost drag={drag}>{drag && byId(drag.id) ? byId(drag.id).node(ITEM) : null}</DragGhost>
      {won && <GameResultBanner text="🎉 Bravo !" sub="Tout est à sa place" color={C.green} onReplay={()=>start(level)} />}
      <div style={{textAlign:'center', marginTop:12}}>
        <button onClick={()=>setLevel(null)} style={{...btnStyle(), background:'rgba(255,255,255,0.15)', color:'white', padding:'8px 16px', fontSize:12}}>↩ Changer de niveau</button>
      </div>
    </div>
  )
}
function ShadowGame(){
  return <DropMatchGame levels={MATCH_LEVELS} intro="🦊 Glisse chaque animal sur son ombre !" hint="Glisse (ou touche) l'animal, puis son ombre"
    makeItems={(lv)=> shuffleArr(ANIMAL_EMOJIS).slice(0, lv.n).map(e=>({
      id:e,
      node:(s)=> <span style={{fontSize:s*0.85, lineHeight:1, display:'block'}}>{e}</span>,
      hole:(s)=> <span style={{fontSize:s*0.85, lineHeight:1, display:'block', filter:'brightness(0)', opacity:0.5}}>{e}</span>,
    }))} />
}
function ShapesGame(){
  return <DropMatchGame levels={MATCH_LEVELS} intro="🔺 Glisse chaque forme dans son trou !" hint="Glisse (ou touche) la forme, puis son trou"
    makeItems={(lv)=> shuffleArr(SHAPE_KINDS).slice(0, lv.n).map(s=>({
      id:s.id,
      node:(sz)=> <ShapeSvg kind={s.id} color={s.color} size={sz} />,
      hole:(sz)=> <ShapeSvg kind={s.id} hole size={sz} />,
    }))} />
}

// ==================================================================
// 15) TRIE LES IMAGES — animaux, fruits, legumes, vehicules : chaque image dans son panier
// ==================================================================
const SORT_CATS = [
  { id:'animaux', label:'🐾', color:'#fb8c00', items:['🐶','🐱','🐮','🐷','🐸','🐔','🐘','🦒'] },
  { id:'fruits', label:'🍎', color:'#e53935', items:['🍎','🍌','🍇','🍓','🍊','🍉','🍍','🍐'] },
  { id:'vehicules', label:'🚗', color:'#1e88e5', items:['🚗','🚌','✈️','🚲','🚂','🚁','🚢','🛵'] },
  { id:'legumes', label:'🥕', color:'#43a047', items:['🥕','🌽','🍅','🥦','🍆','🥔','🧅','🌶️'] },
]
const SORT_IMG_LEVELS = [
  { label:'Petit', emoji:'🐣', cats:2, per:2 },
  { label:'Moyen', emoji:'🐥', cats:3, per:3 },
  { label:'Grand', emoji:'🐔', cats:4, per:3 },
]
function CategorySortGame(){
  const [level, setLevel] = useState(null)
  const [cats, setCats] = useState([])
  const [items, setItems] = useState([])
  const [placed, setPlaced] = useState({})
  const [selected, setSelected] = useState(null)
  const [shake, setShake] = useState(null)
  const start = (lv) => {
    const cs = shuffleArr(SORT_CATS).slice(0, lv.cats)
    const list = []
    cs.forEach(c=> shuffleArr(c.items).slice(0, lv.per).forEach(e=> list.push({ id:c.id+':'+e, cat:c.id, emoji:e })))
    setCats(cs); setItems(shuffleArr(list)); setPlaced({}); setSelected(null); setShake(null); setLevel(lv)
  }
  const tryPlace = (itemId, catId) => {
    const it = items.find(x=>x.id===itemId)
    if(!it || !catId) return
    if(it.cat === catId){ setPlaced(p=>({ ...p, [itemId]:true })); setSelected(null) }
    else { setShake(itemId); setTimeout(()=>setShake(null), 500) }
  }
  const { drag, begin } = useDragDrop({
    onDrop: (id, target) => tryPlace(id, target && target.startsWith('cat:') ? target.slice(4) : null),
    onTap: (id) => setSelected(s => s===id ? null : id),
  })
  if(!level) return (<div><KidStyles /><LevelPicker levels={SORT_IMG_LEVELS} onPick={start} intro="🧺 Range chaque image dans le bon panier !" /></div>)
  const remaining = items.filter(i=>!placed[i.id])
  const won = items.length>0 && remaining.length===0
  const dragged = drag ? items.find(x=>x.id===drag.id) : null
  return (
    <div style={{userSelect:'none', WebkitUserSelect:'none'}}>
      <KidStyles />
      <p style={{color:'rgba(255,255,255,0.8)', fontSize:13, margin:'0 0 10px', textAlign:'center'}}>Glisse (ou touche) l'image, puis son panier</p>
      <div style={{display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center', minHeight:76, padding:'10px 6px', background:'rgba(0,0,0,0.15)', borderRadius:14}}>
        {remaining.map(it=>(
          <div key={it.id} className={shake===it.id ? 'riusShake' : ''} onPointerDown={e=>begin(e, it.id)}
            style={{ touchAction:'none', cursor:'grab', padding:4, borderRadius:12, fontSize:52, lineHeight:1, opacity: drag && drag.id===it.id ? 0.25 : 1,
              outline: selected===it.id ? '3px solid '+C.gold : 'none', background: selected===it.id ? 'rgba(255,204,0,0.2)' : 'transparent' }}>{it.emoji}</div>
        ))}
        {won && <div style={{color:C.green, fontWeight:900, fontSize:16, alignSelf:'center'}}>Tout est rangé !</div>}
      </div>
      <div style={{display:'flex', flexWrap:'wrap', gap:12, justifyContent:'center', marginTop:16}}>
        {cats.map(c=>{
          const inside = items.filter(i=>i.cat===c.id && placed[i.id])
          return (
            <div key={c.id} data-drop={'cat:'+c.id} onClick={()=>{ if(selected) tryPlace(selected, c.id) }}
              style={{ width:128, minHeight:120, borderRadius:'8px 8px 20px 20px', background:c.color+'40', borderStyle:'solid', borderColor:c.color, borderWidth:'8px 3px 3px 3px',
                padding:6, boxSizing:'border-box', display:'flex', flexWrap:'wrap', gap:2, alignContent:'flex-start', justifyContent:'center', position:'relative', cursor:'pointer' }}>
              <div style={{width:'100%', textAlign:'center', fontSize:30, pointerEvents:'none'}}>{c.label}</div>
              {inside.map(it=>(<span key={it.id} className="riusPop" style={{fontSize:26, lineHeight:1, pointerEvents:'none'}}>{it.emoji}</span>))}
            </div>
          )
        })}
      </div>
      <DragGhost drag={drag}>{dragged ? <span style={{fontSize:52, lineHeight:1}}>{dragged.emoji}</span> : null}</DragGhost>
      {won && <GameResultBanner text="🎉 Bravo !" sub="Tout est bien rangé" color={C.green} onReplay={()=>start(level)} />}
      <div style={{textAlign:'center', marginTop:12}}>
        <button onClick={()=>setLevel(null)} style={{...btnStyle(), background:'rgba(255,255,255,0.15)', color:'white', padding:'8px 16px', fontSize:12}}>↩ Changer de niveau</button>
      </div>
    </div>
  )
}

// ==================================================================
// 16) BULLES MAGIQUES — on eclate les bulles qui montent
// ==================================================================
const BUBBLE_COLORS = ['#ff6f91','#ffc75f','#7bdff2','#b2f7a2','#c9a7ff','#ff9671']
function BubblesGame(){
  const GOAL = 15
  const [bubbles, setBubbles] = useState([])
  const [score, setScore] = useState(0)
  const [running, setRunning] = useState(false)
  const idRef = useRef(0)
  const popped = useRef(new Set())
  useEffect(()=>{
    if(!running) return
    const t = setInterval(()=>{
      setBubbles(b => b.length >= 9 ? b : [...b, { id:++idRef.current, x:4+Math.random()*78, size:56+Math.random()*34, color:BUBBLE_COLORS[Math.floor(Math.random()*BUBBLE_COLORS.length)], dur:5+Math.random()*3 }])
    }, 600)
    return () => clearInterval(t)
  }, [running])
  const pop = (id) => {
    if(popped.current.has(id) || !running) return
    popped.current.add(id)
    setBubbles(b=>b.map(x=>x.id===id ? { ...x, popped:true } : x))
    setScore(s=>{ const n = s+1; if(n>=GOAL) setRunning(false); return n })
    setTimeout(()=>setBubbles(b=>b.filter(x=>x.id!==id)), 260)
  }
  const gone = (id) => setBubbles(b=>b.filter(x=>x.id!==id))
  const restart = () => { popped.current = new Set(); setBubbles([]); setScore(0); setRunning(true) }
  const won = score >= GOAL
  return (
    <div style={{userSelect:'none', WebkitUserSelect:'none'}}>
      <style>{`
        @keyframes riusRise{from{transform:translateY(0)}to{transform:translateY(-520px)}}
        @keyframes riusBurst{from{transform:scale(1);opacity:1}to{transform:scale(1.7);opacity:0}}
      `}</style>
      <KidStyles />
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8, color:'white', fontWeight:800, fontSize:14}}>
        <span>🎈 Éclatées : {score} / {GOAL}</span>
        {!running && !won && <button onClick={restart} style={btnStyle()}>▶ Jouer</button>}
      </div>
      <div style={{position:'relative', height:420, overflow:'hidden', borderRadius:16, background:'linear-gradient(#4fb8ff,#c2f0ff)', boxShadow:'0 4px 14px rgba(0,0,0,0.3)', touchAction:'manipulation'}}>
        {!running && !won && <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', color:'#0f2040', fontWeight:900, fontSize:18, textAlign:'center', padding:20}}>Touche les bulles pour les éclater !</div>}
        {bubbles.map(b=>(
          <div key={b.id} data-bubble="1" onPointerDown={()=>pop(b.id)} onAnimationEnd={(e)=>{ if(e.animationName==='riusRise') gone(b.id) }}
            style={{ position:'absolute', bottom:-110, left:b.x+'%', width:b.size, height:b.size, cursor:'pointer', animation:`riusRise ${b.dur}s linear forwards` }}>
            <div style={{ width:'100%', height:'100%', borderRadius:'50%', background:`radial-gradient(circle at 30% 28%, #ffffffcc 0 12%, ${b.color}aa 40%, ${b.color} 100%)`,
              border:'2px solid rgba(255,255,255,0.8)', animation: b.popped ? 'riusBurst .26s ease-out forwards' : 'none' }} />
          </div>
        ))}
      </div>
      {won && <GameResultBanner text="🎉 Bravo !" sub={`${GOAL} bulles éclatées`} color={C.green} onReplay={restart} />}
    </div>
  )
}

// ==================================================================
// 17) LABYRINTHE — guider la souris jusqu'au fromage
// ==================================================================
const MAZE_LEVELS = [
  { label:'Petit', emoji:'🐣', n:6 },
  { label:'Moyen', emoji:'🐥', n:9 },
  { label:'Grand', emoji:'🐔', n:12 },
]
function makeMaze(n){
  const cells = Array.from({length:n*n}, ()=>({ n:true, e:true, s:true, w:true }))
  const seen = new Set([0]); const stack = [0]
  const dirs = [['n',0,-1,'s'],['e',1,0,'w'],['s',0,1,'n'],['w',-1,0,'e']]
  while(stack.length){
    const cur = stack[stack.length-1]; const cx = cur % n, cy = Math.floor(cur / n)
    const opts = shuffleArr(dirs).filter(([d,dx,dy])=>{ const nx=cx+dx, ny=cy+dy; return nx>=0 && ny>=0 && nx<n && ny<n && !seen.has(ny*n+nx) })
    if(!opts.length){ stack.pop(); continue }
    const [d,dx,dy,opp] = opts[0]; const ni = (cy+dy)*n + (cx+dx)
    cells[cur][d] = false; cells[ni][opp] = false; seen.add(ni); stack.push(ni)
  }
  return cells
}
function MazeGame(){
  const [level, setLevel] = useState(null)
  const [cells, setCells] = useState([])
  const [pos, setPos] = useState({ x:0, y:0 })
  const [moves, setMoves] = useState(0)
  const start = (lv) => { setLevel(lv); setCells(makeMaze(lv.n)); setPos({ x:0, y:0 }); setMoves(0) }
  const n = level ? level.n : 0
  const won = !!level && pos.x===n-1 && pos.y===n-1
  const move = (dir) => {
    if(!level || won) return
    const L = { up:'n', down:'s', left:'w', right:'e' }[dir]
    if(!L) return
    const cell = cells[pos.y*n + pos.x]
    if(!cell || cell[L]) return
    const d = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] }[dir]
    setPos({ x:pos.x+d[0], y:pos.y+d[1] }); setMoves(m=>m+1)
  }
  useKeyDown((e)=>{ const d = DIR_KEYS[e.key]; if(d){ e.preventDefault(); move(d) } }, !!level)
  const swipe = useSwipe(move)
  if(!level) return <LevelPicker levels={MAZE_LEVELS} onPick={start} intro="🐭 Guide la souris jusqu'au fromage !" />
  const S = 300, cs = S / n
  const lines = []
  cells.forEach((c,i)=>{
    const x = (i % n) * cs, y = Math.floor(i / n) * cs
    if(c.n) lines.push(<line key={i+'n'} x1={x} y1={y} x2={x+cs} y2={y} />)
    if(c.w) lines.push(<line key={i+'w'} x1={x} y1={y} x2={x} y2={y+cs} />)
    if(i % n === n-1 && c.e) lines.push(<line key={i+'e'} x1={x+cs} y1={y} x2={x+cs} y2={y+cs} />)
    if(Math.floor(i / n) === n-1 && c.s) lines.push(<line key={i+'s'} x1={x} y1={y+cs} x2={x+cs} y2={y+cs} />)
  })
  const emo = (cx, cy, e) => <text x={cx*cs + cs/2} y={cy*cs + cs/2 + 1} textAnchor="middle" dominantBaseline="central" fontSize={cs*0.68}>{e}</text>
  return (
    <div style={{userSelect:'none', WebkitUserSelect:'none', textAlign:'center'}}>
      <p style={{color:'rgba(255,255,255,0.8)', fontSize:13, margin:'0 0 10px'}}>Utilise les flèches (ou glisse le doigt sur le labyrinthe)</p>
      <div {...swipe} style={{ ...swipe.style, maxWidth:340, margin:'0 auto', background:'#fff8e1', borderRadius:12, padding:6, boxShadow:'0 4px 14px rgba(0,0,0,0.3)' }}>
        <svg viewBox={`-3 -3 ${S+6} ${S+6}`} width="100%" style={{display:'block'}}>
          <rect x={(n-1)*cs} y={(n-1)*cs} width={cs} height={cs} fill="#c8f7c5" />
          <g stroke="#3b4a7a" strokeWidth="3" strokeLinecap="round">{lines}</g>
          {emo(n-1, n-1, '🧀')}
          {emo(pos.x, pos.y, '🐭')}
        </svg>
      </div>
      <DirPad onDir={move} />
      <div style={{color:'rgba(255,255,255,0.7)', fontSize:12, marginTop:10}}>Pas : {moves}</div>
      {won && <GameResultBanner text="🎉 Bravo !" sub={`Fromage trouvé en ${moves} pas`} color={C.green} onReplay={()=>start(level)} />}
      <div style={{marginTop:10}}>
        <button onClick={()=>start(level)} style={btnStyle()}>🔄 Nouveau labyrinthe</button>{' '}
        <button onClick={()=>setLevel(null)} style={{...btnStyle(), background:'rgba(255,255,255,0.15)', color:'white'}}>Changer de niveau</button>
      </div>
    </div>
  )
}

// ==================================================================
// 18) COMBIEN Y EN A-T-IL ? — compter les objets et toucher le bon nombre
// ==================================================================
const COUNT_LEVELS = [
  { label:'Petit', emoji:'🐣', max:5 },
  { label:'Moyen', emoji:'🐥', max:8 },
  { label:'Grand', emoji:'🐔', max:12 },
]
const COUNT_OBJECTS = ['🍎','🐟','⭐','🎈','🚗','🐥','🌸','🍪','🐞','⚽']
const ROUNDS = 5
function makeCountRound(lv){
  const n = 1 + Math.floor(Math.random()*lv.max)
  const others = shuffleArr(Array.from({length:lv.max}, (_,i)=>i+1).filter(v=>v!==n)).slice(0, 2)
  return { n, emoji:COUNT_OBJECTS[Math.floor(Math.random()*COUNT_OBJECTS.length)], choices: shuffleArr([n, ...others]) }
}
function CountingGame(){
  const [level, setLevel] = useState(null)
  const [round, setRound] = useState(0)
  const [q, setQ] = useState(null)
  const [score, setScore] = useState(0)
  const [tries, setTries] = useState(0)
  const [shake, setShake] = useState(null)
  const [locked, setLocked] = useState(false)
  const start = (lv) => { setLevel(lv); setRound(0); setScore(0); setTries(0); setLocked(false); setQ(makeCountRound(lv)) }
  const answer = (v) => {
    if(locked) return
    if(v === q.n){
      setLocked(true)
      if(tries === 0) setScore(s=>s+1)
      setTimeout(()=>{ setRound(r=>r+1); setTries(0); setLocked(false); setQ(makeCountRound(level)) }, 600)
    } else { setTries(t=>t+1); setShake(v); setTimeout(()=>setShake(null), 500) }
  }
  if(!level) return (<div><KidStyles /><LevelPicker levels={COUNT_LEVELS} onPick={start} intro="🧮 Compte les images, puis touche le bon nombre !" /></div>)
  if(round >= ROUNDS) return (
    <div><KidStyles /><GameResultBanner text="🎉 Bravo !" sub={`${score} / ${ROUNDS} du premier coup`} color={C.green} onReplay={()=>start(level)} />
      <div style={{textAlign:'center', marginTop:12}}><button onClick={()=>setLevel(null)} style={{...btnStyle(), background:'rgba(255,255,255,0.15)', color:'white'}}>Changer de niveau</button></div></div>
  )
  return (
    <div style={{textAlign:'center'}}>
      <KidStyles />
      <div style={{color:'rgba(255,255,255,0.75)', fontSize:12, marginBottom:8}}>Question {round+1} / {ROUNDS}</div>
      <div key={round} className="riusPop" style={{display:'flex', flexWrap:'wrap', gap:6, justifyContent:'center', alignContent:'center', minHeight:150, padding:14, background:'rgba(255,255,255,0.12)', borderRadius:16, maxWidth:420, margin:'0 auto'}}>
        {Array.from({length:q.n}, (_,i)=>(<span key={i} style={{fontSize:44, lineHeight:1}}>{q.emoji}</span>))}
      </div>
      <div style={{display:'flex', gap:14, justifyContent:'center', marginTop:20}}>
        {q.choices.map(v=>(
          <button key={v} onClick={()=>answer(v)} className={shake===v ? 'riusShake' : ''}
            style={{ ...btnStyle(), width:76, height:76, fontSize:34, borderRadius:20, padding:0, background: locked && v===q.n ? C.green : C.gold }}>{v}</button>
        ))}
      </div>
    </div>
  )
}

// ==================================================================
// 19) TROUVE L'INTRUS — une image est differente des autres
// ==================================================================
const ODD_EASY = [['🍎','🐶'],['🚗','🍌'],['🐱','⚽'],['🌸','🚲'],['🐟','🍇'],['⭐','🐔']]
const ODD_HARD = [['🍎','🍅'],['🐶','🐺'],['🐱','🐯'],['🌞','🌕'],['⚽','🏀'],['🚗','🚕'],['🐥','🐤'],['🍊','🥭'],['🐻','🐼'],['🍓','🍒']]
const ODD_LEVELS = [
  { label:'Petit', emoji:'🐣', cells:6, pairs:ODD_EASY, cols:3 },
  { label:'Moyen', emoji:'🐥', cells:9, pairs:ODD_HARD, cols:3 },
  { label:'Grand', emoji:'🐔', cells:12, pairs:ODD_HARD, cols:4 },
]
function makeOddRound(lv){
  const pair = lv.pairs[Math.floor(Math.random()*lv.pairs.length)]
  const flip = Math.random() < 0.5
  const [main, odd] = flip ? [pair[1], pair[0]] : pair
  const oddAt = Math.floor(Math.random()*lv.cells)
  return { grid: Array.from({length:lv.cells}, (_,i)=> i===oddAt ? odd : main), oddAt }
}
function OddOneOutGame(){
  const [level, setLevel] = useState(null)
  const [round, setRound] = useState(0)
  const [q, setQ] = useState(null)
  const [score, setScore] = useState(0)
  const [tries, setTries] = useState(0)
  const [shake, setShake] = useState(null)
  const [locked, setLocked] = useState(false)
  const start = (lv) => { setLevel(lv); setRound(0); setScore(0); setTries(0); setLocked(false); setQ(makeOddRound(lv)) }
  const pick = (i) => {
    if(locked) return
    if(i === q.oddAt){
      setLocked(true)
      if(tries === 0) setScore(s=>s+1)
      setTimeout(()=>{ setRound(r=>r+1); setTries(0); setLocked(false); setQ(makeOddRound(level)) }, 600)
    } else { setTries(t=>t+1); setShake(i); setTimeout(()=>setShake(null), 500) }
  }
  if(!level) return (<div><KidStyles /><LevelPicker levels={ODD_LEVELS} onPick={start} intro="🕵️ Une image est différente : touche-la !" /></div>)
  if(round >= ROUNDS) return (
    <div><KidStyles /><GameResultBanner text="🎉 Bravo !" sub={`${score} / ${ROUNDS} du premier coup`} color={C.green} onReplay={()=>start(level)} />
      <div style={{textAlign:'center', marginTop:12}}><button onClick={()=>setLevel(null)} style={{...btnStyle(), background:'rgba(255,255,255,0.15)', color:'white'}}>Changer de niveau</button></div></div>
  )
  return (
    <div style={{textAlign:'center'}}>
      <KidStyles />
      <div style={{color:'rgba(255,255,255,0.75)', fontSize:12, marginBottom:8}}>Question {round+1} / {ROUNDS}</div>
      <div key={round} className="riusPop" style={{display:'grid', gridTemplateColumns:`repeat(${level.cols}, 76px)`, gap:10, justifyContent:'center', padding:14, background:'rgba(255,255,255,0.12)', borderRadius:16, width:'fit-content', margin:'0 auto'}}>
        {q.grid.map((e,i)=>(
          <button key={i} data-odd={i===q.oddAt ? '1' : undefined} onClick={()=>pick(i)} className={shake===i ? 'riusShake' : ''}
            style={{ width:76, height:76, fontSize:42, lineHeight:1, borderRadius:16, border:'2px solid rgba(255,255,255,0.3)', background: locked && i===q.oddAt ? C.green : 'rgba(255,255,255,0.9)', cursor:'pointer', padding:0 }}>{e}</button>
        ))}
      </div>
    </div>
  )
}

// ==================================================================
// 20) COURSE DE VOITURES — on change de voie pour eviter les cones et prendre les etoiles
// ==================================================================
const RACE_W = 320, RACE_H = 480, ROAD_L = 20, ROAD_R = 300, CAR_Y = 400
const laneX = (i) => ROAD_L + (ROAD_R-ROAD_L)/3*(i+0.5)
function roundRectPath(ctx, x, y, w, h, r){ ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h) }
function drawTopCar(ctx, cx, cy, color){
  const w = 36, h = 64, l = cx-w/2, t = cy-h/2
  ctx.fillStyle = '#263238'
  ;[[l-3, t+h*0.14],[l+w-3, t+h*0.14],[l-3, t+h*0.66],[l+w-3, t+h*0.66]].forEach(([x,y])=>ctx.fillRect(x, y, 6, h*0.2))
  ctx.fillStyle = color; roundRectPath(ctx, l, t, w, h, 10); ctx.fill()
  ctx.fillStyle = '#cfe9ff'; ctx.fillRect(l+w*0.15, t+h*0.22, w*0.7, h*0.17); ctx.fillRect(l+w*0.15, t+h*0.64, w*0.7, h*0.13)
  ctx.fillStyle = 'rgba(0,0,0,0.14)'; ctx.fillRect(l+w*0.15, t+h*0.42, w*0.7, h*0.2)
}
function drawCone(ctx, cx, cy){
  ctx.fillStyle = '#37474f'; ctx.fillRect(cx-19, cy+16, 38, 6)
  ctx.fillStyle = '#ff7043'; ctx.beginPath(); ctx.moveTo(cx, cy-22); ctx.lineTo(cx+16, cy+17); ctx.lineTo(cx-16, cy+17); ctx.closePath(); ctx.fill()
  ctx.fillStyle = '#fff'; ctx.fillRect(cx-10, cy-1, 20, 7)
}
function drawStarShape(ctx, cx, cy, r){
  ctx.fillStyle = '#ffd93b'; ctx.strokeStyle = '#e0a800'; ctx.lineWidth = 2; ctx.beginPath()
  for(let i=0;i<10;i++){ const a = -Math.PI/2 + i*Math.PI/5; const rr = i%2 ? r*0.45 : r; ctx.lineTo(cx+Math.cos(a)*rr, cy+Math.sin(a)*rr) }
  ctx.closePath(); ctx.fill(); ctx.stroke()
}
function CarRaceGame(){
  const canvasRef = useRef(null)
  const g = useRef(null)
  const phaseRef = useRef('ready')
  const [phase, setPhase] = useState('ready')
  const [hud, setHud] = useState({ stars:0, lives:3 })
  const fresh = () => ({ lane:1, x:laneX(1), objs:[], speed:3.4, spawn:40, road:0, stars:0, lives:3, inv:0, id:0 })
  if(!g.current) g.current = fresh()

  const draw = () => {
    const c = canvasRef.current; if(!c) return
    const ctx = c.getContext('2d'), s = g.current
    ctx.fillStyle = '#6bc46d'; ctx.fillRect(0, 0, RACE_W, RACE_H)
    ctx.fillStyle = '#4e5560'; ctx.fillRect(ROAD_L, 0, ROAD_R-ROAD_L, RACE_H)
    ctx.fillStyle = '#fff'; ctx.fillRect(ROAD_L-3, 0, 4, RACE_H); ctx.fillRect(ROAD_R-1, 0, 4, RACE_H)
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    for(let k=1;k<3;k++){ const x = ROAD_L + (ROAD_R-ROAD_L)/3*k - 2; for(let y=-48+s.road; y<RACE_H; y+=48) ctx.fillRect(x, y, 4, 26) }
    s.objs.forEach(o=>{
      const ox = laneX(o.lane)
      if(o.type==='cone') drawCone(ctx, ox, o.y)
      else if(o.type==='star') drawStarShape(ctx, ox, o.y, 20)
      else drawTopCar(ctx, ox, o.y, o.color)
    })
    if(!(s.inv > 0 && Math.floor(s.inv/6)%2===1)) drawTopCar(ctx, s.x, CAR_Y, '#e53935')
  }
  const step = (dt) => {
    const s = g.current; let changed = false
    s.road = (s.road + s.speed*dt) % 48
    s.x += (laneX(s.lane) - s.x) * Math.min(1, 0.22*dt)
    s.spawn -= dt
    if(s.spawn <= 0){
      if(s.objs.some(o=>o.y < 120)){ s.spawn = 6 }
      else {
        const r = Math.random()
        s.objs.push({ id:++s.id, lane:Math.floor(Math.random()*3), y:-50, type: r<0.42 ? 'star' : r<0.72 ? 'cone' : 'car', color:['#1e88e5','#fdd835','#43a047','#8e24aa'][Math.floor(Math.random()*4)] })
        s.spawn = Math.max(34, 62 - s.stars*1.2) + Math.random()*20
      }
    }
    s.inv = Math.max(0, s.inv - dt)
    s.objs.forEach(o=>{
      o.y += (s.speed - (o.type==='car' ? 1.2 : 0)) * dt
      if(o.hit) return
      if(Math.abs(laneX(o.lane) - s.x) < 28 && Math.abs(o.y - CAR_Y) < 42){
        o.hit = true
        if(o.type==='star'){ s.stars++; changed = true }
        else if(s.inv <= 0){ s.lives--; s.inv = 90; changed = true }
      }
    })
    s.objs = s.objs.filter(o=>!o.hit && o.y < RACE_H+60)
    s.speed = 3.4 + Math.min(3.2, s.stars*0.14)
    if(changed) setHud({ stars:s.stars, lives:s.lives })
    if(s.lives <= 0){ phaseRef.current = 'over'; setPhase('over') }
  }
  useEffect(()=>{ draw() }, [phase])
  useEffect(()=>{
    if(phase !== 'play') return
    let raf, last = null
    const loop = (t) => {
      if(last === null) last = t
      const dt = Math.min(2.5, (t-last)/16.667); last = t
      step(dt); draw()
      if(phaseRef.current === 'play') raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [phase])
  const go = (dir) => { const s = g.current; if(phaseRef.current!=='play') return; s.lane = Math.max(0, Math.min(2, s.lane + (dir==='left' ? -1 : 1))) }
  useKeyDown((e)=>{ const d = DIR_KEYS[e.key]; if(d==='left' || d==='right'){ e.preventDefault(); go(d) } }, true)
  const startGame = () => { g.current = fresh(); setHud({ stars:0, lives:3 }); phaseRef.current = 'play'; setPhase('play') }
  const onCanvas = (e) => {
    if(phaseRef.current !== 'play'){ return }
    const r = e.currentTarget.getBoundingClientRect()
    go(e.clientX - r.left < r.width/2 ? 'left' : 'right')
  }
  return (
    <div style={{textAlign:'center', userSelect:'none', WebkitUserSelect:'none'}}>
      <div style={{display:'flex', justifyContent:'space-between', maxWidth:360, margin:'0 auto 8px', color:'white', fontWeight:800, fontSize:15}}>
        <span>{'❤️'.repeat(Math.max(0, hud.lives))}{'🖤'.repeat(Math.max(0, 3-hud.lives))}</span><span>⭐ {hud.stars}</span>
      </div>
      <div style={{position:'relative', maxWidth:360, margin:'0 auto'}}>
        <canvas ref={canvasRef} width={RACE_W} height={RACE_H} onPointerDown={onCanvas}
          style={{width:'100%', height:'auto', display:'block', borderRadius:14, boxShadow:'0 4px 14px rgba(0,0,0,0.35)', touchAction:'manipulation'}} />
        {phase==='ready' && (
          <div style={{position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'rgba(15,32,64,0.55)', borderRadius:14, padding:20, gap:14}}>
            <div style={{color:'white', fontWeight:800, fontSize:15}}>Touche à gauche ou à droite pour changer de voie.<br />Prends les ⭐ et évite les 🚧 et les voitures !</div>
            <button onClick={startGame} style={{...btnStyle(), fontSize:18, padding:'14px 30px'}}>▶ Démarrer</button>
          </div>
        )}
      </div>
      <div style={{display:'flex', gap:14, justifyContent:'center', marginTop:12}}>
        <button onClick={()=>go('left')} style={{...btnStyle(), width:110, height:56, fontSize:24}} aria-label="Gauche">◀</button>
        <button onClick={()=>go('right')} style={{...btnStyle(), width:110, height:56, fontSize:24}} aria-label="Droite">▶</button>
      </div>
      {phase==='over' && <GameResultBanner text="🏁 Bien joué !" sub={`${hud.stars} étoile${hud.stars>1?'s':''} ramassée${hud.stars>1?'s':''}`} color={C.green} onReplay={startGame} />}
    </div>
  )
}

// ==================================================================
// 21) ATTRAPE LES FRUITS — on deplace le panier (doigt, souris ou fleches) pendant 30 secondes
// ==================================================================
const FR_W = 320, FR_H = 420, FR_TIME = 30
const FRUIT_LIST = ['🍎','🍌','🍇','🍓','🍊','🍉','🍐','🍒']
function CatchFruitsGame(){
  const canvasRef = useRef(null)
  const g = useRef(null)
  const phaseRef = useRef('ready')
  const [phase, setPhase] = useState('ready')
  const [hud, setHud] = useState({ score:0, left:FR_TIME })
  const fresh = () => ({ x:FR_W/2, target:FR_W/2, fruits:[], score:0, left:FR_TIME, spawn:10 })
  if(!g.current) g.current = fresh()
  const draw = () => {
    const c = canvasRef.current; if(!c) return
    const ctx = c.getContext('2d'), s = g.current
    const grd = ctx.createLinearGradient(0, 0, 0, FR_H); grd.addColorStop(0, '#7fd3ff'); grd.addColorStop(1, '#d9f6ff')
    ctx.fillStyle = grd; ctx.fillRect(0, 0, FR_W, FR_H)
    ctx.fillStyle = '#7ed957'; ctx.fillRect(0, FR_H-16, FR_W, 16)
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '34px serif'
    s.fruits.forEach(f=>ctx.fillText(f.e, f.x, f.y))
    ctx.font = '58px serif'; ctx.fillText('🧺', s.x, FR_H-44)
  }
  const step = (dt) => {
    const s = g.current
    s.left = Math.max(0, s.left - dt/60)
    s.x += (s.target - s.x) * Math.min(1, 0.3*dt)
    s.spawn -= dt
    if(s.spawn <= 0){ s.fruits.push({ e:FRUIT_LIST[Math.floor(Math.random()*FRUIT_LIST.length)], x:24+Math.random()*(FR_W-48), y:-20, v:2.1+Math.random()*1.4 }); s.spawn = 26 + Math.random()*22 }
    let changed = false
    s.fruits.forEach(f=>{
      f.y += f.v*dt
      if(!f.done && f.y > FR_H-78 && f.y < FR_H-22 && Math.abs(f.x - s.x) < 44){ f.done = true; s.score++; changed = true }
    })
    s.fruits = s.fruits.filter(f=>!f.done && f.y < FR_H+30)
    const secs = Math.ceil(s.left)
    if(changed || secs !== hud.left) setHud({ score:s.score, left:secs })
    if(s.left <= 0){ phaseRef.current = 'over'; setPhase('over'); setHud({ score:s.score, left:0 }) }
  }
  useEffect(()=>{ draw() }, [phase])
  useEffect(()=>{
    if(phase !== 'play') return
    let raf, last = null
    const loop = (t) => {
      if(last === null) last = t
      const dt = Math.min(2.5, (t-last)/16.667); last = t
      step(dt); draw()
      if(phaseRef.current === 'play') raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [phase])
  const setTarget = (clientX, el) => { const r = el.getBoundingClientRect(); g.current.target = Math.max(28, Math.min(FR_W-28, (clientX - r.left) * FR_W / r.width)) }
  useKeyDown((e)=>{ const d = DIR_KEYS[e.key]; if(d==='left' || d==='right'){ e.preventDefault(); g.current.target = Math.max(28, Math.min(FR_W-28, g.current.target + (d==='left' ? -48 : 48))) } }, true)
  const startGame = () => { g.current = fresh(); setHud({ score:0, left:FR_TIME }); phaseRef.current = 'play'; setPhase('play') }
  return (
    <div style={{textAlign:'center', userSelect:'none', WebkitUserSelect:'none'}}>
      <div style={{display:'flex', justifyContent:'space-between', maxWidth:360, margin:'0 auto 8px', color:'white', fontWeight:800, fontSize:15}}>
        <span>🍎 {hud.score}</span><span>⏱️ {hud.left} s</span>
      </div>
      <div style={{position:'relative', maxWidth:360, margin:'0 auto'}}>
        <canvas ref={canvasRef} width={FR_W} height={FR_H}
          onPointerDown={e=>{ if(phaseRef.current==='play') setTarget(e.clientX, e.currentTarget) }}
          onPointerMove={e=>{ if(phaseRef.current==='play') setTarget(e.clientX, e.currentTarget) }}
          style={{width:'100%', height:'auto', display:'block', borderRadius:14, boxShadow:'0 4px 14px rgba(0,0,0,0.35)', touchAction:'none'}} />
        {phase==='ready' && (
          <div style={{position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'rgba(15,32,64,0.5)', borderRadius:14, padding:20, gap:14}}>
            <div style={{color:'white', fontWeight:800, fontSize:15}}>Glisse ton doigt pour déplacer le panier et attraper un maximum de fruits !</div>
            <button onClick={startGame} style={{...btnStyle(), fontSize:18, padding:'14px 30px'}}>▶ Démarrer</button>
          </div>
        )}
      </div>
      {phase==='over' && <GameResultBanner text="🎉 Bravo !" sub={`${hud.score} fruit${hud.score>1?'s':''} attrapé${hud.score>1?'s':''}`} color={C.green} onReplay={startGame} />}
    </div>
  )
}

// ==================================================================
// 22) 2048 — pour les plus grands : on fusionne les tuiles identiques (fleches ou glissement)
// ==================================================================
const T2048_COLORS = { 2:'#eee4da', 4:'#ede0c8', 8:'#f2b179', 16:'#f59563', 32:'#f67c5f', 64:'#f65e3b', 128:'#edcf72', 256:'#edcc61', 512:'#edc850', 1024:'#edc53f', 2048:'#edc22e' }
function addTile2048(g){
  const empt = []
  g.forEach((r,y)=>r.forEach((v,x)=>{ if(!v) empt.push([x,y]) }))
  if(!empt.length) return g
  const [x,y] = empt[Math.floor(Math.random()*empt.length)]
  const ng = g.map(r=>[...r]); ng[y][x] = Math.random() < 0.9 ? 2 : 4
  return ng
}
function slideLeft2048(row){
  const vals = row.filter(Boolean); const out = []; let score = 0
  for(let i=0;i<vals.length;i++){
    if(vals[i] === vals[i+1]){ out.push(vals[i]*2); score += vals[i]*2; i++ } else out.push(vals[i])
  }
  while(out.length < 4) out.push(0)
  return { row:out, score }
}
function move2048(g, dir){
  const ng = g.map(r=>[...r]); let total = 0, moved = false
  const getLine = (i) => dir==='left' ? [...ng[i]] : dir==='right' ? [...ng[i]].reverse() : dir==='up' ? ng.map(r=>r[i]) : ng.map(r=>r[i]).reverse()
  const setLine = (i, line) => {
    const L = (dir==='right' || dir==='down') ? [...line].reverse() : line
    if(dir==='left' || dir==='right') ng[i] = L
    else L.forEach((v,y)=>{ ng[y][i] = v })
  }
  for(let i=0;i<4;i++){
    const before = getLine(i); const { row, score } = slideLeft2048(before)
    if(row.some((v,k)=>v !== before[k])) moved = true
    total += score; setLine(i, row)
  }
  return { grid:ng, score:total, moved }
}
const canMove2048 = (g) => ['left','right','up','down'].some(d=>move2048(g, d).moved)
const new2048 = () => addTile2048(addTile2048(Array.from({length:4}, ()=>Array(4).fill(0))))
function Game2048(){
  const [grid, setGrid] = useState(new2048)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(()=>{ try { return Number(localStorage.getItem('rius_2048_best')) || 0 } catch { return 0 } })
  const over = !canMove2048(grid)
  const reached = grid.some(r=>r.some(v=>v>=2048))
  const play = (dir) => {
    if(over) return
    const r = move2048(grid, dir)
    if(!r.moved) return
    const ns = score + r.score
    setGrid(addTile2048(r.grid)); setScore(ns)
    if(ns > best){ setBest(ns); try { localStorage.setItem('rius_2048_best', String(ns)) } catch {} }
  }
  useKeyDown((e)=>{ const d = DIR_KEYS[e.key]; if(d && e.key.startsWith('Arrow')){ e.preventDefault(); play(d) } }, true)
  const swipe = useSwipe(play)
  const restart = () => { setGrid(new2048()); setScore(0) }
  return (
    <div style={{textAlign:'center', userSelect:'none', WebkitUserSelect:'none'}}>
      <div style={{display:'flex', justifyContent:'center', gap:12, marginBottom:10, color:'white', fontWeight:800, fontSize:14}}>
        <span style={{background:'rgba(0,0,0,0.25)', borderRadius:10, padding:'6px 14px'}}>Score {score}</span>
        <span style={{background:'rgba(0,0,0,0.25)', borderRadius:10, padding:'6px 14px'}}>Meilleur {best}</span>
      </div>
      <div {...swipe} style={{ ...swipe.style, display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, maxWidth:340, margin:'0 auto', background:'#bbada0', padding:8, borderRadius:12 }}>
        {grid.flat().map((v,i)=>(
          <div key={i} data-tile={v} style={{ aspectRatio:'1', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900,
            fontSize: v>=1024 ? 22 : v>=128 ? 26 : 30, background: v ? (T2048_COLORS[v] || '#3c3a32') : 'rgba(238,228,218,0.35)', color: v<=4 ? '#776e65' : '#fff' }}>{v || ''}</div>
        ))}
      </div>
      <p style={{color:'rgba(255,255,255,0.7)', fontSize:12, margin:'10px 0 0'}}>Flèches du clavier ou glisse le doigt sur la grille</p>
      {(over || reached) && <GameResultBanner text={reached ? '🎉 2048 atteint !' : 'Partie terminée'} sub={`Score : ${score}`} color={reached ? C.green : C.gold} onReplay={restart} />}
      {!over && !reached && <div style={{marginTop:10}}><button onClick={restart} style={btnStyle()}>🔄 Nouvelle partie</button></div>}
    </div>
  )
}

// ==================================================================
// 23) TABLEAU MAGIQUE — dessiner au doigt
// ==================================================================
const PAD_COLORS = ['#e53935','#fb8c00','#fdd835','#7ed957','#43a047','#26c6da','#1e88e5','#8e24aa','#ec407a','#8d6e63','#263238','#ffffff']
function DrawingPad(){
  const ref = useRef(null)
  const drawing = useRef(false)
  const last = useRef(null)
  const [color, setColor] = useState(PAD_COLORS[0])
  const [size, setSize] = useState(10)
  const clear = () => { const c = ref.current; const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height) }
  useEffect(()=>{ clear() }, [])
  const pos = (e) => { const r = ref.current.getBoundingClientRect(); return { x:(e.clientX-r.left)*ref.current.width/r.width, y:(e.clientY-r.top)*ref.current.height/r.height } }
  const down = (e) => {
    drawing.current = true
    const p = pos(e); last.current = p
    const ctx = ref.current.getContext('2d'); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(p.x, p.y, size/2, 0, Math.PI*2); ctx.fill()
    try { ref.current.setPointerCapture(e.pointerId) } catch {}
  }
  const move = (e) => {
    if(!drawing.current) return
    const p = pos(e); const ctx = ref.current.getContext('2d')
    ctx.strokeStyle = color; ctx.lineWidth = size; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    ctx.beginPath(); ctx.moveTo(last.current.x, last.current.y); ctx.lineTo(p.x, p.y); ctx.stroke(); last.current = p
  }
  const up = () => { drawing.current = false }
  const save = () => { const a = document.createElement('a'); a.href = ref.current.toDataURL('image/png'); a.download = 'mon-dessin-rius.png'; a.click() }
  return (
    <div style={{textAlign:'center', userSelect:'none', WebkitUserSelect:'none'}}>
      <canvas ref={ref} width={320} height={320} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
        style={{width:'100%', maxWidth:400, height:'auto', display:'block', margin:'0 auto', background:'#fff', borderRadius:12, boxShadow:'0 4px 14px rgba(0,0,0,0.3)', touchAction:'none', cursor:'crosshair'}} />
      <div style={{display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center', marginTop:12}}>
        {PAD_COLORS.map(c=>(
          <button key={c} onClick={()=>setColor(c)} aria-label={'Couleur '+c}
            style={{ width:38, height:38, borderRadius:'50%', background:c, cursor:'pointer', padding:0, fontSize:16,
              border: color===c ? '4px solid '+C.gold : '3px solid rgba(255,255,255,0.6)', transform: color===c ? 'scale(1.15)' : 'none' }}>{c==='#ffffff' ? '🧽' : ''}</button>
        ))}
      </div>
      <div style={{display:'flex', gap:10, justifyContent:'center', alignItems:'center', marginTop:12, flexWrap:'wrap'}}>
        {[[5,'Fin'],[10,'Moyen'],[20,'Gros']].map(([s,l])=>(
          <button key={s} onClick={()=>setSize(s)} style={{...btnStyle(), padding:'8px 14px', fontSize:12, background: size===s ? C.gold : 'rgba(255,255,255,0.15)', color: size===s ? '#0f2040' : 'white'}}>{l}</button>
        ))}
        <button onClick={clear} style={btnStyle()}>🗑️ Effacer</button>
        <button onClick={save} style={{...btnStyle(), background:'rgba(255,255,255,0.15)', color:'white'}}>💾 Enregistrer</button>
      </div>
    </div>
  )
}

// ==================================================================
// 24) ECRITURE MAGIQUE — une lettre ou un chiffre grise se colore au passage du doigt
// ==================================================================
const TRACE_SETS = [
  { id:'chiffres', label:'Chiffres', emoji:'🔢', glyphs:'0123456789'.split('') },
  { id:'majuscules', label:'Lettres A-Z', emoji:'🔤', glyphs:'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('') },
  { id:'minuscules', label:'Lettres a-z', emoji:'🔡', glyphs:'abcdefghijklmnopqrstuvwxyz'.split('') },
]
const TRACE_SIZE = 320
function drawTraceGlyph(ctx, g, fill){
  const lower = /[a-z]/.test(g)
  ctx.font = `900 ${lower ? 255 : 250}px "Arial Rounded MT Bold","Trebuchet MS",Arial,sans-serif`
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillStyle = fill; ctx.strokeStyle = fill; ctx.lineWidth = 8; ctx.lineJoin = 'round'
  const y = TRACE_SIZE/2 + (lower ? (/[gjpqy]/.test(g) ? -22 : 14) : 10)
  ctx.strokeText(g, TRACE_SIZE/2, y); ctx.fillText(g, TRACE_SIZE/2, y)
}
function TraceGame(){
  const S = TRACE_SIZE
  const [setId, setSetId] = useState('chiffres')
  const [glyph, setGlyph] = useState(null)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const view = useRef(null), mask = useRef(null), paint = useRef(null), tmp = useRef(null)
  const maskAlpha = useRef(null), total = useRef(1)
  const drawing = useRef(false), last = useRef(null), hue = useRef(0), checkedAt = useRef(0), doneRef = useRef(false)
  const set = TRACE_SETS.find(s=>s.id===setId)
  const mk = () => { const c = document.createElement('canvas'); c.width = S; c.height = S; return c }

  const paintView = () => {
    const v = view.current; if(!v || !glyph || !tmp.current) return
    const ctx = v.getContext('2d')
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = '#fffdf5'; ctx.fillRect(0, 0, S, S)
    if(doneRef.current){
      const grd = ctx.createLinearGradient(0, 0, S, S)
      const cols = ['#e53935','#fb8c00','#fdd835','#43a047','#1e88e5','#8e24aa']
      cols.forEach((c,i)=>grd.addColorStop(i/(cols.length-1), c))
      drawTraceGlyph(ctx, glyph, grd); return
    }
    drawTraceGlyph(ctx, glyph, '#d5d9e2')
    const t = tmp.current.getContext('2d')
    t.globalCompositeOperation = 'source-over'; t.clearRect(0, 0, S, S); t.drawImage(paint.current, 0, 0)
    t.globalCompositeOperation = 'destination-in'; t.drawImage(mask.current, 0, 0)
    t.globalCompositeOperation = 'source-over'
    ctx.drawImage(tmp.current, 0, 0)
  }
  useEffect(()=>{
    if(!glyph) return
    mask.current = mk(); paint.current = mk(); tmp.current = mk()
    tmp.current.getContext('2d', { willReadFrequently:true })
    const mc = mask.current.getContext('2d', { willReadFrequently:true })
    drawTraceGlyph(mc, glyph, '#000')
    const d = mc.getImageData(0, 0, S, S).data
    const a = new Uint8Array(S*S); let tot = 0
    for(let i=0;i<a.length;i++){ if(d[i*4+3] > 128){ a[i] = 1; tot++ } }
    maskAlpha.current = a; total.current = Math.max(1, tot)
    doneRef.current = false; drawing.current = false
    paintView()
  }, [glyph])

  const coverage = () => {
    const d = tmp.current.getContext('2d').getImageData(0, 0, S, S).data, m = maskAlpha.current
    let cov = 0
    for(let i=0;i<m.length;i++){ if(m[i] && d[i*4+3] > 128) cov++ }
    return cov / total.current
  }
  const check = (force) => {
    const now = performance.now()
    if(!force && now - checkedAt.current < 120) return
    checkedAt.current = now
    const p = coverage(); setProgress(p)
    if(p >= 0.85 && !doneRef.current){ doneRef.current = true; setDone(true); paintView() }
  }
  const pos = (e) => { const r = view.current.getBoundingClientRect(); return { x:(e.clientX-r.left)*S/r.width, y:(e.clientY-r.top)*S/r.height } }
  const stroke = (a, b) => {
    const c = paint.current.getContext('2d')
    hue.current = (hue.current + Math.hypot(b.x-a.x, b.y-a.y)*1.1) % 360
    c.strokeStyle = c.fillStyle = `hsl(${hue.current},90%,55%)`
    c.lineWidth = 44; c.lineCap = 'round'
    c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke()
    c.beginPath(); c.arc(b.x, b.y, 22, 0, Math.PI*2); c.fill()
    paintView()
  }
  const down = (e) => {
    if(doneRef.current) return
    drawing.current = true; last.current = pos(e); stroke(last.current, last.current)
    try { view.current.setPointerCapture(e.pointerId) } catch {}
  }
  const move = (e) => { if(!drawing.current || doneRef.current) return; const p = pos(e); stroke(last.current, p); last.current = p; check(false) }
  const up = () => { if(!drawing.current) return; drawing.current = false; check(true) }
  const restart = () => {
    paint.current.getContext('2d').clearRect(0, 0, S, S)
    doneRef.current = false; setDone(false); setProgress(0); paintView()
  }
  const next = () => {
    const i = set.glyphs.indexOf(glyph)
    setGlyph(set.glyphs[(i+1) % set.glyphs.length]); setProgress(0); setDone(false)
  }

  if(!glyph){
    return (
      <div style={{textAlign:'center'}}>
        <p style={{color:'rgba(255,255,255,0.85)', fontSize:14, margin:'0 0 12px'}}>✍️ Choisis, puis passe le doigt sur le chiffre ou la lettre pour la colorier !</p>
        <div style={{display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap', marginBottom:16}}>
          {TRACE_SETS.map(s=>(
            <button key={s.id} onClick={()=>setSetId(s.id)} style={{...btnStyle(), padding:'10px 14px', background: setId===s.id ? C.gold : 'rgba(255,255,255,0.15)', color: setId===s.id ? '#0f2040' : 'white'}}>{s.emoji} {s.label}</button>
          ))}
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(60px,1fr))', gap:10, maxWidth:460, margin:'0 auto'}}>
          {set.glyphs.map(g=>(
            <button key={g} onClick={()=>{ setGlyph(g); setProgress(0); setDone(false) }}
              style={{ height:60, borderRadius:14, border:'2px solid rgba(255,255,255,0.35)', background:'rgba(255,255,255,0.92)', color:'#24417f', fontWeight:900, fontSize:30, cursor:'pointer', padding:0 }}>{g}</button>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div style={{textAlign:'center', userSelect:'none', WebkitUserSelect:'none'}}>
      <KidStyles />
      <div style={{maxWidth:360, margin:'0 auto 10px', height:14, background:'rgba(255,255,255,0.2)', borderRadius:8, overflow:'hidden'}}>
        <div style={{width:Math.min(100, Math.round(progress/0.85*100))+'%', height:'100%', background:'linear-gradient(90deg,#fb8c00,#fdd835,#7ed957)', transition:'width .15s'}} />
      </div>
      <canvas ref={view} width={S} height={S} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
        style={{width:'100%', maxWidth:360, height:'auto', display:'block', margin:'0 auto', borderRadius:16, boxShadow:'0 4px 14px rgba(0,0,0,0.3)', touchAction:'none', cursor:'crosshair'}} />
      <p style={{color:'rgba(255,255,255,0.75)', fontSize:12, margin:'10px 0 0'}}>Passe ton doigt sur toute la forme grise</p>
      {done && <GameResultBanner text="🎉 Bravo !" sub="Tout est colorié" color={C.green} onReplay={restart} />}
      <div style={{display:'flex', gap:10, justifyContent:'center', marginTop:12, flexWrap:'wrap'}}>
        {done && <button onClick={next} style={{...btnStyle(), background:C.green}}>Suivant ➜</button>}
        {!done && <button onClick={restart} style={btnStyle()}>🔄 Recommencer</button>}
        <button onClick={()=>setGlyph(null)} style={{...btnStyle(), background:'rgba(255,255,255,0.15)', color:'white'}}>↩ Autre caractère</button>
      </div>
    </div>
  )
}

// ==================================================================
// 25) TUILES PAR TROIS (facon mahjong) — on prend des tuiles sur les tas ; trois pareilles disparaissent
// ==================================================================
const TILE_EMOJIS = ['🍎','🍌','🍇','🍓','🍊','🍉','🐶','🐱','🐸','🐼','⭐','❤️','🚗','⚽']
const TILE_LEVELS = [
  { label:'Petit', emoji:'🐣', types:4, per:3, piles:4, tray:7, undo:99, shuffle:3 },
  { label:'Moyen', emoji:'🐥', types:6, per:6, piles:6, tray:7, undo:5, shuffle:3 },
  { label:'Grand', emoji:'🐔', types:8, per:6, piles:8, tray:7, undo:3, shuffle:2 },
]
const TILE_W = 54, TILE_H = 62, TILE_STEP = 8
function makeTilePiles(lv){
  const types = shuffleArr(TILE_EMOJIS).slice(0, lv.types)
  const all = []
  let id = 0
  types.forEach(t=>{ for(let i=0;i<lv.per;i++) all.push({ id:'t'+(++id), t }) })
  const sh = shuffleArr(all), size = all.length / lv.piles
  return Array.from({length:lv.piles}, (_,i)=>sh.slice(i*size, (i+1)*size))
}
function TripleTilesGame(){
  const [level, setLevel] = useState(null)
  const [piles, setPiles] = useState([])
  const [tray, setTray] = useState([])
  const [hist, setHist] = useState([])
  const [undoLeft, setUndoLeft] = useState(0)
  const [shuffleLeft, setShuffleLeft] = useState(0)
  const [locked, setLocked] = useState(false)
  const [full, setFull] = useState(false)
  const [won, setWon] = useState(false)
  const alive = useRef(true)
  useEffect(()=>{ alive.current = true; return ()=>{ alive.current = false } }, [])

  const start = (lv) => {
    setLevel(lv); setPiles(makeTilePiles(lv)); setTray([]); setHist([]); setUndoLeft(lv.undo); setShuffleLeft(lv.shuffle)
    setLocked(false); setFull(false); setWon(false)
  }
  const checkEnd = (np, nt) => {
    if(np.every(p=>p.length===0) && nt.length===0){ setWon(true); return }
    if(nt.length >= level.tray) setFull(true)
  }
  const pick = (pi) => {
    if(locked || full || won) return
    const pile = piles[pi]; if(!pile || !pile.length) return
    const tile = pile[pile.length-1]
    const np = piles.map((p,i)=> i===pi ? p.slice(0,-1) : p)
    let at = -1; tray.forEach((x,i)=>{ if(x.t===tile.t) at = i })
    const nt = [...tray]; nt.splice(at>=0 ? at+1 : nt.length, 0, tile)
    setPiles(np); setTray(nt); setHist(h=>[...h, { pile:pi, tile }])
    if(nt.filter(x=>x.t===tile.t).length >= 3){
      setLocked(true)
      setTimeout(()=>{
        if(!alive.current) return
        const nt2 = nt.filter(x=>x.t!==tile.t)
        setTray(nt2); setHist([]); setLocked(false); checkEnd(np, nt2)
      }, 320)
    } else checkEnd(np, nt)
  }
  const undo = () => {
    if(locked || won || !hist.length || undoLeft<=0) return
    const last = hist[hist.length-1]
    setTray(t=>t.filter(x=>x.id!==last.tile.id))
    setPiles(ps=>ps.map((p,i)=> i===last.pile ? [...p, last.tile] : p))
    setHist(h=>h.slice(0,-1)); setUndoLeft(u=>u-1); setFull(false)
  }
  const reshuffle = () => {
    if(locked || won || shuffleLeft<=0) return
    const flat = shuffleArr(piles.flat().map(x=>x.t))
    let k = 0
    const np = piles.map(p=>p.map(x=>({ id:x.id, t:flat[k++] })))
    setPiles(np); setHist([]); setShuffleLeft(s=>s-1)
  }
  if(!level) return (<div><KidStyles /><LevelPicker levels={TILE_LEVELS} onPick={start} intro="🀄 Prends les tuiles : trois pareilles disparaissent !" /></div>)

  const pileH = TILE_H + ((level.per * level.types / level.piles) - 1) * TILE_STEP
  const remaining = piles.reduce((a,p)=>a+p.length, 0)
  return (
    <div style={{userSelect:'none', WebkitUserSelect:'none'}}>
      <style>{`@keyframes riusTileIn{from{transform:translateY(-10px);opacity:0}to{transform:none;opacity:1}}`}</style>
      <KidStyles />
      <p style={{color:'rgba(255,255,255,0.8)', fontSize:13, margin:'0 0 10px', textAlign:'center'}}>Touche une tuile du dessus. Trois pareilles = elles disparaissent !</p>
      <div style={{display:'flex', flexWrap:'wrap', gap:'14px 10px', justifyContent:'center', padding:'12px 6px', background:'rgba(0,0,0,0.15)', borderRadius:14}}>
        {piles.map((p,pi)=>(
          <div key={pi} style={{ position:'relative', width:TILE_W, height:pileH }}>
            {p.map((tile,i)=>{
              const top = i===p.length-1
              return (
                <button key={tile.id} data-top={top ? '1' : undefined} data-type={tile.t} data-pile={pi} onClick={()=>top && pick(pi)} disabled={!top}
                  style={{ position:'absolute', left:0, top: pileH - TILE_H - (p.length-1-i)*TILE_STEP, width:TILE_W, height:TILE_H, borderRadius:10, padding:0,
                    fontSize:30, lineHeight:1, cursor: top ? 'pointer' : 'default', background: top ? '#fffdf0' : '#d9d3bd', border:'2px solid '+(top ? '#8a7a4a' : '#a89f7c'),
                    boxShadow: top ? '0 3px 0 #8a7a4a' : 'none', opacity: top ? 1 : 0.85 }}>
                  <span style={{opacity: top ? 1 : 0.35}}>{tile.t}</span>
                </button>
              )
            })}
          </div>
        ))}
      </div>
      <div style={{display:'flex', gap:5, justifyContent:'center', marginTop:14, padding:8, background:'rgba(0,0,0,0.25)', borderRadius:14, border:'2px solid rgba(255,255,255,0.25)'}}>
        {Array.from({length:level.tray}, (_,i)=>{
          const t = tray[i]
          return (
            <div key={i} style={{ width:TILE_W-6, height:TILE_H-4, borderRadius:8, background:'rgba(255,255,255,0.1)', border:'1.5px dashed rgba(255,255,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {t && <div data-tray={t.t} className="riusPop" style={{fontSize:28, lineHeight:1, background:'#fffdf0', borderRadius:8, width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid #8a7a4a', boxSizing:'border-box'}}>{t.t}</div>}
            </div>
          )
        })}
      </div>
      <div style={{color:'rgba(255,255,255,0.7)', fontSize:12, textAlign:'center', marginTop:8}}>Tuiles restantes : {remaining + tray.length}</div>
      {full && !won && (
        <div style={{margin:'12px auto 0', maxWidth:360, background:'rgba(0,0,0,0.3)', borderRadius:14, padding:14, textAlign:'center'}}>
          <div style={{color:C.gold, fontWeight:900, fontSize:16}}>Le plateau est plein !</div>
          <div style={{color:'rgba(255,255,255,0.8)', fontSize:12, margin:'4px 0 10px'}}>Reprends ta dernière tuile ou recommence.</div>
        </div>
      )}
      {won && <GameResultBanner text="🎉 Bravo !" sub="Tous les tas sont vides" color={C.green} onReplay={()=>start(level)} />}
      <div style={{display:'flex', gap:8, justifyContent:'center', marginTop:12, flexWrap:'wrap'}}>
        <button onClick={undo} disabled={!hist.length || undoLeft<=0 || locked} style={{...btnStyle(), opacity: hist.length && undoLeft>0 && !locked ? 1 : 0.4}}>↩ Reprendre{level.undo<99 ? ` (${undoLeft})` : ''}</button>
        <button onClick={reshuffle} disabled={shuffleLeft<=0 || locked} style={{...btnStyle(), opacity: shuffleLeft>0 && !locked ? 1 : 0.4}}>🔀 Mélanger ({shuffleLeft})</button>
        <button onClick={()=>start(level)} style={{...btnStyle(), background:'rgba(255,255,255,0.15)', color:'white'}}>🔄 Recommencer</button>
        <button onClick={()=>setLevel(null)} style={{...btnStyle(), background:'rgba(255,255,255,0.15)', color:'white'}}>Niveau</button>
      </div>
    </div>
  )
}

// ==================================================================
// 26) FRUITS EN FOLIE (facon Candy Crush) — on echange deux fruits voisins pour en aligner trois ou plus
// ==================================================================
const CRUSH_KINDS = [
  { e:'🍎', bg:'#ffcdd2' }, { e:'🍊', bg:'#ffe0b2' }, { e:'🍋', bg:'#fff59d' },
  { e:'🍏', bg:'#c8e6c9' }, { e:'🍇', bg:'#e1bee7' }, { e:'🍓', bg:'#f8bbd0' },
]
const CRUSH_LEVELS = [
  { label:'Petit', emoji:'🐣', n:6, kinds:4, moves:25, target:600 },
  { label:'Moyen', emoji:'🐥', n:7, kinds:5, moves:22, target:1700 },
  { label:'Grand', emoji:'🐔', n:8, kinds:6, moves:20, target:1800 },
]
function crushMatches(b, n){
  const out = new Set()
  for(let y=0;y<n;y++){
    let run = 1
    for(let x=1;x<=n;x++){
      const same = x<n && b[y*n+x] && b[y*n+x-1] && b[y*n+x].k===b[y*n+x-1].k
      if(same) run++
      else { if(run>=3) for(let k=1;k<=run;k++) out.add(y*n+x-k); run = 1 }
    }
  }
  for(let x=0;x<n;x++){
    let run = 1
    for(let y=1;y<=n;y++){
      const same = y<n && b[y*n+x] && b[(y-1)*n+x] && b[y*n+x].k===b[(y-1)*n+x].k
      if(same) run++
      else { if(run>=3) for(let k=1;k<=run;k++) out.add((y-k)*n+x); run = 1 }
    }
  }
  return out
}
function crushCollapse(b, n, kinds, nextId){
  const out = Array(n*n).fill(null)
  for(let x=0;x<n;x++){
    let w = n-1
    for(let y=n-1;y>=0;y--){ const t = b[y*n+x]; if(t){ out[w*n+x] = t; w-- } }
    for(let y=w;y>=0;y--) out[y*n+x] = { id:nextId(), k:Math.floor(Math.random()*kinds), fresh:true }
  }
  return out
}
function crushSwapped(b, i, j){ const c = [...b]; const t = c[i]; c[i] = c[j]; c[j] = t; return c }
function crushHasMove(b, n){
  for(let y=0;y<n;y++) for(let x=0;x<n;x++){
    const i = y*n+x
    if(x<n-1 && crushMatches(crushSwapped(b, i, i+1), n).size) return true
    if(y<n-1 && crushMatches(crushSwapped(b, i, i+n), n).size) return true
  }
  return false
}
function crushBoard(n, kinds, nextId){
  for(let tries=0; tries<500; tries++){
    const b = Array.from({length:n*n}, ()=>({ id:nextId(), k:Math.floor(Math.random()*kinds) }))
    if(!crushMatches(b, n).size && crushHasMove(b, n)) return b
  }
  return Array.from({length:n*n}, (_,i)=>({ id:nextId(), k:(i + Math.floor(i/n)*2) % kinds }))
}
const sleepMs = (ms) => new Promise(r=>setTimeout(r, ms))
function FruitCrushGame(){
  const [level, setLevel] = useState(null)
  const [, force] = useReducer(x=>x+1, 0)
  const G = useRef({ board:[], score:0, moves:0, sel:null, clearing:new Set(), status:'play', msg:'' })
  const busy = useRef(false), alive = useRef(true), idc = useRef(0), down = useRef(null), boardEl = useRef(null)
  const [cw, setCw] = useState(340)
  const upd = () => { if(alive.current) force() }
  const nextId = () => ++idc.current
  useEffect(()=>{ alive.current = true; return ()=>{ alive.current = false } }, [])
  useEffect(()=>{
    const measure = () => { if(boardEl.current) setCw(boardEl.current.clientWidth) }
    measure(); window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [level])

  const start = (lv) => {
    G.current = { board:crushBoard(lv.n, lv.kinds, nextId), score:0, moves:lv.moves, sel:null, clearing:new Set(), status:'play', msg:'' }
    busy.current = false; setLevel(lv); upd()
  }
  const trySwap = async (i, j) => {
    const g = G.current, n = level.n
    if(busy.current || g.status!=='play') return
    busy.current = true; g.sel = null
    g.board = crushSwapped(g.board, i, j); upd()
    await sleepMs(210)
    if(!alive.current) return
    if(!crushMatches(g.board, n).size){
      g.board = crushSwapped(g.board, i, j); upd()
      await sleepMs(210); busy.current = false; return
    }
    g.moves--
    let chain = 0
    while(alive.current){
      const m = crushMatches(g.board, n)
      if(!m.size) break
      chain++
      g.clearing = new Set([...m].map(k=>g.board[k].id))
      g.score += m.size * 10 * chain
      g.msg = chain>1 ? `Enchaînement x${chain} !` : ''
      upd(); await sleepMs(270)
      g.board = g.board.map((t,k)=> m.has(k) ? null : t); g.clearing = new Set(); upd()
      await sleepMs(50)
      g.board = crushCollapse(g.board, n, level.kinds, nextId); upd()
      await sleepMs(330)
    }
    if(!alive.current) return
    g.msg = ''
    if(g.score >= level.target) g.status = 'won'
    else if(g.moves <= 0) g.status = 'lost'
    else if(!crushHasMove(g.board, n)){ g.board = crushBoard(n, level.kinds, nextId); g.msg = 'Plus de coups possibles : on mélange !' }
    busy.current = false; upd()
  }
  const cellOf = (el) => { const t = el && el.closest ? el.closest('[data-cell]') : null; return t ? Number(t.dataset.cell) : null }
  const onDown = (e) => { down.current = { i:cellOf(e.target), x:e.clientX, y:e.clientY } }
  const onUp = (e) => {
    const d = down.current; down.current = null
    if(!d || d.i===null || !level) return
    const g = G.current, n = level.n
    if(busy.current || g.status!=='play') return
    const dx = e.clientX - d.x, dy = e.clientY - d.y
    if(Math.max(Math.abs(dx), Math.abs(dy)) > 14){
      const x = d.i % n, y = Math.floor(d.i / n)
      let nx = x, ny = y
      if(Math.abs(dx) > Math.abs(dy)) nx += dx > 0 ? 1 : -1; else ny += dy > 0 ? 1 : -1
      if(nx>=0 && ny>=0 && nx<n && ny<n) trySwap(d.i, ny*n+nx)
      return
    }
    if(g.sel === null){ g.sel = d.i; upd(); return }
    if(g.sel === d.i){ g.sel = null; upd(); return }
    const sx = g.sel % n, sy = Math.floor(g.sel / n), x = d.i % n, y = Math.floor(d.i / n)
    if(Math.abs(sx-x) + Math.abs(sy-y) === 1) trySwap(g.sel, d.i)
    else { g.sel = d.i; upd() }
  }
  if(!level) return (<div><KidStyles /><LevelPicker levels={CRUSH_LEVELS} onPick={start} intro="🍬 Échange deux fruits voisins pour en aligner trois ou plus !" /></div>)

  const g = G.current, n = level.n, size = 100 / n
  const pct = Math.min(100, Math.round(g.score / level.target * 100))
  return (
    <div style={{userSelect:'none', WebkitUserSelect:'none', textAlign:'center'}}>
      <style>{`@keyframes riusClear{from{transform:scale(1);opacity:1}to{transform:scale(0.1);opacity:0}}`}</style>
      <KidStyles />
      <div style={{display:'flex', justifyContent:'space-between', maxWidth:360, margin:'0 auto 6px', color:'white', fontWeight:800, fontSize:14}}>
        <span>⭐ {g.score} / {level.target}</span><span>👆 Coups : {g.moves}</span>
      </div>
      <div style={{maxWidth:360, margin:'0 auto 10px', height:10, background:'rgba(255,255,255,0.2)', borderRadius:6, overflow:'hidden'}}>
        <div style={{width:pct+'%', height:'100%', background:'linear-gradient(90deg,#fb8c00,#fdd835,#7ed957)', transition:'width .3s'}} />
      </div>
      <div ref={boardEl} onPointerDown={onDown} onPointerUp={onUp}
        style={{ position:'relative', width:'100%', maxWidth:360, aspectRatio:'1', margin:'0 auto', background:'rgba(0,0,0,0.25)', borderRadius:14, touchAction:'none', overflow:'hidden' }}>
        {g.board.map((t,i)=>{
          if(!t) return null
          const x = i % n, y = Math.floor(i / n), kind = CRUSH_KINDS[t.k]
          return (
            <div key={t.id} data-cell={i} data-kind={kind.e} className={t.fresh ? 'riusPop' : ''}
              style={{ position:'absolute', left:0, top:0, width:size+'%', height:size+'%', transform:`translate(${x*100}%, ${y*100}%)`, transition:'transform .22s ease', padding:'1.5%', boxSizing:'border-box' }}>
              <div style={{ width:'100%', height:'100%', borderRadius:'22%', background:kind.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:Math.round(cw/n*0.6), lineHeight:1,
                border: g.sel===i ? '3px solid '+C.gold : '2px solid rgba(255,255,255,0.5)', boxSizing:'border-box', transform: g.sel===i ? 'scale(1.1)' : 'none', transition:'transform .12s',
                animation: g.clearing.has(t.id) ? 'riusClear .27s forwards' : 'none' }}>{kind.e}</div>
            </div>
          )
        })}
      </div>
      <div style={{height:22, marginTop:8, color:C.gold, fontWeight:800, fontSize:14}}>{g.msg}</div>
      <p style={{color:'rgba(255,255,255,0.7)', fontSize:12, margin:'0 0 8px'}}>Touche deux fruits voisins, ou glisse un fruit vers son voisin</p>
      {g.status==='won' && <GameResultBanner text="🎉 Bravo !" sub={`Objectif atteint : ${g.score} points en ${level.moves - g.moves} coups`} color={C.green} onReplay={()=>start(level)} />}
      {g.status==='lost' && <GameResultBanner text="Presque !" sub={`${g.score} points sur ${level.target}. Essaie encore !`} color={C.gold} onReplay={()=>start(level)} />}
      <div style={{display:'flex', gap:8, justifyContent:'center', marginTop:8}}>
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
  { id:'course', title:'Course de voitures', desc:'Évite les cônes, prends les étoiles', emoji:'🏎️', component:CarRaceGame, age:'Dès 4 ans' },
  { id:'ombres', title:'Les ombres', desc:'Trouve l\'ombre de chaque animal', emoji:'🦊', component:ShadowGame, age:'Dès 3 ans' },
  { id:'formes', title:'Formes rigolotes', desc:'Chaque forme dans son trou', emoji:'🔺', component:ShapesGame, age:'Dès 3 ans' },
  { id:'trie-images', title:'Trie les images', desc:'Animaux, fruits, légumes, véhicules', emoji:'🧺', component:CategorySortGame, age:'Dès 3 ans' },
  { id:'bulles', title:'Bulles magiques', desc:'Éclate les bulles qui montent', emoji:'🎈', component:BubblesGame, age:'Dès 3 ans' },
  { id:'fruits', title:'Attrape les fruits', desc:'Rattrape-les dans ton panier', emoji:'🍓', component:CatchFruitsGame, age:'Dès 3 ans' },
  { id:'dessin', title:'Tableau magique', desc:'Dessine avec tes doigts', emoji:'✏️', component:DrawingPad, age:'Dès 3 ans' },
  { id:'combien', title:'Combien ?', desc:'Compte les images', emoji:'🧮', component:CountingGame, age:'Dès 4 ans' },
  { id:'intrus', title:'Trouve l\'intrus', desc:'Une image est différente', emoji:'🕵️', component:OddOneOutGame, age:'Dès 4 ans' },
  { id:'labyrinthe', title:'Labyrinthe', desc:'Guide la souris vers le fromage', emoji:'🐭', component:MazeGame, age:'Dès 5 ans' },
  { id:'2048', title:'2048', desc:'Fusionne les tuiles identiques', emoji:'🔶', component:Game2048, age:'Dès 8 ans' },
  { id:'ecriture', title:'Écriture magique', desc:'Colorie les chiffres et les lettres', emoji:'✍️', component:TraceGame, age:'Dès 3 ans' },
  { id:'tuiles', title:'Tuiles par trois', desc:'Trois pareilles disparaissent', emoji:'🀄', component:TripleTilesGame, age:'Dès 5 ans' },
  { id:'fruits-folie', title:'Fruits en folie', desc:'Aligne 3 fruits identiques', emoji:'🍬', component:FruitCrushGame, age:'Dès 6 ans' },
]

export default function GamesPage({pubsTop, pubsMid}){
  const [activeGame, setActiveGame] = useState(null)
  const firstRender = useRef(true)
  // A l'ouverture (ou a la fermeture) d'un jeu, on remonte en haut de la page : sinon, sur telephone,
  // la page restait au niveau ou se trouvait le bouton du jeu (donc en bas, sur le pied de page).
  useEffect(()=>{
    if(firstRender.current){ firstRender.current = false; return }
    window.scrollTo(0, 0)
  }, [activeGame])

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
