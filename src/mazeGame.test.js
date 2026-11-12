import test from 'node:test'
import assert from 'node:assert/strict'
import { admissionsDoor, completeInterviewChoice, createMaze, mazeCamera, mazeCanStand,
  mazeCharacterHeight, mazeCharacterScale, mazePeterScale, mazeEntry, mazeLayout,
  mazeExits, mazeIntro, mazeNpcs, mazePalms, mazeReducer, mazeSections, mazeTime, moveMaze, nearestMazePoint } from './mazeGame.js'

const tick = (state, seconds, direction = { dx: 0, dy: 0 }) => mazeReducer(state, { type: 'tick', seconds, direction })
const advance = state => mazeReducer(state, { type: 'advance' })

test('all characters share Peter base height and scale from 60% at 70% up to 200% at the bottom', () => {
  assert.equal(mazeCharacterHeight, 194 * .4 * mazePeterScale)
  for (const height of [512, 1024]) {
    assert.equal(mazeCharacterScale(height, height), 2)
    assert.equal(mazeCharacterScale(.3 * height, height), .6)
    assert.equal(mazeCharacterScale(0, height), .6)
    assert.ok(Math.abs(mazeCharacterScale(.65 * height, height) - 1.3) < 1e-12)
    assert.equal(mazeCharacterScale(height * 2, height), 2)
    assert.equal(mazeCharacterScale(-height, height), .6)
    let previous = .6
    for (let y = 0; y <= height; y++) {
      const scale = mazeCharacterScale(y, height)
      assert.ok(scale >= previous && scale <= 2)
      previous = scale
    }
  }
})

test('H exits to G at the left-border path, not the upper path tip; returning uses the corrected path', () => {
  assert.deepEqual(mazeExits.H.find(exit => exit.to === 'G'), { x: 3, y: 340, to: 'G', dx: -1, dy: 0 })
  const position = { section: 'H', ...nearestMazePoint('H', 0, 340), facing: 'left', entry: null }
  assert.equal(moveMaze(position, { dx: -1, dy: 0 }, .01).section, 'G')
  const oldTip = { ...position, ...nearestMazePoint('H', 15, 207) }
  assert.equal(moveMaze(oldTip, { dx: -1, dy: -1 }, .01).section, 'H')
  const arrival = mazeEntry('H', 'G')
  assert.ok(arrival.x < 40 && Math.abs(arrival.y - 340) < 10)
  assert.equal(moveMaze(arrival, { dx: -1, dy: 0 }, .01).section, 'H')
})

test('zoom is 25% closer in every section; first student is visible but outside conversation range', () => {
  for (const section of Object.keys(mazeSections)) {
    for (const ratio of [.56, .65, 1, 2]) {
      const camera = mazeCamera(mazeEntry(section), ratio)
      const previousHeight = Math.min(350, 512, 512 / ratio)
      assert.equal(previousHeight / camera.height, 1.25)
    }
  }
  const state = createMaze()
  const first = mazeNpcs.find(npc => npc.id === 'first')
  assert.ok(Math.hypot(first.x - state.position.x, first.y - state.position.y) > 50)
  for (const ratio of [.56, .65]) {
    const camera = mazeCamera(state.position, ratio)
    const height = mazeCharacterHeight * mazeCharacterScale(first.y)
    assert.ok(first.x - height * .2 >= camera.x && first.x + height * .2 <= camera.x + camera.width)
    assert.ok(first.y - height >= camera.y && first.y <= camera.y + camera.height)
  }
  assert.equal(tick(advance(state), .05).phase, 'explore')
})

test('all tile I edge paths lead to H across their full walkable width', () => {
  const check = (x, y, direction) => {
    const position = { section: 'I', x, y, facing: 'down', entry: null }
    assert.ok(mazeCanStand(x, y, 'I'))
    assert.equal(moveMaze(position, direction, .01).section, 'H', `I edge at ${x},${y}`)
  }
  for (let y = 430; y <= 508; y++) {
    if (mazeCanStand(3, y, 'I')) check(3, y, { dx: -1, dy: 0 })
  }
  for (let x = 3; x < 163; x++) {
    if (mazeCanStand(x, 508, 'I')) check(x, 508, { dx: 0, dy: 1 })
  }
  for (const [x, y, direction] of [
    [215, 465, { dx: 0, dy: 1 }], [435, 445, { dx: 1, dy: 0 }],
    [435, 445, { dx: 0, dy: 1 }],
  ]) {
    const point = nearestMazePoint('I', x, y)
    check(point.x, point.y, direction)
  }
})

test('palm trunk bases stay off every painted walking path', () => {
  for (const palm of mazePalms) assert.equal(mazeCanStand(palm.x, palm.y, palm.section), false,
    `Palm in ${palm.section} is on a walking path`)
})

test('opening and first-student conversation pause time; timer glows for exactly three seconds', () => {
  let state = createMaze()
  assert.equal(state.position.section, 'H')
  assert.equal(state.dialogue[0], mazeIntro)
  assert.deepEqual(tick(state, 60), state)
  state = advance(state)
  const student = mazeNpcs[0]
  state = tick({ ...state, position: { ...state.position, ...nearestMazePoint('H', student.x, student.y) } }, .05)
  assert.equal(state.phase, 'first')
  assert.equal(state.remaining, 180)
  assert.deepEqual(tick(state, 60), state)
  state = tick(advance(state), 2)
  assert.equal(state.phase, 'arming')
  assert.equal(state.remaining, 180)
  state = tick(state, 1)
  assert.equal(state.phase, 'running')
  assert.equal(state.remaining, 180)
  assert.equal(mazeTime(tick(state, 1).remaining), '2:59')
})

