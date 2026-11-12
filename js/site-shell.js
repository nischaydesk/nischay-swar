/* NISCHAY SWAR — shared, accessible shell for every page */
(function () {
  "use strict";

  const pages = [
    { href: "index.html", icon: "🏠", key: "qAll", navKey: "navPageHome", fallback: "होम" },
    { href: "legends.html", icon: "🇮🇳", key: "qLegends", navKey: "navPageLegends", fallback: "महापुरुष" },
    { href: "wildlife.html", icon: "🐅", key: "qWildlife", navKey: "navPageWildlife", fallback: "जीव-जंतु" },
    { href: "timeline.html", icon: "🕰️", key: "qTimeline", navKey: "navTimeline", fallback: "टाइमलाइन" },
    { href: "quiz.html", icon: "🎮", key: "qQuiz", navKey: "navPageQuiz", fallback: "क्विज़" },
    { href: "space-rare.html", icon: "🪐", key: "qSpaceRare", navKey: "navPageSpaceRare", fallback: "अंतरिक्ष व दुर्लभ" },
    { href: "favorites.html", icon: "❤️", key: "qFavorites", navKey: "navPageFavorites", fallback: "पसंदीदा" },
    { href: "about.html", icon: "🛡️", key: "qAbout", navKey: "navPageAbout", fallback: "मिशन" }
  ];

  const currentFile = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  const currentPage = pages.find((item) => item.href === currentFile) || null;

  function i18n(key) {
    return `data-i18n="${key}"`;
  }

  function renderShell() {
    if (document.querySelector(".top-header")) return;

    const links = pages.map((item) => {
      const active = item.href === currentFile;
      return `<a href="${item.href}" class="drawer-link${active ? " active" : ""}"${active ? ' aria-current="page"' : ""}>
        <span class="nav-ico" aria-hidden="true">${item.icon}</span><span ${i18n(item.navKey)}>${item.fallback}</span>
      </a>`;
    }).join("");

    const quickLinks = pages.map((item) => {
      const active = item.href === currentFile;
      return `<a href="${item.href}" class="q-nav-btn${active ? " active" : ""}"${active ? ' aria-current="page"' : ""}>
        ${item.icon} <span ${i18n(item.key)}>${item.fallback}</span>
      </a>`;
    }).join("");

    const shell = document.createElement("div");
    shell.id = "nsSharedShell";
    shell.innerHTML = `
      <div id="drawerOverlay" class="drawer-overlay" aria-hidden="true"></div>
      <aside id="sideDrawer" class="side-drawer" aria-label="Main navigation" aria-hidden="true" inert>
        <div class="drawer-header">
          <div class="brand-lockup">
            <div class="brand-badge" aria-hidden="true">NS</div>
            <div><h2 class="brand-title">NISCHAY SWAR</h2><span class="brand-sub" ${i18n("brandTag")}>निश्चय स्वर • 100% असली आवाज़</span></div>
          </div>
          <button id="closeDrawerBtn" class="icon-btn" type="button" aria-label="Close menu" data-i18n-aria-label="closeMenu">✕</button>
        </div>
        <div class="drawer-scroll">
          <nav class="drawer-nav" aria-label="Pages">
            <p class="drawer-section-label" ${i18n("menuExplore")}>मुख्य नेविगेशन</p>
            ${links}
            <p class="drawer-section-label" ${i18n("menuHumanAlbums")}>मानव इतिहास एल्बम</p>
            <a class="drawer-link" href="legends.html"><span class="nav-ico" aria-hidden="true">🏛️</span><span ${i18n("catLegends")}>महापुरुष</span></a>
            <a class="drawer-link" href="legends.html"><span class="nav-ico" aria-hidden="true">🚀</span><span ${i18n("catScientists")}>वैज्ञानिक</span></a>
            <a class="drawer-link" href="legends.html"><span class="nav-ico" aria-hidden="true">✒️</span><span ${i18n("catPoets")}>कवि व शायर</span></a>
            <a class="drawer-link" href="space-rare.html"><span class="nav-ico" aria-hidden="true">📻</span><span ${i18n("catRare")}>दुर्लभ इतिहास</span></a>
            <p class="drawer-section-label" ${i18n("menuNatureAlbums")}>जीव-जंतु और प्रकृति</p>
            <a class="drawer-link" href="wildlife.html"><span class="nav-ico" aria-hidden="true">🦁</span><span ${i18n("catWildlife")}>जंगली जानवर</span></a>
            <a class="drawer-link" href="wildlife.html"><span class="nav-ico" aria-hidden="true">🦚</span><span ${i18n("catBirds")}>पक्षी</span></a>
            <a class="drawer-link" href="space-rare.html"><span class="nav-ico" aria-hidden="true">🪐</span><span ${i18n("catSpace")}>अंतरिक्ष</span></a>
            <a class="drawer-link" href="wildlife.html"><span class="nav-ico" aria-hidden="true">🎶</span><span ${i18n("catInstruments")}>वाद्ययंत्र</span></a>
            <p class="drawer-section-label" ${i18n("menuPlatform")}>प्लेटफॉर्म और सत्यापन</p>
            <button id="openSubmitFromMenu" class="drawer-link highlight-link" type="button"><span class="nav-ico" aria-hidden="true">📩</span><span ${i18n("navSubmit")}>असली आवाज़ भेजें</span></button>
            <button id="openVerifyInfoBtn" class="drawer-link" type="button"><span class="nav-ico" aria-hidden="true">✅</span><span ${i18n("navVerify")}>100% Real Verification</span></button>
          </nav>
          <div class="drawer-footer-card">
            <div class="zero-ai-pill">✅ ZERO AI • 100% AUTHENTIC</div>
            <p ${i18n("drawerNote")}>हर ऑडियो को प्रमाणित ऐतिहासिक और प्राकृतिक स्रोतों से जाँचने के बाद ही प्रकाशित किया जाता है।</p>
            <div class="drawer-credit">A Nischay Ecosystem Project • Prince Kumar</div>
          </div>
        </div>
      </aside>

      <header class="top-header">
        <div class="header-left">
          <button id="openDrawerBtn" class="hamburger-btn" type="button" aria-label="Open navigation menu" data-i18n-aria-label="openMenu" aria-controls="sideDrawer" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
          <a href="index.html" class="header-brand" id="brandHomeReset" aria-label="Nischay Swar home">
            <div class="logo-pulse" aria-hidden="true"><span class="bar b1"></span><span class="bar b2"></span><span class="bar b3"></span></div>
            <div class="brand-text-wrap"><span class="main-name">NISCHAY <span class="accent-gold">SWAR</span></span><span class="sub-name" ${i18n("headerSub")}>निश्चय स्वर • असली आवाज़ों का डिजिटल खज़ाना</span></div>
          </a>
        </div>
        <div class="header-right">
          <button id="themeToggleBtn" class="theme-toggle-btn" type="button" aria-label="Toggle dark/light theme" data-i18n-aria-label="toggleTheme" title="Toggle dark/light theme">☀️</button>
          <div class="lang-dropdown-wrap">
            <button id="langToggleBtn" class="lang-btn" type="button" aria-haspopup="true" aria-expanded="false">
              <span class="globe-ico" aria-hidden="true">🌐</span><span id="currentLangLabel">हिन्दी</span><span class="caret" aria-hidden="true">▾</span>
            </button>
            <div id="langMenu" class="lang-menu" role="menu" aria-label="Choose language" data-i18n-aria-label="chooseLanguage">
              <button class="lang-option active" type="button" data-lang="hi" role="menuitem"><span>🇮🇳 हिन्दी</span><span class="check-mark">✓</span></button>
              <button class="lang-option" type="button" data-lang="en" role="menuitem"><span>🇬🇧 English</span><span class="check-mark">✓</span></button>
              <button class="lang-option" type="button" data-lang="bho" role="menuitem"><span>🌾 भोजपुरी</span><span class="check-mark">✓</span></button>
              <button class="lang-option" type="button" data-lang="bn" role="menuitem"><span>🏵️ বাংলা</span><span class="check-mark">✓</span></button>
              <button class="lang-option" type="button" data-lang="ur" role="menuitem"><span>📜 اردو</span><span class="check-mark">✓</span></button>
            </div>
          </div>
        </div>
      </header>
      <nav id="universalSubNav" class="universal-sub-nav" aria-label="Page navigation">${quickLinks}</nav>
    `;

    document.body.insertBefore(shell, document.body.firstChild);
    document.body.dataset.currentPage = currentPage ? currentPage.href : currentFile;
  }

  renderShell();
})();
