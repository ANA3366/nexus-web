// Nexus by Ana Rey · comportamiento del sitio: menú, preguntas frecuentes, Reels y animaciones.
(function () {
  "use strict";
  var cada = function (lista, fn) { Array.prototype.forEach.call(lista, fn); };
  var reducido = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  // ---------- Menú del celular ----------
  var boton = document.querySelector("[data-menu-toggle]");
  var menu = document.getElementById("nx-menu");
  function cerrarMenu() {
    if (menu) menu.hidden = true;
    if (boton) boton.setAttribute("aria-expanded", "false");
  }
  if (boton && menu) {
    boton.addEventListener("click", function () {
      var abrir = menu.hidden;
      menu.hidden = !abrir;
      boton.setAttribute("aria-expanded", String(abrir));
    });
    cada(menu.querySelectorAll("[data-menu-close]"), function (a) { a.addEventListener("click", cerrarMenu); });
    window.addEventListener("resize", function () { if (window.innerWidth >= 980) cerrarMenu(); });
  }

  // ---------- Preguntas frecuentes: una abierta a la vez ----------
  var preguntas = Array.prototype.slice.call(document.querySelectorAll("[data-faq]"));
  function poner(b, abierta) {
    b.setAttribute("aria-expanded", String(abierta));
    var r = b.parentNode.querySelector("[data-faq-a]");
    if (r) r.hidden = !abierta;
    var i = b.querySelector("[data-faq-i]");
    if (i) i.textContent = abierta ? "–" : "+";
  }
  preguntas.forEach(function (b) {
    b.addEventListener("click", function () {
      var estaba = b.getAttribute("aria-expanded") === "true";
      preguntas.forEach(function (o) { poner(o, false); });
      poner(b, !estaba);
    });
  });

  // ---------- Reels: se descargan y arrancan recién al verse; el sonido, de a uno ----------
  var videos = Array.prototype.slice.call(document.querySelectorAll("[data-reel-video]"));
  var conSonido = -1;
  function cargar(v) {
    if (!v.getAttribute("src")) { v.setAttribute("src", v.getAttribute("data-src")); v.load(); }
  }
  function reproducir(v) {
    cargar(v);
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }
  function aplicarSonido() {
    videos.forEach(function (v) {
      var i = +v.getAttribute("data-reel-video");
      var activo = i === conSonido;
      v.muted = !activo;
      var b = document.querySelector('[data-reel-sonido="' + i + '"]');
      if (!b) return;
      b.setAttribute("aria-pressed", String(activo));
      b.setAttribute("aria-label", activo ? "Silenciar" : "Activar sonido");
      var mudo = b.querySelector("[data-icono-mudo]"), sonido = b.querySelector("[data-icono-sonido]");
      if (mudo) mudo.hidden = activo;
      if (sonido) sonido.hidden = !activo;
    });
  }
  cada(document.querySelectorAll("[data-reel-sonido]"), function (b) {
    b.addEventListener("click", function () {
      var i = +b.getAttribute("data-reel-sonido");
      conSonido = conSonido === i ? -1 : i;
      aplicarSonido();
      var v = document.querySelector('[data-reel-video="' + i + '"]');
      if (v && conSonido === i) reproducir(v);
    });
  });
  if (videos.length && "IntersectionObserver" in window) {
    var ioVideos = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) { if (!reducido) reproducir(e.target); else cargar(e.target); }
        else e.target.pause();
      });
    }, { threshold: 0.2 });
    videos.forEach(function (v) { ioVideos.observe(v); });
  } else {
    videos.forEach(function (v) { if (!reducido) reproducir(v); });
  }

  // ---------- Animaciones ----------
  if (reducido || !("IntersectionObserver" in window)) return;

  var CURVA = "cubic-bezier(.2,.7,.2,1)";

  function contar(el) {
    var fin = +el.getAttribute("data-count"), dur = 1400;
    if (document.hidden) { el.textContent = String(fin); return; }
    var t0 = Date.now();
    el.textContent = "0";
    var iv = setInterval(function () {
      var p = Math.min(1, (Date.now() - t0) / dur);
      el.textContent = String(Math.round(fin * (1 - Math.pow(1 - p, 3))));
      if (p >= 1) clearInterval(iv);
    }, 16);
    setTimeout(function () { clearInterval(iv); el.textContent = String(fin); }, dur + 100);
  }

  function mostrar(el) {
    if (el.getAttribute("data-rv") === "done") return;
    el.setAttribute("data-rv", "done");
    el.style.opacity = "1";
    el.style.transform = "none";
    io.unobserve(el);
    cada(el.querySelectorAll("[data-count]"), contar);
  }

  var io = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      if (e.isIntersecting) mostrar(e.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

  function revisarVisibles() {
    var h = window.innerHeight || document.documentElement.clientHeight;
    cada(document.querySelectorAll('[data-rv="1"]'), function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < h * 0.92 && r.bottom > 0) mostrar(el);
    });
  }

  var DESDE = { up: "translateY(28px)", left: "translateX(-24px)", zoom: "scale(.94)", draw: "scaleY(0)", fade: "none" };
  cada(document.querySelectorAll("[data-reveal]"), function (el) {
    el.setAttribute("data-rv", "1");
    var tipo = el.getAttribute("data-reveal");
    var demora = +(el.getAttribute("data-delay") || 0);
    var dur = tipo === "draw" ? 1.4 : 0.8;
    el.style.opacity = tipo === "draw" ? "1" : "0";
    el.style.transform = DESDE[tipo] || "none";
    el.style.transition = "opacity " + dur + "s " + CURVA + " " + demora + "ms, transform " + dur + "s " + CURVA + " " + demora + "ms";
    el.getBoundingClientRect();
    io.observe(el);
  });

  window.addEventListener("scroll", revisarVisibles, { passive: true });
  window.addEventListener("resize", revisarVisibles, { passive: true });
  window.addEventListener("load", revisarVisibles);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) revisarVisibles(); });
  requestAnimationFrame(revisarVisibles);
  // Respaldo por si el observador no avisa (pestaña en segundo plano, navegadores viejos):
  // se revisa cada tanto qué quedó a la vista. Nunca se muestra todo de golpe, porque eso
  // dejaba la página sin nada por animar cuando cargaba sin estar en pantalla.
  var respaldo = setInterval(function () {
    if (!document.querySelector('[data-rv="1"]')) { clearInterval(respaldo); return; }
    if (!document.hidden) revisarVisibles();
  }, 400);

  cada(document.querySelectorAll("[data-spin]"), function (el) { el.style.animation = "nxSpin 28s linear infinite"; });
  cada(document.querySelectorAll("[data-float]"), function (el) {
    el.style.display = "inline-block";
    el.style.animation = "nxFloat 4.5s ease-in-out " + (el.getAttribute("data-delay") || 0) + "ms infinite";
  });
})();