test('hints are section-specific, pause time/movement and do not repeat', () => {
  const npc = mazeNpcs.find(person => person.id === 'parking')
  let state = { ...createMaze(), phase: 'running', dialogue: [], visited: ['first'],
    position: { ...mazeEntry('A'), ...nearestMazePoint('A', npc.x, npc.y), entry: null } }
  state = tick(state, .05)
  assert.equal(state.phase, 'hint')
  assert.equal(state.dialogue[0], 'Student: This leads to the parking lot. Admissions is the other way.')
  assert.deepEqual(tick(state, 100, { dx: 1, dy: 0 }), state)
  state = advance(state)
  assert.equal(tick(state, 1).phase, 'running')
})

test('timeout and retry reset all timer and conversation state', () => {
  assert.equal(tick({ ...createMaze(), phase: 'running', remaining: .1 }, .2).phase, 'lost')
  assert.equal(tick({ ...createMaze(), phase: 'arming' }, 183).phase, 'lost')
  assert.equal(createMaze().remaining, 180)
  assert.deepEqual(createMaze().visited, [])
})

test('all nine painted maps have foot-safe starts, every NPC can be approached', () => {
  assert.equal(Object.keys(mazeSections).join(''), 'ABCDEFGHI')
  assert.deepEqual(mazeLayout, [['A', 'B', 'C'], ['D', 'E', 'F'], ['G', 'H', 'I']])
  for (const section of Object.keys(mazeSections)) {
    const start = mazeEntry(section)
    assert.ok(mazeCanStand(start.x, start.y, section))
    assert.equal(mazeCanStand(0, 0, section), false)
    for (const npc of mazeNpcs.filter(npc => npc.section === section)) {
      const point = nearestMazePoint(section, npc.x, npc.y)
      assert.ok(Math.hypot(point.x - npc.x, point.y - npc.y) < (npc.width ? 40 : 26), npc.id)
    }
  }
})

test('every specified exit leads to its exact destination; arrival does not immediately bounce back', () => {
  const routes = { A: ['D', 'B'], B: ['E', 'A', 'C'], C: ['B', 'F'], D: ['A', 'G'],
    E: ['H', 'D', 'B'], F: ['D', 'I'], G: ['H', 'D'], H: ['G', 'I'], I: ['H'] }
  for (const [section, exits] of Object.entries(mazeExits)) {
    assert.deepEqual([...new Set(exits.map(exit => exit.to))], routes[section])
    for (const exit of exits) {
      const point = nearestMazePoint(section, exit.x, exit.y)
      const arrived = moveMaze({ section, ...point, facing: 'up', entry: null },
        { dx: exit.dx, dy: exit.dy }, .01)
      assert.equal(arrived.section, exit.to, `${section} to ${exit.to}`)
      assert.ok(mazeCanStand(arrived.x, arrived.y, arrived.section))
      assert.equal(moveMaze(arrived, { dx: -exit.dx, dy: -exit.dy }, .01).section, exit.to)
    }
  }
  assert.ok(mazeEntry('A', 'D').x < 350)
  assert.ok(mazeEntry('B', 'A').y < 270)
})

test('each entry and all exits/Admissions share a connected walkable path', () => {
  for (const section of Object.keys(mazeSections)) {
    const area = mazeSections[section]
    const entry = mazeEntry(section)
    const queue = [[Math.floor(entry.x), Math.floor(entry.y)]]
    const seen = new Uint8Array(area.width * area.height)
    seen[queue[0][1] * area.width + queue[0][0]] = 1
    for (let index = 0; index < queue.length; index += 1) {
      const [x, y] = queue[index]
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, key = ny * area.width + nx
        if (mazeCanStand(nx, ny, section) && !seen[key]) {
          seen[key] = 1
          queue.push([nx, ny])
        }
      }
    }
    const targets = [...mazeExits[section], ...mazeNpcs.filter(npc => npc.section === section)]
    if (section === 'F') targets.push(admissionsDoor)
    for (const target of targets) {
      const point = nearestMazePoint(section, target.x, target.y)
      assert.equal(seen[Math.floor(point.y) * area.width + Math.floor(point.x)], 1,
        `${section}: disconnected ${target.to || target.id || 'Admissions'}`)
    }
  }
})

test('only F door or student-line contact wins; camera is clamped and interview history is preserved', () => {
  const state = { ...createMaze(), phase: 'running', dialogue: [],
    position: { ...mazeEntry('F'), ...nearestMazePoint('F', admissionsDoor.x, admissionsDoor.y), entry: null } }
  assert.equal(tick(state, .02).phase, 'won')
  assert.equal(tick({ ...state, position: { ...state.position, ...nearestMazePoint('F', 298, 265) } }, .02).phase, 'won')
  assert.notEqual(tick({ ...state, phase: 'explore' }, .02).phase, 'won')
  const camera = mazeCamera(state.position, .65)
  assert.ok(camera.x >= 0 && camera.y >= 0 && camera.x + camera.width <= 512 && camera.y + camera.height <= 512)
  assert.equal(mazeTime(179.99), '3:00')
  assert.equal(mazeTime(0), '0:00')
  assert.deepEqual(completeInterviewChoice(completeInterviewChoice([], 1), 0), [1, 0])
})
