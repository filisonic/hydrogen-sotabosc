import { motion } from 'framer-motion';
import { useState } from 'react';

/**
 * Domain-specific colour wash — desaturated and low-contrast for light ink scenes.
 * @param {{ domain?: string | null; layer: string }} props
 */
export function DomainAtmosphere({ domain, layer }) {
  if (!domain) return null;
  const map = {
    plants: {
      canopy:
        'radial-gradient(ellipse 110% 70% at 50% 15%, rgba(34,197,94,0.42), transparent 58%), radial-gradient(ellipse 80% 50% at 80% 90%, rgba(22,101,52,0.35), transparent 55%)',
      understory:
        'radial-gradient(ellipse 90% 60% at 40% 50%, rgba(74,222,128,0.22), transparent 50%), radial-gradient(ellipse 70% 50% at 70% 30%, rgba(21,128,61,0.25), transparent 48%)',
      water:
        'radial-gradient(ellipse 100% 55% at 50% 100%, rgba(16,185,129,0.28), transparent 55%), radial-gradient(ellipse 60% 40% at 20% 30%, rgba(52,211,153,0.15), transparent 50%)',
      soil:
        'radial-gradient(ellipse 85% 60% at 50% 80%, rgba(34,197,94,0.2), transparent 52%), radial-gradient(ellipse 50% 40% at 30% 25%, rgba(120,53,15,0.35), transparent 45%)',
      bedrock:
        'radial-gradient(ellipse 80% 55% at 50% 100%, rgba(74,222,128,0.12), transparent 50%), radial-gradient(ellipse 50% 40% at 10% 20%, rgba(34,197,94,0.15), transparent 45%)',
    },
    algae: {
      canopy:
        'radial-gradient(ellipse 100% 60% at 50% 0%, rgba(6,182,212,0.35), transparent 55%)',
      understory:
        'radial-gradient(ellipse 90% 55% at 60% 50%, rgba(34,211,238,0.2), transparent 50%)',
      water:
        'radial-gradient(ellipse 100% 65% at 50% 90%, rgba(34,211,238,0.45), transparent 58%)',
      soil:
        'radial-gradient(ellipse 80% 50% at 50% 70%, rgba(8,145,178,0.22), transparent 50%)',
      bedrock:
        'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(14,165,233,0.2), transparent 50%)',
    },
    fungi: {
      canopy:
        'radial-gradient(ellipse 90% 55% at 50% 20%, rgba(168,85,247,0.28), transparent 55%)',
      understory:
        'radial-gradient(ellipse 100% 70% at 50% 50%, rgba(192,132,252,0.35), transparent 55%)',
      water:
        'radial-gradient(ellipse 90% 50% at 50% 100%, rgba(147,51,234,0.2), transparent 52%)',
      soil:
        'radial-gradient(ellipse 85% 55% at 40% 75%, rgba(126,34,206,0.22), transparent 50%)',
      bedrock:
        'radial-gradient(ellipse 75% 50% at 50% 100%, rgba(168,85,247,0.18), transparent 50%)',
    },
    microbes: {
      default:
        'radial-gradient(ellipse 100% 60% at 50% 40%, rgba(234,179,8,0.22), transparent 55%)',
    },
    animals: {
      default:
        'radial-gradient(ellipse 100% 55% at 50% 30%, rgba(249,115,22,0.25), transparent 55%)',
    },
    earth: {
      default:
        'radial-gradient(ellipse 100% 60% at 50% 70%, rgba(120,113,108,0.3), transparent 55%)',
    },
  };
  const layerMap = map[domain];
  if (!layerMap) return null;
  const bg = layerMap[layer] || layerMap.default;
  if (!bg) return null;
  return (
    <div
      className="absolute inset-0 z-[2] pointer-events-none mix-blend-soft-light opacity-[0.28] md:opacity-[0.24]"
      style={{ background: bg }}
      aria-hidden
    />
  );
}

const GlobalNoise = () => (
  <div
    className="absolute inset-0 z-[1] opacity-[0.018] pointer-events-none mix-blend-multiply"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
    }}
  />
);

/** Painterly plates (Aurelia / Midjourney-style) + CSS grade in aurelia-imagery.css */
function CinematicImage({ src, alt }) {
  const [show, setShow] = useState(true);
  if (!show) return null;
  return (
    <div className="absolute inset-0 z-0">
      <div className="sotabosc-aurelia-cinematic">
        <motion.img
          src={src}
          alt={alt}
          animate={{ scale: [1.03, 1.09, 1.03] }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          onError={() => setShow(false)}
        />
      </div>
    </div>
  );
}

function SkyProceduralBase() {
  return (
    <>
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#f7f5f0] via-[#ebe8e0] to-[#e2ded4]" />
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 120% 65% at 50% 0%, rgba(255,255,255,0.95), transparent 52%), radial-gradient(ellipse 70% 45% at 85% 30%, rgba(0,0,0,0.035), transparent 48%), radial-gradient(ellipse 55% 40% at 12% 45%, rgba(0,0,0,0.025), transparent 45%)',
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-1/4 z-0 bg-gradient-to-t from-stone-300/25 to-transparent" />
    </>
  );
}

