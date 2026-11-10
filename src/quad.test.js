import test from 'node:test'
import assert from 'node:assert/strict'
import { canStandInQuad, moveQuadSusan, startingQuadSusan, quadCamera, quadSections, quadEntry, nearDazedStudent, quadSusanScale, reachedPhilipMeeting } from './quad.js'
import { cameraViewBox, CAMERA_HEIGHT, touchDirection } from './worldview.js'

test('quad zoom is halved with Susan feet at 75% of the viewport and touch aligned', () => {
  const [left, top, width, height] = cameraViewBox(startingQuadSusan, 174, CAMERA_HEIGHT, .75).split(' ').map(Number)
  assert.equal(width, 174)
  assert.equal(height, 280)
  assert.equal(left + width / 2, startingQuadSusan.x)
  assert.equal(top + height * .75, startingQuadSusan.y)
  const bounds = { left: 10, top: 20, width: 400, height: 600 }
  const gesture = { x: 210, y: 470, started: 0, dragged: true }
  assert.deepEqual(touchDirection(gesture, 200, bounds, .75), { dx: 0, dy: 0 })
  assert.deepEqual(touchDirection({ ...gesture, y: 370 }, 200, bounds, .75), { dx: 0, dy: -100 })
})

test('Susan starts bottom-center on walkable lower-left ground', () => {
  assert.equal(startingQuadSusan.x, 317)
  assert.equal(startingQuadSusan.section, 'lowerleft')
  assert.ok(startingQuadSusan.y > 300)
  assert.ok(canStandInQuad('lowerleft', startingQuadSusan.x, startingQuadSusan.y))
})

test('section sizes and lower-right camera zoom match requested percentages', () => {
  assert.equal(quadSusanScale('lowerleft'), 1.25)
  assert.equal(quadSusanScale('upperleft'), .5)
  assert.equal(quadSusanScale('lowerright'), .5)
  const camera = quadCamera(quadEntry('lowerright'), 174)
  assert.equal(camera.width, 174 / .75)
  assert.equal(camera.height, 280 / .75)
})

test('student encounter triggers only close to the student in lower-left', () => {
  assert.equal(nearDazedStudent(startingQuadSusan), false)
  assert.equal(nearDazedStudent({ section: 'lowerleft', x: 320, y: 370 }), true)
  assert.equal(nearDazedStudent({ section: 'lowerleft', x: 320, y: 371 }), false)
  assert.equal(nearDazedStudent({ section: 'upperleft', x: 320, y: 295 }), false)
  let position = startingQuadSusan
  for (let i = 0; i < 30 && !nearDazedStudent(position); i++) {
    position = moveQuadSusan(position, { dx: 0, dy: -1 }, 1 / 60)
    assert.ok(canStandInQuad(position.section, position.x, position.y))
  }
  assert.ok(nearDazedStudent(position))
})

test('quad camera never exposes outside any image at edges, corners, or viewport sizes', () => {
  for (const [section, area] of Object.entries(quadSections)) {
    for (const viewWidth of [87, 174, 480, 900]) {
      for (const x of [13, area.width / 2, area.width - 13]) {
        for (const y of [13, area.height / 2, area.height - 13]) {
          const camera = quadCamera({ section, x, y }, viewWidth)
          assert.ok(camera.x >= 0 && camera.y >= 0)
          assert.ok(camera.x + camera.width <= area.width + 1e-9)
          assert.ok(camera.y + camera.height <= area.height + 1e-9)
          assert.ok(Math.abs(camera.width / camera.height - viewWidth / CAMERA_HEIGHT) < 1e-9)
        }
      }
    }
  }
})

test('camera stops at boundaries while Susan keeps moving and touch follows her screen position', () => {
  const position = { section: 'lowerleft', x: 545, y: 290, facing: 'right' }
  const camera = quadCamera(position, 174)
  const next = moveQuadSusan(position, { dx: 1, dy: 0 }, 1 / 60)
  assert.ok(next.x > position.x)
  assert.deepEqual(quadCamera(next, 174), camera)
  assert.equal(camera.x + camera.width, 632)
  assert.equal(quadCamera(startingQuadSusan, 174).y + camera.height, 424)
  const bounds = { left: 10, top: 20, width: 400, height: 600 }
  const horizontalAnchor = (position.x - camera.x) / camera.width
  const verticalAnchor = (position.y - camera.y) / camera.height
  const gesture = { x: bounds.left + bounds.width * horizontalAnchor,
    y: bounds.top + bounds.height * verticalAnchor, started: 0, dragged: true }
  assert.deepEqual(touchDirection(gesture, 200, bounds, verticalAnchor, horizontalAnchor), { dx: 0, dy: 0 })
  assert.deepEqual(touchDirection({ ...gesture, x: gesture.x - 80 }, 200, bounds, verticalAnchor, horizontalAnchor), { dx: -80, dy: 0 })
  const interior = { section: 'upperleft', x: 256, y: 300 }
  const interiorCamera = quadCamera(interior, 174)
  assert.equal((interior.x - interiorCamera.x) / interiorCamera.width, .5)
  assert.equal((interior.y - interiorCamera.y) / interiorCamera.height, .75)
})

