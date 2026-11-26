import {Link, useLoaderData} from 'react-router';
import {canonicalLinkMeta} from '~/lib/seo/metaHelpers';
import editionStyles from '~/styles/edition.css?url';

/**
 * Sotabosc TV: the screen channel explained for venues (hotels, cultural centres, workspaces).
 * Copy follows the Sotabosc TV value proposition (living-wall/docs); prices follow magazine page 14.
 */
export const links = () => [{rel: 'stylesheet', href: editionStyles}];

export const meta = ({data}) => [
  {title: 'Sotabosc TV — your screens become Barcelona’s cultural channel'},
  {
    name: 'description',
    content:
      'A living TV channel with the look of a fine magazine for your lobby, bar or foyer. Barcelona’s culture, art and events, with your own programme woven in. It programmes itself, every day.',
  },
  {property: 'og:title', content: 'Sotabosc TV'},
  {
    property: 'og:description',
    content: 'Not signage. Not someone else’s TV. A cultural channel for the rooms where people linger.',
  },
  ...canonicalLinkMeta(data?.origin, '/tv'),
];

/** @param {import('react-router').LoaderFunctionArgs} args */
export async function loader({context, request}) {
  const {ISSUES} = await import('~/lib/magazine/issues.server');
  const latest = ISSUES[ISSUES.length - 1];
  const magazine = latest
    ? {slug: latest.slug, title: latest.title, issue: latest.issue, coverHtml: latest.pages[0].html}
    : null;

  // The screen mock shows what a screen would air today; empty is fine.
  let onAir = {lead: null, next: []};
  try {
    const {getCityDirectory} = await import('~/lib/directory/source.server');
    const {buildEditionWindow} = await import('~/lib/directory/editionWindow');
    const {places, events, creators} = await getCityDirectory(context);
    const edition = buildEditionWindow(places, events, creators);
    const withImage = [...edition.exhibitions, ...edition.happening].find((e) => e.imageUrl);
    onAir = {
      lead: withImage
        ? {title: withImage.title, venue: withImage.placeName || withImage.place?.name || 'Barcelona', imageUrl: withImage.imageUrl}
        : null,
      next: edition.happening.slice(0, 3).map((e) => ({id: e.id, title: e.title, venue: e.placeName || e.place?.name || ''})),
    };
  } catch {
    // Directory unavailable: the mock falls back to its static frame.
  }

  return {magazine, onAir, origin: new URL(request.url).origin};
}

const ON_SCREEN = [
  {t: 'Best of the Week', d: 'The week’s best, as a magazine cover.'},
  {t: 'What’s on', d: 'Concerts, exhibitions and talks in the city, today and this week.'},
  {t: 'The city as a spread', d: 'Barcelona’s landmarks and streets, laid out like a feature.'},
  {t: 'Art from public collections', d: 'Works from museums and archives, with their stories.'},
  {t: 'Did you know', d: 'Short stories about the city, its places and its people.'},
];

const AUDIENCES = [
  {
    name: 'Hotels',
    items: [
      ['A lobby that feels like a destination', 'The screen becomes part of the interior, in a look chosen for your brand.'],
      ['A concierge that never sleeps', 'Guests discover concerts, exhibitions and places nearby, in English, Spanish and Catalan.'],
      ['Your venues, recommended', 'Restaurant, bar, spa and events appear in the same magazine voice, so guests notice them.'],
      ['Your guests’ best words', 'Five-star reviews, shown with pride.'],
    ],
  },
  {
    name: 'Cultural centres',
    items: [
      ['Your programme, always current', 'Exhibitions, talks and performances, laid out like a magazine.'],
      ['Visitors leave knowing what’s next', 'Here, and in the city’s cultural life around you.'],
      ['Artists and collections in the spotlight', 'With a QR code to learn more or buy a ticket.'],
      ['Part of the city’s network', 'Venues that recommend each other, across Barcelona.'],
    ],
  },
  {
    name: 'Coworking and studios',
    items: [
      ['Members in the spotlight', 'A launch, a milestone, a new face in the space, shown like a magazine feature.'],
      ['Your programme, always visible', 'Workshops, talks, demo days and open calls, with a QR code to sign up.'],
      ['A front door that sells the community', 'Visitors see a living space, not a list of desks and prices.'],
      ['Collaboration with other spaces', 'A network of coworkings, studios and venues that promote each other’s events.'],
    ],
  },
];

