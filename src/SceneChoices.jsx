import { useEffect, useRef, useState } from 'react'
import { nextChoice } from './campusMap.js'

export default function SceneChoices({ choices, onChoose }) {
  const [selected, setSelected] = useState(null)
  const refs = useRef([])

  useEffect(() => {
    function keyDown(event) {
      if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
        event.preventDefault()
        if (event.repeat) return
        const next = nextChoice(selected, event.code === 'ArrowUp' ? -1 : 1)
        setSelected(next)
        refs.current[next].focus({ preventScroll: true })
      } else if (event.code === 'Space') {
        event.preventDefault()
        if (!event.repeat && selected !== null) onChoose(selected)
      }
    }
    window.addEventListener('keydown', keyDown)
    return () => window.removeEventListener('keydown', keyDown)
  }, [selected, onChoose])

  return choices.map((text, index) => (
    <button key={text} ref={element => { refs.current[index] = element }}
      className={`professor-choice${selected === index ? ' selected' : ''}`}
      onFocus={() => setSelected(index)} onClick={() => onChoose(index)}>{text}</button>
  ))
}
