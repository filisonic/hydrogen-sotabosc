import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import {buildEditionWindow, eventsInCulturalWindow} from './editionWindow';
import type {CityEvent, Creator, Place} from './types';

const place = (partial: Partial<Place> & Pick<Place, 'id' | 'slug' | 'name'>): Place => ({
  summary: 'Test place',
  address: 'Carrer Test 1',
  neighborhood: 'Gràcia',
  city: 'Barcelona',
  categories: ['art-gallery'],
  primaryDomain: 'earth',
  ...partial,
});

const event = (
  partial: Partial<CityEvent> & Pick<CityEvent, 'id' | 'slug' | 'title' | 'startsAt'>,
): CityEvent => ({
  summary: 'Test event',
  placeId: 'p1',
  primaryDomain: 'earth',
  ...partial,
});

describe('eventsInCulturalWindow', () => {
  it('keeps events overlapping the last 30 days and near future', () => {
    const now = new Date('2026-11-04T12:00:00+01:00');
    const events = [
      event({id: 'old', slug: 'old', title: 'Old', startsAt: '2026-08-01T12:00'}),
      event({
        id: 'ongoing',
        slug: 'ongoing',
        title: 'Ongoing show',
        startsAt: '2026-10-10T12:00',
        endsAt: '2026-12-01T20:00',
        tags: ['exhibition'],
      }),
      event({id: 'soon', slug: 'soon', title: 'Soon', startsAt: '2026-11-20T19:00'}),
      event({id: 'far', slug: 'far', title: 'Far', startsAt: '2027-04-01T09:00'}),
    ];
    const windowed = eventsInCulturalWindow(events, {now, lookbackDays: 30, lookaheadDays: 45});
    assert.deepEqual(
      windowed.map((e) => e.id),
      ['ongoing', 'soon'],
    );
  });
});

describe('buildEditionWindow', () => {
  it('builds Barcelona edition packs with exhibitions and local edit', () => {
    const now = new Date('2026-11-04T12:00:00+01:00');
    const places = [
      place({id: 'p1', slug: 'gallery-a', name: 'Gallery A', categories: ['art-gallery']}),
      place({
        id: 'p2',
        slug: 'cafe-b',
        name: 'Cafe B',
        categories: ['specialty-coffee'],
        neighborhood: 'Born',
      }),
      place({
        id: 'p3',
        slug: 'tres-punts-gallery',
        name: 'Tres Punts',
        categories: ['art-gallery'],
        imageUrl: 'https://example.com/tres.jpg',
      }),
      place({
        id: 'p4',
        slug: 'other-gallery',
        name: 'Other',
        categories: ['art-gallery'],
      }),
    ];
    const events = [
      event({
        id: 'e1',
        slug: 'solo',
        title: 'Solo Exhibition',
        startsAt: '2026-10-20T18:00',
        endsAt: '2026-12-10T20:00',
        placeId: 'p1',
        placeName: 'Gallery A',
        tags: ['exhibition', 'painting'],
        imageUrl: 'https://example.com/show.jpg',
      }),
    ];
    const creators: Creator[] = [
      {
        id: 'c0',
        slug: 'z-late',
        displayName: 'Late Artist',
        bio: 'Short.',
        city: 'Barcelona',
        primaryDomain: 'earth',
      },
      {
        id: 'c1',
        slug: 'irmi-salleras',
        displayName: 'Irmi Salleras',
        bio: 'Painter working in thin glazes across the Raval corridor.',
        city: 'Barcelona',
        primaryDomain: 'earth',
        imageUrl: 'https://example.com/irmi.jpg',
      },
    ];

    const edition = buildEditionWindow(places, events, creators, {now});
    assert.match(edition.editionLabel, /Barcelona Edition/);
    assert.equal(edition.issueNumeral, '11');
    assert.equal(edition.exhibitions.length, 1);
    assert.equal(edition.featured?.slug, 'solo');
    assert.equal(edition.artists[0]?.slug, 'irmi-salleras');
    assert.equal(edition.localEdit[0]?.slug, 'tres-punts-gallery');
    assert.ok(edition.localEdit.length >= 1);
    assert.equal(edition.totals.places, 4);
  });
});
