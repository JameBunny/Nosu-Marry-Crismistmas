import React, { useState, useEffect, useRef } from 'react';

const SantaTreeCharacters = () => {
  const canvasRef = useRef(null);
  const [particles, setParticles] = useState([]);
  const animationRef = useRef(null);

  // Santa Claus pixel art pattern (simplified)
  const santaPattern = [
    [0,0,0,1,1,1,1,0,0,0],
    [0,0,1,2,2,2,2,1,0,0],
    [0,1,2,2,2,2,2,2,1,0],
    [0,1,2,3,2,2,3,2,1,0],
    [0,1,2,2,2,2,2,2,1,0],
    [0,0,1,2,4,4,2,1,0,0],
    [0,0,0,1,4,4,1,0,0,0],
    [0,0,1,5,5,5,5,1,0,0],
    [0,1,5,5,5,5,5,5,1,0],
    [1,5,5,5,5,5,5,5,5,1],
    [1,5,5,5,5,5,5,5,5,1],
    [0,1,6,6,5,5,6,6,1,0],
    [0,0,1,6,1,1,6,1,0,0],
    [0,0,1,1,0,0,1,1,0,0],
  ];

  // Christmas Tree pixel art pattern
  const treePattern = [
    [0,0,0,0,7,0,0,0,0],
    [0,0,0,7,7,7,0,0,0],
    [0,0,7,7,7,7,7,0,0],
    [0,7,7,8,7,8,7,7,0],
    [7,7,7,7,7,7,7,7,7],
    [0,0,7,7,7,7,7,0,0],
    [0,7,7,7,8,7,7,7,0],
    [7,7,7,7,7,7,7,7,7],
    [0,7,7,7,7,7,7,7,0],
    [7,7,7,8,7,8,7,7,7],
    [0,0,0,9,9,9,0,0,0],
    [0,0,0,9,9,9,0,0,0],
  ];

  // Color palette
  const colors = {
    0: 'transparent',
    1: '#FFFFFF', // white (outline/beard)
    2: '#FFD4A3', // skin
    3: '#000000', // eyes
    4: '#FF6B6B', // nose/mouth
    5: '#DC2626', // santa suit
    6: '#1F2937', // boots
    7: '#10B981', // tree green
    8: '#FCD34D', // ornaments (gold)
    9: '#8B4513', // trunk brown
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      const newParticles = [];
      const particleSize = 8;
      const spacing = 1.5;
      
      // Create Santa particles (left side)
      const santaX = window.innerWidth * 0.25;
      const santaY = window.innerHeight * 0.5;
      
      santaPattern.forEach((row, y) => {
        row.forEach((pixel, x) => {
          if (pixel !== 0) {
            newParticles.push({
              id: `santa-${x}-${y}`,
              targetX: santaX + (x - santaPattern[0].length / 2) * particleSize * spacing,
              targetY: santaY + (y - santaPattern.length / 2) * particleSize * spacing,
              currentX: Math.random() * canvas.width,
              currentY: Math.random() * canvas.height,
              color: colors[pixel],
              size: particleSize,
              vx: 0,
              vy: 0,
              character: 'santa'
            });
          }
        });
      });

      // Create Tree particles (right side)
      const treeX = window.innerWidth * 0.75;
      const treeY = window.innerHeight * 0.5;
      
      treePattern.forEach((row, y) => {
        row.forEach((pixel, x) => {
          if (pixel !== 0) {
            newParticles.push({
              id: `tree-${x}-${y}`,
              targetX: treeX + (x - treePattern[0].length / 2) * particleSize * spacing,
              targetY: treeY + (y - treePattern.length / 2) * particleSize * spacing,
              currentX: Math.random() * canvas.width,
              currentY: Math.random() * canvas.height,
              color: colors[pixel],
              size: particleSize,
              vx: 0,
              vy: 0,
              character: 'tree'
            });
          }
        });
      });

      setParticles(newParticles);
    };

    resize();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || particles.length === 0) return;

    const ctx = canvas.getContext('2d');
    let lastTime = Date.now();

    const animate = () => {
      const currentTime = Date.now();
      const deltaTime = (currentTime - lastTime) / 16.67; // normalize to 60fps
      lastTime = currentTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach(particle => {
        // Calculate distance to target
        const dx = particle.targetX - particle.currentX;
        const dy = particle.targetY - particle.currentY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Apply spring physics
        const spring = 0.02;
        const friction = 0.85;

        if (distance > 0.5) {
          particle.vx += dx * spring;
          particle.vy += dy * spring;
        }

        particle.vx *= friction;
        particle.vy *= friction;

        particle.currentX += particle.vx * deltaTime;
        particle.currentY += particle.vy * deltaTime;

        // Add slight floating animation
        const time = currentTime / 1000;
        const floatOffset = Math.sin(time * 2 + particle.currentX * 0.01) * 2;

        // Draw particle with glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = particle.color;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(
          particle.currentX,
          particle.currentY + floatOffset,
          particle.size / 2,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particles]);

  // Mouse interaction
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      setParticles(prev => prev.map(particle => {
        const dx = mouseX - particle.currentX;
        const dy = mouseY - particle.currentY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 150;

        if (distance < maxDistance) {
          const force = (1 - distance / maxDistance) * 3;
          return {
            ...particle,
            vx: particle.vx - (dx / distance) * force,
            vy: particle.vy - (dy / distance) * force
          };
        }
        return particle;
      }));
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    return () => canvas.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      overflow: 'hidden',
      background: 'transparent',
      position: 'fixed',
      top: 0,
      left: 0,
      pointerEvents: 'auto',
      zIndex: 2
    }}>
      <canvas 
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  );
};

export default SantaTreeCharacters;
