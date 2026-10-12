import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Place } from './types';
import { mapCreatorRow, mapEventRow, mapPlaceRow, toCityWallClock } from './source.server';
import { toCityTimestamp } from '../../../scripts/lib/directory-place-rows';

const seedPlace: Place = {
  id: 'p01',
  slug: 'orval-cafe',
  name: 'Orval',
  summary: 'Seed summary',
  address: 'Carrer de Granados 1',
  neighborhood: 'Eixample',
  city: 'Barcelona',
  categories: ['specialty-coffee'],
  primaryDomain: 'earth',
};

describe('toCityWallClock', () => {
  it('turns a timestamptz into Barcelona wall-clock YYYY-MM-DDTHH:mm', () => {
    // 16 Apr 2026 is CEST (UTC+2)
    assert.equal(toCityWallClock('2026-04-16T07:00:00.000Z'), '2026-04-16T09:00');
  });

  it('round-trips the seed format through the sync helper', () => {
    const stored = toCityTimestamp('2026-04-16T09:00');
    assert.equal(toCityWallClock(stored), '2026-04-16T09:00');
  });

  it('returns undefined for empty or invalid values', () => {
    assert.equal(toCityWallClock(undefined), undefined);
    assert.equal(toCityWallClock('not-a-date'), undefined);
  });
});

describe('mapPlaceRow', () => {
  it('prefers live columns and falls back to the seed for missing extras', () => {
    const place = mapPlaceRow(
      {
        slug: 'orval-cafe',
        name: 'Orval Café',
        summary: 'Live summary',
        address: 'Granados 1',
        neighborhood: 'Eixample',
        city: 'Barcelona',
        categories: ['specialty-coffee'],
        primary_domain: 'earth',
        wall_opt_in: true,
        telephone: '+34 000 000 000',
      },
      new Map([['orval-cafe', seedPlace]]),
    );
    assert.ok(place);
    assert.equal(place.name, 'Orval Café');
    assert.equal(place.summary, 'Live summary');
    assert.equal(place.id, 'p01');
    assert.equal(place.telephone, '+34 000 000 000');
    assert.equal('wallOptIn' in place, false);
  });

  it('drops rows without a slug or name', () => {
    assert.equal(mapPlaceRow({ slug: 'x' }, new Map()), null);
    assert.equal(mapPlaceRow({ name: 'X' }, new Map()), null);
  });
});

describe('mapEventRow', () => {
  it('resolves placeId from place_slug when place_id is missing', () => {
    const event = mapEventRow(
      {
        id: 'e01',
        slug: 'offf-barcelona-2026',
        title: 'OFFF',
        starts_at: '2026-04-16T07:00:00.000Z',
        place_slug: 'orval-cafe',
        primary_domain: 'fungi',
      },
      new Map([['orval-cafe', 'p01']]),
    );
    assert.ok(event);
    assert.equal(event.startsAt, '2026-04-16T09:00');
    assert.equal(event.placeId, 'p01');
  });

  it('maps booking_url to the venue ticket link', () => {
    const event = mapEventRow(
      {
        id: 'e_ai_1',
        slug: 'happy-techno',
        title: 'Happy Techno',
        starts_at: '2026-10-17T17:00:00.000Z',
        booking_url: 'https://www.eventbrite.es/e/happy-techno-at-la-terrrazza-barcelona-open-air-daytime-tickets-1985805281052',
        place_name: 'La Terrrazza',
        primary_domain: 'animals',
      },
      new Map(),
    );
    assert.ok(event);
    assert.equal(
      event.sourceUrl,
      'https://www.eventbrite.es/e/happy-techno-at-la-terrrazza-barcelona-open-air-daytime-tickets-1985805281052',
    );
  });

  it('drops events without a start time', () => {
    assert.equal(
      mapEventRow({ id: 'e1', slug: 'x', title: 'X' }, new Map()),
      null,
    );
  });
});

describe('mapCreatorRow', () => {
  it('maps display_name and store handle', () => {
    const creator = mapCreatorRow({
      id: 'c01',
      slug: 'laia-carbonell',
      display_name: 'Laia Carbonell',
      bio: 'Ink',
      primary_domain: 'plants',
      product_collection_handle: 'laia-carbonell',
      works: [{ id: 'w1', title: 'Flora', rightsGranted: true }],
    });
    assert.ok(creator);
    assert.equal(creator.displayName, 'Laia Carbonell');
    assert.equal(creator.productCollectionHandle, 'laia-carbonell');
    assert.equal('works' in creator, false);
    assert.equal('wallOptIn' in creator, false);
  });
});
