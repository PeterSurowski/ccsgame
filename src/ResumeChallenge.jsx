import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { resumeCandidates, shuffleCandidates, applyCandidateEffects, resumeOutcome, nextResumeIndex } from './resumeCandidates.js'
import ResumeResult from './ResumeResult.jsx'

const photos = import.meta.glob('./assets/scenes/ProfilePic-*', { eager: true, query: '?url', import: 'default' })

export default function ResumeChallenge({ scores, scoresAnimating, onEffect, onRetry }) {
  const [deck] = useState(() => shuffleCandidates(resumeCandidates))
  const [index, setIndex] = useState(0)
  const [hires, setHires] = useState([])
  const [status, setStatus] = useState('card')
  const [exitDirection, setExitDirection] = useState('right')
  const [outcome, setOutcome] = useState('card')
  const [error, setError] = useState('')
  const locked = useRef(false)
  const gesture = useRef(null)
  const cardRef = useRef(null)
  const areaRef = useRef(null)
  const [effectIndex, setEffectIndex] = useState(0)
  const appliedEffect = useRef(null)
  const candidate = deck[index]

  useEffect(() => {
    if (status === 'card') locked.current = false
  }, [index, status])

  const decide = useCallback(accept => {
    if (status !== 'card' || scoresAnimating || error || locked.current) return
    locked.current = true
    setExitDirection(accept ? 'right' : 'left')
    if (accept) {
      const nextScores = applyCandidateEffects(scores, candidate)
      setHires(previous => [...previous, candidate.id])
      setOutcome(resumeOutcome(nextScores, hires.length + 1))
    } else {
      setOutcome(resumeOutcome(scores, hires.length))
    }
    setStatus('exiting')
  }, [status, scoresAnimating, error, scores, candidate, hires.length])

  useLayoutEffect(() => {
    if (status !== 'card') return
    const card = cardRef.current
    const area = areaRef.current
    function fit() {
      let low = 1
      let high = area.clientWidth * .034
      for (let attempt = 0; attempt < 12; attempt += 1) {
        const size = (low + high) / 2
        card.style.fontSize = `${size}px`
        if (card.scrollHeight <= card.clientHeight && card.scrollWidth <= card.clientWidth) low = size
        else high = size
      }
      card.style.fontSize = `${low}px`
    }
    const observer = new ResizeObserver(fit)
    observer.observe(area)
    fit()
    return () => observer.disconnect()
  }, [candidate, status])

  useEffect(() => {
    if (status !== 'scoring') return
    const token = `${index}:${effectIndex}`
    if (appliedEffect.current !== token) {
      appliedEffect.current = token
      onEffect(candidate.effects[effectIndex])
    }
    const timer = setTimeout(() => {
      onEffect(null)
      if (effectIndex < candidate.effects.length - 1) setEffectIndex(previous => previous + 1)
      else if (outcome === 'card') {
        setIndex(nextResumeIndex(deck, index, hires))
        setStatus('card')
      } else setStatus(outcome)
    }, 1500)
    return () => clearTimeout(timer)
  }, [status, index, effectIndex, candidate, onEffect, outcome, deck, hires])

  useEffect(() => {
    function keyDown(event) {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.code)) return
      event.preventDefault()
      if (!event.repeat) decide(event.code === 'ArrowRight')
    }
    window.addEventListener('keydown', keyDown)
    return () => window.removeEventListener('keydown', keyDown)
  }, [decide])

  if (['success', 'revolt'].includes(status)) {
    return <ResumeResult won={status === 'success'} onRetry={onRetry} />
  }

  return <section className="resume-challenge" aria-label="Resume Challenge">
    {['card', 'exiting'].includes(status) && <>
      <header className="resume-progress">
        <strong>{hires.length}/3 hired</strong><span>Resume {index + 1} of {deck.length}</span>
      </header>
      <div className="resume-card-area" ref={areaRef}
        onPointerDown={event => {
          if (status !== 'card' || !event.isPrimary || event.button !== 0 || event.target.closest('button')) return
          gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY }
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerMove={event => {
          const start = gesture.current
          if (start?.id === event.pointerId && Math.abs(event.clientY - start.y) > 40
            && Math.abs(event.clientY - start.y) > Math.abs(event.clientX - start.x)) gesture.current = null
        }}
        onPointerUp={event => {
          const start = gesture.current
          gesture.current = null
          if (start?.id !== event.pointerId) return
          const dx = event.clientX - start.x
          const dy = event.clientY - start.y
          if (Math.abs(dx) >= 60 && Math.abs(dx) > Math.abs(dy) * 1.25) decide(dx > 0)
        }}
        onPointerCancel={() => { gesture.current = null }}
        onLostPointerCapture={() => { gesture.current = null }}>
        <article ref={cardRef} className={`resume-card${status === 'exiting'
          ? ` resume-card-exit resume-card-exit-${exitDirection}` : ''}`}
          aria-label={`${candidate.name} resume`}
          onAnimationEnd={() => {
            if (status !== 'exiting') return
            if (exitDirection === 'right') {
              setEffectIndex(0)
              setStatus('scoring')
            } else if (outcome === 'card') {
              setIndex(nextResumeIndex(deck, index, hires))
              setStatus('card')
            } else setStatus(outcome)
          }}>
          <div className="resume-person">
            <img src={photos[`./assets/scenes/${candidate.photo}`]} alt={candidate.name} draggable="false"
              onError={() => {
                console.error('Candidate portrait failed to load:', candidate.photo)
                setError(`Unable to load ${candidate.name}'s portrait. Please reload the page.`)
              }} />
            <h1>{candidate.name}</h1>
          </div>
          <dl><dt>Tech exp</dt><dd>{candidate.tech}</dd>
            <dt>Teaching exp</dt><dd>{candidate.teaching}</dd>
            <dt>Degree</dt><dd>{candidate.degree}</dd></dl>
          <h2>Summary</h2><p>{candidate.summary}</p>
          <h2>Strengths</h2><ul>{candidate.strengths.map(text => <li key={text}>{text}</li>)}</ul>
          <h2>Weaknesses</h2><ul>{candidate.weaknesses.map(text => <li key={text}>{text}</li>)}</ul>
        </article>
      </div>
      <footer className="resume-actions">
          <p>Swipe or use Left/Right.</p>
          <div><button onClick={() => decide(false)} disabled={status !== 'card' || !!error || scoresAnimating}>Left: Reject</button>
            <button onClick={() => decide(true)} disabled={status !== 'card' || !!error || scoresAnimating}>Right: Accept</button></div>
      </footer>
    </>}
    {error && <p className="video-notice" role="alert">{error}</p>}
  </section>
}
