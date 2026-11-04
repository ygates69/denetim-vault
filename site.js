// Dil seçimi (TR/EN) ve satın alma bağlantıları.

// Satın alma düğmeleri doğrudan ödeme sayfasına gitmez: önce onay sayfası (onay.html) açılır.
// Ödeme bağlantısını, onay kaydedildikten sonra onay sunucusu üretir (sunucu/onay-kaydi).

(function () {
  var root = document.documentElement;

  function saved() {
    try { return localStorage.getItem("dv-lang"); } catch (e) { return null; }
  }
  function save(l) {
    try { localStorage.setItem("dv-lang", l); } catch (e) { /* gizli pencere vb. */ }
  }
  function apply(l) {
    root.setAttribute("data-lang", l);
    root.setAttribute("lang", l);
    var btn = document.querySelector(".lang-btn");
    if (btn) btn.textContent = l === "tr" ? "English" : "Türkçe";
    links(l);
  }

  // Satın alma düğmeleri sayfanın diliyle onay sayfasına gider (TR ya da EN ürün)
  function links(l) {
    document.querySelectorAll("[data-checkout]").forEach(function (a) {
      a.setAttribute("href", "onay.html?urun=" + encodeURIComponent(a.getAttribute("data-checkout")) + "&lang=" + l);
    });
  }

  var q = new URLSearchParams(location.search).get("lang");
  var initial = q === "en" || q === "tr" ? q : saved();
  if (!initial) initial = (navigator.language || "tr").toLowerCase().indexOf("tr") === 0 ? "tr" : "en";
  apply(initial);

  document.addEventListener("DOMContentLoaded", function () {
    apply(root.getAttribute("data-lang"));
    var btn = document.querySelector(".lang-btn");
    if (btn) btn.addEventListener("click", function () {
      var next = root.getAttribute("data-lang") === "tr" ? "en" : "tr";
      apply(next);
      save(next);
    });

    var y = document.querySelectorAll(".year");
    y.forEach(function (el) { el.textContent = new Date().getFullYear(); });
  });
})();
