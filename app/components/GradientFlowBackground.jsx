import { useEffect, useRef } from 'react';

/**
 * @param {Object} props
 * @param {string} [props.className]
 * @param {'low' | 'medium' | 'high'} [props.intensity]
 * @param {string} [props.color]
 */
export default function GradientFlowBackground({
  className = '',
  intensity = 'medium',
  color = 'rgba(0, 0, 0, 0.08)',
}) {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef();
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

    const orbCount = intensity === 'low' ? 2 : intensity === 'medium' ? 3 : 4;
    const orbs = [];
    const rect = canvas.getBoundingClientRect();
    
    // Create gradient orbs
    for (let i = 0; i < orbCount; i++) {
      orbs.push({
        radius: 200 + Math.random() * 150,
        baseX: Math.random() * rect.width,
        baseY: Math.random() * rect.height,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        offsetX: Math.random() * Math.PI * 2,
        offsetY: Math.random() * Math.PI * 2,
        amplitudeX: rect.width * (0.2 + Math.random() * 0.2),
        amplitudeY: rect.height * (0.2 + Math.random() * 0.2),
      });
    }

    // Animation loop
    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      // Clear with slight fade for smooth trails
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.fillRect(0, 0, width, height);
      
      timeRef.current += 0.005; // Slow movement

      // Draw gradient orbs
      orbs.forEach((orb, index) => {
        // Calculate position with slow sine wave movement
        const x = orb.baseX + Math.sin(timeRef.current * orb.speedX + orb.offsetX) * orb.amplitudeX;
        const y = orb.baseY + Math.sin(timeRef.current * orb.speedY + orb.offsetY) * orb.amplitudeY;
        
        // Create radial gradient
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, orb.radius);
        const baseOpacity = parseFloat(color.match(/[\d.]+(?=\))/)?.[0] || '0.08');
        const maxOpacity = baseOpacity * 0.5 * (1 - index * 0.15);
        
        gradient.addColorStop(0, `rgba(0, 0, 0, ${maxOpacity * 0.6})`);
        gradient.addColorStop(0.5, `rgba(0, 0, 0, ${maxOpacity * 0.2})`);
        gradient.addColorStop(1, `rgba(0, 0, 0, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      });

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
