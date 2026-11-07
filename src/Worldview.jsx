import { useEffect, useRef, useState } from 'react'
import { COLS, ROWS, TILE, CAMERA_HEIGHT, CAMERA_WIDTH, MOVEMENT_KEYS, rooms, furniture, isFloor, moveSusan, moveSusanDirection, touchDirection, moveChad, inDestination, cameraViewBox } from './worldview.js'

const startingSusan = { x: 180, y: 220, facing: 'down' }
const startingChad = { x: 180, y: 270, facing: 'down', waypoint: 0 }

function Character({ position, name, isSusan }) {
  const angle = { down: 0, left: 90, up: 180, right: -90 }[position.facing]
  return (
    <g transform={`translate(${position.x} ${position.y})`} data-character={isSusan ? 'susan' : 'chad'}
      data-x={position.x} data-y={position.y} aria-label={name}>
      <ellipse cy="11" rx="18" ry="10" fill="#10202b" opacity=".4" />
      <g transform={`rotate(${angle})`} stroke="#142633" strokeWidth="2.5">
        <path d="M-10 9v9h7v-9M3 9v9h7v-9" fill="#233544" />
        <ellipse cy="3" rx="14" ry="13" fill={isSusan ? '#75c8bf' : '#dd9969'} />
        <circle cy="-9" r="10" fill="#e7b498" />
        <path d="M-10-8q-3-17 12-12 10 3 8 13L3-12l-8 4z" fill={isSusan ? '#25303e' : '#784c39'} />
        {isSusan && <path d="M-7-5h5m4 0h5" strokeWidth="2" />}
        <path d="M-4 24l4 4 4-4" fill="none" stroke={isSusan ? '#8ce3d3' : '#efbf7c'} />
      </g>
      <rect x="-29" y="-47" width="58" height="19" rx="3" fill="#11222ee8" />
      <text y="-34" textAnchor="middle" fill={isSusan ? '#9ce7d9' : '#f1c585'} fontSize="10" fontWeight="700">{name}</text>
    </g>
  )
}

