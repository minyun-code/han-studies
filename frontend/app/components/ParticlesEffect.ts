export function createParticlesEffect(canvas: HTMLCanvasElement, p0?: { particleColor: string; lineColor: string; }) {
    if (!canvas) return;
  
    const ctx = canvas.getContext("2d");
    if (!ctx) return; // 确保 ctx 不为 null
  
    // 设置画布大小
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  
    const particles = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 1,
      speed: Math.random() * 0.5 + 0.2,
    }));
  
    function animate() {
      if (!ctx) return; // 再次检查 ctx
  
      ctx.clearRect(0, 0, canvas.width, canvas.height);
  
      particles.forEach((p) => {
        p.y -= p.speed;
        if (p.y < 0) p.y = canvas.height;
  
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(200,200,200,0.15)";
        ctx.fill();
      });
  
      requestAnimationFrame(animate);
    }
  
    animate();
  }
  