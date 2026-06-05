import {
  Droplets,
  LandPlot,
  LayoutGrid,
  Leaf,
  Mountain,
  PawPrint,
  Share2,
  Sprout,
  Sun,
  Trees,
  Waves,
} from 'lucide-react';
import { normalizeDomain } from '~/lib/directory/domains';

const LAYER_ICONS = {
  sky: Sun,
  canopy: Trees,
  understory: Leaf,
  'forest-floor': LayoutGrid,
  water: Waves,
  soil: LandPlot,
};

const DOMAIN_ICONS = {
  plants: Sprout,
  algae: Droplets,
  fungi: Share2,
  animals: PawPrint,
  earth: Mountain,
};

const glyphProps = {
  strokeWidth: 1.65,
};

/**
 * @param {{ slug: string; color?: string; size?: number; className?: string }} props
 */
export function MagLayerGlyph({slug, color = 'currentColor', size = 15, className = ''}) {
  const Icon = LAYER_ICONS[slug];
  if (!Icon) return null;
  return (
    <Icon
      className={`mag-eco-glyph ${className}`.trim()}
      size={size}
      color={color}
      aria-hidden
      {...glyphProps}
    />
  );
}

/**
 * @param {{ domainKey: string; color?: string; size?: number; className?: string }} props
 */
export function MagDomainGlyph({domainKey, color = 'currentColor', size = 15, className = ''}) {
  const key = normalizeDomain(domainKey) ?? domainKey;
  const Icon = DOMAIN_ICONS[key];
  if (!Icon) return null;
  return (
    <Icon
      className={`mag-eco-glyph ${className}`.trim()}
      size={size}
      color={color}
      aria-hidden
      {...glyphProps}
    />
  );
}
