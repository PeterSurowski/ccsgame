import { moveSusanDirection } from './worldview.js'
import walkable from './mazeWalkable.json' with { type: 'json' }

export const mazeSections = walkable
export const mazeLayout = [['A', 'B', 'C'], ['D', 'E', 'F'], ['G', 'H', 'I']]
export const mazeWidth = 512
export const mazeHeight = 512
export const mazePeterScale = .5625
export const mazeCharacterHeight = 194 * .4 * mazePeterScale
export const mazeStart = { section: 'H', x: 215, y: 385, facing: 'up', entry: null }
export const admissionsDoor = { section: 'F', x: 274, y: 240 }
export const mazeIntro = `Peter: My parents didn't go to college (heck, my mom didn't even graduate high school) so they weren't able to guide me. After I graduated high school, I asked my dad, "How do you go to college?" He said, "I don't know, but there's a college just over the freeway. Why don't you go down there and talk to someone?"`
export const firstStudentText = [
  'Peter: How do I sign up for classes?',
  'Student: You have to find the admissions building. But they close in 3 minutes!',
]

// Endpoints include painted path tips that stop just short of the image border.
export const mazeExits = {
  A: [
    { x: 282, y: 497, to: 'D', dx: 0, dy: 1 }, { x: 448, y: 497, to: 'D', dx: 0, dy: 1 },
    { x: 498, y: 223, to: 'B', dx: 1, dy: -1 },
  ],
  B: [
    { x: 155, y: 508, edge: 'bottom', to: 'E', dx: 0, dy: 1 },
    { x: 43, y: 225, to: 'A', dx: -1, dy: -1 }, { x: 12, y: 353, to: 'A', dx: -1, dy: 0 },
    { x: 470, y: 187, to: 'C', dx: 1, dy: -1 },
  ],
  C: [
    { x: 16, y: 158, to: 'B', dx: -1, dy: -1 }, { x: 10, y: 288, to: 'B', dx: -1, dy: 0 },
    { x: 68, y: 438, to: 'F', dx: -1, dy: 1 }, { x: 395, y: 473, to: 'F', dx: 0, dy: 1 },
  ],
  D: [{ x: 14, y: 220, to: 'A', dx: -1, dy: -1 }, { x: 310, y: 508, edge: 'bottom', to: 'G', dx: 0, dy: 1 }],
  E: [
    { x: 498, y: 404, to: 'H', dx: 1, dy: 0 }, { x: 483, y: 157, to: 'H', dx: 1, dy: -1 },
    { x: 252, y: 498, to: 'D', dx: 0, dy: 1 },
    { x: 10, y: 225, to: 'B', dx: -1, dy: -1 }, { x: 14, y: 468, to: 'B', dx: -1, dy: 1 },
  ],
  F: [
    { x: 42, y: 161, to: 'D', dx: -1, dy: -1 }, { x: 10, y: 246, to: 'D', dx: -1, dy: 0 },
    { x: 199, y: 498, to: 'I', dx: 0, dy: 1 },
  ],
  G: [
    { x: 203, y: 498, to: 'H', dx: 0, dy: 1 },
    { x: 508, y: 223, edge: 'right', to: 'D', dx: 1, dy: 0 },
    { x: 508, y: 274, edge: 'right', to: 'D', dx: 1, dy: 0 },
  ],
  H: [{ x: 3, y: 340, to: 'G', dx: -1, dy: 0 }, { x: 498, y: 239, to: 'I', dx: 1, dy: -1 }],
  I: [
    { x: 3, y: 430, edge: 'left', to: 'H', dx: -1, dy: 0 },
    { x: 3, y: 508, edge: 'bottom', to: 'H', dx: 0, dy: 1 },
  ],
}
const defaultEntries = {
  A: [282, 479], B: [53, 232], C: [35, 170], D: [32, 242], E: [157, 474],
  F: [66, 178], G: [461, 225], H: [470, 253], I: [155, 475],
}

