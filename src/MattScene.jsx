import { useEffect, useRef, useState } from 'react'
import useSceneAdvance from './useSceneAdvance.js'
import { mattDialogue, mattFollowup, mattDecision } from './mattDialogue.js'
import SceneChoices from './SceneChoices.jsx'
import GameOver from './GameOver.jsx'
import mattFrame from './assets/scenes/CCSGame-MattRaupp.png'
import studentFrame from './assets/scenes/CCSGame-student.png'
import happyFrame from './assets/scenes/CCSGame-MattRauppHappy.png'
import weepingFrame from './assets/scenes/CCSGame-StudentWeeping.png'
import hallwayFrame from './assets/scenes/CCSGame-TalkInHallway.png'
import susanFrame from './assets/scenes/CCSGame-SusanAtKeyboard.png'
import sleepingFrame from './assets/scenes/CCSGame-MattRauppSleeping.png'
import thinkingFrame from './assets/scenes/CCSGame-SusanThinking.png'
import pushingFrame from './assets/scenes/CCSGame-MattRauppPushingThrough.png'
import mobbedFrame from './assets/scenes/CCSGame-MattRauppMobbed.png'

const stills = [
  { key: 'matt', src: mattFrame, alt: 'Matt Raupp reviewing a student project' },
  { key: 'student', src: studentFrame, alt: 'Student answering nervously' },
  { key: 'happy', src: happyFrame, alt: 'Matt Raupp happy with the student' },
  { key: 'weeping', src: weepingFrame, alt: 'Student weeping' },
  { key: 'hallway', src: hallwayFrame, alt: 'Susan and Matt talking in the hallway' },
  { key: 'susan', src: susanFrame, alt: 'Susan at her keyboard' },
  { key: 'sleeping', src: sleepingFrame, alt: 'Matt Raupp sleeping' },
  { key: 'thinking', src: thinkingFrame, alt: 'Susan thinking' },
  { key: 'pushing', src: pushingFrame, alt: 'Matt Raupp pushing through' },
  { key: 'mobbed', src: mobbedFrame, alt: 'Matt Raupp mobbed by students' },
]

export default function MattScene({
  onComplete, scoresAnimating, askedProfessors, onAskPhilip, onClearEngagement, onRestart, onHire,
}) {
  const [step, setStep] = useState(0)
  const [status, setStatus] = useState('dialogue')
  const [error, setError] = useState('')
  const completedRef = useRef(false)
  const dialogue = status === 'dialogue' ? mattDialogue[step]
    : status === 'decision' ? mattDecision(askedProfessors) : mattFollowup[status]
  const image = status === 'revealing' ? 'susan'
    : status === 'failure-revealing' ? 'pushing'
    : ['failure-fading', 'philip-fading', 'hire-fading'].includes(status) ? 'thinking'
    : status === 'ending-fading' ? 'mobbed'
    : status === 'fading' ? 'hallway' : dialogue?.image
  const advanceHandlers = useSceneAdvance(
    !error && (status === 'dialogue' || Boolean(dialogue?.advance) || status === 'game-over'), () => {
    if (status === 'game-over') onRestart()
    else if (status !== 'dialogue') setStatus(dialogue.advance)
    else if (step < mattDialogue.length - 1) setStep(previous => previous + 1)
    else setStatus('fading')
  })

  useEffect(() => {
    if (!['scoring', 'failure-scoring'].includes(status) || scoresAnimating) return
    const frame = requestAnimationFrame(() =>
      setStatus(status === 'scoring' ? 'revealing' : 'failure-revealing'))
    return () => cancelAnimationFrame(frame)
  }, [status, scoresAnimating])

  return (
    <section className="opening-scene" aria-label="Meet Matt Raupp scene" {...advanceHandlers}>
      {stills.map(still => <img key={still.key} className="freeze-frame" src={still.src} alt={still.alt}
        style={{ visibility: image === still.key ? 'visible' : 'hidden' }}
        onError={() => {
          console.error('Matt scene image failed to load:', still.src)
          setError(`Unable to load the image: ${still.alt}. Please reload the page.`)
        }} />)}
      {dialogue && !error && <div className="video-dialogue"
        role={dialogue.choices ? 'group' : 'status'}
        aria-label={dialogue.choices ? 'Matt conversation choices' : undefined}>
        {dialogue.lines.map(line => <p key={line}>{line}</p>)}
        {dialogue.choices ? <SceneChoices key={status} choices={dialogue.choices}
          disabled={dialogue.disabled} onChoose={index => setStatus(dialogue.next[index])} />
          : <small>Tap the screen or press the spacebar to continue.</small>}
      </div>}
      {status === 'fading' && <div className="scene-fade" role="status" aria-label="Fade to black"
        onAnimationEnd={() => {
          if (completedRef.current) return
          completedRef.current = true
          onComplete()
          setStatus('scoring')
        }} />}
      {status === 'scoring' && <div className="scene-black" role="status"
        aria-label="Engagement and job placement increasing" />}
      {status === 'revealing' && <div className="scene-fade scene-reveal" role="status"
        aria-label="Fade in Susan" onAnimationEnd={() => setStatus('susan')} />}
      {status === 'philip-fading' && <div className="scene-fade" role="status"
        aria-label="Fade to campus map" onAnimationEnd={onAskPhilip} />}
      {status === 'hire-fading' && <div className="scene-fade" role="status"
        aria-label="Fade to hiring" onAnimationEnd={onHire} />}
      {status === 'failure-fading' && <div className="scene-fade" role="status"
        aria-label="Fade to black" onAnimationEnd={() => {
          onClearEngagement()
          setStatus('failure-scoring')
        }} />}
      {status === 'failure-scoring' && <div className="scene-black" role="status"
        aria-label="Engagement decreasing" />}
      {status === 'failure-revealing' && <div className="scene-fade scene-reveal" role="status"
        aria-label="Fade in Matt teaching" onAnimationEnd={() => setStatus('pushing')} />}
      {status === 'ending-fading' && <div className="scene-fade" role="status"
        aria-label="Fade to ending" onAnimationEnd={() => setStatus('game-over')} />}
      {status === 'game-over' && <GameOver />}
      {error && <p className="video-notice" role="alert">{error}</p>}
    </section>
  )
}