export default function Worldview() {
  const [world, setWorld] = useState({ susan: startingSusan, chad: startingChad, arrived: false })
  const viewportRef = useRef(null)
  const [cameraWidth, setCameraWidth] = useState(CAMERA_WIDTH)

  useEffect(() => {
    const viewport = viewportRef.current
    const observer = new ResizeObserver(([entry]) => {
      setCameraWidth(CAMERA_HEIGHT * entry.contentRect.width / entry.contentRect.height)
    })
    observer.observe(viewport)
    const keys = new Set()
    let gesture = null
    let susan = startingSusan
    let chad = startingChad
    let arrived = false
    let frame
    let previousTime
    function keyDown(event) {
      if (MOVEMENT_KEYS.has(event.code) || event.code === 'Space') event.preventDefault()
      if (MOVEMENT_KEYS.has(event.code)) keys.add(event.code)
    }
    function keyUp(event) {
      if (MOVEMENT_KEYS.has(event.code) || event.code === 'Space') event.preventDefault()
      keys.delete(event.code)
    }
    function clearKeys() {
      keys.clear()
      clearGesture()
      previousTime = undefined
    }
    function clearGesture() {
      const pointerId = gesture?.pointerId
      gesture = null
      if (pointerId !== undefined && viewport.hasPointerCapture(pointerId)) viewport.releasePointerCapture(pointerId)
    }
    function pointerDown(event) {
      if (event.pointerType === 'mouse' || !event.isPrimary || gesture) return
      event.preventDefault()
      gesture = { pointerId: event.pointerId, x: event.clientX, y: event.clientY,
        startX: event.clientX, startY: event.clientY, started: performance.now(), dragged: false }
      viewport.setPointerCapture(event.pointerId)
    }
    function pointerMove(event) {
      if (event.pointerId !== gesture?.pointerId) return
      const bounds = viewport.getBoundingClientRect()
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
        clearGesture()
        return
      }
      gesture.x = event.clientX
      gesture.y = event.clientY
      gesture.dragged ||= Math.hypot(gesture.x - gesture.startX, gesture.y - gesture.startY) > 8
    }
    function pointerEnd(event) {
      if (event.pointerId === gesture?.pointerId) clearGesture()
    }
    function tick(time) {
      const seconds = previousTime === undefined ? 0 : (time - previousTime) / 1000
      previousTime = time
      const direction = touchDirection(gesture, time, viewport.getBoundingClientRect())
      const nextSusan = direction ? moveSusanDirection(susan, direction, seconds) : moveSusan(susan, keys, seconds)
      const nextChad = moveChad(chad, seconds)
      if (nextSusan !== susan || nextChad !== chad) {
        susan = nextSusan
        chad = nextChad
        arrived = arrived || inDestination(susan)
        setWorld({ susan, chad, arrived })
      }
      frame = requestAnimationFrame(tick)
    }
    window.addEventListener('keydown', keyDown)
    window.addEventListener('keyup', keyUp)
    window.addEventListener('blur', clearKeys)
    document.addEventListener('visibilitychange', clearKeys)
    viewport.addEventListener('pointerdown', pointerDown)
    viewport.addEventListener('pointermove', pointerMove)
    viewport.addEventListener('pointerup', pointerEnd)
    viewport.addEventListener('pointercancel', pointerEnd)
    viewport.addEventListener('lostpointercapture', pointerEnd)
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      clearGesture()
      window.removeEventListener('keydown', keyDown)
      window.removeEventListener('keyup', keyUp)
      window.removeEventListener('blur', clearKeys)
      document.removeEventListener('visibilitychange', clearKeys)
      viewport.removeEventListener('pointerdown', pointerDown)
      viewport.removeEventListener('pointermove', pointerMove)
      viewport.removeEventListener('pointerup', pointerEnd)
      viewport.removeEventListener('pointercancel', pointerEnd)
      viewport.removeEventListener('lostpointercapture', pointerEnd)
    }
  }, [])

  return (
    <section className="story-panel worldview" aria-label="Worldview playing field" aria-describedby="worldview-controls">
      <div className="world-objective" role="status">
        <span className="eyebrow">{world.arrived ? 'DESTINATION REACHED' : 'YOUR OBJECTIVE'}</span>
        <p>{world.arrived ? 'You found the classroom. The classroom story is coming in the next build.' : 'Follow Chad. Enter Classroom 03, three doors down from Susan\'s office.'}</p>
      </div>
      <div className="world-viewport" ref={viewportRef}>
      <svg className="world-map" viewBox={cameraViewBox(world.susan, cameraWidth)} role="img"
        aria-label="Zoomed overhead view of Susan and her immediate surroundings. The camera follows her through the office, hallway, and classrooms.">
        <defs>
          <pattern id="floor-lines" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0v40" fill="none" stroke="#ffffff" strokeOpacity=".05" />
          </pattern>
        </defs>
        <rect width="1120" height="600" fill="#152a37" />
        {Array.from({ length: ROWS * COLS }, (_, index) => {
          const col = index % COLS
          const row = Math.floor(index / COLS)
          return isFloor(col, row) && <rect key={index} x={col * TILE} y={row * TILE} width={TILE} height={TILE}
            fill={row >= 8 ? '#a59880' : col < 7 ? '#416e75' : '#527b83'} />
        })}
        <rect width="1120" height="600" fill="url(#floor-lines)" />
        {rooms.map(room => (
          <g key={room.label}>
            <path d={`M${room.x * TILE} 35h${room.width * TILE}`} stroke="#8cb3b1" strokeWidth="8" />
            <text x={(room.x + room.width / 2) * TILE} y="67" textAnchor="middle" fill="#d8e9e4" fontSize="12" letterSpacing="1">{room.label}</text>
            <rect x={room.door * TILE} y="283" width="40" height="34" fill={room.door === 23 ? '#e9c486' : '#dbbe93'} />
            <path d={`M${room.door * TILE + 5} 300h30`} stroke="#665746" strokeWidth="3" />
          </g>
        ))}
        <text x="560" y="448" textAnchor="middle" fontSize="13" letterSpacing="6" fill="#514b44">DESIGN DEPARTMENT</text>
        <path d="M255 384h598m-14-8 14 8-14 8" fill="none" stroke="#f3e3bf" strokeWidth="3" strokeDasharray="10 10" opacity=".5" />
        <rect x="920" y="240" width="40" height="33" rx="8" fill="#eac689" opacity=".3" />
        {furniture.map(({ x, y, width, height, kind }) => (
          <g key={`${x}-${y}`}>
            <rect x={x + 4} y={y + 5} width={width} height={height} rx="4" fill="#132b36" opacity=".5" />
            <rect x={x} y={y} width={width} height={height} rx="4" fill={kind === 'shelf' ? '#324653' : '#d0a97c'} stroke="#243b47" strokeWidth="3" />
            {kind === 'desk' ? (
              <g><rect x={x + 16} y={y + 12} width="38" height="24" fill="#203944" /><rect x={x + 85} y={y + 15} width="28" height="33" fill="#f2e1bd" /></g>
            ) : <path d={`M${x + 9} ${y + 10}h${width - 18}`} stroke="#e8cb9e" strokeWidth="3" />}
          </g>
        ))}
        {[world.susan, world.chad].sort((a, b) => a.y - b.y).map(position => (
          <Character key={position === world.susan ? 'susan' : 'chad'} position={position}
            name={position === world.susan ? 'SUSAN' : 'CHAD'} isSusan={position === world.susan} />
        ))}
      </svg>
      </div>
      <div className="world-controls" id="worldview-controls">
        <span><strong>ARROW KEYS</strong> Move Susan</span>
        <span><strong>TOUCH</strong> Hold or drag to steer; release to stop</span>
        <span><strong>SPACE / TAP</strong> Reserved / inactive in this scene</span>
      </div>
    </section>
  )
}
