import manifest from './assets/sprites/animated/manifest.json'

const images = import.meta.glob('./assets/sprites/animated/*.png', {
  eager: true, query: '?url', import: 'default',
})

export const characterImageUrls = Object.values(images)

export function characterAnimation(name, facing, moving) {
  const direction = moving && (facing === 'left' || facing === 'right') ? 'side' : facing
  const animation = manifest[name][moving ? 'walk' : 'idle'][direction]
  const url = images[`./assets/sprites/animated/${animation.file}`]
  if (!url) throw new Error(`Missing ${name} sprite sheet: ${animation.file}`)
  return { ...animation, url }
}
