import test from 'node:test'
import assert from 'node:assert/strict'
import { mattDialogue, mattFollowup, mattDecision } from './mattDialogue.js'
import { philipDecision } from './philipDialogue.js'

test('Matt conversation uses all six dialogue pages in the requested image order', () => {
  assert.deepEqual(mattDialogue.map(step => step.image),
    ['matt', 'student', 'happy', 'weeping', 'hallway', 'hallway'])
  assert.deepEqual(mattDialogue.map(step => step.lines.length), [1, 1, 1, 3, 2, 2])
  assert.equal(mattDialogue[0].lines[0],
    'Matt Raupp: This is excellent work, miss. But I have a suspicion. Did you use AI to finish this project?')
  assert.equal(mattDialogue[3].lines[2], 'Susan: Professor Raupp, may I speak with you in the hallway?')
  assert.equal(mattDialogue[5].lines[1], 'Matt Raupp: You can count on me!')
})

test('Philip alternative leads to Matt unless Matt was already asked', () => {
  const decision = philipDecision(['philip'])
  assert.equal(decision.next[2], 'matt')
  assert.equal(decision.disabled.includes(2), false)
  assert.equal(philipDecision(['matt', 'philip']).next.includes('matt'), false)
})

test('Matt follow-up leads from Susan to sleeping Matt and a history-aware decision', () => {
  assert.equal(mattFollowup.susan.image, 'susan')
  assert.equal(mattFollowup.susan.advance, 'sleeping')
  assert.equal(mattFollowup.sleeping.image, 'sleeping')
  assert.equal(mattFollowup.sleeping.advance, 'decision')
  for (const history of [[], ['matt'], ['philip'], ['philip', 'matt'], ['matt', 'philip']]) {
    const decision = mattDecision(history)
    assert.equal(decision.image, 'thinking')
    assert.deepEqual(decision.disabled, [])
    assert.equal(decision.next[1], 'hire-fading')
    assert.equal(decision.next[0], 'failure-fading')
    assert.equal(decision.choices.length, history.includes('philip') ? 2 : 3)
    assert.equal(decision.next.includes('philip-fading'), !history.includes('philip'))
  }
})

test('pushing Matt leads through teaching and mobbing to an ending fade', () => {
  assert.equal(mattFollowup.pushing.image, 'pushing')
  assert.equal(mattFollowup.pushing.advance, 'mobbed')
  assert.equal(mattFollowup.mobbed.image, 'mobbed')
  assert.equal(mattFollowup.mobbed.advance, 'ending-fading')
})
