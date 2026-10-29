// Dil seçimi (TR/EN) ve satın alma bağlantıları.

// Lemon Squeezy ödeme bağlantıları: ürünler oluşturulunca buraya yapıştırın.
// Boş bırakılan kademede düğme iletişim bölümüne gider.
var CHECKOUT = {
  bireysel: "",           // abonelik
  ekip: "",
  kurumsal: "",
  "suresiz-bireysel": "", // süresiz tam lisans
  "suresiz-ekip": "",
  "suresiz-kurumsal": "",
  "guncelleme-bireysel": "", // süresiz lisans için güncelleme paketi
  "guncelleme-ekip": "",
  "guncelleme-kurumsal": ""
};

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

    document.querySelectorAll("[data-checkout]").forEach(function (a) {
      var url = CHECKOUT[a.getAttribute("data-checkout")];
      if (url) a.setAttribute("href", url);
    });

    var y = document.querySelectorAll(".year");
    y.forEach(function (el) { el.textContent = new Date().getFullYear(); });
  });
})();
