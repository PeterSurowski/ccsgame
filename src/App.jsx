import { useState } from 'react'
import Worldview from './Worldview.jsx'
import './App.css'

const initialScores = [
  { label: 'Budget', value: 100, color: '#75d7c3' },
  { label: 'Ave. GPA', value: 85, color: '#a3b9ef' },
  { label: 'Job Placement', value: 20, color: '#f2ba73' },
  { label: 'Engagement', value: 0, color: '#f08080' },
]

const scenes = [
  {
    title: 'The numbers don\'t lie.',
    speaker: 'Susan Laporte',
    role: 'Department Chair',
    text: 'Student engagement: zero. Job placement: twenty out of a hundred. Something has to change.',
    caption: 'A quiet afternoon. An alarming report.',
  },
  {
    title: 'So much for a quiet afternoon.',
    speaker: 'Chad Reichert',
    role: 'Professor',
    text: 'Susan, come quick, something is wrong with the students.',
    caption: 'The office door flies open.',
  },
]

function OfficeIllustration({ arrival }) {
  return (
    <svg className="office-art" viewBox="0 0 1200 600" role="img"
      aria-label={arrival
        ? 'Original placeholder illustration: Chad bursts through the office door as Susan looks up from her report.'
        : 'Original placeholder illustration: Susan looks with dismay at a report showing engagement at 0/100 and job placement at 20/100.'}>
      <defs>
        <linearGradient id="wall" x2="1" y2="1">
          <stop stopColor="#467e88" /><stop offset="1" stopColor="#244858" />
        </linearGradient>
        <linearGradient id="light" x2="1" y2="1">
          <stop stopColor="#f6d694" stopOpacity=".4" /><stop offset="1" stopColor="#f6d694" stopOpacity="0" />
        </linearGradient>
        <pattern id="dots" width="9" height="9" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#102330" opacity=".17" />
        </pattern>
      </defs>
      <path fill="url(#wall)" d="M0 0h1200v600H0z" />
      <path fill="#213745" d="M0 465h1200v135H0z" />
      <g stroke="#172b38" strokeWidth="7" strokeLinejoin="round">
        <path fill="#f0c583" d="M55 38h292v355H55z" />
        <path fill="#a5c8c4" d="M69 52h264v327H69z" />
        <path fill="#638d99" stroke="none" d="M70 292l72-101 51 60 64-130 76 171v87H70z" />
        <path fill="#d8b988" stroke="none" d="M70 323h263v56H70z" />
        <path d="M200 52v327M69 209h264" fill="none" />
        <path fill="url(#light)" stroke="none" d="M55 393l292-14 410 221H90z" />
        <path fill="#28434b" d="M399 82h165v136H399z" />
        <path fill="#ead7af" d="M413 96h137v108H413z" />
        <path stroke="#927e5b" strokeWidth="3" d="M440 139h82M440 153h82M455 177h52" />
        <path fill="#1b2e3d" d="M858 46h283v448H858z" />
        <path fill={arrival ? '#e2b581' : '#9d7160'} d={arrival ? 'M862 50l178 75v394l-178-29z' : 'M862 50h275v440H862z'} />
        <path fill="#e6ca98" d={arrival ? 'M995 310h13v25h-13z' : 'M1096 282h13v25h-13z'} />
        <path fill="#163543" d="M417 308q-38-79 34-104h125q65 15 44 104v216H417z" />
        <path fill="#d09a7b" d="M474 260h72v79h-72z" />
        <path fill="#e7b498" d="M454 145q-14 109 45 126 57-1 70-100l-28-54z" />
        <path fill="#25303e" d="M448 202q-34-92 29-106 82-27 100 63l-35-6-27-28-32 28-13 54z" />
        <path fill="#c7dcd4" d="M429 312l46-31 38 38 35-38 39 31 40 165H385z" />
        <path fill="#30505e" d="M429 312l46-31 38 38-21 156H385zM548 281l39 31 40 165H532l-19-156z" />
        <path fill="#e7b498" d="M404 387l61-36 24 29-60 52zM578 365l43 33-34 42-43-46z" />
        <path strokeWidth="4" fill="none" d={arrival ? 'M480 182l15-4M531 176l16 7M505 227q14-13 26 0' : 'M480 177l15 6M531 181l16-7M505 233q14-15 26-4'} />
        <path strokeWidth="4" fill="none" d="M477 194h25v17h-25zM527 194h25v17h-25zM502 199h25M512 208l-5 13h10" />
        {arrival && (
          <g>
            <path fill="#e2ac85" d="M1017 195h44v54h-44z" />
            <path fill="#e9ba98" d="M995 103q58-30 82 19l-3 60q-12 43-39 32-42-12-40-58z" />
            <path fill="#784c39" d="M994 152l-7-39 28-30 56 15 17 32-41-10-27 20z" />
            <path fill="#d69063" d="M983 246l36-20 23 20 21-21 37 23 41 129-40 26-9-89 11 174h-144l17-168-32 64-51-27z" />
            <path fill="#e9ba98" d="M930 332l-62-55-26 8 8 24 63 58zM1127 365l33 40-19 22-42-42z" />
            <path fill="#253343" d="M966 488h137l21 112h-61l-26-73-14 73h-65z" />
            <path strokeWidth="4" fill="none" d="M1010 153l14-6M1044 148l15 7" />
            <ellipse cx="1035" cy="182" rx="10" ry="14" fill="#4e3032" strokeWidth="3" />
            <path stroke="#f5d396" strokeWidth="5" d="M792 126l42 19M804 196h34M1129 83l-29 31" />
          </g>
        )}
        <path fill="#b88564" d="M139 461h658l83 139H78z" />
        <path fill="#dfb585" d="M139 449h658l31 48H119z" />
        <path fill="#183d49" d="M195 407h47v42h-47z" />
        <path fill="none" d="M242 414h14q18 18-14 25" />
        <path fill="#eddaad" d="M658 388h49l8 61h-66z" />
        <path fill="#548875" d="M678 389q-43-44-24-66 27 11 24 66zM683 388q-6-59 28-61 16 27-28 61z" />
      </g>
      <g transform="translate(440 332) rotate(-9)" stroke="#172b38" strokeWidth="4">
        <path fill="#f6ebd3" d="M0 0h178v137H0z" />
        <path stroke="#baad95" strokeWidth="2" d="M15 35h145M15 113h95" />
        <g stroke="none" fontFamily="system-ui, sans-serif" fill="#283747">
          <text x="15" y="24" fontSize="12" fontWeight="800">STUDENT REPORT</text>
          <text x="15" y="56" fontSize="11">ENGAGEMENT</text>
          <text x="15" y="79" fontSize="22" fontWeight="800" fill="#a94441">0/100</text>
          <text x="15" y="101" fontSize="11">JOB PLACEMENT: 20/100</text>
        </g>
      </g>
      <path fill="url(#dots)" d="M0 0h1200v600H0z" />
    </svg>
  )
}

