export const mazeBackgrounds = import.meta.glob('./assets/scenes/MazeGame-?.png', {
  eager: true, query: '?url', import: 'default',
})
export const mazeCutouts = import.meta.glob('./assets/maze/*.png', {
  eager: true, query: '?url', import: 'default',
})
export const mazeArtworkUrls = [...Object.values(mazeBackgrounds), ...Object.values(mazeCutouts)]
