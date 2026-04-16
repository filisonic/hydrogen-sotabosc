import { NEUTRAL_THEME } from '~/lib/theme/domainTheme';

/**
 * Directory routes use the same --sotabosc-* tokens as WorldShell (neutral palette)
 * so city UI matches the nature-led home aesthetic without requiring an organism.
 */
export function DirectorySurface({ children, className = '' }) {
  return (
    <div
      className={`min-h-screen antialiased transition-[background-color,color] duration-500 ${className}`}
      style={{
        '--sotabosc-bg': NEUTRAL_THEME.bg,
        '--sotabosc-surface': NEUTRAL_THEME.surface,
        '--sotabosc-surface-muted': NEUTRAL_THEME.surfaceMuted,
        '--sotabosc-accent': NEUTRAL_THEME.accent,
        '--sotabosc-accent-soft': NEUTRAL_THEME.accentSoft,
        '--sotabosc-text': NEUTRAL_THEME.text,
        '--sotabosc-muted': NEUTRAL_THEME.muted,
        '--sotabosc-border': NEUTRAL_THEME.border,
        backgroundColor: 'var(--sotabosc-bg)',
        color: 'var(--sotabosc-text)',
      }}
    >
      {children}
    </div>
  );
}
