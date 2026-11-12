import test from 'node:test'
import assert from 'node:assert/strict'
import { chooseChase, createChase, finishChaseFade, stepChase, tapChase } from './zombieChase.js'
import { finishInterviewGame, interviewFinished } from './interviewEnding.js'
import { completeInterviewChoice } from './mazeGame.js'

function advance(state, seconds, tapping = false) {
  for (let frame = 0; frame < Math.round(seconds * 60); frame += 1) {
    if (tapping && frame % 6 === 0) state = tapChase(state)
    state = stepChase(state, 1 / 60)
  }
  return state
}

function ready() {
  let state = advance(createChase(), 2.5)
  assert.equal(state.phase, 'strange')
  state = advance(tapChase(state), 2)
  assert.equal(state.phase, 'ready')
  return state
}

function plea() {
  let state = ready()
  for (let frame = 0; frame < 60 * 15 && state.phase !== 'plea'; frame += 1) {
    if (frame % 6 === 0) state = tapChase(state)
    state = stepChase(state, 1 / 60)
  }
  assert.equal(state.phase, 'plea')
  return state
}

test('all six completion orders unlock hiring only after three distinct wins', () => {
  for (const order of [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]]) {
    let completed = []
    assert.equal(interviewFinished(completed), false)
    for (let index = 0; index < order.length; index += 1) {
      completed = completeInterviewChoice(completed, order[index])
      completed = completeInterviewChoice(completed, order[index])
      assert.equal(interviewFinished(completed), index === 2)
    }
  }
  assert.equal(interviewFinished([0, 0, 1]), false)
})

test('the third successful game always returns directly to the hiring interview in all six orders', () => {
  for (const order of [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]]) {
    let completed = []
    for (const [index, choice] of order.entries()) {
      const result = finishInterviewGame(completed, choice)
      completed = result.completed
      assert.equal(result.page, choice === 0 && index < 2 ? 'maze-reflection' : 'interview')
      assert.equal(interviewFinished(completed), index === 2)
    }
  }
})

test('entrance moves diagonally, waits for dialogue input, then reveals the horde', () => {
  const start = createChase()
  const middle = advance(start, 1)
  assert.ok(middle.susan > start.susan && middle.y > start.y)
  const strange = advance(middle, 4)
  assert.equal(strange.phase, 'strange')
  assert.deepEqual(advance(strange, 20), strange)
  const state = ready()
  assert.equal(state.horde, 90)
  assert.equal(state.taps, 0)
  const animated = advance(state, 1)
  assert.ok(animated.time > state.time)
  assert.equal(animated.horde, state.horde)
})

test('faster tapping moves Susan farther and makes the horde leave the viewport before Peter trips', () => {
  const state = tapChase(ready())
  const slow = advance(state, .8)
  const fast = advance(state, .8, true)
  assert.ok(fast.susan > slow.susan + 60)
  let escaping = ready()
  for (let frame = 0; frame < 600 && escaping.phase !== 'trip'; frame += 1) {
    if (frame % 6 === 0) escaping = tapChase(escaping)
    escaping = stepChase(escaping, 1 / 60)
  }
  assert.equal(escaping.phase, 'trip')
  assert.ok(escaping.horde - escaping.camera < -20)
  assert.equal(escaping.fallen, true)
  assert.equal(advance(escaping, 1.6).phase, 'plea')
})

test('stopping taps in the initial chase permits the horde to catch the runners', () => {
  assert.equal(advance(tapChase(ready()), 20).phase, 'loss-out')
})