test('each section exit leads to a safe entry and does not immediately bounce back', () => {
  const routes = [
    [{ section: 'lowerleft', x: 18, y: 130 }, { dx: -1, dy: 0 }, 'upperleft'],
    [{ section: 'lowerleft', x: 170, y: 18 }, { dx: 0, dy: -1 }, 'upperleft'],
    [{ section: 'lowerleft', x: 614, y: 290 }, { dx: 1, dy: 0 }, 'lowerright'],
    [{ ...quadEntry('upperleft'), returnArmed: true }, { dx: 0, dy: 1 }, 'lowerleft'],
    [{ ...quadEntry('lowerright'), returnArmed: true }, { dx: 0, dy: 1 }, 'lowerleft'],
  ]
  for (const [position, direction, section] of routes) {
    const next = moveQuadSusan(position, direction, 1 / 60)
    assert.equal(next.section, section)
    assert.ok(canStandInQuad(next.section, next.x, next.y), JSON.stringify(next))
    assert.equal(moveQuadSusan(next, direction, 1 / 60).section, section)
  }
})

test('quad movement preserves normalized speed, neutral input, and blocks obstacles', () => {
  const next = moveQuadSusan(startingQuadSusan, { dx: 1, dy: -1 }, 1 / 60)
  assert.ok(Math.abs(Math.hypot(next.x - startingQuadSusan.x, next.y - startingQuadSusan.y) - 3) < 1e-9)
  assert.equal(moveQuadSusan(startingQuadSusan, { dx: 0, dy: 0 }, 1 / 60), startingQuadSusan)
  assert.equal(canStandInQuad('upperleft', 250, 100), false)
  assert.equal(canStandInQuad('lowerright', 247.5, 223), false)
  assert.equal(canStandInQuad('lowerright', 400, 250), false)
  assert.equal(canStandInQuad('lowerleft', 274, 112), false)
  let position = startingQuadSusan
  for (let i = 0; i < 100; i++) position = moveQuadSusan(position, { dx: 0, dy: 1 }, 1 / 60)
  assert.equal(position.section, 'lowerleft')
  assert.ok(canStandInQuad(position.section, position.x, position.y))
})

test('walkable routes connect the spawn to both sections and their return exits', () => {
  for (const [start, goal] of [
    [startingQuadSusan, p => p.x >= 610],
    [startingQuadSusan, p => p.x <= 22],
    [startingQuadSusan, p => p.y <= 22],
    [quadEntry('upperleft'), p => p.y < 468],
    [quadEntry('lowerright'), p => p.y < 468],
  ]) {
    const queue = [start]
    const visited = new Set([`${start.x},${start.y}`])
    let reached = false
    for (let i = 0; i < queue.length; i++) {
      const position = queue[i]
      if (goal(position)) { reached = true; break }
      for (const [dx, dy] of [[3, 0], [-3, 0], [0, 3], [0, -3]]) {
        const next = { ...position, x: position.x + dx, y: position.y + dy }
        const key = `${next.x},${next.y}`
        if (!visited.has(key) && canStandInQuad(next.section, next.x, next.y)) {
          visited.add(key)
          queue.push(next)
        }
      }
    }
    assert.ok(reached, `No route from ${JSON.stringify(start)}`)
  }
})

test('every entry is on the lowest safe row and unmarked ground remains blocked', () => {
  for (const section of Object.keys(quadSections)) {
    const entry = quadEntry(section)
    assert.ok(canStandInQuad(section, entry.x, entry.y))
    for (let y = entry.y + 1; y < quadSections[section].height; y++) {
      assert.equal(quadSections[section].rows[y].length, 0)
    }
    assert.equal(moveQuadSusan(entry, { dx: 0, dy: 1 }, 1 / 60).section, section)
    assert.equal(canStandInQuad(section, 0, 0), false)
  }
  assert.equal(canStandInQuad('lowerleft', 320, 295), false, 'student island stays blocked')
})

test('Philip meeting requires choice A and the upper end of the lower-right path', () => {
  const endpoint = { section: 'lowerright', x: 473, y: 320 }
  assert.equal(reachedPhilipMeeting(endpoint, 'philip'), true)
  assert.equal(reachedPhilipMeeting(endpoint, 'matt'), false)
  assert.equal(reachedPhilipMeeting(endpoint, null), false)
  assert.equal(reachedPhilipMeeting({ ...endpoint, section: 'lowerleft' }, 'philip'), false)
  assert.equal(reachedPhilipMeeting({ ...endpoint, x: 400 }, 'philip'), false)
  assert.equal(reachedPhilipMeeting(quadEntry('lowerright'), 'philip'), false)
})

test('Philip endpoint is reachable from the lower-right entry through marked ground', () => {
  const start = quadEntry('lowerright')
  const queue = [start]
  const visited = new Set([`${start.x},${start.y}`])
  let reached = false
  for (let i = 0; i < queue.length; i++) {
    const position = queue[i]
    if (reachedPhilipMeeting(position, 'philip')) { reached = true; break }
    for (const [dx, dy] of [[3, 0], [-3, 0], [0, 3], [0, -3]]) {
      const next = moveQuadSusan(position, { dx, dy }, 1 / 60)
      const key = `${next.x},${next.y}`
      if (next.section === 'lowerright' && !visited.has(key)) {
        visited.add(key)
        queue.push(next)
      }
    }
  }
  assert.ok(reached)
})
