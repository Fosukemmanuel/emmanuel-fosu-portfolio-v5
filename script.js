document.addEventListener('DOMContentLoaded', () => {

  /* ============ FOOTER YEAR ============ */
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  /* ============ MOBILE MENU ============ */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  if(hamburger && mobileMenu){
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    mobileMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ============ THEME TOGGLE (light/dark) ============ */
  const themeToggle = document.getElementById('theme-toggle');
  const iconSun = document.getElementById('icon-sun');
  const iconMoon = document.getElementById('icon-moon');
  const root = document.documentElement;

  function applyTheme(theme){
    if(theme === 'dark'){
      root.setAttribute('data-theme', 'dark');
      if(iconSun) iconSun.style.display = 'none';
      if(iconMoon) iconMoon.style.display = 'block';
    } else {
      root.removeAttribute('data-theme');
      if(iconSun) iconSun.style.display = 'block';
      if(iconMoon) iconMoon.style.display = 'none';
    }
  }

  const savedTheme = (() => {
    try { return localStorage.getItem('ef-theme'); } catch(e){ return null; }
  })();
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

  if(themeToggle){
    themeToggle.addEventListener('click', () => {
      const isDark = root.getAttribute('data-theme') === 'dark';
      const next = isDark ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem('ef-theme', next); } catch(e){ /* ignore */ }
    });
  }

  /* ============ COPY EMAIL TO CLIPBOARD - FIXED ============ */
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      // REMOVED e.preventDefault() and e.stopPropagation()
      // This allows the mailto link to work while still copying
      
      const email = btn.getAttribute('data-email');
      const feedback = btn.parentElement.querySelector('.copy-feedback');
      
      if (!email) return;
      
      try {
        await navigator.clipboard.writeText(email);
        if (feedback) {
          feedback.textContent = 'Copied!';
          feedback.classList.add('show');
          setTimeout(() => feedback.classList.remove('show'), 1800);
        }
      } catch (err) {
        // Fallback for browsers that don't support clipboard API
        try {
          // Create a temporary input element for fallback
          const tempInput = document.createElement('input');
          tempInput.value = email;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand('copy');
          document.body.removeChild(tempInput);
          
          if (feedback) {
            feedback.textContent = 'Copied!';
            feedback.classList.add('show');
            setTimeout(() => feedback.classList.remove('show'), 1800);
          }
        } catch (fallbackErr) {
          if (feedback) {
            feedback.textContent = 'Copy failed';
            feedback.classList.add('show');
            setTimeout(() => feedback.classList.remove('show'), 1800);
          }
        }
      }
    });
  });

  /* ============ CONTACT FORM VALIDATION ============ */
  const form = document.getElementById('contact-form');

  if(form){
    const status = document.getElementById('form-status');

    function validateField(field){
      const wrapper = field.closest('.field');
      let valid = field.checkValidity();
      if(field.type === 'email' && field.value.trim() !== ''){
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        valid = emailPattern.test(field.value.trim());
      }
      wrapper.classList.toggle('invalid', !valid);
      return valid;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault(); // always handle submission ourselves via fetch

      const fields = form.querySelectorAll('input[required], textarea[required]');
      let allValid = true;

      fields.forEach(field => {
        if(!validateField(field)) allValid = false;
      });

      if(!allValid){
        status.textContent = 'Please fix the highlighted fields before sending.';
        status.style.color = '#C0392B';
        return;
      }

      status.textContent = 'Sending…';
      status.style.color = '';

      const submitBtn = form.querySelector('button[type="submit"]');
      if(submitBtn) submitBtn.disabled = true;

      const data = new URLSearchParams(new FormData(form)).toString();

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data
      })
        .then((res) => {
          if(!res.ok) throw new Error('Network response was not ok');
          status.textContent = "Thanks! Your message has been sent — I'll get back to you soon.";
          status.style.color = '#1E7145';
          form.reset();
        })
        .catch((err) => {
          console.error('Form submission error:', err);
          status.textContent = 'Something went wrong. Please email me directly at fosukemmanuel@gmail.com.';
          status.style.color = '#C0392B';
        })
        .finally(() => {
          if(submitBtn) submitBtn.disabled = false;
        });
    });

    form.querySelectorAll('input, textarea').forEach(field => {
      field.addEventListener('blur', () => {
        if(field.hasAttribute('required')) validateField(field);
      });
    });
  }

  /* ============ HERO NODE NETWORK CANVAS (home page only) ============ */
  const canvas = document.getElementById('node-canvas');
  if(!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, nodes;
  const NODE_COUNT_BASE = 45;

  function resize(){
    const hero = document.querySelector('.hero');
    width = canvas.width = hero.offsetWidth;
    height = canvas.height = hero.offsetHeight;
  }

  function initNodes(){
    const count = Math.min(NODE_COUNT_BASE, Math.floor((width * height) / 18000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
    }));
  }

  function draw(){
    ctx.clearRect(0, 0, width, height);
    const isDark = root.getAttribute('data-theme') === 'dark';
    const dotColor = isDark ? 'rgba(62,124,177,0.9)' : 'rgba(11,37,69,0.55)';
    const lineColorBase = isDark ? '62,124,177' : '19,49,74';

    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      if(n.x < 0 || n.x > width) n.vx *= -1;
      if(n.y < 0 || n.y > height) n.vy *= -1;
    });

    for(let i = 0; i < nodes.length; i++){
      for(let j = i + 1; j < nodes.length; j++){
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if(dist < 140){
          ctx.strokeStyle = `rgba(${lineColorBase},${(1 - dist / 140) * 0.35})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    nodes.forEach(n => {
      ctx.fillStyle = dotColor;
      ctx.beginPath();
      ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setupCanvas(){
    resize();
    initNodes();
    if(!reduceMotion){
      requestAnimationFrame(draw);
    } else {
      draw(); // draw a single static frame
    }
  }

  setupCanvas();
  window.addEventListener('resize', () => {
    resize();
    initNodes();
  });

});
