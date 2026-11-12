import test from 'node:test'
import assert from 'node:assert/strict'
import { philipDialogue as steps, philipDecision } from './philipDialogue.js'

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
      assert.ok(['fading', 'decision', 'game-over'].includes(step.advance) || steps[step.advance])
    }
  }
})

test('Susan follows the score increase and continues to Philip weeping', () => {
  assert.equal(steps.susan.image, 'susan')
  assert.equal(steps.susan.advance, 'weeping')
  assert.equal(steps.weeping.image, 'weeping')
  assert.equal(steps.weeping.advance, 'decision')
})

test('Susan offers Matt only if he has not already been asked, with unfinished branches disabled', () => {
  for (const history of [[], ['philip'], ['matt'], ['matt', 'philip'], ['philip', 'matt']]) {
    const decision = philipDecision(history)
    assert.equal(decision.image, 'susan-thinking')
    assert.equal(decision.choices.length, history.includes('matt') ? 2 : 3)
    assert.deepEqual(decision.disabled, [])
    assert.equal(decision.next[0], 'hire-fading')
    assert.equal(decision.next[1], 'failure-fading')
    if (!history.includes('matt')) assert.equal(decision.next[2], 'matt')
  }
})

test('pushing Philip leads through the complete uprising sequence to the ending', () => {
  const sequence = ['teaching', 'zombies1', 'zombies2', 'running']
  for (let index = 0; index < sequence.length; index += 1) {
    assert.equal(steps[sequence[index]].image, sequence[index])
    assert.equal(steps[sequence[index]].advance, sequence[index + 1] ?? 'game-over')
  }
})
