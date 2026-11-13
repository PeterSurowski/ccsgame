import { useCallback, useEffect, useRef, useState } from 'react'
import useSceneAdvance from './useSceneAdvance.js'
import { happyEndingDialogue } from './interviewEnding.js'
import videoUrl from './assets/CCSGame-happyEndingVideo.mp4'
import frame4 from './assets/scenes/CCSGame-happyEnding4.png'
import frame5 from './assets/scenes/CCSGame-happyEnding5.png'
import frame6 from './assets/scenes/CCSGame-happyEnding6.png'

const frames = [frame4, frame5, frame6]

export default function HappyEnding({ onRestart }) {
  const [page, setPage] = useState(-1)
  const [revealing, setRevealing] = useState(true)
  const [needsPlay, setNeedsPlay] = useState(false)
  const [error, setError] = useState('')
  const videoRef = useRef(null)
  const play = useCallback(async () => {
    try {
      await videoRef.current.play()
      setNeedsPlay(false)
    } catch (failure) {
      if (failure.name === 'NotAllowedError') setNeedsPlay(true)
      else if (failure.name !== 'AbortError') {
        console.error('Happy ending video playback failed:', failure)
        setError(`Unable to play the happy ending video: ${failure.message}`)
      }
    }
  }, [])
  useEffect(() => {
    const video = videoRef.current
    return () => video?.pause()
  }, [page])
  const handlers = useSceneAdvance(!revealing && !error && !needsPlay, () => {
    if (page === 2) onRestart()
    else setPage(previous => previous + 1)
  })

  function mediaError(source, failure) {
    console.error('Happy ending media failed:', source, failure)
    setError('Unable to load the happy ending media. Please reload the page.')
  }

  return <section className="opening-scene final-ending" aria-label="Happy ending" {...handlers}>
    {page === -1 && <video ref={videoRef} src={videoUrl} playsInline preload="auto"
      aria-label="Peter joins CCS" onEnded={() => setPage(0)}
      onError={event => mediaError(videoUrl, event.currentTarget.error)} />}
    {frames.map((src, index) => <img className="freeze-frame" key={src} src={src}
      alt={`Happy ending scene ${index + 4}`} style={{ visibility: page === index ? 'visible' : 'hidden' }}
      onError={event => mediaError(src, event)} />)}
    {page >= 0 && !error && <div className="video-dialogue" role="status">
      {page < 2 ? <>
        {happyEndingDialogue[page].map(line => <p key={line}>{line}</p>)}
        <small>Tap the screen or press the spacebar to continue.</small>
      </> : <>
        <p>Susan: Yaaaaaaaaaah!</p>
        <h2>You stopped the student revolt!</h2>
        <p>But the professors, on the other hand? We'll leave that for another game.</p>
        <h1>YOU WON!</h1>
        <small>Hit spacebar or tap to start over</small>
      </>}
    </div>}
    {revealing && <div className="scene-fade scene-reveal" onAnimationEnd={() => {
      setRevealing(false)
      play()
    }} />}
    {needsPlay && !error && <div className="video-notice">
      <button className="primary" onClick={play}>Play happy ending video</button>
    </div>}
    {error && <p className="video-notice" role="alert">{error}</p>}
  </section>
}
