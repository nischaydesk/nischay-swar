/* ==========================================================================
   NISCHAY SWAR (निश्चय स्वर) — UNIVERSAL UI & 5-LANGUAGE RENDERER (ALL PAGES)
   File: js/ui-renderer.js
   ========================================================================== */

window.NSRenderer = (function () {
  "use strict";

  const DEFAULT_IMAGE = "assets/voice-fallback.svg";
  window.NS_DEFAULT_IMAGE = DEFAULT_IMAGE;

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  }

  function fallbackDataUri(name, category) {
    const icons = { legends: "🏛", scientists: "🔬", poets: "✒", rare: "📻", wildlife: "🐾", birds: "🪶", nature: "🌿", space: "🪐", instruments: "🎶" };
    const icon = icons[category] || "🎙";
    const safeName = escapeHtml(name || "Nischay Swar");
    const label = safeName.length > 38 ? `${safeName.slice(0, 35)}…` : safeName;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="#101a2d"/><stop offset="1" stop-color="#251b08"/></linearGradient></defs><rect width="800" height="520" rx="28" fill="url(#g)"/><circle cx="400" cy="190" r="116" fill="#f59e0b" fill-opacity=".12" stroke="#fbbf24" stroke-width="4"/><text x="400" y="235" text-anchor="middle" font-size="112">${icon}</text><path d="M70 356h660" stroke="#fbbf24" stroke-opacity=".55" stroke-width="3"/><text x="400" y="410" fill="#f8fafc" font-family="sans-serif" font-size="30" font-weight="700" text-anchor="middle">${label}</text><text x="400" y="460" fill="#fbbf24" font-family="sans-serif" font-size="18" font-weight="700" text-anchor="middle">NISCHAY SWAR • REAL AUDIO ARCHIVE</text></svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  function applyImageFallback(image, voice) {
    if (!image) return;
    const source = image.dataset.attemptedSource || image.currentSrc || image.src;
    if (image.dataset.fallbackFor === source) return;
    image.dataset.fallbackFor = source;
    const name = voice ? window.NSConfig.getLocalizedField(voice.name) : image.dataset.fallbackName;
    const category = voice ? voice.category : image.dataset.fallbackCategory;
    image.onerror = null;
    image.src = fallbackDataUri(name, category);
  }

  function setVoiceImage(image, voice) {
    if (!image || !voice) return;
    image.dataset.fallbackFor = "";
    image.dataset.attemptedSource = voice.photo || DEFAULT_IMAGE;
    image.dataset.fallbackName = window.NSConfig.getLocalizedField(voice.name);
    image.dataset.fallbackCategory = voice.category || "";
    image.onerror = () => applyImageFallback(image, voice);
    image.src = voice.photo || DEFAULT_IMAGE;
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

    if (img) setVoiceImage(img, featured);
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

    if (state.pageFilter === "space-rare") {
      list = list.filter((v) => v.category === "space" || v.category === "rare");
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
    if (badgeEl) badgeEl.textContent = `${voices.length} ${window.NSConfig.t("labelVoices")}`;

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
                src="${escapeHtml(voice.photo || DEFAULT_IMAGE)}"
                alt="${escapeHtml(getLocalizedField(voice.name))}"
                data-fallback-name="${escapeHtml(getLocalizedField(voice.name))}"
                data-fallback-category="${escapeHtml(voice.category)}"
                class="card-photo"
                loading="lazy"
                onerror="window.NSImageFallback(this)"
              />
              <div class="card-media-gradient"></div>
              <div class="card-top-badges">
                <span class="year-tag">📅 ${voice.year}</span>
                <span class="verified-chip">✅ ${escapeHtml(t("labelVerified"))}</span>
              </div>
              <span class="duration-overlay">🎧 ${voice.duration}</span>
              <button class="card-play-fab" aria-label="Play ${getLocalizedField(voice.name)}">
                ${isCardPlaying ? "⏸" : "▶"}
              </button>
            </div>

            <div class="card-body">
              <span class="card-cat-label">${escapeHtml(getCategoryLabel(voice.category))}</span>
              <h3 class="card-title" onclick="window.NSApp.openDetail('${voice.id}')">
                ${escapeHtml(getLocalizedField(voice.name))}
              </h3>
              <p class="card-desc">${escapeHtml(getLocalizedField(voice.bio))}</p>

              <div class="card-stats-footer">
                <div class="mini-stat-group">
                  <span title="${escapeHtml(t("lblListens"))}">👁️ ${plays}</span>
                  <button
                    class="mini-action-btn ${liked ? "liked" : ""}"
                    onclick="window.NSApp.toggleLike('${voice.id}')"
                    aria-label="${escapeHtml(t("labelLike"))}"
                  >
                    ${liked ? "❤️" : "🤍"} ${likes}
                  </button>
                </div>

                <div class="mini-stat-group">
                  <button
                    class="mini-action-btn"
                    onclick="window.NSApp.openDetail('${voice.id}')"
                    title="${escapeHtml(t("commentsHeading"))}"
                  >
                    💬 ${commentsCount}
                  </button>
                  <button
                    class="mini-action-btn"
                    onclick="window.NSApp.shareVoice('${voice.id}')"
                    title="${escapeHtml(t("btnShare"))}"
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

    const customEvents = (window.NISCHAY_CUSTOM_VOICES || []).map((voice) => ({
      year: String(voice.year),
      title: voice.name,
      desc: voice.bio,
      voiceId: voice.id
    }));
    const allEvents = [...events, ...customEvents].sort((a, b) => Number.parseInt(a.year, 10) - Number.parseInt(b.year, 10));

    container.innerHTML = allEvents
      .map(
        (item) => `
        <div class="timeline-item">
          <span class="timeline-year-badge">${escapeHtml(item.year)}</span>
          <h3>${escapeHtml(window.NSConfig.getLocalizedField(item.title))}</h3>
          <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 4px;">
            ${escapeHtml(window.NSConfig.getLocalizedField(item.desc))}
          </p>
          ${item.voiceId ? `<button type="button" class="timeline-play-btn" onclick="window.NSApp.playVoice('${item.voiceId}')" aria-label="${escapeHtml(window.NSConfig.t("btnPlayVoice"))}">▶</button>` : ""}
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
    setVoiceImage(imgEl, voice);

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

    document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
      const key = el.getAttribute("data-i18n-aria-label");
      if (langObj[key]) el.setAttribute("aria-label", langObj[key]);
    });
    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      const key = el.getAttribute("data-i18n-title");
      if (langObj[key]) el.setAttribute("title", langObj[key]);
    });
    const closePlayerBtn = document.getElementById("closePlayerBtn");
    if (closePlayerBtn) {
      closePlayerBtn.setAttribute("aria-label", langObj.playerClose);
      closePlayerBtn.title = langObj.playerClose;
    }
    const langButton = document.getElementById("langToggleBtn");
    const langMenu = document.getElementById("langMenu");
    if (langButton && langMenu) langButton.setAttribute("aria-expanded", String(langMenu.classList.contains("open")));

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
    setVoiceImage,
    openDetailModal,
    applyLanguage
  };
})();
