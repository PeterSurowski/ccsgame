// An original soft desktop-startup chord, not a recording of a Windows sound.
export function playStartupChime(context) {
  for (const [index, frequency] of [523.25, 659.25, 783.99, 1046.5].entries()) {
    const time = context.currentTime + index * 0.14
    const tone = context.createOscillator()
    const volume = context.createGain()
    tone.type = 'sine'
    tone.frequency.setValueAtTime(frequency, time)
    volume.gain.setValueAtTime(0, time)
    volume.gain.linearRampToValueAtTime(0.055, time + 0.035)
    volume.gain.exponentialRampToValueAtTime(0.0001, time + 1.1)
    tone.connect(volume)
    volume.connect(context.destination)
    tone.onended = () => { tone.disconnect(); volume.disconnect() }
    tone.start(time)
    tone.stop(time + 1.15)
  }
}
