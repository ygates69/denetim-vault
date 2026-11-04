// Ödeme öncesi onay metinleri (İade Politikası 10). Sitedeki onay sayfası ve sunucu aynı dosyayı kullanır.
// Metin değişirse SURUM artırılır; eski sürümler HUKUKI_UYUM_DOSYASI.md'de arşivlenir, buradan silinmez.

export const SURUM = "onay-v1";
export const BELGELER = "KK3.1·IADE2.1·GIZ2.0·OBF1.0·MSS1.0";

export const METINLER = {
  "onay-v1": {
    tr: [
      "Ön Bilgilendirme Formu'nu, Mesafeli Satış Sözleşmesi'ni, Kullanım Koşulları'nı ve İade Politikası'nı okudum ve kabul ediyorum.",
      "Dijital içeriğin ve lisans anahtarının hemen teslim edilmesini açıkça istiyorum. Teslim başladığında cayma hakkımı kaybedeceğimi biliyorum."
    ],
    en: [
      "I have read and accept the Pre-Contractual Information Form, the Distance Sales Contract, the Terms of Use and the Refund Policy.",
      "I expressly request immediate delivery of the digital content and license key. I know that I lose my right of withdrawal once delivery begins."
    ]
  }
};

// Onay metninin SHA-256 özeti (hex): iki kutu metni satır sonuyla birleştirilir
export async function metinOzeti(surum, dil) {
  const m = METINLER[surum] && METINLER[surum][dil];
  if (!m) return null;
  return sha256(m.join("\n"));
}

export async function sha256(metin) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(metin));
  return Array.from(new Uint8Array(b), x => x.toString(16).padStart(2, "0")).join("");
}
