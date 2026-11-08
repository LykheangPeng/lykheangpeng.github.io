(function () {
    "use strict";
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var SVGNS = "http://www.w3.org/2000/svg";

    document.getElementById("year").textContent = new Date().getFullYear();

    /* ---------- nav ---------- */
    var nav = document.getElementById("nav");
    var toggle = document.getElementById("navToggle");
    var links = document.getElementById("navLinks");
    function onScroll() { nav.classList.toggle("scrolled", window.scrollY > 20); }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    toggle.addEventListener("click", function () {
        var open = links.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open);
    });
    links.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () { links.classList.remove("open"); toggle.setAttribute("aria-expanded", false); });
    });
    var navAnchors = links.querySelectorAll("a[href^='#']");
    if ("IntersectionObserver" in window) {
        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (!e.isIntersecting) return;
                navAnchors.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id); });
            });
        }, { rootMargin: "-45% 0px -50% 0px" });
        document.querySelectorAll("section[id]").forEach(function (s) { spy.observe(s); });
    }

    /* ---------- typing ---------- */
    var phrases = ["Senior Data Analytics", "IFRS 9 & IFRS 17 Models", "Explainable AI Research", "Founder, A Bit About Digital", "Lecturer & Researcher"];
    var typed = document.getElementById("typed");
    if (reduce) typed.textContent = phrases[0];
    else {
        var p = 0, i = 0, del = false;
        (function tick() {
            var w = phrases[p];
            typed.textContent = w.slice(0, i);
            var d = del ? 35 : 70;
            if (!del && i === w.length) { del = true; d = 1600; }
            else if (del && i === 0) { del = false; p = (p + 1) % phrases.length; d = 300; }
            i += del ? -1 : 1;
            setTimeout(tick, d);
        })();
    }

    /* ---------- circuit-board backgrounds ---------- */
    function rng(seed) {
        return function () {
            seed = (seed * 1664525 + 1013904223) % 4294967296;
            return seed / 4294967296;
        };
    }
    function buildCircuit(svg) {
        var W = svg.clientWidth, H = svg.clientHeight;
        if (!W || !H) return;
        while (svg.firstChild) svg.removeChild(svg.firstChild);
        svg.setAttribute("viewBox", "0 0 " + W + " " + H);
        var r = rng(+svg.getAttribute("data-seed") || 1);
        var G = 40, count = Math.round((W * H) / 26000), paths = [];
        for (var k = 0; k < count; k++) {
            var x = Math.round(r() * W / G) * G, y = Math.round(r() * H / G) * G;
            var d = "M" + x + " " + y, horiz = r() > .5, segs = 2 + Math.floor(r() * 3);
            var sx = x, sy = y;
            for (var s = 0; s < segs; s++) {
                var len = (2 + Math.floor(r() * 6)) * G * (r() > .5 ? 1 : -1);
                if (horiz) x = Math.max(0, Math.min(W, x + len)); else y = Math.max(0, Math.min(H, y + len));
                d += " L" + x + " " + y;
                horiz = !horiz;
            }
            var path = document.createElementNS(SVGNS, "path");
            path.setAttribute("d", d); path.setAttribute("class", "trace");
            svg.appendChild(path);
            paths.push(d);
            [[sx, sy, r() > .6 ? 11 : 5], [x, y, r() > .7 ? 13 : 6]].forEach(function (n) {
                var c = document.createElementNS(SVGNS, "circle");
                c.setAttribute("cx", n[0]); c.setAttribute("cy", n[1]); c.setAttribute("r", n[2]);
                c.setAttribute("class", "node");
                svg.appendChild(c);
            });
        }
        if (reduce) return;
        for (var q = 0; q < Math.min(7, paths.length); q++) {
            var pl = document.createElementNS(SVGNS, "path");
            pl.setAttribute("d", paths[Math.floor(r() * paths.length)]);
            pl.setAttribute("class", "pulse");
            pl.setAttribute("pathLength", "1000");
            pl.style.setProperty("--dur", (4 + r() * 5).toFixed(1) + "s");
            pl.style.setProperty("--delay", (-r() * 8).toFixed(1) + "s");
            svg.appendChild(pl);
        }
    }
    var circuits = document.querySelectorAll(".circuit");
    function buildAll() { circuits.forEach(buildCircuit); }
    buildAll();
    var rt, lastW = window.innerWidth;
    window.addEventListener("resize", function () {
        if (window.innerWidth === lastW) return;
        lastW = window.innerWidth;
        clearTimeout(rt); rt = setTimeout(buildAll, 200);
    });

    /* ---------- reveal + skill bars ---------- */
    function fillSkills(scope) {
        scope.querySelectorAll(".skill").forEach(function (s) {
            var lvl = +s.getAttribute("data-level");
            s.querySelector(".bar-fill").style.width = lvl + "%";
            var out = s.querySelector(".skill-val");
            if (reduce) { out.textContent = lvl + "%"; return; }
            var start = null;
            requestAnimationFrame(function step(t) {
                if (!start) start = t;
                var k = Math.min((t - start) / 1400, 1);
                out.textContent = Math.round(lvl * (1 - Math.pow(1 - k, 3))) + "%";
                if (k < 1) requestAnimationFrame(step);
            });
        });
    }
    var revealEls = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && !reduce) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (!e.isIntersecting) return;
                e.target.classList.add("in");
                if (e.target.querySelector(".skill")) fillSkills(e.target);
                io.unobserve(e.target);
            });
        }, { threshold: 0.15 });
        revealEls.forEach(function (el, n) { el.style.transitionDelay = (n % 4) * 70 + "ms"; io.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add("in"); });
        fillSkills(document);
    }
})();
