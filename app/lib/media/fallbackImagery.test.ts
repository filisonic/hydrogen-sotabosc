import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import {
  journalStockImageUrl,
  resolveJournalImageUrl,
  rubriqueStockImageUrl,
} from './fallbackImagery';

describe('fallbackImagery', () => {
  it('always returns an unsplash URL for journal stock', () => {
    const url = journalStockImageUrl('eleven-days-of-music-documentaries-at-aribau');
    assert.match(url, /^https:\/\/images\.unsplash\.com\//);
  });

  it('prefers a real imageUrl when present', () => {
    const url = resolveJournalImageUrl({
      imageUrl: 'https://cdn.shopify.com/s/files/x.jpg',
      handle: 'x',
    });
    assert.equal(url, 'https://cdn.shopify.com/s/files/x.jpg');
  });

  it('falls back to stock when imageUrl is missing', () => {
    const url = resolveJournalImageUrl({handle: 'mira-turns-fifteen', title: 'MIRA'});
    assert.match(url, /^https:\/\/images\.unsplash\.com\//);
  });

  it('is stable for the same key', () => {
    assert.equal(journalStockImageUrl('mira'), journalStockImageUrl('mira'));
    assert.notEqual(journalStockImageUrl('mira'), journalStockImageUrl('in-edit'));
  });

  it('returns rubrique stock', () => {
    assert.match(rubriqueStockImageUrl('music', 'concerts'), /unsplash/);
  });
});
