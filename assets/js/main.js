/* Mr Manaf Khatib | Breast Reduction landing page. Vanilla JS, no dependencies. */
(function () {
  'use strict';
  var doc = document.documentElement;
  doc.classList.add('js');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Scroll: progress, header, back to top, parallax ---------- */
  var progress = $('.progress span');
  var parallax = $$('[data-parallax]');
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    var max = doc.scrollHeight - window.innerHeight;
    if (progress) progress.style.setProperty('--p', max > 0 ? Math.min(1, y / max) : 0);
    doc.classList.toggle('is-scrolled', y > 40);
    doc.classList.toggle('show-top', y > window.innerHeight * 1.2);
    if (!reduceMotion) {
      var vh = window.innerHeight;
      parallax.forEach(function (el) {
        var r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.12;
        var offset = (r.top + r.height / 2 - vh / 2) * -speed;
        el.style.setProperty('--py', offset.toFixed(1) + 'px');
      });
    }
    updateTimeline();
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', function () { requestAnimationFrame(onScroll); });

  /* ---------- Mobile menu ---------- */
  var toggle = $('.menu-toggle');
  var menu = $('#mobile-menu');
  function closeMenu() { toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Open menu'); menu.hidden = true; }
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      if (open) { closeMenu(); return; }
      toggle.setAttribute('aria-expanded', 'true'); toggle.setAttribute('aria-label', 'Close menu'); menu.hidden = false;
    });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { closeMenu(); toggle.focus(); } });
  }

  /* ---------- Mobile sticky bar after hero ---------- */
  var hero = $('.hero-ctas');
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      var e = entries[0]; doc.classList.toggle('show-bar', !e.isIntersecting && e.boundingClientRect.top < 0);
    }, { rootMargin: '-80px 0px 0px 0px' }).observe(hero);
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = $$('.reveal, .reveal-mask');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Compare sliders ---------- */
  function initCompare(el) {
    var input = $('input[type="range"]', el);
    if (!input) return;
    var set = function () { el.style.setProperty('--pos', input.value + '%'); };
    input.addEventListener('input', set);
    set();
  }
  $$('[data-compare]').forEach(initCompare);

  /* Hero mini slider: switch patient */
  var heroBa = $('.hero-ba');
  if (heroBa) {
    var mini = $('.compare', heroBa);
    $$('[data-pair]', heroBa).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var p = btn.getAttribute('data-pair');
        $('.compare-after', mini).src = 'assets/ba/' + p + '-after.webp';
        $('.compare-before img', mini).src = 'assets/ba/' + p + '-before.webp';
        $$('[data-pair]', heroBa).forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        var r = $('input', mini); r.value = 50; mini.style.setProperty('--pos', '50%');
      });
    });
  }

  /* ---------- Before & after carousel ---------- */
  var track = $('[data-ba-track]');
  if (track) {
    var prev = $('[data-ba-prev]'), next = $('[data-ba-next]');
    var cur = $('[data-ba-current]'), tot = $('[data-ba-total]');
    var items = $$('.ba-item', track);
    function perView() { return window.innerWidth <= 760 ? 1 : 2; }
    function pageWidth() { return items[1] ? (items[1].offsetLeft - items[0].offsetLeft) * perView() : track.clientWidth; }
    function update() {
      var pages = Math.ceil(items.length / perView());
      var page = Math.round(track.scrollLeft / pageWidth()) + 1;
      page = Math.max(1, Math.min(pages, page));
      cur.textContent = page; tot.textContent = pages;
      prev.disabled = track.scrollLeft < 8;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
    }
    prev.addEventListener('click', function () { track.scrollBy({ left: -pageWidth(), behavior: reduceMotion ? 'auto' : 'smooth' }); });
    next.addEventListener('click', function () { track.scrollBy({ left: pageWidth(), behavior: reduceMotion ? 'auto' : 'smooth' }); });
    track.addEventListener('scroll', function () { requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- Reviews ticker: clone for loop, Read more ---------- */
  var ticker = $('[data-ticker]');
  if (ticker) {
    var tt = $('.ticker-track', ticker);
    $$('.review-card', tt).forEach(function (card) {
      var text = $('.review-text', card);
      if (text.scrollHeight > text.clientHeight + 4) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'read-more'; b.textContent = 'Read more'; b.setAttribute('aria-expanded', 'false');
        text.insertAdjacentElement('afterend', b);
      }
    });
    $$('.review-card', tt).forEach(function (card) {
      var c = card.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      $$('button, a', c).forEach(function (x) { x.setAttribute('tabindex', '-1'); });
      tt.appendChild(c);
    });
    tt.addEventListener('click', function (e) {
      var b = e.target.closest('.read-more');
      if (!b) return;
      var card = b.closest('.review-card');
      var open = card.classList.toggle('is-open');
      b.textContent = open ? 'Show less' : 'Read more';
      b.setAttribute('aria-expanded', String(open));
      ticker.classList.toggle('is-paused', !!$('.review-card.is-open', tt));
    });
  }

  /* ---------- Video ---------- */
  $$('.video-frame').forEach(function (frame) {
    var v = $('video', frame), b = $('.video-play', frame);
    b.addEventListener('click', function () { v.play(); });
    v.addEventListener('play', function () { frame.classList.add('is-playing'); });
    v.addEventListener('pause', function () { frame.classList.remove('is-playing'); });
  });

  /* ---------- Candidate checklist ---------- */
  var checks = $$('.checklist input');
  var count = $('[data-check-count]'), msg = $('[data-check-msg]');
  checks.forEach(function (c) {
    c.addEventListener('change', function () {
      var n = checks.filter(function (x) { return x.checked; }).length;
      count.textContent = n;
      count.classList.remove('bump'); void count.offsetWidth; count.classList.add('bump');
      msg.textContent = n === 0 ? 'Tick anything that sounds familiar.'
        : n < 3 ? 'Even one or two of these is worth talking through with a specialist.'
        : 'These are the reasons most women come to see Mr Khatib.';
    });
  });

  /* ---------- Tabs ---------- */
  var tabs = $$('[role="tab"]');
  function selectTab(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(t); });
    t.addEventListener('keydown', function (e) {
      var k = e.key, n = null;
      if (k === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
      if (k === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (k === 'Home') n = tabs[0];
      if (k === 'End') n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); selectTab(n); n.focus(); }
    });
  });

  /* Incision pattern picker */
  var diagram = $('.how-diagram');
  var caption = $('[data-pattern-caption]');
  $$('[data-pattern]').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('[data-pattern]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      diagram.setAttribute('data-pattern-active', b.getAttribute('data-pattern'));
      caption.textContent = $('b', b).textContent;
    });
  });

  /* ---------- Timeline fill ---------- */
  var timeline = $('[data-timeline]');
  var steps = timeline ? $$('li', timeline) : [];
  var jImgs = $$('[data-journey-img]');
  function updateTimeline() {
    if (!timeline) return;
    var r = timeline.getBoundingClientRect();
    var mark = window.innerHeight * 0.55;
    var fill = Math.max(0, Math.min(r.height, mark - r.top));
    timeline.style.setProperty('--fill', fill + 'px');
    var activeImg = '0';
    steps.forEach(function (li) {
      var on = li.offsetTop + 10 <= fill;
      li.classList.toggle('is-active', on);
      if (on) activeImg = li.getAttribute('data-img');
    });
    jImgs.forEach(function (img) { img.classList.toggle('is-on', img.getAttribute('data-journey-img') === activeImg); });
  }

  /* ---------- Accordion ---------- */
  $$('.acc-item button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.acc-item');
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      item.classList.toggle('is-open', !open);
    });
  });

  /* ---------- Booking form ---------- */
  var form = $('.booking-form');
  if (form) {
    var rules = {
      first_name: function (v) { return v.trim() ? '' : 'Enter your first name.'; },
      last_name: function (v) { return v.trim() ? '' : 'Enter your last name.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter an email address like name@example.com.'; },
      phone: function (v) { return v.replace(/[^\d]/g, '').length >= 10 ? '' : 'Enter a phone number with at least 10 digits.'; },
      source: function (v) { return v ? '' : 'Choose how you heard about us.'; }
    };
    function check(el, show) {
      var rule = rules[el.name];
      if (!rule) return true;
      var err = rule(el.value);
      var field = el.closest('.field');
      var out = $('.field-error', field);
      if (show) {
        field.classList.toggle('is-invalid', !!err);
        field.classList.toggle('is-valid', !err);
        out.textContent = err;
        el.setAttribute('aria-invalid', err ? 'true' : 'false');
        if (err) el.setAttribute('aria-describedby', out.id); else el.removeAttribute('aria-describedby');
      }
      return !err;
    }
    $$('input, select', form).forEach(function (el) {
      el.addEventListener('blur', function () { if (el.value) check(el, true); });
      el.addEventListener('input', function () { if (el.closest('.field') && el.closest('.field').classList.contains('is-invalid')) check(el, true); });
      el.addEventListener('change', function () { if (el.tagName === 'SELECT') check(el, true); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      $$('input, select', form).forEach(function (el) { if (!check(el, true) && !firstBad) firstBad = el; });
      if (firstBad) { firstBad.focus(); return; }
      var btn = $('button[type="submit"]', form);
      btn.disabled = true; btn.textContent = 'Sending...';
      var data = Object.fromEntries(new FormData(form).entries());
      data.page = location.href;
      // GoHighLevel webhook goes in data-endpoint on the form. Until then this simulates a send.
      var endpoint = form.getAttribute('data-endpoint');
      var send = endpoint
        ? fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        : new Promise(function (res) { setTimeout(res, 700); });
      send.then(function () {
        var ok = $('.form-success');
        $('[data-success-name]', ok).textContent = data.first_name.trim();
        form.hidden = true; ok.hidden = false; ok.focus();
      }).catch(function () {
        btn.disabled = false; btn.textContent = 'Book my free mini consultation';
        $('#form-note').textContent = 'Your request did not send. Check your connection and try again, or call 0203 475 0840.';
      });
    });
  }


  var yr = $('[data-year]'); if (yr) yr.textContent = new Date().getFullYear();
  onScroll();
})();
