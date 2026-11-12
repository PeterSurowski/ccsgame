import { useEffect, useRef, useState } from 'react'
import { WORLD_WIDTH, WORLD_HEIGHT, CAMERA_HEIGHT, CAMERA_WIDTH, MOVEMENT_KEYS, startingSusan, startingChad, moveSusan, moveSusanDirection, moveChad, touchDirection, cameraViewBox, reachedClassroomDoor } from './worldview.js'
import background from './assets/backgrounds/background1.png'
import CharacterSprite from './CharacterSprite.jsx'
import { characterImageUrls } from './characterSprites.js'
import { startingQuadSusan, quadSections, moveQuadSusan, quadCamera, nearDazedStudent, quadSusanScale, reachedPhilipMeeting, reachedMattMeeting } from './quad.js'
import useSceneAdvance from './useSceneAdvance.js'
import LocationArrow from './LocationArrow.jsx'
import quadLowerLeft from './assets/scenes/quad-lowerleft.png'
import quadUpperLeft from './assets/scenes/quad-upperleft.png'
import quadLowerRight from './assets/scenes/quad-lowerright.png'

const quadBackgrounds = { lowerleft: quadLowerLeft, upperleft: quadUpperLeft, lowerright: quadLowerRight }

export default function Worldview({ onEnterClassroom, quad = false, professor, onMeetPhilip, onMeetMatt }) {
  const initialSusan = quad ? startingQuadSusan : startingSusan
  const [world, setWorld] = useState({
    susan: { position: initialSusan, moving: false, animationSeconds: 0 },
    chad: { position: startingChad, moving: false, animationSeconds: 0 },
  })
  const [assetError, setAssetError] = useState('')
  const viewportRef = useRef(null)
  const [cameraWidth, setCameraWidth] = useState(CAMERA_WIDTH)
  const [showStudentDialogue, setShowStudentDialogue] = useState(false)
  const dialoguePaused = useRef(false)
  const studentEncountered = useRef(false)
  const advanceHandlers = useSceneAdvance(showStudentDialogue, () => {
    dialoguePaused.current = false
    setShowStudentDialogue(false)
  })

  useEffect(() => {
    const images = [...(quad ? Object.values(quadBackgrounds) : [background]), ...characterImageUrls].map(url => {
      const image = new Image()
      image.onerror = () => {
        console.error('Worldview artwork failed to load:', url)
        setAssetError('Worldview artwork could not be loaded. Please reload the page.')
      }
      image.src = url
      return image
    })
    return () => images.forEach(image => { image.onerror = null })
  }, [quad])

  useEffect(() => {
    const viewport = viewportRef.current
    const observer = new ResizeObserver(([entry]) => {
      setCameraWidth(CAMERA_HEIGHT * entry.contentRect.width / entry.contentRect.height)
    })
    observer.observe(viewport)
    const keys = new Set()
    let gesture = null
    let susan = quad ? startingQuadSusan : startingSusan
    let chad = startingChad
    let animationSeconds = 0
    let chadAnimationSeconds = 0
    let frame
    let previousTime
    function keyDown(event) {
      if (MOVEMENT_KEYS.has(event.code) || event.code === 'Space') event.preventDefault()
      if (!dialoguePaused.current && MOVEMENT_KEYS.has(event.code)) keys.add(event.code)
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
      if (dialoguePaused.current || event.pointerType === 'mouse' || !event.isPrimary || gesture) return
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
      const bounds = viewport.getBoundingClientRect()
      const camera = quad ? quadCamera(susan, CAMERA_HEIGHT * bounds.width / bounds.height) : null
      const direction = touchDirection(gesture, time, bounds,
        camera ? (susan.y - camera.y) / camera.height : .5,
        camera ? (susan.x - camera.x) / camera.width : .5)
      const nextSusan = dialoguePaused.current ? susan : quad ? moveQuadSusan(susan, direction ?? {
        dx: Number(keys.has('ArrowRight')) - Number(keys.has('ArrowLeft')),
        dy: Number(keys.has('ArrowDown')) - Number(keys.has('ArrowUp')),
      }, seconds) : direction ? moveSusanDirection(susan, direction, seconds) : moveSusan(susan, keys, seconds)
      if (quad && reachedPhilipMeeting(nextSusan, professor)) {
        clearKeys()
        onMeetPhilip()
        return
      }
      if (quad && reachedMattMeeting(nextSusan, professor)) {
        clearKeys()
        onMeetMatt()
        return
      }
      if (quad && !studentEncountered.current && nearDazedStudent(nextSusan)) {
        studentEncountered.current = true
        dialoguePaused.current = true
        clearKeys()
        setShowStudentDialogue(true)
      }
      if (!quad && reachedClassroomDoor(nextSusan)) {
        clearKeys()
        onEnterClassroom()
        return
      }
      const nextChad = quad ? chad : moveChad(chad, seconds)
      const moving = !dialoguePaused.current && (nextSusan.x !== susan.x || nextSusan.y !== susan.y)
      const chadMoving = nextChad.x !== chad.x || nextChad.y !== chad.y
      animationSeconds = moving ? (nextSusan.facing === susan.facing ? animationSeconds : 0) + Math.min(seconds, .05) : 0
      chadAnimationSeconds = chadMoving ? (nextChad.facing === chad.facing ? chadAnimationSeconds : 0) + Math.min(seconds, .05) : 0
      susan = nextSusan
      chad = nextChad
      const snapshot = {
        susan: { position: susan, moving, animationSeconds },
        chad: { position: chad, moving: chadMoving, animationSeconds: chadAnimationSeconds },
      }
      setWorld(previous => previous.susan.position === snapshot.susan.position && previous.chad.position === snapshot.chad.position
        && previous.susan.moving === moving && previous.chad.moving === chadMoving && !moving && !chadMoving
        ? previous : snapshot)
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
  }, [onEnterClassroom, quad, professor, onMeetPhilip, onMeetMatt])

  const section = world.susan.position.section
  const area = quad ? quadSections[section] : { width: WORLD_WIDTH, height: WORLD_HEIGHT }
  const camera = quad ? quadCamera(world.susan.position, cameraWidth) : null
  const viewBox = camera ? `${camera.x} ${camera.y} ${camera.width} ${camera.height}`
    : cameraViewBox(world.susan.position, cameraWidth, CAMERA_HEIGHT)

  return (
    <section className="worldview" aria-label={quad ? 'Quad playing field' : 'Worldview playing field'} data-section={section}
      {...advanceHandlers}>
      {assetError && <p className="video-notice" role="alert">{assetError}</p>}
      <div className="world-viewport" ref={viewportRef}>
      <svg className="world-map" viewBox={viewBox} role="img"
        aria-label={quad ? `Susan exploring the ${section} quad section.` : 'Susan exploring the illustrated CCS foyer, with Chad walking from the left doorway to the right doorway.'}>
        <image href={quad ? quadBackgrounds[section] : background} width={area.width} height={area.height} />
        {(quad ? ['susan'] : ['susan', 'chad']).sort((a, b) => world[a].position.y - world[b].position.y)
          .map(name => <CharacterSprite key={name} name={name} {...world[name]}
            scale={quad ? quadSusanScale(section) : 1} />)}
        {!quad && (
          <g transform="translate(390 120) scale(.5)" data-location="classroom-door">
            <LocationArrow />
          </g>
        )}
      </svg>
      </div>
      {!quad && (
        <div className="worldview-controls-hint" role="img"
          aria-label="Move Susan with the keyboard arrow keys, or touch and hold the screen and move your finger to steer.">
          <svg viewBox="0 0 150 210" aria-hidden="true">
            <g className="controls-keycaps">
              <rect x="57" y="2" width="36" height="36" rx="5" />
              <rect x="15" y="44" width="36" height="36" rx="5" />
              <rect x="57" y="44" width="36" height="36" rx="5" />
              <rect x="99" y="44" width="36" height="36" rx="5" />
            </g>
            <g className="controls-key-arrows">
              <path d="M75 29V11m-7 7 7-7 7 7" />
              <path d="M42 62H24m7-7-7 7 7 7" />
              <path d="M75 53v18m-7-7 7 7 7-7" />
              <path d="M108 62h18m-7-7 7 7-7 7" />
            </g>
            <text x="75" y="104" textAnchor="middle">or</text>
            <circle className="controls-touch-track" cx="70" cy="145" r="18" />
            <g className="controls-touch-finger">
              <circle className="controls-touch-contact" cx="70" cy="145" r="9" />
              <path className="controls-hand" d="M65 173v-28a5 5 0 0 1 10 0v15-4a5 5 0 0 1 10 0v5-2a5 5 0 0 1 10 0v5a5 5 0 0 1 10 0v17c0 12-6 19-17 19H78c-6 0-10-3-14-8l-12-17a5 5 0 0 1 8-6l5 4Z" />
            </g>
          </svg>
        </div>
      )}
      {showStudentDialogue && (
        <div className="video-dialogue" role="status">
          <p>Dazed student (mumbling): Why am I here? What am I learning? Will I land a job after all this?</p>
          <small>Tap the screen or press the spacebar to continue.</small>
        </div>
      )}
    </section>
  )
}
