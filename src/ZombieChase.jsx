import { useCallback, useEffect, useRef, useState } from 'react'
import CharacterSprite from './CharacterSprite.jsx'
import SceneChoices from './SceneChoices.jsx'
import useSceneAdvance from './useSceneAdvance.js'
import { chooseChase, createChase, finishChaseFade, stepChase, tapChase } from './zombieChase.js'
import manifest from './assets/chase/manifest.json'
import peterRun from './assets/chase/PeterRunning.webp'
import susanRun from './assets/chase/SusanRunning.webp'
import hordeRun from './assets/chase/studentHorde.webp'
import fallen from './assets/chase/PeterFallen.png'
import zombies from './assets/scenes/CCSGame-ZombiesInHallway.png'
import zombieMoans from './assets/scenes/zombiesMoaning.wav'
import './ZombieChase.css'

const spriteUrls = { PeterRunning: peterRun, SusanRunning: susanRun, studentHorde: hordeRun }
const characterScale = 1.75
const runningScale = characterScale * .7
const zombieScale = runningScale * .85 * .95

function ChaseSprite({ name, x, y, height, seconds, moving = true, left = false, onError }) {
  height *= name === 'studentHorde' ? zombieScale : runningScale
  const animation = manifest[name]
  const frame = moving ? Math.floor(seconds * animation.fps) % animation.frames : 0
  const width = height * animation.width / animation.height
  return <g transform={`translate(${x} ${y}) scale(${left ? -1 : 1} 1)`}>
    <ellipse rx={width * .38} ry="5" fill="#172b35" opacity=".3" />
    <svg x={-width / 2} y={-height} width={width} height={height} overflow="hidden"
      viewBox={`${frame % animation.columns * animation.width} ${Math.floor(frame / animation.columns) * animation.height} ${animation.width} ${animation.height}`}>
      <image href={spriteUrls[name]} width={animation.columns * animation.width}
        height={Math.ceil(animation.frames / animation.columns) * animation.height} onError={onError} />
    </svg>
  </g>
}

function Hallway({ camera }) {
  const firstPanel = Math.floor(camera / 220) - 1
  return <g>
    <defs>
      <linearGradient id="chase-wall" x2="0" y2="1">
        <stop stopColor="#194255" /><stop offset="1" stopColor="#6b9b9e" />
      </linearGradient>
      <linearGradient id="chase-floor" x2="0" y2="1">
        <stop stopColor="#4a6672" /><stop offset="1" stopColor="#162d42" />
      </linearGradient>
    </defs>
    <rect x={camera} width="400" height="600" fill="url(#chase-wall)" />
    <rect x={camera} width="400" height="75" fill="#132f40" />
    <path d={`M${camera} 300 h400 v300 h-400Z`} fill="url(#chase-floor)" />
    {Array.from({ length: 5 }, (_, index) => {
      const x = (firstPanel + index) * 220
      return <g key={x}>
        <path d={`M${x} 32 h150 l-20 8 h-150Z`} fill="#efffe9" />
        <rect x={x + 25} y="108" width="93" height="135" rx="4" fill="#133646" stroke="#90b2ad" strokeWidth="5" />
        <rect x={x + 32} y="116" width="79" height="120" fill="#c7d7bb" />
        <path d={`M${x + 44} 210 v-40 h12 v40 m10 0 v-65 h12 v65 m10 0 v-85 h12 v85`}
          fill="#327c85" />
        <text x={x + 72} y="137" textAnchor="middle" fill="#24424d" fontSize="10" fontWeight="bold">CREATE.</text>
        <path d={`M${x + 160} 75 v225 m-220 0 h220`} fill="none" stroke="#244955" strokeWidth="4" />
        <path d={`M${x} 302 l-120 298 m230-298 l100 298`} stroke="#9ebdb9" strokeWidth="1" opacity=".2" />
      </g>
    })}
    {[350, 425, 535].map(y => <path key={y} d={`M${camera} ${y} h400`}
      stroke="#b8d0c7" opacity=".18" />)}
    <g>
      <rect x="68" y="133" width="94" height="169" fill="#152d3c" stroke="#e9b957" strokeWidth="6" />
      <rect x="77" y="141" width="76" height="157" fill="#88583f" />
      <rect x="91" y="166" width="50" height="24" rx="3" fill="#fbe013" />
      <text x="116" y="176" textAnchor="middle" fill="#182f3a" fontSize="6" fontWeight="bold">DEPARTMENT</text>
      <text x="116" y="185" textAnchor="middle" fill="#182f3a" fontSize="6" fontWeight="bold">CHAIR</text>
      <circle cx="140" cy="235" r="4" fill="#fbe013" />
    </g>
    <rect x={camera} y="295" width="400" height="8" fill="#fbe013" opacity=".75" />
  </g>
}

