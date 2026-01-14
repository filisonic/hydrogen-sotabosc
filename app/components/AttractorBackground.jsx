import { useEffect, useRef } from 'react';

/**
 * @param {Object} props
 * @param {string} [props.className]
 * @param {'low' | 'medium' | 'high'} [props.intensity]
 * @param {string} [props.color]
 */
export default function AttractorBackground({
  className = '',
  intensity = 'medium',
  color = 'rgba(0, 0, 0, 0.08)',
}) {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef();
  const mouseRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    // Attractor points (fixed positions)
    const attractorCount = intensity === 'low' ? 2 : intensity === 'medium' ? 3 : 4;
    const attractors = [];
    const rect = canvas.getBoundingClientRect();
    
    for (let i = 0; i < attractorCount; i++) {
      attractors.push({
        x: (rect.width / (attractorCount + 1)) * (i + 1) + Math.random() * 100 - 50,
        y: rect.height / 2 + (Math.random() - 0.5) * 200,
        strength: 0.5 + Math.random() * 0.5,
        radius: 80 + Math.random() * 60,
      });
    }

    // Particles
    const particleCount = intensity === 'low' ? 40 : intensity === 'medium' ? 60 : 80;
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 3 + 2,
        opacity: Math.random() * 0.4 + 0.3,
      });
    }

    // Animation loop
    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      ctx.clearRect(0, 0, width, height);
      
      // Update attractor positions (slow circular motion)
      timeRef.current += 0.01;
      attractors.forEach((attractor, index) => {
        const angle = timeRef.current + (index * Math.PI * 2) / attractorCount;
        attractor.x = width / 2 + Math.cos(angle) * (width * 0.25);
        attractor.y = height / 2 + Math.sin(angle * 0.7) * (height * 0.25);
      });

      // Update and draw particles
      particles.forEach((particle) => {
        // Apply attraction from each attractor
        attractors.forEach((attractor) => {
          const dx = attractor.x - particle.x;
          const dy = attractor.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < attractor.radius) {
            const force = (1 - distance / attractor.radius) * attractor.strength * 0.05;
            particle.vx += (dx / distance) * force;
            particle.vy += (dy / distance) * force;
          }
        });

        // Apply damping
        particle.vx *= 0.96;
        particle.vy *= 0.96;

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = width;
        if (particle.x > width) particle.x = 0;
        if (particle.y < 0) particle.y = height;
        if (particle.y > height) particle.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        const fillColor = color.replace(/[\d.]+(?=\))/, particle.opacity.toString());
        ctx.fillStyle = fillColor;
        ctx.fill();
      });

      // Draw connections between nearby particles
      const maxDistance = 120;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const baseOpacity = parseFloat(color.match(/[\d.]+(?=\))/)?.[0] || '0.08');
            const opacity = (1 - distance / maxDistance) * baseOpacity * 2;
            ctx.strokeStyle = `rgba(0, 0, 0, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [intensity, color]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ mixBlendMode: 'multiply', zIndex: 0 }}
    />
  );
}
