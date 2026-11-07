import test from 'node:test'
import assert from 'node:assert/strict'
import { canStand, moveSusan, moveSusanDirection, touchDirection, moveChad, inDestination, chadRoute, cameraViewBox, CAMERA_WIDTH, CAMERA_HEIGHT, COLS, ROWS, TILE } from './worldview.js'

const start = { x: 180, y: 220, facing: 'down' }
const step = (position, key, frames) => {
  for (let i = 0; i < frames; i++) position = moveSusan(position, new Set([key]), 1 / 60)
  return position
}

test('camera shows a fixed local area centered on Susan throughout the level', () => {
  assert.ok(CAMERA_WIDTH < COLS * TILE / 2)
  assert.ok(CAMERA_HEIGHT < ROWS * TILE / 2)
  for (const position of [start, { x: 55, y: 55 }, { x: 560, y: 380 }, { x: 1065, y: 465 }]) {
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
  assert.ok(blocked.x <= 267)
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
  for (let i = 0; i < 30; i++) fast = moveSusan(fast, new Set(['ArrowDown']), 1 / 60)
  for (let i = 0; i < 15; i++) slow = moveSusan(slow, new Set(['ArrowDown']), 1 / 30)
  assert.deepEqual(fast, slow)
})

test('walls, furniture, and map boundaries block movement; doorways remain traversable', () => {
  assert.equal(canStand(80, 100), false)
  assert.equal(canStand(20, 380), false)
  assert.equal(canStand(1100, 380), false)
  assert.equal(canStand(300, 220), false)
  assert.equal(canStand(180, 300), true)
  assert.equal(canStand(940, 300), true)
  assert.ok(step(start, 'ArrowUp', 200).y >= 163)
  assert.ok(step(start, 'ArrowRight', 200).x <= 267)
  assert.ok(step(start, 'ArrowLeft', 200).x >= 118)
  assert.ok(step({ x: 500, y: 380 }, 'ArrowDown', 200).y <= 467)
})

test('Susan can follow the entire route into the third classroom without interaction', () => {
  let position = step(start, 'ArrowDown', 53)
  position = step(position, 'ArrowRight', 253)
  assert.equal(inDestination(position), false)
  position = step(position, 'ArrowUp', 44)
  assert.equal(canStand(position.x, position.y), true)
  assert.equal(inDestination(position), true)
})

test('Chad follows a walkable route and waits at the destination', () => {
  let position = { x: 180, y: 270, facing: 'down', waypoint: 0 }
  for (let i = 0; i < 600; i++) {
    position = moveChad(position, 1 / 60)
    assert.equal(canStand(position.x, position.y), true)
  }
  assert.equal(position.waypoint, chadRoute.length)
  assert.equal(inDestination(position), true)
  assert.equal(moveChad(position, 1 / 60), position)
})
