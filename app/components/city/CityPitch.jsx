import { Link } from 'react-router';

/**
 * @param {{ archiveCount: number }} props
 */
export function CityClaimBand({ archiveCount }) {
  return (
    <section className="city-claim">
      <div className="city-claim__inner">
        <div>
          <span className="city-section__tag">Citizenship is limited</span>
          <h2 className="city-claim__title">Want a plot in Sotabosc?</h2>
          <p>
            We keep the city small so every screen matters. Tell us about your business, your events or your
            art, and we&apos;ll tell you which kingdom has room.
          </p>
        </div>
        <div className="city-claim__actions">
          <Link to="/city/claim" className="mag-btn">
            Claim a plot
          </Link>
          <Link to="/city" className="city-claim__archive">
            Browse the full register of {archiveCount}+ places →
          </Link>
        </div>
      </div>
    </section>
  );
}
