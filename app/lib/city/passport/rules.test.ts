import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  addVisit,
  barcelonaDay,
  collectibleState,
  kingdomProgress,
  nextStep,
  placeVisits,
  type Visit,
} from './rules';

const visit = (place: string, day: string, kingdom = 'plants'): Visit => ({
  place,
  kingdom,
  day,
  at: Date.parse(`${day}T12:00:00Z`),
  source: 'map',
});

test('barcelonaDay follows Europe/Madrid, not UTC', () => {
  // 23:30 UTC on 1 Oct is already 2 Oct in Barcelona (UTC+2 in summer time).
  assert.equal(barcelonaDay(new Date('2026-10-01T23:30:00Z')), '2026-10-02');
  assert.equal(barcelonaDay(new Date('2026-10-01T12:00:00Z')), '2026-10-01');
});

test('a place counts once per day', () => {
  let visits: Visit[] = [];
  visits = addVisit(visits, visit('a', '2026-10-01'));
  const again = addVisit(visits, visit('a', '2026-10-01'));
  assert.equal(again, visits);
  visits = addVisit(visits, visit('a', '2026-10-02'));
  assert.equal(placeVisits(visits, 'a'), 2);
});

test('three different places in one kingdom unlock it', () => {
  const two = [visit('a', '2026-10-01'), visit('b', '2026-10-01')];
  assert.equal(kingdomProgress(two, 'plants').unlocked, false);
  const three = [...two, visit('c', '2026-10-01')];
  const progress = kingdomProgress(three, 'plants');
  assert.equal(progress.unlocked, true);
  assert.equal(progress.via, 'explorer');
});

test('four days at one place unlock it', () => {
  const days = ['2026-10-01', '2026-10-02', '2026-10-03'].map((d) => visit('a', d));
  assert.equal(kingdomProgress(days, 'plants').unlocked, false);
  const progress = kingdomProgress([...days, visit('a', '2026-10-04')], 'plants');
  assert.equal(progress.unlocked, true);
  assert.equal(progress.via, 'regular');
  assert.deepEqual(progress.favourite, { place: 'a', days: 4 });
});

test('places in other kingdoms do not count', () => {
  const mixed = [visit('a', '2026-10-01'), visit('b', '2026-10-01'), visit('z', '2026-10-01', 'earth')];
  assert.equal(kingdomProgress(mixed, 'plants').unlocked, false);
  assert.equal(kingdomProgress(mixed, 'earth').places, 1);
});

test('collectible state walks hidden → stirring → surfaced → collected', () => {
  assert.equal(collectibleState(kingdomProgress([], 'plants'), false), 'hidden');
  const one = [visit('a', '2026-10-01')];
  assert.equal(collectibleState(kingdomProgress(one, 'plants'), false), 'stirring');
  const three = [...one, visit('b', '2026-10-01'), visit('c', '2026-10-01')];
  assert.equal(collectibleState(kingdomProgress(three, 'plants'), false), 'surfaced');
  assert.equal(collectibleState(kingdomProgress(three, 'plants'), true), 'collected');
});

test('nextStep says what is left', () => {
  assert.match(nextStep(kingdomProgress([], 'plants')), /3 places/);
  assert.match(nextStep(kingdomProgress([visit('a', '2026-10-01')], 'plants')), /2 more places here.*3 more days/);
});
