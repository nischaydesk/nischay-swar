/* ==========================================================================
   NISCHAY SWAR (निश्चय स्वर) — MASTER CENTRAL CONTROLLER (ALL PAGES)
   File: js/app.js
   ========================================================================== */

(function () {
  "use strict";

  function setupUniversalHeaderAndTheme() {
    const header = document.querySelector(".top-header");
    if (!header) return;

    const headerRight = header.querySelector(".header-right");
    const themeBtn = document.getElementById("themeToggleBtn");
    const savedTheme = localStorage.getItem("ns_theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);

    if (themeBtn) {
      themeBtn.textContent = savedTheme === "light" ? "🌙" : "☀️";
      themeBtn.onclick = () => {
        const current = document.documentElement.getAttribute("data-theme");
        const next = current === "light" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("ns_theme", next);
        themeBtn.textContent = next === "light" ? "🌙" : "☀️";
        themeBtn.setAttribute("aria-label", next === "light" ? "Switch to dark theme" : "Switch to light theme");
      };
    }

    if (headerRight) headerRight.setAttribute("data-shell-ready", "true");
  }

  // Stop & Close Audio Player completely (Works on all pages!)
  function setupPlayerCloseButton() {
    const rightTools = document.querySelector(".player-right-tools");
    const stickyBar = document.getElementById("stickyAudioPlayer");
    const audioEl = document.getElementById("htmlAudioElement");
    if (!rightTools || !stickyBar) return;

    let closeBtn = document.getElementById("closePlayerBtn");
    if (!closeBtn) {
      closeBtn = document.createElement("button");
      closeBtn.id = "closePlayerBtn";
      closeBtn.className = "ctrl-btn player-close-btn";
      closeBtn.type = "button";
      closeBtn.innerHTML = "✕";
      rightTools.appendChild(closeBtn);
    }
    closeBtn.classList.add("player-close-btn");
    closeBtn.title = window.NSConfig.t("playerClose");
    closeBtn.setAttribute("aria-label", window.NSConfig.t("playerClose"));
    closeBtn.type = "button";

    closeBtn.onclick = () => {
      if (audioEl) {
        audioEl.pause();
        audioEl.currentTime = 0;
        audioEl.removeAttribute("src");
        audioEl.load();
      }
      window.NSConfig.state.isPlaying = false;
      window.NSConfig.state.playCountedForCurrentTrack = false;
      const progressFill = document.getElementById("playerProgressFill");
      const progressWrap = document.getElementById("progressBarContainer");
      const currentTime = document.getElementById("currentTimeText");
      const durationTime = document.getElementById("durationTimeText");
      if (progressFill) progressFill.style.width = "0%";
      if (progressWrap) progressWrap.setAttribute("aria-valuenow", "0");
      if (currentTime) currentTime.textContent = "0:00";
      if (durationTime) durationTime.textContent = "0:00";
      stickyBar.classList.add("hidden");
      if (window.NSRenderer) window.NSRenderer.renderVoicesGrid();
    };
  }

  function openDrawer() {
    const drawer = document.getElementById("sideDrawer");
    const overlay = document.getElementById("drawerOverlay");
    if (drawer) drawer.classList.add("open");
    if (drawer) { drawer.inert = false; drawer.setAttribute("aria-hidden", "false"); }
    if (overlay) { overlay.classList.add("open"); overlay.setAttribute("aria-hidden", "false"); }
    const openBtn = document.getElementById("openDrawerBtn");
    if (openBtn) openBtn.setAttribute("aria-expanded", "true");
    document.getElementById("closeDrawerBtn")?.focus();
  }

  function closeDrawer() {
    const drawer = document.getElementById("sideDrawer");
    const overlay = document.getElementById("drawerOverlay");
    if (drawer) drawer.classList.remove("open");
    if (drawer) { drawer.inert = true; drawer.setAttribute("aria-hidden", "true"); }
    if (overlay) { overlay.classList.remove("open"); overlay.setAttribute("aria-hidden", "true"); }
    const openBtn = document.getElementById("openDrawerBtn");
    if (openBtn) openBtn.setAttribute("aria-expanded", "false");
  }

  function setCategoryFilter(catKey, scrollToGrid) {
    const { state } = window.NSConfig;
    state.navView = "home";
    state.category = catKey;

    document.querySelectorAll(".cat-pill").forEach((p) => {
      p.classList.toggle("active", p.dataset.category === catKey);
    });

    window.NSRenderer.renderVoicesGrid();

    if (scrollToGrid) {
      const gridHeading = document.getElementById("activeSectionHeading");
      if (gridHeading) gridHeading.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function setNavView(viewName, scrollToTop) {
    const { state } = window.NSConfig;
    state.navView = viewName;
    state.category = "all";

    document.querySelectorAll(".drawer-link").forEach((b) => {
      b.classList.toggle("active", b.dataset.nav === viewName);
    });

    document.querySelectorAll(".cat-pill").forEach((p) => {
      p.classList.toggle("active", p.dataset.category === "all");
    });

    window.NSRenderer.renderVoicesGrid();

    if (scrollToTop) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function bindAllEvents() {
    const { state, showToast } = window.NSConfig;

    const openBtn = document.getElementById("openDrawerBtn");
    const closeBtn = document.getElementById("closeDrawerBtn");
    const overlay = document.getElementById("drawerOverlay");

    if (openBtn) openBtn.addEventListener("click", openDrawer);
    if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
    if (overlay) overlay.addEventListener("click", closeDrawer);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeDrawer();
        document.getElementById("langMenu")?.classList.remove("open");
        document.getElementById("langToggleBtn")?.setAttribute("aria-expanded", "false");
      }
    });

    document.querySelectorAll(".drawer-link[data-nav]").forEach((btn) => {
      btn.addEventListener("click", () => {
        setNavView(btn.dataset.nav, true);
        closeDrawer();
      });
    });

    document.querySelectorAll(".drawer-link[data-cat-jump]").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".drawer-link").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        setCategoryFilter(btn.dataset.catJump, true);
        closeDrawer();
      });
    });

    document.querySelectorAll("[data-footer-cat]").forEach((btn) => {
      btn.addEventListener("click", () => setCategoryFilter(btn.dataset.footerCat, true));
    });

    const footerTimelineBtn = document.getElementById("footerTimelineBtn");
    const footerVerifyBtn = document.getElementById("footerVerifyBtn");
    const footerSubmitBtn = document.getElementById("footerSubmitBtn");

    if (footerTimelineBtn) footerTimelineBtn.addEventListener("click", () => setNavView("timeline", true));
    if (footerVerifyBtn) footerVerifyBtn.addEventListener("click", () => {
      const m = document.getElementById("verifyPolicyModal");
      if (m) m.classList.remove("hidden");
    });
    if (footerSubmitBtn) footerSubmitBtn.addEventListener("click", () => {
      const m = document.getElementById("submitVoiceModal");
      if (m) m.classList.remove("hidden");
    });

    // 5-Language Switcher Dropdown
    const langBtn = document.getElementById("langToggleBtn");
    const langMenu = document.getElementById("langMenu");

    if (langBtn && langMenu) {
      langBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        langMenu.classList.toggle("open");
        langBtn.setAttribute("aria-expanded", String(langMenu.classList.contains("open")));
      });

      document.querySelectorAll(".lang-option").forEach((opt) => {
        opt.addEventListener("click", () => {
          window.NSRenderer.applyLanguage(opt.dataset.lang);
          langMenu.classList.remove("open");
          langBtn.setAttribute("aria-expanded", "false");
        });
      });

      document.addEventListener("click", () => {
        langMenu.classList.remove("open");
        langBtn.setAttribute("aria-expanded", "false");
      });
    }

    document.querySelectorAll(".cat-pill[data-category]").forEach((pill) => {
      pill.addEventListener("click", () => setCategoryFilter(pill.dataset.category, false));
    });

    const searchInput = document.getElementById("voiceSearchInput");
    const clearSearchBtn = document.getElementById("clearSearchBtn");
    const sortSelect = document.getElementById("sortSelect");
    const resetFiltersBtn = document.getElementById("resetAllFiltersBtn");

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        state.searchQuery = e.target.value;
        if (clearSearchBtn) clearSearchBtn.classList.toggle("hidden", state.searchQuery.length === 0);
        if (state.navView === "timeline") state.navView = "home";
        window.NSRenderer.renderVoicesGrid();
      });
    }

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener("click", () => {
        state.searchQuery = "";
        if (searchInput) searchInput.value = "";
        clearSearchBtn.classList.add("hidden");
        window.NSRenderer.renderVoicesGrid();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        state.sortBy = e.target.value;
        window.NSRenderer.renderVoicesGrid();
      });
    }

    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener("click", () => {
        state.searchQuery = "";
        if (searchInput) searchInput.value = "";
        if (clearSearchBtn) clearSearchBtn.classList.add("hidden");
        setCategoryFilter("all", false);
      });
    }

    const detailModal = document.getElementById("voiceDetailModal");
    const closeDetailBtn = document.getElementById("closeDetailModalBtn");
    const submitModal = document.getElementById("submitVoiceModal");
    const openSubmitMenuBtn = document.getElementById("openSubmitFromMenu");
    const closeSubmitBtn = document.getElementById("closeSubmitModalBtn");
    const verifyModal = document.getElementById("verifyPolicyModal");
    const openVerifyBtn = document.getElementById("openVerifyInfoBtn");
    const closeVerifyBtn = document.getElementById("closeVerifyModalBtn");

    if (closeDetailBtn && detailModal) {
      closeDetailBtn.addEventListener("click", () => {
        detailModal.classList.add("hidden");
        state.activeModalVoiceId = null;
      });
    }

    if (openSubmitMenuBtn && submitModal) {
      openSubmitMenuBtn.addEventListener("click", () => {
        closeDrawer();
        submitModal.classList.remove("hidden");
      });
    }

    if (closeSubmitBtn && submitModal) {
      closeSubmitBtn.addEventListener("click", () => submitModal.classList.add("hidden"));
    }

    if (openVerifyBtn && verifyModal) {
      openVerifyBtn.addEventListener("click", () => {
        closeDrawer();
        verifyModal.classList.remove("hidden");
      });
    }

    if (closeVerifyBtn && verifyModal) {
      closeVerifyBtn.addEventListener("click", () => verifyModal.classList.add("hidden"));
    }

    [detailModal, submitModal, verifyModal].forEach((m) => {
      if (!m) return;
      m.addEventListener("click", (e) => {
        if (e.target === m) {
          m.classList.add("hidden");
          if (m === detailModal) state.activeModalVoiceId = null;
        }
      });
    });

    const commentForm = document.getElementById("commentForm");
    const curatedForm = document.getElementById("curatedSubmitForm");

    if (commentForm) {
      commentForm.addEventListener("submit", window.NSEngagement.handleCommentSubmit);
    }

    if (curatedForm) {
      curatedForm.addEventListener("submit", (e) => {
        e.preventDefault();
        curatedForm.reset();
        if (submitModal) submitModal.classList.add("hidden");
        showToast(window.NSConfig.t("toastSubmit"));
      });
    }

    const mainPlayBtn = document.getElementById("mainPlayPauseBtn");
    const nextBtn = document.getElementById("nextTrackBtn");
    const prevBtn = document.getElementById("prevTrackBtn");
    const speedBtn = document.getElementById("playerSpeedBtn");
    const quickLikeBtn = document.getElementById("playerQuickLikeBtn");
    const playerInfoTrigger = document.getElementById("playerOpenDetailTrigger");

    if (mainPlayBtn) {
      mainPlayBtn.addEventListener("click", () => {
        const voices = window.NISCHAY_VOICES_DATA || [];
        const current = voices[state.currentTrackIndex];
        if (current) window.NSAudio.playVoiceById(current.id);
      });
    }

    if (nextBtn) nextBtn.addEventListener("click", window.NSAudio.playNext);
    if (prevBtn) prevBtn.addEventListener("click", window.NSAudio.playPrev);
    if (speedBtn) speedBtn.addEventListener("click", window.NSAudio.cycleSpeed);

    if (quickLikeBtn) {
      quickLikeBtn.addEventListener("click", () => {
        const voices = window.NISCHAY_VOICES_DATA || [];
        const current = voices[state.currentTrackIndex];
        if (current) window.NSEngagement.toggleVoiceLike(current.id);
      });
    }

    if (playerInfoTrigger) {
      playerInfoTrigger.addEventListener("click", () => {
        const voices = window.NISCHAY_VOICES_DATA || [];
        const current = voices[state.currentTrackIndex];
        if (current) window.NSRenderer.openDetailModal(current.id);
      });
      playerInfoTrigger.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        playerInfoTrigger.click();
      });
    }
  }

  window.NSApp = {
    playVoice: (id) => window.NSAudio.playVoiceById(id),
    toggleLike: (id) => window.NSEngagement.toggleVoiceLike(id),
    openDetail: (id) => window.NSRenderer.openDetailModal(id),
    shareVoice: (id) => window.NSEngagement.shareVoice(id)
  };

  document.addEventListener("DOMContentLoaded", () => {
    setupUniversalHeaderAndTheme();
    setupPlayerCloseButton();
    window.NSAudio.initAudioListeners();
    bindAllEvents();
    window.NSRenderer.updateGlobalStats();
    window.NSRenderer.applyLanguage(window.NSConfig.state.lang);
  });
})();
