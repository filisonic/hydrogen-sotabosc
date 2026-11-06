import {Link} from 'react-router';
import {JsonLd} from '~/components/seo/JsonLd';

/**
 * Sotabosc TV digital magazine / channel edition homepage.
 * Modern hybrid: Fashion Front masthead + Broadsheet Lite front page.
 * Living map lives on `/map`.
 * @param {{ edition: import('~/lib/directory/editionWindow').EditionWindow }} props
 */
export function EditionHome({edition}) {
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
  const leadImage =
    featured && 'imageUrl' in featured ? featured.imageUrl : null;

  const frontHeadlines = edition.happening.slice(0, 6);
  const frontThumbs = edition.localEdit.slice(0, 4);

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

      <header className="edition-mast">
        <div className="edition-mast-numeral" aria-hidden="true">
          {edition.issueNumeral || '11'}
        </div>
        <p className="edition-issue">
          <span className="edition-issue-accent">{edition.editionLabel}</span>
          <span aria-hidden="true">·</span>
          <span>Cultural window · {edition.windowDays}d</span>
        </p>
        <h1 className="edition-brand">
          Sotabosc<em>TV</em>
        </h1>
        <p className="edition-dek">
          Culture, art and creative life — wherever you are. An intelligent local
          cultural channel with the visual language of a magazine.
        </p>
        <div className="edition-mast-actions">
          <Link to="/city/events" className="edition-cta">
            This week in the city
          </Link>
          <Link to="/map" className="edition-cta edition-cta-ghost">
            Living map
          </Link>
        </div>
      </header>

      <nav className="edition-rail" aria-label="Edition rubriques">
        <a href="#front">Front</a>
        <a href="#exhibition">The Exhibition</a>
        <a href="#artist">The Artist</a>
        <a href="#local-edit">The Local Edit</a>
        <a href="#delivery">Screens · Digital · Print</a>
        <Link to="/city">Directory</Link>
        <Link to="/map">Living map</Link>
      </nav>

      <section className="edition-front" id="front" aria-label="Edition front page">
        <div className="edition-front-headlines">
          <span className="edition-front-col-label">
            <span>Happening</span>
          </span>
          {frontHeadlines.length > 0 ? (
            frontHeadlines.map((ev) => (
              <Link
                key={ev.id}
                to={`/city/events/${ev.slug}`}
                className="edition-headline"
              >
                <span className="edition-headline-date">
                  {formatEditionDate(ev.startsAt)}
                </span>
                <h2 className="edition-headline-title">{ev.title}</h2>
                <p className="edition-headline-meta">
                  {ev.placeName || ev.place?.name || 'Barcelona'}
                </p>
              </Link>
            ))
          ) : (
            <p className="edition-sec-note">No dated events in this window yet.</p>
          )}
          <Link to="/city/events" className="edition-front-more">
            Full calendar →
          </Link>
        </div>

        <Link to={leadHref} className="edition-front-lead edition-lead">
          <div
            className={
              leadImage
                ? 'edition-lead-fig'
                : 'edition-lead-fig edition-lead-fig--empty'
            }
          >
            {leadImage ? (
              <img src={leadImage} alt="" />
            ) : (
              'S'
            )}
          </div>
          <span className="edition-lead-kicker">
            {isEventFeatured ? 'The Exhibition' : 'Lead'}
          </span>
          <h2 className="edition-lead-title">{leadTitle}</h2>
          <p className="edition-lead-dek">{leadDek}</p>
        </Link>

        <div className="edition-front-thumbs">
          <span className="edition-front-col-label">
            <span>Local Edit</span>
          </span>
          {frontThumbs.length > 0 ? (
            frontThumbs.map((p) => (
              <Link
                key={p.id}
                to={`/city/places/${p.slug}`}
                className="edition-thumb"
              >
                <div className="edition-thumb-fig">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt="" loading="lazy" />
                  ) : null}
                </div>
                <div>
                  <span className="edition-thumb-hood">{p.neighborhood}</span>
                  <h3 className="edition-thumb-name">{p.name}</h3>
                </div>
              </Link>
            ))
          ) : (
            <p className="edition-sec-note">Places will appear as the directory fills.</p>
          )}
          <Link to="/city" className="edition-front-more">
            Full directory →
          </Link>
        </div>
      </section>

      {edition.exhibitions.length > 0 ? (
        <section className="edition-sec" id="exhibition">
          <div className="edition-sec-head">
            <h2 className="edition-sec-label">
              The <span>Exhibition</span>
            </h2>
            <Link to="/city?cat=art-gallery" className="edition-sec-link">
              Galleries →
            </Link>
          </div>
          <p className="edition-sec-note">
            What’s on nearby — shows, openings, installations.
          </p>
          <div className="edition-media">
            {edition.exhibitions.slice(0, 3).map((ev) => (
              <Link
                key={ev.id}
                to={`/city/events/${ev.slug}`}
                className="edition-media-card"
              >
                <div
                  className={
                    ev.imageUrl
                      ? 'edition-media-fig'
                      : 'edition-media-fig edition-media-fig--empty'
                  }
                >
                  {ev.imageUrl ? (
                    <img src={ev.imageUrl} alt="" loading="lazy" />
                  ) : (
                    'Ex'
                  )}
                </div>
                <span className="edition-media-rubrique">The Exhibition</span>
                <h3 className="edition-media-title">{ev.title}</h3>
                <p className="edition-media-copy">
                  {ev.placeName || ev.summary?.slice(0, 110)}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {edition.artists.length > 0 ? (
        <section className="edition-sec" id="artist">
          <div className="edition-sec-head">
            <h2 className="edition-sec-label">
              The <span>Artist</span>
            </h2>
            <Link to="/city/creators" className="edition-sec-link">
              All creators →
            </Link>
          </div>
          <p className="edition-sec-note">
            Short portraits from the network — people making the city.
          </p>
          <div className="edition-media">
            {edition.artists.slice(0, 3).map((c) => (
              <Link
                key={c.id}
                to={`/city/creators/${c.slug}`}
                className="edition-media-card"
              >
                <div
                  className={
                    c.imageUrl
                      ? 'edition-media-fig'
                      : 'edition-media-fig edition-media-fig--empty'
                  }
                >
                  {c.imageUrl ? (
                    <img src={c.imageUrl} alt="" loading="lazy" />
                  ) : (
                    c.displayName.slice(0, 1)
                  )}
                </div>
                <span className="edition-media-rubrique">The Artist</span>
                <h3 className="edition-media-title">{c.displayName}</h3>
                <p className="edition-media-copy">{c.bio?.slice(0, 140)}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {edition.localEdit.length > 0 ? (
        <section className="edition-sec" id="local-edit">
          <div className="edition-sec-head">
            <h2 className="edition-sec-label">
              The Local <span>Edit</span>
            </h2>
            <Link to="/city" className="edition-sec-link">
              Full directory →
            </Link>
          </div>
          <p className="edition-sec-note">
            Curated places — galleries, design-led cafés, workshops, shops.
            Atmosphere over inventory.
          </p>
          <div className="edition-places">
            {edition.localEdit.map((p) => (
              <Link
                key={p.id}
                to={`/city/places/${p.slug}`}
                className="edition-place"
              >
                <div className="edition-place-fig">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt="" loading="lazy" />
                  ) : null}
                </div>
                <span className="edition-place-hood">{p.neighborhood}</span>
                <h3 className="edition-place-name">{p.name}</h3>
                <p className="edition-place-sum">{p.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="edition-delivery" id="delivery">
        <div className="edition-delivery-inner">
          <div className="edition-delivery-intro">
            <h2>One channel. Three deliveries.</h2>
            <p>
              Same editorial spine whether it hangs in a lobby, opens in a
              browser, or lands as a printed issue later.
            </p>
          </div>
          <div className="edition-delivery-item">
            <h3>Screens</h3>
            <p>
              Sotabosc TV in boutique hotels, galleries, cafés — culture as
              atmosphere, host as setting.
            </p>
            <Link to="/screens">See the screens</Link>
          </div>
          <div className="edition-delivery-item">
            <h3>Digital</h3>
            <p>
              This edition: city directory, happenings, creators — magazine
              pages, not lobby signage.
            </p>
            <Link to="/city">Browse the city</Link>
          </div>
          <div className="edition-delivery-item">
            <h3>Print</h3>
            <p>
              Seasonal folio / object — same rubriques, tactile. Coming after
              the channel is proven in space.
            </p>
            <Link to="/contact">Talk to us</Link>
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
