/* ==========================================================
   ALI DEHRAB — interactions
   Content is rendered from js/data.js; animation uses GSAP,
   ScrollTrigger and Lenis (all vendored in assets/vendor).
   If any of them fail to load the page still works, just static.
========================================================== */
(function () {
  "use strict";

  var D = window.DATA || {};
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
  var anim = !!gsap && !!ScrollTrigger && !reduce;
  var lenis = null;
  var IMG = "assets/img/";

  if (!anim) root.classList.remove("anim");
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  /* ---------------- Render content ---------------- */
  function renderStory() {
    var track = $("#storyTrack"); if (!track) return;
    track.innerHTML = D.story.map(function (c, i) {
      return '<article class="chapter">' +
        '<span class="chapter__idx">' + pad(i + 1) + " / " + pad(D.story.length) + "</span>" +
        '<div class="chapter__tag">' + esc(c.tag) + "</div>" +
        '<div class="chapter__img"><img src="' + IMG + c.img + '.webp" alt="" loading="lazy"></div>' +
        "<h3>" + esc(c.title) + "</h3><p>" + esc(c.text) + "</p></article>";
    }).join("");
  }

  function renderSkills() {
    var list = $("#skillsList"), frame = $("#skillsFrame"), text = $("#skillsText");
    if (!list) return;
    list.innerHTML = D.skills.map(function (s, i) {
      return '<button class="skill" role="tab" data-i="' + i + '"><i>' + pad(i + 1) + "</i>" + esc(s.name) + "</button>";
    }).join("");
    frame.innerHTML = D.skills.map(function (s) {
      return '<img src="' + IMG + s.img + '.webp" alt="Ali performing a ' + esc(s.name.toLowerCase()) + '" loading="lazy">';
    }).join("");
    var btns = $$(".skill", list), imgs = $$("img", frame);
    function set(i) {
      btns.forEach(function (b, k) { b.classList.toggle("is-active", k === i); b.setAttribute("aria-selected", k === i); });
      imgs.forEach(function (im, k) { im.classList.toggle("is-active", k === i); });
      text.textContent = D.skills[i].text;
    }
    btns.forEach(function (b, i) {
      b.addEventListener("mouseenter", function () { set(i); });
      b.addEventListener("focus", function () { set(i); });
      b.addEventListener("click", function () { set(i); });
    });
    set(0);
  }

  function chips(el, cats, counts, onPick, first) {
    el.innerHTML = cats.map(function (c) {
      return '<button class="chip" role="tab" data-cat="' + c.id + '">' + esc(c.label) + "<sup>" + counts[c.id] + "</sup></button>";
    }).join("");
    var all = $$(".chip", el);
    function pick(id) {
      all.forEach(function (b) { var on = b.dataset.cat === id; b.classList.toggle("is-active", on); b.setAttribute("aria-selected", on); });
      onPick(id);
    }
    all.forEach(function (b) { b.addEventListener("click", function () { pick(b.dataset.cat); refreshSoon(); }); });
    pick(first);
  }

  function renderWork() {
    var rows = $("#workRows"), filters = $("#workFilters"); if (!rows) return;
    var labels = {}; D.workCats.forEach(function (c) { labels[c.id] = c.label; });
    var listed = D.work.slice(1); // the current role is shown in the red feature card above
    rows.innerHTML = listed.map(function (w, i) {
      return '<div class="row" data-cat="' + w.cat + '">' +
        '<button class="row__head" aria-expanded="false">' +
        '<span class="row__n">' + pad(i + 1) + "</span>" +
        '<span class="row__role">' + esc(w.role) + "</span>" +
        '<span class="row__org">' + esc(w.org) + "</span>" +
        '<span class="row__when">' + esc(w.when) + "</span>" +
        '<span class="row__plus" aria-hidden="true"></span></button>' +
        '<div class="row__body"><div><p class="mono">' + esc(labels[w.cat]) + " · " + esc(w.where) + "</p><p>" + esc(w.text) + "</p></div></div></div>";
    }).join("");
    var all = $$(".row", rows);
    all.forEach(function (r) {
      var head = $(".row__head", r);
      head.addEventListener("click", function () {
        var open = !r.classList.contains("is-open");
        all.forEach(function (o) { o.classList.remove("is-open"); $(".row__head", o).setAttribute("aria-expanded", "false"); });
        if (open) { r.classList.add("is-open"); head.setAttribute("aria-expanded", "true"); }
        refreshSoon();
      });
    });
    var counts = { all: listed.length };
    listed.forEach(function (w) { counts[w.cat] = (counts[w.cat] || 0) + 1; });
    // "All" starts collapsed to the most relevant roles
    var more = $("#workMore"), expanded = false, cur = "all", LIMIT = 6;
    function apply(id) {
      cur = id; var n = 0;
      all.forEach(function (r) {
        var match = id === "all" || r.dataset.cat === id;
        r.hidden = !(match && (id !== "all" || expanded || n < LIMIT));
        if (match) n++;
      });
      if (more) {
        more.hidden = !(id === "all" && !expanded && all.length > LIMIT);
        more.innerHTML = "Show all " + all.length + " roles <span>+" + (all.length - LIMIT) + "</span>";
      }
    }
    if (more) more.addEventListener("click", function () { expanded = true; apply(cur); refreshSoon(); });
    chips(filters, D.workCats, counts, apply, "all");
  }

  function renderCerts() {
    var list = $("#certList"), filters = $("#certFilters"); if (!list) return;
    list.innerHTML = D.certs.map(function (c) {
      return '<div class="cert" data-cat="' + c[3] + '"><b>' + esc(c[0]) + "</b><span><i>" + esc(c[1]) + "</i>" + (c[2] ? " · " + esc(c[2]) : "") + "</span></div>";
    }).join("");
    var all = $$(".cert", list);
    var counts = { all: D.certs.length };
    D.certs.forEach(function (c) { counts[c[3]] = (counts[c[3]] || 0) + 1; });
    var cats = D.certCats.concat([{ id: "all", label: "Everything" }]);
    chips(filters, cats, counts, function (id) {
      all.forEach(function (r) { r.hidden = id !== "all" && r.dataset.cat !== id; });
    }, "fitness");
    var sc = $("#statCerts"), sr = $("#statRoles");
    if (sc) { var n = Math.floor(D.certs.length / 10) * 10; sc.dataset.count = n; sc.textContent = n + "+"; }
    if (sr) { sr.dataset.count = D.work.length; sr.textContent = D.work.length; }
  }

  function renderGallery() {
    var strip = $("#galleryStrip"); if (!strip) return;
    strip.innerHTML = D.gallery.map(function (g, i) {
      return '<button class="shotcard" data-i="' + i + '" style="aspect-ratio:' + g.w + "/" + g.h + '" aria-label="Open image: ' + esc(g.cap) + '">' +
        '<img src="' + IMG + g.img + '.webp" width="' + g.w + '" height="' + g.h + '" alt="' + esc(g.cap) + '" loading="lazy" draggable="false">' +
        "<span><b>" + pad(i + 1) + "</b>" + esc(g.cap) + "</span></button>";
    }).join("");

    // arrows + counter
    var prev = $("#galPrev"), next = $("#galNext"), cnt = $("#galCount"), total = D.gallery.length;
    function step(d) { strip.scrollBy({ left: d * strip.clientWidth * 0.7, behavior: reduce ? "auto" : "smooth" }); }
    if (prev) prev.addEventListener("click", function () { step(-1); });
    if (next) next.addEventListener("click", function () { step(1); });
    function count() {
      var max = strip.scrollWidth - strip.clientWidth, p = max > 0 ? strip.scrollLeft / max : 0;
      if (cnt) cnt.textContent = pad(Math.round(p * (total - 1)) + 1) + " / " + pad(total);
      if (prev) prev.disabled = p <= 0.005;
      if (next) next.disabled = p >= 0.995;
    }
    strip.addEventListener("scroll", count, { passive: true }); count();

    // drag to scroll (mouse); touch uses native scrolling
    var down = false, moved = 0, sx = 0, sl = 0;
    strip.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse") return;
      down = true; moved = 0; sx = e.clientX; sl = strip.scrollLeft;
    });
    window.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx));
      if (moved > 6) strip.classList.add("is-drag");
      strip.scrollLeft = sl - dx;
    });
    window.addEventListener("pointerup", function () {
      if (!down) return; down = false;
      setTimeout(function () { strip.classList.remove("is-drag"); }, 0);
    });
    strip.addEventListener("click", function (e) {
      var card = e.target.closest(".shotcard"); if (!card || moved > 6) return;
      openLightbox(D.gallery.map(function (g) { return { src: IMG + g.img + ".webp", cap: g.cap }; }), +card.dataset.i);
    });
  }

  function renderRail() {
    var rail = $("#rail"); if (!rail) return;
    var items = [["hero", "Intro"], ["about", "About"], ["story", "Story"], ["skills", "Skills"], ["coach", "Coaching"], ["work", "Work"], ["gallery", "Gallery"], ["beyond", "Beyond"], ["credentials", "Credentials"], ["contact", "Contact"]];
    rail.innerHTML = items.map(function (it) { return '<a href="#' + it[0] + '"><span>' + it[1] + "</span><i></i></a>"; }).join("");
  }

  /* ---------------- Lightbox ---------------- */
  var lb = $("#lightbox"), lbImg = $("#lightboxImg"), lbCap = $("#lightboxCap"), lbSet = [], lbI = 0, lbLast = null;
  function showLb() { var it = lbSet[lbI]; lbImg.src = it.src; lbImg.alt = it.cap; lbCap.textContent = pad(lbI + 1) + " / " + pad(lbSet.length) + " — " + it.cap; }
  function openLightbox(set, i) {
    lbSet = set; lbI = i; lbLast = document.activeElement; showLb();
    lb.hidden = false; requestAnimationFrame(function () { lb.classList.add("is-open"); });
    $$(".lightbox__nav", lb).forEach(function (b) { b.style.display = set.length > 1 ? "" : "none"; });
    if (lenis) lenis.stop();
    $(".lightbox__close", lb).focus();
  }
  function closeLb() {
    lb.classList.remove("is-open");
    setTimeout(function () { lb.hidden = true; }, 350);
    if (lenis) lenis.start();
    if (lbLast && lbLast.focus) lbLast.focus();
  }
  function stepLb(d) { lbI = (lbI + d + lbSet.length) % lbSet.length; showLb(); }
  if (lb) {
    lb.addEventListener("click", function (e) {
      if (e.target.closest(".lightbox__nav--prev")) return stepLb(-1);
      if (e.target.closest(".lightbox__nav--next")) return stepLb(1);
      if (e.target === lbImg) return;
      closeLb();
    });
    window.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowLeft") stepLb(-1);
      if (e.key === "ArrowRight") stepLb(1);
    });
  }
  function bindZoom() {
    var shots = $$("[data-zoom]");
    var set = shots.map(function (s) { return { src: IMG + s.dataset.zoom + ".webp", cap: $("span", s).textContent }; });
    shots.forEach(function (s, i) { s.addEventListener("click", function () { openLightbox(set, i); }); });
  }

  /* ---------------- Small utilities ---------------- */
  var toastEl = $("#toast"), toastT;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add("is-on");
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove("is-on"); }, 2200);
  }
  function bindCopy() {
    $$("[data-copy]").forEach(function (b) {
      b.addEventListener("click", function () {
        var code = b.dataset.copy;
        var done = function () { toast("Code " + code + " copied"); };
        if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(code).then(done, done);
        else {
          var t = document.createElement("textarea"); t.value = code; t.style.position = "fixed"; t.style.opacity = "0";
          document.body.appendChild(t); t.select(); try { document.execCommand("copy"); } catch (e) {} t.remove(); done();
        }
      });
    });
  }
  function bindWhatsApp() {
    var f = $("#waForm"); if (!f) return;
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var topic = (f.querySelector('input[name="topic"]:checked') || {}).value || "coaching";
      var name = $("#waName").value.trim(), msg = $("#waMsg").value.trim();
      var text = "Hi Coach Dehrab" + (name ? ", I'm " + name : "") + ". I'm interested in " + topic + "." + (msg ? "\n\n" + msg : "");
      window.open("https://wa.me/96569020103?text=" + encodeURIComponent(text), "_blank", "noopener");
    });
  }
  var refreshT;
  function refreshSoon() {
    if (!anim) return;
    clearTimeout(refreshT); refreshT = setTimeout(function () { ScrollTrigger.refresh(); }, 560);
  }

  /* ---------------- Nav + menu ---------------- */
  function bindNav() {
    var nav = $("#nav"), burger = $("#burger"), menu = $("#menu"), last = 0;
    function onScroll() {
      var y = window.scrollY || 0;
      nav.classList.toggle("is-solid", y > 40);
      nav.classList.toggle("is-hidden", y > 500 && y > last && !menu.classList.contains("is-open"));
      last = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

    function setMenu(open) {
      menu.classList.toggle("is-open", open); menu.setAttribute("aria-hidden", !open);
      burger.setAttribute("aria-expanded", open); burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (lenis) { open ? lenis.stop() : lenis.start(); }
      document.body.style.overflow = open ? "hidden" : "";
    }
    burger.addEventListener("click", function () { setMenu(!menu.classList.contains("is-open")); });

    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href"); var t = id.length > 1 ? $(id) : null; if (!t) return;
        e.preventDefault(); setMenu(false);
        if (lenis) lenis.scrollTo(t, { duration: 1.4 });
        else t.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      });
    });

    // active link
    if ("IntersectionObserver" in window) {
      var links = $$(".nav__links a, .rail a");
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          if (!en.isIntersecting) return;
          links.forEach(function (l) { l.classList.toggle("is-active", l.getAttribute("href") === "#" + en.target.id); });
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      ["story", "coach", "work", "gallery", "credentials", "about", "skills", "beyond", "contact", "hero"].forEach(function (id) { var s = $("#" + id); if (s) io.observe(s); });
    }
  }

  /* ---------------- Animation ---------------- */
  function splitLines() {
    $$(".split").forEach(function (h) {
      h.innerHTML = h.innerHTML.split(/<br\s*\/?>/i).map(function (l) {
        return '<span class="line"><span class="line__in">' + l.trim() + "</span></span>";
      }).join("");
    });
  }

  function initSmooth() {
    if (!window.Lenis) return;
    lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  function initCursor() {
    if (!fine) return;
    var c = $("#cursor"), label = $(".cursor__label", c);
    var xTo = gsap.quickTo(c, "x", { duration: 0.35, ease: "power3" }), yTo = gsap.quickTo(c, "y", { duration: 0.35, ease: "power3" });
    window.addEventListener("mousemove", function (e) { c.classList.add("is-on"); xTo(e.clientX); yTo(e.clientY); });
    document.addEventListener("mouseleave", function () { c.classList.remove("is-on"); });
    document.addEventListener("mouseover", function (e) {
      var l = e.target.closest("[data-cursor]"), a = e.target.closest("a, button, label, input, textarea");
      c.classList.toggle("is-label", !!l);
      c.classList.toggle("is-link", !l && !!a);
      if (l) label.textContent = l.dataset.cursor;
    });
    $$("[data-magnetic]").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.4, ease: "power3" });
      });
      el.addEventListener("mouseleave", function () { gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, .45)" }); });
    });
  }

  function initRotator(id, interval) {
    var r = $(id); if (!r) return;
    var items = $$("span", r); if (items.length < 2) return;
    var inner = document.createElement("div");
    items.forEach(function (s) { inner.appendChild(s); });
    inner.appendChild(items[0].cloneNode(true)); r.appendChild(inner);
    var n = items.length, tl = gsap.timeline({ repeat: -1, delay: 2.4 });
    for (var i = 1; i <= n; i++) tl.to(inner, { yPercent: -100 * i / (n + 1), duration: 0.7, ease: "power4.inOut" }, "+=" + (i === 1 ? 0 : interval));
    tl.set(inner, { yPercent: 0 }, "+=" + interval);
  }

  function heroIntro() {
    var tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.from(".hero__word--back span", { yPercent: 105, duration: 1.3 }, 0)
      .from(".hero__cut", { yPercent: 14, opacity: 0, duration: 1.4 }, 0.15)
      .from(".hero__word--front span", { opacity: 0, duration: 1.2 }, 0.6)
      .from(".hero__first", { yPercent: 110, duration: 1 }, 0.35)
      .from(".hero__eyebrow, .hero__ar", { opacity: 0, y: 14, duration: 0.8, stagger: 0.1 }, 0.7)
      .from(".hero__lede > *, .hero__meta li, .hero__actions > *", { opacity: 0, y: 26, duration: 0.9, stagger: 0.08 }, 0.75)
      .from(".nav", { yPercent: -100, opacity: 0, duration: 0.9, clearProps: "all" }, 0.6)
      .from(".hero__scroll", { opacity: 0, duration: 0.8 }, 1.3);
    return tl;
  }

  function initHero() {
    // scroll parallax
    var st = { trigger: ".hero", start: "top top", end: "bottom top", scrub: true };
    gsap.to(".hero__word", { yPercent: 38, ease: "none", scrollTrigger: st });
    gsap.to(".hero__figure", { yPercent: 9, ease: "none", scrollTrigger: st });
    gsap.to(".hero__top, .hero__bottom", { opacity: 0, y: -40, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "55% top", scrub: true } });
    // pointer parallax
    if (!fine) return;
    var hero = $(".hero");
    var fx = gsap.quickTo(".hero__figure", "x", { duration: 0.9, ease: "power3" });
    var wx = gsap.quickTo(".hero__word--back", "x", { duration: 1.1, ease: "power3" });
    var ox = gsap.quickTo(".hero__word--front", "x", { duration: 1.3, ease: "power3" });
    hero.addEventListener("mousemove", function (e) {
      var p = e.clientX / window.innerWidth - 0.5;
      fx(p * 26); wx(p * -44); ox(p * -70);
    });
  }

  function initLoader(done) {
    var num = $("#loaderNum"), bar = $("#loaderBar"), loader = $("#loader"), o = { v: 0 };
    var hero = $(".hero__cut"), ready = hero.complete;
    if (!ready) { hero.addEventListener("load", function () { ready = true; }); hero.addEventListener("error", function () { ready = true; }); setTimeout(function () { ready = true; }, 3500); }
    if (lenis) lenis.stop();
    window.scrollTo(0, 0);
    gsap.to(o, {
      v: 100, duration: 1.5, ease: "power2.inOut",
      onUpdate: function () { var v = Math.round(o.v); num.textContent = v; bar.style.width = v + "%"; },
      onComplete: function wait() {
        if (!ready) return setTimeout(wait, 80);
        gsap.timeline()
          .to(".loader__count, .loader__brand", { yPercent: -40, opacity: 0, duration: 0.45, ease: "power2.in" })
          .to(loader, { yPercent: -100, duration: 0.85, ease: "power4.inOut" }, "-=0.1")
          .add(function () { loader.style.display = "none"; if (lenis) lenis.start(); })
          .add(done, "-=0.55");
      }
    });
  }

  function initScroll() {
    // progress bar
    gsap.to("#progressBar", { scaleX: 1, ease: "none", scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.3 } });

    // headline lines
    $$(".split").forEach(function (h) {
      gsap.to($$(".line__in", h), { y: 0, yPercent: 0, duration: 1.1, ease: "power4.out", stagger: 0.12, scrollTrigger: { trigger: h, start: "top 86%", once: true } });
    });

    // generic reveals
    ScrollTrigger.batch("[data-reveal]", {
      start: "top 90%", once: true,
      onEnter: function (batch) {
        // anything already scrolled past (e.g. after an anchor jump) shows instantly
        var els = [];
        batch.forEach(function (el) {
          if (el.getBoundingClientRect().bottom < 0) { el.classList.add("is-done"); gsap.set(el, { clearProps: "opacity,transform" }); }
          else els.push(el);
        });
        if (!els.length) return;
        gsap.to(els, { opacity: 1, y: 0, duration: 0.95, ease: "power3.out", stagger: { amount: Math.min(0.45, els.length * 0.09) }, overwrite: true,
          onComplete: function () { els.forEach(function (el) { el.classList.add("is-done"); }); gsap.set(els, { clearProps: "opacity,transform" }); } });
      }
    });

    // counters
    $$("[data-count]").forEach(function (el) {
      var end = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), suf = el.dataset.suffix || "", o = { v: 0 };
      ScrollTrigger.create({ trigger: el, start: "top 92%", once: true, onEnter: function () {
        gsap.to(o, { v: end, duration: 1.8, ease: "power3.out", onUpdate: function () { el.textContent = o.v.toFixed(dec) + suf; } });
      } });
    });

    // parallax photos
    $$("[data-parallax]").forEach(function (el) {
      gsap.fromTo(el, { yPercent: -parseFloat(el.dataset.parallax) }, { yPercent: parseFloat(el.dataset.parallax), ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
    });

    // marquee reacts to scroll velocity
    var mq = $(".marquee__track");
    if (mq) ScrollTrigger.create({ onUpdate: function (s) { var v = Math.max(-6, Math.min(6, s.getVelocity() / 300)); gsap.to(mq, { skewX: -v, duration: 0.4, overwrite: true }); } });

    // contact title + portrait
    gsap.from(".contact__title", { yPercent: 40, opacity: 0, duration: 1.2, ease: "power4.out", scrollTrigger: { trigger: ".contact", start: "top 70%", once: true } });
    gsap.fromTo(".contact__bg", { yPercent: 12 }, { yPercent: -6, ease: "none", scrollTrigger: { trigger: ".contact", start: "top bottom", end: "bottom bottom", scrub: true } });

    // horizontal story (desktop)
    var mm = gsap.matchMedia();
    mm.add("(min-width: 901px)", function () {
      var track = $("#storyTrack"), rail = $("#storyRail");
      var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
      var tween = gsap.to(track, {
        x: function () { return -dist(); }, ease: "none",
        scrollTrigger: {
          trigger: ".story", pin: ".story__pin", start: "top top", end: function () { return "+=" + dist(); },
          scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: function (s) { rail.style.transform = "scaleX(" + s.progress + ")"; }
        }
      });
      gsap.from(".chapter", { opacity: 0, y: 50, duration: 0.9, ease: "power3.out", stagger: 0.08, scrollTrigger: { trigger: ".story", start: "top 60%", once: true } });
      return function () { tween.kill(); };
    });
  }

  function initManifesto() {
    var el = $("#manifesto"); if (!el) return;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (ch) {
        if (ch.nodeType !== 3) return walk(ch);
        var frag = document.createDocumentFragment();
        ch.textContent.split(/(\s+)/).forEach(function (t) {
          if (!t) return;
          if (/^\s+$/.test(t)) return frag.appendChild(document.createTextNode(" "));
          var w = document.createElement("span"); w.className = "w"; w.textContent = t; frag.appendChild(w);
        });
        node.replaceChild(frag, ch);
      });
    })(el);
    gsap.fromTo($$(".w", el), { opacity: 0.13 }, { opacity: 1, ease: "none", stagger: 0.1, scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 50%", scrub: 0.4 } });
  }

  function initContactWord() {
    var el = $("#contactWord"); if (!el) return;
    var words = ["train.", "work.", "move.", "build."], i = 0;
    setInterval(function () {
      i = (i + 1) % words.length;
      if (!anim) { el.textContent = words[i]; return; }
      gsap.to(el, { yPercent: -30, opacity: 0, duration: 0.3, ease: "power2.in", onComplete: function () {
        el.textContent = words[i]; gsap.fromTo(el, { yPercent: 30, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: "power3.out" });
      } });
    }, 2600);
  }

  /* ---------------- Boot ---------------- */
  renderStory(); renderSkills(); renderWork(); renderCerts(); renderGallery(); renderRail();
  bindZoom(); bindCopy(); bindWhatsApp();
  var y = $("#year"); if (y) y.textContent = new Date().getFullYear();

  if (anim) {
    try {
      gsap.registerPlugin(ScrollTrigger);
      splitLines();
      initSmooth();
      bindNav();
      initCursor();
      initRotator("#rotator", 1.5);
      initHero();
      initScroll();
      initManifesto();
      initContactWord();
      initLoader(heroIntro);
      window.addEventListener("load", function () { ScrollTrigger.refresh(); });
    } catch (err) {
      // never leave the page hidden if something goes wrong
      root.classList.remove("anim");
      if (window.console) console.error(err);
    }
  } else {
    bindNav();
    initContactWord();
  }
})();
