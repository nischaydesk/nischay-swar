/* ==========================================================================
   NISCHAY SWAR (निश्चय स्वर) — UNIVERSAL UI & 5-LANGUAGE RENDERER (ALL PAGES)
   File: js/ui-renderer.js
   ========================================================================== */

window.NSRenderer = (function () {
  "use strict";

  const DEFAULT_IMAGE = "assets/voice-fallback.svg";
  window.NS_DEFAULT_IMAGE = DEFAULT_IMAGE;

  function applyImageFallback(image) {
    if (!image || image.dataset.fallbackApplied === "true") return;
    image.dataset.fallbackApplied = "true";
    image.src = DEFAULT_IMAGE;
  }

  window.NSImageFallback = applyImageFallback;

  function getVoices() {
    return window.NISCHAY_VOICES_DATA || [];
  }

  function updateGlobalStats() {
    const { state, formatNumber, getVoicePlays, getVoiceLikes } = window.NSConfig;
    const voices = getVoices();
    let totalPlays = 0;
    let totalLikes = 0;

    voices.forEach((v) => {
      totalPlays += getVoicePlays(v);
      totalLikes += getVoiceLikes(v);
    });

    const vEl = document.getElementById("totalVoicesCount");
    const pEl = document.getElementById("totalPlaysCount");
    const lEl = document.getElementById("totalLikesCount");
    const fEl = document.getElementById("favBadgeCount");

    if (vEl) vEl.textContent = voices.length;
    if (pEl) pEl.textContent = formatNumber(totalPlays);
    if (lEl) lEl.textContent = formatNumber(totalLikes);
    if (fEl) fEl.textContent = state.likedIds.length;
  }

  function updateSpotlightBanner() {
    const { getLocalizedField, getCategoryLabel } = window.NSConfig;
    const voices = getVoices();
    const featured = voices.find((v) => v.featured) || voices[0];
    if (!featured) return;

    const img = document.getElementById("spotlightImg");
    const yr = document.getElementById("spotlightYear");
    const name = document.getElementById("spotlightName");
    const quote = document.getElementById("spotlightQuote");
    const playBtn = document.getElementById("spotlightPlayBtn");
    const detailBtn = document.getElementById("spotlightDetailBtn");

    if (img) {
      img.src = featured.photo;
      img.onerror = () => applyImageFallback(img);
    }
    if (yr) yr.textContent = `${featured.year} • ${getCategoryLabel(featured.category)}`;
    if (name) name.textContent = getLocalizedField(featured.name);
    if (quote) quote.textContent = `"${getLocalizedField(featured.bio)}"`;

    if (playBtn) playBtn.onclick = () => window.NSAudio.playVoiceById(featured.id);
    if (detailBtn) detailBtn.onclick = () => openDetailModal(featured.id);
  }

  function getFilteredVoices() {
    const { state, isVoiceLiked, getVoicePlays, getVoiceLikes } = window.NSConfig;
    let list = [...getVoices()];

    if (state.navView === "favorites") {
      list = list.filter((v) => isVoiceLiked(v.id));
    }

    if (state.category !== "all") {
      list = list.filter((v) => v.category === state.category);
    }

    if (state.searchQuery.trim() !== "") {
      const q = state.searchQuery.toLowerCase().trim();
      list = list.filter((v) => {
        const allNames = Object.values(v.name).join(" ").toLowerCase();
        const allBios = Object.values(v.bio).join(" ").toLowerCase();
        const allRoles = Object.values(v.role).join(" ").toLowerCase();
        const yr = String(v.year);
        return allNames.includes(q) || allBios.includes(q) || allRoles.includes(q) || yr.includes(q);
      });
    }

    const sortMode = state.navView === "trending" ? "mostPlayed" : state.sortBy;
    list.sort((a, b) => {
      if (sortMode === "mostPlayed") return getVoicePlays(b) - getVoicePlays(a);
      if (sortMode === "mostLiked") return getVoiceLikes(b) - getVoiceLikes(a);
      if (sortMode === "oldest") return a.year - b.year;
      if (sortMode === "newest") return b.year - a.year;
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });

    return list;
  }

  function renderVoicesGrid() {
    const { state, t, getLocalizedField, getCategoryLabel, isVoiceLiked, formatNumber, getVoicePlays, getVoiceLikes } = window.NSConfig;
    const gridEl = document.getElementById("voicesGrid");
    const emptyEl = document.getElementById("emptyStateBox");
    const timelineEl = document.getElementById("timelineSection");
    const headingEl = document.getElementById("activeSectionHeading");
    const badgeEl = document.getElementById("visibleResultBadge");

    if (!gridEl) return;

    if (state.navView === "timeline") {
      gridEl.classList.add("hidden");
      if (emptyEl) emptyEl.classList.add("hidden");
      if (timelineEl) timelineEl.classList.remove("hidden");
      if (headingEl) headingEl.textContent = t("timelineTitle");
      if (badgeEl) badgeEl.textContent = "1860 — 2026";
      return;
    } else {
      if (timelineEl) timelineEl.classList.add("hidden");
      gridEl.classList.remove("hidden");
    }

    if (headingEl) {
      if (state.navView === "trending") {
        headingEl.textContent = t("headingTrending");
      } else if (state.navView === "favorites") {
        headingEl.textContent = t("headingFavorites");
      } else if (state.category !== "all") {
        headingEl.textContent = getCategoryLabel(state.category);
      } else {
        headingEl.textContent = t("headingAllVoices");
      }
    }

    const voices = getFilteredVoices();
    if (badgeEl) badgeEl.textContent = `${voices.length} Voices`;

    if (voices.length === 0) {
      gridEl.innerHTML = "";
      if (emptyEl) emptyEl.classList.remove("hidden");
      return;
    }

    if (emptyEl) emptyEl.classList.add("hidden");
    const allVoices = getVoices();
    const activeTrack = allVoices[state.currentTrackIndex];

    gridEl.innerHTML = voices
      .map((voice) => {
        const isCurrent = activeTrack && activeTrack.id === voice.id;
        const isCardPlaying = isCurrent && state.isPlaying;
        const liked = isVoiceLiked(voice.id);
        const plays = formatNumber(getVoicePlays(voice));
        const likes = formatNumber(getVoiceLikes(voice));
        const commentsCount = (voice.initialComments?.length || 0) + (state.userComments[voice.id]?.length || 0);

        return `
          <article class="voice-card ${isCurrent ? "is-playing" : ""}" data-voice-id="${voice.id}">
            <div class="card-media-box" onclick="window.NSApp.playVoice('${voice.id}')">
              <img
                src="${voice.photo}"
                alt="${getLocalizedField(voice.name)}"
                class="card-photo"
                loading="lazy"
                onerror="window.NSImageFallback(this)"
              />
              <div class="card-media-gradient"></div>
              <div class="card-top-badges">
                <span class="year-tag">📅 ${voice.year}</span>
                <span class="verified-chip">✅ Verified Real</span>
              </div>
              <span class="duration-overlay">🎧 ${voice.duration}</span>
              <button class="card-play-fab" aria-label="Play ${getLocalizedField(voice.name)}">
                ${isCardPlaying ? "⏸" : "▶"}
              </button>
            </div>

            <div class="card-body">
              <span class="card-cat-label">${getCategoryLabel(voice.category)}</span>
              <h3 class="card-title" onclick="window.NSApp.openDetail('${voice.id}')">
                ${getLocalizedField(voice.name)}
              </h3>
              <p class="card-desc">${getLocalizedField(voice.bio)}</p>

              <div class="card-stats-footer">
                <div class="mini-stat-group">
                  <span title="Real Listens">👁️ ${plays}</span>
                  <button
                    class="mini-action-btn ${liked ? "liked" : ""}"
                    onclick="window.NSApp.toggleLike('${voice.id}')"
                    aria-label="Like"
                  >
                    ${liked ? "❤️" : "🤍"} ${likes}
                  </button>
                </div>

                <div class="mini-stat-group">
                  <button
                    class="mini-action-btn"
                    onclick="window.NSApp.openDetail('${voice.id}')"
                    title="Comments & Story"
                  >
                    💬 ${commentsCount}
                  </button>
                  <button
                    class="mini-action-btn"
                    onclick="window.NSApp.shareVoice('${voice.id}')"
                    title="Share"
                  >
                    📲
                  </button>
                </div>
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renderTimeline() {
    const container = document.getElementById("timelineContainer");
    const events = window.NISCHAY_TIMELINE_EVENTS || [];
    if (!container) return;

    container.innerHTML = events
      .map(
        (item) => `
        <div class="timeline-item">
          <span class="timeline-year-badge">${item.year}</span>
          <h3>${window.NSConfig.getLocalizedField(item.title)}</h3>
          <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 4px;">
            ${window.NSConfig.getLocalizedField(item.desc)}
          </p>
        </div>
      `
      )
      .join("");
  }

  function openDetailModal(voiceId) {
    const { state, getLocalizedField, getCategoryLabel, formatNumber, getVoicePlays, getVoiceLikes, isVoiceLiked } = window.NSConfig;
    const voice = getVoices().find((v) => v.id === voiceId);
    const modal = document.getElementById("voiceDetailModal");
    if (!voice || !modal) return;

    state.activeModalVoiceId = voiceId;
    const imgEl = document.getElementById("modalSpeakerImg");
    imgEl.src = voice.photo;
    imgEl.onerror = () => applyImageFallback(imgEl);

    document.getElementById("modalCategoryChip").textContent = getCategoryLabel(voice.category);
    document.getElementById("modalYearChip").textContent = `📅 ${voice.year}`;
    document.getElementById("modalDurationChip").textContent = `⏱️ ${voice.duration}`;
    document.getElementById("modalSpeakerName").textContent = getLocalizedField(voice.name);
    document.getElementById("modalSpeakerRole").textContent = getLocalizedField(voice.role);
    document.getElementById("modalSpeakerBio").textContent = getLocalizedField(voice.bio);
    document.getElementById("modalSourceText").textContent = voice.source;

    document.getElementById("modalPlayCount").textContent = formatNumber(getVoicePlays(voice));
    document.getElementById("modalLikeCount").textContent = formatNumber(getVoiceLikes(voice));

    const likeBtn = document.getElementById("modalLikeBtn");
    likeBtn.classList.toggle("liked", isVoiceLiked(voiceId));

    document.getElementById("modalPlayBtn").onclick = () => window.NSAudio.playVoiceById(voiceId);
    likeBtn.onclick = () => window.NSEngagement.toggleVoiceLike(voiceId);
    document.getElementById("modalShareBtn").onclick = () => window.NSEngagement.shareVoice(voiceId);

    window.NSEngagement.renderCommentsList(voice);
    modal.classList.remove("hidden");
  }

  // UNIVERSAL TRANSLATOR FOR ALL PAGES (legends.html, wildlife.html, timeline.html, etc.)
  function translateSubPages(langCode) {
    const pageDict = {
      hi: {
        subNav: ["🏠 होम", "🇮🇳 महापुरुष", "🐅 जीव-जंतु", "🕰️ टाइमलाइन", "🎮 क्विज़", "🛡️ मिशन"],
        legendsTitle: "इतिहास के महापुरुष, वैज्ञानिक और अमर कवियों की असली आवाज़",
        wildlifeTitle: "जंगली जानवर, पक्षियों की चहचहाहट, प्रकृति और अंतरिक्ष की असली ध्वनियाँ",
        searchPh: "नाम, जीव-जंतु या साल खोजें..."
      },
      en: {
        subNav: ["🏠 Home", "🇮🇳 Legends", "🐅 Wildlife", "🕰️ Timeline", "🎮 Quiz", "🛡️ Mission"],
        legendsTitle: "Authentic Voices of Historical Legends, Scientists & Immortal Poets",
        wildlifeTitle: "Real Sounds of Wild Animals, Birds, Nature & Outer Space",
        searchPh: "Search legend, animal, or year..."
      },
      bho: {
        subNav: ["🏠 होम", "🇮🇳 महापुरुष", "🐅 जीव-जंतु", "🕰️ टाइमलाइन", "🎮 क्विज़", "🛡️ मिशन"],
        legendsTitle: "इतिहास के महापुरुष, वैज्ञानिक आ अमर कवि लोगन के असली आवाज़",
        wildlifeTitle: "जंगली जानवर, चिड़िया, प्रकृति आ अंतरिक्ष के असली आवाज़",
        searchPh: "नाम, जानवर भा साल खोजीं..."
      },
      bn: {
        subNav: ["🏠 হোম", "🇮🇳 মহাপুরুষ", "🐅 বন্যপ্রাণী", "🕰️ টাইমলাইন", "🎮 কুইজ", "🛡️ মিশন"],
        legendsTitle: "ইতিহাসের মহাপুরুষ, বিজ্ঞানী ও অমর কবিদের আসল কণ্ঠস্বর",
        wildlifeTitle: "বন্যপ্রাণী, পাখির ডাক, প্রকৃতি ও মহাকাশের আসল শব্দ",
        searchPh: "নাম, প্রাণী বা সাল খুঁজুন..."
      },
      ur: {
        subNav: ["🏠 ہوم", "🇮🇳 شخصیات", "🐅 جنگلی حیات", "🕰️ ٹائم لائن", "🎮 کوئز", "🛡️ مشن"],
        legendsTitle: "تاریخ کی عظیم شخصیات، سائنسدانوں اور شعراء کی اصل آوازیں",
        wildlifeTitle: "جنگلی جانوروں، پرندوں، فطرت اور خلا کی اصل آوازیں",
        searchPh: "نام، جانور یا سال تلاش کریں..."
      }
    };

    const d = pageDict[langCode] || pageDict.hi;
    const subLinks = document.querySelectorAll("#universalSubNav a");
    subLinks.forEach((a, i) => {
      if (d.subNav[i]) a.textContent = d.subNav[i];
    });

    const currentFile = window.location.pathname.split("/").pop() || "index.html";
    const h1 = document.querySelector(".hero-title");
    if (h1 && currentFile === "legends.html") h1.textContent = d.legendsTitle;
    if (h1 && currentFile === "wildlife.html") h1.textContent = d.wildlifeTitle;

    const searchInp = document.getElementById("voiceSearchInput");
    if (searchInp && currentFile !== "index.html") searchInp.placeholder = d.searchPh;
  }

  function applyLanguage(langCode) {
    const langs = window.NISCHAY_LANGUAGES || {};
    if (!langs[langCode]) langCode = "hi";

    window.NSConfig.state.lang = langCode;
    localStorage.setItem("ns_lang", langCode);

    const langObj = langs[langCode];
    document.documentElement.lang = langCode;
    document.documentElement.dir = langObj.dir || "ltr";
    document.body.classList.toggle("lang-ur", langCode === "ur");

    const labelEl = document.getElementById("currentLangLabel");
    if (labelEl) labelEl.textContent = langObj.label;

    document.querySelectorAll(".lang-option").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === langCode);
    });

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (langObj[key]) el.textContent = langObj[key];
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (langObj[key]) el.setAttribute("placeholder", langObj[key]);
    });

    if (window.NSPageI18n) window.NSPageI18n.apply(langCode);
    window.dispatchEvent(new CustomEvent("ns-language-changed", { detail: { lang: langCode } }));
    updateSpotlightBanner();
    renderVoicesGrid();
    renderTimeline();
    window.NSAudio.updatePlayerUI();

    if (window.NSConfig.state.activeModalVoiceId) {
      openDetailModal(window.NSConfig.state.activeModalVoiceId);
    }
  }

  return {
    updateGlobalStats,
    updateSpotlightBanner,
    renderVoicesGrid,
    renderTimeline,
    openDetailModal,
    applyLanguage
  };
})();
