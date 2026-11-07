export const TILE = 40
export const COLS = 28
export const ROWS = 15
export const RADIUS = 13
export const CAMERA_WIDTH = 480
export const CAMERA_HEIGHT = 280
export const MOVEMENT_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'])

export function cameraViewBox({ x, y }, width = CAMERA_WIDTH) {
  return `${x - width / 2} ${y - CAMERA_HEIGHT / 2} ${width} ${CAMERA_HEIGHT}`
}

export function touchDirection(gesture, time, bounds) {
  if (!gesture || (!gesture.dragged && time - gesture.started < 180)) return null
  const dx = gesture.x - (bounds.left + bounds.width / 2)
  const dy = gesture.y - (bounds.top + bounds.height / 2)
  return Math.hypot(dx, dy) <= 24 ? { dx: 0, dy: 0 } : { dx, dy }
}

export const rooms = [
  { x: 1, width: 6, door: 4, label: "SUSAN'S OFFICE" },
  { x: 8, width: 4, door: 10, label: 'CLASSROOM 01' },
  { x: 13, width: 5, door: 16, label: 'CLASSROOM 02' },
  { x: 20, width: 7, door: 23, label: 'CLASSROOM 03' },
]

export function isFloor(col, row) {
  return (col >= 1 && col <= 26 && row >= 8 && row <= 11)
    || rooms.some(room => (col >= room.x && col < room.x + room.width && row >= 1 && row <= 6)
      || (col === room.door && row === 7))
}

export const furniture = [
  { x: 75, y: 85, width: 145, height: 65, kind: 'desk' },
  { x: 65, y: 185, width: 40, height: 60, kind: 'shelf' },
  ...[360, 560, 840, 960].flatMap(x => [100, 180].map(y => (
    { x, y, width: 55, height: 35, kind: 'student-desk' }
  ))),
]

function overlapsCircle(x, y, rect) {
  const nearestX = Math.max(rect.x, Math.min(x, rect.x + rect.width))
  const nearestY = Math.max(rect.y, Math.min(y, rect.y + rect.height))
  return Math.hypot(x - nearestX, y - nearestY) < RADIUS
}

export function canStand(x, y) {
  if (x < RADIUS || y < RADIUS || x > COLS * TILE - RADIUS || y > ROWS * TILE - RADIUS) return false
  for (let row = Math.floor((y - RADIUS) / TILE); row <= Math.floor((y + RADIUS) / TILE); row++) {
    for (let col = Math.floor((x - RADIUS) / TILE); col <= Math.floor((x + RADIUS) / TILE); col++) {
      if (!isFloor(col, row) && overlapsCircle(x, y, { x: col * TILE, y: row * TILE, width: TILE, height: TILE })) return false
    }
  }
  return !furniture.some(rect => overlapsCircle(x, y, rect))
}

export function moveSusan(position, keys, seconds) {
  const dx = Number(keys.has('ArrowRight')) - Number(keys.has('ArrowLeft'))
  const dy = Number(keys.has('ArrowDown')) - Number(keys.has('ArrowUp'))
  return moveSusanDirection(position, { dx, dy }, seconds)
}

export function moveSusanDirection(position, { dx, dy }, seconds) {
  const length = Math.hypot(dx, dy)
  if (!length) return position
  const distance = 180 * Math.min(Math.max(seconds, 0), 0.05)
  const next = { ...position, facing: Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up') }
  const x = next.x + dx / length * distance
  if (canStand(x, next.y)) next.x = x
  const y = next.y + dy / length * distance
  if (canStand(next.x, y)) next.y = y
  return next
}

export const chadRoute = [{ x: 180, y: 380 }, { x: 940, y: 380 }, { x: 940, y: 250 }]

export function moveChad(position, seconds) {
  const target = chadRoute[position.waypoint]
  if (!target) return position
  const dx = target.x - position.x
  const dy = target.y - position.y
  const distance = Math.hypot(dx, dy)
  const step = Math.min(150 * Math.min(Math.max(seconds, 0), 0.05), distance)
  return {
    x: distance ? position.x + dx / distance * step : position.x,
    y: distance ? position.y + dy / distance * step : position.y,
    facing: dx ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'),
    waypoint: position.waypoint + Number(step === distance),
  }
}

export function inDestination({ x, y }) {
  return x > 20 * TILE && x < 27 * TILE && y < 260
}
