import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import {scoreEditionStoryAlignment} from './editionStoryAlignment';

describe('scoreEditionStoryAlignment', () => {
  it('accepts Barcelona art exhibitions', () => {
    const r = scoreEditionStoryAlignment({
      title: 'Marcelo Fuentes at Alzueta Gallery, Barcelona',
      summary: 'Contemporary exhibition',
    });
    assert.ok(r.score >= 70);
    assert.equal(r.rubrique, 'art');
  });

  it('rejects tech / HN-style noise', () => {
    const r = scoreEditionStoryAlignment({
      title: 'A Jev that can ask Opus for help',
      summary: 'LLM judge accuracy',
      sourceUrl: 'https://news.ycombinator.com',
    });
    assert.equal(r.score, 0);
  });

  it('rejects far-away cities without Barcelona', () => {
    const r = scoreEditionStoryAlignment({
      title: 'Small Format Art Fair in Buenos Aires 2026',
      summary: 'Museum of architecture',
    });
    assert.equal(r.score, 0);
  });

  it('rejects Madrid-only roundups', () => {
    const r = scoreEditionStoryAlignment({
      title: 'The 18 Must-See Exhibitions in Madrid This October',
      summary: 'Exhibitions in Madrid you cannot miss',
      publisher: 'Madrid Secreto',
    });
    assert.equal(r.score, 0);
  });
});
