import test from 'node:test'
import assert from 'node:assert/strict'
import { createFlashback, flashbackReducer } from './peterFlashback.js'

function moveLeft(state, steps = 1) {
  let current = state
  for (let index = 0; index < steps; index += 1) current = flashbackReducer(current, { type: 'move', dx: -8 })
  return current
}

test('movement hints are dismissed by the first actual move in either direction and stay dismissed', () => {
  for (const dx of [-8, 8]) {
    let state = createFlashback()
    assert.equal(state.hasMoved, false)
    state = flashbackReducer(state, { type: 'move', dx: 0 })
    assert.equal(state.hasMoved, false)
    state = flashbackReducer(state, { type: 'move', dx })
    assert.equal(state.hasMoved, true)
    state = flashbackReducer(state, { type: 'move', dx: -dx })
    assert.equal(state.x, 0)
    assert.equal(state.hasMoved, true)
    state = moveLeft(state, 20)
    assert.equal(state.mode, 'narration')
    state = flashbackReducer(state, { type: 'continue' })
    assert.equal(state.mode, 'walking')
    assert.equal(state.hasMoved, true)
  }
  const blocked = { ...createFlashback(), x: 70 }
  assert.equal(flashbackReducer(blocked, { type: 'move', dx: 8 }).hasMoved, false)
  assert.equal(createFlashback().hasMoved, false)
})

test('intro milestones and adult switch trigger in order', () => {
  let state = createFlashback()
  state = moveLeft(state, 20)
  assert.equal(state.mode, 'narration')
  assert.equal(state.narration, 'computer')

  state = flashbackReducer(state, { type: 'continue' })
  state = moveLeft(state, 25)
  assert.equal(state.narration, 'adult')
  assert.equal(state.adult, true)

  state = flashbackReducer(state, { type: 'continue' })
  state = moveLeft(state, 25)
  assert.equal(state.narration, 'family')
})

test('skipping a door creates the next identical office', () => {
  let state = createFlashback()
  state = moveLeft(state, 60)
  state = flashbackReducer(state, { type: 'continue' })
  state = moveLeft(state, 30)
  state = flashbackReducer(state, { type: 'continue' })
  state = moveLeft(state, 30)
  state = flashbackReducer(state, { type: 'continue' })
  state = moveLeft(state, 40)
  assert.equal(state.mode, 'door')
  state = flashbackReducer(state, { type: 'skip' })
  assert.equal(state.mode, 'walking')
  assert.equal(state.offices.length, 2)
  assert.equal(state.offices[0].result, 'skipped')
})

test('third successful pitch unlocks M2Media and completion', () => {
  let state = createFlashback()
  state = moveLeft(state, 60)
  state = flashbackReducer(state, { type: 'continue' })
  state = moveLeft(state, 30)
  state = flashbackReducer(state, { type: 'continue' })
  state = moveLeft(state, 30)
  state = flashbackReducer(state, { type: 'continue' })

  for (let meeting = 0; meeting < 3; meeting += 1) {
    state = moveLeft(state, 50)
    assert.equal(state.mode, 'door')
    state = flashbackReducer(state, { type: 'knock' })
    state = flashbackReducer(state, { type: 'pitch' })
    if (meeting === 0) {
      assert.equal(state.narration, 'rejection')
      state = flashbackReducer(state, { type: 'continue' })
      assert.equal(state.offices[0].result, 'rejected')
    } else {
      state = flashbackReducer(state, { type: 'continue' })
    }
  }

  assert.equal(state.m2X !== null, true)
  state = moveLeft(state, 40)
  assert.equal(state.mode, 'm2-door')
  state = flashbackReducer(state, { type: 'knock' })
  assert.equal(state.narration, 'm2')
  state = flashbackReducer(state, { type: 'continue' })
  assert.equal(state.mode, 'complete')
})
