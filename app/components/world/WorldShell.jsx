import { useState, useEffect } from 'react';
import { useOrganismStore } from '~/lib/store/useOrganismStore';
import { audioManager } from '~/lib/sound/audioManager';
import { SoundToggle } from '~/components/world/SoundToggle';
import { getDomainTheme } from '~/lib/theme/domainTheme';

/**
 * WorldShell — themed page wrapper. No welcome gate: content starts immediately.
 * Theme (solarpunk palette) follows the user's chosen domain.
 */
export function WorldShell({ children }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const organism = useOrganismStore((state) => state.organism);
  const theme = getDomainTheme(organism?.domain);

  useEffect(() => {
    setIsHydrated(true);
    audioManager.init();
  }, []);

  if (!isHydrated) {
    return (
      <div
        className="sotabosc-shell min-h-screen"
        style={{ backgroundColor: theme.bg }}
      />
    );
  }

  return (
    <div
      className="sotabosc-shell min-h-screen transition-[background-color,color] duration-700 ease-out"
      data-domain={organism?.domain ?? 'neutral'}
      style={{
        '--sotabosc-bg': theme.bg,
        '--sotabosc-surface': theme.surface,
        '--sotabosc-surface-muted': theme.surfaceMuted,
        '--sotabosc-accent': theme.accent,
        '--sotabosc-accent-soft': theme.accentSoft,
        '--sotabosc-text': theme.text,
        '--sotabosc-muted': theme.muted,
        '--sotabosc-border': theme.border,
        backgroundColor: 'var(--sotabosc-bg)',
        color: 'var(--sotabosc-text)',
      }}
    >
      {children}
      {organism && <SoundToggle />}
    </div>
  );
}
