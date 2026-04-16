/**
 * Atmospheric Layer Component
 * Implements the visual and audio atmospheric elements defined in ecosystem themes
 * Inspired by Enter Maya's immersive environmental storytelling
 */

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { getEcosystemTheme, getCurrentSeason, getSeasonalAdaptations } from '~/lib/worldbuilding/ecosystemTheme';

function ParticleField({ particleColor, intensity = 'moderate', count = 30 }) {
  const containerRef = useRef(null);
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    const generateParticles = () => {
      const particleCount = intensity === 'peak' ? count * 1.5 : intensity === 'gentle' ? count * 0.6 : count;
      return Array.from({ length: Math.floor(particleCount) }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.6 + 0.2,
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 10,
      }));
    };
    
    setParticles(generateParticles());
  }, [intensity, count]);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 1 }}
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            backgroundColor: particleColor,
            width: particle.size,
            height: particle.size,
          }}
          initial={{
            x: `${particle.x}%`,
            y: '110%',
            opacity: 0,
          }}
          animate={{
            x: [`${particle.x}%`, `${particle.x + (Math.random() - 0.5) * 20}%`],
            y: ['-10%', '-10%'],
            opacity: [0, particle.opacity, particle.opacity, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

function GradientOverlay({ primaryGradient, secondaryGradient, opacity = 0.4 }) {
  const { scrollYProgress } = useScroll();
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [opacity, opacity * 0.7, opacity * 0.7, opacity]);

  return (
    <>
      {/* Primary atmospheric gradient */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: primaryGradient,
          opacity: overlayOpacity,
          zIndex: 0,
        }}
      />
      
      {/* Secondary overlay for depth */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: secondaryGradient,
          opacity: useTransform(overlayOpacity, (v) => v * 0.6),
          zIndex: 0,
        }}
      />
    </>
  );
}

function AtmosphericAudio({ ambientSound, domain, enabled = false }) {
  const audioRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!enabled || !ambientSound) return;

    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';
      audioRef.current.loop = true;
      audioRef.current.volume = 0.15;
    }

    const audio = audioRef.current;
    
    // Map ambient sound names to actual audio files
    const soundMap = {
      'wind-synthesis': '/assets/world/audio/wind-synthesis.mp3',
      'artistic-resonance': '/assets/world/audio/artistic-resonance.mp3', 
      'flowing-water': '/assets/world/audio/flowing-water.mp3',
      'earth-resonance': '/assets/world/audio/earth-resonance.mp3',
    };

    const audioSrc = soundMap[ambientSound];
    if (!audioSrc) return;

    audio.src = audioSrc;
    
    const handleCanPlay = () => {
      setIsLoaded(true);
    };

    const handleError = () => {
      console.warn(`Failed to load ambient audio for ${domain} domain:`, ambientSound);
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      if (audio && !audio.paused) {
        audio.pause();
      }
    };
  }, [ambientSound, domain, enabled]);

  const toggleAudio = () => {
    if (!audioRef.current || !isLoaded) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        console.warn('Could not play ambient audio');
      });
    }
  };

  if (!enabled || !ambientSound || !isLoaded) return null;

  return (
    <button
      onClick={toggleAudio}
      className="fixed bottom-4 right-4 z-50 p-3 rounded-full bg-white/90 backdrop-blur-sm shadow-lg border border-stone-200/80 hover:bg-white transition-colors"
      title={`${isPlaying ? 'Pause' : 'Play'} atmospheric audio`}
    >
      <div className="w-5 h-5 flex items-center justify-center">
        {isPlaying ? (
          // Pause icon
          <div className="flex gap-1">
            <div className="w-1 h-4 bg-stone-600 rounded-sm"></div>
            <div className="w-1 h-4 bg-stone-600 rounded-sm"></div>
          </div>
        ) : (
          // Play icon  
          <div className="w-0 h-0 border-l-[6px] border-l-stone-600 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-0.5"></div>
        )}
      </div>
    </button>
  );
}

/**
 * Main atmospheric layer component that applies domain-specific environmental effects
 * 
 * @param {object} props
 * @param {string|null} props.domain - Current ecosystem domain  
 * @param {boolean} props.enableAudio - Whether to enable atmospheric audio
 * @param {boolean} props.enableParticles - Whether to enable particle effects
 * @param {string} props.className - Additional CSS classes
 */
export function AtmosphericLayer({ 
  domain, 
  enableAudio = false, 
  enableParticles = true,
  className = '' 
}) {
  const theme = getEcosystemTheme(domain);
  const season = getCurrentSeason();
  const seasonalAdaptations = domain ? getSeasonalAdaptations(theme.key) : null;

  if (theme.key === 'neutral') {
    return null; // No atmospheric effects for neutral theme
  }

  const atmosphericIntensity = seasonalAdaptations?.atmosphericIntensity || 'moderate';

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Gradient overlays */}
      <GradientOverlay
        primaryGradient={theme.atmosphericElements.primaryGradient}
        secondaryGradient={theme.atmosphericElements.secondaryGradient}
        opacity={atmosphericIntensity === 'peak' ? 0.5 : atmosphericIntensity === 'gentle' ? 0.25 : 0.35}
      />
      
      {/* Particle effects */}
      {enableParticles && (
        <ParticleField
          particleColor={theme.atmosphericElements.particleColor}
          intensity={atmosphericIntensity}
          count={theme.key === 'sky' ? 40 : theme.key === 'water' ? 25 : 30}
        />
      )}
      
      {/* Atmospheric audio */}
      {enableAudio && theme.atmosphericElements.ambientSound && (
        <AtmosphericAudio
          ambientSound={theme.atmosphericElements.ambientSound}
          domain={domain}
          enabled={enableAudio}
        />
      )}
    </div>
  );
}

/**
 * Seasonal atmospheric indicator component
 */
export function SeasonalIndicator({ domain, className = '' }) {
  const season = getCurrentSeason();
  const theme = getEcosystemTheme(domain);
  const seasonalAdaptations = domain ? getSeasonalAdaptations(theme.key) : null;

  if (!seasonalAdaptations) return null;

  const seasonEmojis = {
    spring: '🌱',
    summer: '☀️', 
    autumn: '🍂',
    winter: '❄️'
  };

  return (
    <div className={`inline-flex items-center gap-2 text-xs text-stone-600 ${className}`}>
      <span className="text-sm">{seasonEmojis[season]}</span>
      <span className="font-medium capitalize">{season}</span>
      <span className="opacity-70">·</span>
      <span className="italic">{seasonalAdaptations.seasonalAspect}</span>
    </div>
  );
}