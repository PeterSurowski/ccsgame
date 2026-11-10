import { useCallback, useEffect, useRef, useState } from 'react'
import openingVideo from './assets/scenes/CCSGame-scene1.mp4'
import freezeFrame from './assets/scenes/freezeframe1.png'
import introImage from './assets/intro.png'
import useSceneAdvance from './useSceneAdvance.js'

export default function OpeningScene({ onContinue }) {
  const videoRef = useRef(null)
  const [status, setStatus] = useState('intro')
  const startedRef = useRef(false)
  const finishedRef = useRef(false)
  const [showDialogue, setShowDialogue] = useState(false)
  const [error, setError] = useState('')

  const play = useCallback(async () => {
    if (finishedRef.current) return
    try {
      await videoRef.current.play()
    } catch (failure) {
      if (finishedRef.current) return
      if (failure.name === 'NotAllowedError') {
        setStatus('start-required')
      } else if (failure.name !== 'AbortError') {
        console.error('Opening video playback failed:', failure)
        setError(`Unable to play the opening video: ${failure.message}`)
        setStatus('error')
      }
    }
  }, [])

  const finish = useCallback(() => {
    finishedRef.current = true
    videoRef.current.pause()
    setShowDialogue(true)
    setStatus('ended')
  }, [])

  const begin = useCallback(() => {
    startedRef.current = true
    setStatus('loading')
    play()
  }, [play])

  const advance = useCallback(() => {
    if (status === 'intro') begin()
    else if (status !== 'ended') finish()
    else onContinue()
  }, [status, begin, finish, onContinue])
  const advanceHandlers = useSceneAdvance(status !== 'error', advance)

  useEffect(() => {
    const video = videoRef.current
    return () => video.pause()
  }, [])

  useEffect(() => {
    if (showDialogue) return
    let frame
    function checkPlayback() {
      if (videoRef.current.currentTime >= 17) {
        setShowDialogue(true)
      } else {
        frame = requestAnimationFrame(checkPlayback)
      }
    }
    frame = requestAnimationFrame(checkPlayback)
    return () => cancelAnimationFrame(frame)
  }, [showDialogue])

  function mediaError(event) {
    console.error('Opening video media error:', event.currentTarget.error)
    setError('Unable to load the opening video. Please reload the page or try another browser.')
    setStatus('error')
  }

  return (
    <section className="opening-scene" aria-label="Opening video scene"
      {...advanceHandlers}>
      <video ref={videoRef} src={openingVideo} playsInline preload="auto"
        onLoadedData={() => { if (startedRef.current) play() }}
        aria-label="Susan and Chad in the department office"
        style={{ visibility: status === 'ended' || status === 'intro' ? 'hidden' : 'visible' }}
        onPlaying={() => { if (!finishedRef.current) setStatus('playing') }}
        onEnded={finish} onError={mediaError} />
      {status === 'intro' && (
        <>
          <img className="intro-image" src={introImage} alt="CCS game introduction"
            onError={() => {
              console.error('Intro image failed to load:', introImage)
              setError('Unable to load the intro image. Please reload the page.')
              setStatus('error')
            }} />
          <div className="video-dialogue intro-prompt">
            <p>Tap screen or press spacebar to begin</p>
          </div>
        </>
      )}
      <img className="freeze-frame" src={freezeFrame} alt="Susan in her office after the opening video"
        style={{ visibility: status === 'ended' ? 'visible' : 'hidden' }}
        onError={() => {
          console.error('Opening freeze frame failed to load:', freezeFrame)
          setError('Unable to load the opening freeze frame. Please reload the page.')
          setStatus('error')
        }} />
      {status === 'loading' && <p className="video-notice" role="status">Loading opening video...</p>}
      {status === 'start-required' && (
        <div className="video-notice">
          <p>Tap to start the opening video with sound.</p>
          <button className="primary" onClick={play}>Play opening video</button>
        </div>
      )}
      {status === 'error' && <p className="video-notice" role="alert">{error}</p>}
      {showDialogue && status !== 'error' && (
        <div className="video-dialogue" role="status">
          <p>Chad Reichert: Susan, come quick! There's something very wrong with the students in the UX class.</p>
          <small>Tap the screen or hit the spacebar to continue.</small>
        </div>
      )}
    </section>
  )
}