const COMPARE = {
  cols: ['A TV channel', 'Digital signage', 'Ad-funded screens', 'Sotabosc TV'],
  rows: [
    ['What guests see', 'Someone else’s programme', 'Your slides on a loop', 'Content broken up by other brands’ ads', 'Culture, art and your city, with you woven in'],
    ['Keeping it fresh', 'Fresh, never about you', 'Your team, forever', 'Fresh, but generic', 'New every day, by itself'],
    ['Fits your brand', 'No', 'If you design it', 'No', 'Your look, fonts and colours'],
    ['Local', 'No', 'Only what you add', 'Rarely', 'Barcelona’s events, places and people'],
    ['Other brands’ ads', 'Yes', 'No', 'Yes, that’s the model', 'Only if you choose; never a competitor'],
  ],
};

const STEPS = [
  ['We install it', 'A small player behind your screen, or a professional screen from us. It keeps playing even if the internet drops.'],
  ['We set up your channel together', 'Your look, what airs, how much is about you, and which neighbours may appear.'],
  ['It runs itself', 'Every day it mixes new events, stories and art with your programme. You talk to it on Telegram.'],
];

const PROMISES = [
  'Everything you send is checked by a person before it airs.',
  'No politics, crime or bad news. Ever.',
  'Your competitors never appear on your screens.',
  'No cameras, no tracking of your guests.',
  'We look after the hardware and the updates.',
  'Your photos and content stay yours.',
];

const PLANS = [
  {
    name: 'Channel',
    price: '€129',
    list: 'Founding price · then €199 / month',
    setup: 'Setup €250 · screens separate',
    items: ['Up to 2 screens', 'The channel and every format', 'Your house slots and the Local Edit for your street', 'A monthly programme report'],
    dark: true,
  },
  {
    name: 'Curated',
    price: '€229',
    list: 'Founding price · then €399 / month',
    setup: 'Setup €400 · screens separate',
    items: ['Up to 8 screens', 'Your own monthly magazine, 16 pages', 'A fully customisable programme menu', 'Everything in Channel'],
  },
];

function RunningHead({n, name}) {
  return (
    <div className="ed-rh">
      <span>
        <b>{n}</b> · {name}
      </span>
      <span>Sotabosc TV</span>
    </div>
  );
}

