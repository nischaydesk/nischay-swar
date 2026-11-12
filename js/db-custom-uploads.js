/*
 * NISCHAY SWAR — आसान मास्टर डेटा एंट्री फ़ाइल
 * ---------------------------------------------------------------------------
 * नई आवाज़ जोड़ने के लिए केवल इसी फ़ाइल में नीचे दिए साँचे की एक कॉपी डालें।
 * फोटो लिंक, ऑडियो लिंक और विवरण अपने सत्यापित सार्वजनिक स्रोत से भरें; नकली,
 * अनुमानित या बिना अनुमति वाले लिंक न डालें। प्रकाशित रिकॉर्ड होम, श्रेणी,
 * सर्च, टाइमलाइन, क्विज़ और पसंदीदा सुविधाओं के साझा डेटाबेस में जुड़ेंगे।
 *
 * उपयोग:
 * 1. नीचे `NISCHAY_CUSTOM_VOICES` सूची में नया रिकॉर्ड पेस्ट करें।
 * 2. id अलग और स्थिर रखें; category नीचे दिए मानों में से चुनें।
 * 3. photo, audioUrl, source तथा year/duration भरें।
 * 4. name, role और bio में hi, en, bho, bn, ur पाठ भरें।
 * 5. फाइल सेव करके साइट deploy करें।
 *
 * category मान: legends, scientists, poets, rare, wildlife, birds, nature,
 * space, instruments.
 *
 * साँचा (कॉपी करें और असली जानकारी से भरें):
 * {
 *   id: "unique-record-id",
 *   featured: false,
 *   category: "wildlife",
 *   year: 2025,
 *   duration: "00:30",
 *   photo: "यहाँ सत्यापित सार्वजनिक फोटो लिंक पेस्ट करें",
 *   audioUrl: "यहाँ सत्यापित सार्वजनिक ऑडियो लिंक पेस्ट करें",
 *   source: "स्रोत अभिलेखागार का नाम",
 *   sourceUrl: "वैकल्पिक: मूल रिकॉर्ड/फ़ाइल का स्रोत पृष्ठ",
 *   license: "लाइसेंस और श्रेय",
 *   basePlays: 0,
 *   baseLikes: 0,
 *   name: { hi: "नाम", en: "Name", bho: "नाम", bn: "নাম", ur: "نام" },
 *   role: { hi: "भूमिका", en: "Role", bho: "भूमिका", bn: "পরিচয়", ur: "تعارف" },
 *   bio: { hi: "विवरण", en: "Description", bho: "ब्यौरा", bn: "বিবরণ", ur: "تفصیل" },
 *   initialComments: []
 * }
 *
 * ध्यान दें: साइट लिंक को अपने आप सही नहीं मानती। प्रकाशन से पहले अनुमति,
 * रिकॉर्डिंग की पहचान, स्रोत, लाइसेंस और लिंक की जाँच स्वयं करें।
 */
window.NISCHAY_CUSTOM_VOICES = window.NISCHAY_CUSTOM_VOICES || [
  // यहाँ ऊपर दिए साँचे में नई सत्यापित आवाज़ का रिकॉर्ड पेस्ट करें।
];

(function () {
  "use strict";
  const customVoices = window.NISCHAY_CUSTOM_VOICES || [];
  const validCategories = new Set(["legends", "scientists", "poets", "rare", "wildlife", "birds", "nature", "space", "instruments"]);
  const existing = new Set((window.NISCHAY_VOICES_DATA || []).map((voice) => voice.id));
  const isHttpsUrl = (value) => {
    try { return new URL(value).protocol === "https:"; } catch (_) { return false; }
  };
  const accepted = customVoices.filter((voice) =>
    voice && typeof voice.id === "string" && /^[a-z0-9][a-z0-9-]*$/i.test(voice.id) &&
    validCategories.has(voice.category) && Number.isFinite(Number(voice.year)) &&
    typeof voice.duration === "string" && typeof voice.photo === "string" &&
    isHttpsUrl(voice.photo) && isHttpsUrl(voice.audioUrl) && typeof voice.source === "string" &&
    voice.name && voice.role && voice.bio && !existing.has(voice.id)
  );
  window.NISCHAY_VOICES_DATA = window.NISCHAY_VOICES_DATA || [];
  window.NISCHAY_VOICES_DATA.push(...accepted);
})();
