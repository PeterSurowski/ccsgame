import { useState } from 'react'
import useSceneAdvance from './useSceneAdvance.js'
import susanFrame from './assets/scenes/CCSGame-SusanAtKeyboard.png'
import ccsLogo from './CCSlogo.jpg'
import ResumeChallenge from './ResumeChallenge.jsx'

export default function ResumeScene({ onStartup, scores, scoresAnimating, onEffect, onRestore, onRestart }) {
  const [entryScores] = useState(scores)
  const [attempt, setAttempt] = useState(0)
  const [status, setStatus] = useState('revealing')
  const [error, setError] = useState('')
  const handlers = useSceneAdvance(['susan', 'challenge'].includes(status) && !error, () => {
    if (status === 'susan') {
      setStatus('challenge')
      onStartup()
    } else setStatus('playing')
  })

  function imageError(src) {
    console.error('Resume scene image failed to load:', src)
    setError('Unable to load the resume scene artwork. Please reload the page.')
  }

  if (status === 'playing') return <ResumeChallenge key={attempt} scores={scores} scoresAnimating={scoresAnimating}
    onEffect={onEffect} onRestart={onRestart} onRetry={() => {
      onRestore(entryScores)
      setAttempt(previous => previous + 1)
    }} />

  return <section className={`opening-scene${status === 'challenge' ? ' resume-logo-screen' : ''}`}
    aria-label="Resume Challenge introduction" {...handlers}>
    <img className="freeze-frame" src={susanFrame} alt="Susan at her keyboard"
      style={{ visibility: status === 'challenge' ? 'hidden' : 'visible' }}
      onError={() => imageError(susanFrame)} />
    <div className="resume-signin-art" style={{ visibility: status === 'challenge' ? 'visible' : 'hidden' }}>
      <img className="resume-intro-logo" src={ccsLogo} alt="CCS"
        onError={() => imageError(ccsLogo)} />
      <div className="resume-instructions">
        <h1>Resume Challenge!</h1>
        <p>Find three candidates that will raise your stats!</p>
        <div className="resume-swipe-guide" role="img"
          aria-label="Swipe left for bad candidates or right for good candidates.">
          <span>Bad<br />Candidates</span>
          <svg viewBox="0 0 120 90" aria-hidden="true">
            <path className="resume-swipe-track" d="M 12 38 H 108 M 22 28 L 12 38 L 22 48 M 98 28 L 108 38 L 98 48" />
            <g className="resume-swipe-finger">
              <circle cx="60" cy="27" r="13" className="controls-touch-contact" />
              <path className="controls-hand" d="M 52 65 L 43 50 Q 40 44 45 43 Q 48 42 52 48 L 52 26 Q 52 20 57 20 Q 62 20 62 26 L 62 43 L 66 40 Q 70 39 73 43 Q 78 40 81 46 L 85 48 L 84 66 Q 83 73 77 77 L 60 77 Z" />
            </g>
          </svg>
          <span>Good<br />Candidates</span>
        </div>
        <svg className="resume-key-guide" viewBox="0 0 160 60" role="img"
          aria-label="Use the left and right arrow keys to sort candidates.">
          <g className="resume-key-left"><rect x="4" y="4" width="64" height="52" rx="8" />
            <path d="M 49 30 H 23 M 34 19 L 23 30 L 34 41" /></g>
          <g className="resume-key-right"><rect x="92" y="4" width="64" height="52" rx="8" />
            <path d="M 111 30 H 137 M 126 19 L 137 30 L 126 41" /></g>
        </svg>
        <p className="resume-warning">Choose three candidates. If any final score is below 0, the students will revolt!</p>
        <button className="primary" onClick={() => setStatus('playing')} disabled={!!error}>Start challenge (Space or tap)</button>
      </div>
    </div>
    {status === 'susan' && !error && <div className="video-dialogue" role="status">
      <p>Susan: Time to go through these resumes.</p>
      <small>Tap the screen or press the spacebar to continue.</small>
    </div>}
    {status === 'revealing' && <div className="scene-fade scene-reveal" role="status"
      aria-label="Fade in Susan" onAnimationEnd={() => setStatus('susan')} />}
    {error && <p className="video-notice" role="alert">{error}</p>}
  </section>
}
