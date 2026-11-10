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

export function nextChoice(selected, direction) {
  if (selected === null) return 0
  return Math.max(0, Math.min(1, selected + direction))
}
