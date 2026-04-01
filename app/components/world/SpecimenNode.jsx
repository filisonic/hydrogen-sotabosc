import { motion } from 'framer-motion';
import { useState } from 'react';
import { BioTooltip } from './BioTooltip';

/**
 * SpecimenNode - An interactive bioluminescent hotspot
 * @param {Object} props
 * @param {string} props.id - Unique identifier
 * @param {string} props.name - Display name
 * @param {number[]} props.position - [x, y] coordinates in percentage
 * @param {string} props.color - Pulsing light color
 * @param {Function} props.onClick - Interaction trigger
 * @param {Function} props.onHoverStateChange - Callback for focus/blur
 */
export function SpecimenNode({ name, position, color = '#ee2bad', image, onClick, onHoverStateChange }) {
    const [isHovered, setIsHovered] = useState(false);

    const handleHoverStart = () => {
        setIsHovered(true);
        onHoverStateChange?.(true);
    };

    const handleHoverEnd = () => {
        setIsHovered(false);
        onHoverStateChange?.(false);
    };

    return (
        <motion.div
            className="absolute z-10 cursor-pointer pointer-events-auto flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
            style={{
                left: `${position[0]}%`,
                top: `${position[1]}%`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.15 }}
            onHoverStart={handleHoverStart}
            onHoverEnd={handleHoverEnd}
            onClick={onClick}
            transition={{
                type: "spring",
                damping: 30,
                stiffness: 200
            }}
        >
            {/* Core Visual Identity (Image or CSS Dot) */}
            <motion.div
                className="w-16 h-16 rounded-full relative bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 overflow-hidden"
                animate={{
                    boxShadow: isHovered
                        ? [
                            `0 0 15px ${color}`,
                            `0 0 50px ${color}`,
                            `0 0 15px ${color}`,
                        ]
                        : [
                            `0 0 5px ${color}`,
                            `0 0 25px ${color}`,
                            `0 0 5px ${color}`,
                        ],
                }}
                transition={{
                    duration: isHovered ? 1.5 : 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                {image ? (
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover scale-150 mix-blend-screen opacity-80"
                    />
                ) : (
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: color }} />
                )}

                {/* Ambient Internal Glow */}
                <div
                    className="absolute inset-0 opacity-40 mix-blend-overlay"
                    style={{ backgroundColor: color }}
                />

                {/* Outer Glow Ring */}
                <motion.div
                    className="absolute inset-0 border-[2px] rounded-full opacity-50"
                    style={{ borderColor: color }}
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 0.05, 0.5],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </motion.div>

            {/* Biomimetic Tooltip */}
            <BioTooltip
                name={name}
                meta="Specimen"
                isVisible={isHovered}
            />
        </motion.div>
    );
}
