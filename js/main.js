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

  // ---------- Visor de Reels: al tocar un video se abre en grande y se desliza entre los demás ----------
  (function () {
    if (!videos.length) return;
    var ICONO_AGRANDAR = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F4F2EE" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>';
    var FLECHA = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F4F2EE" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"></polyline></svg>';
    var datos = videos.map(function (v) {
      var tarjeta = v.parentNode.parentNode;
      var link = tarjeta.querySelector("a[href]");
      var chapa = v.parentNode.querySelector("span[style*='bottom']");
      return { src: v.getAttribute("data-src"), poster: v.getAttribute("poster") || "", chapa: chapa ? chapa.textContent : "", url: link ? link.getAttribute("href") : "" };
    });

    var estilo = document.createElement("style");
    estilo.textContent =
      ".nxv{position:fixed;inset:0;z-index:1000;background:rgba(18,20,25,.96);display:flex;flex-direction:column;color:#F4F2EE}" +
      ".nxv[hidden]{display:none}" +
      ".nxv-barra{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;flex:none}" +
      ".nxv-cuenta{font:600 12px 'IBM Plex Mono',monospace;letter-spacing:.1em;color:#C8C9CE}" +
      ".nxv-boton{all:unset;cursor:pointer;width:44px;height:44px;border-radius:50%;background:rgba(244,242,238,.12);display:flex;align-items:center;justify-content:center;box-sizing:border-box;transition:background-color .2s}" +
      ".nxv-boton:hover{background:rgba(244,242,238,.24)}" +
      ".nxv-boton:focus-visible{outline:2px solid #D7FF3A;outline-offset:2px}" +
      ".nxv-pista{flex:1;min-height:0;display:flex;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;scrollbar-width:none;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}" +
      ".nxv-pista::-webkit-scrollbar{display:none}" +
      ".nxv-hoja{flex:0 0 100%;min-width:0;height:100%;scroll-snap-align:center;scroll-snap-stop:always;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:0 16px;box-sizing:border-box}" +
      ".nxv-video{height:100%;max-height:100%;aspect-ratio:9/16;max-width:100%;min-height:0;border-radius:14px;background:#22252D;object-fit:contain;display:block}" +
      ".nxv-caja{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;width:100%}" +
      ".nxv-pie{flex:none;display:flex;align-items:center;gap:14px;font:600 12px 'IBM Plex Mono',monospace}" +
      ".nxv-chapa{background:#D7FF3A;color:#22252D;padding:5px 10px;border-radius:999px;white-space:nowrap}" +
      ".nxv-pie a{color:#F4F2EE;text-decoration:underline;text-underline-offset:3px}" +
      ".nxv-flecha{position:absolute;top:50%;transform:translateY(-50%);z-index:2}" +
      ".nxv-flecha[disabled]{opacity:.25;cursor:default}" +
      ".nxv-puntos{flex:none;display:flex;justify-content:center;gap:8px;padding:14px 0 18px}" +
      ".nxv-punto{width:8px;height:8px;border-radius:50%;background:rgba(244,242,238,.3);transition:background-color .2s,transform .2s}" +
      ".nxv-punto[data-activo]{background:#D7FF3A;transform:scale(1.25)}" +
      ".nxv-agrandar{all:unset;cursor:pointer;position:absolute;left:6px;top:6px;width:32px;height:32px;border-radius:50%;background:rgba(34,37,45,.75);display:flex;align-items:center;justify-content:center;box-sizing:border-box;transition:background-color .2s}" +
      ".nxv-agrandar:hover{background:#22252D}" +
      ".nxv-agrandar:focus-visible{outline:2px solid #D7FF3A;outline-offset:2px}" +
      "@media (max-width:700px){.nxv-flecha{display:none}.nxv-hoja{padding:0 10px}}";
    document.head.appendChild(estilo);

    var visor = document.createElement("div");
    visor.className = "nxv";
    visor.hidden = true;
    visor.setAttribute("role", "dialog");
    visor.setAttribute("aria-modal", "true");
    visor.setAttribute("aria-label", "Videos en grande");
    visor.innerHTML =
      '<div class="nxv-barra"><span class="nxv-cuenta" data-nxv-cuenta></span>' +
      '<button type="button" class="nxv-boton" data-nxv-cerrar aria-label="Cerrar"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F4F2EE" stroke-width="2.4" stroke-linecap="round"><line x1="5" y1="5" x2="19" y2="19"></line><line x1="19" y1="5" x2="5" y2="19"></line></svg></button></div>' +
      '<div style="position:relative;flex:1;min-height:0;display:flex">' +
      '<button type="button" class="nxv-boton nxv-flecha" data-nxv-ir="-1" aria-label="Video anterior" style="left:18px"><span style="display:flex;transform:rotate(180deg)">' + FLECHA + "</span></button>" +
      '<div class="nxv-pista" data-nxv-pista>' +
      datos.map(function (d, i) {
        return '<div class="nxv-hoja" data-nxv-hoja="' + i + '"><div class="nxv-caja"><video class="nxv-video" data-nxv-video="' + i + '"' + (d.poster ? ' poster="' + d.poster + '"' : "") + ' controls loop playsinline preload="none"></video></div>' +
          '<div class="nxv-pie">' + (d.chapa ? '<span class="nxv-chapa">' + d.chapa + "</span>" : "") + (d.url ? '<a href="' + d.url + '" target="_blank" rel="noopener">Ver en Instagram ↗</a>' : "") + "</div></div>";
      }).join("") +
      "</div>" +
      '<button type="button" class="nxv-boton nxv-flecha" data-nxv-ir="1" aria-label="Video siguiente" style="right:18px">' + FLECHA + "</button>" +
      "</div>" +
      '<div class="nxv-puntos">' + datos.map(function () { return '<span class="nxv-punto"></span>'; }).join("") + "</div>";
    document.body.appendChild(visor);

    var pista = visor.querySelector("[data-nxv-pista]");
    var grandes = Array.prototype.slice.call(visor.querySelectorAll("[data-nxv-video]"));
    var puntos = Array.prototype.slice.call(visor.querySelectorAll(".nxv-punto"));
    var cuenta = visor.querySelector("[data-nxv-cuenta]");
    var flechas = Array.prototype.slice.call(visor.querySelectorAll("[data-nxv-ir]"));
    var actual = -1, volverA = null, desbordeAntes = "";

    function activar(i) {
      if (i === actual || i < 0 || i >= datos.length) return;
      actual = i;
      grandes.forEach(function (g, k) {
        if (k === i) {
          if (!g.getAttribute("src")) g.setAttribute("src", datos[k].src);
          g.muted = false;
          var p = g.play();
          if (p && p.catch) p.catch(function () { g.muted = true; var q = g.play(); if (q && q.catch) q.catch(function () {}); });
        } else g.pause();
      });
      puntos.forEach(function (p, k) { if (k === i) p.setAttribute("data-activo", ""); else p.removeAttribute("data-activo"); });
      cuenta.textContent = (i + 1) + " / " + datos.length;
      flechas.forEach(function (f) { f.disabled = (+f.getAttribute("data-nxv-ir") < 0 && i === 0) || (+f.getAttribute("data-nxv-ir") > 0 && i === datos.length - 1); });
    }
    function irA(i, suave) {
      i = Math.max(0, Math.min(datos.length - 1, i));
      pista.scrollTo({ left: i * pista.clientWidth, behavior: suave && !reducido ? "smooth" : "auto" });
      if (!suave) { activar(i); return; }
      // Si el desplazamiento suave no llega (pestaña en segundo plano, navegador viejo), se salta directo.
      setTimeout(function () {
        if (visor.hidden || !pista.clientWidth) return;
        if (Math.round(pista.scrollLeft / pista.clientWidth) !== i) pista.scrollTo({ left: i * pista.clientWidth, behavior: "auto" });
        activar(i);
      }, 650);
    }
    function abrir(i, origen) {
      volverA = origen || null;
      conSonido = -1;
      aplicarSonido();
      videos.forEach(function (v) { v.pause(); });
      desbordeAntes = document.documentElement.style.overflow;
      document.documentElement.style.overflow = "hidden";
      visor.hidden = false;
      actual = -1;
      irA(i, false);
      visor.querySelector("[data-nxv-cerrar]").focus();
    }
    function cerrar() {
      if (visor.hidden) return;
      grandes.forEach(function (g) { g.pause(); });
      visor.hidden = true;
      document.documentElement.style.overflow = desbordeAntes;
      var h = window.innerHeight || document.documentElement.clientHeight;
      videos.forEach(function (v) {
        var r = v.getBoundingClientRect();
        if (!reducido && r.top < h && r.bottom > 0) reproducir(v);
      });
      if (volverA && volverA.focus) volverA.focus();
    }

    var espera = 0;
    pista.addEventListener("scroll", function () {
      if (espera) return;
      espera = requestAnimationFrame(function () {
        espera = 0;
        if (!visor.hidden && pista.clientWidth) activar(Math.round(pista.scrollLeft / pista.clientWidth));
      });
    }, { passive: true });
    window.addEventListener("resize", function () { if (!visor.hidden && actual >= 0) pista.scrollTo({ left: actual * pista.clientWidth, behavior: "auto" }); });
    flechas.forEach(function (f) { f.addEventListener("click", function () { irA(actual + (+f.getAttribute("data-nxv-ir")), true); }); });
    visor.querySelector("[data-nxv-cerrar]").addEventListener("click", cerrar);
    visor.addEventListener("click", function (e) {
      var c = e.target.className;
      if (typeof c === "string" && /nxv-(hoja|caja|pista)\b/.test(c)) cerrar();
    });
    document.addEventListener("keydown", function (e) {
      if (visor.hidden) return;
      if (e.key === "Escape") cerrar();
      else if (e.key === "ArrowRight") irA(actual + 1, true);
      else if (e.key === "ArrowLeft") irA(actual - 1, true);
    });

    videos.forEach(function (v, i) {
      v.style.cursor = "zoom-in";
      v.addEventListener("click", function () { abrir(i, null); });
      var b = document.createElement("button");
      b.type = "button";
      b.className = "nxv-agrandar";
      b.setAttribute("aria-label", "Ver video en grande");
      b.innerHTML = ICONO_AGRANDAR;
      b.addEventListener("click", function () { abrir(i, b); });
      v.parentNode.appendChild(b);
    });
  })();

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
