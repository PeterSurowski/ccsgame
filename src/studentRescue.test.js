import test from 'node:test'
import assert from 'node:assert/strict'
import Matter from 'matter-js'
import { addRescueStroke, createRescue, disposeRescue, extendStroke, rescuePlatforms,
  rescueStrokePoints, strokeLimit, updateRescue } from './studentRescue.js'

function run(game, seconds) {
  for (let i = 0; i < seconds * 60; i++) updateRescue(game, 1 / 60)
}

function solution(game) {
  for (let i = 0; i < rescuePlatforms.length - 1; i++) {
    const a = rescuePlatforms[i].at(-1), b = rescuePlatforms[i + 1][0]
    addRescueStroke(game, [{ x: a.x - 12, y: a.y - 7 }, { x: b.x + 12, y: b.y - 7 }])
  }
  addRescueStroke(game, [{ x: 775, y: 55 }, { x: 855, y: 45 }, { x: 935, y: 55 }])
}

test('drawing caps each stroke by arc length and does not limit stroke count', () => {
  assert.equal(strokeLimit, 280 * .6)
  const points = extendStroke([{ x: 0, y: 0 }], { x: 1000, y: 0 })
  assert.equal(points.at(-1).x, strokeLimit)
  assert.deepEqual(extendStroke(points, { x: 1000, y: 1000 }), points)
  const game = createRescue()
  for (let i = 0; i < 8; i++) assert.ok(addRescueStroke(game, [{ x: 10, y: 10 }, { x: 30, y: 10 }]))
  assert.equal(game.strokes.length, 8)
  assert.equal(addRescueStroke(game, [{ x: 5, y: 5 }]), false)
  assert.throws(() => addRescueStroke(game, [{ x: NaN, y: 0 }, { x: 1, y: 1 }]), /Invalid/)
  disposeRescue(game)
})

test('released lines fall, collide with terrain, and are not static', () => {
  const game = createRescue()
  addRescueStroke(game, [{ x: 10, y: 200 }, { x: 100, y: 200 }])
  const before = rescueStrokePoints(game.strokes[0])[0].y
  run(game, 2)
  const after = rescueStrokePoints(game.strokes[0])[0].y
  assert.ok(after > before + 50)
  assert.ok(after < 355)
  assert.equal(game.strokes[0].body.isStatic, false)
  run(game, 2)
  const settled = { ...game.strokes[0].body.position }
  const angle = game.strokes[0].body.angle
  run(game, 1)
  assert.ok(Math.hypot(game.strokes[0].body.position.x - settled.x,
    game.strokes[0].body.position.y - settled.y) < .5)
  assert.ok(Math.abs(game.strokes[0].body.angle - angle) < .01)
  assert.equal(game.strokes[0].body.isSleeping, true)
  disposeRescue(game)
})

test('dense mouse strokes simplify into heavy beams and release clear of overlapping geometry', () => {
  const game = createRescue()
  const points = Array.from({ length: 41 }, (_, i) => ({ x: 10 + i * 2, y: 350 }))
  assert.ok(addRescueStroke(game, points))
  const beam = game.strokes[0]
  assert.equal(beam.points.length, 2)
  assert.ok(beam.body.mass >= 15)
  assert.ok(beam.body.inertia > beam.body.mass * 80 ** 2 / 12 * 2)
  assert.ok(beam.body.position.y < 350)
  assert.ok(!Matter.Query.collides(beam.body, game.terrain).some(c => c.depth > .05))
  assert.ok(addRescueStroke(game, points))
  const stacked = game.strokes[1]
  assert.ok(!Matter.Query.collides(stacked.body, [beam.body]).some(c => c.depth > .05))
  for (let i = 0; i < 180; i++) {
    updateRescue(game, 1 / 60)
    for (const stroke of game.strokes) {
      assert.ok(Math.abs(stroke.body.velocity.x) < 1)
      assert.ok(stroke.body.velocity.y > -1)
    }
  }
  assert.equal(addRescueStroke(game, [{ x: 20, y: 500 }, { x: 80, y: 500 }]), false)
  disposeRescue(game)
})

