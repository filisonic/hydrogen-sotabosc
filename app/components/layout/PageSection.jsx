/**
 * Full-width page band with token backgrounds and consistent horizontal rhythm
 * (awesome-design-md: px-4 sm:px-6 lg:px-8, max-w-6xl inner).
 *
 * @param {{
 *   children: import('react').ReactNode;
 *   id?: string;
 *   variant?: 'band-muted' | 'band-default' | 'band-accent';
 *   density?: 'default' | 'compact' | 'hero' | 'slim';
 *   'data-stitch-id'?: string;
 *   aria-labelledby?: string;
 *   'aria-label'?: string;
 *   className?: string;
 *   innerClassName?: string;
 * }} props
 */
export function PageSection({
  children,
  id,
  variant = 'band-default',
  density = 'default',
  'data-stitch-id': dataStitchId,
  'aria-labelledby': ariaLabelledBy,
  'aria-label': ariaLabel,
  className = '',
  innerClassName = '',
}) {
  const bg =
    variant === 'band-muted'
      ? { backgroundColor: 'var(--sotabosc-surface-muted)' }
      : variant === 'band-accent'
        ? {
            background:
              'linear-gradient(135deg, #012d1d 0%, var(--sotabosc-accent) 100%)',
            color: 'var(--sotabosc-surface)',
          }
        : { backgroundColor: 'var(--sotabosc-bg)' };

  const py =
    density === 'hero'
      ? 'pt-12 pb-8 sm:pt-14 sm:pb-10'
      : density === 'slim'
        ? 'py-6 sm:py-8'
        : density === 'compact'
          ? 'py-8'
          : 'py-10 sm:py-12';

  const landmarkProps = ariaLabelledBy
    ? { 'aria-labelledby': ariaLabelledBy }
    : ariaLabel
      ? { 'aria-label': ariaLabel }
      : {};

  return (
    <section
      id={id}
      className={`px-4 sm:px-6 lg:px-8 ${py} ${className}`.trim()}
      style={bg}
      data-stitch-id={dataStitchId}
      {...landmarkProps}
    >
      <div className={`max-w-6xl mx-auto ${innerClassName}`.trim()}>{children}</div>
    </section>
  );
}