function App() {
  const [sceneIndex, setSceneIndex] = useState(0)
  const [mode, setMode] = useState('story')
  const scene = scenes[sceneIndex]

  return (
    <div className="game-shell">
      <header className="score-header">
        <div className="wordmark">CCS<span>THE CAMPUS CHRONICLES</span></div>
        <section className="scores" aria-label="Department scores">
          {initialScores.map(({ label, value, color }) => (
            <div className="score" key={label} style={{ '--score-color': color }}>
              <span className="score-label">{label}</span>
              <strong>{value}<span>/100</span></strong>
              <div role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100}
                aria-valuenow={value} className="meter">
                <span style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </section>
        <span className="mode-tag">{mode === 'worldview' ? 'WORLDVIEW MODE' : 'STORY MODE'}</span>
      </header>

      <main>
        <div className="chapter-heading">
          <div><span className="eyebrow">CHAPTER 01 / THE WAKE-UP CALL</span><h1>{mode === 'worldview' ? 'Follow Chad.' : scene.title}</h1></div>
          <span className="location">{mode === 'worldview' ? 'DESIGN DEPARTMENT' : "SUSAN'S OFFICE"}</span>
        </div>
        {mode === 'worldview' ? <Worldview /> : <section className="story-panel" aria-label="Opening scene">
          <div className="illustration">
            <OfficeIllustration arrival={sceneIndex === 1} />
            <span className="scene-caption">{scene.caption}</span>
            <span className="art-label">PLACEHOLDER ART</span>
          </div>
          <div className="dialogue" aria-live="polite" aria-atomic="true">
            <div className="speaker"><span>{scene.speaker}</span><small>{scene.role}</small></div>
            <p>{scene.text}</p>
          </div>
          <div className="scene-controls">
            <span className="page-indicator">SCENE 01 <span>/</span> PANEL {sceneIndex + 1} OF 2</span>
            <div className="buttons">
              {sceneIndex === 1 && <button className="secondary" onClick={() => setSceneIndex(0)}>Back</button>}
              <button className="primary" onClick={() => sceneIndex === 0 ? setSceneIndex(1) : setMode('worldview')}>
                {sceneIndex === 0 ? 'Continue' : 'Follow Chad'} <span aria-hidden="true">&rarr;</span>
              </button>
            </div>
          </div>
        </section>}
        <footer><span>A campus in crisis. A chair with a choice.</span><span>WORLDVIEW PROTOTYPE / 02</span></footer>
      </main>
    </div>
  )
}

export default App
