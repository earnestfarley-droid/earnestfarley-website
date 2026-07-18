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
