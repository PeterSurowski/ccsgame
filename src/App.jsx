import { useCallback, useState } from 'react'
import Worldview from './Worldview.jsx'
import OpeningScene from './OpeningScene.jsx'
import SleepingScene from './SleepingScene.jsx'
import CampusMap from './CampusMap.jsx'
import PhilipScene from './PhilipScene.jsx'
import useAnimatedScores from './useAnimatedScores.js'
import ccsLogo from './assets/ccslogo.jpg'
import './App.css'

const initialScores = [
  { label: 'Budget', value: 100 },
  { label: 'Ave. GPA', value: 85 },
  { label: 'Job Placement', value: 20 },
  { label: 'Engagement', value: 0 },
]

function App() {
  const [scoreTargets, setScoreTargets] = useState(initialScores)
  const { scores, isAnimating, audioError } = useAnimatedScores(scoreTargets)
  const raiseEngagement = useCallback(() => {
    setScoreTargets(previous => previous.map(score => score.label === 'Engagement'
      ? { ...score, value: Math.min(100, score.value + 10) } : score))
  }, [])
  const [mode, setMode] = useState('story')
  const enterClassroom = useCallback(() => setMode('sleeping'), [])
  const enterQuad = useCallback(() => setMode('quad'), [])
  const meetPhilip = useCallback(() => setMode('philip'), [])
  const [professor, setProfessor] = useState(null)
  const chooseProfessor = useCallback(choice => {
    setProfessor(choice)
    setMode('campus-map')
  }, [])

  return (
    <div className="game-shell">
      <header className="score-header">
        <img className="ccs-logo" src={ccsLogo} alt="CCS" />
        <section className="scores" aria-label="Department scores">
          {scores.map(({ label, value }) => (
            <div className="score" key={label}>
              <span className="score-label">{label}</span>
              <strong>{value}<span>/100</span></strong>
              <div role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100}
                aria-valuenow={value} className="meter">
                <span style={{ width: `${value}%` }} />
              </div>
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
          <CampusMap professor={professor} onContinue={enterQuad} />
        </main>
      ) : mode === 'quad' ? (
        <main className="worldview-main">
          <Worldview key="quad" quad professor={professor} onMeetPhilip={meetPhilip} />
        </main>
      ) : (
        <main className="video-main">
          <PhilipScene onRaiseEngagement={raiseEngagement} scoresAnimating={isAnimating} />
        </main>
      )}
    </div>
  )
}

export default App
