import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { resumeCandidates, applyCandidateEffects, applyScoreEffect, shuffleCandidates, resumeOutcome, nextResumeIndex } from './resumeCandidates.js'

const initial = [100, 85, 20, 10].map((value, index) => ({
  label: ['Budget', 'Ave. GPA', 'Job Placement', 'Engagement'][index], value,
}))

test('all 12 candidate effects match the balanced scores and portraits exist', () => {
  const expected = [
    [-30, -10, 20, 30], [-55, 5, -20, -10], [-30, 10, -30, -30],
    [-30, 0, 15, -20], [-30, 0, 0, -20], [-20, 10, -30, 20],
    [-10, -50, -50, -50], [-40, 10, -30, 10], [-20, 0, 10, -20],
    [-55, 10, -30, 10], [-30, 5, 20, -25], [-10, -35, 5, -20],
  ]
  assert.equal(resumeCandidates.length, 12)
  assert.equal(new Set(resumeCandidates.map(candidate => candidate.id)).size, 12)
  resumeCandidates.forEach((candidate, index) => {
    assert.deepEqual(candidate.effects.map(effect => effect.delta), expected[index])
    assert.ok(existsSync(new URL(`./assets/scenes/${candidate.photo}`, import.meta.url)))
    assert.ok(candidate.summary && candidate.strengths.length && candidate.weaknesses.length)
    assert.deepEqual(candidate.effects.map(effect => effect.label), initial.map(score => score.label))
  })
})

test('shuffle retains all candidates without changing the source order', () => {
  const original = [...resumeCandidates]
  const shuffled = shuffleCandidates(resumeCandidates, () => 0)
  assert.notDeepEqual(shuffled, resumeCandidates)
  assert.deepEqual(new Set(shuffled), new Set(resumeCandidates))
  assert.deepEqual(resumeCandidates, original)
})

test('sequential score updates change only the active score and preserve final totals', () => {
  for (const candidate of resumeCandidates) {
    let scores = structuredClone(initial)
    for (const effect of candidate.effects) {
      const before = structuredClone(scores)
      scores = applyScoreEffect(scores, effect)
      scores.forEach((score, index) => {
        assert.equal(score.value, score.label === effect.label
          ? Math.min(100, before[index].value + effect.delta) : before[index].value)
      })
    }
    assert.deepEqual(scores, applyCandidateEffects(initial, candidate))
  }
})

test('scores are cumulative, can go negative, remain capped at 100, and input is unchanged', () => {
  const before = structuredClone(initial)
  const hired = applyCandidateEffects(initial, resumeCandidates[0])
  assert.deepEqual(hired.map(score => score.value), [70, 75, 40, 40])
  assert.deepEqual(initial, before)
  const low = applyCandidateEffects(initial, resumeCandidates[6])
  assert.deepEqual(low.map(score => score.value), [90, 35, -30, -40])
  assert.equal(applyScoreEffect(low, { label: 'Engagement', delta: 50 })[3].value, 10)
  const capped = applyCandidateEffects(initial.map(score => ({ ...score, value: 99 })), resumeCandidates[10])
  assert.deepEqual(capped.map(score => score.value), [69, 100, 100, 74])
})

test('only final negative scores lose; zero succeeds and incomplete hires always continue', () => {
  for (let index = 0; index < 4; index += 1) {
    const scores = initial.map((score, i) => ({ ...score, value: i === index ? 0 : score.value }))
    assert.equal(resumeOutcome(scores, 3), 'success')
    scores[index].value = -1
    assert.equal(resumeOutcome(scores, 3), 'revolt')
    assert.equal(resumeOutcome(scores, 2), 'card')
  }
  assert.equal(resumeOutcome(initial, 3), 'success')
  assert.equal(resumeOutcome(initial, 2), 'card')
  assert.equal(resumeOutcome(initial, 0), 'card')
})

test('rejected cards repeat in order across multiple passes, excluding all hired candidates', () => {
  const deck = resumeCandidates
  let index = 0
  for (let step = 0; step < 36; step++) {
    assert.equal(index, step % 12)
    index = nextResumeIndex(deck, index, [])
  }
  const hires = [deck[0].id, deck[11].id]
  index = 1
  for (let step = 0; step < 30; step++) {
    assert.equal(index, 1 + step % 10)
    index = nextResumeIndex(deck, index, hires)
  }
  assert.equal(nextResumeIndex(deck, 11, [deck[11].id]), 0)
  assert.throws(() => nextResumeIndex(deck, 0, deck.map(candidate => candidate.id)),
    /No unhired candidates/)
})
test('Peter, Paige, and Barb are a winning sequence from either professor route', () => {
  for (const engagement of [10, 20]) {
    let scores = initial.map(score => score.label === 'Engagement' ? { ...score, value: engagement } : score)
    for (const [index, id] of ['peter', 'paige', 'barb'].entries()) {
      scores = applyCandidateEffects(scores, resumeCandidates.find(candidate => candidate.id === id))
      assert.equal(resumeOutcome(scores, index + 1),
        index === 2 ? 'success' : 'card')
    }
    assert.deepEqual(scores.map(score => score.value), [20, 90, 30, engagement + 25])
  }
})

const storyStarts = [
  { route: 'Philip only', placement: 20, engagement: 10 },
  { route: 'Matt only', placement: 30, engagement: 10 },
  { route: 'Both professors, either order', placement: 30, engagement: 20 },
]

function startingScores({ placement, engagement }) {
  return initial.map(score => ({
    ...score,
    value: score.label === 'Job Placement' ? placement
      : score.label === 'Engagement' ? engagement : score.value,
  }))
}

test('all 3,960 ordered teams are judged only after three hires, with multiple winning teams', () => {
  let checked = 0
  for (const start of storyStarts) {
    const scores = startingScores(start)
    const winners = new Set()
    let losingWithPeter = 0
    for (const first of resumeCandidates) {
      for (const second of resumeCandidates) {
        for (const third of resumeCandidates) {
          const sequence = [first, second, third]
          const ids = sequence.map(candidate => candidate.id)
          if (new Set(ids).size !== 3) continue
          checked += 1
          const description = `${start.route}: ${ids.join(' -> ')}`
          let finalScores = scores
          sequence.forEach((candidate, index) => {
            finalScores = applyCandidateEffects(finalScores, candidate)
            if (index < 2) assert.equal(resumeOutcome(finalScores, index + 1), 'card', description)
          })
          const won = finalScores.every(score => score.value >= 0)
          assert.equal(resumeOutcome(finalScores, 3), won ? 'success' : 'revolt', description)
          if (won) winners.add([...ids].sort().join(','))
          else if (ids.includes('peter')) losingWithPeter += 1
        }
      }
    }
    assert.ok(winners.size >= 3, `${start.route} needs several distinct winning teams`)
    assert.ok(losingWithPeter > 0, `${start.route}: Peter must not guarantee a win`)
  }
  assert.equal(checked, 3960)
})

test('a negative intermediate score can recover; exactly zero after three hires is a win', () => {
  let scores = startingScores(storyStarts[2])
  for (const [index, id] of ['sammy', 'al', 'paige'].entries()) {
    scores = applyCandidateEffects(scores, resumeCandidates.find(candidate => candidate.id === id))
    assert.equal(resumeOutcome(scores, index + 1), index === 2 ? 'success' : 'card')
    if (index === 1) assert.equal(scores[3].value, -20)
  }
  assert.equal(scores[3].value, 0)
})
