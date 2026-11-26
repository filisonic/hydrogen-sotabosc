import {useEffect, useRef, useState} from 'react';
import {Link, useLoaderData} from 'react-router';
import {canonicalLinkMeta} from '~/lib/seo/metaHelpers';
import magazineStyles from '~/styles/magazine.css?url';

const PAGE_W = 840;
const PAGE_H = 1188;

export const links = () => [{rel: 'stylesheet', href: magazineStyles}];

export const meta = ({data}) =>
  data?.issue
    ? [
        {title: `${data.issue.title} | Sotabosc`},
        {name: 'description', content: data.issue.description},
        {property: 'og:title', content: data.issue.title},
        {property: 'og:description', content: data.issue.description},
        {property: 'og:type', content: 'article'},
        ...canonicalLinkMeta(data.origin, `/magazine/${data.issue.slug}`),
      ]
    : [{title: 'Issue not found | Sotabosc'}];

/** @param {import('react-router').LoaderFunctionArgs} args */
export async function loader({params, request}) {
  const {getIssue} = await import('~/lib/magazine/issues.server');
  const issue = getIssue(params.issue);
  if (!issue) throw new Response('Issue not found', {status: 404});
  return {issue, origin: new URL(request.url).origin};
}

/** Pages as a printed magazine pairs them: the cover alone, then spreads, the back cover alone. */
function toSpreads(pages) {
  const spreads = [[pages[0]]];
  for (let i = 1; i < pages.length - 1; i += 2) spreads.push(pages.slice(i, Math.min(i + 2, pages.length - 1)));
  if (pages.length > 1) spreads.push([pages[pages.length - 1]]);
  return spreads;
}

/** One A4 page drawn at its designed size and scaled to the width it is given. */
function Sheet({page, number, onOpen}) {
  const ref = useRef(null);
  const [scale, setScale] = useState(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / PAGE_W));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="magz-sheet" aria-label={`Page ${number}: ${page.title}`}>
      <div ref={ref} className="magz-sheet__frame" style={{aspectRatio: `${PAGE_W} / ${PAGE_H}`}}>
        <div
          className="magz-page"
          data-page={page.id}
          // Hidden until measured, so the server render never flashes a half-size page.
          style={{
            width: PAGE_W,
            height: PAGE_H,
            transform: `scale(${scale ?? 1})`,
            visibility: scale === null ? 'hidden' : 'visible',
          }}
          // Built from our own canvas files by scripts/build-magazine-issue.mjs, which rejects any script.
          dangerouslySetInnerHTML={{__html: page.html}}
        />
      </div>
      <div className="magz-sheet__foot">
        <span>{String(number).padStart(2, '0')}</span>
        <button type="button" className="magz-sheet__zoom" onClick={() => onOpen(number - 1)}>
          Read full size
        </button>
      </div>
    </section>
  );
}

export default function MagazineIssue() {
  const {issue} = useLoaderData();
  const dialogRef = useRef(null);
  const [open, setOpen] = useState(null);
  const numbered = issue.pages.map((page, i) => ({page, number: i + 1}));
  const spreads = toSpreads(numbered);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open !== null && !dialog.open) dialog.showModal();
    if (open === null && dialog.open) dialog.close();
  }, [open]);

  const openPage = open === null ? null : issue.pages[open];

  return (
    <div className="magz">
      <header className="magz-head">
        <Link to="/" className="magz-head__back">
          ← Sotabosc
        </Link>
        <div className="magz-head__title">
          <span className="magz-head__kicker">The magazine · {issue.date}</span>
          <h1>{issue.title}</h1>
          <p>{issue.description}</p>
        </div>
      </header>

      <div className="magz-spreads">
        {spreads.map((spread) => (
          <div key={spread[0].page.id} className={`magz-spread${spread.length === 1 ? ' magz-spread--single' : ''}`}>
            {spread.map(({page, number}) => (
              <Sheet key={page.id} page={page} number={number} onOpen={setOpen} />
            ))}
          </div>
        ))}
      </div>

      <footer className="magz-foot">
        <p>Want a channel and a magazine of your own?</p>
        <Link to="/contact" className="mag-btn">
          Talk to us
        </Link>
        <Link to="/tv" className="mag-btn-o">
          About Sotabosc TV
        </Link>
      </footer>

      <dialog ref={dialogRef} className="magz-dialog" onClose={() => setOpen(null)} aria-label="Page at full size">
        {openPage ? (
          <>
            <div className="magz-dialog__bar">
              <button type="button" onClick={() => setOpen(Math.max(0, open - 1))} disabled={open === 0}>
                ← Previous
              </button>
              <span>
                Page {open + 1} of {issue.pages.length}
              </span>
              <button
                type="button"
                onClick={() => setOpen(Math.min(issue.pages.length - 1, open + 1))}
                disabled={open === issue.pages.length - 1}
              >
                Next →
              </button>
              <button type="button" onClick={() => setOpen(null)}>
                Close
              </button>
            </div>
            <div className="magz-dialog__scroll">
              <div
                className="magz-page magz-page--full"
                data-page={openPage.id}
                style={{width: PAGE_W, height: PAGE_H}}
                dangerouslySetInnerHTML={{__html: openPage.html}}
              />
            </div>
          </>
        ) : null}
      </dialog>
    </div>
  );
}
