import CharacterSprite from './CharacterSprite.jsx'
import { mazeCharacterHeight, mazeCharacterScale, mazeNpcs, mazePalms, mazePeterScale, mazeSections } from './mazeGame.js'
import { mazeBackgrounds, mazeCutouts } from './mazeArtwork.js'

function Cutout({ asset, x, y, width, height, onError }) {
  return <image href={mazeCutouts[`./assets/maze/${asset}.png`]} x={x - width / 2} y={y - height}
    width={width} height={height} preserveAspectRatio="xMidYMax meet" onError={onError} />
}

export default function MazeGameArt({ state, camera, elapsed, moving, onError }) {
  const section = state.position.section
  const area = mazeSections[section]
  const actors = mazeNpcs.filter(npc => npc.section === section).map(npc => {
    const height = mazeCharacterHeight * mazeCharacterScale(npc.y, area.height)
    return {
      y: npc.y, key: npc.id,
      element: <Cutout {...npc} width={height * (npc.width ? 1 : .4)} height={height} onError={onError} />,
    }
  })
  actors.push({ y: state.position.y, key: 'peter', element: <CharacterSprite name="peter" position={state.position}
    moving={moving} animationSeconds={elapsed}
    scale={mazePeterScale * mazeCharacterScale(state.position.y, area.height)} /> })
  if (section === 'F') actors.push({ y: 268, key: 'line',
    element: <Cutout asset="line" x={304} y={268}
      width={mazeCharacterHeight * mazeCharacterScale(268, area.height) * 953 / 405}
      height={mazeCharacterHeight * mazeCharacterScale(268, area.height)} onError={onError} /> })
  actors.sort((a, b) => a.y - b.y)

  return <svg className="maze-map" viewBox={`${camera.x} ${camera.y} ${camera.width} ${camera.height}`}
    role="img" aria-label={`Peter exploring campus section ${section}`} preserveAspectRatio="xMidYMid meet">
    <image href={mazeBackgrounds[`./assets/scenes/MazeGame-${section}.png`]}
      width={area.width} height={area.height} onError={onError} />
    {section === 'F' && <g transform="translate(274 215)">
      <rect x="-32" y="-13" width="64" height="14" rx="2" fill="#365966" stroke="#e5cc9e" />
      <text textAnchor="middle" y="-3" fontSize="9" fontWeight="800" fill="#fff1d4">Admissions</text>
    </g>}
    {actors.map(actor => <g key={actor.key}>{actor.element}</g>)}
    {mazePalms.filter(palm => palm.section === section).map(palm => <g key={`${palm.x}-${palm.y}`}>
      <ellipse cx={palm.x + 13} cy={palm.y + 2} rx="31" ry="11" opacity=".15" fill="#24392b" />
      <Cutout {...palm} asset="palm" width={74} height={139} onError={onError} />
    </g>)}
    {!state.visited.includes('first') && section === 'H' && <g
      transform={`translate(256 ${347 - mazeCharacterHeight * mazeCharacterScale(347, area.height) - 10})`}>
      <path d="M-7-12H7V0H3L0 4L-3 0H-7Z" fill="#fff3d9" stroke="#354655" />
      <text y="-3" textAnchor="middle" fontSize="11" fontWeight="900" fill="#9e454f">!</text>
    </g>}
  </svg>
}