export const mazeNpcs = [
  { id: 'first', section: 'H', x: 256, y: 347, asset: 'student-0', text: firstStudentText },
  { id: 'parking', section: 'A', x: 38, y: 244, asset: 'student-alt-0',
    text: ['Student: This leads to the parking lot. Admissions is the other way.'] },
  { id: 'H-guide', section: 'H', x: 350, y: 344, asset: 'student-1',
    text: ['Student: Go left from this courtyard, then take the right-hand path at the next building. That will lead you toward Admissions.'] },
  { id: 'G-guide', section: 'G', x: 263, y: 311, asset: 'student-alt-1',
    text: ['Student: Take the path on the right to the glass-front building. From there, go up and left.'] },
  { id: 'D-guide', section: 'D', x: 331, y: 369, asset: 'student-2',
    text: ['Student: Follow the upper-left path. At the next building, head right.'] },
  { id: 'B-guide', section: 'B', x: 275, y: 314, asset: 'student-alt-2',
    text: ['Student: Take the upper-right path toward the athletics building. Then follow either lower path to Admissions.'] },
  { id: 'C-guide', section: 'C', x: 207, y: 336, asset: 'student-3',
    text: ['Student: Admissions is beyond either lower path. Look for the line of students outside the door.'] },
  { id: 'E-guide', section: 'E', x: 224, y: 305, asset: 'student-alt-3',
    text: ['Student: The path to the left leads to the STEM building. From there, take its upper-right path toward athletics.'] },
  { id: 'I-guide', section: 'I', x: 230, y: 265, asset: 'bench-2', width: 65,
    text: ['Student: These lower paths lead back to the courtyard with the big campus sign. Head left from there.'] },
  { id: 'A-bench', section: 'A', x: 189, y: 248, asset: 'bench-0', width: 65,
    text: ['Student: Admissions is past the STEM and athletics buildings. Take the path on the right.'] },
  { id: 'F-bench', section: 'F', x: 154, y: 200, asset: 'bench-1', width: 60,
    text: ['Student: You made it! The Admissions door is beside the line of students.'] },
]

export const mazePalms = [
  { section: 'H', x: 125, y: 331 },
  { section: 'A', x: 300, y: 340 }, { section: 'B', x: 300, y: 246 },
  { section: 'C', x: 281, y: 335 }, { section: 'D', x: 160, y: 455 },
  { section: 'E', x: 252, y: 412 }, { section: 'F', x: 458, y: 300 },
  { section: 'G', x: 365, y: 294 }, { section: 'I', x: 170, y: 457 },
]

export function mazeCharacterScale(y, height = mazeHeight, depthRate = 1) {
  const scaledY = y - (height - y) * (depthRate - 1)
  const depth = Math.max(0, Math.min(1, (scaledY / height - .3) / .7))
  return .6 + 1.4 * depth
}

export function mazeCanStand(x, y, section = 'H') {
  const area = mazeSections[section]
  if (!area || !Number.isFinite(x) || !Number.isFinite(y) || y < 0 || y >= area.height || x < 0 || x >= area.width) return false
  const row = area.rows[Math.floor(y)]
  for (let i = 0; i < row.length; i += 2) if (x >= row[i] && x < row[i + 1]) return true
  return false
}

export function nearestMazePoint(section, x, y) {
  let point = null
  let distance = Infinity
  mazeSections[section].rows.forEach((row, py) => {
    for (let i = 0; i < row.length; i += 2) {
      const px = Math.max(row[i], Math.min(row[i + 1] - 1, x))
      const candidate = (px - x) ** 2 + (py - y) ** 2
      if (candidate < distance) { distance = candidate; point = { x: px, y: py } }
    }
  })
  if (!point) throw new Error(`No walkable positions in Maze Game ${section}`)
  return point
}

export function mazeEntry(section, from = null) {
  let [x, y] = defaultEntries[section]
  const reciprocal = mazeExits[section].find(exit => exit.to === from)
  if (reciprocal) { x = reciprocal.x - reciprocal.dx * 22; y = reciprocal.y - reciprocal.dy * 22 }
  if (section === 'A' && from === 'D') { x = 282; y = 475 }
  if (section === 'B' && from === 'A') { x = 57; y = 237 }
  const point = nearestMazePoint(section, x, y)
  return { section, ...point, facing: 'up', entry: point }
}

const portalPoints = Object.fromEntries(Object.entries(mazeExits).map(([section, exits]) =>
  [section, exits.map(portal => ({ ...portal, point: nearestMazePoint(section, portal.x, portal.y),
    end: portal.end ? nearestMazePoint(section, portal.end.x, portal.end.y) : null }))]))

