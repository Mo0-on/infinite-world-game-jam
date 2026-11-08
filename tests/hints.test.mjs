import test from 'node:test';
import assert from 'node:assert/strict';

import { getHintLevel } from '../game/js/hints.js';

test('getHintLevel returns the expected level at each threshold', () => {
  assert.equal(getHintLevel(0), 0);
  assert.equal(getHintLevel(19999), 0);
  assert.equal(getHintLevel(20000), 1);
  assert.equal(getHintLevel(44999), 1);
  assert.equal(getHintLevel(45000), 2);
  assert.equal(getHintLevel(74999), 2);
  assert.equal(getHintLevel(75000), 3);
});

test('getHintLevel rejects negative elapsed time', () => {
  assert.throws(() => getHintLevel(-1));
});

test('getHintLevel rejects invalid elapsed time', () => {
  for (const value of [Number.NaN, Number.POSITIVE_INFINITY, '20000', null, undefined]) {
    assert.throws(() => getHintLevel(value));
  }
});
