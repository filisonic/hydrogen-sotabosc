import {Link} from 'react-router';
import {directoryRoutes} from '~/lib/directory/routes';
import {BOOKING_DEMO_PLACE_SLUG} from '~/lib/directory/booking';

const MOCK_SLOTS = ['Mon 10:00', 'Mon 14:30', 'Tue 11:00', 'Wed 16:00'];

/**
 * Sales preview for listings without an activated GHL calendar.
 * Shown on every place page except live-demo / onboarded calendars.
 */
export function BookingPreviewTeaser({placeName, isClaimed = false}) {
  return (
    <section
      className="mb-8"
      aria-labelledby="sotabosc-booking-preview-heading"
      data-testid="booking-preview-teaser"
    >
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <h2
          id="sotabosc-booking-preview-heading"
          className="text-xl font-bold font-[family-name:var(--font-display)]"
        >
          Booking on your page
        </h2>
        <span
          className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: 'var(--sotabosc-surface-muted)',
            color: 'var(--sotabosc-muted)',
          }}
        >
          Preview
        </span>
      </div>

      <p className="text-sm mb-4 max-w-2xl" style={{color: 'var(--sotabosc-muted)'}}>
        Visitors could pick a time at <strong style={{color: 'var(--sotabosc-text)'}}>{placeName}</strong>{' '}
        and you would get the lead — no payment on the directory. Activate your listing to
        connect your own calendar.
      </p>

      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          backgroundColor: 'var(--sotabosc-surface)',
          borderColor: 'var(--sotabosc-border)',
        }}
      >
        <div
          className="px-4 py-3 border-b text-xs font-bold uppercase tracking-wide"
          style={{
            borderColor: 'var(--sotabosc-border)',
            color: 'var(--sotabosc-muted)',
            backgroundColor: 'var(--sotabosc-surface-muted)',
          }}
        >
          Example — not live for this venue
        </div>

        <div className="p-4 sm:p-6 pointer-events-none select-none" aria-hidden="true">
          <p className="text-sm font-semibold mb-3" style={{color: 'var(--sotabosc-text)'}}>
            Choose a time
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {MOCK_SLOTS.map((slot) => (
              <div
                key={slot}
                className="text-xs text-center py-2.5 px-2 rounded-lg border"
                style={{
                  borderColor: 'var(--sotabosc-border)',
                  backgroundColor: 'var(--sotabosc-surface-muted)',
                  color: 'var(--sotabosc-muted)',
                }}
              >
                {slot}
              </div>
            ))}
          </div>
          <div
            className="h-9 rounded-lg flex items-center justify-center text-xs font-bold opacity-60"
            style={{
              backgroundColor: 'var(--sotabosc-accent)',
              color: 'var(--sotabosc-surface)',
            }}
          >
            Confirm booking
          </div>
        </div>

        <div
          className="px-4 sm:px-6 py-4 border-t flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:items-center"
          style={{borderColor: 'var(--sotabosc-border)'}}
        >
          <Link
            to="/feedback?type=claim"
            className="inline-flex items-center justify-center text-sm font-bold px-5 py-2.5 rounded-full transition-opacity hover:opacity-90"
            style={{
              backgroundColor: 'var(--sotabosc-accent)',
              color: 'var(--sotabosc-surface)',
            }}
          >
            {isClaimed ? 'Activate booking' : 'Claim this listing'}
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center text-sm font-bold px-5 py-2.5 rounded-full border transition-opacity hover:opacity-90"
            style={{
              borderColor: 'var(--sotabosc-border)',
              color: 'var(--sotabosc-text)',
            }}
          >
            Explore the map
          </Link>
          <Link
            to={directoryRoutes.place(BOOKING_DEMO_PLACE_SLUG)}
            className="text-sm underline transition-opacity hover:opacity-80 sm:ml-auto"
            style={{color: 'var(--sotabosc-accent-soft)'}}
          >
            See live demo →
          </Link>
        </div>
      </div>
    </section>
  );
}
