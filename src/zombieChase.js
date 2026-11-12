export function createChase() {
  return {
    phase: 'entrance', elapsed: 0, time: 0, susan: 145, peter: 110,
    y: 310, horde: -180, camera: 0, boost: 0, taps: 0,
    fallen: false, trampled: false, finalGap: 0,
    offscreenSince: null, tripCamera: 0,
  }
}

function phase(state, next) {
  return { ...state, phase: next, elapsed: 0 }
}

export function tapChase(state) {
  if (state.phase === 'strange') return phase(state, 'reveal')
  if (!['ready', 'run', 'rescue', 'doomed'].includes(state.phase)) return state
  const next = state.phase === 'ready' ? phase(state, 'run') : state
  return { ...next, boost: Math.min(240, next.boost + 55), taps: next.taps + 1 }
}

export function chooseChase(state, rescue) {
  if (state.phase !== 'plea') return state
  return phase({ ...state, boost: 0, finalGap: state.susan - state.horde },
    rescue ? 'rescue' : 'doomed')
}

export function finishChaseFade(state) {
  if (state.phase === 'loss-out') return phase(state, 'loss-in')
  if (state.phase === 'loss-in') return phase(state, 'lost')
  return state
}

export function stepChase(state, dt) {
  if (!['entrance', 'reveal', 'ready', 'run', 'trip', 'plea', 'rescue', 'doomed', 'overrun'].includes(state.phase)) return state
  const next = { ...state, elapsed: state.elapsed + dt, time: state.time + dt,
    boost: Math.max(0, state.boost - 110 * dt) }
  if (next.phase === 'entrance') {
    const progress = Math.min(1, next.elapsed / 2.4)
    next.susan = 145 + progress * 125
    next.peter = 110 + progress * 95
    next.y = 310 + progress * 100
    if (progress === 1) return phase(next, 'strange')
  } else if (next.phase === 'reveal') {
    next.horde = -180 + Math.min(1, next.elapsed / 1.8) * 270
    if (next.elapsed >= 1.8) return phase(next, 'ready')
  } else if (next.phase === 'run') {
    next.susan += (38 + next.boost) * dt
    next.peter = next.susan - 65
    next.horde += 70 * dt
    next.camera = Math.max(0, next.susan - 270)
    if (next.horde >= next.peter - 12) return phase({ ...next, boost: 0 }, 'overrun')
    if (next.horde - next.camera < -20 && next.offscreenSince === null) {
      next.offscreenSince = next.time
    }
    if (next.offscreenSince !== null && next.time - next.offscreenSince >= 4) {
      return phase({ ...next, fallen: true, boost: 0, tripCamera: next.camera }, 'trip')
    }
  } else if (next.phase === 'trip') {
    const progress = Math.min(1, next.elapsed / 1.5)
    next.susan = next.peter + 65 + 215 * progress
    next.camera = next.tripCamera + (Math.max(0, next.peter - 60) - next.tripCamera) * progress
    if (next.elapsed >= 1.5) return phase(next, 'plea')
  } else if (next.phase === 'rescue') {
    next.susan = Math.max(next.peter + 60, next.susan - next.boost * dt)
    next.camera = Math.max(0, next.susan - 340)
    next.horde = Math.min(next.horde, next.camera - 20)
    if (next.susan <= next.peter + 60) {
      next.horde = next.camera + 35
      return phase({ ...next, finalGap: next.susan - next.horde }, 'doomed')
    }
  } else if (next.phase === 'doomed') {
    next.susan += next.boost * dt
    // The horde closes the remaining gap in five seconds, regardless of tap speed.
    next.horde = next.susan - next.finalGap * Math.max(0, 1 - next.elapsed / 5)
    next.trampled ||= next.horde >= next.peter + 30
    next.camera = Math.max(0, next.susan - 340)
    if (next.elapsed >= 5) return phase({ ...next, boost: 0 }, 'overrun')
  } else if (next.phase === 'overrun') {
    next.horde += 160 * dt
    next.trampled ||= next.horde >= next.peter + 30
    if (next.elapsed >= 2) return phase(next, 'loss-out')
  }
  return next
}
