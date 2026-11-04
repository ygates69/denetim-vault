// Ödeme öncesi onay adımı: iki kutu işaretlenmeden ödemeye geçilmez.
// Onay sunucuya gider; sunucu zamanı atar, kaydı tutar ve alıcıya özel ödeme bağlantısını döndürür.
import { SURUM, BELGELER, METINLER, metinOzeti } from "./onay-metinleri.js";

// Onay sunucusu (sunucu/onay-kaydi). Boşken satış kapalıdır: sayfa iletişim bölümüne yönlendirir.
const ONAY_SUNUCU = "";

const URUN = {
  "bireysel": { tr: "Bireysel lisans", en: "Individual licence", fiyat: 300 },
  "ekip": { tr: "Ekip lisansı", en: "Team licence", fiyat: 900 },
  "kurumsal": { tr: "Kurumsal lisans", en: "Enterprise licence", fiyat: 2500 },
  "guncelleme-bireysel": { tr: "Güncelleme Paketi · Bireysel", en: "Update Pack · Individual", fiyat: 59 },
  "guncelleme-ekip": { tr: "Güncelleme Paketi · Ekip", en: "Update Pack · Team", fiyat: 179 },
  "guncelleme-kurumsal": { tr: "Güncelleme Paketi · Kurumsal", en: "Update Pack · Enterprise", fiyat: 499 },
  "egitim": { tr: "Ekip eğitimi (2 × 3 saat)", en: "Team training (2 × 3 hours)", fiyat: 1500 }
};

const YAZI = {
  tr: { gec: "Ödemeye geç", bekle: "Ödeme sayfası hazırlanıyor…", kapali: "Online satış henüz açılmadı. Sipariş ve teklif için iletişim bölümünden bize yazın.",
        hata: "Ödeme sayfası açılamadı. Lütfen birkaç dakika sonra yeniden deneyin ya da bize e-postayla yazın.", yok: "Ürün bulunamadı." },
  en: { gec: "Continue to payment", bekle: "Preparing the checkout…", kapali: "Online sales are not open yet. Please contact us for orders and quotes.",
        hata: "The checkout could not be opened. Please try again in a few minutes or e-mail us.", yok: "Product not found." }
};

function dil() { return document.documentElement.getAttribute("data-lang") === "en" ? "en" : "tr"; }

function ciz() {
  const l = dil(), y = YAZI[l];
  const k = new URLSearchParams(location.search).get("urun");
  const u = URUN[k];
  document.getElementById("urun-adi").textContent = u ? u[l] : y.yok;
  document.getElementById("urun-fiyat").textContent = u ? "$" + u.fiyat.toLocaleString(l === "en" ? "en-US" : "tr-TR") : "";
  document.getElementById("onay-1-metin").textContent = METINLER[SURUM][l][0];
  document.getElementById("onay-2-metin").textContent = METINLER[SURUM][l][1];
  document.getElementById("belge-surumleri").textContent = SURUM + " · " + BELGELER;
  const d = document.getElementById("odeme");
  d.textContent = y.gec;
  durum(u);
}

function durum(u) {
  const ok = document.getElementById("onay-1").checked && document.getElementById("onay-2").checked;
  document.getElementById("odeme").disabled = !(ok && u);
}

async function ode() {
  const l = dil(), y = YAZI[l], d = document.getElementById("odeme"), m = document.getElementById("mesaj");
  const urun = new URLSearchParams(location.search).get("urun");
  if (!ONAY_SUNUCU) { m.textContent = y.kapali; m.hidden = false; return; }
  d.disabled = true; d.textContent = y.bekle; m.hidden = true;
  try {
    const r = await fetch(ONAY_SUNUCU + "/onay", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urun, dil: l, metin_surumu: SURUM, metin_ozeti: await metinOzeti(SURUM, l),
        kutu_1: document.getElementById("onay-1").checked, kutu_2: document.getElementById("onay-2").checked })
    });
    const j = await r.json();
    if (r.ok && j.url) { location.href = j.url; return; }
    m.textContent = j.hata === "satis_kapali" ? y.kapali : y.hata;
  } catch (e) {
    m.textContent = y.hata;
  }
  m.hidden = false; d.textContent = y.gec; durum(URUN[urun]);
}

document.addEventListener("DOMContentLoaded", () => {
  ciz();
  const u = URUN[new URLSearchParams(location.search).get("urun")];
  ["onay-1", "onay-2"].forEach(id => document.getElementById(id).addEventListener("change", () => durum(u)));
  document.getElementById("odeme").addEventListener("click", ode);
  document.querySelector(".lang-btn").addEventListener("click", () => setTimeout(ciz, 0));
});
