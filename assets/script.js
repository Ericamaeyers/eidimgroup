/* ============================
   EIDIM Store — Enhanced Script
   ============================ */

// ── 1. Mobile nav toggle ──────────────────────────────────────
const navToggle = document.getElementById('navToggle');
const mainNav   = document.querySelector('.main-nav');

navToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
  navToggle.classList.toggle('active', isOpen);
});

document.querySelectorAll('.nav-list a').forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.classList.remove('active');
  });
});

// ── 2. Header shrink on scroll ────────────────────────────────
const siteHeader = document.querySelector('.site-header');

window.addEventListener('scroll', () => {
  siteHeader.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ── 3. Active nav highlight on scroll ────────────────────────
const pageSections = document.querySelectorAll('section[id]');
const navLinks     = document.querySelectorAll('.nav-list a[href^="#"]');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
      });
    }
  });
}, { rootMargin: '-35% 0px -55% 0px' });

pageSections.forEach(s => sectionObserver.observe(s));

// ── 4. Scroll-reveal ─────────────────────────────────────────
const revealSelectors = [
  '.section-heading',
  '.trust-item',
  '.industry-card',
  '.category-card',
  '.product-card',
  '.feature-item',
  '.testimonial-card',
  '.footer-col',
];

revealSelectors.forEach(sel => {
  document.querySelectorAll(sel).forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${(i % 4) * 80}ms`;
  });
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── 5. Counter animation for trust bar ───────────────────────
function animateCounter(el) {
  const raw    = el.textContent.trim();
  const num    = parseFloat(raw);
  if (isNaN(num)) return;
  const suffix   = raw.slice(num.toString().length);
  const duration = 1400;
  let startTime  = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed  = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * num) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.trust-item strong').forEach(el => {
  counterObserver.observe(el);
});

// ── 6. Brand marquee ─────────────────────────────────────────
const brandStrip = document.querySelector('.brand-strip');
if (brandStrip) {
  const imgs  = Array.from(brandStrip.querySelectorAll('img'));
  const track = document.createElement('div');
  track.className = 'brand-track';
  imgs.forEach(img => track.appendChild(img));

  const trackClone  = track.cloneNode(true);
  const marqueeWrap = document.createElement('div');
  marqueeWrap.className = 'brand-marquee';
  marqueeWrap.setAttribute('aria-hidden', 'true');
  marqueeWrap.appendChild(track);
  marqueeWrap.appendChild(trackClone);

  brandStrip.innerHTML = '';
  brandStrip.appendChild(marqueeWrap);
}

// ── 7. Cart system ────────────────────────────────────────────
function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

let cart = [];
try { cart = JSON.parse(localStorage.getItem('eidim-cart') || '[]'); } catch (_) {}

const cartDrawer   = document.getElementById('cartDrawer');
const cartOverlay  = document.getElementById('cartOverlay');
const cartBodyEl   = document.getElementById('cartBody');
const cartFooterEl = document.getElementById('cartFooter');
const cartTotalEl  = document.getElementById('cartTotal');
const cartCountEl  = document.getElementById('cartCount');
const cartBtn      = document.getElementById('cartBtn');
const cartClose    = document.getElementById('cartClose');
const cartQuoteBtn = document.getElementById('cartQuoteBtn');

function saveCart() {
  try { localStorage.setItem('eidim-cart', JSON.stringify(cart)); } catch (_) {}
}

function updateCartBadge() {
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCountEl.textContent = String(total);
  cartCountEl.hidden = total === 0;
}

function renderCart() {
  if (cart.length === 0) {
    cartBodyEl.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    cartFooterEl.hidden = true;
    return;
  }

  cartBodyEl.innerHTML = cart.map((item, idx) => `
    <div class="cart-item">
      <div class="cart-item-info">
        <span class="cart-item-name">${escHtml(item.name)}</span>
        <span class="cart-item-price">${escHtml(item.price)}</span>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" data-action="dec" data-idx="${idx}" aria-label="Decrease quantity">−</button>
        <span class="qty-val">${item.qty}</span>
        <button class="qty-btn" data-action="inc" data-idx="${idx}" aria-label="Increase quantity">+</button>
        <button class="remove-btn" data-idx="${idx}" aria-label="Remove ${escHtml(item.name)}">×</button>
      </div>
    </div>
  `).join('');

  const total = cart.reduce((sum, item) => {
    const price = parseFloat(item.price.replace(/[^0-9.]/g, ''));
    return sum + (isNaN(price) ? 0 : price * item.qty);
  }, 0);

  cartTotalEl.textContent = '$' + total.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  cartFooterEl.hidden = false;
}

function openCart() {
  renderCart();
  cartDrawer.classList.add('open');
  cartOverlay.classList.add('open');
  cartDrawer.setAttribute('aria-hidden', 'false');
  cartClose.focus();
}

function closeCart() {
  cartDrawer.classList.remove('open');
  cartOverlay.classList.remove('open');
  cartDrawer.setAttribute('aria-hidden', 'true');
  cartBtn.focus();
}

cartBtn.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);
if (cartQuoteBtn) cartQuoteBtn.addEventListener('click', closeCart);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && cartDrawer.classList.contains('open')) closeCart();
});

cartBodyEl.addEventListener('click', e => {
  const idx = parseInt(e.target.dataset.idx, 10);
  if (isNaN(idx)) return;

  if (e.target.classList.contains('remove-btn')) {
    cart.splice(idx, 1);
  } else if (e.target.classList.contains('qty-btn')) {
    if (e.target.dataset.action === 'inc') {
      cart[idx].qty++;
    } else if (cart[idx].qty > 1) {
      cart[idx].qty--;
    } else {
      cart.splice(idx, 1);
    }
  } else {
    return;
  }

  saveCart();
  updateCartBadge();
  renderCart();
});

// Add-to-cart on product cards
document.querySelectorAll('.product-card').forEach(card => {
  const addBtn = card.querySelector('.btn-primary');
  if (!addBtn) return;
  const name  = card.querySelector('h3')?.textContent?.trim() ?? 'Product';
  const price = card.querySelector('.price')?.textContent?.trim() ?? '$0.00';

  addBtn.addEventListener('click', () => {
    const existing = cart.find(i => i.name === name);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ name, price, qty: 1 });
    }
    saveCart();
    updateCartBadge();
    showToast('Added to cart');

    const original = addBtn.textContent;
    addBtn.textContent = 'Added ✓';
    addBtn.style.background = '#15803D';
    addBtn.disabled = true;
    setTimeout(() => {
      addBtn.textContent = original;
      addBtn.style.background = '';
      addBtn.disabled = false;
    }, 1500);
  });
});

updateCartBadge();

// ── 8. Toast ──────────────────────────────────────────────────
function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

// ── 9. Newsletter form ────────────────────────────────────────
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', e => {
    e.preventDefault();
    const input = newsletterForm.querySelector('input[type="email"]');
    showToast('Thanks for subscribing!');
    if (input) input.value = '';
  });
}

// ── 10. Back to top ───────────────────────────────────────────
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  backToTop.classList.toggle('visible', window.scrollY > 400);
}, { passive: true });

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── 11. Hero carousel ─────────────────────────────────────────
(function initCarousel() {
  const heroEl      = document.querySelector('.hero-carousel');
  if (!heroEl) return;

  const slides      = Array.from(heroEl.querySelectorAll('.carousel-slide'));
  const dots        = Array.from(heroEl.querySelectorAll('.carousel-dot'));
  const prevBtn     = heroEl.querySelector('.carousel-prev');
  const nextBtn     = heroEl.querySelector('.carousel-next');
  const progressBar = document.getElementById('carouselProgress');
  const INTERVAL    = 5500; // ms between auto-advances

  let currentIndex = 0;
  let autoTimer    = null;

  // ── Slide transition ────────────────────────
  function goToSlide(nextIndex) {
    const total = slides.length;
    nextIndex   = ((nextIndex % total) + total) % total;
    if (nextIndex === currentIndex) return;

    slides[currentIndex].classList.remove('active');
    currentIndex = nextIndex;

    // Remove then re-add .active with a reflow in between
    // so CSS animations on the content restart cleanly
    const slide = slides[currentIndex];
    slide.classList.remove('active');
    void slide.getBoundingClientRect(); // force reflow
    slide.classList.add('active');

    dots.forEach((dot, i) => {
      const isActive = i === currentIndex;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', String(isActive));
    });

    resetProgress();
  }

  // ── Progress bar ────────────────────────────
  function startProgress() {
    if (!progressBar) return;
    progressBar.style.transition = 'none';
    progressBar.style.width      = '0%';
    void progressBar.getBoundingClientRect();
    progressBar.style.transition = `width ${INTERVAL}ms linear`;
    progressBar.style.width      = '100%';
  }

  function stopProgress() {
    if (!progressBar) return;
    progressBar.style.transition = 'none';
    progressBar.style.width      = '0%';
  }

  function resetProgress() {
    stopProgress();
    requestAnimationFrame(startProgress);
  }

  // ── Auto-advance ────────────────────────────
  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goToSlide(currentIndex + 1), INTERVAL);
    startProgress();
  }

  function stopAuto() {
    clearInterval(autoTimer);
    stopProgress();
  }

  // ── Controls ────────────────────────────────
  prevBtn?.addEventListener('click', () => {
    stopAuto();
    goToSlide(currentIndex - 1);
    startAuto();
  });

  nextBtn?.addEventListener('click', () => {
    stopAuto();
    goToSlide(currentIndex + 1);
    startAuto();
  });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      stopAuto();
      goToSlide(i);
      startAuto();
    });
  });

  // Keyboard arrow navigation (when hero is focused)
  heroEl.setAttribute('tabindex', '-1');
  heroEl.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { stopAuto(); goToSlide(currentIndex - 1); startAuto(); }
    if (e.key === 'ArrowRight') { stopAuto(); goToSlide(currentIndex + 1); startAuto(); }
  });

  // Pause on hover
  heroEl.addEventListener('mouseenter', stopAuto);
  heroEl.addEventListener('mouseleave', startAuto);

  // Swipe / touch support
  let touchStartX = 0;
  heroEl.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  heroEl.addEventListener('touchend', e => {
    const delta = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) {
      stopAuto();
      goToSlide(currentIndex + (delta > 0 ? 1 : -1));
      startAuto();
    }
  }, { passive: true });

  // Hide controls when only one slide
  if (slides.length <= 1) {
    prevBtn?.remove();
    nextBtn?.remove();
    heroEl.querySelector('.carousel-dots')?.remove();
    heroEl.querySelector('.carousel-progress')?.remove();
    return;
  }

  startAuto();
}());

