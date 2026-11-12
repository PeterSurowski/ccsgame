import test from 'node:test'
import assert from 'node:assert/strict'
import { scoreAtTime, SCORE_ANIMATION_MS, playScoreTicks } from './scoreAnimation.js'

test('engagement visits every integer from 0 to 10 over half a second', () => {
  assert.equal(SCORE_ANIMATION_MS, 500)
  for (let value = 0; value <= 10; value += 1) {
    assert.equal(scoreAtTime(0, 10, value * 50), value)
  }
  assert.equal(scoreAtTime(0, 10, -50), 0)
  assert.equal(scoreAtTime(0, 10, 1000), 10)
})

test('other scores animate both increases and decreases from their current value', () => {
  assert.equal(scoreAtTime(85, 95, 250), 90)
  assert.equal(scoreAtTime(100, 80, 250), 90)
  assert.equal(scoreAtTime(37, 37, 500), 37)
  assert.equal(scoreAtTime(3, 10, 500), 10)
  assert.equal(scoreAtTime(10, -10, 250), 0)
  assert.equal(scoreAtTime(10, -10, 500), -10)
  assert.equal(scoreAtTime(-20, 10, 250), -5)
  assert.equal(scoreAtTime(-20, 10, 500), 10)
})

test('a short quiet tone is scheduled for every crossed integer, including missed frames', () => {
  const tones = []
  const gains = []
  const context = {
    currentTime: 2, destination: {},
    createOscillator() {
      const tone = { type: '', frequency: { setValueAtTime() {} },
        connect() {}, disconnect() {}, start(time) { this.startTime = time },
        stop(time) { this.stopTime = time } }
      tones.push(tone)
      return tone
    },
    createGain() {
      const gain = { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {},
        linearRampToValueAtTime(value) { gains.push(value) } },
      connect() {}, disconnect() {} }
      return gain
    },
  }
  playScoreTicks(context, 10)
  assert.equal(tones.length, 10)
  assert.ok(gains.every(value => value === 0.025))
  for (const tone of tones) assert.ok(tone.stopTime - tone.startTime <= 0.021)
})