export function slideMazeStep(position, direction, seconds, stand) {
  const length = Math.hypot(direction.dx, direction.dy)
  if (!length) return position
  const distance = 180 * seconds
  const dx = direction.dx / length, dy = direction.dy / length
  if (stand(position.x + dx * distance, position.y + dy * distance)) {
    return moveSusanDirection(position, direction, seconds, stand)
  }
  // Follow the closest forward-facing tangent without crossing the boundary.
  for (const degrees of [15, 30, 45, 60, 75]) {
    for (const sign of [-1, 1]) {
      const angle = degrees * sign * Math.PI / 180
      const sx = dx * Math.cos(angle) - dy * Math.sin(angle)
      const sy = dx * Math.sin(angle) + dy * Math.cos(angle)
      if (stand(position.x + sx * distance, position.y + sy * distance)) {
        return { ...position, x: position.x + sx * distance, y: position.y + sy * distance,
          facing: Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up') }
      }
    }
  }
  return moveSusanDirection(position, direction, seconds, stand)
}

export function moveMaze(position, direction, seconds) {
  let next = position
  const time = Math.min(Math.max(seconds, 0), .05)
  const steps = Math.max(1, Math.ceil(time * 360))
  for (let step = 0; step < steps; step += 1) {
    next = slideMazeStep(next, direction, time / steps,
      (x, y) => mazeCanStand(x, y, position.section))
  }
  if (position.entry && Math.hypot(next.x - position.entry.x, next.y - position.entry.y) < 35) return next
  const armed = next.entry ? { ...next, entry: null } : next
  const exit = portalPoints[position.section].find(portal => {
    if (portal.edge) {
      const area = mazeSections[position.section]
      const atEdge = portal.edge === 'bottom' ? next.y >= area.height - 4
        : portal.edge === 'right' ? next.x >= area.width - 4 : next.x <= 4
      return atEdge && direction.dx * portal.dx + direction.dy * portal.dy > 0
    }
    const point = portal.point
    const end = portal.end || point
    const dx = end.x - point.x, dy = end.y - point.y
    const lengthSquared = dx * dx + dy * dy
    const t = lengthSquared ? Math.max(0, Math.min(1,
      ((next.x - point.x) * dx + (next.y - point.y) * dy) / lengthSquared)) : 0
    return Math.hypot(next.x - point.x - dx * t, next.y - point.y - dy * t) <= 20
      && direction.dx * portal.dx + direction.dy * portal.dy > 0
  })
  return exit ? mazeEntry(exit.to, position.section) : armed
}

export function createMaze() {
  return { position: { ...mazeStart, ...nearestMazePoint(mazeStart.section, mazeStart.x, mazeStart.y) },
    phase: 'intro', remaining: 180, glow: 3, visited: [], dialogue: [mazeIntro] }
}

export function mazeReducer(state, action) {
  if (action.type === 'advance') {
    if (state.phase === 'intro') return { ...state, phase: 'explore', dialogue: [] }
    if (state.phase === 'first') return { ...state, phase: 'arming', dialogue: [] }
    if (state.phase === 'hint') return { ...state, phase: 'running', dialogue: [] }
    return state
  }
  if (action.type !== 'tick' || !Number.isFinite(action.seconds) || action.seconds <= 0) return state
  if (state.phase === 'arming') {
    const glow = Math.max(0, state.glow - action.seconds)
    const remaining = Math.max(0, state.remaining - Math.max(0, action.seconds - state.glow))
    return { ...state, glow, remaining,
      phase: remaining === 0 ? 'lost' : glow === 0 ? 'running' : 'arming' }
  }
  if (!['explore', 'running'].includes(state.phase)) return state
  const remaining = state.phase === 'running' ? Math.max(0, state.remaining - action.seconds) : state.remaining
  if (remaining === 0) return { ...state, remaining, phase: 'lost' }
  const position = moveMaze(state.position, action.direction, action.seconds)
  const npc = mazeNpcs.find(person => !state.visited.includes(person.id)
    && person.section === position.section
    && (state.phase === 'running' || person.id === 'first')
    && Math.hypot(person.x - position.x, person.y - position.y) <= (person.width ? 40 : 26))
  if (npc) return { ...state, position, remaining, phase: npc.id === 'first' ? 'first' : 'hint',
    visited: [...state.visited, npc.id], dialogue: npc.text }
  if (state.phase === 'running' && position.section === 'F'
    && (Math.hypot(position.x - admissionsDoor.x, position.y - admissionsDoor.y) <= 26
      || Math.hypot(position.x - 298, position.y - 265) <= 42)) {
    return { ...state, position, remaining, phase: 'won' }
  }
  return { ...state, position, remaining }
}

export function mazeCamera(position, ratio) {
  const area = mazeSections[position.section]
  const height = Math.min(350, area.height, area.width / ratio) / 1.25
  const width = height * ratio
  return { x: Math.max(0, Math.min(area.width - width, position.x - width / 2)),
    y: Math.max(0, Math.min(area.height - height, position.y - height * .65)), width, height }
}

export function mazeTime(seconds) {
  const whole = Math.ceil(seconds)
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`
}

export function completeInterviewChoice(chosen, choice) {
  return chosen.includes(choice) ? chosen : [...chosen, choice]
}
