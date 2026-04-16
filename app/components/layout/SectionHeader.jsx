/**
 * @param {{
 *   kicker?: string;
 *   title: import('react').ReactNode;
 *   titleAs?: 'h1' | 'h2' | 'h3';
 *   titleId?: string;
 *   description?: import('react').ReactNode;
 *   actions?: import('react').ReactNode;
 *   className?: string;
 *   visuallyHiddenTitle?: boolean;
 *   editorialTitle?: boolean;
 * }} props
 */
export function SectionHeader({
  kicker,
  title,
  titleAs = 'h2',
  titleId,
  description,
  actions,
  className = '',
  visuallyHiddenTitle = false,
  editorialTitle = false,
}) {
  const TitleTag = titleAs;

  const headingClass = visuallyHiddenTitle
    ? 'sr-only'
    : titleAs === 'h1'
      ? 'text-4xl md:text-5xl font-black tracking-tight mb-3 font-[family-name:var(--font-display)]'
      : editorialTitle
        ? 'text-xl sm:text-2xl font-semibold font-[family-name:var(--font-editorial)]'
        : 'text-xl sm:text-2xl font-bold font-[family-name:var(--font-display)]';

  const descriptionClass = visuallyHiddenTitle
    ? 'hidden'
    : titleAs === 'h1'
      ? 'text-lg max-w-2xl mb-8 leading-snug'
      : 'text-sm sm:text-base max-w-[42rem] mt-2 leading-relaxed';

  return (
    <div
      className={`${actions ? 'flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4' : ''} ${className}`.trim()}
    >
      <div className="min-w-0 flex-1">
        {kicker && !visuallyHiddenTitle && (
          <p
            className="text-[11px] font-bold uppercase tracking-[0.35em] mb-2"
            style={{ color: 'var(--sotabosc-muted)' }}
          >
            {kicker}
          </p>
        )}
        <TitleTag
          id={titleId}
          className={headingClass}
          style={visuallyHiddenTitle ? undefined : { color: 'var(--sotabosc-text)' }}
        >
          {title}
        </TitleTag>
        {description && (
          <p
            className={descriptionClass}
            style={{ color: 'var(--sotabosc-muted)' }}
          >
            {description}
          </p>
        )}
      </div>
      {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
    </div>
  );
}
