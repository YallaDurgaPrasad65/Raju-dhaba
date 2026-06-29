/* ============================================
   RAJU DHABA — Main JavaScript
   ============================================ */

'use strict';

/* ---- PRELOADER ---- */
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  setTimeout(() => {
    preloader.classList.add('hidden');
  }, 1200);
});

/* ---- PARTICLES ---- */
(function spawnParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;
  const count = 22;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      --dur: ${5 + Math.random() * 8}s;
      --delay: ${Math.random() * 6}s;
      width: ${2 + Math.random() * 5}px;
      height: ${2 + Math.random() * 5}px;
      opacity: 0;
    `;
    container.appendChild(p);
  }
})();

/* ---- NAVBAR SCROLL ---- */
const navbar  = document.getElementById('navbar');
const backTop = document.getElementById('back-top');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;

  // Navbar style on scroll
  if (scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Back-to-top button
  if (scrollY > 400) {
    backTop.classList.add('show');
  } else {
    backTop.classList.remove('show');
  }
}, { passive: true });

backTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ---- MOBILE NAV ---- */
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  mobileNav.classList.toggle('open');
  document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
});

function closeMobileNav() {
  hamburger.classList.remove('active');
  mobileNav.classList.remove('open');
  document.body.style.overflow = '';
}

/* ---- SCROLL REVEAL ---- */
const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, idx) => {
    if (entry.isIntersecting) {
      // Stagger children in grids
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach((el, i) => {
  // Add staggered delays for grid children
  if (el.closest('.menu-grid') || el.closest('.testimonials-grid') || el.closest('.gallery-grid')) {
    el.dataset.delay = (i % 3) * 100;
  }
  revealObserver.observe(el);
});

/* ---- ACTIVE NAV LINK HIGHLIGHT ---- */
const sections   = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAnchors.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

/* ---- MENU FILTER TABS ---- */
const menuTabs = document.querySelectorAll('.menu-tab');
const menuCards = document.querySelectorAll('.menu-card');

menuTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Update active tab
    menuTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const filter = tab.dataset.filter;

    menuCards.forEach((card, i) => {
      const category = card.dataset.category;
      const show = filter === 'all' || category === filter;

      if (show) {
        card.classList.remove('hidden');
        card.style.animationDelay = `${(i % 3) * 80}ms`;
        // Re-trigger reveal animation
        card.classList.remove('visible');
        setTimeout(() => card.classList.add('visible'), 50 + (i % 3) * 80);
      } else {
        card.classList.add('hidden');
      }
    });
  });
});


/* ---- LIGHTBOX ---- */
const lightbox     = document.getElementById('lightbox');
const lightboxImg  = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');

function openLightbox(src) {
  lightboxImg.src = src;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { lightboxImg.src = ''; }, 400);
}

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

/* ---- TOAST ---- */
let toastTimer;

function showToast(message, duration = 3000) {
  const toast   = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');

  toastMsg.textContent = message;
  toast.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

/* ---- RESERVATION FORM ---- */
async function handleReservation(e) {
  e.preventDefault();

  const btn  = document.getElementById('submitBtn');
  const form = document.getElementById('reservationForm');

  // Collect field values
  const fname   = document.getElementById('fname').value.trim();
  const lname   = document.getElementById('lname').value.trim();
  const phone   = document.getElementById('phone').value.trim();
  const date    = document.getElementById('date').value;
  const time    = document.getElementById('time').value;
  const guests  = document.getElementById('guests').value;
  const special = document.getElementById('special').value.trim();

  // Client-side guard
  if (!fname || !lname || !phone || !date || !time || !guests) {
    showToast('⚠️ Please fill in all required fields.');
    return;
  }

  // Loading state
  btn.textContent = '⏳ Confirming…';
  btn.disabled = true;

  try {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fname, lname, phone, date, time, guests, special })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      // Server returned validation errors or a 5xx
      const msg = data.errors ? data.errors.join(' ') : (data.error || 'Something went wrong.');
      throw new Error(msg);
    }

    // ✅ Success
    const booking = data.booking;
    btn.textContent = '✅ Reservation Confirmed!';
    btn.style.background = 'linear-gradient(135deg, #27AE60, #2ECC71)';

    showToast(
      `🎉 Table booked! Booking #${booking.id} for ${booking.fname} on ${formatDate(booking.date)} at ${formatTime(booking.time)} for ${booking.guests} guest(s).`,
      6000
    );

    // Reset form after a short delay
    setTimeout(() => {
      form.reset();
      btn.textContent = '✅ Confirm Reservation';
      btn.style.background = '';
      btn.disabled = false;
    }, 4000);

  } catch (err) {
    // ❌ Network or server error
    btn.textContent = '✅ Confirm Reservation';
    btn.style.background = '';
    btn.disabled = false;
    showToast(`❌ ${err.message}`, 5000);
  }
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(timeStr) {
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
}

