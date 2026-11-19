// Ödeme öncesi onay adımı: iki kutu işaretlenmeden ödemeye geçilmez.
// Onay sunucuya gider; sunucu zamanı atar, kaydı tutar ve alıcıya özel ödeme bağlantısını döndürür.
import { SURUM, BELGELER, METINLER, metinOzeti } from "./onay-metinleri.js";

// Onay sunucusu (sunucu/onay-kaydi). Boşken satış kapalıdır: sayfa iletişim bölümüne yönlendirir.
const ONAY_SUNUCU = "https://denetim-vault-onay.onay-kaydi.workers.dev";

// Cloudflare Turnstile site anahtarı (herkese açık değerdir; gizli anahtar yalnız sunucudadır). Boşken satış kapalıdır.
// Kurucu Cloudflare panelinde oluşturur; alan adı: ygates69.github.io. Sunucu ana makine adını ve eylemi ("onay") denetler.
const TURNSTILE_ANAHTAR = "0x4AAAAAAGI2MNCo9v9TThry";
let dogrulamaBelirteci = null, dogrulamaKimligi = null;

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
        hata: "Ödeme sayfası açılamadı. Lütfen birkaç dakika sonra yeniden deneyin ya da bize e-postayla yazın.", yok: "Ürün bulunamadı.",
        dogrulama: "Güvenlik doğrulaması tamamlanamadı. Lütfen doğrulamayı yeniden yapıp tekrar deneyin.",
        cok: "Kısa sürede çok fazla deneme yapıldı. Lütfen bir dakika sonra yeniden deneyin.",
        yogun: "Online satış şu an yoğunluk nedeniyle geçici olarak kapalı. Lütfen daha sonra deneyin ya da bize e-postayla yazın." },
  en: { gec: "Continue to payment", bekle: "Preparing the checkout…", kapali: "Online sales are not open yet. Please contact us for orders and quotes.",
        hata: "The checkout could not be opened. Please try again in a few minutes or e-mail us.", yok: "Product not found.",
        dogrulama: "The security check could not be completed. Please complete it again and retry.",
        cok: "Too many attempts in a short time. Please try again in a minute.",
        yogun: "Online sales are temporarily paused due to high demand. Please try again later or e-mail us." }
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

function satisAcik() { return !!(ONAY_SUNUCU && TURNSTILE_ANAHTAR); }

function durum(u) {
  const ok = document.getElementById("onay-1").checked && document.getElementById("onay-2").checked;
  // Satış açıkken düğme ancak güvenlik doğrulaması da tamamlanınca açılır; kapalıyken tıklama "satış kapalı" mesajını gösterir
  document.getElementById("odeme").disabled = !(ok && u && (!satisAcik() || dogrulamaBelirteci));
}

function dogrulamaCiz() {
  if (!satisAcik() || dogrulamaKimligi !== null || !window.turnstile) return;
  const u = URUN[new URLSearchParams(location.search).get("urun")];
  dogrulamaKimligi = window.turnstile.render("#dogrulama", {
    sitekey: TURNSTILE_ANAHTAR, action: "onay", language: dil(), appearance: "interaction-only",
    callback: b => { dogrulamaBelirteci = b; durum(u); },
    "expired-callback": () => { dogrulamaBelirteci = null; durum(u); },
    "error-callback": () => { dogrulamaBelirteci = null; durum(u); }
  });
}

function dogrulamaYenile() {          // belirteç tek kullanımlıktır: her denemeden sonra yenilenir
  dogrulamaBelirteci = null;
  if (dogrulamaKimligi !== null && window.turnstile) window.turnstile.reset(dogrulamaKimligi);
}

async function ode() {
  const l = dil(), y = YAZI[l], d = document.getElementById("odeme"), m = document.getElementById("mesaj");
  const urun = new URLSearchParams(location.search).get("urun");
  if (!satisAcik()) { m.textContent = y.kapali; m.hidden = false; return; }
  if (!dogrulamaBelirteci) { m.textContent = y.dogrulama; m.hidden = false; return; }
  d.disabled = true; d.textContent = y.bekle; m.hidden = true;
  try {
    const r = await fetch(ONAY_SUNUCU + "/onay", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urun, dil: l, metin_surumu: SURUM, metin_ozeti: await metinOzeti(SURUM, l),
        kutu_1: document.getElementById("onay-1").checked, kutu_2: document.getElementById("onay-2").checked,
        dogrulama: dogrulamaBelirteci })
    });
    const j = await r.json();
    if (r.ok && j.url) { location.href = j.url; return; }
    m.textContent = j.hata === "satis_kapali" ? y.kapali : j.hata === "dogrulama" ? y.dogrulama
      : j.hata === "cok_istek" ? y.cok : j.hata === "yogunluk" ? y.yogun : y.hata;
  } catch (e) {
    m.textContent = y.hata;
  }
  dogrulamaYenile();
  m.hidden = false; d.textContent = y.gec; durum(URUN[urun]);
}

// Turnstile betiği yalnız satış açıkken yüklenir (satış kapalıyken Cloudflare'e hiç istek gitmez); yüklenince çizilir
window.dvDogrulamaHazir = () => dogrulamaCiz();
function dogrulamaYukle() {
  if (!satisAcik() || document.getElementById("turnstile-betik")) return;
  const b = document.createElement("script");
  b.id = "turnstile-betik"; b.async = true;
  b.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=dvDogrulamaHazir";
  document.head.appendChild(b);
}

document.addEventListener("DOMContentLoaded", () => {
  ciz();
  dogrulamaYukle();
  const u = URUN[new URLSearchParams(location.search).get("urun")];
  ["onay-1", "onay-2"].forEach(id => document.getElementById(id).addEventListener("change", () => durum(u)));
  document.getElementById("odeme").addEventListener("click", ode);
  document.querySelector(".lang-btn").addEventListener("click", () => setTimeout(ciz, 0));
});
