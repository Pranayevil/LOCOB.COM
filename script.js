// script.js — Local Collab interactive behaviors: enhanced dark mode with full theme support
(() => {
  // Helpers
  const q = (sel, ctx = document) => ctx.querySelector(sel);
  const qa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  // Elements
  const html = document.documentElement;
  const hamburger = q('#hamburger');
  const nav = q('#main-nav');
  const darkToggle = q('#dark-toggle');
  const form = q('#contact-form');
  const formStatus = q('#form-status');
  const yearEl = q('#year');

  // Set current year
  yearEl.textContent = new Date().getFullYear();

  /* ===== Mobile nav ===== */
  hamburger.addEventListener('click', () => {
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open');
    if (!expanded) {
      const firstLink = nav.querySelector('a');
      firstLink && firstLink.focus();
    }
  });

  // Close nav when link clicked (mobile)
  qa('#main-nav a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }));

  /* ===== Smooth scroll for internal links ===== */
  qa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href === '#' || href === '#!') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({behavior: 'smooth', block: 'start'});
      }
    });
  });

  /* ===== Enhanced Dark mode toggle with system preference ===== */
  const THEME_KEY = 'localcollab_theme';
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  
  const setTheme = (theme, save = true) => {
    // Remove any existing theme classes
    html.removeAttribute('data-theme');
    
    if (theme === 'dark') {
      html.setAttribute('data-theme', 'dark');
      darkToggle.innerHTML = '☀';
      darkToggle.setAttribute('aria-pressed', 'true');
      darkToggle.setAttribute('title', 'Switch to light mode');
    } else {
      html.setAttribute('data-theme', 'light');
      darkToggle.innerHTML = '🌙';
      darkToggle.setAttribute('aria-pressed', 'false');
      darkToggle.setAttribute('title', 'Switch to dark mode');
    }
    
    if (save) {
      try { 
        localStorage.setItem(THEME_KEY, theme); 
      } catch(e) { /* ignore */ }
    }
    
    // Dispatch custom event for theme change
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  };

  // Initialize theme
  const initTheme = () => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved) {
        setTheme(saved, false);
      } else if (prefersDark.matches) {
        setTheme('dark', false);
      }
    } catch(e) { /* ignore localStorage errors */ }
  };

  // Listen for system theme changes
  prefersDark.addEventListener('change', (e) => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (!saved) {
        setTheme(e.matches ? 'dark' : 'light', false);
      }
    } catch(e) { /* ignore */ }
  });

  // Theme toggle click handler
  darkToggle.addEventListener('click', () => {
    const isDark = html.getAttribute('data-theme') === 'dark';
    setTheme(isDark ? 'light' : 'dark');
  });

  // Initialize theme on load
  initTheme();

  /* ===== EmailJS Contact Form Integration ===== */
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formStatus.textContent = '';
    
    const name = q('#name', form).value.trim();
    const email = q('#email', form).value.trim();
    const message = q('#message', form).value.trim();

    // Basic validation
    if (!name || !email || !message) {
      formStatus.textContent = 'Please complete all required fields.';
      return;
    }
    if (!validateEmail(email)) {
      formStatus.textContent = 'Please enter a valid email address.';
      return;
    }

    // EmailJS configuration - replace with your actual values
    const serviceID = 'service_ky13k3q'; // Replace with your EmailJS service ID
    const templateID = 'template_o0m5k6u'; // Replace with your EmailJS template ID
    
    const templateParams = {
      from_name: name,
      from_email: email,
      message: message,
      to_email: 'locobcom@gmail.com'
    };

    // Disable submit button and show loading
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    formStatus.textContent = 'Sending message...';

    try {
      const response = await emailjs.send(service_ky13k3q, template_o0m5k6u, templateParams);
      
      if (response.status === 200) {
        form.reset();
        formStatus.textContent = 'Thanks — your message has been sent! We’ll get back soon.';
        setTimeout(() => formStatus.textContent = '', 5000);
      }
    } catch (error) {
      console.error('EmailJS Error:', error);
      formStatus.textContent = 'Failed to send message. Please try again later.';
    } finally {
      submitButton.disabled = false;
    }
  });

  // Reset message on clear
  form.addEventListener('reset', () => {
    setTimeout(() => { formStatus.textContent = 'Form cleared.' }, 0);
  });

  /* ===== Accessibility: close mobile nav on Escape ===== */
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (nav.classList.contains('open')) {
        nav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.focus();
      }
    }
  });

  /* ===== Theme change animations ===== */
  window.addEventListener('themechange', (e) => {
    // Add a subtle animation when theme changes
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    
    // Remove transition after animation completes
    setTimeout(() => {
      document.body.style.transition = '';
    }, 300);
  });
  

  /* ===== Add keyboard shortcuts ===== */
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Shift + L to toggle theme
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
      e.preventDefault();
      const isDark = html.getAttribute('data-theme') === 'dark';
      setTheme(isDark ? 'light' : 'dark');
    }
  });

})();