test('without drawings all ten students fall and the game loses', () => {
  const game = createRescue()
  run(game, 60)
  assert.equal(game.status, 'lost')
  assert.equal(game.dead, 10)
  assert.equal(game.thirdPlatformReached, false)
  assert.equal(game.kernClockReached, false)
  assert.ok(game.students.every(student => student.state === 'dead'))
  disposeRescue(game)
})

test('five bridges and the landmark roof allow students to reach the exit', () => {
  const game = createRescue()
  solution(game)
  run(game, 100)
  assert.equal(game.strokes.length, 6)
  assert.equal(game.status, 'won', JSON.stringify(game.students.map(s => ({
    state: s.state, x: s.body.position.x, y: s.body.position.y,
  }))))
  assert.equal(game.saved, 10)
  assert.equal(game.thirdPlatformReached, true)
  assert.equal(game.kernClockReached, true)
  disposeRescue(game)
})

test('Kern Clock narration triggers only on reaching its ground-level position and resets on retry', () => {
  const game = createRescue()
  run(game, 3.1)
  const student = game.students[0]
  Matter.Body.setPosition(student.body, { x: 778, y: rescuePlatforms[5][0].y - 5 })
  updateRescue(game, 1 / 60)
  assert.equal(game.kernClockReached, false)
  Matter.Body.setPosition(student.body, { x: 780, y: 200 })
  updateRescue(game, 1 / 60)
  assert.equal(game.kernClockReached, false)
  Matter.Body.setPosition(student.body, { x: 780, y: rescuePlatforms[5][0].y - 5 })
  updateRescue(game, 1 / 60)
  assert.equal(game.kernClockReached, true)
  Matter.Body.setPosition(student.body, { x: 700, y: rescuePlatforms[5][0].y - 5 })
  updateRescue(game, 1 / 60)
  assert.equal(game.kernClockReached, true)
  const retry = createRescue()
  assert.equal(retry.kernClockReached, false)
  disposeRescue(retry)
  disposeRescue(game)
})

test('a roof intercepts falling bricks above the walking students', () => {
  const game = createRescue()
  addRescueStroke(game, [{ x: 775, y: 55 }, { x: 855, y: 45 }, { x: 935, y: 55 }])
  run(game, 2)
  const body = Matter.Bodies.rectangle(820, 8, 11, 7, { label: 'brick',
    collisionFilter: { category: 8, mask: 1 | 2 | 4 } })
  game.bricks.push({ body, hit: false })
  Matter.Composite.add(game.engine.world, body)
  let shattered = false
  for (let i = 0; i < 120; i++) {
    updateRescue(game, 1 / 60)
    if (game.fragments.length) shattered = true
  }
  assert.ok(shattered)
  assert.ok(!game.bricks.some(brick => brick.body === body))
  disposeRescue(game)
})

test('a falling brick kills a student and shatters on impact', () => {
  const game = createRescue()
  run(game, 3.1)
  const student = game.students[0]
  Matter.Body.setPosition(student.body, { x: 820, y: 315 })
  const body = Matter.Bodies.rectangle(820, 285, 11, 7, { label: 'brick',
    collisionFilter: { category: 8, mask: 1 | 2 | 4 } })
  game.bricks.push({ body, hit: false })
  Matter.Composite.add(game.engine.world, body)
  run(game, .4)
  assert.equal(student.state, 'dead')
  assert.ok(game.fragments.length > 0)
  disposeRescue(game)
})

test('a brick hitting the visible head or torso kills the student before reaching their feet', () => {
  for (const offset of [-28, -14]) {
    const game = createRescue()
    run(game, 3.1)
    const student = game.students[0]
    Matter.Body.setPosition(student.body, { x: 820, y: 320.5 })
    const body = Matter.Bodies.rectangle(820.6, 320.5 + offset, 11, 7, {
      label: 'brick', collisionFilter: { category: 8, mask: 1 | 2 | 4 },
    })
    game.bricks.push({ body, hit: false })
    Matter.Composite.add(game.engine.world, body)
    updateRescue(game, 1 / 60)
    assert.equal(student.state, 'dead')
    assert.equal(game.dead, 1)
    assert.ok(game.fragments.length > 0)
    assert.equal(student.hitbox.collisionFilter.mask, 0)
    run(game, .2)
    assert.equal(game.dead, 1)
    disposeRescue(game)
  }
})
