import { useCallback, useEffect, useRef, useState } from 'react'
import sleepingVideo from './assets/scenes/CCSGame-scene-sleepingstudents-h264.mp4'
import freezeFrame from './assets/scenes/freezeframe-sleepingstudents.png'
import useSceneAdvance from './useSceneAdvance.js'
import SceneChoices from './SceneChoices.jsx'

export default function SleepingScene({ onChoose }) {
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
        console.error('Sleeping-students video playback failed:', failure)
        setError(`Unable to play the sleeping-students video: ${failure.message}`)
        setStatus('error')
      }
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    return () => video.pause()
  }, [])

  const finish = useCallback(() => {
    finishedRef.current = true
    videoRef.current.pause()
    setStatus('dialogue')
  }, [])
  const advance = useCallback(() => {
    if (status === 'dialogue') setStatus('choices')
    else finish()
  }, [status, finish])
  const advanceHandlers = useSceneAdvance(status !== 'error' && status !== 'choices', advance)
  const ended = status === 'dialogue' || status === 'choices'

  return (
    <section className="opening-scene" aria-label="Sleeping students scene" {...advanceHandlers}>
      <video ref={videoRef} src={sleepingVideo} playsInline preload="auto"
        onLoadedData={play}
        aria-label="Susan discovers the sleeping students"
        style={{ visibility: ended ? 'hidden' : 'visible' }}
        onPlaying={() => { if (!finishedRef.current) setStatus('playing') }}
        onEnded={finish}
        onError={event => {
          console.error('Sleeping-students video media error:', event.currentTarget.error)
          setError('Unable to load the sleeping-students video. Please reload the page or try another browser.')
          setStatus('error')
        }} />
      <img className="freeze-frame" src={freezeFrame} alt="Susan and Chad at the classroom doorway"
        style={{ visibility: ended ? 'visible' : 'hidden' }}
        onError={() => {
          console.error('Sleeping-students freeze frame failed to load:', freezeFrame)
          setError('Unable to load the sleeping-students freeze frame. Please reload the page.')
          setStatus('error')
        }} />
      {status === 'loading' && <p className="video-notice" role="status">Loading classroom video...</p>}
      {status === 'start-required' && (
        <div className="video-notice">
          <p>Tap to start the classroom video with sound.</p>
          <button className="primary" onClick={play}>Play classroom video</button>
        </div>
      )}
      {status === 'error' && <p className="video-notice" role="alert">{error}</p>}
      {status === 'dialogue' && (
        <div className="video-dialogue" role="status">
          <p>Susan: What's happening?</p>
          <p>Chad: It's our engagement score. It's dropped to zero. The professor can't keep them awake.</p>
          <small>Tap the screen or hit the spacebar to continue.</small>
        </div>
      )}
      {status === 'choices' && (
        <div className="video-dialogue classroom-choices" role="group" aria-label="Choose a professor">
          <p><strong>What will you do?</strong></p>
          <SceneChoices choices={[
            "A. Ask Professor Philip McAvoy to teach the class. He's a seasoned professor. He'll know what to do.",
            "B. Ask Professor Matt Raupp to teach the class. He's an expert in UX. If anyone can breathe life into the topic, it's him.",
          ]} onChoose={index => onChoose(index === 0 ? 'philip' : 'matt')} />
        </div>
      )}
    </section>
  )
}
