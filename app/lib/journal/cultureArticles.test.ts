import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import {
  isCultureJournalArticle,
  pickCultureJournalArticles,
} from './cultureArticles';

describe('isCultureJournalArticle', () => {
  it('keeps In-Edit and MIRA culture pieces', () => {
    assert.equal(
      isCultureJournalArticle({
        title: 'Eleven days of music documentaries at Aribau',
        excerpt: 'In-Edit opens at Cinemes Aribau',
      }),
      true,
    );
    assert.equal(
      isCultureJournalArticle({
        title: 'MIRA turns fifteen: eleven art works, two days at Fira Montjuïc',
      }),
      true,
    );
  });

  it('drops hardware and coding dispatches', () => {
    assert.equal(
      isCultureJournalArticle({
        title: 'A corner detector on a two dollar chip',
      }),
      false,
    );
    assert.equal(
      isCultureJournalArticle({
        title: 'Goose: a language with no heap, and references that survive growth',
      }),
      false,
    );
  });
});

describe('pickCultureJournalArticles', () => {
  it('returns culture teasers only', () => {
    const picked = pickCultureJournalArticles(
      [
        {
          id: '1',
          title: 'A corner detector on a two dollar chip',
          handle: 'chip',
          blog: {handle: 'news'},
        },
        {
          id: '2',
          title: 'Eleven days of music documentaries at Aribau',
          handle: 'in-edit',
          publishedAt: '2026-10-24',
          contentHtml: '<p>In-Edit opens its 24th edition.</p>',
          blog: {handle: 'news'},
          image: {url: 'https://example.com/a.jpg'},
        },
      ],
      4,
    );
    assert.equal(picked.length, 1);
    assert.equal(picked[0].handle, 'in-edit');
    assert.equal(picked[0].blogHandle, 'news');
  });
});
