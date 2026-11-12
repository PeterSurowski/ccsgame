const palette = {
  ink: '#111b22',
  cream: '#e7dfad',
  grass: '#80b383',
  denim: '#7ca9ca',
  gold: '#d8ab5f',
  slate: '#35424e',
}

function Person({ x = 0, y = 250, facing = -1, adult = false, happy = false, point = false, suit = false, step = 0 }) {
  return <g transform={`translate(${x} ${y}) scale(${facing === -1 ? 1 : -1} 1)`}>
    <g fill={palette.cream}>
      <path d="M-5-42h12v13H-5zM-8-39h3v7h-3z" />
      <path d={happy ? 'M-14-35h4v16h-4zM10-35h4v16h-4zM14-40h4v7h-4z'
        : point ? 'M-27-23h22v4h-22zM7-26h4v17H7z'
          : 'M-10-25h4v17h-4zM7-25h4v17H7z'} />
    </g>
    <path d={adult ? 'M-7-45H8v5H-11v-3h4z' : 'M-5-44H8v6H4v-3h-9z'} fill={suit ? palette.ink : palette.gold} />
    <path d="M-5-29H7v18H-5z" fill={suit ? palette.slate : palette.grass} />
    {suit && <path d="M0-29h3v13H0z" fill={palette.cream} />}
    <path d={step % 2 ? 'M-5-11h4v7h-6v4h-6v-3h5zM3-11h4v9h5v2H3z' : 'M-5-11h4v9h-5v2h-6v-3h5zM3-11h4v9h5v2H3z'}
      fill={palette.denim} />
    <path d="M-5-37h2v2h-2z" fill={palette.ink} />
    <path d={happy ? 'M-4-33h2v2h5v-2h2v4h-9z' : 'M-4-31h5v1h-5z'} fill={palette.ink} />
  </g>
}

function BoyBike({ x, facing, step }) {
  return <g transform={`translate(${x} 250) scale(${facing === -1 ? 1 : -1} 1)`}>
    <g stroke={palette.cream} strokeWidth="2" fill="none">
      <path d="M-27-8h4v-6h10v4h4v6h-4v4h-10v-4h-4zM9-8h4v-6h10v4h4v6h-4v4H13v-4H9z" />
      <path d="M-19-7l10-17L1-7h-20L-8-20h19L19-7M-9-24l-4-5h-7" />
    </g>
    <path d="M-2-29h13v3H-2z" fill={palette.gold} />
    <g transform={`translate(0 ${step % 2 ? -1 : 0})`}>
      <path d="M-6-53H5v12H-6zM-9-50h3v6h-3z" fill={palette.cream} />
      <path d="M-6-56H6v6H1v-3h-7z" fill={palette.gold} />
      <path d="M-4-40H7v13H-4z" fill={palette.grass} />
      <path d="M-7-38h4v11h-11v-3h7z" fill={palette.cream} />
      <path d={step % 2 ? 'M-3-27H7v8H-4v8h-4v-12H3v-2H-3z' : 'M-3-27H7v15H2v-11H-3z'} fill={palette.denim} />
      <path d="M-6-48h2v2h-2z" fill={palette.ink} />
    </g>
  </g>
}

