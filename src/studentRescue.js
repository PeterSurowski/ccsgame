import Matter from 'matter-js'

const { Bodies, Body, Composite, Engine, Events, Query, Sleeping } = Matter
export const rescueWidth = 1000
export const rescueHeight = 558
export const strokeLimit = 168
export const studentCount = 10
const terrainCategory = 1, inkCategory = 2, studentCategory = 4, brickCategory = 8
const fixedStep = 1000 / 60
const point = (x, y) => ({ x: x * 1000 / 960, y: 124 + y * 1.3 })
export const rescuePlatforms = [
  [[0, 174], [192, 174], [220, 144]],
  [[251, 144], [282, 172], [344, 172]],
  [[384, 162], [434, 117]],
  [[474, 162], [510, 115]],
  [[554, 145], [639, 175]],
  [[639, 155], [960, 155]],
].map(path => path.map(([x, y]) => point(x, y)))

export function extendStroke(points, next, limit = strokeLimit) {
  if (!points.length) return [next]
  const last = points.at(-1)
  const distance = Math.hypot(next.x - last.x, next.y - last.y)
  if (distance < 2) return points
  const length = points.slice(1).reduce((sum, p, i) =>
    sum + Math.hypot(p.x - points[i].x, p.y - points[i].y), 0)
  const remaining = limit - length
  if (remaining <= .01) return points
  const ratio = Math.min(1, remaining / distance)
  return [...points, { x: last.x + (next.x - last.x) * ratio, y: last.y + (next.y - last.y) * ratio }]
}

export function createRescue() {
  const engine = Engine.create({ gravity: { x: 0, y: 1.2 }, enableSleeping: true,
    positionIterations: 12, velocityIterations: 10 })
  const game = { engine, time: 0, accumulator: 0, students: [], strokes: [], bricks: [], fragments: [],
    spawned: 0, saved: 0, dead: 0, nextSpawn: 3, nextBrick: 0, brickNumber: 0,
    status: 'running', terrain: [], obstacles: [], thirdPlatformReached: false, kernClockReached: false }
  for (const path of rescuePlatforms) {
    for (let i = 1; i < path.length; i++) {
      const a = path[i - 1], b = path[i]
      const vertices = [a, b, { x: b.x, y: 650 }, { x: a.x, y: 650 }]
      const center = Matter.Vertices.centre(vertices)
      const body = Bodies.fromVertices(center.x, center.y, [vertices], {
        isStatic: true, label: 'ground', friction: .8,
        collisionFilter: { category: terrainCategory },
      })
      game.terrain.push(body)
    }
  }
  // Landmark tops support a drawn roof, but never block the students below.
  for (const [x, y, width] of [[780, 78, 42], [930, 65, 50]]) {
    game.obstacles.push(Bodies.rectangle(x, y, width, 10, { isStatic: true, label: 'landmark',
      collisionFilter: { category: terrainCategory, mask: inkCategory | brickCategory } }))
  }
  Composite.add(engine.world, [...game.terrain, ...game.obstacles])
  Events.on(engine, 'collisionStart', event => {
    for (const pair of event.pairs) {
      const { bodyA, bodyB } = pair
      const brick = game.bricks.find(item => item.body === bodyA || item.body === bodyB)
      if (!brick || brick.hit) continue
      const other = brick.body === bodyA ? bodyB : bodyA
      const student = game.students.find(item =>
        (item.body === other || item.hitbox === other) && item.state === 'walking')
      if (student) killStudent(game, student)
      // A shattered brick must not deliver a full rigid-body impact afterward.
      pair.isSensor = true
      brick.hit = true
      for (let i = 0; i < 5; i++) game.fragments.push({ x: brick.body.position.x, y: brick.body.position.y,
        vx: (i - 2) * 28, vy: -35 - i * 8, life: .65 })
    }
  })
  return game
}

function killStudent(game, student) {
  if (student.state !== 'walking') return
  student.state = 'dead'
  game.dead++
  Body.setVelocity(student.body, { x: 0, y: 0 })
  Body.setStatic(student.body, true)
  student.body.collisionFilter.mask = 0
  student.hitbox.collisionFilter.mask = 0
}

