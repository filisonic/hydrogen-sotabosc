/**
 * GoHighLevel booking embed (LeadConnector).
 * iframe when the calendar allows embedding; otherwise opens GHL in a new tab.
 */
export function BookingWidget({widgetUrl, placeName, embedMode = 'iframe'}) {
  if (!widgetUrl) return null;

  const isExternal = embedMode === 'external';

  return (
    <section
      className="mb-8"
      aria-labelledby="sotabosc-booking-heading"
      data-testid="ghl-booking-widget"
      data-embed-mode={embedMode}
    >
      <h2
        id="sotabosc-booking-heading"
        className="text-xl font-bold mb-1 font-[family-name:var(--font-display)]"
      >
        Book a visit
      </h2>
      <p className="text-sm mb-4" style={{color: 'var(--sotabosc-muted)'}}>
        Request a time at {placeName}. The venue receives your details — no payment
        required.
      </p>

      {isExternal ? (
        <div
          className="rounded-2xl border p-6 sm:p-8"
          style={{
            backgroundColor: 'var(--sotabosc-surface)',
            borderColor: 'var(--sotabosc-border)',
          }}
        >
          <p className="text-sm mb-5 max-w-xl" style={{color: 'var(--sotabosc-muted)'}}>
            Pick a date and time on our booking page. It opens in a new tab so your
            details go straight to the venue.
          </p>
          <a
            href={widgetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center text-sm font-bold px-6 py-3 rounded-full transition-opacity hover:opacity-90"
            style={{
              backgroundColor: 'var(--sotabosc-accent)',
              color: 'var(--sotabosc-surface)',
            }}
          >
            Open booking calendar
          </a>
        </div>
      ) : (
        <div
          className="rounded-2xl border overflow-hidden"
          style={{
            backgroundColor: 'var(--sotabosc-surface)',
            borderColor: 'var(--sotabosc-border)',
          }}
        >
          <iframe
            src={widgetUrl}
            title={`Book at ${placeName}`}
            className="w-full border-0 block"
            style={{minHeight: '640px'}}
            loading="lazy"
            allow="clipboard-read; clipboard-write"
          />
        </div>
      )}
    </section>
  );
}
