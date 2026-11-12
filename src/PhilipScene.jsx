import { useCallback, useEffect, useRef, useState } from 'react'
import meetingVideo from './assets/scenes/CCSGame-MeetPhilipMcAvoy.mp4'
import freezeFrame from './assets/scenes/CCSGame-PhilipMcAvoy.png'
import useSceneAdvance from './useSceneAdvance.js'
import thinkingFrame from './assets/scenes/CCSGame-McAvoyThinking.png'
import susanFrame from './assets/scenes/CCSGame-SusanAtKeyboard.png'
import weepingFrame from './assets/scenes/CCSGame-PhilipWeeping.png'
import susanThinkingFrame from './assets/scenes/CCSGame-SusanThinking.png'
import teachingFrame from './assets/scenes/CCSGame-PhilipTeaching.png'
import zombies1Frame from './assets/scenes/CCSGame-ZombieStudents1.png'
import zombies2Frame from './assets/scenes/CCSGame-ZombieStudents2.png'
import runningFrame from './assets/scenes/CCSGame-CCSGame-PhilipRunning.png'
import SceneChoices from './SceneChoices.jsx'
import GameOver from './GameOver.jsx'
import { philipDialogue, philipDecision } from './philipDialogue.js'

const stills = [
  { key: 'philip', src: freezeFrame, alt: 'Philip McAvoy after meeting Susan' },
  { key: 'thinking', src: thinkingFrame, alt: 'Philip McAvoy thinking' },
  { key: 'susan', src: susanFrame, alt: 'Susan at her keyboard' },
  { key: 'weeping', src: weepingFrame, alt: 'Philip McAvoy weeping' },
  { key: 'susan-thinking', src: susanThinkingFrame, alt: 'Susan thinking' },
  { key: 'teaching', src: teachingFrame, alt: 'Philip teaching the class' },
  { key: 'zombies1', src: zombies1Frame, alt: 'Zombie students awakening' },
  { key: 'zombies2', src: zombies2Frame, alt: 'Zombie students standing up' },
  { key: 'running', src: runningFrame, alt: 'Philip running away' },
]

export default function PhilipScene({
  onRaiseEngagement, onClearEngagement, scoresAnimating, askedProfessors, onRestart, onAskMatt, onHire,
}) {
  const videoRef = useRef(null)
  const finishedRef = useRef(false)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  const play = useCallback(async () => {
    if (finishedRef.current) return
    const video = videoRef.current
    try {
      await video.play()
    } catch (failure) {
      if (finishedRef.current) return
      if (failure.name === 'AbortError' && !video.isConnected) return
      if (failure.name === 'NotAllowedError') {
        setStatus('start-required')
      } else {
        console.error('Philip meeting video playback failed:', failure)
        setError(`Unable to play the Philip meeting video: ${failure.message}`)
        setStatus('error')
      }
    }
  }, [])

  const finish = useCallback(() => {
    finishedRef.current = true
    videoRef.current.pause()
    setStatus('ended')
  }, [])
  const dialogue = status === 'decision' ? philipDecision(askedProfessors) : philipDialogue[status]
  const afterVideo = Boolean(dialogue)
    || ['fading', 'scoring', 'revealing', 'failure-fading', 'failure-scoring', 'matt-fading', 'hire-fading', 'game-over'].includes(status)
  const image = status === 'revealing' ? 'susan'
    : ['failure-fading', 'matt-fading', 'hire-fading'].includes(status) ? 'susan-thinking' : dialogue?.image ?? 'philip'
  const advance = useCallback(() => {
    if (status === 'game-over') onRestart()
    else if (dialogue?.advance) setStatus(dialogue.advance)
    else finish()
  }, [dialogue, finish, status, onRestart])
  const advanceHandlers = useSceneAdvance(
    Boolean(dialogue?.advance) || ['loading', 'playing', 'start-required', 'game-over'].includes(status), advance)

  useEffect(() => {
    const video = videoRef.current
    return () => video.pause()
  }, [])

  useEffect(() => {
    if (!['scoring', 'failure-scoring'].includes(status) || scoresAnimating) return
    const frame = requestAnimationFrame(() => setStatus(status === 'scoring' ? 'revealing' : 'teaching'))
    return () => cancelAnimationFrame(frame)
  }, [status, scoresAnimating])

  return (
    <section className="opening-scene" aria-label="Meet Philip McAvoy scene" {...advanceHandlers}>
      <video ref={videoRef} src={meetingVideo} playsInline preload="auto"
        onLoadedData={play} aria-label="Susan meets Philip McAvoy"
        style={{ visibility: afterVideo ? 'hidden' : 'visible' }}
        onPlaying={() => { if (!finishedRef.current) setStatus('playing') }} onEnded={finish}
        onError={event => {
          console.error('Philip meeting video media error:', event.currentTarget.error)
          setError('Unable to load the Philip meeting video. Please reload the page or try another browser.')
          setStatus('error')
        }} />
      {stills.map(still => <img key={still.key} className="freeze-frame" src={still.src} alt={still.alt}
        style={{ visibility: afterVideo && image === still.key ? 'visible' : 'hidden' }}
        onError={() => {
          console.error('Philip scene image failed to load:', still.src)
          setError(`Unable to load the image: ${still.alt}. Please reload the page.`)
          setStatus('error')
        }} />)}
      {status === 'loading' && <p className="video-notice" role="status">Loading Philip meeting video...</p>}
      {status === 'start-required' && (
        <div className="video-notice">
          <p>Tap to start the Philip meeting video with sound.</p>
          <button className="primary" onClick={play}>Play Philip meeting video</button>
        </div>
      )}
      {status === 'error' && <p className="video-notice" role="alert">{error}</p>}
      {dialogue && (
        <div className="video-dialogue classroom-choices" role={dialogue.choices ? 'group' : 'status'}
          aria-label={dialogue.choices ? 'Philip conversation choices' : undefined}>
          {dialogue.lines.map(line => <p key={line}>{line}</p>)}
          {dialogue.choices && <SceneChoices key={status} choices={dialogue.choices}
            disabled={dialogue.disabled}
            onChoose={index => {
              const next = dialogue.next[index]
              if (next === 'matt') setStatus('matt-fading')
              else setStatus(next)
            }} />}
          {(dialogue.advance || dialogue.prompt) && <small>Tap the screen or press the spacebar to continue.</small>}
        </div>
      )}
      {status === 'fading' && <div className="scene-fade" role="status" aria-label="Fade to black"
        onAnimationEnd={() => {
          onRaiseEngagement()
          setStatus('scoring')
        }} />}
      {status === 'scoring' && <div className="scene-black" role="status" aria-label="Engagement increasing" />}
      {status === 'revealing' && <div className="scene-fade scene-reveal" role="status" aria-label="Fade in Susan"
        onAnimationEnd={() => setStatus('susan')} />}
      {status === 'failure-fading' && <div className="scene-fade" role="status" aria-label="Fade to black"
        onAnimationEnd={() => {
          onClearEngagement()
          setStatus('failure-scoring')
        }} />}
      {status === 'failure-scoring' && <div className="scene-black" role="status" aria-label="Engagement decreasing" />}
      {status === 'matt-fading' && <div className="scene-fade" role="status" aria-label="Fade to campus map"
        onAnimationEnd={onAskMatt} />}
      {status === 'hire-fading' && <div className="scene-fade" role="status" aria-label="Fade to hiring"
        onAnimationEnd={onHire} />}
      {status === 'game-over' && <GameOver />}
    </section>
  )
}
