export const BACKGROUND_SCALE = 0.5
export const WORLD_WIDTH = 1024 * BACKGROUND_SCALE
export const WORLD_HEIGHT = 448 * BACKGROUND_SCALE
export const RADIUS = 13
export const CAMERA_WIDTH = 480
export const CAMERA_HEIGHT = 280
export const MOVEMENT_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'])

export function cameraViewBox({ x, y }, width = CAMERA_WIDTH, height = CAMERA_HEIGHT, verticalAnchor = .5) {
  return `${x - width / 2} ${y - height * verticalAnchor} ${width} ${height}`
}

export function touchDirection(gesture, time, bounds, verticalAnchor = .5, horizontalAnchor = .5) {
  if (!gesture || (!gesture.dragged && time - gesture.started < 180)) return null
  const dx = gesture.x - (bounds.left + bounds.width * horizontalAnchor)
  const dy = gesture.y - (bounds.top + bounds.height * verticalAnchor)
  return Math.hypot(dx, dy) <= 24 ? { dx: 0, dy: 0 } : { dx, dy }
}

export const startingSusan = { x: 260 * BACKGROUND_SCALE, y: 300 * BACKGROUND_SCALE, facing: 'right' }
export const startingChad = { x: 310 * BACKGROUND_SCALE, y: 330 * BACKGROUND_SCALE, facing: 'right', waypoint: 0 }
export const chadRoute = [[690, 330], [700, 285]]
  .map(([x, y]) => ({ x: x * BACKGROUND_SCALE, y: y * BACKGROUND_SCALE }))

export function reachedClassroomDoor({ x, y }) {
  return x >= 710 * BACKGROUND_SCALE && x <= 850 * BACKGROUND_SCALE
    && y >= 240 * BACKGROUND_SCALE && y <= 390 * BACKGROUND_SCALE
}

// Foot-level floor boundary traced in background1.png's native pixel coordinates.
export const floorBoundary = [
  [230, 260], [340, 260], [360, 236], [500, 236], [506, 135],
  [645, 135], [697, 238], [765, 242], [805, 335], [878, 448],
  [145, 448], [220, 355],
].map(([x, y]) => [x * BACKGROUND_SCALE, y * BACKGROUND_SCALE])

export function canStand(x, y) {
  let inside = false
  for (let i = 0, j = floorBoundary.length - 1; i < floorBoundary.length; j = i++) {
    const [ax, ay] = floorBoundary[j]
    const [bx, by] = floorBoundary[i]
    if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) inside = !inside
    const dx = bx - ax
    const dy = by - ay
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)))
    if (Math.hypot(x - (ax + t * dx), y - (ay + t * dy)) < RADIUS) return false
  }
  return inside
}

export function moveSusan(position, keys, seconds) {
  const dx = Number(keys.has('ArrowRight')) - Number(keys.has('ArrowLeft'))
  const dy = Number(keys.has('ArrowDown')) - Number(keys.has('ArrowUp'))
  return moveSusanDirection(position, { dx, dy }, seconds)
}

export function moveSusanDirection(position, { dx, dy }, seconds, stand = canStand) {
  const time = Math.min(Math.max(seconds, 0), .05)
  const steps = Math.max(1, Math.ceil(time * 360))
  let next = position
  for (let step = 0; step < steps; step += 1) {
    next = slideMovementStep(next, { dx, dy }, time / steps, stand)
  }
  return next
}

export function slideMovementStep(position, direction, seconds, stand) {
  const length = Math.hypot(direction.dx, direction.dy)
  if (!length) return position
  const distance = 180 * Math.min(Math.max(seconds, 0), .05)
  const dx = direction.dx / length, dy = direction.dy / length
  if (stand(position.x + dx * distance, position.y + dy * distance)) {
    return moveAxisStep(position, direction, seconds, stand)
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
  return moveAxisStep(position, direction, seconds, stand)
}

function moveAxisStep(position, { dx, dy }, seconds, stand) {
  const length = Math.hypot(dx, dy)
  if (!length) return position
  const distance = 180 * Math.min(Math.max(seconds, 0), 0.05)
  const next = { ...position, facing: Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up') }
  const x = next.x + dx / length * distance
  if (stand(x, next.y)) next.x = x
  const y = next.y + dy / length * distance
  if (stand(next.x, y)) next.y = y
  return next
}

export function walkingFrame(seconds, frameCount, fps = 24) {
  return Math.floor(seconds * fps) % frameCount
}

export function moveChad(position, seconds) {
  const target = chadRoute[position.waypoint]
  if (!target) return position
  const dx = target.x - position.x
  const dy = target.y - position.y
  const distance = Math.hypot(dx, dy)
  const step = Math.min(75 * Math.min(Math.max(seconds, 0), .05), distance)
  return {
    x: distance ? position.x + dx / distance * step : position.x,
    y: distance ? position.y + dy / distance * step : position.y,
    facing: position.waypoint === chadRoute.length - 1 && step === distance ? 'right'
      : Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'),
    waypoint: position.waypoint + Number(step === distance),
  }
}
