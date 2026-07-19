/* earnestfarley.com — dynamic layer v4 "Instrument"
   Vitals monitor (canvas), pinned principles console (GSAP ScrollTrigger),
   scroll reveals, counters, video showcase. Graceful fallbacks throughout. */
(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof window.gsap !== "undefined";
  if (hasGsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------- smooth inertial scroll ----------
     ScrollSmoother, not a second scroll library: it's GSAP's own plugin,
     chosen because (unlike Lenis-style scrollers) it preserves native
     document scroll semantics, so the sticky header and the pinned
     #prinPin ScrollTrigger below keep working with no extra code. Must
     be created before any ScrollTrigger instances below are set up. */
  if (hasGsap && window.ScrollSmoother && !reduced && document.getElementById("smooth-wrapper")) {
    gsap.registerPlugin(ScrollSmoother);
    ScrollSmoother.create({ smooth: 1.5, smoothTouch: 0.15 });
  }

  /* ---------- reading progress bar ---------- */
  var bar = document.querySelector(".progress");
  if (bar && !reduced) {
    var onScroll = function () {
      var h = document.documentElement;
      var p = h.scrollTop / (h.scrollHeight - h.clientHeight);
      bar.style.width = (p * 100) + "%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- ambient field: drifting glow blobs (Vanta-style backdrop,
     built on the existing GSAP install rather than a new library) ---------- */
  var glow = document.querySelector(".glow-field");
  if (glow && hasGsap && !reduced) {
    var blobDefs = [
      { cls: "b1", dx: 60, dy: 40, dur: 22 },
      { cls: "b2", dx: -50, dy: 55, dur: 27 },
      { cls: "b3", dx: 45, dy: -35, dur: 24 }
    ];
    blobDefs.forEach(function (b) {
      var el = document.createElement("div");
      el.className = "blob " + b.cls;
      glow.appendChild(el);
      gsap.to(el, { x: b.dx, y: b.dy, duration: b.dur, ease: "sine.inOut", yoyo: true, repeat: -1 });
    });
  }

  /* ---------- kinetic headline ---------- */
  var kin = document.querySelector(".kinetic");
  if (kin && !reduced) {
    var lines = kin.querySelectorAll(".line > span");
    if (hasGsap) {
      gsap.to(lines, { y: 0, duration: 1.0, ease: "power4.out", stagger: 0.12, delay: 0.1 });
    } else {
      lines.forEach(function (s, i) {
        s.style.transition = "transform 0.9s cubic-bezier(.16,1,.3,1) " + (0.1 + i * 0.12) + "s";
        requestAnimationFrame(function () { s.style.transform = "translateY(0)"; });
      });
    }
  } else if (kin) {
    kin.querySelectorAll(".line > span").forEach(function (s) { s.style.transform = "none"; });
  }
  var hl = document.querySelector(".hero .hl, .cine-title .hl");
  if (hl) setTimeout(function () { hl.classList.add("drawn"); }, reduced ? 0 : 1350);

  /* ============================================================
     CINEMATIC HERO — the city holds still; the words arrive
     through it. Photograph, scrim, and text live on separate
     planes; cursor and scroll move them against each other.
     ============================================================ */
  var cine = document.querySelector(".hero-cine");
  var headerEl = document.querySelector("header.site");
  if (cine && headerEl) {
    headerEl.classList.add("over-cine");
    var setScrolled = function () {
      headerEl.classList.toggle("scrolled", window.scrollY > 40);
    };
    window.addEventListener("scroll", setScrolled, { passive: true });
    setScrolled();
  }
  if (cine) {
    var words = cine.querySelectorAll(".cine-title .w");
    var support = cine.querySelectorAll(".cine-kicker, .cine-lede, .hero-ctas, .cine-ticker");
    if (hasGsap && !reduced) {
      /* words fly in from deep z, landing line by line */
      gsap.set(words, { z: -460, y: 64, rotationX: 28, opacity: 0, transformOrigin: "50% 100%" });
      gsap.to(words, {
        z: 0, y: 0, rotationX: 0, opacity: 1,
        duration: 1.15, ease: "power4.out", stagger: 0.075, delay: 0.2
      });
      gsap.from(support, { opacity: 0, y: 22, duration: 0.9, ease: "power3.out", stagger: 0.12, delay: 1.0 });

      /* the city breathes: a slow Ken Burns drift on the film itself */
      gsap.to("#heroFilm", {
        scale: 1.07, duration: 28, ease: "sine.inOut", yoyo: true, repeat: -1,
        transformOrigin: "50% 42%"
      });

      /* scroll: the photograph sinks and the words lift away */
      /* scroll planes: scrub moves the containers... */
      if (window.ScrollTrigger) {
        gsap.to(".cine-bg", {
          yPercent: 16, ease: "none",
          scrollTrigger: { trigger: cine, start: "top top", end: "bottom top", scrub: 0.3 }
        });
        gsap.to(".cine-content", {
          yPercent: -6, opacity: 0.35, ease: "none",
          scrollTrigger: { trigger: cine, start: "top top", end: "bottom 35%", scrub: 0.3 }
        });
      }

      /* ...cursor plane: the title drifts against the camera pan */
      var pxT = 0, pyT = 0, pxC = 0, pyC = 0;
      var titleEl = cine.querySelector(".cine-title");
      cine.addEventListener("pointermove", function (e) {
        pxT = (e.clientX / window.innerWidth - 0.5);
        pyT = (e.clientY / window.innerHeight - 0.5);
      }, { passive: true });
      (function plax() {
        requestAnimationFrame(plax);
        pxC += (pxT - pxC) * 0.045; pyC += (pyT - pyC) * 0.045;
        if (titleEl) titleEl.style.transform =
          "translate3d(" + (pxC * 12).toFixed(1) + "px," + (pyC * 7).toFixed(1) + "px,0)";
      })();
    }
  }

  /* ---------- the monitor rises out of the skyline ---------- */
  if (hasGsap && window.ScrollTrigger && !reduced) {
    gsap.from(".monitor", {
      opacity: 0, y: 46, duration: 1.0, ease: "power3.out",
      scrollTrigger: { trigger: ".monitor", start: "top 94%", once: true }
    });
  }

  /* ---------- hero film: Atlanta twilight from a drone ---------- */
  var film = document.getElementById("heroFilm");
  if (film) {
    if (reduced) {
      /* poster only: no motion for reduced-motion visitors */
      film.removeAttribute("autoplay");
    } else {
      film.playbackRate = 1.7; /* time-lapse feel: traffic and light move faster */
      var playFilm = function () { film.play().catch(function () {}); };
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (en) {
          if (en[0].isIntersecting) playFilm(); else film.pause();
        }, { threshold: 0.1 }).observe(film);
      } else playFilm();
    }
  }

  /* ============================================================
     VISTAS — the city from a different altitude at every stop.
     A fixed backdrop of bright Atlanta perspectives crossfades
     as each section arrives; a porcelain veil keeps the content
     readable while the sky stays open.
     ============================================================ */
  var vistaField = document.querySelector(".grid-field");
  var vistaSections = document.querySelectorAll("[data-vista]");
  if (vistaField) {
    var VISTA_SRCS = [
      "assets/img/atl-33133738.jpg",  /* 0: downtown aerial, blue sky */
      "assets/img/atl-33133729.jpg",  /* 1: open sky over the canopy */
      "assets/img/atl-1436322.jpg",   /* 2: street level, looking up */
      "assets/img/atl-38073458.jpg"   /* 3: the road to the skyline */
    ];
    vistaField.classList.add("has-vista");
    var vistaEls = VISTA_SRCS.map(function (src, i) {
      var d = document.createElement("div");
      d.className = "vista" + (i === 0 ? " active" : "");
      d.style.backgroundImage = "url('" + src + "')";
      vistaField.appendChild(d);
      return d;
    });
    var currentVista = 0;
    function setVista(i) {
      if (i === currentVista || !vistaEls[i]) return;
      currentVista = i;
      vistaEls.forEach(function (v, k) { v.classList.toggle("active", k === i); });
    }
    if (vistaSections.length && "IntersectionObserver" in window) {
      var vio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) setVista(parseInt(e.target.getAttribute("data-vista"), 10));
        });
      }, { rootMargin: "-40% 0px -40% 0px" });
      vistaSections.forEach(function (s) { vio.observe(s); });
    }
  }

  /* ============================================================
     METHOD SPOTLIGHT — the four frameworks present themselves.
     Portrait on one side; callouts fade through on the other.
     Hover pauses; tabs jump; reduced motion gets a static list.
     ============================================================ */
  var stage = document.getElementById("methodStage");
  if (stage) {
    var callouts = stage.querySelectorAll(".method-callout");
    var tabs = stage.querySelectorAll(".method-tabs button");
    var mIdx = 0, mTimer = null, mPaused = false;

    function setMethod(i) {
      mIdx = i;
      callouts.forEach(function (c, k) { c.classList.toggle("active", k === i); });
      tabs.forEach(function (t, k) {
        t.setAttribute("aria-current", k === i ? "true" : "false");
      });
    }
    tabs.forEach(function (t) {
      t.addEventListener("click", function () {
        setMethod(parseInt(t.getAttribute("data-method"), 10));
        restartCycle();
      });
    });

    function restartCycle() {
      if (mTimer) clearInterval(mTimer);
      if (reduced) return;
      mTimer = setInterval(function () {
        if (!mPaused) setMethod((mIdx + 1) % callouts.length);
      }, 5200);
    }

    if (!reduced) {
      stage.classList.add("enhanced");
      stage.addEventListener("pointerenter", function () { mPaused = true; });
      stage.addEventListener("pointerleave", function () { mPaused = false; });
      restartCycle();
    }
  }

  /* ---------- 3D tilt: cards live on a plane, layers float above it ---------- */
  if (!reduced && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".framework, .pillar, .service, .article-card, .contact-card").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var rx = ((e.clientY - r.top) / r.height - 0.5) * -4.5;
        var ry = ((e.clientX - r.left) / r.width - 0.5) * 4.5;
        card.style.transform = "translateY(-5px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg)";
        card.style.setProperty("--mx", (((e.clientX - r.left) / r.width) * 100).toFixed(1) + "%");
        card.style.setProperty("--my", (((e.clientY - r.top) / r.height) * 100).toFixed(1) + "%");
      });
      card.addEventListener("pointerleave", function () { card.style.transform = ""; });
    });
  }

  /* ============================================================
     VITALS MONITOR — the numbers move, on screen.
     Four documented turnarounds drawn as living traces.
     Values are canonical; the drawing is the only artistic license.
     ============================================================ */
  var vc = document.getElementById("vitals");
  if (vc) {
    var vctx = vc.getContext("2d", { desynchronized: true });
    var vdpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var VW = 0, VH = 0;
    var PAD_L = 56, PAD_R = 96, PAD_T = 26, PAD_B = 30;

    var C_LINE = "#2230e8", C_PULSE = "#ff4438", C_GRID = "rgba(78,94,117,0.14)",
        C_TICK = "rgba(78,94,117,0.08)", C_TEXT = "#4e5e75", C_BASE = "#7c8aa0";

    /* control points are shape only; printed values are the canon */
    var STORIES = [
      {
        title: "NPS · global SaaS customer org",
        value: "-52 → +20 · 72-point turnaround",
        startLbl: "-52", endLbl: "+20",
        pts: [[0,.10],[.12,.08],[.22,.16],[.34,.30],[.46,.38],[.58,.52],[.70,.62],[.82,.74],[1,.86]]
      },
      {
        title: "Operating margin · healthcare IT services",
        value: "$7M loss → 22% positive · 12 months",
        startLbl: "-$7M", endLbl: "+22%",
        pts: [[0,.12],[.15,.10],[.28,.20],[.42,.44],[.56,.62],[.72,.76],[.86,.84],[1,.87]]
      },
      {
        title: "AI drafting adoption · 1,200+ radiologists",
        value: "67% drafting vs. 46% reporting-only",
        startLbl: "46%", endLbl: "67%",
        base: [[0,.42],[.25,.43],[.5,.41],[.75,.43],[1,.42]],
        baseLbl: "reporting-only",
        pts: [[0,.42],[.18,.46],[.36,.55],[.54,.63],[.72,.70],[.86,.75],[1,.78]]
      },
      {
        title: "Patient satisfaction · 18 hospitals",
        value: "55% → 82% percentile",
        startLbl: "55", endLbl: "82",
        pts: [[0,.30],[.14,.32],[.28,.44],[.42,.46],[.56,.60],[.70,.62],[.84,.76],[1,.84]]
      }
    ];

    var storyIdx = 0, phase = "draw", phaseT0 = 0, fadeFrom = null;
    var DRAW_MS = 2600, HOLD_MS = 2600, FADE_MS = 420;
    var vRunning = true, started = false;

    function vsize() {
      var r = vc.parentElement.getBoundingClientRect();
      if (!r.width || !r.height) { setTimeout(vsize, 120); return; }
      VW = r.width; VH = r.height;
      vc.width = VW * vdpr; vc.height = VH * vdpr;
      vctx.setTransform(vdpr, 0, 0, vdpr, 0, 0);
      if (VW < 560) { PAD_L = 40; PAD_R = 64; }
      if (started && reduced) renderStatic();
    }
    vsize();
    window.addEventListener("resize", vsize);
    window.addEventListener("load", function () { if (!vc.width) vsize(); });

    /* ---------- 3D stage: the chart is a rendered object ----------
       Chart coords (u along, v value) live on a plane extruded zd
       deep, yaw-rotated and perspective-projected. The cursor tilts
       the stage; an idle drift keeps it breathing. */
    var vYaw = 0.3, vYawT = 0;
    var ZDEPTH = 26, ZFLOOR = 116;
    function p3(u, v, z) {
      var xw = VW * 0.2, f = 560, camd = 430;
      var camy = VH * 0.2, yh = VH * 0.31, cy = VH * 0.4;
      var x = (u - 0.5) * 2 * xw;
      var y = v * yh;
      var cs = Math.cos(vYaw), sn = Math.sin(vYaw);
      var xr = x * cs - z * sn;
      var zr = x * sn + z * cs;
      var d = zr + camd;
      return [VW / 2 + (xr * f) / d, cy + ((camy - y) * f) / d];
    }
    if (!reduced) {
      vc.parentElement.addEventListener("pointermove", function (e) {
        var r = vc.getBoundingClientRect();
        vYawT = ((e.clientX - r.left) / r.width - 0.5) * 0.2;
      }, { passive: true });
      vc.parentElement.addEventListener("pointerleave", function () { vYawT = 0; }, { passive: true });
    }

    /* catmull-rom through control points for an organic line */
    function sample(pts, t) {
      var n = pts.length - 1;
      var seg = Math.min(Math.floor(t * n), n - 1);
      var lt = t * n - seg;
      var p0 = pts[Math.max(0, seg - 1)], p1 = pts[seg], p2 = pts[seg + 1], p3 = pts[Math.min(n, seg + 2)];
      function cr(a, b, c, d, u) {
        return 0.5 * ((2 * b) + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
      }
      return [cr(p0[0], p1[0], p2[0], p3[0], lt), cr(p0[1], p1[1], p2[1], p3[1], lt)];
    }
    function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

    function drawGrid() {
      /* ease the stage tilt: cursor target + idle breathing */
      if (!reduced) {
        var idle = Math.sin(performance.now() * 0.00035) * 0.03;
        vYaw += ((0.3 + vYawT + idle) - vYaw) * 0.06;
      }
      /* floor grid, receding */
      var i, a, b;
      vctx.lineWidth = 1;
      vctx.strokeStyle = C_TICK;
      for (i = 0; i <= 12; i++) {
        a = p3(i / 12, 0, 0); b = p3(i / 12, 0, ZFLOOR);
        vctx.beginPath(); vctx.moveTo(a[0], a[1]); vctx.lineTo(b[0], b[1]); vctx.stroke();
      }
      vctx.strokeStyle = C_GRID;
      for (i = 0; i <= 4; i++) {
        a = p3(0, 0, (i / 4) * ZFLOOR); b = p3(1, 0, (i / 4) * ZFLOOR);
        vctx.beginPath(); vctx.moveTo(a[0], a[1]); vctx.lineTo(b[0], b[1]); vctx.stroke();
      }
    }

    function polyline(P, color, width, dashed) {
      vctx.strokeStyle = color; vctx.lineWidth = width;
      vctx.setLineDash(dashed ? [4, 5] : []);
      vctx.lineJoin = "round"; vctx.lineCap = "round";
      vctx.beginPath();
      for (var i = 0; i < P.length; i++) {
        if (i === 0) vctx.moveTo(P[i][0], P[i][1]); else vctx.lineTo(P[i][0], P[i][1]);
      }
      vctx.stroke();
      vctx.setLineDash([]);
    }

    function samplePath(pts, upTo, z) {
      var steps = Math.max(24, Math.floor(140 * upTo));
      var out = [];
      for (var i = 0; i <= steps; i++) {
        var t = (i / steps) * upTo;
        var p = sample(pts, t);
        out.push(p3(p[0], p[1], z));
      }
      return out;
    }

    function label(txt, x, y, color, align) {
      vctx.font = "600 10px 'Martian Mono', monospace";
      vctx.fillStyle = color; vctx.textAlign = align || "left"; vctx.textBaseline = "middle";
      vctx.fillText(txt, x, y);
    }

    function endChip(txt, x, y, alpha) {
      vctx.font = "600 11px 'Martian Mono', monospace";
      var w = vctx.measureText(txt).width + 18;
      var h = 24, rx = 6;
      var cx = Math.min(x + 12, VW - w - 8), cy = y - h / 2;
      vctx.globalAlpha = alpha;
      vctx.fillStyle = C_LINE;
      vctx.beginPath();
      vctx.moveTo(cx + rx, cy);
      vctx.arcTo(cx + w, cy, cx + w, cy + h, rx);
      vctx.arcTo(cx + w, cy + h, cx, cy + h, rx);
      vctx.arcTo(cx, cy + h, cx, cy, rx);
      vctx.arcTo(cx, cy, cx + w, cy, rx);
      vctx.fill();
      vctx.fillStyle = "#ffffff"; vctx.textAlign = "center"; vctx.textBaseline = "middle";
      vctx.fillText(txt, cx + w / 2, cy + h / 2 + 0.5);
      vctx.globalAlpha = 1;
    }

    function drawStory(s, prog, alpha) {
      vctx.globalAlpha = alpha;
      var i;

      /* comparison baseline (story 2): the reporting-only cohort, set deeper */
      if (s.base) {
        var BP = samplePath(s.base, Math.min(1, prog * 1.6), ZDEPTH * 2.4);
        polyline(BP, C_BASE, 1.5, true);
        if (prog > 0.6) {
          var bEnd = BP[BP.length - 1];
          label(s.baseLbl.toUpperCase(), bEnd[0] + 10, bEnd[1], C_BASE);
        }
      }

      var F = samplePath(s.pts, prog, 0);          /* front top edge */
      var B = samplePath(s.pts, prog, ZDEPTH);     /* back top edge */
      var S = samplePath(s.pts, prog, ZDEPTH / 2); /* shadow path (at floor) */
      var uEnd = sample(s.pts, prog)[0], u0 = sample(s.pts, 0)[0];

      /* shadow cast on the floor */
      var SH = [];
      for (i = 0; i < S.length; i++) {
        var sp = sample(s.pts, (i / (S.length - 1)) * prog);
        SH.push(p3(sp[0], 0, ZDEPTH / 2));
      }
      polyline(SH, "rgba(11,21,38,0.10)", 7, false);

      /* the wall: value extruded down to the floor */
      var fEnd = p3(uEnd, 0, 0), f0 = p3(u0, 0, 0);
      var minY = VH;
      for (i = 0; i < F.length; i++) if (F[i][1] < minY) minY = F[i][1];
      var wall = vctx.createLinearGradient(0, minY, 0, Math.max(fEnd[1], f0[1]));
      wall.addColorStop(0, "rgba(34,48,232,0.16)");
      wall.addColorStop(1, "rgba(34,48,232,0.02)");
      vctx.fillStyle = wall;
      vctx.beginPath();
      vctx.moveTo(F[0][0], F[0][1]);
      for (i = 1; i < F.length; i++) vctx.lineTo(F[i][0], F[i][1]);
      vctx.lineTo(fEnd[0], fEnd[1]); vctx.lineTo(f0[0], f0[1]);
      vctx.closePath(); vctx.fill();

      /* the top ribbon: the trace with real depth */
      vctx.fillStyle = "rgba(72,82,240,0.88)";
      for (i = 0; i < F.length - 1; i++) {
        vctx.beginPath();
        vctx.moveTo(F[i][0], F[i][1]); vctx.lineTo(F[i + 1][0], F[i + 1][1]);
        vctx.lineTo(B[i + 1][0], B[i + 1][1]); vctx.lineTo(B[i][0], B[i][1]);
        vctx.closePath(); vctx.fill();
      }
      polyline(B, "rgba(26,37,184,0.45)", 1, false);
      polyline(F, C_LINE, 2.5, false);

      /* start label + pulse head / end chip */
      label(s.startLbl, F[0][0] - 10, F[0][1], C_TEXT, "right");
      var hx = F[F.length - 1][0], hy = F[F.length - 1][1];
      if (prog < 1) {
        vctx.fillStyle = "rgba(255,68,56,0.18)";
        vctx.beginPath(); vctx.arc(hx, hy, 10, 0, Math.PI * 2); vctx.fill();
        vctx.fillStyle = C_PULSE;
        vctx.beginPath(); vctx.arc(hx, hy, 3.6, 0, Math.PI * 2); vctx.fill();
      } else {
        endChip(s.endLbl, hx, hy, alpha);
      }
      vctx.globalAlpha = 1;
    }

    var mTitle = document.getElementById("mTitle");
    var mValue = document.getElementById("mValue");
    var railBtns = document.querySelectorAll(".monitor-rail button");

    function setMeta(i) {
      if (mTitle) mTitle.textContent = STORIES[i].title;
      if (mValue) mValue.textContent = STORIES[i].value;
      railBtns.forEach(function (b) {
        b.setAttribute("aria-current", b.getAttribute("data-story") == i ? "true" : "false");
      });
    }
    railBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        var i = parseInt(b.getAttribute("data-story"), 10);
        if (reduced) { storyIdx = i; setMeta(i); renderStatic(); return; }
        fadeFrom = { idx: storyIdx, prog: 1 };
        storyIdx = i; phase = "draw"; phaseT0 = performance.now(); setMeta(i);
      });
    });

    function renderStatic() {
      vctx.clearRect(0, 0, VW, VH);
      drawGrid();
      drawStory(STORIES[storyIdx], 1, 1);
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { vRunning = en[0].isIntersecting; }).observe(vc);
    }

    var lastFrame = 0;
    function loop(now) {
      requestAnimationFrame(loop);
      if (!vRunning || !VW) return;
      if (now - lastFrame < 31) return;
      lastFrame = now;
      if (!phaseT0) phaseT0 = now;
      vctx.clearRect(0, 0, VW, VH);
      drawGrid();
      var el = now - phaseT0;

      if (fadeFrom) {
        var fa = 1 - Math.min(el / FADE_MS, 1);
        if (fa > 0) drawStory(STORIES[fadeFrom.idx], fadeFrom.prog, fa * 0.6);
        else fadeFrom = null;
      }
      if (phase === "draw") {
        var p = Math.min(el / DRAW_MS, 1);
        drawStory(STORIES[storyIdx], easeInOut(p), 1);
        if (p >= 1) { phase = "hold"; phaseT0 = now; }
      } else {
        drawStory(STORIES[storyIdx], 1, 1);
        if (el > HOLD_MS) {
          fadeFrom = { idx: storyIdx, prog: 1 };
          storyIdx = (storyIdx + 1) % STORIES.length;
          setMeta(storyIdx);
          phase = "draw"; phaseT0 = now;
        }
      }
    }

    function begin() {
      if (started) return;
      started = true;
      setMeta(0);
      if (reduced) { if (VW) renderStatic(); return; }
      phaseT0 = 0;
      requestAnimationFrame(loop);
    }
    begin(); /* start now with fallback fonts; re-render static once real fonts land */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { if (reduced && VW) renderStatic(); });
    }
  }

  /* ============================================================
     OPERATING PRINCIPLES — pinned console
     Desktop + JS: section pins, scroll steps through the six
     principles. Mobile / reduced / no-JS: readable stacked list.
     ============================================================ */
  var pin = document.getElementById("prinPin");
  if (pin && hasGsap && window.ScrollTrigger && !reduced && window.innerWidth > 920) {
    pin.classList.add("enhanced");
    var panels = pin.querySelectorAll(".prin-panel");
    var stepsEls = pin.querySelectorAll(".prin-steps li");
    var numEl = document.getElementById("prinNum");
    var N = panels.length;
    var current = 0;

    function setStep(i) {
      if (i === current) return;
      current = i;
      panels.forEach(function (p, k) { p.classList.toggle("active", k === i); });
      stepsEls.forEach(function (s, k) { s.classList.toggle("active", k === i); });
      if (numEl) numEl.textContent = (i + 1 < 10 ? "0" : "") + (i + 1);
    }

    var st = ScrollTrigger.create({
      trigger: pin,
      start: "top top+=110",
      end: "+=" + (N * 440),
      pin: true,
      onUpdate: function (self) {
        var i = Math.min(N - 1, Math.floor(self.progress * N));
        setStep(i);
      }
    });

    stepsEls.forEach(function (s, k) {
      s.addEventListener("click", function () {
        var target = st.start + ((k + 0.5) / N) * (st.end - st.start);
        window.scrollTo({ top: target, behavior: "smooth" });
      });
    });
  }

  /* ---------- scroll reveals ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (hasGsap && !reduced) {
    revealEls.forEach(function (el) {
      if (el.classList.contains("in")) return;
      var delay = el.classList.contains("d1") ? 0.08 : el.classList.contains("d2") ? 0.16 :
                  el.classList.contains("d3") ? 0.24 : el.classList.contains("d4") ? 0.32 : 0;
      gsap.fromTo(el, { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.8, delay: delay, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
        onComplete: function () { el.classList.add("in"); el.style.opacity = ""; el.style.transform = ""; }
      });
    });
  } else if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- counters ---------- */
  function springCount(el) {
    var target = parseFloat(el.getAttribute("data-target"));
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduced) { el.textContent = prefix + target + suffix; return; }
    if (hasGsap) {
      var o = { v: 0 };
      gsap.to(o, { v: target, duration: 1.6, ease: "power2.out",
        onUpdate: function () { el.textContent = prefix + Math.round(o.v) + suffix; } });
    } else {
      var start = null, dur = 1400;
      (function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        el.textContent = prefix + Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(step);
      })(performance.now());
    }
  }
  document.querySelectorAll(".count").forEach(function (el) {
    if ("IntersectionObserver" in window) {
      var cio = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { springCount(el); cio.disconnect(); }
      }, { threshold: 0.5 });
      cio.observe(el);
    } else springCount(el);
  });

  /* ---------- signature video showcase ---------- */
  var showVid = document.getElementById("adoptionVideo");
  var showToggle = document.getElementById("showcaseToggle");
  if (showVid && showToggle) {
    var iconPlay = document.getElementById("iconPlay");
    var iconPause = document.getElementById("iconPause");
    var userPaused = false;

    function setToggleState(playing) {
      showToggle.setAttribute("aria-pressed", playing ? "true" : "false");
      showToggle.setAttribute("aria-label", playing ? "Pause animation" : "Play animation");
      iconPlay.style.display = playing ? "none" : "block";
      iconPause.style.display = playing ? "block" : "none";
    }

    showToggle.addEventListener("click", function () {
      if (showVid.paused) {
        showVid.play(); userPaused = false; setToggleState(true);
      } else {
        showVid.pause(); userPaused = true; setToggleState(false);
      }
    });

    if (!reduced && "IntersectionObserver" in window) {
      /* warm the buffer early so playback is instant on arrival */
      new IntersectionObserver(function (en, obs) {
        if (en[0].isIntersecting) { showVid.setAttribute("preload", "auto"); showVid.load(); obs.disconnect(); }
      }, { rootMargin: "150% 0px" }).observe(showVid);
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (userPaused) return;
          if (e.isIntersecting) { showVid.play(); setToggleState(true); }
          else { showVid.pause(); }
        });
      }, { threshold: 0.12, rootMargin: "12% 0px" }).observe(showVid);
    } else {
      setToggleState(false);
    }
  }

  /* ---------- board-ready biography: copy to clipboard (about page) ---------- */
  var copyBtn = document.getElementById("copyBio");
  var bioText = document.getElementById("boardBioText");
  if (copyBtn && bioText) {
    copyBtn.addEventListener("click", function () {
      var text = bioText.innerText;
      var done = function () {
        copyBtn.classList.add("copied");
        copyBtn.textContent = "Copied. Send it up the chain.";
        setTimeout(function () {
          copyBtn.classList.remove("copied");
          copyBtn.textContent = "Copy biography";
        }, 2600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () {});
      } else {
        var ta = document.createElement("textarea");
        ta.value = text; document.body.appendChild(ta);
        ta.select(); document.execCommand("copy");
        document.body.removeChild(ta); done();
      }
    });
  }

  /* ============================================================
     GLOBAL FOOTPRINT GLOBE — orthographic canvas globe.
     No external library: same hand-authored-canvas discipline as
     the vitals monitor. Plots real career geography with arcs from
     the Atlanta hub; trans-oceanic routes in amber. Experience page.
     ============================================================ */
  var gcanvas = document.getElementById("footprintGlobe");
  if (gcanvas) {
    var gctx = gcanvas.getContext("2d");
    var gdpr = Math.min(window.devicePixelRatio || 1, 2);
    var GW = 0, R = 0, CX = 0, CY = 0;

    var CITIES = [
      { n: "Atlanta", lat: 33.749, lon: -84.388, hub: true },
      { n: "Seattle", lat: 47.61, lon: -122.33 },
      { n: "Los Angeles", lat: 34.05, lon: -118.24 },
      { n: "Denver", lat: 39.74, lon: -104.99 },
      { n: "Omaha", lat: 41.26, lon: -95.94 },
      { n: "Dallas", lat: 32.78, lon: -96.80 },
      { n: "Little Rock", lat: 34.75, lon: -92.29 },
      { n: "New Orleans", lat: 29.95, lon: -90.07 },
      { n: "Daytona Beach", lat: 29.21, lon: -81.02 },
      { n: "Boston", lat: 42.36, lon: -71.06 },
      { n: "Toronto", lat: 43.65, lon: -79.38 },
      { n: "Montreal", lat: 45.50, lon: -73.57 },
      { n: "Winnipeg", lat: 49.90, lon: -97.14 },
      { n: "London", lat: 51.51, lon: -0.13, intl: true },
      { n: "Mauritius", lat: -20.16, lon: 57.50, intl: true },
      { n: "Bangalore", lat: 12.97, lon: 77.59, intl: true },
      { n: "Manila", lat: 14.60, lon: 120.98, intl: true }
    ];
    /* invisible waypoints spread across the globe so the arc web and its beads
       cover the whole sphere, not just the northern city cluster. No dots, no
       labels: they only anchor lines. Aesthetic, per the loose-meaning brief. */
    var WAYPOINTS = [
      { lat: -12, lon: -58 }, { lat: -28, lon: 133 }, { lat: -30, lon: 22 },
      { lat: 8, lon: -33 }, { lat: 33, lon: 104 }, { lat: -2, lon: 162 },
      { lat: -18, lon: 96 }, { lat: 58, lon: -118 }, { lat: 22, lon: -158 },
      { lat: -40, lon: -72 }, { lat: 40, lon: 30 }, { lat: -8, lon: 40 }
    ];
    var NODES = CITIES.concat(WAYPOINTS);
    /* low-res world coastlines (world-atlas land-110m, simplified) */
    var LAND = [[[-59.6,-80],[-60.2,-81],[-62.3,-80.9],[-64.5,-80.9],[-65.7,-80.6],[-64,-80.3],[-61.9,-80.4],[-60.6,-79.6],[-59.6,-80],[-59.6,-80]],[[-159.2,-79.5],[-161.1,-79.6],[-162.4,-79.3],[-163.7,-78.6],[-161.2,-78.4],[-159.5,-79],[-159.2,-79.5]],[[-45.2,-78],[-43.9,-78.5],[-43.4,-79.5],[-44.9,-80.3],[-46.5,-80.6],[-48.4,-80.8],[-50.5,-81],[-52.9,-81],[-54.2,-80.6],[-51.9,-79.9],[-50.4,-79.2],[-49.3,-78.5],[-48.2,-78],[-46.7,-77.8],[-45.2,-78],[-45.2,-78]],[[-99,-71.9],[-97.9,-72.1],[-96.8,-72],[-98.2,-72.5],[-99.4,-72.4],[-100.8,-72.5],[-102.3,-71.9],[-100.4,-71.9],[-99,-71.9],[-99,-71.9]],[[-68.5,-71],[-68.8,-72.2],[-70,-72.3],[-71.1,-72.5],[-72.4,-72.5],[-74.2,-72.4],[-73.9,-71.3],[-72.1,-71.2],[-71.7,-69.5],[-70.3,-68.9],[-69.1,-70.1],[-68.5,-71]],[[-180,-84.7],[-179.1,-84.1],[-177.3,-84.5],[-176.1,-84.1],[-174.4,-84.5],[-173.1,-84.1],[-170,-83.9],[-168.5,-84.2],[-167,-84.6],[-164.2,-84.8],[-161.9,-85.1],[-158.1,-85.4],[-155.2,-85.1],[-150.9,-85.3],[-148.5,-85.6],[-145.9,-85.3],[-143.1,-85],[-146.8,-84.5],[-150.1,-84.3],[-153.6,-83.7],[-152.7,-82.5],[-154.5,-81.8],[-156.8,-81.1],[-154.4,-81.2],[-152.1,-81],[-150.6,-81.3],[-148.9,-81],[-147.2,-80.7],[-148.1,-79.7],[-149.5,-79.4],[-151.6,-79.3],[-153.4,-79.2],[-155.3,-79.1],[-157.3,-78.4],[-158.4,-76.9],[-157,-77.3],[-155.3,-77.2],[-153.7,-77.1],[-151.3,-77.4],[-150,-77.2],[-148.7,-76.9],[-147.6,-76.6],[-146.1,-76.5],[-146.2,-75.4],[-144.9,-75.2],[-142.8,-75.3],[-141.6,-75.1],[-140.2,-75.1],[-138.9,-75],[-137.5,-74.7],[-135.2,-74.3],[-133.7,-74.4],[-132.3,-74.3],[-130.9,-74.5],[-129.6,-74.5],[-128.2,-74.3],[-126.9,-74.4],[-125.4,-74.5],[-124,-74.5],[-122.6,-74.5],[-121.1,-74.5],[-119.7,-74.5],[-117.5,-74],[-116.2,-74.2],[-115,-74.1],[-113.9,-73.7],[-112.9,-74.4],[-111.3,-74.4],[-110.1,-74.8],[-108.7,-74.9],[-107.6,-75.2],[-106.1,-75.1],[-104.9,-74.9],[-103.4,-75],[-102,-75.1],[-100.6,-75.3],[-101.3,-74.2],[-102.5,-74.1],[-103.7,-72.6],[-101.6,-72.8],[-100.3,-72.8],[-99.1,-72.9],[-97.7,-73.6],[-96.3,-73.6],[-95,-73.5],[-93.7,-73.3],[-92.4,-73.2],[-90.1,-73.3],[-89.2,-72.6],[-87.3,-73.2],[-86,-73.1],[-83.9,-73.5],[-82.7,-73.6],[-81.5,-73.9],[-80.3,-73.1],[-77.9,-73.4],[-76.2,-74],[-74.9,-73.9],[-72.8,-73.4],[-71.6,-73.3],[-70.2,-73.1],[-68.9,-73],[-67.4,-72.5],[-67.6,-71.2],[-68.5,-70.1],[-68,-69],[-67.6,-67.7],[-66.7,-66.6],[-65.4,-65.9],[-64.2,-65.2],[-63,-64.6],[-61.4,-64.3],[-59.9,-64],[-58.6,-63.4],[-57.2,-63.5],[-58.6,-64.2],[-59.8,-64.2],[-61.3,-64.5],[-62.5,-65.1],[-62.1,-66.2],[-63.7,-66.5],[-64.9,-67.1],[-65.7,-68],[-64.8,-68.7],[-63.2,-69.2],[-62.3,-70.4],[-61.4,-72],[-60.7,-73.2],[-61.4,-74.1],[-63.3,-74.6],[-64.4,-75.3],[-65.9,-75.6],[-67.2,-75.8],[-68.4,-76],[-69.8,-76.2],[-72.2,-76.7],[-74,-76.6],[-75.6,-76.7],[-77.2,-76.7],[-75.4,-77.3],[-74.3,-77.6],[-76.5,-78.1],[-77.9,-78.4],[-76.8,-79.5],[-75.4,-80.3],[-73.2,-80.4],[-71.4,-80.7],[-70,-81],[-68.2,-81.3],[-65.7,-81.5],[-63.3,-81.7],[-61.6,-82],[-59.7,-82.4],[-58.2,-83.2],[-57,-82.9],[-55.4,-82.6],[-53.6,-82.3],[-51.5,-82],[-49.8,-81.7],[-47.3,-81.7],[-44.8,-81.8],[-42.8,-82.1],[-40.8,-81.4],[-38.2,-81.3],[-36.3,-81.1],[-34.4,-80.9],[-32.3,-80.8],[-30.1,-80.6],[-28.6,-80.3],[-29.7,-79.6],[-31.6,-79.3],[-33.7,-79.5],[-35.6,-79.5],[-35.8,-78.3],[-33.9,-77.9],[-32.2,-77.7],[-31,-77.4],[-29.8,-77.1],[-27.5,-76.5],[-26.2,-76.4],[-23.9,-76.2],[-22.5,-76.1],[-21.2,-75.9],[-20,-75.7],[-18.9,-75.4],[-17.5,-75.1],[-15.7,-74.5],[-16.1,-73.5],[-14.4,-73],[-13.3,-72.7],[-11.5,-72],[-10.3,-71.3],[-9.1,-71.3],[-7.4,-71.7],[-5.8,-71],[-4.3,-71.5],[-3,-71.3],[-1.8,-71.2],[-0.7,-71.2],[0.9,-71.3],[3,-71],[4.1,-70.9],[6.3,-70.5],[7.7,-69.9],[9.5,-70],[10.8,-70.8],[12,-70.6],[13.4,-70],[14.7,-70],[15.9,-70],[18.2,-69.9],[20.4,-70],[21.9,-70.4],[23.7,-70.5],[24.8,-70.5],[26,-70.5],[27.1,-70.5],[29.2,-70.2],[31,-69.8],[32.8,-69.4],[33.9,-68.5],[35.3,-69],[37.2,-69.2],[38.6,-69.8],[40,-69.1],[42,-68.6],[44.1,-68.3],[45.7,-67.8],[47.4,-67.7],[49,-67.1],[50.8,-66.9],[51.8,-66.2],[53.6,-65.9],[55.4,-65.9],[57.2,-66.2],[58.1,-67],[59.9,-67.4],[61.4,-68],[63.2,-67.8],[65,-67.6],[66.9,-67.9],[68.9,-67.9],[69.7,-69],[68.6,-69.9],[68.9,-71.1],[67.9,-71.9],[69.9,-72.3],[71,-72.1],[71.9,-71.3],[73.1,-70.7],[73.9,-69.9],[75.6,-69.7],[77.6,-69.5],[79.1,-68.3],[80.9,-67.9],[82.1,-67.4],[83.8,-67.3],[85.7,-67.1],[87.5,-66.9],[88.8,-67],[90.6,-67.2],[92.6,-67.2],[94.2,-67.1],[95.8,-67.4],[97.8,-67.2],[99.7,-67.2],[100.9,-66.6],[102.8,-65.6],[104.2,-66],[106.2,-66.9],[108.1,-67],[110.2,-66.7],[111.7,-66.1],[112.9,-66.1],[114.4,-66.1],[115.6,-66.7],[117.4,-66.9],[118.6,-67.2],[119.8,-67.3],[121.7,-66.9],[123.2,-66.5],[125.2,-66.7],[127,-66.6],[128.8,-66.8],[130.8,-66.4],[132.9,-66.4],[134.8,-66.2],[135.7,-65.6],[136.6,-66.8],[138.6,-66.9],[139.9,-66.9],[142.1,-66.8],[144.4,-66.8],[145.5,-66.9],[146.6,-67.9],[147.7,-68.1],[148.8,-68.4],[150.1,-68.6],[151.5,-68.7],[153.6,-68.9],[155.2,-68.8],[156.8,-69.4],[158,-69.5],[159.2,-69.6],[160.8,-70.2],[162.7,-70.7],[163.8,-70.7],[166.1,-70.8],[167.3,-70.8],[168.4,-71],[170.5,-71.4],[170.1,-72.9],[169.3,-73.7],[168,-73.8],[166.1,-74.4],[165,-75.1],[163.8,-75.9],[163.5,-77.1],[164.7,-78.2],[166.6,-78.3],[165.2,-78.9],[163.7,-79.1],[161.8,-79.2],[160.7,-80.2],[159.8,-80.9],[161.1,-81.3],[162.5,-82.1],[163.7,-82.4],[165.1,-82.7],[166.6,-83],[168.9,-83.3],[172.3,-84],[176,-84.2],[178.3,-84.5],[-180,-84.7],[-180,-84.7]],[[-67.8,-53.8],[-66.5,-54.5],[-65.1,-54.7],[-66.5,-55.2],[-68.1,-55.6],[-70,-55.2],[-72.3,-54.5],[-73.3,-54],[-74.7,-52.8],[-72.4,-53.7],[-71.1,-54.1],[-70.3,-52.9],[-68.6,-52.6],[-67.8,-53.8],[-67.8,-53.8]],[[-58.5,-51.1],[-59.4,-52.2],[-60.7,-52.3],[-60,-51.3],[-58.5,-51.1],[-58.5,-51.1]],[[145.4,-40.8],[146.9,-41],[148.3,-40.9],[148.4,-42.1],[147.9,-43.2],[146.9,-43.6],[145.4,-42.7],[144.7,-41.2],[145.4,-40.8]],[[173,-40.9],[174.2,-41.3],[173.2,-43],[172.3,-43.9],[171.2,-44.9],[170.6,-45.9],[169.3,-46.6],[167.8,-46.3],[166.5,-45.9],[168.3,-44.1],[169.7,-43.6],[171.1,-42.5],[172,-41.5],[172.8,-40.5],[173,-40.9]],[[174.6,-36.2],[175.3,-37.2],[176.8,-37.9],[178,-37.6],[178,-39.2],[177,-39.9],[176,-41.3],[174.7,-41.3],[174.9,-39.9],[173.8,-39.5],[174.7,-38],[174.3,-36.7],[173.1,-35.2],[174.3,-35.3],[174.6,-36.2]],[[167.1,-22.2],[165.5,-21.7],[164.2,-20.4],[165.5,-20.8],[166.6,-21.7],[167.1,-22.2]],[[-180,-16.6],[179.4,-16.8],[-180,-16.1],[-180,-16.6]],[[50.1,-13.6],[50.2,-14.8],[50.2,-16],[49.5,-17.1],[49,-19.1],[48.5,-20.5],[47.9,-22.4],[47.5,-23.8],[47.1,-24.9],[45.4,-25.6],[44,-25],[43.7,-23.6],[43.3,-22.1],[43.9,-20.8],[44.5,-19.4],[44,-18.3],[44.3,-16.9],[45.5,-16],[46.9,-15.2],[48,-14.1],[48.8,-13.1],[49.2,-12],[50.1,-13.6],[50.1,-13.6]],[[143.6,-13.8],[144.9,-14.6],[145.5,-16.3],[146.2,-17.8],[146.4,-19],[147.5,-19.5],[148.8,-20.4],[149.7,-22.3],[150.9,-23.5],[152.1,-24.5],[152.9,-25.3],[153.2,-26.6],[153.6,-28.1],[153.3,-29.5],[153.1,-30.9],[152.4,-32.6],[151.3,-33.8],[150.7,-35.2],[150.1,-36.4],[149.4,-37.8],[148.3,-37.8],[146.9,-38.6],[145.5,-38.6],[144.5,-38.1],[143.6,-38.8],[142.2,-38.4],[140.6,-38],[139.8,-36.6],[139.1,-35.7],[138.2,-34.4],[136.8,-35.3],[137.5,-34.1],[137.8,-32.9],[137,-33.8],[136,-34.9],[135.2,-33.9],[134.1,-32.8],[133,-32],[131.3,-31.5],[129.5,-31.6],[128.2,-31.9],[127.1,-32.3],[125.1,-32.7],[124,-33.5],[122.8,-33.9],[121.3,-33.8],[119.9,-34],[118.5,-34.7],[117.3,-35],[115.6,-34.4],[115.7,-33.3],[115.7,-31.6],[115.2,-30.6],[115,-29.5],[114.2,-28.1],[113.5,-26.5],[113.7,-25],[113.5,-23.8],[113.7,-22.5],[114.6,-21.8],[115.9,-21.1],[117.2,-20.6],[118.8,-20.3],[120.9,-19.7],[121.7,-18.7],[122.3,-17.8],[123,-16.4],[124.3,-16.3],[124.9,-15.1],[125.7,-14.2],[127.1,-13.8],[128.4,-14.9],[129.6,-15],[129.9,-13.6],[130.6,-12.5],[131.7,-12.3],[132.4,-11.1],[133.6,-11.8],[134.7,-11.9],[135.9,-12],[137,-12.4],[136.3,-13.3],[135.4,-14.7],[136.3,-15.6],[137.6,-16.2],[138.6,-16.8],[140.2,-17.7],[141.1,-16.8],[141.7,-15],[141.5,-13.7],[141.7,-12.4],[142.1,-11.3],[143.1,-11.9],[143.6,-13.4],[143.6,-13.8]],[[124.4,-10.1],[125,-8.9],[126.6,-8.4],[125.1,-9.4],[124.4,-10.1]],[[108.6,-6.8],[110.5,-6.9],[112.6,-6.9],[114.5,-7.8],[115.7,-8.4],[114.6,-8.8],[113.5,-8.3],[111.5,-8.3],[109.4,-7.7],[108.3,-7.8],[106.5,-7.4],[105.4,-6.9],[106.1,-5.9],[107.3,-6],[108.5,-6.4],[108.6,-6.8]],[[152,-5.5],[150.8,-6.1],[148.9,-6],[150,-5],[151.6,-4.8],[152,-5.5]],[[153.1,-4.5],[152,-3.5],[150.7,-2.7],[151.8,-3],[153,-4],[153.1,-4.5]],[[134.1,-1.2],[134.4,-2.8],[135.5,-3.4],[136.3,-2.3],[137.4,-1.7],[139.2,-2.1],[141,-2.6],[142.7,-3.3],[144.6,-3.9],[145.8,-4.9],[147.6,-6.1],[147.2,-7.4],[148.1,-8],[148.7,-9.1],[150,-9.7],[150.7,-10.6],[148.9,-10.3],[147.1,-9.5],[146,-8.1],[144.7,-7.6],[143.3,-8.2],[142.6,-9.3],[141,-9.1],[140.1,-8.3],[138.9,-8.4],[137.6,-8.4],[138.7,-7.3],[138.4,-6.2],[136,-4.5],[133.7,-3.5],[132,-2.8],[133.1,-2.5],[131.8,-1.6],[130.5,-0.9],[131.9,-0.7],[134,-0.8],[134.1,-1.2]],[[125.2,1.4],[124.4,0.4],[122.7,0.4],[121.1,0.4],[120,-0.5],[120.9,-1.4],[123.3,-0.6],[122.4,-1.5],[122.5,-3.2],[123.2,-4.7],[122.2,-5.3],[121.6,-4.2],[121,-2.6],[120.4,-4.1],[120.4,-5.5],[119.7,-4.5],[119.1,-3.5],[119.2,-2.1],[119.8,0.2],[120.9,1.3],[122.9,0.9],[124.1,0.9],[125.1,1.6],[125.2,1.4]],[[105.8,-5.9],[104.7,-5.9],[103.9,-5],[102.6,-4.2],[101.4,-2.8],[100.1,-0.7],[99.3,0.2],[98.6,1.8],[97.2,3.3],[95.4,5],[97.5,5.2],[98.4,4.3],[99.7,3.2],[100.6,2.1],[102.5,1.4],[103.8,0.1],[104,-1.1],[104.9,-2.3],[106.1,-3.1],[105.9,-4.3],[105.8,-5.9],[105.8,-5.9]],[[117.9,1.8],[119,0.9],[117.8,0.8],[117.5,-0.8],[116.6,-1.5],[116.1,-4],[114.9,-4.1],[113.8,-3.4],[112.1,-3.5],[111,-3],[110.1,-1.6],[109.1,-0.5],[109.1,1.3],[110.4,1.7],[111.4,2.7],[113,3.1],[114.2,4.5],[115.5,5.4],[116.7,6.9],[117.7,6],[119.2,5.4],[117.9,4.1],[118,2.3],[117.9,1.8]],[[126.4,8.4],[126.5,7.2],[125.4,6.8],[125.4,5.6],[124.2,6.2],[124.2,7.4],[122.8,7.5],[123.5,8.7],[124.6,8.5],[125.4,9.8],[126.3,8.8],[126.4,8.4]],[[81.2,6.2],[79.9,6.8],[79.7,8.2],[80.1,9.8],[81.3,8.6],[81.8,7.5],[81.2,6.2],[81.2,6.2]],[[118.5,9.3],[117.2,8.4],[118.4,9.7],[119.5,11.4],[119,10],[118.5,9.3]],[[121.3,18.5],[122.5,17.1],[121.7,15.9],[121.7,14.3],[124,13.8],[124.1,12.5],[122.9,13.6],[121.1,13.6],[120.7,14.8],[119.9,16.4],[120.4,17.6],[121.3,18.5],[121.3,18.5]],[[-72.6,19.9],[-70.8,19.9],[-69.8,19.3],[-68.3,18.6],[-69.6,18.4],[-71,18.3],[-72.4,18.2],[-73.9,18],[-72.7,18.4],[-73.4,19.6],[-72.6,19.9]],[[110.3,18.7],[108.7,18.5],[109.1,19.8],[110.2,20.1],[110.3,18.7],[110.3,18.7]],[[-79.7,22.8],[-78.3,22.5],[-77.1,21.7],[-75.6,21],[-74.2,20.3],[-75.6,19.9],[-77.8,19.9],[-78.5,21],[-80.2,21.8],[-81.8,22.2],[-83.5,22.2],[-84.5,21.8],[-83.8,22.8],[-82.5,23.1],[-81.4,23.1],[-79.7,22.8],[-79.7,22.8]],[[121.2,22.8],[120.1,23.6],[120.7,24.5],[121.5,25.3],[121.2,22.8],[121.2,22.8]],[[15.5,38.2],[15.3,37.1],[13.8,37.1],[12.4,37.6],[13.7,38],[15.5,38.2],[15.5,38.2]],[[141,37.1],[140.8,35.8],[139,34.7],[137.2,34.6],[135.8,33.5],[135.1,34.6],[133.3,34.4],[132.2,33.9],[131,33.9],[132,33.1],[131.3,31.5],[130.2,31.4],[129.8,32.6],[130.4,33.6],[131.9,34.8],[134.6,35.7],[136.7,37.3],[138.9,37.8],[140.1,39.4],[139.9,40.6],[141.4,41.4],[141.9,40],[141,38.2],[141,37.1]],[[143.9,44.2],[145.3,44.4],[145.5,43.3],[144.1,43],[143.2,42],[141.6,42.7],[141.1,41.6],[140,41.6],[140.3,43.3],[141.7,44.8],[143.1,44.5],[143.9,44.2]],[[-123.5,48.5],[-125.7,48.8],[-126.8,49.5],[-128.1,50],[-126.7,50.4],[-125.4,49.9],[-123.9,49.1],[-123.5,48.5]],[[-56.1,50.7],[-55.8,49.6],[-54.5,49.6],[-53.8,48.5],[-52.6,47.5],[-53.5,46.6],[-54,47.6],[-55.4,46.9],[-56.3,47.6],[-59.3,47.6],[-58.4,49.1],[-57.4,50.7],[-55.9,51.6],[-56.1,50.7]],[[-132.7,54],[-132.1,53],[-131.2,52.2],[-132.2,52.6],[-133.1,53.4],[-132.7,54]],[[143.6,50.7],[144.7,49],[143.2,49.3],[142.6,47.9],[143.5,46.8],[142.1,46],[142,47.8],[142.1,49.6],[142.2,51],[141.6,51.9],[141.7,53.3],[142.7,54.4],[143.3,52.7],[143.6,50.7],[143.6,50.7]],[[-6.8,52.3],[-8.6,51.7],[-10,51.8],[-9.2,52.9],[-9.7,53.9],[-8.3,54.7],[-6.7,55.2],[-5.7,54.6],[-6,53.2],[-6.8,52.3],[-6.8,52.3]],[[-3,58.6],[-4.1,57.6],[-2,57.7],[-3.1,56],[-1.1,54.6],[0.2,53.3],[1.7,52.7],[1,51.8],[0.5,50.8],[-0.8,50.8],[-2.5,50.5],[-3.6,50.2],[-5.2,50],[-4.3,51.2],[-5.3,52],[-4.6,53.5],[-3.1,53.4],[-3.6,54.6],[-4.8,54.8],[-5.6,56.3],[-5.8,57.8],[-5,58.6],[-3,58.6],[-3,58.6]],[[-85.2,65.7],[-83.9,65.1],[-82.8,64.8],[-81.6,64.5],[-80.1,63.7],[-82.5,63.7],[-84.1,63.6],[-85.5,63.1],[-87.2,63.5],[-86.2,64.8],[-85.2,65.7],[-85.2,65.7]],[[-14.5,66.5],[-13.6,65.1],[-14.9,64.4],[-17.8,63.7],[-20,63.6],[-22.8,64],[-24,64.9],[-22.2,65.1],[-24.3,65.6],[-22.1,66.4],[-20.6,65.7],[-19.1,66.3],[-17.8,66],[-16.2,66.5],[-14.5,66.5],[-14.5,66.5]],[[-180,69],[-177.5,68.2],[-174.9,67.2],[-171.9,66.9],[-169.9,66],[-172.5,65.4],[-173,64.3],[-174.7,64.6],[-176,64.9],[-177.2,65.5],[-178.4,65.4],[-179.9,65.9],[180,65],[178.7,64.5],[177.4,64.6],[178.9,63.3],[177.4,62.5],[174.6,61.8],[172.1,60.9],[170.7,60.3],[168.9,60.6],[166.3,59.8],[164.9,59.7],[163.5,59.9],[162,58.2],[163.2,57.6],[163.1,56.2],[161.7,55.3],[160.4,54.3],[160,53.2],[158.5,53],[156.8,51],[156,53.2],[155.4,55.4],[155.9,56.8],[156.8,57.8],[158.4,58.1],[160.1,59.3],[161.9,60.3],[163.7,61.1],[164.5,62.6],[163.3,62.5],[160.1,60.5],[159.3,61.8],[156.7,61.4],[154.2,59.8],[152.8,58.9],[151.3,58.8],[149.8,59.7],[148.5,59.2],[145.5,59.3],[142.2,59],[139,57.1],[135.1,54.7],[136.7,54.6],[138.2,53.8],[139.9,54.2],[141.3,53.1],[140.6,51.2],[140.5,50],[140.1,48.4],[138.6,47],[136.9,45.1],[135.5,44],[133.5,42.8],[132.3,43.3],[130.9,42.6],[130,41.9],[129.2,40.7],[128,40],[128.4,38.6],[129.2,37.4],[129.5,35.6],[128.2,34.9],[126.5,34.4],[126.6,35.7],[126.1,36.7],[125.7,37.9],[125.4,39.4],[124.3,39.9],[122.9,39.6],[121.1,38.9],[122.2,40.4],[120.8,40.6],[119.6,39.9],[118,39.2],[118.1,38.1],[119.7,37.2],[120.8,37.9],[122.4,37.5],[121.1,36.7],[119.7,35.6],[120.2,34.4],[121.2,32.5],[121.9,30.9],[122.1,29.8],[121.7,28.2],[120.4,27.1],[119.6,25.7],[118.7,24.5],[117.3,23.6],[115.9,22.8],[114.8,22.7],[113.2,22.1],[111.8,21.6],[110.4,20.3],[109.9,21.4],[108.5,21.7],[106.7,20.7],[105.9,19.8],[106.4,18],[107.4,16.7],[108.9,15.3],[109.3,13.4],[109.2,11.7],[107.2,10.4],[106.4,9.5],[105.2,8.6],[105.1,9.9],[103.5,10.6],[102.6,12.2],[100.8,12.6],[99.5,10.8],[99.2,9.2],[100.3,8.3],[101,6.9],[102.1,6.2],[103.4,4.9],[103.3,3.7],[103.9,2.5],[104.2,1.3],[102.6,2],[101.4,2.8],[100.7,3.9],[100.2,5.3],[100.1,6.5],[99,7.9],[98.3,9],[98.5,10.7],[98.4,12],[98.1,13.6],[97.8,14.8],[97.6,16.1],[96.5,16.4],[95.4,15.7],[94.2,16],[94.5,17.3],[93.5,19.4],[92.4,20.7],[91.8,22.2],[90.5,22.8],[89.7,21.9],[88.2,21.7],[87,21.5],[86.5,20.2],[85.1,19.5],[83.9,18.3],[82.2,17],[80.8,16],[80,15.1],[80.2,13.8],[79.9,12.1],[79.9,10.4],[78.9,9.5],[77.9,8.3],[76.6,8.9],[76.1,10.3],[75.4,11.8],[74.6,14],[73.5,16],[73.1,17.9],[72.8,19.2],[72.8,20.4],[71.2,20.8],[69.2,22.1],[68.2,23.7],[67.1,24.7],[64.5,25.2],[62.9,25.2],[61.5,25.1],[59.6,25.4],[58.5,25.6],[57.4,25.7],[57,27],[55.7,27],[54.7,26.5],[53.5,26.8],[52.5,27.6],[50.9,28.8],[50.1,30.1],[48.9,30.3],[48.1,29.3],[48.8,27.7],[50.2,26.7],[50.5,25.3],[51.6,25.8],[51.4,24.6],[52.6,24.2],[54,24.1],[55.4,25.4],[56.4,26.4],[56.4,24.9],[57.4,23.9],[58.7,23.6],[59.4,22.7],[59.3,21.4],[58.5,20.4],[57.8,19.1],[56.6,18.6],[55.7,17.9],[54.8,16.9],[53.6,16.7],[52.4,16.4],[51.2,15.2],[49.6,14.7],[48.7,14],[47.4,13.6],[45.9,13.3],[44.5,12.7],[43.2,13.2],[42.9,14.8],[42.8,15.9],[42.3,17.1],[41.2,18.7],[40.2,20.2],[39.1,21.3],[39.1,22.6],[38.5,23.7],[37.5,24.3],[36.9,25.6],[36.3,26.6],[35.1,28.1],[35,29.4],[34.4,28.3],[33.1,28.4],[32.4,29.9],[32.7,28.7],[33.3,27.7],[34.1,26.1],[34.8,25],[35.7,23.9],[36.7,22.2],[37.2,21],[37.1,19.8],[37.5,18.6],[38.4,18],[39,16.8],[39.8,15.4],[41.2,14.5],[42.3,13.3],[43.3,12.4],[43.5,11.3],[44.6,10.4],[46.6,10.8],[48,11.2],[49.3,11.4],[50.7,12],[51,10.6],[50.6,9.2],[50.1,8.1],[49.5,6.8],[48.6,5.3],[47.7,4.2],[46.6,2.9],[45.6,2],[44.1,1.1],[43.1,0.3],[42,-0.9],[40.9,-2.1],[40.1,-3.3],[39.6,-4.3],[38.7,-5.9],[39.4,-6.8],[39.3,-8],[39.5,-9.1],[40.3,-10.3],[40.4,-11.8],[40.6,-14.2],[40.5,-15.4],[39.5,-16.7],[37.4,-17.6],[36.3,-18.7],[35.2,-19.6],[35.2,-21.3],[35.5,-23.1],[35,-24.5],[33,-25.4],[32.8,-26.7],[32.5,-28.3],[31.5,-29.3],[30.6,-30.4],[28.9,-32.2],[27.5,-33.2],[26.4,-33.6],[25.2,-33.8],[23.6,-33.8],[21.5,-34.3],[20.1,-34.8],[18.9,-34.4],[18.3,-33.3],[18.2,-31.7],[17.6,-30.7],[16.3,-28.6],[15.2,-27.1],[14.7,-25.4],[14.4,-23.9],[14.4,-22.7],[13.4,-20.9],[12.8,-19.7],[11.8,-18.1],[11.6,-16.7],[12.1,-14.9],[12.5,-13.5],[13.3,-12.5],[13.7,-11.3],[13.1,-9.8],[13.2,-8.6],[12.7,-6.9],[12.2,-5.8],[11.1,-4],[10.1,-3],[8.8,-1.1],[9.3,0.3],[9.6,2.3],[9.4,3.7],[8.5,4.5],[7.1,4.5],[5.9,4.3],[5,5.6],[3.6,6.3],[1.9,6.1],[-0.5,5.3],[-2,4.7],[-3.3,5],[-4.6,5.2],[-5.8,5],[-7.5,4.3],[-9,4.8],[-9.9,5.6],[-11.4,6.8],[-12.9,7.8],[-13.2,8.9],[-14.1,9.9],[-14.8,10.9],[-16.1,11.5],[-16.8,13.2],[-17.1,14.4],[-16.7,15.6],[-16.3,17.2],[-16.3,19.1],[-16.5,20.6],[-17,21.9],[-16.3,23],[-15.4,24.4],[-14.8,25.6],[-13.8,26.6],[-13.1,27.6],[-11.7,28.1],[-10.4,29.1],[-9.6,29.9],[-9.8,31.2],[-9.3,32.6],[-7.7,33.7],[-6.2,35.1],[-5.2,35.8],[-3.6,35.4],[-2.2,35.2],[-1.2,35.7],[0.5,36.3],[3.2,36.8],[4.8,36.9],[6.3,37.1],[7.7,36.9],[9.5,37.4],[11,37.1],[10.6,35.9],[10.8,34.8],[10.3,33.8],[11.5,33.1],[12.7,32.8],[13.9,32.7],[15.2,32.3],[16.6,31.2],[18,30.8],[19.1,30.3],[20.1,31],[20.1,32.2],[21.5,32.8],[22.9,32.6],[23.9,32],[25.2,31.6],[26.5,31.6],[28.4,31],[29.7,31.2],[31,31.6],[32,30.9],[33.8,31],[34.8,32.1],[35.5,33.9],[35.9,35.4],[36.2,36.7],[34.7,36.8],[32.5,36.1],[30.6,36.7],[28.7,36.7],[27,37.7],[26.8,39],[27.3,40.4],[28.8,40.5],[31.1,41.1],[32.3,41.7],[33.5,42],[35.2,42],[36.9,41.3],[38.3,40.9],[39.5,41.1],[41.6,41.5],[41.5,42.6],[40.3,43.1],[38.7,44.3],[37.5,44.7],[38.2,46.2],[39.1,47],[37.4,47],[35.8,46.6],[35,45.7],[36.5,45.5],[35.2,44.9],[33.9,44.4],[32.5,45.3],[33.6,45.9],[31.7,46.3],[30.4,46],[29.6,45],[28.6,43.7],[27.7,42.6],[29,41.3],[27.6,41],[26.4,40.2],[25.4,40.9],[23.7,40.7],[22.6,40.3],[23.4,39.2],[24,38.2],[22.8,37.3],[21.7,36.8],[21.1,38.3],[20.2,39.3],[19.4,40.3],[19.4,41.4],[18.4,42.5],[16.9,43.2],[15.2,44.2],[14.3,45.2],[13.1,45.7],[12.4,44.9],[13.5,43.6],[15.1,42],[16.8,41.2],[18.4,40.4],[16.9,40.4],[17.1,38.9],[16.1,38],[15.7,39.5],[14.7,40.6],[13.6,41.2],[12.1,41.7],[11.2,42.4],[10.2,43.9],[8.9,44.4],[7.8,43.8],[6.5,43.1],[4.6,43.4],[3.1,43.1],[3,41.9],[2.1,41.2],[0.8,41],[0.1,40.1],[0.1,38.7],[-0.7,37.6],[-2.1,36.7],[-3.4,36.7],[-5,36.3],[-6.2,36.4],[-7.5,37.1],[-8.9,36.9],[-8.8,38.3],[-9.4,39.4],[-8.8,40.8],[-9,41.9],[-9.4,43],[-8,43.7],[-6.8,43.6],[-5.4,43.6],[-3.5,43.5],[-1.9,43.4],[-1.2,46],[-2.2,47.1],[-4.5,48],[-3.3,48.9],[-1.6,48.6],[-1.9,49.8],[1.3,50.1],[2.5,51.1],[3.8,51.6],[4.7,53.1],[6.1,53.5],[7.9,53.7],[8.5,55],[8.1,56.5],[9.4,57.2],[10.6,57.7],[10.4,56.6],[9.6,55.5],[10.9,54.4],[12.5,54.5],[13.6,54.1],[14.8,54.1],[16.4,54.5],[17.6,54.9],[18.7,54.4],[19.9,54.9],[21.3,55.2],[21.1,56.8],[22.5,57.8],[24.1,57],[24.4,58.4],[23.3,59.2],[24.6,59.5],[25.9,59.6],[28,59.5],[29.1,60],[28.1,60.5],[26.3,60.4],[24.5,60.1],[22.9,59.8],[21.3,60.7],[21.1,62.6],[22.4,63.8],[24.7,64.9],[23.9,66],[22.2,65.7],[21.2,65],[19.8,63.6],[17.8,62.7],[17.1,61.3],[18.8,60.1],[17.9,59],[16.4,57],[14.7,56.2],[12.9,55.4],[11.8,57.4],[11,58.9],[8.4,58.3],[7.1,58.1],[5.7,58.6],[5.3,59.7],[5,62],[5.9,62.6],[8.6,63.5],[10.5,64.5],[12.4,65.9],[14.8,67.8],[16.4,68.6],[19.2,69.8],[21.4,70.3],[23,70.2],[24.5,71],[26.4,71],[28.2,71.2],[31.3,70.5],[30,70.2],[31.1,69.6],[33.8,69.3],[36.5,69.1],[40.3,67.9],[41.1,66.8],[40,66.3],[38.4,66],[33.9,66.8],[34.8,65.9],[34.9,64.4],[36.2,64.1],[37.2,65.1],[39.6,64.5],[42.1,66.5],[44,66.1],[43.7,67.4],[43.5,68.6],[46.3,68.2],[45.6,67],[47.9,66.9],[50.2,68],[53.7,68.9],[54.7,68.1],[57.3,68.5],[58.8,68.9],[59.9,68.3],[61.1,68.9],[60,69.5],[63.5,69.5],[64.9,69.2],[68.5,68.1],[68.2,69.1],[66.9,69.5],[66.7,70.7],[68.5,71.9],[69.2,72.8],[72.6,72.8],[71.8,71.4],[72.8,70.4],[72.6,69],[73.7,68.4],[71.3,66.3],[72.4,66.2],[73.9,66.8],[75.1,67.8],[74.9,69],[73.6,69.6],[74.4,70.6],[73.1,71.4],[74.9,72.1],[76.4,71.2],[77.6,72.3],[79.7,72.3],[81.5,71.7],[80.6,72.6],[82.3,73.9],[84.7,73.8],[86.8,73.9],[87.2,75.1],[88.3,75.1],[90.3,75.6],[92.9,75.8],[95.9,76.1],[98.9,76.4],[100.8,76.4],[102,77.3],[104.4,77.7],[106.1,77.4],[104.7,77.1],[107,77],[108.2,76.7],[111.1,76.7],[113.3,76.2],[112.8,75],[110.2,74.5],[112.1,73.8],[113.5,73.3],[115.6,73.8],[118.8,73.6],[123.2,73],[125.4,73.6],[127,73.6],[128.6,73],[129.7,71.2],[131.3,70.8],[132.3,71.8],[133.9,71.4],[135.6,71.7],[137.5,71.3],[139.9,71.5],[139.1,72.4],[140.5,72.8],[149.5,72.2],[153,70.8],[157,71],[159,70.9],[159.7,69.7],[160.9,69.4],[162.3,69.6],[164.1,69.7],[165.9,69.5],[167.8,69.6],[169.6,68.7],[170.8,69],[170.5,70.1],[173.6,69.8],[175.7,69.9],[178.6,69.4],[-180,69],[-180,69]],[[49.1,41.3],[50.1,40.5],[49.4,39.4],[48.9,38.3],[50.1,37.4],[52.3,36.7],[53.8,37],[53.9,39],[53.4,40],[54.7,41],[53.7,42.1],[52.8,41.1],[52.7,42.4],[51.3,43.1],[50.3,44.3],[51.3,45.2],[53,45.3],[53,46.9],[51.2,47],[50,46.6],[48.6,45.8],[46.7,44.6],[47.6,43.7],[48.6,41.8],[49.1,41.3]],[[-95.6,69.1],[-97.6,69.1],[-99.8,69.4],[-98.2,70.1],[-96.6,69.7],[-95.6,69.1]],[[-180,71.5],[180,70.8],[178.7,71.1],[-180,71.5],[-180,71.5]],[[-90.5,69.5],[-89.2,69.3],[-88,68.6],[-87.3,67.2],[-86.3,67.9],[-85.6,68.8],[-84.1,69.8],[-82.6,69.7],[-81.3,69.2],[-82,68.1],[-81.4,67.1],[-83.3,66.4],[-84.7,66.3],[-86.1,66.1],[-87,65.2],[-88.5,64.1],[-89.9,64],[-90.8,63],[-91.9,62.8],[-93.2,62],[-94.2,60.9],[-94.7,58.9],[-93.2,58.8],[-92.3,57.1],[-90.9,57.3],[-89,56.9],[-87.3,56],[-86.1,55.7],[-85,55.3],[-83.4,55.2],[-82.4,54.3],[-81.4,52.2],[-79.9,51.2],[-78.6,52.6],[-79.1,54.1],[-78.2,55.1],[-77.1,55.8],[-76.6,57.2],[-78.5,58.8],[-77.3,59.9],[-78.1,62.3],[-75.7,62.3],[-73.8,62.4],[-71.7,61.5],[-69.6,61.1],[-69.3,59],[-67.7,58.2],[-66.2,58.8],[-65.2,59.9],[-63.8,59.4],[-62.5,58.2],[-61.4,57],[-60.5,55.8],[-58,54.9],[-56.9,53.8],[-55.8,53.3],[-55.7,52.1],[-57.1,51.4],[-58.8,51.1],[-60,50.2],[-61.7,50.1],[-63.9,50.3],[-65.4,50.3],[-67.2,49.5],[-68.5,49.1],[-70,47.7],[-71.1,46.8],[-68.7,48.3],[-66.6,49.1],[-65.1,49.2],[-65.1,48.1],[-64.8,47],[-63.2,45.7],[-61.5,45.9],[-60.5,47],[-59.8,45.9],[-61,45.3],[-63.3,44.7],[-65.4,43.5],[-66.2,44.5],[-64.4,45.3],[-66,45.3],[-67.1,45.1],[-68,44.3],[-70.1,43.7],[-70.8,42.3],[-70,41.6],[-71.1,41.5],[-72.3,41.3],[-73.7,40.9],[-72.2,41.1],[-73.3,40.6],[-74.2,39.7],[-75.2,39.2],[-75.4,38],[-76.4,39.1],[-77,38.2],[-76.3,37],[-75.7,35.6],[-77.4,34.5],[-78.6,33.9],[-80.3,32.5],[-81.3,31.4],[-81.3,30],[-80.5,28.5],[-80.1,26.9],[-80.4,25.2],[-81.7,25.9],[-82.7,27.5],[-82.9,29.1],[-83.7,29.9],[-85.1,29.6],[-86.4,30.4],[-87.5,30.3],[-89.2,30.3],[-89.4,29.2],[-90.9,29.1],[-92.5,29.6],[-93.8,29.7],[-95.6,28.7],[-97.1,27.8],[-97.4,26.7],[-97.5,25],[-97.8,22.9],[-97.4,21.4],[-96.5,19.9],[-95.9,18.8],[-94.4,18.1],[-92.8,18.5],[-91.4,18.9],[-90.5,19.9],[-90.3,21],[-88.5,21.5],[-87.1,21.5],[-87.4,20.3],[-87.6,19],[-88.1,18.1],[-88.4,16.5],[-87.5,15.8],[-86.1,15.9],[-85,16],[-83.8,15.4],[-83.2,14.3],[-83.6,13.1],[-83.7,11.9],[-83.4,10.4],[-82.5,9.6],[-81.4,8.8],[-79.9,9.3],[-78.5,9.4],[-77.4,8.7],[-76.1,9.3],[-75.5,10.6],[-74.3,11.1],[-72.6,11.7],[-71.8,12.4],[-71.6,11],[-72.1,9.9],[-71.4,11],[-70.2,11.4],[-68.9,11.4],[-68.2,10.6],[-66.2,10.6],[-64.9,10.1],[-63.1,10.7],[-61.9,10.7],[-60.8,9.4],[-59.8,8.4],[-58.5,7.3],[-57.5,6.3],[-55.9,5.8],[-54,5.8],[-52.9,5.4],[-51.8,4.6],[-51.1,3.6],[-50.5,1.9],[-50.7,0.2],[-48.6,-0.2],[-46.6,-0.9],[-44.9,-1.6],[-44.6,-2.7],[-43.4,-2.4],[-41.5,-2.9],[-40,-2.9],[-38.5,-3.7],[-37.2,-4.8],[-35.6,-5.1],[-34.9,-6.7],[-35.1,-9],[-37,-11],[-37.7,-12.2],[-38.4,-13],[-38.9,-15.7],[-39.2,-17.2],[-39.6,-18.3],[-39.8,-19.6],[-40.8,-20.9],[-41.8,-22.4],[-43.1,-23],[-44.6,-23.4],[-46.5,-24.1],[-47.6,-24.9],[-48.5,-25.9],[-48.5,-27.2],[-48.9,-28.7],[-50.7,-31],[-51.6,-31.8],[-52.7,-33.2],[-53.8,-34.4],[-54.9,-35],[-56.2,-34.9],[-57.8,-34.5],[-57.4,-36],[-57.7,-38.2],[-59.2,-38.7],[-61.2,-38.9],[-62.3,-38.8],[-62.3,-40.2],[-63.8,-41.2],[-65.1,-41.1],[-64.3,-42.4],[-65.2,-43.5],[-65.6,-45],[-67.3,-45.6],[-66.6,-47],[-66,-48.1],[-67.2,-48.7],[-67.8,-49.9],[-69.1,-50.7],[-68.2,-52.4],[-69.5,-52.3],[-70.8,-52.9],[-71.4,-53.9],[-72.6,-53.5],[-73.7,-52.8],[-74.9,-52.3],[-75,-51],[-75.6,-48.7],[-74.1,-46.9],[-75.6,-46.6],[-74.7,-45.8],[-74.4,-44.1],[-73.2,-44.5],[-72.7,-42.4],[-73.7,-43.4],[-74,-41.8],[-73.7,-39.9],[-73.5,-38.3],[-73.6,-37.2],[-72.6,-35.5],[-71.9,-33.9],[-71.4,-32.4],[-71.7,-30.9],[-71.5,-28.9],[-70.9,-27.6],[-70.7,-25.7],[-70.4,-23.6],[-70.1,-21.4],[-70.2,-19.8],[-70.4,-18.3],[-71.4,-17.8],[-73.4,-16.4],[-75.2,-15.3],[-76.4,-13.8],[-77.1,-12.2],[-78.1,-10.4],[-79,-8.4],[-79.8,-7.2],[-81.3,-6.1],[-81.4,-4.7],[-80.3,-3.4],[-80,-2.2],[-80.9,-1.1],[-80,0.4],[-78.9,1.4],[-78.4,2.6],[-77.5,3.3],[-77.3,4.7],[-77.3,5.8],[-77.9,7.2],[-78.2,8.3],[-79.1,9],[-80.2,8.3],[-80.9,7.2],[-81.7,8.1],[-82.8,8.3],[-83.6,9.1],[-84.6,9.6],[-85.8,10.1],[-86.1,11.4],[-87.2,12.5],[-87.8,13.4],[-89.3,13.5],[-90.6,13.9],[-91.7,14.1],[-93.4,15.6],[-94.7,16.2],[-96.1,15.8],[-97.3,15.9],[-98.9,16.6],[-100.8,17.2],[-101.9,17.9],[-103.5,18.3],[-105,19.3],[-105.7,20.4],[-105.6,21.9],[-106.9,23.8],[-107.9,24.5],[-109.3,25.6],[-109.8,26.7],[-110.6,27.9],[-111.8,28.5],[-112.8,30],[-113.1,31.2],[-114.2,31.5],[-114.7,30.2],[-113.6,29.1],[-112.8,27.8],[-111.6,26.7],[-111,25.3],[-110.2,24.3],[-109.4,23.4],[-111,24],[-112.2,24.7],[-112.3,26],[-113.5,26.8],[-115.1,27.7],[-114.2,28.6],[-115.5,29.6],[-116.3,30.8],[-117.1,32.5],[-117.9,33.6],[-119.1,34.1],[-120.4,34.4],[-121.7,36.2],[-122.5,37.6],[-123.7,39],[-124.4,40.3],[-124.2,42],[-124.1,43.7],[-123.9,45.5],[-124.1,46.9],[-124.7,48.2],[-123.1,48],[-124.9,50],[-127.4,50.8],[-127.8,52.3],[-129.1,52.8],[-130.5,54.3],[-132,55.5],[-133.5,57.2],[-135,58.2],[-136.6,58.2],[-137.8,58.5],[-139.9,59.5],[-142.6,60.1],[-144,60],[-145.9,60.5],[-147.1,60.9],[-148.2,60.7],[-149.7,59.7],[-151.7,59.2],[-151.4,60.7],[-150.3,61],[-151.9,60.7],[-154,59.4],[-154.2,58.1],[-155.3,57.7],[-156.6,57],[-158.1,56.5],[-159.6,55.6],[-161.2,55.4],[-163.1,54.7],[-164.8,54.4],[-163.8,55],[-161.8,55.9],[-160.6,56],[-158.7,57],[-157.7,57.6],[-157,58.9],[-158.2,58.6],[-159.7,58.9],[-161.4,58.7],[-162.5,60],[-163.8,59.8],[-165.3,60.5],[-166.1,61.5],[-164.9,62.6],[-163.8,63.2],[-162.3,63.5],[-160.8,63.8],[-161.4,64.8],[-162.8,64.3],[-165,64.4],[-166.4,64.7],[-168.1,65.7],[-166.7,66.1],[-164.5,66.6],[-161.7,66.1],[-163.7,67.1],[-165.4,68],[-166.8,68.4],[-164.4,68.9],[-163.2,69.4],[-161.9,70.3],[-159,70.9],[-156.6,71.4],[-155.1,71.1],[-153.9,70.9],[-152.2,70.8],[-150.7,70.4],[-147.6,70.2],[-145.7,70.1],[-143.6,70.2],[-142.1,69.9],[-139.1,69.5],[-137.5,69],[-135.6,69.3],[-134.4,69.6],[-132.9,69.5],[-131.4,69.9],[-129.8,70.2],[-128.4,70],[-125.8,69.5],[-124.4,70.2],[-123.1,69.6],[-121.5,69.8],[-119.9,69.4],[-117.6,69],[-116.2,68.8],[-113.9,68.4],[-115.3,67.9],[-113.5,67.7],[-110.8,67.8],[-108.9,67.4],[-107.8,67.9],[-108.8,68.3],[-107,68.7],[-105.3,68.6],[-104.3,68],[-103.2,68.1],[-101.5,67.6],[-99.9,67.8],[-98.4,67.8],[-97.7,68.6],[-96.1,68.2],[-94.7,68.1],[-94.2,69.1],[-95.3,69.7],[-96.5,70.1],[-96.4,71.2],[-95.2,71.9],[-93.9,71.8],[-92.9,71.3],[-91.5,70.2],[-90.5,69.5],[-90.5,69.5]],[[-114.2,73.1],[-112.4,73],[-111.1,72.5],[-109.9,73],[-108.2,71.7],[-108.4,73.1],[-106.5,73.1],[-105.4,72.7],[-104.8,71.7],[-102.8,70.5],[-101,70],[-102.7,69.5],[-104.2,68.9],[-106,69.2],[-107.1,69.1],[-109,68.8],[-112,68.6],[-113.3,68.5],[-115.2,69.3],[-117.3,70],[-115.1,70.2],[-113.7,70.2],[-112.4,70.4],[-114.3,70.6],[-116.5,70.5],[-117.9,70.5],[-116.1,71.3],[-117.7,71.3],[-119.4,71.6],[-118.6,72.3],[-115.2,73.3],[-114.2,73.1]],[[-76.3,73.1],[-78.4,72.9],[-79.5,72.7],[-80.9,73.3],[-78.1,73.7],[-76.3,73.1],[-76.3,73.1]],[[-86.6,73.2],[-84.9,73.3],[-82.3,73.8],[-80.6,72.7],[-78.8,72.4],[-75.6,72.2],[-74.2,71.8],[-72.2,71.6],[-71.2,70.9],[-68.8,70.5],[-67,69.2],[-68.8,68.7],[-66.5,68.1],[-64.9,67.8],[-63.4,66.9],[-61.9,66.9],[-63.9,65],[-65.1,65.4],[-66.7,66.4],[-68,66.3],[-67.1,65.1],[-65.7,64.6],[-64.7,63.4],[-66.3,62.9],[-68.8,63.7],[-67.4,62.9],[-66.3,62.3],[-68.9,62.3],[-71,62.9],[-72.2,63.4],[-73.4,64.2],[-74.8,64.7],[-77.7,64.2],[-76,65.3],[-74,65.5],[-72.7,67.3],[-74.8,68.6],[-76.9,68.9],[-78.2,69.8],[-79.5,69.9],[-81.3,69.7],[-84.9,70],[-87.1,70.3],[-88.7,70.4],[-89.9,71.2],[-89.4,73.1],[-88.4,73.5],[-85.8,73.8],[-86.6,73.2]],[[-100.4,73.8],[-99.2,73.6],[-97.4,73.8],[-96.5,72.6],[-98.4,71.3],[-100,71.7],[-102.5,72.5],[-100.4,72.7],[-101.5,73.4],[-100.4,73.8],[-100.4,73.8]],[[-93.2,72.8],[-94.3,72],[-95.4,72.1],[-96,73.4],[-94.5,74.1],[-92.4,74.1],[-90.5,73.9],[-92,73],[-93.2,72.8],[-93.2,72.8]],[[-120.5,71.4],[-123.1,70.9],[-125.9,71.9],[-124.8,73],[-124.9,74.3],[-121.5,74.4],[-120.1,74.2],[-117.6,74.2],[-115.5,73.5],[-116.8,73.2],[-119.2,72.5],[-120.5,71.8],[-120.5,71.4]],[[145.1,75.6],[140.6,74.8],[139,74.6],[137,75.3],[138.8,76.1],[141.5,76.1],[145.1,75.6],[145.1,75.6]],[[-98.5,76.7],[-97.7,75.7],[-99.8,74.9],[-100.9,75.6],[-102.5,75.6],[-101.5,76.3],[-100,76.6],[-98.6,76.6],[-98.5,76.7]],[[-108.2,76.2],[-106.9,76],[-105.7,75.5],[-109.7,74.9],[-112.2,74.4],[-113.7,74.4],[-111.8,75.2],[-116.3,75],[-117.7,75.2],[-116.3,76.2],[-112.6,76.1],[-110.8,75.5],[-109.1,75.5],[-110.5,76.4],[-108.6,76.7],[-108.2,76.2]],[[57.5,70.7],[53.7,70.8],[51.6,71.5],[52.5,72.2],[54.4,73.6],[55.9,74.6],[57.9,75.6],[61.2,76.3],[64.5,76.4],[66.2,76.8],[68.2,76.9],[64.6,75.7],[61.6,75.3],[58.5,74.3],[57,73.3],[55.4,72.4],[57.5,70.7],[57.5,70.7]],[[-94.7,77.1],[-93.6,76.8],[-91.6,76.8],[-89.8,75.8],[-87.8,75.6],[-86.4,75.5],[-84.8,75.7],[-82.8,75.8],[-81.1,75.7],[-80.1,75.3],[-81.9,74.4],[-83.2,74.6],[-86.1,74.4],[-88.1,74.4],[-89.8,74.5],[-92.4,74.8],[-92.9,75.9],[-96,76.4],[-97.1,76.8],[-94.7,77.1],[-94.7,77.1]],[[-116.2,77.6],[-117.1,76.5],[-119.9,76.1],[-121.5,75.9],[-122.9,76.1],[-121.2,76.9],[-119.1,77.5],[-117.6,77.5],[-116.2,77.6],[-116.2,77.6]],[[24.7,77.9],[22.5,77.4],[20.7,77.7],[22.9,78.5],[24.7,77.9],[24.7,77.9]],[[-100.1,78.3],[-101.3,78],[-102.9,78.3],[-105.2,78.4],[-103.5,79.2],[-100.8,78.8],[-100.1,78.3]],[[105.1,78.3],[99.4,77.9],[101.3,79.2],[102.8,79.3],[105.4,78.7],[105.1,78.3]],[[18.3,79.7],[21.5,79],[19,78.6],[17.6,77.6],[15.9,76.8],[13.8,77.4],[11.2,78.9],[10.4,79.7],[13.2,80],[15.1,79.7],[17,80.1],[18.3,79.7],[18.3,79.7]],[[25.4,80.4],[27.4,80.1],[25.9,79.5],[23,79.4],[20.1,79.6],[18.5,79.9],[17.4,80.3],[20.5,80.6],[21.9,80.4],[25.4,80.4],[25.4,80.4]],[[51.1,80.5],[49.8,80.4],[47.6,80],[46.5,80.2],[44.8,80.6],[46.8,80.8],[48.3,80.8],[50,80.9],[51.5,80.7],[51.1,80.5]],[[99.9,78.9],[97.8,78.8],[95,79],[93.3,79.4],[91.2,80.3],[93.8,81],[95.9,81.3],[97.9,80.7],[100.2,79.8],[99.9,78.9]],[[-87,79.7],[-85.8,79.3],[-87.2,79],[-89,78.3],[-90.8,78.2],[-92.9,78.3],[-94,78.8],[-95,79.4],[-96.1,79.7],[-95.3,80.9],[-92.4,81.3],[-91.1,80.7],[-89.4,80.5],[-87.8,80.3],[-87,79.7]],[[-68.5,83.1],[-65.8,83],[-63.7,82.9],[-61.9,82.6],[-64.3,81.9],[-66.8,81.7],[-65.5,81.5],[-67.8,80.9],[-69.5,80.6],[-71.2,79.8],[-73.2,79.6],[-76.9,79.3],[-75.5,79.2],[-76.3,78.2],[-77.9,77.9],[-79.8,77.2],[-77.9,77],[-80.6,76.2],[-83.2,76.5],[-86.1,76.3],[-87.6,76.4],[-89.5,76.5],[-87.8,77.2],[-85,77.5],[-86.3,78.2],[-88,78.4],[-85.4,79],[-86.5,79.7],[-84.2,80.2],[-81.8,80.5],[-84.1,80.6],[-87.6,80.5],[-89.4,80.9],[-91.4,81.6],[-90.1,82.1],[-88.9,82.1],[-87,82.3],[-85.5,82.7],[-84.3,82.6],[-83.2,82.3],[-81.1,83],[-79.3,83.1],[-76.3,83.2],[-72.8,83.2],[-70.7,83.2],[-68.5,83.1],[-68.5,83.1]],[[-27.1,83.5],[-20.8,82.7],[-22.7,82.3],[-26.5,82.3],[-31.9,82.2],[-27.9,82.1],[-24.8,81.8],[-22.9,82.1],[-20.6,81.5],[-15.8,81.9],[-12.8,81.7],[-16.3,80.6],[-20,80.2],[-17.7,80.1],[-18.9,79.4],[-19.7,77.6],[-18.5,77],[-20,76.9],[-21.7,76.6],[-19.8,76.1],[-20.7,75.2],[-19.4,74.3],[-21.6,74.2],[-20.4,73.8],[-22.2,73.3],[-23.6,73.3],[-22.3,72.6],[-24.3,72.6],[-22.1,71.5],[-23.5,70.5],[-25.5,71.4],[-26.4,70.2],[-23.7,70.2],[-22.3,70.1],[-25,69.3],[-27.7,68.5],[-30.7,68.1],[-31.8,68.1],[-32.8,67.7],[-34.2,66.7],[-36.4,66],[-38.4,65.7],[-39.8,65.5],[-40.7,64.1],[-42.8,62.7],[-42.9,61.1],[-43.4,60.1],[-44.8,60],[-46.3,60.9],[-48.3,60.9],[-49.2,61.4],[-49.9,62.4],[-51.6,63.6],[-52.3,65.2],[-53.7,66.1],[-54,67.2],[-53,68.4],[-51.5,68.7],[-50.9,69.9],[-52,69.6],[-53.5,69.3],[-54.7,69.6],[-54.4,70.8],[-51.4,70.6],[-53.1,71.2],[-55,71.4],[-54.7,72.6],[-56.1,73.7],[-57.3,74.7],[-58.6,75.1],[-61.3,76.1],[-63.4,76.2],[-66.1,76.1],[-68.5,76.1],[-69.7,76.4],[-71.4,77],[-68.8,77.3],[-66.8,77.4],[-71,77.6],[-73.3,78],[-69.4,78.9],[-65.7,79.4],[-68,80.1],[-63.7,81.2],[-62.2,81.3],[-60.3,82],[-57.2,82.2],[-54.1,82.2],[-53,81.9],[-50.4,82.4],[-48,82.1],[-46.6,82],[-44.5,81.7],[-46.9,82.2],[-43.4,83.2],[-39.9,83.2],[-38.6,83.5],[-35.1,83.6],[-27.1,83.5],[-27.1,83.5]]];
    function baseVec(latDeg, lonDeg) {
      var lat = rad(latDeg), lon = rad(lonDeg);
      return [Math.cos(lat) * Math.cos(lon), Math.cos(lat) * Math.sin(lon), Math.sin(lat)];
    }
    /* a network of arcs webbing the whole globe: four signature international
       routes from Atlanta (amber), domestic hub spokes, plus a global mesh
       (ultramarine) threading the waypoints. Lines are static; glowing beads
       travel along each one, some each way. */
    var ARCS = [];
    (function buildArcs() {
      var N = NODES.length, seen = {};
      function add(a, b, intl) {
        if (a === b) return;
        var key = Math.min(a, b) + "_" + Math.max(a, b);
        if (seen[key]) { if (intl) seen[key].intl = true; return; }
        var va = baseVec(NODES[a].lat, NODES[a].lon), vb = baseVec(NODES[b].lat, NODES[b].lon);
        var d = Math.max(-1, Math.min(1, va[0]*vb[0] + va[1]*vb[1] + va[2]*vb[2]));
        var om = Math.acos(d); if (om < 1e-3) return;
        var idx = ARCS.length;
        var arc = {
          va: va, vb: vb, om: om, so: Math.sin(om), intl: !!intl,
          beads: [
            { off: (idx * 0.37) % 1, spd: 0.022 + (idx % 3) * 0.010, dir: (idx % 2) ? 1 : -1 },
            { off: ((idx * 0.37) + 0.55) % 1, spd: 0.022 + ((idx + 1) % 3) * 0.010, dir: (idx % 2) ? 1 : -1 }
          ]
        };
        seen[key] = arc; ARCS.push(arc);
      }
      [13, 14, 15, 16].forEach(function (j) { add(0, j, true); });   /* international, amber */
      for (var j = 1; j <= 12; j++) add(0, j, false);                /* domestic hub spokes */
      for (var i = 0; i < N; i++) add(i, (i + 7) % N, false);        /* global mesh, skip-7 web */
    })();

    var C_GRID = "rgba(120,140,255,0.11)", C_GRIDBACK = "rgba(120,140,255,0.05)";
    var C_ULTRA = "#5566ff", C_AMBER = "#e6a92a", C_CORAL = "#ff5a44";

    var rot = 1.55;            /* start with the Americas + Atlanta hub facing the viewer */
    var TILT = 0.36;           /* north pole tipped toward viewer: North America framed, south pole (Antarctica) out of view */
    var tiltT = 0, tiltC = 0;  /* cursor-driven tilt easing */
    var gRunning = true, reducedG = reduced;

    function gsize() {
      var r = gcanvas.parentElement.getBoundingClientRect();
      var s = Math.min(r.width, r.height) || r.width || 480;
      GW = s;
      gcanvas.width = GW * gdpr; gcanvas.height = GW * gdpr;
      gctx.setTransform(gdpr, 0, 0, gdpr, 0, 0);
      CX = GW / 2; CY = GW / 2; R = GW * 0.42;
    }
    gsize();
    window.addEventListener("resize", gsize);

    function rad(d) { return d * Math.PI / 180; }
    /* orthographic projection of (lat,lon) with polar rotation + tilt */
    function proj(latDeg, lonDeg, mult) {
      var lat = rad(latDeg), lon = rad(lonDeg) + rot;
      var cl = Math.cos(lat), sl = Math.sin(lat);
      var x = cl * Math.sin(lon);
      var y = Math.cos(TILT) * sl - Math.sin(TILT) * cl * Math.cos(lon);
      var z = Math.sin(TILT) * sl + Math.cos(TILT) * cl * Math.cos(lon);
      var m = mult || 1;
      return { x: CX + R * m * x, y: CY - R * m * y, z: z };
    }

    function drawGraticule() {
      var i, j, step = 6, first, p;
      /* meridians */
      for (var lon = -180; lon < 180; lon += 20) {
        gctx.beginPath(); first = true;
        for (j = -90; j <= 90; j += step) {
          p = proj(j, lon);
          if (p.z < 0) { first = true; continue; }
          if (first) { gctx.moveTo(p.x, p.y); first = false; } else gctx.lineTo(p.x, p.y);
        }
        gctx.strokeStyle = C_GRID; gctx.lineWidth = 1; gctx.stroke();
      }
      /* parallels */
      for (var lat = -80; lat <= 80; lat += 20) {
        gctx.beginPath(); first = true;
        for (i = -180; i <= 180; i += step) {
          p = proj(lat, i);
          if (p.z < 0) { first = true; continue; }
          if (first) { gctx.moveTo(p.x, p.y); first = false; } else gctx.lineTo(p.x, p.y);
        }
        gctx.strokeStyle = C_GRID; gctx.lineWidth = 1; gctx.stroke();
      }
    }

    /* lat/lon of a point at parameter t along a precomputed great-circle arc */
    function arcLL(arc, t) {
      var s1 = Math.sin((1 - t) * arc.om) / arc.so, s2 = Math.sin(t * arc.om) / arc.so;
      var px = s1*arc.va[0] + s2*arc.vb[0], py = s1*arc.va[1] + s2*arc.vb[1], pz = s1*arc.va[2] + s2*arc.vb[2];
      var len = Math.sqrt(px*px + py*py + pz*pz);
      return { lat: Math.asin(pz / len) * 180 / Math.PI, lon: Math.atan2(py, px) * 180 / Math.PI };
    }
    /* the static line: faint, so the traveling beads read as the motion */
    function drawArc(arc) {
      var steps = 40, prev = null, ll, lift, p, t, k;
      var gs = GW / 600;                                   /* scale strokes with globe size */
      gctx.strokeStyle = arc.intl ? C_AMBER : C_ULTRA;
      gctx.lineWidth = (arc.intl ? 3.0 : 2.4) * gs; gctx.lineCap = "round";
      for (k = 0; k <= steps; k++) {
        t = k / steps; ll = arcLL(arc, t); lift = 1;   /* flat lines: hug the sphere surface, no raised arc */
        p = proj(ll.lat, ll.lon, lift);
        if (prev && (p.z > -0.12 || prev.z > -0.12)) {
          var za = (p.z + prev.z) / 2;
          gctx.globalAlpha = (za > 0 ? 1 : 0.24) * (arc.intl ? 0.52 : 0.32);
          gctx.beginPath(); gctx.moveTo(prev.x, prev.y); gctx.lineTo(p.x, p.y); gctx.stroke();
        }
        prev = p;
      }
      gctx.globalAlpha = 1;
    }
    /* glowing beads traveling along the arc, some each way */
    function drawBeads(arc, now) {
      for (var bi = 0; bi < arc.beads.length; bi++) {
        var bd = arc.beads[bi];
        var t = ((now / 1000) * bd.spd + bd.off) % 1;
        if (bd.dir < 0) t = 1 - t;
        var ll = arcLL(arc, t), lift = 1, p = proj(ll.lat, ll.lon, lift);   /* beads ride flat on the surface */
        if (p.z <= -0.02) continue;
        var bs = GW / 600;                                   /* scale beads with globe size */
        var a = Math.min(1, Math.max(0.1, p.z + 0.25));
        gctx.globalAlpha = a * 0.9;
        gctx.beginPath(); gctx.arc(p.x, p.y, 6.6 * bs, 0, Math.PI * 2);
        gctx.fillStyle = arc.intl ? "rgba(255,207,107,0.34)" : "rgba(170,184,255,0.30)"; gctx.fill();
        gctx.globalAlpha = a;
        gctx.beginPath(); gctx.arc(p.x, p.y, 3.2 * bs, 0, Math.PI * 2);
        gctx.fillStyle = arc.intl ? "#ffe0a0" : "#d4dcff"; gctx.fill();
        gctx.globalAlpha = 1;
      }
    }

    function boxesOverlap(a, b) {
      return !(a[0] + a[2] < b[0] || b[0] + b[2] < a[0] || a[1] + a[3] < b[1] || b[1] + b[3] < a[1]);
    }
    function drawCities(now) {
      var vis = [], i, c, p, rr;
      /* pass 1: nodes. Atlanta dominates the map; intl cities are secondary; the rest are quiet dots */
      for (i = 0; i < CITIES.length; i++) {
        c = CITIES[i]; p = proj(c.lat, c.lon);
        if (p.z <= 0) continue;
        var depth = 0.55 + 0.45 * p.z;
        if (c.hub) {
          rr = 6.8 * depth;
          if (!reducedG) {
            /* layered breathing halo */
            var ph = Math.sin(now / 520) * 0.5 + 0.5;
            gctx.beginPath(); gctx.arc(p.x, p.y, rr + 9 + ph * 11, 0, Math.PI * 2);
            gctx.fillStyle = "rgba(255,90,68,0.10)"; gctx.fill();
            gctx.beginPath(); gctx.arc(p.x, p.y, rr + 4 + ph * 5, 0, Math.PI * 2);
            gctx.fillStyle = "rgba(255,90,68,0.20)"; gctx.fill();
            /* expanding sonar ring */
            var rp = (now / 1500) % 1;
            gctx.beginPath(); gctx.arc(p.x, p.y, rr + 2 + rp * 28, 0, Math.PI * 2);
            gctx.strokeStyle = "rgba(255,88,60," + (0.36 * (1 - rp)).toFixed(3) + ")";
            gctx.lineWidth = 1.4; gctx.stroke();
          }
          /* coral body with a bright white core */
          gctx.beginPath(); gctx.arc(p.x, p.y, rr, 0, Math.PI * 2);
          gctx.fillStyle = C_CORAL; gctx.fill();
          gctx.beginPath(); gctx.arc(p.x, p.y, rr * 0.42, 0, Math.PI * 2);
          gctx.fillStyle = "#fff3f0"; gctx.fill();
        } else if (c.intl) {
          rr = 3.4 * depth;
          if (!reducedG) {
            var pa = Math.sin(now / 720 + i) * 0.5 + 0.5;
            gctx.beginPath(); gctx.arc(p.x, p.y, rr + 3 + pa * 3, 0, Math.PI * 2);
            gctx.fillStyle = "rgba(230,169,42,0.12)"; gctx.fill();
          }
          gctx.beginPath(); gctx.arc(p.x, p.y, rr, 0, Math.PI * 2);
          gctx.fillStyle = C_AMBER; gctx.globalAlpha = 0.55 + 0.45 * p.z; gctx.fill(); gctx.globalAlpha = 1;
        } else {
          /* quiet domestic dot, no label */
          rr = 2.0 * depth;
          gctx.beginPath(); gctx.arc(p.x, p.y, rr, 0, Math.PI * 2);
          gctx.fillStyle = "#9fb0e8"; gctx.globalAlpha = 0.32 + 0.34 * p.z; gctx.fill(); gctx.globalAlpha = 1;
        }
        vis.push({ c: c, p: p, rr: rr });
      }
      /* pass 2: labels. Only Atlanta (always, bold) and the intl cities (space permitting) */
      var boxes = [], fs = GW < 420 ? 9 : 10.5;
      gctx.textAlign = "left"; gctx.textBaseline = "middle";
      /* Atlanta: bold, glowing, drawn first so it always wins the space */
      for (i = 0; i < vis.length; i++) {
        var a = vis[i]; if (!a.c.hub || a.p.z <= 0.06) continue;
        var afs = GW < 420 ? 12 : 14;
        gctx.font = "700 " + afs + "px 'Martian Mono', monospace";
        var aw = gctx.measureText("ATLANTA").width;
        var alx = a.p.x + a.rr + 10, aly = a.p.y;
        gctx.shadowColor = "rgba(255,68,56,0.6)"; gctx.shadowBlur = 12;
        gctx.fillStyle = "#ffe4de"; gctx.fillText("ATLANTA", alx, aly);
        gctx.shadowBlur = 0;
        boxes.push([alx - 2, aly - afs * 0.75, aw + 4, afs * 1.5]);
        break;
      }
      /* intl labels, front-most first, skipping collisions */
      gctx.font = "600 " + fs + "px 'Martian Mono', monospace";
      var intl = vis.filter(function (o) { return o.c.intl && o.p.z > 0.4; });
      intl.sort(function (x, y) { return y.p.z - x.p.z; });
      for (i = 0; i < intl.length; i++) {
        var it = intl[i];
        var name = it.c.n.toUpperCase();
        var w = gctx.measureText(name).width;
        var lx = it.p.x + it.rr + 6, ly = it.p.y;
        var box = [lx - 1, ly - fs * 0.7, w + 2, fs * 1.4];
        var hit = false;
        for (var j = 0; j < boxes.length; j++) { if (boxesOverlap(box, boxes[j])) { hit = true; break; } }
        if (hit) continue;
        boxes.push(box);
        var la = Math.min(1, (it.p.z - 0.4) / 0.26);
        gctx.fillStyle = "#efe2c8"; gctx.globalAlpha = la * 0.85;
        gctx.fillText(name, lx, ly);
        gctx.globalAlpha = 1;
      }
    }

    /* continents: stroke the front-facing coastline segments */
    function drawLand() {
      gctx.lineJoin = "round"; gctx.lineCap = "round";
      var ri, k, ring, p, started;
      /* soft underglow */
      gctx.strokeStyle = "rgba(96,124,232,0.16)"; gctx.lineWidth = 2.6;
      for (ri = 0; ri < LAND.length; ri++) {
        ring = LAND[ri]; started = false; gctx.beginPath();
        for (k = 0; k < ring.length; k++) {
          p = proj(ring[k][1], ring[k][0]);
          if (p.z > 0.02) { if (!started) { gctx.moveTo(p.x, p.y); started = true; } else gctx.lineTo(p.x, p.y); }
          else started = false;
        }
        gctx.stroke();
      }
      /* crisp coastline */
      gctx.strokeStyle = "rgba(159,181,255,0.52)"; gctx.lineWidth = 1;
      for (ri = 0; ri < LAND.length; ri++) {
        ring = LAND[ri]; started = false; gctx.beginPath();
        for (k = 0; k < ring.length; k++) {
          p = proj(ring[k][1], ring[k][0]);
          if (p.z > 0.02) { if (!started) { gctx.moveTo(p.x, p.y); started = true; } else gctx.lineTo(p.x, p.y); }
          else started = false;
        }
        gctx.stroke();
      }
    }

    function drawGlobe(now) {
      gctx.clearRect(0, 0, GW, GW);
      /* sphere body: soft dark disc with rim glow */
      var g = gctx.createRadialGradient(CX - R*0.28, CY - R*0.32, R*0.15, CX, CY, R*1.03);
      g.addColorStop(0, "rgba(46,66,120,0.72)");
      g.addColorStop(0.55, "rgba(20,34,66,0.66)");
      g.addColorStop(1, "rgba(10,18,34,0.10)");
      gctx.beginPath(); gctx.arc(CX, CY, R, 0, Math.PI * 2); gctx.fillStyle = g; gctx.fill();
      /* rim */
      gctx.beginPath(); gctx.arc(CX, CY, R, 0, Math.PI * 2);
      gctx.strokeStyle = "rgba(120,140,255,0.28)"; gctx.lineWidth = 1.4; gctx.stroke();

      drawGraticule();
      drawLand();
      var i;
      for (i = 0; i < ARCS.length; i++) drawArc(ARCS[i]);
      if (!reducedG) for (i = 0; i < ARCS.length; i++) drawBeads(ARCS[i], now);
      drawCities(now);
    }

    var gLast = 0;
    function gloop(now) {
      requestAnimationFrame(gloop);
      if (!gRunning || !GW) return;
      if (now - gLast < 32) return;   /* ~30fps cap: lighter with the full arc mesh */
      gLast = now;
      if (!reducedG) {
        rot += 0.00085;               /* slow, subtle drift, not a circus */
        TILT += ((0.36 + tiltC) - TILT) * 0.05;
        tiltC += (tiltT - tiltC) * 0.06;
      }
      drawGlobe(now);
    }

    if (!reducedG && window.matchMedia("(pointer: fine)").matches) {
      gcanvas.addEventListener("pointermove", function (e) {
        var r = gcanvas.getBoundingClientRect();
        tiltT = ((e.clientY - r.top) / r.height - 0.5) * 0.36;
      }, { passive: true });
      gcanvas.addEventListener("pointerleave", function () { tiltT = 0; }, { passive: true });
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { gRunning = en[0].isIntersecting; }).observe(gcanvas);
    }
    if (reducedG) { drawGlobe(0); } else { requestAnimationFrame(gloop); }
    window.addEventListener("load", function () { gsize(); if (reducedG) drawGlobe(0); });
  }

  /* ---------- mobile nav + footer year ---------- */
  var btn = document.querySelector(".menu-btn");
  var links = document.querySelector(".nav-links");
  if (btn && links) {
    btn.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
  var yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();
})();
