import {useState} from 'react';
import {Link} from 'react-router';
import {JsonLd} from '~/components/seo/JsonLd';
import {
  journalStockImageUrl,
  rubriqueStockImageUrl,
} from '~/lib/media/fallbackImagery';

/**
 * Hotlinked edition figure: on failure, try a stock photo, then a letter mark.
 * @param {{
 *   src?: string | null;
 *   fallbackSrc?: string | null;
 *   figClass: string;
 *   emptyClass?: string;
 *   fallback?: import('react').ReactNode;
 *   loading?: 'eager' | 'lazy';
 * }} props
 */
function EditionFig({
  src,
  fallbackSrc,
  figClass,
  emptyClass = `${figClass} ${figClass}--empty`,
  fallback = 'S',
  loading = 'lazy',
}) {
  const [stage, setStage] = useState(/** @type {'primary' | 'stock' | 'done'} */ ('primary'));
  const active =
    stage === 'primary' && src
      ? src
      : stage !== 'done' && fallbackSrc
        ? fallbackSrc
        : null;

  if (!active) {
    return <div className={emptyClass}>{fallback}</div>;
  }

  return (
    <div className={figClass}>
      <img
        src={active}
        alt=""
        loading={loading}
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => {
          if (stage === 'primary' && fallbackSrc && fallbackSrc !== src) {
            setStage('stock');
          } else {
            setStage('done');
          }
        }}
      />
    </div>
  );
}

/** Magazine running head: section number and name left, edition right. */
function RunningHead({n, name, edition}) {
  return (
    <div className="ed-rh">
      <span>
        <b>{n}</b> · {name}
      </span>
      <span>Sotabosc · {edition}</span>
    </div>
  );
}

/**
 * Sotabosc homepage, laid out like the printed magazine:
 * cover, contents, then numbered sections with running heads.
 * @param {{
 *   edition: import('~/lib/directory/editionWindow').EditionWindow;
 *   journalArticles?: Array<{
 *     id: string;
 *     title: string;
 *     handle: string;
 *     blogHandle: string;
 *     excerpt?: string;
 *     publishedAt?: string;
 *     imageUrl?: string | null;
 *   }>;
 *   magazine?: {slug: string; title: string; issue: string; date: string; description: string; coverHtml: string} | null;
 * }} props
 */