export function SkyBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <SkyProceduralBase />
      <CinematicImage src="/assets/world/aurelia/sky.png" alt="" />
      <GlobalNoise />
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-stone-400/10 to-transparent pointer-events-none" />
      <div className="absolute inset-0 z-[1]">
        {[...Array(18)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full blur-[1px] bg-stone-600/25"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
            }}
            animate={{
              y: ['100vh', '-100vh'],
              x: [(i % 3) * 20 - 20, (i % 5) * 15 - 30],
              opacity: [0, 0.55, 0],
            }}
            transition={{
              duration: 15 + (i % 20),
              repeat: Infinity,
              delay: -i * 0.8,
              ease: 'linear',
            }}
          />
        ))}
      </div>
    </div>
  );
}

/** @param {{ domain?: string | null }} props */
export function CanopyBackground({ domain = null }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#e8ebe4]">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 100% 55% at 50% 0%, rgba(255,255,255,0.75), transparent 52%), radial-gradient(ellipse 75% 60% at 18% 85%, rgba(0,0,0,0.04), transparent 48%)',
        }}
      />
      <CinematicImage src="/assets/world/aurelia/canopy.png" alt="" />
      <GlobalNoise />
      <div className="absolute inset-0 bg-gradient-to-b from-stone-200/20 to-stone-400/15 pointer-events-none z-[1]" />
      <motion.div
        className="absolute inset-0 z-[1] opacity-[0.12] mix-blend-multiply transform origin-top"
        style={{
          background:
            'conic-gradient(from 180deg at 50% -20%, transparent 140deg, rgba(0,0,0,0.15) 160deg, transparent 180deg, rgba(0,0,0,0.08) 200deg, transparent 220deg)',
        }}
        animate={{ rotate: [-2, 2, -2] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <DomainAtmosphere domain={domain} layer="canopy" />
    </div>
  );
}

/** @param {{ domain?: string | null }} props */
export function UnderstoryBackground({ domain = null }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#e6eae3]">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 88% 58% at 32% 42%, rgba(0,0,0,0.03), transparent 48%), radial-gradient(ellipse 68% 48% at 72% 58%, rgba(255,255,255,0.5), transparent 46%)',
        }}
      />
      <CinematicImage src="/assets/world/aurelia/understory.png" alt="" />
      <GlobalNoise />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-stone-400/18 pointer-events-none z-[1]" />
      <motion.div
        className="absolute top-[30%] left-[20%] w-[50vw] h-[50vw] bg-stone-500/10 blur-[80px] rounded-full mix-blend-multiply z-[1]"
        animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.4, 0.25] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <DomainAtmosphere domain={domain} layer="understory" />
    </div>
  );
}

/** @param {{ domain?: string | null }} props */
export function WaterBackground({ domain = null }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#e4eaee]">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 100% 52% at 50% 100%, rgba(0,0,0,0.045), transparent 52%), radial-gradient(ellipse 58% 42% at 82% 28%, rgba(255,255,255,0.65), transparent 48%)',
        }}
      />
      <CinematicImage src="/assets/world/aurelia/water.png" alt="" />
      <GlobalNoise />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-400/20 to-transparent pointer-events-none z-[1]" />
      <div className="absolute inset-0 z-[1]">
        {[...Array(24)].map((_, i) => (
          <motion.div
            key={`water-${i}`}
            className="absolute w-1.5 h-1.5 rounded-full bg-stone-500/18"
            style={{
              left: `${(i * 41) % 100}%`,
              top: `${(i * 17) % 100}%`,
              filter: `blur(${1 + (i % 3)}px)`,
            }}
            animate={{
              y: ['-10vh', '110vh'],
              x: [(i % 5) * 10 - 20, (i % 7) * 8 - 24],
            }}
            transition={{
              duration: 20 + (i % 30),
              repeat: Infinity,
              delay: -i * 0.5,
              ease: 'linear',
            }}
          />
        ))}
      </div>
      <DomainAtmosphere domain={domain} layer="water" />
    </div>
  );
}

/** @param {{ domain?: string | null }} props */
export function SoilBackground({ domain = null }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#ebe6df]">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 78% 58% at 58% 72%, rgba(0,0,0,0.05), transparent 48%), radial-gradient(ellipse 48% 38% at 22% 28%, rgba(255,255,255,0.55), transparent 44%)',
        }}
      />
      <CinematicImage src="/assets/world/aurelia/soil.png" alt="" />
      <GlobalNoise />
      <motion.div
        className="absolute bottom-[20%] right-[20%] w-[40vw] h-[40vw] bg-stone-500/12 blur-[60px] rounded-full mix-blend-multiply z-[1]"
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.45, 0.3] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <DomainAtmosphere domain={domain} layer="soil" />
    </div>
  );
}

/** @param {{ domain?: string | null }} props */
export function BedrockBackground({ domain = null }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#e8e8ec]">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 68% 48% at 50% 100%, rgba(0,0,0,0.06), transparent 48%), radial-gradient(ellipse 48% 38% at 12% 22%, rgba(255,255,255,0.6), transparent 44%)',
        }}
      />
      <CinematicImage src="/assets/world/aurelia/bedrock.png" alt="" />
      <GlobalNoise />
      <div className="absolute inset-0 bg-stone-500/10 pointer-events-none z-[1]" />
      <motion.div
        className="absolute bottom-[-30%] left-[50%] -translate-x-1/2 w-[100vw] h-[50vh] bg-stone-600/12 blur-[100px] rounded-t-full mix-blend-multiply z-[1]"
        animate={{ opacity: [0.22, 0.38, 0.22] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <DomainAtmosphere domain={domain} layer="bedrock" />
    </div>
  );
}
