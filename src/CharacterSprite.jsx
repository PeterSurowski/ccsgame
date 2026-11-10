import { characterAnimation } from './characterSprites.js'
import { walkingFrame } from './worldview.js'

export default function CharacterSprite({ name, position, moving, animationSeconds, scale = 1 }) {
  const animation = characterAnimation(name, position.facing, moving)
  const frame = moving ? walkingFrame(animationSeconds, animation.frames, animation.fps) : 0
  const col = frame % animation.columns
  const row = Math.floor(frame / animation.columns)
  return (
    <g transform={`translate(${position.x} ${position.y}) scale(${scale})`} data-character={name}
      data-x={position.x} data-y={position.y} data-moving={moving} data-frame={frame} data-facing={position.facing}>
      <ellipse rx="13" ry="5" fill="#14202b" opacity=".3" />
      <g transform={moving && position.facing === 'left' ? 'scale(-1 1)' : undefined}>
        <svg x="-22.4" y="-84.8" width="44.8" height="89.6"
          viewBox={`${col * 112} ${row * 224} 112 224`} overflow="hidden">
          <image href={animation.url} width={animation.columns * 112}
            height={Math.ceil(animation.frames / animation.columns) * 224} />
        </svg>
      </g>
    </g>
  )
}
