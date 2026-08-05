import { ref, onMounted, onUnmounted } from 'vue';

export function useParticleBackground(canvasRef) {
  const mouse = ref({ x: -1000, y: -1000 });
  let ctx, width, height, animId;
  let particles = [];
  const PARTICLE_COUNT = 48;
  const CONNECTION_DIST = 110;
  const MOUSE_RADIUS = 160;

  const colors = [
    { r: 56, g: 189, b: 248 },  // sky-400
    { r: 139, g: 92, b: 246 },  // violet-500
    { r: 217, g: 70, b: 239 },  // fuchsia-500
    { r: 96, g: 165, b: 250 },  // blue-400
    { r: 192, g: 132, b: 252 }, // purple-400
  ];

  class Particle {
    constructor() {
      this.reset(true);
    }
    reset(initial = false) {
      this.x = initial ? Math.random() * width : (Math.random() < 0.5 ? -20 : width + 20);
      this.y = initial ? Math.random() * height : Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = (Math.random() - 0.5) * 0.6;
      this.size = Math.random() * 1.8 + 0.8;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.opacity = Math.random() * 0.5 + 0.15;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Mouse repulsion
      const dx = this.x - mouse.value.x;
      const dy = this.y - mouse.value.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS && dist > 0) {
        const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
        this.vx += (dx / dist) * force * 0.15;
        this.vy += (dy / dist) * force * 0.15;
      }

      // Speed damping
      this.vx *= 0.998;
      this.vy *= 0.998;

      // Wrap around edges
      if (this.x < -20) this.x = width + 20;
      if (this.x > width + 20) this.x = -20;
      if (this.y < -20) this.y = height + 20;
      if (this.y > height + 20) this.y = -20;
    }
    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color.r},${this.color.g},${this.color.b},${this.opacity})`;
      ctx.fill();
    }
  }

  function init() {
    const canvas = canvasRef.value;
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
  }

  function resize() {
    const canvas = canvasRef.value;
    if (!canvas) return;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }

  function animate() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.update();
      p.draw(ctx);
    });

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.12;
          const midColor = {
            r: Math.round((particles[i].color.r + particles[j].color.r) / 2),
            g: Math.round((particles[i].color.g + particles[j].color.g) / 2),
            b: Math.round((particles[i].color.b + particles[j].color.b) / 2),
          };
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${midColor.r},${midColor.g},${midColor.b},${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    animId = requestAnimationFrame(animate);
  }

  function onMouseMove(e) {
    mouse.value = { x: e.clientX, y: e.clientY };
  }

  onMounted(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', resize);
    init();
    animate();
  });

  onUnmounted(() => {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('resize', resize);
    if (animId) cancelAnimationFrame(animId);
  });
}
