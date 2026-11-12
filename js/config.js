/* ==========================================================================
   NISCHAY SWAR (निश्चय स्वर) — GLOBAL CONFIG, STATE & HELPER UTILITIES
   File: js/config.js
   ========================================================================== */

window.NSConfig = (function () {
  "use strict";

  // OPTIONAL: Paste your Google Apps Script Web App URL here later for global cloud stats
  const GOOGLE_SHEET_API_URL = "";

  // Bad-Word / Abuse Filter Dictionary for Safe Comments
  const BLOCKED_WORDS = [
    "gali", "bc", "mc", "bhenchod", "madarchod", "chutiya", "harami", "kamina",
    "sala", "saala", "randi", "fuck", "shit", "bitch", "asshole", "bastard",
    "sex", "porn", "xxx", "nude", "idiot", "stupid", "bakwas", "ganda"
  ];

  function readStorage(key, fallback, validate) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "null");
      return validate(value) ? value : fallback;
    } catch (_) {
      return fallback;
    }
  }

  // Shared Application State
  const state = {
    lang: localStorage.getItem("ns_lang") || "hi",
    category: "all",
    navView: "home", // home | trending | timeline | favorites
    pageFilter: null,
    searchQuery: "",
    sortBy: "featured",
    currentTrackIndex: 0,
    isPlaying: false,
    playbackSpeed: 1,
    playCountedForCurrentTrack: false,
    activeModalVoiceId: null,
    likedIds: readStorage("ns_liked_ids", [], Array.isArray),
    extraPlays: readStorage("ns_extra_plays", {}, (value) => value && typeof value === "object" && !Array.isArray(value)),
    extraLikes: readStorage("ns_extra_likes", {}, (value) => value && typeof value === "object" && !Array.isArray(value)),
    userComments: readStorage("ns_user_comments", {}, (value) => value && typeof value === "object" && !Array.isArray(value))
  };

  function t(key) {
    const langs = window.NISCHAY_LANGUAGES || {};
    const dict = langs[state.lang] || langs.hi || {};
    return dict[key] || (langs.hi && langs.hi[key]) || key;
  }

  function getLocalizedField(objField) {
    if (!objField) return "";
    if (typeof objField === "string") return objField;
    return objField[state.lang] || objField.hi || objField.en || "";
  }

  function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return String(num);
  }

  function formatSeconds(sec) {
    if (!isFinite(sec) || sec < 0) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  }

  function getVoicePlays(voice) {
    return (voice.basePlays || 0) + (state.extraPlays[voice.id] || 0);
  }

  function getVoiceLikes(voice) {
    return (voice.baseLikes || 0) + (state.extraLikes[voice.id] || 0);
  }

  function isVoiceLiked(voiceId) {
    return state.likedIds.includes(voiceId);
  }

  function getCategoryLabel(catKey) {
    const map = {
      legends: t("catLegends"),
      scientists: t("catScientists"),
      poets: t("catPoets"),
      wildlife: t("catWildlife"),
      birds: t("catBirds"),
      nature: t("catNature"),
      space: t("catSpace"),
      instruments: t("catInstruments"),
      rare: t("catRare")
    };
    return map[catKey] || t("catAll");
  }

  function saveStorage() {
    localStorage.setItem("ns_liked_ids", JSON.stringify(state.likedIds));
    localStorage.setItem("ns_extra_plays", JSON.stringify(state.extraPlays));
    localStorage.setItem("ns_extra_likes", JSON.stringify(state.extraLikes));
    localStorage.setItem("ns_user_comments", JSON.stringify(state.userComments));
  }

  let toastTimer = null;
  function showToast(message) {
    const toastEl = document.getElementById("toastBanner");
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove("show");
    }, 2800);
  }

  return {
    GOOGLE_SHEET_API_URL,
    BLOCKED_WORDS,
    state,
    t,
    getLocalizedField,
    formatNumber,
    formatSeconds,
    getVoicePlays,
    getVoiceLikes,
    isVoiceLiked,
    getCategoryLabel,
    saveStorage,
    showToast
  };
})();
