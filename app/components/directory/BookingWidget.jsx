/**
 * GoHighLevel booking embed (LeadConnector iframe).
 * Free tier: lead notifications only — no Stripe on Sotabosc.
 */
export function BookingWidget({widgetUrl, placeName}) {
  if (!widgetUrl) return null;

  return (
    <section
      className="mb-8"
      aria-labelledby="sotabosc-booking-heading"
      data-testid="ghl-booking-widget"
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
    </section>
  );
}
