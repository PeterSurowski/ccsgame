import { useEffect, useRef, useState } from 'react'
import mapImage from './assets/scenes/campusmap.png'
import { MAP_WIDTH, MAP_HEIGHT, professorLocations, clampMapCenter } from './campusMap.js'
import useSceneAdvance from './useSceneAdvance.js'
import LocationArrow from './LocationArrow.jsx'

export default function CampusMap({ professor, onContinue }) {
  const viewportRef = useRef(null)
  const centerRef = useRef(MAP_WIDTH / 2)
  const widthRef = useRef(MAP_HEIGHT * 9 / 16)
  const [view, setView] = useState({ center: MAP_WIDTH / 2, width: MAP_HEIGHT * 9 / 16 })
  const [error, setError] = useState(false)
  const location = professorLocations[professor]
  const advanceHandlers = useSceneAdvance(!error, onContinue)

  function pan(distance) {
    centerRef.current = clampMapCenter(centerRef.current + distance, widthRef.current)
    setView({ center: centerRef.current, width: widthRef.current })
  }

  useEffect(() => {
    const viewport = viewportRef.current
    const keys = new Set()
    let gesture = null
    let frame
    let previousTime
    const observer = new ResizeObserver(([entry]) => {
      widthRef.current = Math.min(MAP_WIDTH, MAP_HEIGHT * entry.contentRect.width / entry.contentRect.height)
      pan(0)
    })
    observer.observe(viewport)
    function keyDown(event) {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(event.code)) event.preventDefault()
      if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') keys.add(event.code)
    }
    function keyUp(event) { keys.delete(event.code) }
    function clearGesture() {
      const id = gesture?.id
      gesture = null
      if (id !== undefined && viewport.hasPointerCapture(id)) viewport.releasePointerCapture(id)
    }
    function clearInput() {
      keys.clear()
      clearGesture()
      previousTime = undefined
    }
    function pointerDown(event) {
      if (!event.isPrimary || event.button !== 0 || gesture) return
      gesture = { id: event.pointerId, x: event.clientX }
      viewport.setPointerCapture(event.pointerId)
    }
    function pointerMove(event) {
      if (event.pointerId !== gesture?.id) return
      pan((gesture.x - event.clientX) * widthRef.current / viewport.clientWidth)
      gesture.x = event.clientX
    }
    function pointerEnd(event) {
      if (event.pointerId === gesture?.id) clearGesture()
    }
    function tick(time) {
      const seconds = previousTime === undefined ? 0 : Math.min((time - previousTime) / 1000, .05)
      previousTime = time
      const direction = Number(keys.has('ArrowRight')) - Number(keys.has('ArrowLeft'))
      if (direction) pan(direction * seconds * 350)
      frame = requestAnimationFrame(tick)
    }
    window.addEventListener('keydown', keyDown)
    window.addEventListener('keyup', keyUp)
    window.addEventListener('blur', clearInput)
    document.addEventListener('visibilitychange', clearInput)
    viewport.addEventListener('pointerdown', pointerDown)
    viewport.addEventListener('pointermove', pointerMove)
    viewport.addEventListener('pointerup', pointerEnd)
    viewport.addEventListener('pointercancel', pointerEnd)
    viewport.addEventListener('lostpointercapture', pointerEnd)
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      clearInput()
      window.removeEventListener('keydown', keyDown)
      window.removeEventListener('keyup', keyUp)
      window.removeEventListener('blur', clearInput)
      document.removeEventListener('visibilitychange', clearInput)
      viewport.removeEventListener('pointerdown', pointerDown)
      viewport.removeEventListener('pointermove', pointerMove)
      viewport.removeEventListener('pointerup', pointerEnd)
      viewport.removeEventListener('pointercancel', pointerEnd)
      viewport.removeEventListener('lostpointercapture', pointerEnd)
    }
  }, [])

  return (
    <section className="campus-map" ref={viewportRef} aria-label="Campus map" {...advanceHandlers}>
      <svg className="campus-map-image" viewBox={`${view.center - view.width / 2} 0 ${view.width} ${MAP_HEIGHT}`}
        role="img" aria-label={`Campus map. ${location.label}. Swipe or use left and right arrow keys to pan.`}>
        <image href={mapImage} width={MAP_WIDTH} height={MAP_HEIGHT} onError={() => {
          console.error('Campus map failed to load:', mapImage)
          setError(true)
        }} />
        <g transform={`translate(${location.x} ${location.y})`} data-location={professor}>
          <LocationArrow />
        </g>
      </svg>
      <svg className="map-pan map-pan-left" viewBox="0 0 24 24" aria-hidden="true">
        <path d="m15 5-7 7 7 7" />
      </svg>
      <svg className="map-pan map-pan-right" viewBox="0 0 24 24" aria-hidden="true">
        <path d="m9 5 7 7-7 7" />
      </svg>
      <div className="video-dialogue intro-prompt map-continue">
        <p>Tap the screen or press the spacebar to continue.</p>
      </div>
      {error && <p className="video-notice" role="alert">Unable to load the campus map. Please reload the page.</p>}
    </section>
  )
}
