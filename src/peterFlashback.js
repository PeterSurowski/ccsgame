export const flashbackText = {
  intro: "Peter: I loved that game. I wanted to create something just like it. But my parents were poor, we didn't have a computer.",
  computer: 'Peter: Then I found an old, out-of-date Commodore 64 at a yard sale. I spent all my savings on it, took it home, and started reading the instruction manual. I learned how to write the "BASIC" programming language from that manual.',
  adult: 'Peter: Tech was my hobby into my adulthood. But then the unforeseeable happened.',
  family: "Peter: I got married and had a child far too young. I was barely done with community college and managing a guitar store making barely minimum wage, and suddenly I had to become a provider. I didn't have many skills at that age, but I knew how to build websites. So... I hit the streets.",
  rejection: 'Peter: I went door to door, office to office, warehouse to warehouse trying to find clients.',
  m2: 'Peter: That\'s exactly how I met the publisher of M2Media. It was a magazine company that published trade journals. Turns out they were looking for a "webmaster." This was my first full-time job in tech.',
}

export function createFlashback() {
  return {
    x: 0,
    facing: -1,
    walkedLeft: false,
    milestone: 0,
    adult: false,
    mode: 'walking',
    narration: null,
    offices: [{ x: -650, result: 'closed' }],
    door: 0,
    meetings: 0,
    m2X: null,
  }
}

export function flashbackReducer(state, action) {
  if (action.type === 'move') {
    if (state.mode !== 'walking' || !Number.isFinite(action.dx) || action.dx === 0) return state
    const x = Math.min(70, state.x + Math.max(-8, Math.min(8, action.dx)))
    const next = {
      ...state,
      x,
      facing: action.dx < 0 ? -1 : 1,
      walkedLeft: state.walkedLeft || action.dx < 0,
    }
    if (action.dx > 0) return next

    const stops = [
      { x: -145, narration: 'computer' },
      { x: -310, narration: 'adult' },
      { x: -425, narration: 'family' },
    ]
    const stop = stops[state.milestone]
    if (stop && x <= stop.x) {
      return {
        ...next,
        x: stop.x,
        milestone: state.milestone + 1,
        adult: state.adult || stop.narration === 'adult',
        mode: 'narration',
        narration: stop.narration,
      }
    }
    if (state.milestone < stops.length) return next

    if (state.m2X !== null) {
      if (x <= state.m2X + 14) return { ...next, x: state.m2X + 14, mode: 'm2-door' }
    } else if (x <= state.offices[state.door].x + 14) return { ...next, x: state.offices[state.door].x + 14, mode: 'door' }
    return next
  }

  if (action.type === 'knock') {
    if (state.mode === 'm2-door') return { ...state, mode: 'narration', narration: 'm2' }
    if (state.mode === 'door') return { ...state, mode: 'pitch' }
  }

  if (action.type === 'skip' && state.mode === 'door') return nextOffice(state, 'skipped')

  if (action.type === 'pitch' && state.mode === 'pitch') {
    const meetings = state.meetings + 1
    return {
      ...state,
      meetings,
      mode: 'reaction',
      narration: meetings === 1 ? 'rejection' : null,
      offices: state.offices.map((office, index) => (
        index === state.door ? { ...office, result: meetings === 3 ? 'hired' : 'rejected' } : office
      )),
    }
  }

  if (action.type === 'continue') {
    if (state.mode === 'narration') {
      return { ...state, mode: state.narration === 'm2' ? 'complete' : 'walking', narration: null }
    }
    if (state.mode === 'reaction') {
      if (state.meetings === 3) {
        return {
          ...state,
          mode: 'walking',
          narration: null,
          m2X: state.offices[state.door].x - 280,
        }
      }
      return nextOffice(state, 'rejected')
    }
  }

  return state
}

function nextOffice(state, result) {
  const x = state.offices[state.door].x - 260
  return {
    ...state,
    mode: 'walking',
    narration: null,
    door: state.door + 1,
    offices: [
      ...state.offices.map((office, index) => (index === state.door ? { ...office, result } : office)),
      { x, result: 'closed' },
    ],
  }
}
