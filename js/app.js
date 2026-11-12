/* ==========================================================================
   NISCHAY SWAR (निश्चय स्वर) — MASTER CENTRAL CONTROLLER (ALL PAGES)
   File: js/app.js
   ========================================================================== */

(function () {
  "use strict";

  // 1. AUTO-INJECT CLEAN MULTI-PAGE BAR & THEME TOGGLE ON EVERY PAGE
  function setupUniversalHeaderAndTheme() {
    const header = document.querySelector(".top-header");
    if (!header) return;

    // Fix inline display:flex overlap on mobile
    const oldQuickNav = header.querySelector(".desktop-quick-nav");
    if (oldQuickNav) {
      oldQuickNav.removeAttribute("style");
    }

    // Add Dark/Light Theme Button automatically if missing
    let headerRight = header.querySelector(".header-right");
    if (!headerRight) {
      headerRight = document.createElement("div");
      headerRight.className = "header-right";
      header.appendChild(headerRight);
    }

    const savedTheme = localStorage.getItem("ns_theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);

    if (!document.getElementById("themeToggleBtn")) {
      const themeBtn = document.createElement("button");
      themeBtn.id = "themeToggleBtn";
      themeBtn.className = "theme-toggle-btn";
      themeBtn.setAttribute("aria-label", "Toggle Dark/Light Mode");
      themeBtn.textContent = savedTheme === "light" ? "🌙" : "☀️";
      themeBtn.addEventListener("click", () => {
        const cur = document.documentElement.getAttribute("data-theme");
        const next = cur === "light" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("ns_theme", next);
        themeBtn.textContent = next === "light" ? "🌙" : "☀️";
      });
      headerRight.prepend(themeBtn);
    }

    // Inject Clean Scrollable Multi-Page Strip right below Header (Zero Overlap!)
    if (!document.getElementById("universalSubNav")) {
      const currentFile = window.location.pathname.split("/").pop() || "index.html";
      const pages = [
        { href: "index.html", label: "🏠 होम" },
        { href: "legends.html", label: "🇮🇳 महापुरुष" },
        { href: "wildlife.html", label: "🐅 जीव-जंतु" },
        { href: "timeline.html", label: "🕰️ टाइमलाइन" },
        { href: "quiz.html", label: "🎮 क्विज़" },
        { href: "about.html", label: "🛡️ मिशन" }
      ];

      const subNav = document.createElement("nav");
      subNav.id = "universalSubNav";
      subNav.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        overflow-x: auto;
        padding: 8px 14px;
        background: var(--bg-surface);
        border-bottom: 1px solid var(--border-subtle);
        scrollbar-width: none;
        -ms-overflow-style: none;
      `;

      subNav.innerHTML = pages
        .map((p) => {
          const isActive = currentFile === p.href;
          return `
            <a href="${p.href}" style="
              text-decoration: none;
              white-space: nowrap;
              padding: 6px 13px;
              border-radius: 999px;
              font-size: 0.8rem;
              font-weight: 700;
              border: 1px solid ${isActive ? "var(--gold-primary)" : "var(--border-subtle)"};
              background: ${isActive ? "rgba(245, 158, 11, 0.16)" : "var(--bg-card)"};
              color: ${isActive ? "var(--gold-bright)" : "var(--text-primary)"};
            ">${p.label}</a>
          `;
        })
        .join("");

      header.insertAdjacentElement("afterend", subNav);
    }
  }

  function openDrawer() {
    const drawer = document.getElementById("sideDrawer");
    const overlay = document.getElementById("drawerOverlay");
    if (drawer) drawer.classList.add("open");
    if (overlay) overlay.classList.add("open");
  }

  function closeDrawer() {
    const drawer = document.getElementById("sideDrawer");
    const overlay = document.getElementById("drawerOverlay");
    if (drawer) drawer.classList.remove("open");
    if (overlay) overlay.classList.remove("open");
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

    // 3-Line Side Drawer Menu
    const openBtn = document.getElementById("openDrawerBtn");
    const closeBtn = document.getElementById("closeDrawerBtn");
    const overlay = document.getElementById("drawerOverlay");

    if (openBtn) openBtn.addEventListener("click", openDrawer);
    if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
    if (overlay) overlay.addEventListener("click", closeDrawer);

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

    // Pro Footer Category & Action Buttons
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
      });

      document.querySelectorAll(".lang-option").forEach((opt) => {
        opt.addEventListener("click", () => {
          window.NSRenderer.applyLanguage(opt.dataset.lang);
          langMenu.classList.remove("open");
        });
      });

      document.addEventListener("click", () => {
        langMenu.classList.remove("open");
      });
    }

    // Category Pills
    document.querySelectorAll(".cat-pill[data-category]").forEach((pill) => {
      pill.addEventListener("click", () => setCategoryFilter(pill.dataset.category, false));
    });

    // Search & Sort Controls
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

    // Modals
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

    // Forms
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
        showToast("✅ धन्यवाद! आपका अनुरोध एडमिन सत्यापन के लिए भेज दिया गया है।");
      });
    }

    // Sticky Bottom Audio Player Controls
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
    window.NSAudio.initAudioListeners();
    bindAllEvents();
    window.NSRenderer.updateGlobalStats();
    window.NSRenderer.applyLanguage(window.NSConfig.state.lang);
  });
})();
