import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioManager } from '~/lib/sound/audioManager';
import {
    LayerSky,
    LayerCanopy,
    LayerUnderstory,
    LayerWater,
    LayerSoil,
    LayerBedrock
} from './layers';
import { SpecimenOverlay } from './SpecimenOverlay';
import { useOrganismStore } from '~/lib/store/useOrganismStore';

// Register plugins (client-side only)
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

/**
 * ScrollWorld Component
 * Orchestrates the multi-layer ecosystem scroll using GSAP.
 */
export function ScrollWorld() {
    const containerRef = useRef(null);
    const mainRef = useRef(null);
    const userDomain = useOrganismStore((s) => s.organism?.domain ?? null);
    const [selectedSpecimen, setSelectedSpecimen] = useState(null);
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);
    const [isBokehActive, setIsBokehActive] = useState(false);

    const handleSpecimenClick = (specimen) => {
        setSelectedSpecimen(specimen);
        setIsOverlayOpen(true);
    };

    const handleSpecimenHover = (isHovered) => {
        setIsBokehActive(isHovered);
    };

    useGSAP(() => {
        // Check if user prefers reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) return;

        const sections = gsap.utils.toArray('.ecosystem-layer');

        // Create the master vertical timeline
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                pin: true,           // Pin the main container
                scrub: 1,           // Smooth scrubbing
                snap: 1 / (sections.length - 1), // Snap to layers
                end: () => `+=${containerRef.current.offsetWidth * 5}`, // Determine scroll length
                onUpdate: (self) => {
                    audioManager.updateVolumes(self.progress);
                },
            }
        });

        // Layer transitions
        sections.forEach((section, i) => {
            if (i === 0) return;

            tl.fromTo(section,
                { yPercent: 100, opacity: 0 },
                { yPercent: 0, opacity: 1, ease: "none" },
                i
            );
        });

    }, { scope: containerRef });

    return (
        <div
            ref={containerRef}
            className="scroll-world-container relative w-full h-screen overflow-hidden bg-black"
            data-scroll-domain={userDomain ?? 'neutral'}
        >
            {/* Layers Wrapper with Bokeh Filter */}
            <motion.div
                ref={mainRef}
                className="layers-wrapper relative w-full h-full will-change-[filter]"
                animate={{
                    filter: isBokehActive || isOverlayOpen
                        ? 'blur(15px) brightness(0.6) saturate(0.8)'
                        : 'blur(0px) brightness(1) saturate(1)',
                }}
                transition={{
                    duration: 0.8,
                    ease: [0.22, 1, 0.36, 1] // Custom Liquid Curve
                }}
            >
                <div className="ecosystem-layer absolute inset-0 z-[10]">
                    <LayerSky onSpecimenClick={handleSpecimenClick} onSpecimenHover={handleSpecimenHover} />
                </div>

                <div className="ecosystem-layer absolute inset-0 z-[20]">
                    <LayerCanopy onSpecimenClick={handleSpecimenClick} onSpecimenHover={handleSpecimenHover} />
                </div>

                <div className="ecosystem-layer absolute inset-0 z-[30]">
                    <LayerUnderstory onSpecimenClick={handleSpecimenClick} onSpecimenHover={handleSpecimenHover} />
                </div>

                <div className="ecosystem-layer absolute inset-0 z-[40]">
                    <LayerWater onSpecimenClick={handleSpecimenClick} onSpecimenHover={handleSpecimenHover} />
                </div>

                <div className="ecosystem-layer absolute inset-0 z-[50]">
                    <LayerSoil onSpecimenClick={handleSpecimenClick} onSpecimenHover={handleSpecimenHover} />
                </div>

                <div className="ecosystem-layer absolute inset-0 z-[60]">
                    <LayerBedrock onSpecimenClick={handleSpecimenClick} onSpecimenHover={handleSpecimenHover} />
                </div>
            </motion.div>

            {/* Global Overlay for Specimens */}
            <SpecimenOverlay
                specimen={selectedSpecimen}
                isOpen={isOverlayOpen}
                onClose={() => {
                    setIsOverlayOpen(false);
                    setIsBokehActive(false); // Reset bokeh on overlay close
                }}
            />

            <div
                className="scroll-world-domain-tint pointer-events-none absolute inset-0 z-[5]"
                aria-hidden
            />
        </div>
    );
}