function Office({ x, result, open, m2 = false }) {
  const answered = open || result === 'rejected' || result === 'hired'
  return <g transform={`translate(${x} 0)`}>
    <path d="M-62 250V146H62v104M-69 146v-9H69v9" fill={palette.grass} />
    <path d="M-57 150H57v100H-57z" fill={palette.ink} />
    <path d="M-49 164h25v28h-25zM25 164h25v28H25z" fill={palette.denim} />
    <path d="M-38 164v28M37 164v28M-49 178h25M25 178h25" stroke={palette.ink} strokeWidth="3" />
    <path d="M-15 250v-56h30v56" stroke={palette.cream} strokeWidth="2" fill={answered ? palette.ink : palette.gold} />
    {!answered && <path d="M7 221h3v3H7z" fill={palette.ink} />}
    {m2 && <text x="0" y="160" fill={palette.cream} fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle">M2Media</text>}
    {answered && <Person x={0} suit facing={-1} happy={m2 || result === 'hired'} point={result === 'rejected'} />}
  </g>
}

export default function PeterFlashbackArt({ state, moving }) {
  const step = moving ? Math.floor(Math.abs(state.x) / 5) : 0
  const triumph = state.mode === 'reaction' && state.meetings === 3
  return <svg className="flashback-world" viewBox="0 0 320 280" preserveAspectRatio="none"
    shapeRendering="crispEdges" role="img" aria-label={`${state.adult ? 'Adult Peter walking' : 'Boy riding a bicycle'} in a retro neighborhood`}>
    <path d="M0 0h320v280H0z" fill={palette.ink} />
    <g fill={palette.denim} opacity=".75">
      <path d="M25 46h24v4H25zM18 50h40v4H18zM234 76h28v4h-28zM225 80h48v4h-48zM142 24h18v4h-18z" />
    </g>
    <g transform={`translate(${160 - state.x} 0)`}>
      <g transform="translate(114 0)">
        <path d="M-4 216v-19h42v6h9v28H-4z" fill={palette.gold} />
        <path d="M0 202h7v10H0zM10 202h7v10h-7zM20 202h7v10h-7zM32 207h10v10H32z" fill={palette.ink} />
        <path d="M-2 221h31v3H-2zM3 228h9v9H3zM31 228h9v9h-9z" fill={palette.cream} />
      </g>
      <g transform="translate(-235 0)">
        <path d="M-52 250v-75H45v75z" fill={palette.grass} />
        <path d="M-63 177v-7h12v-8h12v-8h12v-8h20v8H5v8h13v8h30v7z" fill={palette.cream} />
        <path d="M-18 205h23v45h-23zM-43 193h17v18h-17zM17 193h18v18H17z" fill={palette.ink} />
        <path d="M-67 219h27v16h-27zM-55 235h3v15h-3z" fill={palette.gold} />
        <text x="-54" y="226" fill={palette.ink} fontFamily="monospace" fontSize="5" textAnchor="middle">YARD</text>
        <text x="-54" y="232" fill={palette.ink} fontFamily="monospace" fontSize="5" textAnchor="middle">SALE</text>
        <path d="M48 236h58v4H48zM51 240h3v10h-3zM100 240h3v10h-3z" fill={palette.gold} />
        <path d="M62 211h21v18H62zM59 230h29v5H59z" fill={palette.cream} />
        <path d="M65 214h15v11H65z" fill={palette.ink} />
        <path d="M68 217h5v2h-5zM68 222h2v1h-2z" fill={palette.grass} />
      </g>
      <g transform="translate(-455 0)">
        <Person x={0} facing={1} step={step} />
        <path d="M7 223h14v19H7z" fill={palette.cream} />
        <path d="M10 219h8v8h-8z" fill={palette.gold} />
        <path d="M9 229h10v9H9z" fill={palette.denim} />
      </g>
      {state.offices.filter(office => Math.abs(office.x - state.x) < 240).map(office => (
        <Office key={office.x} {...office} open={state.offices[state.door] === office && state.mode === 'pitch'} />
      ))}
      {state.m2X !== null && <Office x={state.m2X} result="closed" m2 open={state.narration === 'm2'} />}
    </g>
    <path d="M0 250h320" stroke={palette.cream} strokeWidth="2" />
    <path d="M0 263h23m20 7h15m45-7h28m55 8h19m57-8h22" stroke={palette.grass} strokeWidth="1" />
    {state.adult
      ? <Person x={160} facing={state.facing} adult happy={triumph} step={step} />
      : <BoyBike x={160} facing={state.facing} step={step} />}
  </svg>
}
