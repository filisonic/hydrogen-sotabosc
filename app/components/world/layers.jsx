import { EcosystemLayer } from './EcosystemLayer';
import { SpecimenNode } from './SpecimenNode';
import { MOCK_SPECIMENS } from '~/lib/world/specimens';
import {
    SkyBackground,
    CanopyBackground,
    UnderstoryBackground,
    WaterBackground,
    SoilBackground,
    BedrockBackground
} from './CinematicBackgrounds';

export function LayerSky({ onSpecimenClick, onSpecimenHover }) {
    return (
        <EcosystemLayer
            id="sky"
            title="The Celestial Atmosphere"
            description="Where wind, light, and birds define the boundary of the forest."
            background={<SkyBackground />}
        >
            <div className="relative w-full h-full">
                <SpecimenNode
                    {...MOCK_SPECIMENS['sky-spore']}
                    position={[70, 20]}
                    onClick={() => onSpecimenClick(MOCK_SPECIMENS['sky-spore'])}
                    onHoverStateChange={onSpecimenHover}
                />
            </div>
        </EcosystemLayer>
    );
}

export function LayerCanopy({ onSpecimenClick, onSpecimenHover }) {
    return (
        <EcosystemLayer
            id="canopy"
            title="The Living Canopy"
            description="The solar engine of the world. Green, dense, and teeming with life."
            background={<CanopyBackground />}
        >
            <div className="relative w-full h-full">
                <SpecimenNode
                    {...MOCK_SPECIMENS['electric-fern']}
                    position={[15, 40]}
                    onClick={() => onSpecimenClick(MOCK_SPECIMENS['electric-fern'])}
                    onHoverStateChange={onSpecimenHover}
                />
            </div>
        </EcosystemLayer>
    );
}

export function LayerUnderstory({ onSpecimenClick, onSpecimenHover }) {
    return (
        <EcosystemLayer
            id="understory"
            title="The Fungal Understory"
            description="Deep shadows, decaying matter, and the hidden mycelial network."
            background={<UnderstoryBackground />}
        >
            <div className="relative w-full h-full">
                <SpecimenNode
                    {...MOCK_SPECIMENS['bioluminescent-mycena']}
                    position={[80, 60]}
                    onClick={() => onSpecimenClick(MOCK_SPECIMENS['bioluminescent-mycena'])}
                    onHoverStateChange={onSpecimenHover}
                />
                <SpecimenNode
                    {...MOCK_SPECIMENS['neon-fungi-spore']}
                    position={[30, 30]}
                    onClick={() => onSpecimenClick(MOCK_SPECIMENS['neon-fungi-spore'])}
                    onHoverStateChange={onSpecimenHover}
                />
            </div>
        </EcosystemLayer>
    );
}

export function LayerWater({ onSpecimenClick, onSpecimenHover }) {
    return (
        <EcosystemLayer
            id="water"
            title="The Liminal Waters"
            description="Where the terrestrial gives way to the submerged. Reflections and algae."
            background={<WaterBackground />}
        >
        </EcosystemLayer>
    );
}

export function LayerSoil({ onSpecimenClick, onSpecimenHover }) {
    return (
        <EcosystemLayer
            id="soil"
            title="The Microbial Soil"
            description="Invisible giants and microscopic architects. The foundation of growth."
            background={<SoilBackground />}
        >
        </EcosystemLayer>
    );
}

export function LayerBedrock({ onSpecimenClick, onSpecimenHover }) {
    return (
        <EcosystemLayer
            id="bedrock"
            title="The Ancient Bedrock"
            description="Mineral silence and geological time. The deepest core of Sotabosc."
            background={<BedrockBackground />}
        >
        </EcosystemLayer>
    );
}
