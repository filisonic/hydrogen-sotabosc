import { DomainSelector } from '~/components/organism/DomainSelector';
import { getDomain } from '~/lib/directory/domains';
import { getDomainEntryEffect, DOMAIN_IDLE_HINT, DOMAIN_LOCKED_HINT } from '~/lib/directory/domainEntry';
import { getStageForXP, RESONANCE_LABEL } from '~/lib/organism/progression';
import { useOrganismStore } from '~/lib/store/useOrganismStore';

/**
 * Compact domain picker + one-line feedback (no `.mag` — avoids min-height: 100vh).
 */
export function LivingMapDomainBand() {
  const organism = useOrganismStore((s) => s.organism);
  const totalXP = useOrganismStore((s) => s.totalXP);
  const selected = organism?.domain;
  const domainMeta = selected ? getDomain(selected) : null;
  const hasPick = Boolean(selected && organism);
  const stage = getStageForXP(totalXP);

  return (
    <section
      id="domain-strip"
      className={`living-map-domains living-map-domains--compact${hasPick ? ' living-map-domains--picked' : ' living-map-domains--awaiting'}`}
      aria-label={hasPick ? 'Your chosen domain league' : 'Pick a domain to enter the ecosystem'}
    >
      <div className="living-map-domains__inner">
        <div className="living-map-domains__prompt">
          {hasPick ? (
            <div className="living-map-domains__picked" role="status">
              <span className="living-map-domains__picked-badge">Selected</span>
              <span className="living-map-domains__picked-emoji" aria-hidden>
                {domainMeta?.emoji}
              </span>
              <h2 className="living-map-domains__title living-map-domains__title--picked">
                {domainMeta?.role ? `${domainMeta.role} · ${domainMeta.label}` : domainMeta?.label}
              </h2>
            </div>
          ) : (
            <>
              <span className="living-map-domains__step">Start here</span>
              <h2 id="living-map-domain-heading" className="living-map-domains__title">
                Pick a domain
              </h2>
              <span className="living-map-domains__pointer" aria-hidden>
                →
              </span>
            </>
          )}
        </div>
        <DomainSelector
          variant="strip"
          hideStripLabel
          compact
          prominent
          locked={hasPick}
          awaitingPick={!hasPick}
        />
        {hasPick ? (
          <div
            className="living-map-domains__resonance"
            title={`${RESONANCE_LABEL} — your trail score`}
          >
            <span className="living-map-domains__resonance-label">{RESONANCE_LABEL}</span>
            <span className="living-map-domains__resonance-value">{totalXP}</span>
            <span className="living-map-domains__resonance-stage" aria-hidden>
              {stage.emoji}
            </span>
          </div>
        ) : null}
      </div>

      <div
        className="living-map-domains__feedback"
        role="status"
        aria-live="polite"
        style={
          domainMeta
            ? {
                borderLeftColor: domainMeta.color,
                backgroundColor: `${domainMeta.color}12`,
              }
            : undefined
        }
      >
        {hasPick ? (
          <span className="living-map-domains__feedback-body">
            <strong className="living-map-domains__feedback-selected">
              You selected {domainMeta?.label}
            </strong>
            <span className="living-map-domains__feedback-sep"> — </span>
            <span className="living-map-domains__feedback-lock">
              Locked to this league for your trail.
            </span>
            <span className="living-map-domains__feedback-dot"> · </span>
            <span className="living-map-domains__feedback-name">{organism.displayName}</span>
            <span className="living-map-domains__feedback-dot"> · </span>
            {getDomainEntryEffect(selected)}
            <span className="living-map-domains__feedback-dot"> · </span>
            {DOMAIN_LOCKED_HINT}
          </span>
        ) : (
          <p className="living-map-domains__feedback-idle">{DOMAIN_IDLE_HINT}</p>
        )}
      </div>
    </section>
  );
}
