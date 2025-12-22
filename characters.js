// characters.js - Santa & Christmas Tree Particle Animation
(function() {
  'use strict';

  const canvas = document.getElementById('characters');
  if (!canvas) {
    console.error('Canvas #characters not found!');
    return;
  }

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId = null;
  let mouseX = -9999;
  let mouseY = -9999;

  // Santa Claus pixel art (bigger and more detailed)
  const santaPattern = [
    [0,0,0,0,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,1,2,2,2,2,2,2,2,2,1,0,0],
    [0,1,2,2,2,2,2,2,2,2,2,2,1,0],
    [0,1,2,3,3,2,2,2,2,3,3,2,1,0],
    [0,1,2,3,3,2,2,2,2,3,3,2,1,0],
    [0,1,2,2,2,4,2,2,4,2,2,2,1,0],
    [0,1,2,2,2,2,2,2,2,2,2,2,1,0],
    [0,0,1,2,2,5,5,5,5,2,2,1,0,0],
    [0,0,0,1,1,5,5,5,5,1,1,0,0,0],
    [0,0,1,1,1,1,5,5,1,1,1,1,0,0],
    [0,1,6,6,6,6,6,6,6,6,6,6,1,0],
    [1,6,6,6,6,6,6,6,6,6,6,6,6,1],
    [1,6,6,6,6,6,6,6,6,6,6,6,6,1],
    [1,6,6,6,6,6,6,6,6,6,6,6,6,1],
    [0,1,6,6,6,6,6,6,6,6,6,6,1,0],
    [0,0,1,7,7,6,6,6,6,7,7,1,0,0],
    [0,0,0,1,7,7,1,1,7,7,1,0,0,0],
    [0,0,0,1,7,7,1,1,7,7,1,0,0,0],
    [0,0,0,0,1,1,0,0,1,1,0,0,0,0],
  ];

  // Christmas Tree pixel art (bigger)
  const treePattern = [
    [0,0,0,0,0,8,8,0,0,0,0,0],
    [0,0,0,0,8,8,8,8,0,0,0,0],
    [0,0,0,8,8,8,8,8,8,0,0,0],
    [0,0,8,8,8,9,8,8,8,8,0,0],
    [0,8,8,8,8,8,8,8,8,8,8,0],
    [8,8,8,9,8,8,8,9,8,8,8,8],
    [0,0,8,8,8,8,8,8,8,8,0,0],
    [0,8,8,8,8,9,8,8,8,8,8,0],
    [8,8,8,8,8,8,8,8,8,8,8,8],
    [0,8,8,8,8,8,8,8,8,8,8,0],
    [0,0,8,8,9,8,8,9,8,8,0,0],
    [0,8,8,8,8,8,8,8,8,8,8,0],
    [8,8,8,9,8,8,8,8,9,8,8,8],
    [0,8,8,8,8,8,8,8,8,8,8,0],
    [0,0,0,10,10,10,10,10,0,0,0],
    [0,0,0,10,10,10,10,10,0,0,0],
    [0,0,0,10,10,10,10,10,0,0,0],
  ];

  // Enhanced color palette with glow
  const colors = {
    0: 'transparent',
    1: '#FFFFFF',   // white outline/beard
    2: '#FFE4C4',   // skin tone
    3: '#1A1A1A',   // eyes
    4: '#FF69B4',   // rosy cheeks
    5: '#C41E3A',   // mouth/nose
    6: '#DC143C',   // santa suit red
    7: '#2C2C2C',   // boots/belt
    8: '#228B22',   // tree green
    9: '#FFD700',   // gold ornaments
    10: '#8B4513',  // brown trunk
  };

  // Glow colors for particles
  const glowColors = {
    1: 'rgba(255,255,255,0.8)',
    2: 'rgba(255,228,196,0.6)',
    3: 'rgba(26,26,26,0.5)',
    4: 'rgba(255,105,180,0.7)',
    5: 'rgba(196,30,58,0.6)',
    6: 'rgba(220,20,60,0.8)',
    7: 'rgba(44,44,44,0.5)',
    8: 'rgba(34,139,34,0.7)',
    9: 'rgba(255,215,0,0.9)',
    10: 'rgba(139,69,19,0.6)',
  };

  // Particle class
  class Particle {
    constructor(targetX, targetY, color, colorIndex, size) {
      // Random starting position (scattered)
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      
      this.targetX = targetX;
      this.targetY = targetY;
      this.color = color;
      this.colorIndex = colorIndex;
      this.size = size;
      
      // Velocity
      this.vx = 0;
      this.vy = 0;
      
      // Drift animation (like drones)
      this.driftAngle = Math.random() * Math.PI * 2;
      this.driftSpeed = 0.3 + Math.random() * 0.3;
      this.driftRadius = 2 + Math.random() * 3;
      
      // Individual timing offset
      this.timeOffset = Math.random() * 1000;
      
      // Original target for drift calculation
      this.baseX = targetX;
      this.baseY = targetY;
    }

    update(time, mouseX, mouseY) {
      // Calculate drift position (circular motion like drone hovering)
      const driftX = Math.cos(time * 0.001 * this.driftSpeed + this.timeOffset) * this.driftRadius;
      const driftY = Math.sin(time * 0.001 * this.driftSpeed + this.timeOffset) * this.driftRadius;
      
      // Update target with drift
      const currentTargetX = this.baseX + driftX;
      const currentTargetY = this.baseY + driftY;
      
      // Calculate distance to target
      let dx = currentTargetX - this.x;
      let dy = currentTargetY - this.y;
      
      // Mouse interaction - repel particles
      const mouseDistX = mouseX - this.x;
      const mouseDistY = mouseY - this.y;
      const mouseDist = Math.sqrt(mouseDistX * mouseDistX + mouseDistY * mouseDistY);
      const repelRadius = 120;
      
      if (mouseDist < repelRadius && mouseDist > 0) {
        const repelForce = (1 - mouseDist / repelRadius) * 8;
        dx -= (mouseDistX / mouseDist) * repelForce;
        dy -= (mouseDistY / mouseDist) * repelForce;
      }
      
      // Spring physics (smooth drone-like movement)
      const spring = 0.018;
      const friction = 0.88;
      
      this.vx += dx * spring;
      this.vy += dy * spring;
      
      this.vx *= friction;
      this.vy *= friction;
      
      this.x += this.vx;
      this.y += this.vy;
    }

    draw(ctx, time) {
      // Breathing effect on size
      const breathe = 1 + Math.sin(time * 0.002 + this.timeOffset) * 0.08;
      const currentSize = this.size * breathe;
      
      // Enhanced glow effect
      const glowSize = currentSize * 3;
      const gradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, glowSize
      );
      
      gradient.addColorStop(0, this.color);
      gradient.addColorStop(0.4, glowColors[this.colorIndex] || this.color);
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      
      // Draw glow
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw core particle
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
      ctx.fill();
      
      // Extra bright center
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, currentSize * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Initialize particles from patterns
  function initParticles() {
    particles = [];
    
    const particleSize = window.innerWidth < 768 ? 4 : 6;
    const spacing = window.innerWidth < 768 ? 2 : 2.5;
    
    // Santa position (left side)
    const santaX = window.innerWidth * 0.25;
    const santaY = window.innerHeight * 0.5;
    const santaScale = window.innerWidth < 768 ? 3 : 4;
    
    santaPattern.forEach((row, y) => {
      row.forEach((pixel, x) => {
        if (pixel !== 0) {
          const targetX = santaX + (x - santaPattern[0].length / 2) * particleSize * spacing * santaScale;
          const targetY = santaY + (y - santaPattern.length / 2) * particleSize * spacing * santaScale;
          
          particles.push(new Particle(
            targetX,
            targetY,
            colors[pixel],
            pixel,
            particleSize
          ));
        }
      });
    });
    
    // Tree position (right side)
    const treeX = window.innerWidth * 0.75;
    const treeY = window.innerHeight * 0.5;
    const treeScale = window.innerWidth < 768 ? 3.5 : 5;
    
    treePattern.forEach((row, y) => {
      row.forEach((pixel, x) => {
        if (pixel !== 0) {
          const targetX = treeX + (x - treePattern[0].length / 2) * particleSize * spacing * treeScale;
          const targetY = treeY + (y - treePattern.length / 2) * particleSize * spacing * treeScale;
          
          particles.push(new Particle(
            targetX,
            targetY,
            colors[pixel],
            pixel,
            particleSize
          ));
        }
      });
    });
  }

  // Resize canvas
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
  }

  // Animation loop
  function animate() {
    const time = Date.now();
    
    // Clear with slight trail effect for smooth motion
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw all particles
    particles.forEach(particle => {
      particle.update(time, mouseX, mouseY);
      particle.draw(ctx, time);
    });
    
    animationId = requestAnimationFrame(animate);
  }

  // Mouse tracking
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  canvas.addEventListener('mouseleave', () => {
    mouseX = -9999;
    mouseY = -9999;
  });

  // Touch support
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    mouseX = touch.clientX - rect.left;
    mouseY = touch.clientY - rect.top;
  }, { passive: false });

  canvas.addEventListener('touchend', () => {
    mouseX = -9999;
    mouseY = -9999;
  });

  // Window resize
  window.addEventListener('resize', resizeCanvas);

  // Initialize
  resizeCanvas();
  animate();

  console.log('🎅 Santa & 🎄 Tree characters loaded!');
  console.log(`Total particles: ${particles.length}`);

})();
