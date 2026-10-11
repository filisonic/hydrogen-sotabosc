import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  currentMonthKey,
  eventMonthKey,
  eventsInMonth,
  listEventMonths,
  monthLabel,
  parseMonthParam,
} from './eventMonths';
import type { CityEvent } from './types';

const sample = (startsAt: string): CityEvent => ({
  id: startsAt,
  slug: startsAt,
  title: 'x',
  summary: 'x',
  startsAt,
  placeId: 'p',
  primaryDomain: 'animals',
});

describe('event months', () => {
  it('keys Barcelona wall-clock months', () => {
    assert.equal(eventMonthKey('2026-10-01T20:30'), '2026-10');
    assert.equal(eventMonthKey('2026-10-31T23:30+02:00'), '2026-10');
  });

  it('rejects bad month params', () => {
    assert.equal(parseMonthParam('october'), null);
    assert.equal(parseMonthParam('2026-13'), null);
    assert.deepEqual(parseMonthParam('2026-10'), { year: 2026, month: 10 });
  });

  it('labels and filters a month', () => {
    assert.match(monthLabel('2026-10'), /October 2026/);
    const events = [sample('2026-10-03T18:00'), sample('2026-11-01T12:00')];
    assert.equal(eventsInMonth(events, '2026-10').length, 1);
    const months = listEventMonths(events, new Date('2026-10-15T12:00:00+02:00'));
    assert.ok(months.includes('2026-10'));
    assert.ok(months.includes('2026-11'));
    assert.ok(months.includes('2026-12'));
    assert.ok(months.includes('2027-01'));
    assert.equal(currentMonthKey(new Date('2026-10-15T12:00:00+02:00')), '2026-10');
    const emptyAhead = listEventMonths([], new Date('2026-09-30T12:00:00+02:00'));
    assert.ok(emptyAhead.includes('2026-10'));
    assert.ok(emptyAhead.includes('2026-11'));
    assert.ok(emptyAhead.includes('2026-12'));
  });
});