export default function SotaboscTv() {
  const {magazine, onAir} = useLoaderData();

  return (
    <div className="edition tv">
      {/* ── Cover ── */}
      <header className="tv-cover">
        <div className="tv-cover-inner">
          <div className="tv-cover-text">
            <span className="ed-kicker ed-kicker--lime">Sotabosc TV · for hotels, cultural centres and workspaces</span>
            <h1>
              Your screens become <em>Barcelona’s cultural channel.</em>
            </h1>
            <p className="tv-cover-dek">
              A living TV channel with the look of a fine magazine, made for your lobby, bar or foyer. The best
              of the city’s culture, art and events, with your own programme woven in like a recommendation, not
              an advert. It programmes itself, every day.
            </p>
            <div className="tv-actions">
              <Link to="/contact" className="ed-btn">
                Try it free for 14 days
              </Link>
              <Link to="/screens" className="tv-link">
                See a screen live →
              </Link>
            </div>
          </div>

          <figure className="tv-screen" aria-label="What a Sotabosc TV screen shows">
            <div className="tv-screen-panel">
              {onAir.lead ? <img src={onAir.lead.imageUrl} alt="" referrerPolicy="no-referrer" /> : null}
              <div className="tv-screen-shade" />
              <div className="tv-screen-copy">
                <span className="tv-screen-kicker">Best of the week</span>
                <span className="tv-screen-title">{onAir.lead?.title ?? 'What’s on in Barcelona'}</span>
                <span className="tv-screen-venue">{onAir.lead?.venue ?? 'Culture, art and events, every day'}</span>
              </div>
              <span className="tv-screen-mark">Sotabosc TV</span>
            </div>
            {onAir.next.length > 0 ? (
              <div className="tv-screen-ticker">
                <span>Next</span>
                {onAir.next.map((e) => (
                  <span key={e.id}>{e.title}</span>
                ))}
              </div>
            ) : null}
            <figcaption>Today’s programme, from the city directory</figcaption>
          </figure>
        </div>
      </header>

      {/* ── The problem ── */}
      <figure className="ed-quote">
        <blockquote>
          <p>
            “Our lobby screen shows the same slides it showed last month. <em>Guests walk straight past it.</em>”
          </p>
        </blockquote>
        <figcaption>The problem we hear most, and nobody on the team has time to fix it</figcaption>
      </figure>

      {/* ── On screen ── */}
      <section className="ed-sec">
        <RunningHead n="01" name="On screen" />
        <div className="ed-sec-title">
          <h2>
            What your guests <em>see</em>
          </h2>
        </div>
        <div className="tv-two">
          <ol className="ed-guide tv-guide-1">
            {ON_SCREEN.map((f, i) => (
              <li key={f.t}>
                <div className="tv-guide-row">
                  <span className="ed-guide-n">{i + 1}</span>
                  <span>
                    <span className="ed-guide-name">{f.t}</span>
                    <span className="ed-guide-sum">{f.d}</span>
                  </span>
                </div>
              </li>
            ))}
          </ol>
          <div className="tv-aside">
            <p className="ed-standfirst">
              Plus <strong>your own programme</strong>: events, exhibitions, offers, posters, clips and five-star
              guest reviews, about a third of the screen time.
            </p>
            <p>
              Beyond culture, you choose the subjects your audience cares about: tech, business and the morning’s
              markets, community, sport, the arts. Fourteen looks to match your interior. Never the same thing
              twice in an hour.
            </p>
          </div>
        </div>
      </section>

      {/* ── What you get ── */}
      <section className="ed-sec">
        <RunningHead n="02" name="What you get" />
        <div className="ed-sec-title">
          <h2>
            Made for places where people <em>linger</em>
          </h2>
        </div>
        <div className="tv-audiences">
          {AUDIENCES.map((a) => (
            <div key={a.name} className="tv-audience">
              <h3>For {a.name.toLowerCase()}</h3>
              {a.items.map(([t, d]) => (
                <div key={t} className="tv-benefit">
                  <strong>{t}</strong>
                  <span>{d}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── Two promises in a dark band ── */}
      <section className="tv-band">
        <div className="tv-band-inner">
          <div>
            <span className="ed-kicker ed-kicker--lime">Written by people, not by AI</span>
            <p>
              Our editorial team writes and checks every story, caption and recommendation, in a consistent
              magazine voice. No machine-written filler.
            </p>
          </div>
          <div>
            <span className="ed-kicker ed-kicker--lime">Zero effort for your team</span>
            <p>
              Send a poster, photo or clip on Telegram and say when it should air, for example “every Friday
              evening this month”; it’s on screen after a quick check. With your permission, your social posts,
              website and blog news come in by themselves. Everything else programmes itself.
            </p>
          </div>
        </div>
      </section>

      {/* ── How it is different ── */}
      <section className="ed-sec">
        <RunningHead n="03" name="How it is different" />
        <div className="ed-sec-title">
          <h2>
            Not signage. <em>Not someone else’s TV.</em>
          </h2>
        </div>
        <div className="tv-table-wrap">
          <table className="tv-table">
            <thead>
              <tr>
                <th scope="col">
                  <span className="sr-only">Compared on</span>
                </th>
                {COMPARE.cols.map((c) => (
                  <th key={c} scope="col">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE.rows.map(([label, ...cells]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  {cells.map((c, i) => (
                    <td key={COMPARE.cols[i]}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── How it works + promises ── */}
      <section className="ed-sec">
        <RunningHead n="04" name="How it works" />
        <div className="tv-two">
          <div>
            <div className="ed-sec-title">
              <h2>
                Three steps, <em>then it runs itself</em>
              </h2>
            </div>
            <ol className="tv-steps">
              {STEPS.map(([t, d], i) => (
                <li key={t}>
                  <span className="tv-step-n">{i + 1}</span>
                  <span>
                    <strong>{t}</strong>
                    {d}
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <div className="tv-promises">
            <span className="ed-kicker">Our promises</span>
            <ul>
              {PROMISES.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── The monthly magazine ── */}
      <section className="ed-mag">
        <div className="ed-mag-inner">
          <RunningHead n="05" name="The monthly magazine" />
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
              <span className="ed-kicker ed-kicker--lime">With the Curated plan</span>
              <h2>
                Every month, <em>a magazine about you.</em>
              </h2>
              <p className="ed-standfirst">
                The channel becomes something you can hold. Each month our editors make a 16-page magazine about
                your venue: the people behind it, the month ahead, your neighbours and the best of the city. Your
                screens become part of a cultural publication with your name on it.
              </p>
              {magazine ? (
                <Link to={`/magazine/${magazine.slug}`} className="ed-btn">
                  Read issue {magazine.issue}
                </Link>
              ) : null}
              <div className="ed-deliveries">
                <div>
                  <h3>The people behind the place</h3>
                  <p>Portraits and short interviews with your team, chefs, artists and guests.</p>
                </div>
                <div>
                  <h3>Your month ahead</h3>
                  <p>Exhibitions, events and offers, laid out as a feature.</p>
                </div>
                <div>
                  <h3>Around the corner</h3>
                  <p>The shops, studios and places nearby worth a walk, and the city this month.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Membership ── */}
      <section className="ed-sec" id="membership">
        <RunningHead n="06" name="Membership" />
        <div className="ed-sec-title">
          <h2>
            You pay for <em>the channel</em>
          </h2>
          <span className="ed-more--plain">Founding members · first 10 venues · 12 months</span>
        </div>
        <div className="tv-plans">
          {PLANS.map((p) => (
            <div key={p.name} className={p.dark ? 'tv-plan tv-plan--dark' : 'tv-plan'}>
              <span className="ed-kicker">{p.name} · founding member</span>
              <span className="tv-plan-price">
                {p.price}
                <small> / month</small>
              </span>
              <span className="tv-plan-meta">{p.list}</span>
              <span className="tv-plan-meta">
                <strong>{p.setup}</strong>
              </span>
              <ul>
                {p.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <dl className="tv-extras">
          <div>
            <dt>Screens</dt>
            <dd>Professional 27-inch indoor, or high-brightness for outdoor. Bring your own to our spec, buy through us, or lease it into the monthly fee.</dd>
            <dd className="tv-extras-p">from €400 / €650</dd>
          </div>
          <div>
            <dt>More screens</dt>
            <dd>Beyond 2 on Channel or 8 on Curated.</dd>
            <dd className="tv-extras-p">Ask us</dd>
          </div>
          <div>
            <dt>Printed issues</dt>
            <dd>Your monthly magazine on paper, for tables, rooms and counters.</dd>
            <dd className="tv-extras-p">Per run</dd>
          </div>
        </dl>
        <p className="tv-note">Prices exclude VAT.</p>
      </section>

      {/* ── Trial ── */}
      <section className="tv-trial">
        <div className="tv-trial-inner">
          <h2>
            Try it free <em>for 14 days.</em>
          </h2>
          <p>
            Already have screens? We connect a player and run your own channel on them for 14 days, free. If it
            doesn’t make your space better, we take it away. No screens yet? We can supply them too.
          </p>
          <div className="tv-actions">
            <Link to="/contact" className="ed-btn">
              Talk to us
            </Link>
            <a href="mailto:hola@sotabosc.world" className="tv-link">
              hola@sotabosc.world
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
