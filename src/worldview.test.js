import test from 'node:test'
import assert from 'node:assert/strict'
import { canStand, moveSusan, moveSusanDirection, moveChad, chadRoute, touchDirection, walkingFrame, cameraViewBox, CAMERA_WIDTH, CAMERA_HEIGHT, BACKGROUND_SCALE, WORLD_WIDTH, WORLD_HEIGHT, floorBoundary, startingSusan, startingChad, reachedClassroomDoor } from './worldview.js'
import { readFileSync } from 'node:fs'

const start = { x: 280, y: 190, facing: 'up' }
const step = (position, key, frames) => {
  for (let i = 0; i < frames; i++) position = moveSusan(position, new Set([key]), 1 / 60)
  return position
}

test('camera shows a fixed local area centered on Susan throughout the level', () => {
  for (const position of [start, { x: 560, y: 150 }, { x: 560, y: 380 }, { x: 800, y: 420 }]) {
    const [left, top, width, height] = cameraViewBox(position).split(' ').map(Number)
    assert.equal(width, CAMERA_WIDTH)
    assert.equal(height, CAMERA_HEIGHT)
    assert.equal(left + width / 2, position.x)
    assert.equal(top + height / 2, position.y)
  }
})

test('all four arrows move; other inputs and opposite arrows do not', () => {
  for (const [key, dx, dy] of [['ArrowUp', 0, -3], ['ArrowDown', 0, 3], ['ArrowLeft', -3, 0], ['ArrowRight', 3, 0]]) {
    const next = moveSusan(start, new Set([key]), 1 / 60)
    assert.equal(next.x, start.x + dx)
    assert.equal(next.y, start.y + dy)
  }
  for (const key of ['Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'Enter']) {
    assert.equal(moveSusan(start, new Set([key]), 1 / 60), start)
  }
  assert.equal(moveSusan(start, new Set(['ArrowLeft', 'ArrowRight']), 1 / 60), start)
})

test('touch distinguishes quick taps from holds and drags with a neutral zone', () => {
  const bounds = { left: 10, top: 20, width: 400, height: 500 }
  const gesture = { x: 310, y: 320, started: 100, dragged: false }
  assert.equal(touchDirection(null, 400, bounds), null)
  assert.equal(touchDirection(gesture, 279, bounds), null)
  assert.deepEqual(touchDirection(gesture, 280, bounds), { dx: 100, dy: 50 })
  assert.deepEqual(touchDirection({ ...gesture, dragged: true }, 101, bounds), { dx: 100, dy: 50 })
  assert.deepEqual(touchDirection({ ...gesture, x: 234, y: 270 }, 300, bounds), { dx: 0, dy: 0 })
})

test('touch shares fixed speed, collision, and stopped movement with keyboard controls', () => {
  const next = moveSusanDirection(start, { dx: 500, dy: 1000 }, 1 / 60)
  assert.ok(Math.abs(Math.hypot(next.x - start.x, next.y - start.y) - 3) < 1e-9)
  assert.equal(moveSusanDirection(start, { dx: 0, dy: 0 }, 1 / 60), start)
  assert.deepEqual(moveSusanDirection(start, { dx: 0, dy: 1000 }, 1 / 60), moveSusan(start, new Set(['ArrowDown']), 1 / 60))
  let blocked = start
  for (let i = 0; i < 200; i++) blocked = moveSusanDirection(blocked, { dx: 1000, dy: 0 }, 1 / 60)
  assert.ok(blocked.x < WORLD_WIDTH)
  assert.equal(canStand(blocked.x, blocked.y), true)
})

test('portrait camera keeps its height and centers Susan with a narrower width', () => {
  const [left, top, width, height] = cameraViewBox(start, 224).split(' ').map(Number)
  assert.equal(width, 224)
  assert.equal(height, 280)
  assert.equal(left + width / 2, start.x)
  assert.equal(top + height / 2, start.y)
})

test('movement speed is normalized and frame-rate independent with bounded long frames', () => {
  const diagonal = moveSusan(start, new Set(['ArrowRight', 'ArrowDown']), 1 / 60)
  assert.ok(Math.abs(Math.hypot(diagonal.x - start.x, diagonal.y - start.y) - 3) < 1e-9)
  assert.equal(moveSusan(start, new Set(['ArrowDown']), 0).y, start.y)
  assert.equal(moveSusan(start, new Set(['ArrowDown']), 10).y, start.y + 9)
  let fast = start
  let slow = start
  for (let i = 0; i < 30; i++) fast = moveSusan(fast, new Set(['ArrowUp']), 1 / 60)
  for (let i = 0; i < 15; i++) slow = moveSusan(slow, new Set(['ArrowUp']), 1 / 30)
  assert.deepEqual(fast, slow)
})

test('the traced foyer walls, displays, glass and image boundaries block Susan at her feet', () => {
  for (const [x, y] of [[80, 100], [20, 380], [1100, 380], [300, 220], [450, 210], [800, 250], [560, 440]]) {
    assert.equal(canStand(x * BACKGROUND_SCALE, y * BACKGROUND_SCALE), false, `${x},${y} should be blocked`)
  }
  assert.equal(canStand(start.x, start.y), true)
  assert.equal(canStand(startingChad.x, startingChad.y), true)
  assert.equal(canStand(560 * BACKGROUND_SCALE, 170 * BACKGROUND_SCALE), true)
  for (const key of ['ArrowUp', 'ArrowRight', 'ArrowLeft', 'ArrowDown']) {
    const blocked = step(start, key, 400)
    assert.equal(canStand(blocked.x, blocked.y), true)
    assert.ok(blocked.x > 70 && blocked.x < 440 && blocked.y >= 80 && blocked.y <= 211)
  }
})

test('Susan can explore across the foyer', () => {
  const across = step(start, 'ArrowLeft', 30)
  assert.equal(across.x, 190)
  assert.equal(canStand(across.x, across.y), true)
})

test('background, floor trace and starting positions are rendered at half scale', () => {
  assert.equal(BACKGROUND_SCALE, 0.5)
  assert.equal(WORLD_WIDTH, 512)
  assert.equal(WORLD_HEIGHT, 224)
  assert.deepEqual(floorBoundary[0], [115, 130])
  assert.equal(startingSusan.x, 130)
  assert.equal(startingSusan.y, 150)
  assert.equal(startingChad.x, 155)
  assert.equal(startingChad.y, 165)
})

test('Susan starts by the left door with Chad just ahead and room to follow', () => {
  assert.equal(canStand(startingSusan.x, startingSusan.y), true)
  assert.equal(canStand(startingChad.x, startingChad.y), true)
  assert.equal(startingSusan.facing, 'right')
  assert.equal(startingChad.facing, 'right')
  assert.ok(startingChad.x > startingSusan.x)
  assert.ok(Math.hypot(startingChad.x - startingSusan.x, startingChad.y - startingSusan.y) >= 26)
  const next = moveSusan(startingSusan, new Set(['ArrowRight']), 1 / 60)
  assert.equal(next.x, startingSusan.x + 3)
  assert.equal(next.y, startingSusan.y)
  assert.deepEqual(chadRoute.at(-1), { x: 350, y: 142.5 })
  assert.ok(chadRoute.at(-1).x + 22.4 < 770 * BACKGROUND_SCALE, 'Chad silhouette stays left of the right doorway')
})

test('walking advances at video frame rate and wraps each extracted cycle', () => {
  const manifest = JSON.parse(readFileSync(new URL('./assets/sprites/animated/manifest.json', import.meta.url)))
  for (const name of ['susan', 'chad']) {
    for (const direction of ['up', 'down', 'side']) {
      const { frames, fps } = manifest[name].walk[direction]
      assert.ok(frames >= 15 && frames <= 36)
      assert.equal(fps, 24)
      assert.equal(walkingFrame(0, frames, fps), 0)
      assert.equal(walkingFrame(1.01 / fps, frames, fps), 1)
      assert.equal(walkingFrame((frames + .01) / fps, frames, fps), 0)
      assert.equal(walkingFrame((frames - .5) / fps, frames, fps), frames - 1)
    }
  }
})

test('the classroom trigger is reachable by movement, not Susan spawn or Chad waiting spot', () => {
  assert.equal(reachedClassroomDoor(startingSusan), false)
  assert.equal(reachedClassroomDoor(chadRoute.at(-1)), false)
  for (const point of [{ x: 376, y: 190 }, { x: 410, y: 150 }, { x: 355, y: 120 }, { x: 425, y: 195 }]) {
    assert.equal(reachedClassroomDoor(point), true)
  }
  for (const point of [{ x: 354, y: 150 }, { x: 426, y: 150 }, { x: 380, y: 119 }, { x: 380, y: 196 }]) {
    assert.equal(reachedClassroomDoor(point), false)
  }
  let position = startingSusan
  for (let i = 0; i < 120 && !reachedClassroomDoor(position); i++) {
    position = moveSusan(position, new Set(['ArrowRight']), 1 / 60)
    assert.equal(canStand(position.x, position.y), true)
  }
  assert.equal(reachedClassroomDoor(position), true)
})

test('Chad walks from the left door to the right door on the floor and then stays idle', () => {
  let position = startingChad
  const facings = new Set()
  for (let i = 0; i < 600; i++) {
    position = moveChad(position, 1 / 60)
    assert.equal(canStand(position.x, position.y), true, `Chad left floor at ${position.x},${position.y}`)
    facings.add(position.facing)
  }
  assert.equal(position.waypoint, chadRoute.length)
  assert.equal(position.x, chadRoute.at(-1).x)
  assert.equal(position.y, chadRoute.at(-1).y)
  assert.equal(position.facing, 'right', 'Chad faces the doorway beside him after arriving')
  assert.ok(facings.has('right') && facings.has('up'))
  assert.equal(moveChad(position, 1 / 60), position)
  assert.equal(moveChad(startingChad, 10).x, moveChad(startingChad, .05).x)
})
