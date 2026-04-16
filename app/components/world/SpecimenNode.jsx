import { motion } from 'framer-motion';
import { useState } from 'react';
import { BioTooltip } from './BioTooltip';

function SpecimenThumb({ src, name, color, ink }) {
  const [ok, setOk] = useState(true);
  if (!ok) {
    return <div className="w-6 h-6 rounded-full" style={{ backgroundColor: color }} />;
  }
  return (
    <img
      src={src}
      alt={name}
      className={`w-full h-full object-cover scale-150 opacity-80 ${ink ? 'mix-blend-multiply' : 'mix-blend-screen'}`}
      onError={() => setOk(false)}
    />
  );
}

/**
 * SpecimenNode - An interactive bioluminescent hotspot
 * @param {Object} props
 * @param {string} props.id - Unique identifier
 * @param {string} props.name - Display name
 * @param {number[]} props.position - [x, y] coordinates in percentage
 * @param {string} props.color - Pulsing light color
 * @param {Function} props.onClick - Interaction trigger
 * @param {Function} props.onHoverStateChange - Callback for focus/blur
 * @param {'dark' | 'ink'} [props.tone]
 */
export function SpecimenNode({ name, position, color = '#ee2bad', image, onClick, onHoverStateChange, tone = 'dark' }) {
    const ink = tone === 'ink';
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
            className="absolute z-[50] cursor-pointer pointer-events-auto flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
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
                className={`w-16 h-16 rounded-full relative backdrop-blur-md flex items-center justify-center overflow-hidden ${
                  ink
                    ? 'bg-white/65 border border-stone-400/50 shadow-[0_4px_24px_rgba(0,0,0,0.08)]'
                    : 'bg-black/40 border border-white/10'
                }`}
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
                    <SpecimenThumb src={image} name={name} color={color} ink={ink} />
                ) : (
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: color }} />
                )}

                {/* Ambient Internal Glow */}
                <div
                    className={`absolute inset-0 ${ink ? 'opacity-25 mix-blend-multiply' : 'opacity-40 mix-blend-overlay'}`}
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
            <BioTooltip name={name} meta="Specimen" isVisible={isHovered} tone={ink ? 'ink' : 'dark'} />
        </motion.div>
    );
}
