import test from 'node:test'
import assert from 'node:assert/strict'
import { MAP_WIDTH, MAP_HEIGHT, clampMapCenter, nextChoice, professorLocations } from './campusMap.js'

test('either first arrow selects A, subsequent arrows move between A and B', () => {
  assert.equal(nextChoice(null, -1), 0)
  assert.equal(nextChoice(null, 1), 0)
  assert.equal(nextChoice(0, 1), 1)
  assert.equal(nextChoice(1, -1), 0)
  assert.equal(nextChoice(0, -1), 0)
  assert.equal(nextChoice(1, 1), 1)
})

test('choice navigation supports three options and skips disabled branches', () => {
  assert.equal(nextChoice(1, 1, 3), 2)
  assert.equal(nextChoice(2, 1, 3), 2)
  assert.equal(nextChoice(null, 1, 3, [0, 2]), 1)
  assert.equal(nextChoice(null, -1, 3, [0, 2]), 1)
  assert.equal(nextChoice(1, 1, 3, [0, 2]), 1)
  assert.equal(nextChoice(1, -1, 3, [0, 2]), 1)
  assert.equal(nextChoice(null, 1, 2, [0, 1]), null)
})

test('map panning clamps both edges and retains valid positions', () => {
  assert.equal(clampMapCenter(-100, 400), 200)
  assert.equal(clampMapCenter(2000, 400), 824)
  assert.equal(clampMapCenter(512, 400), 512)
  assert.equal(clampMapCenter(2000, 1200), MAP_WIDTH / 2)
  for (const location of Object.values(professorLocations)) {
    assert.ok(location.x > 0 && location.x < MAP_WIDTH)
    assert.ok(location.y > 64 && location.y < MAP_HEIGHT)
  }
  assert.deepEqual([professorLocations.philip.x, professorLocations.philip.y], [826, 326])
  assert.deepEqual([professorLocations.matt.x, professorLocations.matt.y], [220, 273])
})
