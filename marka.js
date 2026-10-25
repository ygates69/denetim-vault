/*
 * YGATES marka bandı — tüm YGATES ürünlerinde ortak logo ve telif bilgisi.
 * Kullanım: <script src="marka.js" defer></script>
 * İsteğe bağlı: <body data-yga-urun="Stok Kokpit"> ürün adını banda ekler.
 * Sayfada [data-yga-telif] öğesi varsa telif metni oraya yazılır; yoksa sayfa sonuna bant eklenir.
 * © YGATES Stratejik Yönetim ve Danışmanlık. Tüm hakları saklıdır.
 */
(function () {
  "use strict";
  var FIRMA = "YGATES Stratejik Yönetim ve Danışmanlık";
  var LOGO =
    '<svg viewBox="100 90 820 820" fill="none" stroke="currentColor" stroke-width="61" ' +
    'stroke-linejoin="miter" aria-hidden="true"><path d="M406 395 L509 498 L589 417 L424 251 ' +
    'L512 163 L600 251 L512 339"/><path d="M362 311 L256 415 L510 670 L743 437"/>' +
    '<path d="M157 474 L512 827 L846 495 L662 311"/></svg>';

  function telifMetni(urun) {
    var yil = new Date().getFullYear();
    return (urun ? urun + " · " : "") + "© " + yil + " " + FIRMA + ". Tüm hakları saklıdır.";
  }

  function uygula() {
    if (document.querySelector(".yga-telif-bandi")) return;
    var urun = document.body.getAttribute("data-yga-urun") || "";
    var hedefler = document.querySelectorAll("[data-yga-telif]");
    if (hedefler.length) {
      hedefler.forEach(function (h) { h.textContent = telifMetni(urun); });
      return;
    }
    var bant = document.createElement("div");
    bant.className = "yga-telif-bandi";
    bant.setAttribute("role", "contentinfo");
    bant.innerHTML = '<span class="yga-telif-logo">' + LOGO + "</span><span></span>";
    bant.lastChild.textContent = telifMetni(urun);
    var stil = document.createElement("style");
    stil.textContent =
      ".yga-telif-bandi{display:flex;align-items:center;justify-content:center;gap:.5rem;" +
      "padding:.6rem 1rem;font:12px/1.4 -apple-system,'Segoe UI',Roboto,sans-serif;color:#5B6472;" +
      "border-top:1px solid rgba(0,0,0,.08);text-align:center}" +
      ".yga-telif-logo{width:16px;height:16px;color:#0E1A2B;flex:none}" +
      ".yga-telif-logo svg{width:100%;height:100%}" +
      "@media (prefers-color-scheme:dark){.yga-telif-bandi{color:#9aa3b2;border-color:rgba(255,255,255,.1)}" +
      ".yga-telif-logo{color:#C9A86E}}";
    document.head.appendChild(stil);
    document.body.appendChild(bant);
  }

  window.YGA = { FIRMA: FIRMA, LOGO: LOGO, telifMetni: telifMetni };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", uygula);
  else uygula();
})();
