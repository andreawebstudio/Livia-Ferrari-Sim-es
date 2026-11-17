(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Menu mobile ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('main-nav');
  var label = toggle && toggle.querySelector('.sr-only');
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
    if (label) label.textContent = open ? 'Chiudi il menu' : 'Apri il menu';
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
    });
    window.matchMedia('(min-width: 1100px)').addEventListener('change', function (mq) { if (mq.matches) setMenu(false); });
  }

  /* ---------- Header ---------- */
  var header = document.querySelector('.site-header');

  /* ---------- Come funziona: linea che si disegna con lo scroll ---------- */
  var journey = document.querySelector('[data-journey]');
  var steps = journey ? Array.prototype.slice.call(journey.querySelectorAll('.journey-step')) : [];
  function updateJourney() {
    if (!journey) return;
    if (reduce) { journey.style.setProperty('--progress', 1); steps.forEach(function (s) { s.classList.add('is-active'); }); return; }
    var r = journey.getBoundingClientRect();
    var vh = window.innerHeight;
    var p = (vh * 0.78 - r.top) / (r.height + vh * 0.25);
    p = Math.max(0, Math.min(1, p));
    journey.style.setProperty('--progress', p.toFixed(3));
    var n = steps.length;
    steps.forEach(function (s, i) {
      if (p >= (n === 1 ? 0 : i / (n - 1)) * 0.92) s.classList.add('is-active');
    });
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
      updateJourney();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Fade-in ---------- */
  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || reduce) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Voce di menu attiva ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.main-nav ul a'));
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          if (a.getAttribute('href') === '#' + entry.target.id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (a) { var s = document.querySelector(a.getAttribute('href')); if (s) spy.observe(s); });
  }

  /* ---------- Servizi: Scopri di più ---------- */
  document.querySelectorAll('.service-toggle').forEach(function (btn) {
    var card = btn.closest('.service');
    var hint = btn.querySelector('.sr-only');
    var hintText = hint ? hint.textContent : '';
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      card.classList.toggle('is-open', open);
      btn.firstChild.textContent = open ? 'Chiudi' : 'Scopri di più';
      if (hint) hint.textContent = hintText;
    });
  });

  /* ---------- Form contatti ---------- */
  var form = document.getElementById('contact-form');
  if (form) {
    var status = form.querySelector('.form-status');
    function say(msg, type) { status.textContent = msg; status.className = 'form-status' + (type ? ' is-' + type : ''); }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var invalid = null;
      form.querySelectorAll('[required]').forEach(function (f) {
        var bad = f.type === 'checkbox' ? !f.checked : !f.value.trim() || (f.type === 'email' && !f.checkValidity());
        f.setAttribute('aria-invalid', bad ? 'true' : 'false');
        if (bad && !invalid) invalid = f;
      });
      if (invalid) { say('Controlla i campi obbligatori evidenziati.', 'error'); invalid.focus(); return; }

      var endpoint = form.getAttribute('data-endpoint');
      if (!endpoint) {
        say('Il modulo è in fase di attivazione. Nel frattempo puoi scrivermi su Instagram: @liviaferrarisimoes.', 'error');
        return;
      }
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true; say('Invio in corso…');
      fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error();
          form.reset(); say('Grazie! Ho ricevuto la tua richiesta e ti risponderò al più presto.', 'ok');
        })
        .catch(function () { say('Non è stato possibile inviare il messaggio. Riprova più tardi o scrivimi su Instagram.', 'error'); })
        .then(function () { btn.disabled = false; });
    });
  }

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