function simplifyStroke(points) {
  if (points.length <= 2) return points
  const first = points[0], last = points.at(-1)
  const dx = last.x - first.x, dy = last.y - first.y
  const lengthSquared = dx * dx + dy * dy
  let farthest = 0, split = 0
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i]
    const t = lengthSquared ? Math.max(0, Math.min(1,
      ((p.x - first.x) * dx + (p.y - first.y) * dy) / lengthSquared)) : 0
    const distance = Math.hypot(p.x - first.x - t * dx, p.y - first.y - t * dy)
    if (distance > farthest) { farthest = distance; split = i }
  }
  if (farthest <= 1.5) return [first, last]
  return [...simplifyStroke(points.slice(0, split + 1)).slice(0, -1),
    ...simplifyStroke(points.slice(split))]
}

export function addRescueStroke(game, points) {
  if (game.status !== 'running' || points.length < 2) return false
  let limited = []
  for (const p of points) {
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) throw new Error('Invalid rescue drawing point')
    limited = extendStroke(limited, {
      x: Math.max(0, Math.min(rescueWidth, p.x)), y: Math.max(0, Math.min(rescueHeight, p.y)),
    })
  }
  if (limited.length < 2) return false
  limited = simplifyStroke(limited)
  const parts = []
  for (let i = 1; i < limited.length; i++) {
    const a = limited[i - 1], b = limited[i]
    parts.push(Bodies.rectangle((a.x + b.x) / 2, (a.y + b.y) / 2,
      Math.hypot(b.x - a.x, b.y - a.y), 5, {
        angle: Math.atan2(b.y - a.y, b.x - a.x), label: 'ink',
        friction: 1, restitution: 0, density: .002,
        collisionFilter: { category: inkCategory },
      }))
  }
  const body = Body.create({ parts, label: 'ink', friction: 1, frictionStatic: 3, frictionAir: .08,
    restitution: 0, sleepThreshold: 45, collisionFilter: { category: inkCategory } })
  const origin = { ...body.position }
  Body.setDensity(body, .04)
  Body.setInertia(body, body.inertia * 3)
  const obstacles = [...game.terrain, ...game.obstacles, ...game.strokes.map(stroke => stroke.body)]
  let clear = false
  // Lift intersecting strokes before release rather than letting the solver eject them.
  for (let lift = 0; lift <= 60; lift++) {
    Body.setPosition(body, { x: origin.x, y: origin.y - lift })
    if (!Query.collides(body, obstacles).some(collision => collision.depth > .05)) {
      clear = true
      break
    }
  }
  if (!clear) return false
  game.strokes.push({ body, settledFrames: 0,
    points: limited.map(p => ({ x: p.x - origin.x, y: p.y - origin.y })) })
  Composite.add(game.engine.world, body)
  return true
}

function spawnStudent(game) {
  const body = Bodies.circle(35, 340, 5, { label: 'student', inertia: Infinity,
    friction: 0, restitution: 0, density: .0001,
    collisionFilter: { category: studentCategory, mask: brickCategory } })
  const hitbox = Bodies.rectangle(35, 326, 22, 38, {
    label: 'student-hitbox', isStatic: true, isSensor: true,
    collisionFilter: { category: studentCategory, mask: brickCategory },
  })
  Composite.add(game.engine.world, [body, hitbox])
  game.students.push({ body, hitbox, variant: game.spawned % 5, state: 'walking', vy: 0 })
  game.spawned++
}

function surfaceAt(game, x, nearY) {
  let surface = Infinity
  for (const path of rescuePlatforms) {
    for (let i = 1; i < path.length; i++) {
      const a = path[i - 1], b = path[i]
      if (x < a.x || x > b.x) continue
      const y = a.y + (b.y - a.y) * (x - a.x) / (b.x - a.x)
      if (y >= nearY - 5) surface = Math.min(surface, y)
    }
  }
  for (const stroke of game.strokes) {
    for (const part of stroke.body.parts.slice(1)) {
      const vertices = part.vertices
      for (let i = 0; i < vertices.length; i++) {
        const a = vertices[i], b = vertices[(i + 1) % vertices.length]
        if (x < Math.min(a.x, b.x) || x > Math.max(a.x, b.x) || Math.abs(b.x - a.x) < .001) continue
        const y = a.y + (b.y - a.y) * (x - a.x) / (b.x - a.x)
        if (y >= nearY - 5) surface = Math.min(surface, y)
      }
    }
  }
  return surface
}

