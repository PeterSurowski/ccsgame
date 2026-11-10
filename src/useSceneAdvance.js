import { useEffect, useRef } from 'react'

export default function useSceneAdvance(enabled, onAdvance) {
  const gestureRef = useRef(null)

  useEffect(() => {
    function keyDown(event) {
      if (event.code !== 'Space') return
      event.preventDefault()
      if (enabled && !event.repeat) onAdvance()
    }
    window.addEventListener('keydown', keyDown)
    return () => window.removeEventListener('keydown', keyDown)
  }, [enabled, onAdvance])

  return {
    onPointerDown(event) {
      if (!event.isPrimary || event.button !== 0 || event.target.closest('button')) return
      gestureRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY,
        time: performance.now(), ready: enabled, dragged: false }
    },
    onPointerMove(event) {
      const gesture = gestureRef.current
      if (gesture?.id === event.pointerId) {
        gesture.dragged ||= Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 8
      }
    },
    onPointerUp(event) {
      const gesture = gestureRef.current
      gestureRef.current = null
      if (gesture?.id === event.pointerId && gesture.ready && enabled
        && !gesture.dragged && performance.now() - gesture.time < 500
        && Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) <= 8) onAdvance()
    },
    onPointerCancel() { gestureRef.current = null },
  }
}
