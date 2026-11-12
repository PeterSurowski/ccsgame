export const MAP_WIDTH = 1024
export const MAP_HEIGHT = 672
export const professorLocations = {
  philip: { x: 826, y: 326, label: 'Philip McAvoy: boulder in the circular walkway' },
  matt: { x: 220, y: 273, label: 'Matt Raupp: building entrance' },
}

export function clampMapCenter(center, viewWidth) {
  const width = Math.min(viewWidth, MAP_WIDTH)
  return Math.max(width / 2, Math.min(MAP_WIDTH - width / 2, center))
}

export function nextChoice(selected, direction, count = 2, disabled = []) {
  const available = Array.from({ length: count }, (_, index) => index)
    .filter(index => !disabled.includes(index))
  if (!available.length) return null
  const position = available.indexOf(selected)
  if (position === -1) return available[0]
  return available[Math.max(0, Math.min(available.length - 1, position + direction))]
}