function TapHints() {
  return <div className="chase-tap-hints" role="img" aria-label="Tap repeatedly or repeatedly press Space to run">
    <svg viewBox="0 0 120 115" aria-hidden="true">
      <circle className="chase-tap-ring" cx="56" cy="25" r="18" />
      <g className="chase-tap-finger">
        <path d="M47 64 34 47 Q30 39 36 38 L46 45 V24 Q46 16 53 16 Q60 16 60 24 V42 Q65 36 71 42 Q78 37 83 46 L89 49 V69 Q87 80 78 87 H57Z" />
      </g>
      <g className="chase-space-key"><rect x="8" y="92" width="104" height="20" rx="4" />
        <text x="60" y="106" textAnchor="middle">SPACE</text></g>
    </svg>
  </div>
}

export default function ZombieChase({ onRestart }) {
  const model = useRef(createChase())
  const audioRef = useRef(null)
  const [state, setState] = useState(createChase)
  const [revealing, setRevealing] = useState(true)
  const [error, setError] = useState('')
  const [audioError, setAudioError] = useState('')
  const [needsAudio, setNeedsAudio] = useState(false)
  const [moaning, setMoaning] = useState(false)
  const playMoans = useCallback(async () => {
    try {
      await audioRef.current.play()
      setNeedsAudio(false)
    } catch (failure) {
      if (failure.name === 'NotAllowedError') setNeedsAudio(true)
      else if (failure.name !== 'AbortError') {
        console.error('Zombie moaning playback failed:', failure)
        setAudioError('Unable to play the zombie moaning audio. Please reload the page.')
      }
    }
  }, [])
  const zombiesVisible = !['entrance', 'strange'].includes(state.phase)
    && state.horde >= state.camera
  useEffect(() => {
    if (!zombiesVisible || moaning) return
    // Queue playback so the first visible horde frame and audio start together.
    const timer = setTimeout(() => {
      setMoaning(true)
      playMoans()
    }, 0)
    return () => clearTimeout(timer)
  }, [zombiesVisible, moaning, playMoans])
  useEffect(() => {
    const audio = audioRef.current
    return () => audio.pause()
  }, [])
  useEffect(() => {
    const audio = audioRef.current
    if (state.phase !== 'loss-out') return
    let frame
    const start = performance.now()
    const initialVolume = audio.volume
    function fade(now) {
      const progress = Math.max(0, Math.min(1, (now - start) / 1000))
      audio.volume = initialVolume * (1 - progress)
      if (progress < 1) frame = requestAnimationFrame(fade)
      else audio.pause()
    }
    frame = requestAnimationFrame(fade)
    return () => cancelAnimationFrame(frame)
  }, [state.phase])
  const input = useSceneAdvance(!revealing && !error && state.phase !== 'plea', () => {
    if (model.current.phase === 'lost') onRestart()
    else {
      model.current = tapChase(model.current)
      setState(model.current)
    }
  })
  useEffect(() => {
    if (revealing || error) return
    let frame
    let last
    function tick(now) {
      const dt = last === undefined ? 0 : Math.min(.05, (now - last) / 1000)
      last = now
      if (!document.hidden) {
        model.current = stepChase(model.current, dt)
        setState(model.current)
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [revealing, error])

  function mediaError(event) {
    console.error('Zombie chase artwork failed to load:', event)
    setError('Unable to load the hallway chase artwork. Please reload the page.')
  }
  const opening = ['entrance', 'strange', 'reveal', 'ready'].includes(state.phase)
  const lookingLeft = ['reveal', 'ready'].includes(state.phase)
  const running = ['run', 'rescue', 'doomed'].includes(state.phase)
  const lossScreen = ['loss-in', 'lost'].includes(state.phase)
  const overrun = ['overrun', 'loss-out'].includes(state.phase)
  const tripProgress = Math.min(1, state.elapsed / 1.5)
  // The source pose is horizontal; begin at -90 degrees and tip clockwise.
  const tripAngle = state.phase === 'trip' ? -90 + Math.min(1, tripProgress / .55) * 90 : 0
  const bounce = state.phase === 'trip' && tripProgress > .55
    ? -Math.abs(Math.sin((tripProgress - .55) / .45 * Math.PI * 2)) * (1 - tripProgress) * 28 : 0

  return <section className="opening-scene zombie-chase" aria-label="Zombie hallway chase"
    data-phase={state.phase} {...input}>
    <audio ref={audioRef} src={zombieMoans} loop preload="auto" onError={event => {
      console.error('Zombie moaning audio failed to load:', event.currentTarget.error)
      setAudioError('Unable to load the zombie moaning audio. Please reload the page.')
    }} />
    {lossScreen ? <>
      <img className="freeze-frame" src={zombies} alt="The students overtake Susan in the hallway" onError={mediaError} />
      <div className="video-dialogue chase-loss" role="status">
        <h1>YOU LOSE!</h1>
        <p>You didn't stop the student uprising.</p>
        <small>Tap the screen or press spacebar to play again</small>
      </div>
    </> : <>
      <svg className="chase-world" viewBox={`${state.camera} 0 400 600`} onErrorCapture={mediaError}
        preserveAspectRatio="xMidYMid slice" role="img" aria-label="Susan and Peter in a university hallway">
        <Hallway camera={state.camera} />
        {opening ? <>
          <CharacterSprite name="peter" position={{ x: state.peter, y: state.y - 8, facing: lookingLeft ? 'left' : 'down' }}
            moving={state.phase === 'entrance'} animationSeconds={state.time} scale={1.1 * characterScale} />
          <CharacterSprite name="susan" position={{ x: state.susan, y: state.y, facing: lookingLeft ? 'left' : 'down' }}
            moving={state.phase === 'entrance'} animationSeconds={state.time} scale={1.1 * characterScale} />
        </> : <>
          {!state.fallen && <ChaseSprite name="PeterRunning" x={state.peter} y={state.y - 5}
            height={118} seconds={state.time} onError={mediaError} />}
          {state.fallen && !state.trampled && <g data-fallen-peter=""
            transform={`translate(${state.peter} ${state.y + bounce}) rotate(${tripAngle}) scale(${characterScale * .7 * .95})`}>
            <image href={fallen} x="-66" y="-58" width="132" height="88" onError={mediaError} />
          </g>}
        </>}
        {!opening && !(overrun && state.horde >= state.susan + 140) && <ChaseSprite name="SusanRunning" x={state.susan} y={state.y}
          height={118} seconds={state.time} moving={running && (state.phase === 'run' || state.boost > 1)}
          left={state.phase === 'rescue'} onError={mediaError} />}
        {!['entrance', 'strange'].includes(state.phase) && <ChaseSprite name="studentHorde"
          x={state.horde - 180 * zombieScale} y={state.y + 8} height={195} seconds={state.time}
          onError={mediaError} />}
      </svg>
      {state.phase === 'strange' && <div className="video-dialogue" role="status">
        <p>Peter: Do you hear something strange?</p>
        <small>Tap the screen or press spacebar to continue.</small>
      </div>}
      {state.phase === 'ready' && <TapHints />}
      {state.phase === 'plea' && <div className="video-dialogue" role="group" aria-label="Save Peter or keep running">
        <p>Peter: Go! Save yourself!</p>
        <SceneChoices choices={['A. Go back for Peter', "B. He's a goner! Keep running!"]}
          onChoose={choice => {
            model.current = chooseChase(model.current, choice === 0)
            setState(model.current)
          }} />
      </div>}
    </>}
    {revealing && <div className="scene-fade scene-reveal" onAnimationEnd={() => setRevealing(false)} />}
    {['loss-out', 'loss-in'].includes(state.phase) && <div key={state.phase}
      className={`scene-fade${state.phase === 'loss-in' ? ' scene-reveal' : ''}`}
      role="status" aria-label={state.phase === 'loss-out' ? 'Fade out hallway' : 'Fade in loss screen'}
      onAnimationEnd={() => {
        if (state.phase === 'loss-out') {
          audioRef.current.volume = 0
          audioRef.current.pause()
          setNeedsAudio(false)
        }
        model.current = finishChaseFade(model.current)
        setState(model.current)
      }} />}
    {error && <p className="video-notice" role="alert">{error}</p>}
    {audioError && <p className="video-notice" role="alert">{audioError}</p>}
    {needsAudio && !audioError && !['loss-out', 'loss-in', 'lost'].includes(state.phase)
      && <div className="video-notice">
        <button className="primary" onClick={playMoans}>Play zombie sounds</button>
      </div>}
  </section>
}
