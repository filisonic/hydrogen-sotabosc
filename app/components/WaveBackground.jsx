import { useEffect, useRef } from 'react';

/**
 * @param {Object} props
 * @param {string} [props.className]
 * @param {'low' | 'medium' | 'high'} [props.intensity]
 * @param {string} [props.color]
 */
export default function WaveBackground({
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

    const waveCount = intensity === 'low' ? 3 : intensity === 'medium' ? 4 : 5;
    const waves = [];
    const rect = canvas.getBoundingClientRect();
    
    // Create multiple waves with different properties
    for (let i = 0; i < waveCount; i++) {
      waves.push({
        amplitude: 30 + Math.random() * 50,
        frequency: 0.006 + Math.random() * 0.004,
        speed: 2 + Math.random() * 2,
        offset: Math.random() * Math.PI * 2,
        baseY: (rect.height / (waveCount + 1)) * (i + 1),
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Animation loop
    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      ctx.clearRect(0, 0, width, height);
      
      // Increment time for smooth animation
      timeRef.current += 0.03;

      // Draw waves
      waves.forEach((wave, index) => {
        // Create a gradient for the wave
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        const baseOpacity = parseFloat(color.match(/[\d.]+(?=\))/)?.[0] || '0.08');
        const waveOpacity = baseOpacity * 0.5 * (1 - index * 0.1);
        
        gradient.addColorStop(0, `rgba(0, 0, 0, 0)`);
        gradient.addColorStop(0.3, `rgba(0, 0, 0, ${waveOpacity * 0.4})`);
        gradient.addColorStop(0.5, `rgba(0, 0, 0, ${waveOpacity})`);
        gradient.addColorStop(0.7, `rgba(0, 0, 0, ${waveOpacity * 0.4})`);
        gradient.addColorStop(1, `rgba(0, 0, 0, 0)`);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Draw the wave path
        ctx.beginPath();
        let firstPoint = true;
        for (let x = 0; x < width; x += 2) {
          // Multiple sine waves combined for more organic movement
          const y1 = Math.sin((x * wave.frequency) + (timeRef.current * wave.speed) + wave.offset) * wave.amplitude;
          const y2 = Math.sin((x * wave.frequency * 2.3) + (timeRef.current * wave.speed * 1.5) + wave.phase) * (wave.amplitude * 0.3);
          const y = wave.baseY + y1 + y2;
          
          if (firstPoint) {
            ctx.moveTo(x, y);
            firstPoint = false;
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
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
