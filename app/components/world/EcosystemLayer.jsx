import { motion } from 'framer-motion';

/**
 * EcosystemLayer Primitive
 * Standardized wrapper for each ecosystem zone.
 * 
 * @param {string} id - Unique identifier for the layer (e.g., 'sky')
 * @param {string} title - Human readable title
 * @param {string} description - Brief subtitle/description
 * @param {React.ReactNode} background - Custom visual background component
 * @param {React.ReactNode} children - Layer-specific content
 */
export function EcosystemLayer({ id, title, description, background, children, className = "" }) {
    return (
        <section
            id={id}
            className={`ecosystem-layer relative min-h-screen w-full flex flex-col justify-center items-center px-4 overflow-hidden ${className}`}
        >
            {/* Custom Interactive/Cinematic Background */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                {background}
            </div>

            <div className="layer-content relative z-10 max-w-7xl mx-auto w-full text-center mix-blend-plus-lighter text-white">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, margin: "-100px" }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                >
                    <span className="text-[10px] md:text-sm uppercase tracking-[0.4em] opacity-60 mb-4 block font-sans">layer // {id}</span>
                    <h2 className="text-5xl md:text-8xl font-serif mb-6 text-balance drop-shadow-2xl font-medium tracking-tight">
                        {title}
                    </h2>
                    {description && (
                        <p className="text-xl md:text-3xl max-w-3xl mx-auto opacity-80 font-serif leading-relaxed drop-shadow-lg mb-12">
                            {description}
                        </p>
                    )}
                </motion.div>

                <div className="layer-visuals w-full relative z-20">
                    {children}
                </div>
            </div>
        </section>
    );
}
