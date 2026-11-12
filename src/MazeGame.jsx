import { useEffect, useReducer, useRef, useState } from 'react'
import useSceneAdvance from './useSceneAdvance.js'
import { touchDirection, MOVEMENT_KEYS } from './worldview.js'
import { createMaze, mazeReducer, mazeCamera, mazeTime } from './mazeGame.js'
import MazeGameArt from './MazeGameArt.jsx'
import { mazeArtworkUrls } from './mazeArtwork.js'
import { characterImageUrls } from './characterSprites.js'
import './MazeGame.css'

function MazeAttempt({ onComplete, onRetry }) {
  const [state, dispatch] = useReducer(mazeReducer, undefined, createMaze)
  const [revealing, setRevealing] = useState(true)
  const [ratio, setRatio] = useState(.65)
  const viewportRef = useRef(null)
  const stateRef = useRef(state)
  const revealRef = useRef(revealing)
  const controls = useRef({ keys: new Set(), gesture: null })
  const [animationSeconds, setAnimationSeconds] = useState(0)
  const [moving, setMoving] = useState(false)
  const [assetError, setAssetError] = useState('')
  const errorRef = useRef(false)
  const camera = mazeCamera(state.position, ratio)
  const dialogue = state.dialogue.length > 0
  const playable = !revealing && !assetError && ['explore', 'running'].includes(state.phase)
  const handlers = useSceneAdvance(!revealing && !assetError && (dialogue || state.phase === 'lost'), () => {
    if (state.phase === 'lost') onRetry()
    else dispatch({ type: 'advance' })
  })

  useEffect(() => { stateRef.current = state }, [state])
  useEffect(() => { revealRef.current = revealing }, [revealing])
  useEffect(() => {
    function failed(url) {
      errorRef.current = true
      console.error('Maze Game artwork failed to load:', url)
      setAssetError('Unable to load Maze Game artwork. Please reload the page.')
    }
    const images = [...mazeArtworkUrls, ...characterImageUrls].map(url => {
      const image = new Image()
      image.onerror = () => failed(url)
      image.src = url
      return image
    })
    return () => images.forEach(image => { image.onerror = null })
  }, [])
  useEffect(() => {
    if (!playable) {
      controls.current.keys.clear()
      controls.current.gesture = null
    }
  }, [playable])

  useEffect(() => {
    const viewport = viewportRef.current
    const observer = new ResizeObserver(([entry]) => setRatio(entry.contentRect.width / entry.contentRect.height))
    observer.observe(viewport)
    const input = controls.current
    let previous
    let frame
    function clear() {
      input.keys.clear()
      input.gesture = null
      previous = undefined
    }
    function keyDown(event) {
      if (!MOVEMENT_KEYS.has(event.code)) return
      event.preventDefault()
      if (!revealRef.current && ['explore', 'running'].includes(stateRef.current.phase)) input.keys.add(event.code)
    }
    function keyUp(event) { input.keys.delete(event.code) }
    function tick(now) {
      const seconds = previous === undefined ? 0 : (now - previous) / 1000
      previous = now
      if (!document.hidden && !revealRef.current && !errorRef.current) {
        const bounds = viewport.getBoundingClientRect()
        const current = stateRef.current
        const view = mazeCamera(current.position, bounds.width / bounds.height)
        const direction = touchDirection(input.gesture, now, bounds,
          (current.position.y - view.y) / view.height,
          (current.position.x - view.x) / view.width) ?? {
          dx: Number(input.keys.has('ArrowRight')) - Number(input.keys.has('ArrowLeft')),
          dy: Number(input.keys.has('ArrowDown')) - Number(input.keys.has('ArrowUp')),
        }
        dispatch({ type: 'tick', direction, seconds })
        setMoving(['explore', 'running'].includes(current.phase) && Boolean(direction.dx || direction.dy))
        if (['explore', 'running'].includes(current.phase) && (direction.dx || direction.dy)) {
          setAnimationSeconds(value => value + Math.min(seconds, .05))
        }
      }
      frame = requestAnimationFrame(tick)
    }
    window.addEventListener('keydown', keyDown)
    window.addEventListener('keyup', keyUp)
    window.addEventListener('blur', clear)
    document.addEventListener('visibilitychange', clear)
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('keydown', keyDown)
      window.removeEventListener('keyup', keyUp)
      window.removeEventListener('blur', clear)
      document.removeEventListener('visibilitychange', clear)
    }
  }, [])

  function release(event) {
    if (controls.current.gesture?.pointerId === event.pointerId) controls.current.gesture = null
  }

  return <section className="maze-game" aria-label="Maze Game" {...handlers}>
    <div ref={viewportRef} className="maze-viewport"
      data-x={state.position.x} data-y={state.position.y} data-phase={state.phase}
      data-section={state.position.section}
      onPointerDown={event => {
        if (!playable || !event.isPrimary || event.button !== 0) return
        controls.current.gesture = { pointerId: event.pointerId,
          x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY,
          started: performance.now(), dragged: false }
        event.currentTarget.setPointerCapture(event.pointerId)
      }}
      onPointerMove={event => {
        const gesture = controls.current.gesture
        if (gesture?.pointerId !== event.pointerId) return
        gesture.x = event.clientX
        gesture.y = event.clientY
        gesture.dragged ||= Math.hypot(gesture.x - gesture.startX, gesture.y - gesture.startY) > 8
      }}
      onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}>
      <MazeGameArt state={state} camera={camera} elapsed={animationSeconds} moving={moving}
        onError={event => {
          console.error('Maze Game artwork failed to load:', event.currentTarget.getAttribute('href'))
          errorRef.current = true
          setAssetError('Unable to load Maze Game artwork. Please reload the page.')
        }} />
    </div>
    {!['intro', 'explore', 'first'].includes(state.phase) && <div
      className={`maze-timer${state.phase === 'arming' ? ' maze-timer-glow' : ''}`}
      role="timer" aria-label="Time remaining" data-seconds={state.remaining}>
      {mazeTime(state.remaining)}
      <small>{dialogue ? 'PAUSED' : state.phase === 'arming' ? 'GET READY' : 'ADMISSIONS CLOSES'}</small>
    </div>}
    {dialogue && !revealing && <div className="video-dialogue maze-dialogue" role="status">
      {state.dialogue.map(line => <p key={line}>{line}</p>)}
      <small>Tap the screen or press Space to continue.</small>
    </div>}
    {!dialogue && playable && <p className="maze-controls">Arrow keys or hold/drag to move · Talk to students for clues</p>}
    {state.phase === 'lost' && <div className="game-over maze-loss" role="status">
      <h1>YOU LOSE!</h1>
      <p>Gotta be faster than that if you're going to survive college!</p>
      <p>Try again?</p>
      <small>Tap the screen or press spacebar to try again.</small>
    </div>}
    {assetError && <p className="video-notice" role="alert">{assetError}</p>}
    {(revealing || state.phase === 'won') && <div key={revealing ? 'reveal' : 'win'}
      className={`scene-fade${revealing ? ' scene-reveal' : ''}`} role="status"
      aria-label={revealing ? 'Fade in campus' : 'Return to interview'}
      onAnimationEnd={() => {
        if (revealing) setRevealing(false)
        else onComplete()
      }} />}
  </section>
}

export default function MazeGame({ onComplete }) {
  const [attempt, setAttempt] = useState(0)
  return <MazeAttempt key={attempt} onComplete={onComplete} onRetry={() => setAttempt(value => value + 1)} />
}
