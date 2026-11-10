import test from 'node:test'
import assert from 'node:assert/strict'
import { philipDialogue as steps } from './philipDialogue.js'

test('all conversation branches reach assurance and fade, with correct image changes', () => {
  for (const request of [0, 1]) {
    for (const instructor of [0, 1]) {
      assert.equal(steps.ended.next[0], 'enrollment')
      assert.equal(steps.enrollment.advance, 'thinking')
      assert.equal(steps.thinking.image, 'thinking')
      const question = steps.thinking.next[request]
      assert.equal(question, 'instructor')
      assert.equal(steps[question].image, 'thinking')
      assert.equal(steps[question].next[instructor], 'assurance')
      const emergency = steps.ended.next[1]
      assert.equal(emergency, 'emergency')
      assert.equal(steps[emergency].next[instructor], 'assurance')
    }
  }
  assert.equal(steps.assurance.image, undefined)
  assert.equal(steps.assurance.advance, 'fading')
})

test('every choice has a valid destination and text-only dialogue has an explicit continuation', () => {
  for (const step of Object.values(steps)) {
    if (step.choices) {
      assert.equal(step.choices.length, 2)
      assert.equal(step.next.length, step.choices.length)
      for (const target of step.next) assert.ok(steps[target])
    } else if (!step.prompt) {
      assert.ok(step.advance === 'fading' || steps[step.advance])
    }
  }
})

test('Susan follows the score increase and continues to Philip weeping', () => {
  assert.equal(steps.susan.image, 'susan')
  assert.equal(steps.susan.advance, 'weeping')
  assert.equal(steps.weeping.image, 'weeping')
  assert.equal(steps.weeping.prompt, true)
})