/* ---- SET DATE MIN TO TODAY ---- */
(function setDateMin() {
  const dateInput = document.getElementById('date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }
})();

/* ---- SMOOTH ANCHOR SCROLL ---- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ---- HERO PARALLAX ---- */
window.addEventListener('scroll', () => {
  const hero = document.querySelector('#hero .hero-bg img');
  if (hero && window.scrollY < window.innerHeight) {
    hero.style.transform = `scale(1.08) translateY(${window.scrollY * 0.2}px)`;
  }
}, { passive: true });

/* ---- COUNTER ANIMATION ---- */
function animateCounter(el, target, suffix = '') {
  let start = 0;
  const duration = 1800;
  const step = Math.ceil(target / (duration / 16));
  const timer = setInterval(() => {
    start += step;
    if (start >= target) {
      start = target;
      clearInterval(timer);
    }
    el.textContent = start.toLocaleString('en-IN') + suffix;
  }, 16);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const nums = entry.target.querySelectorAll('.stat-num');
      const targets = [25, 80, 50000, 4.9];
      const suffixes = ['+', '+', '+', '★'];
      nums.forEach((el, i) => {
        if (i === 3) { el.textContent = '4.9★'; return; }
        animateCounter(el, targets[i], suffixes[i]);
      });
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const statsCard = document.querySelector('.stats-card');
if (statsCard) statsObserver.observe(statsCard);

/* ============================================================
   LOGIN MODAL SYSTEM
   ============================================================ */

/* ---- Open / Close ---- */
function openLoginModal(type) {
  const overlayId = type === 'admin' ? 'adminLoginOverlay' : 'customerLoginOverlay';
  const overlay = document.getElementById(overlayId);
  if (!overlay) return;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLoginModal(type) {
  const overlayId = type === 'admin' ? 'adminLoginOverlay' : 'customerLoginOverlay';
  const overlay = document.getElementById(overlayId);
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function handleOverlayClick(e, type) {
  const modalId = type === 'admin' ? 'adminLoginModal' : 'customerLoginModal';
  if (!document.getElementById(modalId).contains(e.target)) {
    closeLoginModal(type);
  }
}

/* Close modals on Escape key */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeLoginModal('customer');
    closeLoginModal('admin');
  }
});

/* ---- Tab Switching (Customer) ---- */
function switchLoginTab(type, tab) {
  if (type === 'customer') {
    const signinForm = document.getElementById('customerSigninForm');
    const signupForm = document.getElementById('customerSignupForm');
    const signinTab  = document.getElementById('cust-signin-tab');
    const signupTab  = document.getElementById('cust-signup-tab');

    if (tab === 'signin') {
      signinForm.classList.remove('hidden-form');
      signupForm.classList.add('hidden-form');
      signinTab.classList.add('active');
      signupTab.classList.remove('active');
    } else {
      signinForm.classList.add('hidden-form');
      signupForm.classList.remove('hidden-form');
      signinTab.classList.remove('active');
      signupTab.classList.add('active');
    }
  }
}

/* ---- Password Visibility Toggle ---- */
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁';
  }
}

/* ---- Forgot Password ---- */
function showForgotPassword() {
  showToast('📧 Password reset link will be sent to your email.', 4000);
}

/* ---- Customer Sign In ---- */
async function handleCustomerLogin(e) {
  e.preventDefault();
  const btn   = document.getElementById('custLoginBtn');
  const email = document.getElementById('cust-email').value.trim();
  const pass  = document.getElementById('cust-password').value;

  if (!email || !pass) {
    showToast('⚠️ Please fill in all fields.');
    return;
  }

  btn.textContent = '⏳ Signing in…';
  btn.disabled = true;

  // Simulate API call
  await new Promise(r => setTimeout(r, 1200));

  // Demo: accept any valid-looking credentials
  btn.textContent = '✅ Signed In!';
  btn.style.background = 'linear-gradient(135deg, #27AE60, #2ECC71)';
  showToast(`🎉 Welcome back! You are now signed in as ${email}`, 5000);

  setTimeout(() => {
    btn.textContent = 'Sign In →';
    btn.style.background = '';
    btn.disabled = false;
    closeLoginModal('customer');
    document.getElementById('customerSigninForm').reset();
    updateNavAfterLogin('customer', email.split('@')[0]);
  }, 1800);
}

