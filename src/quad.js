import { RADIUS, CAMERA_HEIGHT, moveSusanDirection } from './worldview.js'
import walkable from './quadWalkable.json' with { type: 'json' }

export const quadSections = walkable

export function quadEntry(section) {
  return { section, ...quadSections[section].start, facing: 'up', returnArmed: false }
}

export const startingQuadSusan = quadEntry('lowerleft')

export function nearDazedStudent(position) {
  return position.section === 'lowerleft' && Math.hypot(position.x - 320, position.y - 295) <= 75
}

export function reachedPhilipMeeting(position, professor) {
  return professor === 'philip' && position.section === 'lowerright'
    && position.x >= 450 && position.y <= 340
    && canStandInQuad(position.section, position.x, position.y)
}

export function reachedMattMeeting(position, professor) {
  const top = quadSections.upperleft.rows.findIndex(row => row.length > 0)
  return professor === 'matt' && position.section === 'upperleft'
    && position.y <= top + 12
    && canStandInQuad(position.section, position.x, position.y)
}

export function quadSusanScale(section) {
  return section === 'lowerleft' ? 1.25 : .5
}

export function quadCamera(position, viewWidth) {
  const area = quadSections[position.section]
  const zoom = position.section === 'lowerright' ? .75 : 1
  const requestedWidth = viewWidth / zoom
  const requestedHeight = CAMERA_HEIGHT / zoom
  const scale = Math.min(1, area.width / requestedWidth, area.height / requestedHeight)
  const width = requestedWidth * scale
  const height = requestedHeight * scale
  return {
    x: Math.max(0, Math.min(area.width - width, position.x - width / 2)),
    y: Math.max(0, Math.min(area.height - height, position.y - height * .75)),
    width,
    height,
  }
}

export function canStandInQuad(section, x, y) {
  const area = quadSections[section]
  if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || y < 0 || x >= area.width || y >= area.height) return false
  const row = area.rows[Math.floor(y)]
  for (let i = 0; i < row.length; i += 2) {
    if (x >= row[i] && x < row[i + 1]) return true
  }
  return false
}

export function moveQuadSusan(position, direction, seconds) {
  const next = moveSusanDirection(position, direction, seconds,
    (x, y) => canStandInQuad(position.section, x, y))
  const area = quadSections[position.section]
  const margin = RADIUS + 9
  if (position.section === 'lowerleft') {
    if ((direction.dx < 0 && next.x <= margin) || (direction.dy < 0 && next.y <= margin)) {
      return quadEntry('upperleft')
    }
    if (direction.dx > 0 && next.x >= area.width - margin) {
      return quadEntry('lowerright')
    }
  } else {
    if (position.returnArmed && direction.dy > 0 && next.y >= area.start.y - 3) {
      return quadEntry('lowerleft')
    }
    if (!position.returnArmed && next.y < area.start.y - 30) return { ...next, returnArmed: true }
  }
  return next
}
