import { EcosystemLayer } from './EcosystemLayer';
import { SpecimenNode } from './SpecimenNode';
import { MOCK_SPECIMENS } from '~/lib/world/specimens';
import {
  SkyBackground,
  CanopyBackground,
  UnderstoryBackground,
  WaterBackground,
  SoilBackground,
  BedrockBackground,
} from './CinematicBackgrounds';

export function LayerSky({
  onSpecimenClick,
  onSpecimenHover,
  heroEmbed,
  title,
  description,
  className = '',
  visualDomain = null,
}) {
  return (
    <EcosystemLayer
      id="sky"
      title={title ?? 'The Celestial Atmosphere'}
      description={description ?? 'Where wind, light, and birds define the boundary of the forest.'}
      background={<SkyBackground />}
      heroEmbed={heroEmbed}
      className={className}
    >
      <div className="relative h-full w-full">
        <SpecimenNode
          {...MOCK_SPECIMENS['sky-spore']}
          position={[70, 20]}
          tone="ink"
          onClick={() => onSpecimenClick(MOCK_SPECIMENS['sky-spore'])}
          onHoverStateChange={onSpecimenHover}
        />
      </div>
    </EcosystemLayer>
  );
}

export function LayerCanopy({
  onSpecimenClick,
  onSpecimenHover,
  heroEmbed,
  title,
  description,
  className = '',
  visualDomain = null,
}) {
  return (
    <EcosystemLayer
      id="canopy"
      title={title ?? 'The Living Canopy'}
      description={description ?? 'The solar engine of the world. Green, dense, and teeming with life.'}
      background={<CanopyBackground domain={visualDomain} />}
      heroEmbed={heroEmbed}
      className={className}
    >
      <div className="relative h-full w-full">
        <SpecimenNode
          {...MOCK_SPECIMENS['electric-fern']}
          position={[15, 40]}
          tone="ink"
          onClick={() => onSpecimenClick(MOCK_SPECIMENS['electric-fern'])}
          onHoverStateChange={onSpecimenHover}
        />
      </div>
    </EcosystemLayer>
  );
}

export function LayerUnderstory({
  onSpecimenClick,
  onSpecimenHover,
  heroEmbed,
  title,
  description,
  className = '',
  visualDomain = null,
}) {
  return (
    <EcosystemLayer
      id="understory"
      title={title ?? 'The Fungal Understory'}
      description={
        description ?? 'Deep shadows, decaying matter, and the hidden mycelial network.'
      }
      background={<UnderstoryBackground domain={visualDomain} />}
      heroEmbed={heroEmbed}
      className={className}
    >
      <div className="relative h-full w-full">
        <SpecimenNode
          {...MOCK_SPECIMENS['bioluminescent-mycena']}
          position={[80, 60]}
          tone="ink"
          onClick={() => onSpecimenClick(MOCK_SPECIMENS['bioluminescent-mycena'])}
          onHoverStateChange={onSpecimenHover}
        />
        <SpecimenNode
          {...MOCK_SPECIMENS['neon-fungi-spore']}
          position={[30, 30]}
          tone="ink"
          onClick={() => onSpecimenClick(MOCK_SPECIMENS['neon-fungi-spore'])}
          onHoverStateChange={onSpecimenHover}
        />
      </div>
    </EcosystemLayer>
  );
}

export function LayerWater({
  onSpecimenClick,
  onSpecimenHover,
  heroEmbed,
  title,
  description,
  className = '',
  visualDomain = null,
}) {
  return (
    <EcosystemLayer
      id="water"
      title={title ?? 'The Liminal Waters'}
      description={
        description ?? 'Where the terrestrial gives way to the submerged. Reflections and algae.'
      }
      background={<WaterBackground domain={visualDomain} />}
      heroEmbed={heroEmbed}
      className={className}
    >
      <div className="relative h-full w-full">
        <SpecimenNode
          {...MOCK_SPECIMENS['tide-lantern']}
          position={[55, 35]}
          tone="ink"
          onClick={() => onSpecimenClick(MOCK_SPECIMENS['tide-lantern'])}
          onHoverStateChange={onSpecimenHover}
        />
      </div>
    </EcosystemLayer>
  );
}

export function LayerSoil({
  onSpecimenClick,
  onSpecimenHover,
  heroEmbed,
  title,
  description,
  className = '',
  visualDomain = null,
}) {
  return (
    <EcosystemLayer
      id="soil"
      title={title ?? 'The Microbial Soil'}
      description={
        description ?? 'Invisible giants and microscopic architects. The foundation of growth.'
      }
      background={<SoilBackground domain={visualDomain} />}
      heroEmbed={heroEmbed}
      className={className}
    >
      <div className="relative h-full w-full">
        <SpecimenNode
          {...MOCK_SPECIMENS['root-archive']}
          position={[48, 42]}
          tone="ink"
          onClick={() => onSpecimenClick(MOCK_SPECIMENS['root-archive'])}
          onHoverStateChange={onSpecimenHover}
        />
      </div>
    </EcosystemLayer>
  );
}

export function LayerBedrock({
  onSpecimenClick,
  onSpecimenHover,
  heroEmbed,
  title,
  description,
  className = '',
  visualDomain = null,
}) {
  return (
    <EcosystemLayer
      id="bedrock"
      title={title ?? 'The Ancient Bedrock'}
      description={
        description ?? 'Mineral silence and geological time. The deepest core of Sotabosc.'
      }
      background={<BedrockBackground domain={visualDomain} />}
      heroEmbed={heroEmbed}
      className={className}
    >
      <div className="relative h-full w-full">
        <SpecimenNode
          {...MOCK_SPECIMENS['bedrock-sigil']}
          position={[50, 38]}
          tone="ink"
          onClick={() => onSpecimenClick(MOCK_SPECIMENS['bedrock-sigil'])}
          onHoverStateChange={onSpecimenHover}
        />
      </div>
    </EcosystemLayer>
  );
}
