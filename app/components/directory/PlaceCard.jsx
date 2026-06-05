import { Link } from 'react-router';
import { getDomain, LISTING_CATEGORIES } from '~/lib/directory/domains';
import { directoryRoutes } from '~/lib/directory/routes';
import { resolvePlaceImageUrl } from '~/lib/directory/sceneVisuals';
import { DirectoryPreviewImage } from '~/components/directory/DirectoryPreviewImage';
import { VenueStoryTrigger } from '~/components/world/MythologyOverlay';
import { getVenueAtmosphericMoment } from '~/lib/worldbuilding/placeNarratives';

function categoryLabel(key) {
  return LISTING_CATEGORIES[key]?.label ?? key.replace(/-/g, ' ');
}

export function PlaceCard({ place, className = '', tone = 'directory', showMythology = false }) {
  const domain = getDomain(place.primaryDomain);
  const sceneInk = tone === 'sceneInk';
  const onScene = tone === 'scene' || sceneInk;
  const muted = sceneInk ? 'rgba(0,0,0,0.55)' : onScene ? 'rgba(255,255,255,0.88)' : 'var(--sotabosc-muted)';
  const chipMutedBg = sceneInk ? 'rgba(0,0,0,0.06)' : onScene ? 'rgba(255,255,255,0.14)' : 'var(--sotabosc-surface-muted)';
  const imgSrc = resolvePlaceImageUrl(place);
  const atmosphericMoment = showMythology ? getVenueAtmosphericMoment(place.slug) : null;

  return (
    <Link
      to={directoryRoutes.place(place.slug)}
      className={`group flex h-full flex-col rounded-2xl border transition-all overflow-hidden hover:shadow-[0_20px_40px_rgba(27,67,50,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sotabosc-accent-soft)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sotabosc-bg)] ${onScene && !sceneInk ? 'backdrop-blur-md shadow-lg shadow-black/40 ring-1 ring-white/10' : ''} ${sceneInk ? 'backdrop-blur-md shadow-md shadow-stone-900/10 ring-1 ring-stone-900/10' : ''} ${className}`}
      style={{
        backgroundColor: sceneInk ? 'rgba(255,255,255,0.94)' : onScene ? 'rgba(12,18,15,0.88)' : 'var(--sotabosc-surface)',
        borderColor: sceneInk ? 'rgba(0,0,0,0.1)' : onScene ? 'rgba(255,255,255,0.22)' : 'var(--sotabosc-border)',
        color: sceneInk ? 'rgba(15,23,42,0.95)' : onScene ? 'rgba(255,255,255,0.98)' : 'var(--sotabosc-text)',
      }}
    >
      <div className="aspect-[16/10] bg-zinc-900 overflow-hidden shrink-0 relative">
        {imgSrc ? (
          <DirectoryPreviewImage
            src={imgSrc}
            alt={place.name}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
            fallback={
              <div
                className="w-full h-full flex items-center justify-center text-4xl"
                style={{ backgroundColor: `${domain.color}33` }}
              >
                {domain.emoji}
              </div>
            }
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-4xl"
            style={{ backgroundColor: `${domain.color}33` }}
          >
            {domain.emoji}
          </div>
        )}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/28 via-black/5 to-transparent pointer-events-none z-[3]"
          aria-hidden
        />
      </div>
      <div className={onScene ? 'p-4 flex flex-col flex-1 min-h-0' : 'p-5 flex flex-col flex-1 min-h-0'}>
        <div className={`flex flex-wrap items-center gap-1.5 mb-2 ${onScene ? 'gap-1' : 'gap-2'}`}>
          <span
            className={`inline-flex items-center gap-1 font-semibold rounded-full ${onScene ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2 py-0.5'}`}
            style={{ backgroundColor: `${domain.color}28`, color: domain.color }}
          >
            {domain.emoji}{' '}
            {domain.role ? `${domain.role} · ${domain.label}` : domain.label}
          </span>
          {place.categories.slice(0, 2).map((cat) => (
            <span
              key={cat}
              className={`rounded-full ${onScene ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2 py-0.5'}`}
              style={{
                color: muted,
                backgroundColor: chipMutedBg,
              }}
            >
              {categoryLabel(cat)}
            </span>
          ))}
        </div>
        <h3
          className={`font-bold leading-tight mb-1 group-hover:opacity-[0.9] transition-opacity ${onScene ? 'text-sm sm:text-base' : 'text-lg'}`}
        >
          {place.name}
        </h3>
        <p className={`line-clamp-2 ${onScene ? 'text-xs leading-relaxed' : 'text-sm'}`} style={{ color: muted }}>
          {atmosphericMoment || place.summary}
        </p>
        {showMythology && (
          <div className="mt-3 mb-2" onClick={(e) => e.preventDefault()}>
            <VenueStoryTrigger 
              placeSlug={place.slug} 
              placeName={place.name}
              className="text-[10px]"
            />
          </div>
        )}
        <p
          className={`mt-auto pt-2 ${onScene ? 'text-[10px]' : 'text-xs'}`}
          style={{ color: muted, opacity: 0.88 }}
        >
          {place.neighborhood}
        </p>
      </div>
    </Link>
  );
}
