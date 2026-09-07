// Sunset BLVD Cocktail Lounge — shared front-end behaviour

document.addEventListener('DOMContentLoaded', function () {
  initHeader();
  initNavToggle();
  initReveal();
  initLightbox();
  initMenuNav();
  initReservationForm();
  setMinDate();
});

/* Header shrinks / solidifies on scroll (skips pages that are always solid) */
function initHeader() {
  var header = document.querySelector('.site-header');
  if (!header) return;
  function onScroll() {
    if (window.scrollY > 40) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* Mobile nav toggle */
function initNavToggle() {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  var backdrop = document.createElement('div');
  backdrop.className = 'nav-backdrop';
  document.body.appendChild(backdrop);

  function closeNav() {
    links.classList.remove('is-open');
    toggle.classList.remove('is-active');
    backdrop.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  function openNav() {
    links.classList.add('is-open');
    toggle.classList.add('is-active');
    backdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  toggle.addEventListener('click', function () {
    if (links.classList.contains('is-open')) closeNav(); else openNav();
  });
  backdrop.addEventListener('click', closeNav);
  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeNav);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNav();
  });
}

/* Fade/slide-in on scroll */
function initReveal() {
  var items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach(function (el) { observer.observe(el); });
}

/* Simple lightbox for gallery pages */
function initLightbox() {
  var triggers = document.querySelectorAll('[data-lightbox]');
  if (!triggers.length) return;

  var images = Array.prototype.map.call(triggers, function (t) {
    return { src: t.getAttribute('data-lightbox'), caption: t.getAttribute('data-caption') || '' };
  });

  var lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML =
    '<button class="lightbox-close" aria-label="Close">&times;</button>' +
    '<button class="lightbox-nav lightbox-prev" aria-label="Previous">&#8249;</button>' +
    '<img src="" alt="">' +
    '<button class="lightbox-nav lightbox-next" aria-label="Next">&#8250;</button>';
  document.body.appendChild(lb);

  var imgEl = lb.querySelector('img');
  var current = 0;

  function open(i) {
    current = i;
    imgEl.src = images[current].src;
    imgEl.alt = images[current].caption;
    lb.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    lb.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  function next(dir) {
    current = (current + dir + images.length) % images.length;
    imgEl.src = images[current].src;
    imgEl.alt = images[current].caption;
  }

  triggers.forEach(function (t, i) {
    t.addEventListener('click', function (e) {
      e.preventDefault();
      open(i);
    });
  });

  lb.querySelector('.lightbox-close').addEventListener('click', close);
  lb.querySelector('.lightbox-prev').addEventListener('click', function () { next(-1); });
  lb.querySelector('.lightbox-next').addEventListener('click', function () { next(1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') next(1);
    if (e.key === 'ArrowLeft') next(-1);
  });
}

/* Highlight active category + smooth-scroll offset handling for the menu page */
function initMenuNav() {
  var nav = document.querySelector('.menu-nav');
  if (!nav) return;
  var links = nav.querySelectorAll('a');
  var sections = Array.prototype.map.call(links, function (a) {
    return document.querySelector(a.getAttribute('href'));
  }).filter(Boolean);

  function onScroll() {
    var pos = window.scrollY + 200;
    var activeIndex = 0;
    sections.forEach(function (sec, i) {
      if (sec.offsetTop <= pos) activeIndex = i;
    });
    links.forEach(function (a, i) {
      a.classList.toggle('active', i === activeIndex);
    });
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* Reservation form: front-end only for now.
   Validates input, then simulates a submission so the UI is ready to be
   wired up to a real booking API/backend later. */
function initReservationForm() {
  var form = document.getElementById('reservation-form');
  if (!form) return;
  var status = document.getElementById('form-status');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var valid = true;
    var fields = form.querySelectorAll('[required]');

    fields.forEach(function (field) {
      var wrap = field.closest('.form-field');
      var errorEl = wrap ? wrap.querySelector('.field-error') : null;
      var message = '';

      if (!field.value.trim()) {
        message = 'This field is required.';
      } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
        message = 'Enter a valid email address.';
      } else if (field.type === 'tel' && !/^[0-9+()\s-]{7,}$/.test(field.value)) {
        message = 'Enter a valid phone number.';
      } else if (field.type === 'date') {
        var chosen = new Date(field.value + 'T00:00:00');
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        if (chosen < today) message = 'Please choose a future date.';
      } else if (field.type === 'number') {
        var num = parseInt(field.value, 10);
        if (isNaN(num) || num < 1 || num > 20) message = 'Party size must be between 1 and 20.';
      }

      if (message) {
        valid = false;
        if (wrap) wrap.classList.add('has-error');
        if (errorEl) errorEl.textContent = message;
      } else {
        if (wrap) wrap.classList.remove('has-error');
        if (errorEl) errorEl.textContent = '';
      }
    });

    if (!valid) {
      showStatus('error', 'Please check the highlighted fields and try again.');
      return;
    }

    var payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      date: form.date.value,
      time: form.time.value,
      partySize: form.partySize.value,
      occasion: form.occasion ? form.occasion.value : '',
      notes: form.notes ? form.notes.value.trim() : ''
    };

    // TODO(backend): replace this simulated delay with a real API call, e.g.
    // fetch('/api/reservations', { method: 'POST', body: JSON.stringify(payload) })
    console.log('Reservation request ready for backend submission:', payload);

    var submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    setTimeout(function () {
      showStatus('success', 'Thank you, ' + payload.name.split(' ')[0] + '! Your reservation request for ' +
        formatDate(payload.date) + ' at ' + payload.time + ' has been received. Our team will call or email you shortly to confirm.');
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = 'Request Reservation';
    }, 900);
  });

  function showStatus(type, message) {
    status.textContent = message;
    status.className = 'form-status show ' + type;
    status.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function formatDate(value) {
    if (!value) return '';
    var d = new Date(value + 'T00:00:00');
    return d.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' });
  }
}

/* Prevent picking a reservation date in the past */
function setMinDate() {
  var dateInput = document.getElementById('res-date');
  if (!dateInput) return;
  var today = new Date();
  var yyyy = today.getFullYear();
  var mm = String(today.getMonth() + 1).padStart(2, '0');
  var dd = String(today.getDate()).padStart(2, '0');
  dateInput.min = yyyy + '-' + mm + '-' + dd;
}
