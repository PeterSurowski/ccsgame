import { useEffect, useReducer, useRef, useState } from 'react'
import SceneChoices from './SceneChoices.jsx'
import useSceneAdvance from './useSceneAdvance.js'
import PixelText from './PixelText.jsx'
import PeterFlashbackArt from './PeterFlashbackArt.jsx'
import { createFlashback, flashbackReducer, flashbackText } from './peterFlashback.js'
import './PeterFlashback.css'

function MovementHints() {
  return <div className="flashback-movement-hints" role="img"
    aria-label="Hold the left or right side of the screen, or use the left and right arrow keys">
    {[-1, 1].map(direction => <svg key={direction} className={direction < 0 ? 'flashback-left-hint' : 'flashback-right-hint'}
      viewBox="0 0 80 125" aria-hidden="true">
      <circle className="flashback-touch-ring" cx="35" cy="24" r="15" />
      <g className="flashback-touch-finger">
        <path d="M28 66 16 48 Q13 42 18 40 L28 47 V24 Q28 18 34 18 Q40 18 40 24 V42 Q45 37 50 42 Q56 39 61 46 L66 50 V67 Q64 77 57 81 H38Z" />
      </g>
      <rect x="14" y="91" width="52" height="30" rx="5" fill="#ffffff22" />
      <path d={direction < 0 ? 'M53 106 H27 M37 97 L27 106 L37 115' : 'M27 106 H53 M43 97 L53 106 L43 115'}
        fill="none" strokeWidth="3" />
    </svg>)}
  </div>
}

export default function PeterFlashback({ onComplete }) {
  const [state, dispatch] = useReducer(flashbackReducer, undefined, createFlashback)
  const [transition, setTransition] = useState('in')
  const [introReady, setIntroReady] = useState(false)
  const [moving, setMoving] = useState(false)
  const input = useRef({ keys: new Set(), pointer: null })
  const sceneTransition = state.mode === 'complete' ? 'out' : transition
  const canMove = !sceneTransition && state.mode === 'walking'
  const canContinue = !sceneTransition && ['narration', 'reaction'].includes(state.mode)
  const handlers = useSceneAdvance(canContinue, () => dispatch({ type: 'continue' }))

  useEffect(() => {
    if (transition) return
    const timer = setTimeout(() => setIntroReady(true), 1000)
    return () => clearTimeout(timer)
  }, [transition])

  useEffect(() => {
    const controls = input.current
    function clear() {
      controls.keys.clear()
      controls.pointer = null
      setMoving(false)
    }
    function keyDown(event) {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.code)) return
      event.preventDefault()
      if (canMove) controls.keys.add(event.code)
    }
    function keyUp(event) {
      controls.keys.delete(event.code)
    }
    function visibility() {
      if (document.hidden) clear()
    }
    let frame
    let previous
    function tick(now) {
      const elapsed = previous === undefined ? 0 : Math.min((now - previous) / 1000, .05)
      previous = now
      const direction = controls.pointer?.direction
        ?? (Number(controls.keys.has('ArrowRight')) - Number(controls.keys.has('ArrowLeft')))
      setMoving(Boolean(direction))
      if (direction) dispatch({ type: 'move', dx: direction * elapsed * 90 })
      frame = requestAnimationFrame(tick)
    }
    clear()
    if (canMove) frame = requestAnimationFrame(tick)
    window.addEventListener('keydown', keyDown)
    window.addEventListener('keyup', keyUp)
    window.addEventListener('blur', clear)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      cancelAnimationFrame(frame)
      clear()
      window.removeEventListener('keydown', keyDown)
      window.removeEventListener('keyup', keyUp)
      window.removeEventListener('blur', clear)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [canMove])

  function steer(event) {
    const bounds = event.currentTarget.getBoundingClientRect()
    const distance = event.clientX - (bounds.left + bounds.width / 2)
    input.current.pointer = { id: event.pointerId, direction: Math.abs(distance) < 12 ? 0 : Math.sign(distance) }
  }
  function release(event) {
    if (input.current.pointer?.id === event.pointerId) input.current.pointer = null
  }

  const text = state.narration ? flashbackText[state.narration]
    : introReady && !state.walkedLeft ? flashbackText.intro : null
  const atDoor = !sceneTransition && ['door', 'm2-door'].includes(state.mode)

  return <section className="peter-flashback" aria-label="Peter's tech journey" {...handlers}>
    <header className="flashback-title">A LONG WAY TO WEBMASTER</header>
    <div className="flashback-stage" data-x={state.x} data-adult={state.adult} data-mode={state.mode}
      onPointerDown={event => {
        if (!canMove || !event.isPrimary || event.button !== 0) return
        event.currentTarget.setPointerCapture(event.pointerId)
        steer(event)
      }}
      onPointerMove={event => {
        if (canMove && input.current.pointer?.id === event.pointerId) steer(event)
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}>
      <PeterFlashbackArt state={state} moving={moving} />
      {canMove && <MovementHints />}
    </div>
    <div className="flashback-dialogue" role="group" aria-label="Flashback story and choices">
      {text && <div role="status"><PixelText text={text} /></div>}
      {atDoor && <SceneChoices key={state.mode} choices={state.mode === 'm2-door'
        ? ['A. Knock']
        : ['A. Knock', 'B. Keep walking']}
        onChoose={choice => dispatch({ type: choice === 0 ? 'knock' : 'skip' })} />}
      {!sceneTransition && state.mode === 'pitch' && <SceneChoices key="pitch" choices={[
        'A. I build websites. Do you need one?',
        'B. Does your website need any improvements?',
      ]} onChoose={() => dispatch({ type: 'pitch' })} />}
      {!text && state.mode === 'reaction' && <PixelText text={state.meetings === 3
        ? 'It worked! I built a freelance business that supported my family for years.'
        : state.meetings === 2
        ? 'The legwork was grueling , and the rejection was brutal. But...'
        : ''} />}
    </div>
    {sceneTransition && <div key={sceneTransition} className={`scene-fade${sceneTransition === 'in' ? ' scene-reveal' : ''}`}
      role="status" aria-label={sceneTransition === 'in' ? 'Fade in flashback' : 'Return to interview'}
      onAnimationEnd={() => {
        if (sceneTransition === 'in') setTransition(null)
        else onComplete()
      }} />}
  </section>
}