export function EditionHome({edition, journalArticles = [], magazine = null}) {
  const monthLabel = edition.editionLabel.split(' · ')[1] || '';
  const featured = edition.featured;
  const isEventFeatured = featured && 'startsAt' in featured;
  const leadHref = featured
    ? isEventFeatured
      ? `/city/events/${featured.slug}`
      : `/city/places/${featured.slug}`
    : '/city/events';
  const leadTitle = featured
    ? isEventFeatured
      ? featured.title
      : featured.name
    : 'This week in the city';
  const leadDek = featured
    ? isEventFeatured
      ? featured.placeName ||
        featured.place?.name ||
        featured.summary?.slice(0, 140) ||
        'From the Barcelona cultural window.'
      : featured.summary?.slice(0, 140) || featured.neighborhood
    : 'Art, design, exhibitions and what’s happening — pulled from the city directory.';
  const leadImage = featured && 'imageUrl' in featured ? featured.imageUrl : null;

  const agenda = edition.happening.slice(0, 8);
  const news = edition.inTheNews ?? [];
  const [journalLead, ...journalRest] = journalArticles;
  const exhibitions = edition.exhibitions.slice(0, 2).map((ev) => ({
      id: ev.id,
      href: `/city/events/${ev.slug}`,
      rubrique: 'The Exhibition',
      title: ev.title,
      copy: ev.placeName || ev.summary?.slice(0, 120),
      src: ev.imageUrl,
      fallbackSrc: rubriqueStockImageUrl('art', ev.slug || ev.id),
      mark: 'Ex',
  }));
  const artists = edition.artists.slice(0, 2).map((c) => ({
      id: c.id,
      href: `/city/creators/${c.slug}`,
      rubrique: 'The Artist',
      title: c.displayName,
      copy: c.bio?.slice(0, 140),
      src: c.imageUrl,
      fallbackSrc: null,
      mark: c.displayName.slice(0, 1),
  }));
  // One large exhibition, then an artist, then whatever is left.
  const showcase = [exhibitions[0], artists[0], exhibitions[1], artists[1]].filter(Boolean).slice(0, 3);
  const local = edition.localEdit.slice(0, 6);

  // Cover lines: one line from each part of the edition that has content.
  const coverLines = [
    agenda[0] && {k: 'The Agenda', t: agenda[0].title, href: '#agenda'},
    news[0] && {k: 'In the News', t: news[0].title, href: '#in-the-news'},
    journalLead && {k: 'The Journal', t: journalLead.title, href: '#journal'},
    local[0] && {k: 'The Local Edit', t: `${local[0].name}, ${local[0].neighborhood}`, href: '#local-edit'},
  ].filter(Boolean);

  // Contents and section numbers follow what is actually on the page.
  const sections = [
    agenda.length > 0 && {id: 'agenda', name: 'The Agenda', note: `${agenda.length} dates in the next weeks`},
    news.length > 0 && {id: 'in-the-news', name: 'In the News', note: 'The culture desk, Barcelona and Spain'},
    journalLead && {id: 'journal', name: 'The Journal', note: 'Field notes from the Sotabosc desk'},
    showcase.length > 0 && {id: 'showcase', name: 'Exhibition & Artist', note: 'Shows on now, people making the city'},
    local.length > 0 && {id: 'local-edit', name: 'The Local Edit', note: 'Places worth sitting in'},
    {id: 'magazine', name: 'The Magazine', note: magazine ? `${magazine.issue} is out now` : 'Screens, digital, print'},
  ]
    .filter(Boolean)
    .map((s, i) => ({...s, n: String(i + 1).padStart(2, '0')}));
  const num = (id) => sections.find((s) => s.id === id)?.n ?? '';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: 'Sotabosc',
        url: 'https://sotabosc.world/',
        description:
          'Culture, art and creative life — wherever you are. Barcelona cultural channel and magazine edition.',
      },
      {
        '@type': 'Organization',
        name: 'Sotabosc',
        url: 'https://sotabosc.world/',
        description:
          'Local cultural channel with magazine sensibility — screens, digital, print.',
      },
    ],
  };

  return (
    <div className="edition">
      <JsonLd data={jsonLd} />

      {/* ── Cover ── */}
      <header className="ed-cover">
        <EditionFig
          src={leadImage}
          fallbackSrc={rubriqueStockImageUrl(
            isEventFeatured ? 'art' : 'culture',
            featured?.slug || featured?.id || 'lead',
          )}
          figClass="ed-cover-fig"
          emptyClass="ed-cover-fig ed-cover-fig--empty"
          fallback={null}
          loading="eager"
        />
        <div className="ed-cover-inner">
          <div className="ed-cover-strip">
            <span>{edition.editionLabel}</span>
            <span>No. {edition.issueNumeral}</span>
          </div>
          <h1 className="ed-nameplate">Sotabosc</h1>
          <p className="ed-cover-tag">Culture, art and creative life, wherever you are.</p>

          <div className="ed-cover-foot">
            <Link to={leadHref} className="ed-cover-lead">
              <span className="ed-kicker ed-kicker--lime">
                {isEventFeatured ? 'Cover story · The Exhibition' : 'Cover story'}
              </span>
              <h2 className="ed-u">{leadTitle}</h2>
              <p>{leadDek}</p>
            </Link>
            {coverLines.length > 0 ? (
              <ul className="ed-cover-lines">
                {coverLines.map((line) => (
                  <li key={line.k}>
                    <a href={line.href}>
                      <span>{line.k}</span>
                      {line.t}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </header>

      {/* ── Contents ── */}
      <nav className="ed-contents" aria-label="In this edition">
        <div className="ed-contents-head">
          <h2>
            In this <em>edition</em>
          </h2>
          <p>
            Pulled each day from the city directory: {edition.totals.places} places,{' '}
            {edition.totals.events} events and {edition.totals.creators} creators.
          </p>
        </div>
        <ol>
          {sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`}>
                <span className="ed-contents-n">{s.n}</span>
                <span className="ed-contents-name">{s.name}</span>
                <span className="ed-contents-note">{s.note}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* ── The Agenda ── */}
      {agenda.length > 0 ? (
        <section className="ed-sec" id="agenda">
          <RunningHead n={num('agenda')} name="The Agenda" edition={monthLabel} />
          <div className="ed-sec-title">
            <h2>
              What’s <em>on</em>
            </h2>
            <Link to="/city/events" className="ed-more">
              Full calendar →
            </Link>
          </div>
          <ol className="ed-agenda">
            {agenda.map((ev) => {
              // Shows already running read "Until <end>", not a past start date.
              const running = ev.endsAt && Date.parse(ev.startsAt) < Date.now();
              const d = splitDate(running ? ev.endsAt : ev.startsAt);
              return (
                <li key={ev.id}>
                  <Link to={`/city/events/${ev.slug}`} className="ed-agenda-row">
                    <span className="ed-agenda-date">
                      {running ? <i>Until</i> : null}
                      <b>{d.day}</b>
                      {d.mon}
                    </span>
                    <span className="ed-agenda-body">
                      <span className="ed-agenda-title ed-u">{ev.title}</span>
                      <span className="ed-agenda-venue">
                        {ev.placeName || ev.place?.name || 'Barcelona'}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}

      {/* ── In the News ── */}
      {news.length > 0 ? (
        <section className="ed-sec" id="in-the-news">
          <RunningHead n={num('in-the-news')} name="In the News" edition={monthLabel} />
          <div className="ed-sec-title">
            <h2>
              In the <em>News</em>
            </h2>
            <span className="ed-more ed-more--plain">Art, music, film, design</span>
          </div>
          <div className="ed-news">
            <a href={news[0].url} className="ed-news-lead" target="_blank" rel="noopener noreferrer">
              <EditionFig
                src={news[0].imageUrl}
                fallbackSrc={rubriqueStockImageUrl(news[0].rubrique, news[0].id || news[0].title)}
                figClass="ed-fig ed-fig--wide"
                emptyClass="ed-fig ed-fig--wide ed-fig--empty"
                fallback={news[0].rubrique?.slice(0, 1)?.toUpperCase() || '·'}
              />
              <span className="ed-kicker">{news[0].rubrique}</span>
              <h3 className="ed-u">{news[0].title}</h3>
              <p className="ed-meta">
                {news[0].publisher}
                {news[0].publishedAt ? ` · ${formatEditionDate(news[0].publishedAt)}` : ''}
              </p>
            </a>
            <ol className="ed-briefs">
              {news.slice(1, 7).map((story, i) => (
                <li key={story.id}>
                  <a href={story.url} target="_blank" rel="noopener noreferrer">
                    <span className="ed-briefs-n">{String(i + 2).padStart(2, '0')}</span>
                    <span>
                      <span className="ed-kicker">{story.rubrique}</span>
                      <span className="ed-briefs-title ed-u">{story.title}</span>
                      <span className="ed-meta">{story.publisher}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {/* ── Pull quote ── */}
      {/* Not <aside>: app.css styles every aside as the off-canvas drawer. */}
      <figure className="ed-quote">
        <blockquote>
          <p>
            “Culture as atmosphere, <em>the host as setting.</em>”
          </p>
        </blockquote>
        <figcaption>The Sotabosc idea, in one line</figcaption>
      </figure>

      {/* ── The Journal: lead article as a feature ── */}
      {journalLead ? (
        <section className="ed-sec" id="journal">
          <RunningHead n={num('journal')} name="The Journal" edition={monthLabel} />
          <article className="ed-feature">
            <Link
              to={`/blogs/${journalLead.blogHandle}/${journalLead.handle}`}
              className="ed-feature-fig-link"
              prefetch="intent"
            >
              <EditionFig
                src={journalLead.imageUrl}
                fallbackSrc={journalStockImageUrl(journalLead.handle || journalLead.id || journalLead.title)}
                figClass="ed-fig ed-fig--feature"
                emptyClass="ed-fig ed-fig--feature ed-fig--empty"
              />
            </Link>
            <div className="ed-feature-text">
              <span className="ed-kicker">Feature · From the Journal</span>
              <h2>
                <Link to={`/blogs/${journalLead.blogHandle}/${journalLead.handle}`} className="ed-u">
                  {journalLead.title}
                </Link>
              </h2>
              {journalLead.excerpt ? (
                <p className="ed-standfirst">
                  {journalLead.excerpt.trim()}
                  {/[.!?…”"]$/.test(journalLead.excerpt.trim()) ? '' : '…'}
                </p>
              ) : null}
              <p className="ed-meta">
                Sotabosc Editorial
                {journalLead.publishedAt ? ` · ${formatEditionDate(journalLead.publishedAt)}` : ''}
              </p>
              <Link
                to={`/blogs/${journalLead.blogHandle}/${journalLead.handle}`}
                className="ed-more"
              >
                Read the story →
              </Link>
              {journalRest.length > 0 ? (
                <div className="ed-also">
                  <span className="ed-kicker">Also in the journal</span>
                  {journalRest.map((a) => (
                    <Link key={a.id} to={`/blogs/${a.blogHandle}/${a.handle}`} prefetch="intent">
                      <span className="ed-u">{a.title}</span>
                    </Link>
                  ))}
                  <Link to="/blogs/news" className="ed-more">
                    All reports →
                  </Link>
                </div>
              ) : null}
            </div>
          </article>
        </section>
      ) : null}

      {/* ── Exhibition & Artist: one large, two small ── */}
      {showcase.length > 0 ? (
        <section className="ed-sec" id="showcase">
          <RunningHead n={num('showcase')} name="Exhibition & Artist" edition={monthLabel} />
          <div className="ed-sec-title">
            <h2>
              On the <em>walls</em>
            </h2>
            <span className="ed-more-group">
              <Link to="/city?cat=art-gallery" className="ed-more">
                Galleries →
              </Link>
              <Link to="/city/creators" className="ed-more">
                Creators →
              </Link>
            </span>
          </div>
          <div className="ed-showcase">
            {showcase.map((item, i) => (
              <Link
                key={item.id}
                to={item.href}
                className={i === 0 ? 'ed-show ed-show--big' : 'ed-show'}
              >
                <EditionFig
                  src={item.src}
                  fallbackSrc={item.fallbackSrc}
                  figClass="ed-fig"
                  emptyClass="ed-fig ed-fig--empty"
                  fallback={item.mark}
                />
                <span className="ed-show-text">
                  <span className="ed-kicker">{item.rubrique}</span>
                  <span className="ed-show-title ed-u">{item.title}</span>
                  {item.copy ? <span className="ed-show-copy">{item.copy}</span> : null}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* ── The Local Edit: photo strip + numbered guide ── */}
      {local.length > 0 ? (
        <section className="ed-sec" id="local-edit">
          <RunningHead n={num('local-edit')} name="The Local Edit" edition={monthLabel} />
          <div className="ed-sec-title">
            <h2>
              The Local <em>Edit</em>
            </h2>
            <Link to="/city" className="ed-more">
              Full directory →
            </Link>
          </div>
          <div className="ed-strip" aria-hidden="true">
            {local.slice(0, 4).map((p) => (
              <EditionFig
                key={p.id}
                src={p.imageUrl}
                figClass="ed-fig"
                emptyClass="ed-fig ed-fig--empty"
                fallback={p.name.slice(0, 1)}
              />
            ))}
          </div>
          <ol className="ed-guide">
            {local.map((p, i) => (
              <li key={p.id}>
                <Link to={`/city/places/${p.slug}`}>
                  <span className="ed-guide-n">{i + 1}</span>
                  <span>
                    <span className="ed-guide-name ed-u">{p.name}</span>
                    <span className="ed-kicker">{p.neighborhood}</span>
                    {p.summary ? <span className="ed-guide-sum">{p.summary}</span> : null}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {/* ── The Magazine + deliveries ── */}
      <section className="ed-mag" id="magazine">
        <div className="ed-mag-inner">
          <RunningHead n={num('magazine')} name="The Magazine" edition={monthLabel} />
          <div className="ed-mag-grid">
            {magazine ? (
              <Link to={`/magazine/${magazine.slug}`} className="ed-mag-cover" aria-label={`Read ${magazine.title}`}>
                <div
                  className="ed-mag-page"
                  // Built from our own canvas files by scripts/build-magazine-issue.mjs, which rejects any script.
                  dangerouslySetInnerHTML={{__html: magazine.coverHtml}}
                />
              </Link>
            ) : null}
            <div className="ed-mag-text">
              <span className="ed-kicker ed-kicker--lime">
                {magazine ? `${magazine.issue} · ${magazine.date}` : 'The magazine'}
              </span>
              <h2>
                One channel. <em>Three deliveries.</em>
              </h2>
              {magazine ? <p className="ed-standfirst">{magazine.description}</p> : null}
              {magazine ? (
                <Link to={`/magazine/${magazine.slug}`} className="ed-btn">
                  Read the issue
                </Link>
              ) : null}
              <div className="ed-deliveries">
                <div>
                  <h3>Screens</h3>
                  <p>Sotabosc screens in hotels, galleries and cafés: culture as atmosphere.</p>
                  <Link to="/screens">See the screens</Link>
                </div>
                <div>
                  <h3>Digital</h3>
                  <p>This edition: the city directory, happenings and creators.</p>
                  <Link to="/city">Browse the city</Link>
                </div>
                <div>
                  <h3>Magazine</h3>
                  <p>A monthly issue, 16 pages: the city first, then the house.</p>
                  <Link to="/contact">Get one for your place</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="edition-foot">
        <div className="edition-foot-brand">Sotabosc</div>
        <nav className="edition-foot-links" aria-label="Edition footer">
          <Link to="/city">Directory</Link>
          <Link to="/city/events">Events</Link>
          <Link to="/city/creators">Creators</Link>
          <Link to="/screens">Screens</Link>
          <Link to="/magazine/no-0">Magazine</Link>
          <Link to="/how-it-works">About</Link>
          <Link to="/map">Living map</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/collections">Store</Link>
        </nav>
        <p className="edition-foot-note">
          {edition.totals.places} places · {edition.totals.events} events ·{' '}
          {edition.totals.creators} creators in the Barcelona edition archive.
        </p>
      </footer>
    </div>
  );
}

function formatEditionDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      timeZone: 'Europe/Madrid',
    });
  } catch {
    return '';
  }
}

function splitDate(iso) {
  const [day = '', mon = ''] = formatEditionDate(iso).split(' ');
  return {day, mon};
}
