import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { eventPulse, isEventLive, pulseLabel } from './eventWhen';

describe('eventPulse', () => {
  const now = new Date('2026-10-03T12:00:00+02:00');

  it('marks an event in progress as now', () => {
    assert.equal(
      eventPulse({ startsAt: '2026-10-03T11:00', endsAt: '2026-10-03T18:00' }, now),
      'now',
    );
    assert.equal(pulseLabel('now'), 'Happening now');
  });

  it('marks a later slot the same Madrid day as today', () => {
    assert.equal(eventPulse({ startsAt: '2026-10-03T20:30' }, now), 'today');
  });

  it('marks the next few days as this week', () => {
    assert.equal(eventPulse({ startsAt: '2026-10-08T19:00' }, now), 'week');
  });

  it('marks further dates as later', () => {
    assert.equal(eventPulse({ startsAt: '2026-11-15T16:00' }, now), 'later');
  });
});

describe('isEventLive', () => {
  it('is true only while the gathering is on', () => {
    const slot = { startsAt: '2026-10-03T11:00', endsAt: '2026-10-03T18:00' };
    assert.equal(isEventLive(slot, new Date('2026-10-03T12:00:00+02:00')), true);
    assert.equal(isEventLive(slot, new Date('2026-10-03T20:30:00+02:00')), false);
    assert.equal(isEventLive({ ...slot, pulse: 'now' }, new Date('2026-09-30T23:00:00+02:00')), true);
  });
});
