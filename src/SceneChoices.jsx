import { useEffect, useRef, useState } from 'react'
import { nextChoice } from './campusMap.js'

export default function SceneChoices({ choices, disabled = [], onChoose }) {
  const [selected, setSelected] = useState(null)
  const refs = useRef([])

  useEffect(() => {
    function keyDown(event) {
      if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
        event.preventDefault()
        if (event.repeat) return
        const next = nextChoice(selected, event.code === 'ArrowUp' ? -1 : 1, choices.length, disabled)
        if (next === null) return
        setSelected(next)
        refs.current[next].focus({ preventScroll: true })
      } else if (event.code === 'Space') {
        event.preventDefault()
        if (!event.repeat && selected !== null && !disabled.includes(selected)) onChoose(selected)
      }
    }
    window.addEventListener('keydown', keyDown)
    return () => window.removeEventListener('keydown', keyDown)
  }, [selected, onChoose, choices.length, disabled])

  return choices.map((text, index) => (
    <button key={text} ref={element => { refs.current[index] = element }}
      disabled={disabled.includes(index)}
      className={`professor-choice${selected === index ? ' selected' : ''}`}
      onFocus={() => setSelected(index)} onClick={() => onChoose(index)}>{text}</button>
  ))
}
