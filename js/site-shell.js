/* NISCHAY SWAR — shared premium shell for every page */
(function () {
  "use strict";

  const pages = [
    { href: "index.html", icon: "🏠", key: "qAll", navKey: "navPageHome" },
    { href: "legends.html", icon: "🇮🇳", key: "qLegends", navKey: "navPageLegends" },
    { href: "wildlife.html", icon: "🐅", key: "qWildlife", navKey: "navPageWildlife" },
    { href: "timeline.html", icon: "🕰️", key: "qTimeline", navKey: "navTimeline" },
    { href: "quiz.html", icon: "🎮", key: "qQuiz", navKey: "navPageQuiz" },
    { href: "about.html", icon: "🛡️", key: "qAbout", navKey: "navPageAbout" }
  ];

  const currentFile = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  const page = pages.find((item) => item.href === currentFile) || pages[0];

  function i18n(key, fallback) {
    return `data-i18n="${key}"${fallback ? ` data-i18n-fallback="${fallback}"` : ""}`;
  }

  function renderShell() {
    if (document.querySelector(".top-header")) return;

    const drawerLinks = pages.map((item) => `
      <a href="${item.href}" class="drawer-link ${item.href === currentFile ? "active" : ""}">
        <span class="nav-ico">${item.icon}</span>
        <span ${i18n(item.navKey)}>${item.href === "index.html" ? "होम (संपूर्ण ध्वनि संग्रह)" : item.href === "legends.html" ? "महापुरुष, वैज्ञानिक व कवि" : item.href === "wildlife.html" ? "जीव-जंतु, पक्षी व अंतरिक्ष" : item.href === "timeline.html" ? "इतिहास की टाइमलाइन (1860–2026)" : item.href === "quiz.html" ? "आवाज़ पहचानो क्विज़ गेम" : "मिशन व 100% Real सत्यापन"}</span>
      </a>`).join("");

    const quickLinks = pages.map((item) => `
      <a href="${item.href}" class="q-nav-btn ${item.href === currentFile ? "active" : ""}">
        ${item.icon} <span ${i18n(item.key)}>${item.href.replace(".html", "")}</span>
      </a>`).join("");

    const shell = document.createElement("div");
    shell.id = "nsSharedShell";
    shell.innerHTML = `
      <div id="drawerOverlay" class="drawer-overlay" aria-hidden="true"></div>
      <aside id="sideDrawer" class="side-drawer" aria-label="Main Navigation Drawer">
        <div class="drawer-header">
          <div class="brand-lockup">
            <div class="brand-badge">NS</div>
            <div>
              <h2 class="brand-title">NISCHAY SWAR</h2>
              <span class="brand-sub" ${i18n("brandTag")}>निश्चय स्वर • 100% असली आवाज़</span>
            </div>
          </div>
          <button id="closeDrawerBtn" class="icon-btn" aria-label="Close Menu">✕</button>
        </div>
        <div class="drawer-scroll">
          <nav class="drawer-nav">
            <p class="drawer-section-label" ${i18n("menuExplore")}>मुख्य नेविगेशन</p>
            ${drawerLinks}
            <p class="drawer-section-label" ${i18n("menuHumanAlbums")}>मानव इतिहास एल्बम</p>
            <button class="drawer-link" data-cat-jump="legends"><span class="nav-ico">🏛️</span><span ${i18n("catLegends")}>अमर वाणी</span></button>
            <button class="drawer-link" data-cat-jump="scientists"><span class="nav-ico">🚀</span><span ${i18n("catScientists")}>विज्ञान और प्रेरणा</span></button>
            <button class="drawer-link" data-cat-jump="poets"><span class="nav-ico">✒️</span><span ${i18n("catPoets")}>साहित्य और शायरी</span></button>
            <button class="drawer-link" data-cat-jump="rare"><span class="nav-ico">📻</span><span ${i18n("catRare")}>दुर्लभ रिकॉर्डिंग</span></button>
            <p class="drawer-section-label" ${i18n("menuNatureAlbums")}>जीव-जंतु और प्रकृति</p>
            <button class="drawer-link" data-cat-jump="wildlife"><span class="nav-ico">🦁</span><span ${i18n("catWildlife")}>जंगली जानवर</span></button>
            <button class="drawer-link" data-cat-jump="birds"><span class="nav-ico">🦚</span><span ${i18n("catBirds")}>पक्षी</span></button>
            <button class="drawer-link" data-cat-jump="nature"><span class="nav-ico">🌧️</span><span ${i18n("catNature")}>प्रकृति व अंतरिक्ष</span></button>
            <button class="drawer-link" data-cat-jump="instruments"><span class="nav-ico">🎶</span><span ${i18n("catInstruments")}>वाद्ययंत्र</span></button>
            <p class="drawer-section-label" ${i18n("menuPlatform")}>प्लेटफॉर्म और सत्यापन</p>
            <button id="openSubmitFromMenu" class="drawer-link highlight-link"><span class="nav-ico">📩</span><span ${i18n("navSubmit")}>असली आवाज़ भेजें</span></button>
            <button id="openVerifyInfoBtn" class="drawer-link"><span class="nav-ico">✅</span><span ${i18n("navVerify")}>100% Real Verification</span></button>
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
          <button id="openDrawerBtn" class="hamburger-btn" aria-label="Open Navigation Menu">
            <span></span><span></span><span></span>
          </button>
          <a href="index.html" class="header-brand" id="brandHomeReset">
            <div class="logo-pulse"><span class="bar b1"></span><span class="bar b2"></span><span class="bar b3"></span></div>
            <div class="brand-text-wrap">
              <span class="main-name">NISCHAY <span class="accent-gold">SWAR</span></span>
              <span class="sub-name" ${i18n("headerSub")}>निश्चय स्वर • असली आवाज़ों का डिजिटल खज़ाना</span>
            </div>
          </a>
        </div>
        <nav class="desktop-quick-nav" aria-label="Main Pages">${quickLinks}</nav>
        <div class="header-right">
          <button id="themeToggleBtn" class="theme-toggle-btn" aria-label="Toggle Dark/Light Theme" title="Toggle Dark/Light Theme">☀️</button>
          <div class="lang-dropdown-wrap">
            <button id="langToggleBtn" class="lang-btn" aria-haspopup="true" aria-expanded="false">
              <span class="globe-ico">🌐</span><span id="currentLangLabel">हिन्दी</span><span class="caret">▾</span>
            </button>
            <div id="langMenu" class="lang-menu" role="menu">
              <button class="lang-option active" data-lang="hi" role="menuitem"><span>🇮🇳 हिन्दी</span><span class="check-mark">✓</span></button>
              <button class="lang-option" data-lang="en" role="menuitem"><span>🇬🇧 English</span><span class="check-mark">✓</span></button>
              <button class="lang-option" data-lang="bho" role="menuitem"><span>🌾 भोजपुरी</span><span class="check-mark">✓</span></button>
              <button class="lang-option" data-lang="bn" role="menuitem"><span>🏵️ বাংলা</span><span class="check-mark">✓</span></button>
              <button class="lang-option" data-lang="ur" role="menuitem"><span>📜 اردو</span><span class="check-mark">✓</span></button>
            </div>
          </div>
        </div>
      </header>
      <nav id="universalSubNav" class="universal-sub-nav" aria-label="Quick Page Navigation">${quickLinks}</nav>
    `;

    document.body.insertBefore(shell, document.body.firstChild);
    document.body.dataset.currentPage = page.href;
  }

  renderShell();
})();