export function updateRescue(game, seconds) {
  if (game.status !== 'running') return
  game.accumulator += Math.min(Math.max(seconds, 0), .1) * 1000
  while (game.accumulator >= fixedStep && game.status === 'running') {
    game.accumulator -= fixedStep
    game.time += 1 / 60
    if (game.spawned < studentCount && game.time >= game.nextSpawn) {
      spawnStudent(game)
      game.nextSpawn += 1.5
    }
    const approaching = game.students.some(s => s.state === 'walking' && s.body.position.x > 690)
    if (approaching && game.time >= game.nextBrick) {
      const x = [810, 850, 895][game.brickNumber++ % 3]
      const body = Bodies.rectangle(x, 8, 11, 7, { label: 'brick', density: .001,
        collisionFilter: { category: brickCategory, mask: terrainCategory | inkCategory | studentCategory } })
      Composite.add(game.engine.world, body)
      game.bricks.push({ body, hit: false })
      game.nextBrick = game.time + .55
    }
    for (const student of game.students) {
      if (student.state !== 'walking') continue
      const p = student.body.position
      if (p.y > 485) {
        // Keep fallen poses visible at the bottom of the chasm.
        Body.setPosition(student.body, { x: p.x, y: 490 })
        killStudent(game, student)
      } else if (p.x > 978) {
        student.state = 'saved'
        game.saved++
        Composite.remove(game.engine.world, [student.body, student.hitbox])
      } else {
        const x = p.x + .6
        const feet = p.y + 5
        const surface = surfaceAt(game, x, feet)
        student.vy += .33
        const landing = Number.isFinite(surface) && feet + student.vy >= surface
        if (landing) {
          Body.setPosition(student.body, { x, y: surface - 5 })
          student.vy = 0
          if (x >= 780 && Math.abs(surface - rescuePlatforms[5][0].y) < 10) {
            game.kernClockReached = true
          }
          const third = rescuePlatforms[2]
          if (x >= third[0].x && x <= third.at(-1).x) {
            const platformY = third[0].y + (third.at(-1).y - third[0].y)
              * (x - third[0].x) / (third.at(-1).x - third[0].x)
            if (Math.abs(surface - platformY) < 10) game.thirdPlatformReached = true
          }
          for (const stroke of game.strokes) {
            if (!stroke.body.isSleeping && Query.point([stroke.body], { x, y: surface + 1 }).length) {
              Body.applyForce(stroke.body, { x, y: surface }, { x: .00000004, y: .00000012 })
            }
          }
        } else Body.setPosition(student.body, { x, y: p.y + student.vy })
        Body.setVelocity(student.body, { x: 0, y: 0 })
      }
      if (student.state === 'walking') {
        Body.setPosition(student.hitbox, { x: student.body.position.x, y: student.body.position.y - 14 })
      }
    }
    Engine.update(game.engine, fixedStep)
    for (const stroke of game.strokes) {
      const { body } = stroke
      if (body.isSleeping) continue
      const supported = Query.collides(body, [...game.terrain, ...game.obstacles,
        ...game.strokes.filter(other => other !== stroke && other.body.isSleeping).map(other => other.body)])
        .length > 0
      if (supported && body.speed < .05 && Math.abs(body.angularVelocity) < .002) {
        Body.setVelocity(body, { x: body.velocity.x * .65, y: body.velocity.y * .65 })
        Body.setAngularVelocity(body, body.angularVelocity * .5)
      }
      stroke.settledFrames = supported && body.speed < .05 && Math.abs(body.angularVelocity) < .002
        ? stroke.settledFrames + 1 : 0
      if (stroke.settledFrames >= 30) Sleeping.set(body, true)
    }
    for (const brick of game.bricks) {
      if (brick.hit || brick.body.position.y > rescueHeight) Composite.remove(game.engine.world, brick.body)
    }
    game.bricks = game.bricks.filter(b => !b.hit && b.body.position.y <= rescueHeight)
    for (const fragment of game.fragments) {
      fragment.x += fragment.vx / 60
      fragment.y += fragment.vy / 60
      fragment.vy += 4
      fragment.life -= 1 / 60
    }
    game.fragments = game.fragments.filter(f => f.life > 0)
    if (game.spawned === studentCount && game.dead + game.saved === studentCount) {
      game.status = game.saved ? 'won' : 'lost'
    }
  }
}

export function disposeRescue(game) {
  Events.off(game.engine)
  Composite.clear(game.engine.world, false)
  Engine.clear(game.engine)
}

export function rescueStrokePoints(stroke) {
  const { position, angle } = stroke.body
  return stroke.points.map(p => ({
    x: position.x + p.x * Math.cos(angle) - p.y * Math.sin(angle),
    y: position.y + p.x * Math.sin(angle) + p.y * Math.cos(angle),
  }))
}
