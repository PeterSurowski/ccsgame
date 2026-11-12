import { useCallback, useEffect, useRef, useState } from 'react'
import { playStartupChime } from './startupChime.js'
import { playScoreTicks, scoreAtTime, SCORE_ANIMATION_MS } from './scoreAnimation.js'

export default function useAnimatedScores(targets) {
  const [scores, setScores] = useState(targets)
  const [audioError, setAudioError] = useState('')
  const displayedRef = useRef(targets)
  const audioRef = useRef(null)

  useEffect(() => {
    function reportAudioError(error) {
      console.error('Score tick audio failed:', error)
      setAudioError('Score sound is unavailable. Check your browser audio settings.')
    }
    function unlockAudio() {
      try {
        audioRef.current ??= new AudioContext()
        if (audioRef.current.state === 'suspended') {
          audioRef.current.resume().catch(reportAudioError)
        }
      } catch (error) {
        reportAudioError(error)
        window.removeEventListener('pointerdown', unlockAudio)
        window.removeEventListener('keydown', unlockAudio)
      }
    }
    window.addEventListener('pointerdown', unlockAudio)
    window.addEventListener('keydown', unlockAudio)
    return () => {
      window.removeEventListener('pointerdown', unlockAudio)
      window.removeEventListener('keydown', unlockAudio)
      if (audioRef.current) {
        audioRef.current.close().catch(error => console.error('Score audio cleanup failed:', error))
        audioRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const from = displayedRef.current
    if (targets.every((score, index) => score.value === from[index].value)) return
    const start = performance.now()
    let frame
    function animate(now) {
      const next = targets.map((score, index) => ({
        ...score, value: scoreAtTime(from[index].value, score.value, now - start),
      }))
      const ticks = next.reduce((sum, score, index) =>
        sum + Math.abs(score.value - displayedRef.current[index].value), 0)
      if (ticks) {
        if (audioRef.current?.state === 'running') playScoreTicks(audioRef.current, ticks)
        displayedRef.current = next
        setScores(next)
      }
      if (now - start < SCORE_ANIMATION_MS) frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [targets])

  const playStartup = useCallback(async () => {
    try {
      audioRef.current ??= new AudioContext()
      const context = audioRef.current
      await context.resume()
      playStartupChime(context)
    } catch (error) {
      console.error('Resume startup sound failed:', error)
      setAudioError('Startup sound is unavailable. Check your browser audio settings.')
    }
  }, [])

  return { scores, audioError, playStartup,
    isAnimating: scores.some((score, index) => score.value !== targets[index].value) }
}
