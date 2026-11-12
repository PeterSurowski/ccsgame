import { useState } from 'react'
import useSceneAdvance from './useSceneAdvance.js'
import SceneChoices from './SceneChoices.jsx'
import PeterFlashback from './PeterFlashback.jsx'
import MazeGame from './MazeGame.jsx'
import StudentRescue from './StudentRescue.jsx'
import HappyEnding from './HappyEnding.jsx'
import ZombieChase from './ZombieChase.jsx'
import { finishInterviewGame, interviewFinished } from './interviewEnding.js'
import { completeInterviewChoice } from './mazeGame.js'
import zombies from './assets/scenes/CCSGame-ZombiesInHallway.png'
import conference from './assets/scenes/CCSGame-Conference.png'
import resume from './assets/scenes/CCSGame-resume.png'
import interview from './assets/scenes/CCSGame-SusanAndPeter.png'

const frames = [
  { key: 'loss', src: zombies, alt: 'Zombies in the hallway' },
  { key: 'conference', src: conference, alt: 'Susan at the conference' },
  { key: 'resume', src: resume, alt: 'Peter Surowski resume' },
  { key: 'interview', src: interview, alt: 'Susan interviewing Peter' },
]

export default function ResumeResult({ won, onRetry, onRestart }) {
  const [page, setPage] = useState(won ? 'conference' : 'loss')
  const [transition, setTransition] = useState('out')
  const [error, setError] = useState('')
  const [chosen, setChosen] = useState([])
  const [completed, setCompleted] = useState([])
  const readyToHire = interviewFinished(completed)
  const handlers = useSceneAdvance(!transition && !error && !['interview', 'flashback', 'maze', 'rescue', 'happy', 'chase'].includes(page), () => {
    if (page === 'loss') onRetry()
    else if (page === 'conference') setPage('resume')
    else if (page === 'trail-intro') setTransition('flashback-out')
    else if (page === 'maze-intro') setTransition('maze-out')
    else if (page === 'rescue-intro') setTransition('rescue-out')
    else if (page === 'maze-reflection') setPage('interview')
    else if (page === 'rejected') setTransition('chase-out')
    else setTransition('interview-out')
  })

  function finishGame(choice) {
    const result = finishInterviewGame(completed, choice)
    setCompleted(result.completed)
    setPage(result.page)
    setTransition('in')
  }

  if (page === 'flashback') return <PeterFlashback onComplete={() => finishGame(1)} />
  if (page === 'maze') return <MazeGame onComplete={() => finishGame(0)} />
  if (page === 'rescue') return <StudentRescue onComplete={() => finishGame(2)} />
  if (page === 'happy') return <HappyEnding onRestart={onRestart} />
  if (page === 'chase') return <ZombieChase onRestart={onRestart} />

  return <section className="opening-scene" aria-label="Resume Challenge result" {...handlers}>
    {frames.map(frame => <img className="freeze-frame" key={frame.key} src={frame.src} alt={frame.alt}
      style={{ visibility: transition !== 'out' && (page === frame.key
        || ['trail-intro', 'maze-intro', 'maze-reflection', 'rescue-intro', 'rejected'].includes(page) && frame.key === 'interview')
        ? 'visible' : 'hidden' }}
      onError={() => {
        console.error('Resume result image failed to load:', frame.src)
        setError(`Unable to load ${frame.alt}. Please reload the page.`)
      }} />)}
    {!transition && !error && <div className="video-dialogue" role={page === 'interview' ? 'group' : 'status'}
      aria-label={page === 'interview' ? 'Peter interview questions' : undefined}>
      {page === 'loss' ? <>
        <p>Don't finish with a score below 0</p>
        <h1>TRY AGAIN!</h1>
      </> : page === 'conference' ? (
        <p>Susan: I've chosen three candidates. We're each going to interview one. Looks like my candidate is...</p>
      ) : page === 'resume' ? <p>Susan: ..Peter Surowski</p> : page === 'trail-intro'
        ? <p>Peter: It all started with Oregon Trail...</p> : page === 'maze-intro'
        ? <p>Peter: It all started at Mt. San Jacinto College...</p> : page === 'maze-reflection'
        ? <p>Peter: That was my first taste of college life. I had so many great professors that they made me want to be like them, do for others what they did for me.</p> : page === 'rescue-intro'
        ? <p>Peter: Because I love to teach! I feel so lucky to have the life I have...</p> : page === 'rejected' ? <>
          <p>Peter: I'm sorry to hear that, but I respect your decision.</p>
          <p>Susan: I'll see you to the door.</p>
        </> : readyToHire ? <>
          <p>Peter: I'd love to work here if it seems like a good fit to you. What do you say?</p>
          <SceneChoices key="hire" choices={['A. Hire him!', "B. It's not a good fit."]}
            onChoose={choice => {
              if (choice === 0) setTransition('happy-out')
              else setPage('rejected')
            }} />
        </> : <>
        <p>Peter Surowski: Thank you for this opportunity!</p>
        <p>Susan: My pleasure! So...</p>
        <SceneChoices key="questions" choices={[
          'A. How did you first get interested in teaching at the college level?',
          'B. How did you first get interested in UX design?',
          'C. Why are you interested in this position?',
        ]} disabled={chosen} onChoose={choice => {
          if (chosen.includes(choice)) return
          setChosen(previous => completeInterviewChoice(previous, choice))
          if (choice === 0) setPage('maze-intro')
          else if (choice === 1) setPage('trail-intro')
          else if (choice === 2) setPage('rescue-intro')
        }} />
      </>}
      {page !== 'interview' && <small>{page === 'loss'
        ? 'Tap the screen or press the spacebar to try again.'
        : 'Tap the screen or press the spacebar to continue.'}</small>}
    </div>}
    {transition && <div key={transition} className={`scene-fade${transition === 'in' ? ' scene-reveal' : ''}`}
      role="status" aria-label={transition === 'in' ? 'Fade in result' : 'Fade to black'}
      onAnimationEnd={() => {
        if (transition === 'out') setTransition('in')
        else if (transition === 'interview-out') {
          setPage('interview')
          setTransition('in')
        } else if (transition === 'flashback-out') {
          setPage('flashback')
          setTransition(null)
        } else if (transition === 'maze-out') {
          setPage('maze')
          setTransition(null)
        } else if (transition === 'rescue-out') {
          setPage('rescue')
          setTransition(null)
        } else if (transition === 'happy-out' || transition === 'chase-out') {
          setPage(transition === 'happy-out' ? 'happy' : 'chase')
          setTransition(null)
        } else setTransition(null)
      }} />}
    {error && <p className="video-notice" role="alert">{error}</p>}
  </section>
}
