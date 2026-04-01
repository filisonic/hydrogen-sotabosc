import { motion } from 'framer-motion';

// --- Reusable FX ---

const GlobalNoise = () => (
    <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
    />
);

const CinematicImage = ({ src, alt }) => (
    <motion.img
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover object-center scale-110 opacity-60 mix-blend-screen"
        animate={{ scale: [1.05, 1.1, 1.05] }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
    />
);

// --- 1. Sky Background ---
export function SkyBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden bg-[#0a192f]">
            <CinematicImage src="/assets/world/backgrounds/sky.png" alt="Sky Atmosphere" />
            <GlobalNoise />
            <div className="absolute inset-0 bg-gradient-to-b from-sky-900/30 to-transparent pointer-events-none" />

            {/* Ascending Spores / Dust */}
            <div className="absolute inset-0">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white/40 rounded-full blur-[1px]"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: ['100vh', '-100vh'],
                            x: [(Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100],
                            opacity: [0, 0.8, 0]
                        }}
                        transition={{
                            duration: 15 + Math.random() * 20,
                            repeat: Infinity,
                            delay: Math.random() * -20,
                            ease: "linear"
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

// --- 2. Canopy Background ---
export function CanopyBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden bg-[#0d1611]">
            <CinematicImage src="/assets/world/backgrounds/canopy.png" alt="Jungle Canopy" />
            <GlobalNoise />
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 to-green-950/40 pointer-events-none" />

            {/* God Rays */}
            <motion.div
                className="absolute inset-0 opacity-20 mix-blend-overlay transform origin-top"
                style={{
                    background: 'conic-gradient(from 180deg at 50% -20%, transparent 140deg, rgba(255,255,255,0.8) 160deg, transparent 180deg, rgba(255,255,255,0.4) 200deg, transparent 220deg)'
                }}
                animate={{ rotate: [-2, 2, -2] }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />
        </div>
    );
}

// --- 3. Understory Background ---
export function UnderstoryBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden bg-[#050a06]">
            <CinematicImage src="/assets/world/backgrounds/understory.png" alt="Forest Understory" />
            <GlobalNoise />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 pointer-events-none" />

            {/* Ambient Pool of Light */}
            <motion.div
                className="absolute top-[30%] left-[20%] w-[50vw] h-[50vw] bg-lime-900/10 blur-[80px] rounded-full mix-blend-screen"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
        </div>
    );
}

// --- 4. Water Background ---
export function WaterBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden bg-[#050e14]">
            <CinematicImage src="/assets/world/backgrounds/water.png" alt="Deep Waters" />
            <GlobalNoise />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-950/50 to-transparent pointer-events-none" />

            {/* Sinking Particles */}
            <div className="absolute inset-0">
                {[...Array(30)].map((_, i) => (
                    <motion.div
                        key={`water-${i}`}
                        className="absolute w-2 h-2 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            background: Math.random() > 0.5 ? 'rgba(34, 211, 238, 0.4)' : 'rgba(56, 189, 248, 0.2)',
                            filter: `blur(${Math.random() * 3}px)`
                        }}
                        animate={{
                            y: ['-10vh', '110vh'],
                            x: [(Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50],
                        }}
                        transition={{
                            duration: 20 + Math.random() * 30,
                            repeat: Infinity,
                            delay: Math.random() * -20,
                            ease: "linear"
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

// --- 5. Soil Background ---
export function SoilBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden bg-[#120a05]">
            <CinematicImage src="/assets/world/backgrounds/soil.png" alt="Microbial Soil" />
            <GlobalNoise />

            {/* Dense Microbial Glowing Clusters */}
            <motion.div
                className="absolute bottom-[20%] right-[20%] w-[40vw] h-[40vw] bg-orange-700/10 blur-[60px] rounded-full mix-blend-screen"
                animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />
        </div>
    );
}

// --- 6. Bedrock Background ---
export function BedrockBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden bg-[#050508]">
            <CinematicImage src="/assets/world/backgrounds/bedrock.png" alt="Ancient Bedrock" />
            <GlobalNoise />
            <div className="absolute inset-0 bg-black/40 pointer-events-none" />

            {/* Final Core Glow */}
            <motion.div
                className="absolute bottom-[-30%] left-[50%] -translate-x-1/2 w-[100vw] h-[50vh] bg-purple-900/10 blur-[100px] rounded-t-full mix-blend-screen cursor-none"
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />
        </div>
    );
}