/* ---- Customer Register ---- */
async function handleCustomerRegister(e) {
  e.preventDefault();
  const btn   = document.getElementById('custRegBtn');
  const fname = document.getElementById('cust-reg-fname').value.trim();
  const lname = document.getElementById('cust-reg-lname').value.trim();
  const email = document.getElementById('cust-reg-email').value.trim();
  const phone = document.getElementById('cust-reg-phone').value.trim();
  const pass  = document.getElementById('cust-reg-password').value;

  if (!fname || !lname || !email || !phone || !pass) {
    showToast('⚠️ Please fill in all required fields.');
    return;
  }
  if (pass.length < 6) {
    showToast('⚠️ Password must be at least 6 characters.');
    return;
  }

  btn.textContent = '⏳ Creating account…';
  btn.disabled = true;

  await new Promise(r => setTimeout(r, 1400));

  btn.textContent = '✅ Account Created!';
  btn.style.background = 'linear-gradient(135deg, #27AE60, #2ECC71)';
  showToast(`🎉 Welcome, ${fname}! Your account has been created successfully.`, 5000);

  setTimeout(() => {
    btn.textContent = 'Create Account →';
    btn.style.background = '';
    btn.disabled = false;
    closeLoginModal('customer');
    document.getElementById('customerSignupForm').reset();
    updateNavAfterLogin('customer', fname);
  }, 1800);
}

/* ---- Admin Login ---- */
async function handleAdminLogin(e) {
  e.preventDefault();
  const btn      = document.getElementById('adminLoginBtn');
  const username = document.getElementById('admin-username').value.trim();
  const password = document.getElementById('admin-password').value;
  const pin      = document.getElementById('admin-pin').value;

  if (!username || !password || !pin) {
    showToast('⚠️ All admin fields are required.');
    return;
  }
  if (pin.length !== 6 || !/^\d+$/.test(pin)) {
    showToast('⚠️ Security PIN must be exactly 6 digits.');
    return;
  }

  btn.textContent = '⏳ Verifying credentials…';
  btn.disabled = true;

  await new Promise(r => setTimeout(r, 1500));

  // Demo credentials: admin / admin123 / 123456
  if (username === 'admin' && password === 'admin123' && pin === '123456') {
    btn.textContent = '✅ Access Granted!';
    btn.style.background = 'linear-gradient(135deg, #27AE60, #2ECC71)';
    showToast('🛡️ Admin access granted! Redirecting to dashboard…', 4000);

    setTimeout(() => {
      btn.textContent = 'Access Dashboard →';
      btn.style.background = '';
      btn.disabled = false;
      closeLoginModal('admin');
      document.getElementById('adminLoginForm').reset();
      // Redirect to admin panel
      window.location.href = 'admin.html';
    }, 2000);
  } else {
    btn.textContent = 'Access Dashboard →';
    btn.style.background = '';
    btn.disabled = false;
    showToast('❌ Invalid credentials. Access denied.', 5000);
    // Shake animation on the form
    const form = document.getElementById('adminLoginModal');
    form.style.animation = 'shake 0.4s ease';
    setTimeout(() => { form.style.animation = ''; }, 400);
  }
}

/* ---- Update Nav After Login ---- */
function updateNavAfterLogin(type, name) {
  if (type === 'customer') {
    const loginBtn = document.getElementById('openCustomerLogin');
    if (loginBtn) {
      loginBtn.textContent = `👤 ${name}`;
      loginBtn.style.background = 'rgba(39, 174, 96, 0.2)';
      loginBtn.style.borderColor = 'rgba(39, 174, 96, 0.5)';
      loginBtn.onclick = () => showToast(`👤 Logged in as ${name}. Click Admin to manage bookings.`, 4000);
    }
  }
}

/* ---- Shake Keyframe (injected dynamically) ---- */
(function addShakeAnimation() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0) scale(1); }
      20% { transform: translateX(-8px) scale(1); }
      40% { transform: translateX(8px) scale(1); }
      60% { transform: translateX(-5px) scale(1); }
      80% { transform: translateX(5px) scale(1); }
    }
  `;
  document.head.appendChild(style);
})();

