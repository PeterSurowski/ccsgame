export const SCORE_ANIMATION_MS = 500

export function scoreAtTime(from, to, elapsed) {
  const progress = Math.max(0, Math.min(1, elapsed / SCORE_ANIMATION_MS))
  return Math.round(from + (to - from) * progress)
}

export function playScoreTicks(context, count) {
  for (let index = 0; index < count; index += 1) {
    const time = context.currentTime + index * 0.008
    const tone = context.createOscillator()
    const volume = context.createGain()
    tone.type = 'sine'
    tone.frequency.setValueAtTime(1100, time)
    volume.gain.setValueAtTime(0, time)
    volume.gain.linearRampToValueAtTime(0.025, time + 0.002)
    volume.gain.exponentialRampToValueAtTime(0.0001, time + 0.018)
    tone.connect(volume)
    volume.connect(context.destination)
    tone.onended = () => { tone.disconnect(); volume.disconnect() }
    tone.start(time)
    tone.stop(time + 0.02)
  }
}
