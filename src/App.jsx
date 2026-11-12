import { useCallback, useState } from 'react'
import Worldview from './Worldview.jsx'
import OpeningScene from './OpeningScene.jsx'
import SleepingScene from './SleepingScene.jsx'
import CampusMap from './CampusMap.jsx'
import PhilipScene from './PhilipScene.jsx'
import MattScene from './MattScene.jsx'
import ResumeScene from './ResumeScene.jsx'
import { applyScoreEffect } from './resumeCandidates.js'
import useAnimatedScores from './useAnimatedScores.js'
import ccsLogo from './assets/ccslogo.jpg'
import './App.css'

const initialScores = [
  { label: 'Budget', value: 100 },
  { label: 'Ave. GPA', value: 85 },
  { label: 'Job Placement', value: 20 },
  { label: 'Engagement', value: 0 },
]

function Game({ onRestart }) {
  const [scoreTargets, setScoreTargets] = useState(initialScores)
  const { scores, isAnimating, audioError, playStartup } = useAnimatedScores(scoreTargets)
  const raiseEngagement = useCallback(() => {
    setScoreTargets(previous => previous.map(score => score.label === 'Engagement'
      ? { ...score, value: Math.min(100, score.value + 10) } : score))
  }, [])
  const clearEngagement = useCallback(() => {
    setScoreTargets(previous => previous.map(score => score.label === 'Engagement'
      ? { ...score, value: 0 } : score))
  }, [])
  const completeMatt = useCallback(() => {
    setScoreTargets(previous => previous.map(score =>
      ['Engagement', 'Job Placement'].includes(score.label)
        ? { ...score, value: Math.min(100, score.value + 10) } : score))
  }, [])
  const [scoreNotice, setScoreNotice] = useState(null)
  const showCandidateEffect = useCallback(effect => {
    setScoreNotice(effect)
    if (!effect) return
    setScoreTargets(previous => applyScoreEffect(previous, effect))
  }, [])
  const restoreResumeScores = useCallback(entryScores => {
    setScoreNotice(null)
    setScoreTargets(entryScores)
  }, [])
  const [mode, setMode] = useState('story')
  const enterClassroom = useCallback(() => setMode('sleeping'), [])
  const enterQuad = useCallback(() => setMode('quad'), [])
  const meetPhilip = useCallback(() => setMode('philip'), [])
  const hireProfessor = useCallback(() => setMode('resume'), [])
  const [professor, setProfessor] = useState(null)
  const [fadeInMap, setFadeInMap] = useState(false)
  const [askedProfessors, setAskedProfessors] = useState([])
  const meetMatt = useCallback(() => {
    setProfessor('matt')
    setAskedProfessors(previous => previous.includes('matt') ? previous : [...previous, 'matt'])
    setMode('matt')
  }, [])
  const chooseProfessor = useCallback((choice, fadeIn = false) => {
    setProfessor(choice)
    setFadeInMap(fadeIn)
    setAskedProfessors(previous => previous.includes(choice) ? previous : [...previous, choice])
    setMode('campus-map')
  }, [])
  const seekMatt = useCallback(() => chooseProfessor('matt', true), [chooseProfessor])
  const seekPhilip = useCallback(() => chooseProfessor('philip', true), [chooseProfessor])

  return (
    <div className="game-shell">
      <header className="score-header">
        <img className="ccs-logo" src={ccsLogo} alt="CCS" />
        <section className="scores" aria-label="Department scores">
          {scores.map(({ label, value }) => (
            <div className="score" key={label}>
              <span className="score-label">{label}</span>
              <strong>{value}<span>/100</span></strong>
              <div role="meter" aria-label={label} aria-valuemin={Math.min(0, value)} aria-valuemax={100}
                aria-valuenow={value} className="meter">
                <span style={{ width: `${Math.max(0, value)}%` }} />
              </div>
              {scoreNotice?.label === label && <div className="score-change" key={scoreNotice.label} role="status">
                <strong>{scoreNotice.delta > 0 ? '+' : ''}{scoreNotice.delta}</strong>
                <p>{scoreNotice.reason || 'No change'}</p>
              </div>}
            </div>
          ))}
        </section>
      </header>
      {audioError && <p className="score-audio-error" role="alert">{audioError}</p>}
      {mode === 'story' ? (
        <main className="video-main">
          <OpeningScene onContinue={() => setMode('worldview')} />
        </main>
      ) : mode === 'worldview' ? (
        <main className="worldview-main">
          <Worldview onEnterClassroom={enterClassroom} />
        </main>
      ) : mode === 'sleeping' ? (
        <main className="video-main">
          <SleepingScene onChoose={chooseProfessor} />
        </main>
      ) : mode === 'campus-map' ? (
        <main className="video-main">
          <CampusMap professor={professor} onContinue={enterQuad} fadeIn={fadeInMap} />
        </main>
      ) : mode === 'quad' ? (
        <main className="worldview-main">
          <Worldview key="quad" quad professor={professor} onMeetPhilip={meetPhilip} onMeetMatt={meetMatt} />
        </main>
      ) : mode === 'resume' ? (
        <main className="video-main">
          <ResumeScene onStartup={playStartup} scores={scoreTargets} scoresAnimating={isAnimating}
            onEffect={showCandidateEffect} onRestore={restoreResumeScores} onRestart={onRestart} />
        </main>
      ) : (
        <main className="video-main">
          {mode === 'matt' ? (
            <MattScene onComplete={completeMatt} scoresAnimating={isAnimating}
              askedProfessors={askedProfessors} onAskPhilip={seekPhilip}
              onClearEngagement={clearEngagement} onRestart={onRestart} onHire={hireProfessor} />
          ) : (
            <PhilipScene onRaiseEngagement={raiseEngagement} onClearEngagement={clearEngagement}
              scoresAnimating={isAnimating} askedProfessors={askedProfessors}
              onAskMatt={seekMatt} onRestart={onRestart} onHire={hireProfessor} />
          )}
        </main>
      )}
    </div>
  )
}

function App() {
  const [playthrough, setPlaythrough] = useState(0)
  return <Game key={playthrough} onRestart={() => setPlaythrough(previous => previous + 1)} />
}

export default App