test('Peter trips four seconds after the horde first leaves view, then Susan reaches the opposite edge', () => {
  let state = ready()
  for (let frame = 0; frame < 900 && state.offscreenSince === null; frame += 1) {
    if (frame % 6 === 0) state = tapChase(state)
    state = stepChase(state, 1 / 60)
  }
  assert.notEqual(state.offscreenSince, null)
  assert.equal(state.phase, 'run')
  const before = advance(state, 3.9, true)
  assert.equal(before.phase, 'run')
  const falling = advance(before, .15, true)
  assert.equal(falling.phase, 'trip')
  assert.ok(falling.time - falling.offscreenSince >= 4)
  assert.ok(falling.time - falling.offscreenSince < 4.1)
  const peter = falling.peter
  const stopped = advance(falling, 1.6)
  assert.equal(stopped.phase, 'plea')
  assert.equal(stopped.peter, peter)
  assert.equal(stopped.peter - stopped.camera, 60)
  assert.equal(stopped.susan - stopped.camera, 340)
  assert.equal(stopped.susan - stopped.peter, 280)
})

test('keep running is caught at five seconds, with either zero or extreme tapping', () => {
  for (const tapping of [false, true]) {
    const state = chooseChase(plea(), false)
    const before = advance(state, 4.9, tapping)
    assert.equal(before.phase, 'doomed')
    assert.equal(advance(before, .2, tapping).phase, 'overrun')
  }
})

test('rescue waits for Susan to reach Peter, reveals zombies at the left, and reverses her before the final chase', () => {
  for (const tapEvery of [1, 6, 30]) {
    let state = chooseChase(plea(), true)
    const initialSusan = state.susan
    for (let frame = 0; frame < 1800 && state.phase === 'rescue'; frame += 1) {
      assert.equal(state.trampled, false)
      assert.ok(state.horde < state.camera)
      if (frame % tapEvery === 0) state = tapChase(state)
      state = stepChase(state, 1 / 60)
      assert.ok(state.susan >= state.peter + 60)
    }
    assert.equal(state.phase, 'doomed')
    assert.equal(state.trampled, false)
    assert.ok(state.susan < initialSusan)
    assert.equal(state.susan - state.peter, 60)
    assert.equal(state.horde - state.camera, 35)
    assert.ok(advance(state, .5, true).susan > state.susan)
    assert.equal(advance(state, 4.9, true).phase, 'doomed')
    assert.equal(advance(state, 5.1, true).phase, 'overrun')
  }
})

test('without taps Susan waits during the rescue and zombies stay offscreen', () => {
  const state = chooseChase(plea(), true)
  const waiting = advance(state, 20)
  assert.equal(waiting.phase, 'rescue')
  assert.equal(waiting.susan, state.susan)
  assert.equal(waiting.trampled, false)
  assert.ok(waiting.horde < waiting.camera)
})

test('choices and taps cannot escape a loss or reenter the rescue after choosing', () => {
  const state = chooseChase(plea(), false)
  assert.equal(chooseChase(state, true), state)
  const lost = finishChaseFade(finishChaseFade(advance(state, 7.2, true)))
  assert.equal(lost.phase, 'lost')
  assert.equal(tapChase(lost), lost)
  assert.equal(stepChase(lost, 10), lost)
  const restart = createChase()
  assert.equal(restart.phase, 'entrance')
  assert.equal(restart.trampled, false)
  assert.equal(restart.taps, 0)
})

test('horde completely overtakes stationary Susan before fading out and revealing the loss screen', () => {
  for (const rescue of [false, true]) {
    let state = chooseChase(plea(), rescue)
    while (state.phase !== 'overrun') state = stepChase(tapChase(state), 1 / 60)
    const susan = state.susan
    const camera = state.camera
    const covered = advance(state, 1.8, true)
    assert.equal(covered.phase, 'overrun')
    assert.equal(covered.susan, susan)
    assert.equal(covered.camera, camera)
    assert.ok(covered.horde >= covered.susan + 140)
    assert.equal(tapChase(covered), covered)
    const fadeOut = advance(covered, .3)
    assert.equal(fadeOut.phase, 'loss-out')
    assert.equal(stepChase(fadeOut, 10), fadeOut)
    const fadeIn = finishChaseFade(fadeOut)
    assert.equal(fadeIn.phase, 'loss-in')
    assert.equal(tapChase(fadeIn), fadeIn)
    assert.equal(finishChaseFade(fadeIn).phase, 'lost')
  }
})
