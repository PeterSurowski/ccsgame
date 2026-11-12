import { useEffect, useRef, useState } from 'react'
import useSceneAdvance from './useSceneAdvance.js'
import { addRescueStroke, createRescue, disposeRescue, extendStroke, rescueHeight,
  rescueStrokePoints, rescueWidth, updateRescue } from './studentRescue.js'
import background from './platformer-background.jpg'
import idle from './assets/platformer/students-idle.png'
import walking from './assets/platformer/students-walking.png'
import './StudentRescue.css'

const pointsAttribute = points => points.map(p => `${p.x},${p.y}`).join(' ')

function Student({ student, time }) {
  const { x, y } = student.body.position
  const dead = student.state === 'dead'
  const frame = dead ? 0 : Math.floor(time * 12) % 25
  return <g transform={`translate(${x} ${y + 5})${dead ? ' rotate(-90)' : ''}`}>
    <svg x="-20" y="-38.3" width="40" height="40"
      viewBox={`${frame * 96} ${student.variant * 96} 96 96`} overflow="hidden">
      <image href={dead ? idle : walking} width={dead ? 96 : 2400} height="480" />
    </svg>
  </g>
}

function RescueAttempt({ onComplete, onRetry }) {
  const gameRef = useRef(null)
  const svgRef = useRef(null)
  const viewportRef = useRef(null)
  const drawing = useRef(null)
  const [phase, setPhase] = useState('revealing')
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)
  const [ratio, setRatio] = useState(.65)
  const [snapshot, setSnapshot] = useState(null)
  const [draft, setDraft] = useState(null)
  const [drawingNotice, setDrawingNotice] = useState('')
  const phaseRef = useRef(phase)
  const width = Math.min(rescueWidth, rescueHeight * ratio)
  const game = snapshot
  const lead = Math.max(0, ...(game?.students
    .map(s => s.body.position.x) || []))
  const cameraX = Math.max(0, Math.min(rescueWidth - width, lead - width * .45))
  const handlers = useSceneAdvance(phase === 'intro' || phase === 'lost', () => {
    if (phase === 'lost') onRetry()
    else setPhase('playing')
  })

  useEffect(() => { phaseRef.current = phase }, [phase])
  useEffect(() => {
    const simulation = createRescue()
    gameRef.current = simulation
    let frame, previous
    const observer = new ResizeObserver(([entry]) => setRatio(entry.contentRect.width / entry.contentRect.height))
    observer.observe(viewportRef.current)
    function tick(now) {
      if (!document.hidden && phaseRef.current === 'playing') {
        updateRescue(simulation, previous === undefined ? 0 : (now - previous) / 1000)
        if (simulation.status !== 'running') setPhase(simulation.status)
        setSnapshot({ ...simulation })
        setRevision(value => value + 1)
      }
      previous = now
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      disposeRescue(simulation)
      gameRef.current = null
    }
  }, [])

  useEffect(() => {
    const images = [background, idle, walking].map(url => {
      const image = new Image()
      image.onerror = () => {
        console.error('Student rescue artwork failed to load:', url)
        setError('Unable to load student rescue artwork. Please reload the page.')
        setPhase('error')
      }
      image.src = url
      return image
    })
    return () => images.forEach(image => { image.onerror = null })
  }, [])

  function pointerPoint(event) {
    const matrix = svgRef.current.getScreenCTM()
    if (!matrix) throw new Error('Drawing viewport is unavailable')
    const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse())
    return { x: Math.max(0, Math.min(rescueWidth, p.x)), y: Math.max(0, Math.min(rescueHeight, p.y)) }
  }
  function finish(event, cancel = false) {
    const stroke = drawing.current
    if (!stroke || stroke.pointerId !== event.pointerId) return
    if (!cancel) {
      stroke.points = extendStroke(stroke.points, pointerPoint(event))
      const added = addRescueStroke(gameRef.current, stroke.points)
      setDrawingNotice(!added && stroke.points.length >= 2
        ? 'Not enough room for that line. Draw above the ground or existing lines.' : '')
    }
    drawing.current = null
    setDraft(null)
    setRevision(value => value + 1)
  }

  return <section className="student-rescue" aria-label="Draw to protect the students" {...handlers}>
    <div className="rescue-viewport" ref={viewportRef}>
      <svg ref={svgRef} viewBox={`${cameraX} 0 ${width} ${rescueHeight}`} className="rescue-map"
        data-frame={revision} aria-label="Draw bridges and a shelter" role="img"
        onPointerDown={event => {
          if (phase !== 'playing' || error || !event.isPrimary || event.button !== 0 || drawing.current) return
          event.preventDefault()
          drawing.current = { pointerId: event.pointerId, points: [pointerPoint(event)] }
          setDraft(drawing.current.points)
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerMove={event => {
          const stroke = drawing.current
          if (stroke?.pointerId !== event.pointerId) return
          stroke.points = extendStroke(stroke.points, pointerPoint(event))
          setDraft(stroke.points)
          setRevision(value => value + 1)
        }}
        onPointerUp={event => finish(event)}
        onPointerCancel={event => finish(event, true)}
        onLostPointerCapture={event => finish(event, true)}>
        <image href={background} width={rescueWidth} height={rescueHeight} />
        {game?.strokes.map((stroke, i) => <polyline key={i} points={pointsAttribute(rescueStrokePoints(stroke))}
          className="rescue-ink" />)}
        {draft && <polyline points={pointsAttribute(draft)} className="rescue-ink rescue-draft" />}
        {game?.bricks.map(brick => <rect key={brick.body.id} x="-5.5" y="-3.5" width="11" height="7"
          fill="#a34e32" stroke="#542f25" transform={`translate(${brick.body.position.x} ${brick.body.position.y}) rotate(${brick.body.angle * 180 / Math.PI})`} />)}
        {game?.fragments.map((fragment, i) => <rect key={i} x={fragment.x} y={fragment.y} width="3" height="3"
          fill="#b46b47" opacity={fragment.life / .65} />)}
        {game?.students.filter(student => student.state !== 'saved').map(student =>
          <Student key={student.body.id} student={student} time={game.time} />)}
      </svg>
    </div>
    {phase === 'playing' && <>
      {drawingNotice && <p className="rescue-narration" role="status">{drawingNotice}</p>}
      {!drawingNotice && (game?.kernClockReached || game?.thirdPlatformReached) && <p
        className="rescue-narration" role="status">
        {game.kernClockReached
          ? "Peter: With good skills, they can get a good job, and they'll be sheltered from many of the hardships we face in life."
          : 'Peter: I want to help them avoid the many pitfalls I fell into.'}
      </p>}
    </>}
    {phase === 'intro' && <>
      <div className="rescue-intro">
      <p>Peter: ... so I want to pass on the skills that have afforded me that life.</p>
      <h1>Draw to protect the students!</h1>
      </div>
      <svg className="rescue-input-guide" viewBox="0 0 160 65" aria-label="Draw with your finger or mouse" role="img">
        <g opacity=".6" fill="white" stroke="white" strokeWidth="2">
          <g className="rescue-drawing-finger">
          <path d="M22 51L14 34Q13 30 17 30L23 36V13Q23 7 28 7Q33 7 33 13V30L40 27L51 32V48L44 58H29Z" />
          </g>
          <g className="rescue-drawing-mouse">
          <rect x="98" y="7" width="34" height="49" rx="16" fill="none" />
          <path d="M115 8V28M99 28H131" fill="none" />
          </g>
        </g>
      </svg>
    </>}
    {phase === 'lost' && <div className="game-over rescue-loss" role="status">
      <h1>You failed!</h1>
      <p>Give these students what they need to succeed.</p>
      <p>Try again?</p>
      <small>Tap the screen or press Space to try again.</small>
    </div>}
    {(phase === 'revealing' || phase === 'won') && <div
      className={`scene-fade${phase === 'revealing' ? ' scene-reveal' : ''}`}
      onAnimationEnd={() => {
        if (phase === 'revealing') setPhase('intro')
        else onComplete()
      }} />}
    {error && <p className="video-notice" role="alert">{error}</p>}
  </section>
}

export default function StudentRescue({ onComplete }) {
  const [attempt, setAttempt] = useState(0)
  return <RescueAttempt key={attempt} onComplete={onComplete} onRetry={() => setAttempt(value => value + 1)} />
}
