(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Starfield ---------- */
  const canvas = document.getElementById("stars");
  const ctx = canvas.getContext("2d");
  const colors = ["#ffffff", "#7f5af0", "#2cb1bc", "#ff6ad5"];
  let stars = [];
  let w = 0, h = 0, dpr = 1;
  const mouse = { x: -9999, y: -9999 };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(160, (w * h) / 9000));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.3,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      c: colors[Math.floor(Math.random() * colors.length)],
      t: Math.random() * Math.PI * 2,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      s.x += s.vx; s.y += s.vy; s.t += 0.02;
      if (s.x < 0) s.x = w; if (s.x > w) s.x = 0;
      if (s.y < 0) s.y = h; if (s.y > h) s.y = 0;
      ctx.globalAlpha = 0.5 + Math.sin(s.t) * 0.35;
      ctx.fillStyle = s.c;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    // Constellation lines near the cursor
    ctx.lineWidth = 0.6;
    for (let i = 0; i < stars.length; i++) {
      const a = stars[i];
      const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
      if (dm > 180) continue;
      for (let j = i + 1; j < stars.length; j++) {
        const b = stars[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 110) {
          ctx.globalAlpha = (1 - d / 110) * (1 - dm / 180) * 0.8;
          ctx.strokeStyle = "#7f5af0";
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    if (!reduceMotion) requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener("resize", () => { resize(); if (reduceMotion) draw(); });

  /* ---------- Cursor glow ---------- */
  const glow = document.querySelector(".cursor-glow");
  window.addEventListener("pointermove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    if (glow) glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  });

  /* ---------- Typewriter ---------- */
  const typed = document.getElementById("typed");
  const phrases = [
    "CS student @ HUST 🎓",
    "teaching cameras to sort things 📷",
    "embedded vision · algorithms · LaTeX",
  ];
  if (reduceMotion) {
    typed.textContent = phrases[0];
  } else {
    let p = 0, i = 0, deleting = false;
    const tick = () => {
      const word = Array.from(phrases[p]);
      i += deleting ? -1 : 1;
      typed.textContent = word.slice(0, i).join("");
      let delay = deleting ? 35 : 70;
      if (!deleting && i === word.length) { deleting = true; delay = 1600; }
      else if (deleting && i === 0) { deleting = false; p = (p + 1) % phrases.length; delay = 400; }
      setTimeout(tick, delay);
    };
    tick();
  }

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
    }
  }, { threshold: 0.15 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  /* ---------- 3D tilt project card ---------- */
  const card = document.querySelector(".project-card");
  if (card && !reduceMotion && window.matchMedia("(hover: hover)").matches) {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 10}deg) rotateY(${(x - 0.5) * 12}deg) translateY(-4px)`;
      card.style.setProperty("--mx", `${x * 100}%`);
      card.style.setProperty("--my", `${y * 100}%`);
    });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; });
  }

  document.getElementById("year").textContent = new Date().getFullYear();
})();
