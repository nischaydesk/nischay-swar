# Nischay Swar (निश्चय स्वर)

A multilingual static archive interface for historical, wildlife, nature, space, and rare recordings.

**Live website:** <https://nischaydesk.github.io/nischay-swar/>

## Pages

The shared navigation, language selector, theme control, audio player, and footer are available across the archive routes: `index.html`, `legends.html`, `wildlife.html`, `timeline.html`, `quiz.html`, `space-rare.html`, `favorites.html`, `about.html`, and `404.html`.

The interface supports Hindi, English, Bhojpuri, Bengali, and Urdu (RTL). The `space-rare.html` page filters the existing space and rare-record categories. Favorites are stored locally in the current browser/device; they are not synced across accounts. Engagement counts and comments also use the existing client-side storage unless a backend is separately configured.

## Add a voice in one place

Use [`js/db-custom-uploads.js`](js/db-custom-uploads.js) as the master entry file. It loads after the existing databases on each page and appends valid, unique records to the shared archive, so new entries flow into the homepage, relevant category pages, search, timeline and quiz.

Copy the record schema in that file into `NISCHAY_CUSTOM_VOICES` and fill in a stable unique `id`, a supported category, year, duration, photo URL, audio URL, source, and the localized `name`, `role`, and `bio` fields (`hi`, `en`, `bho`, `bn`, `ur`). Optional `sourceUrl` and `license` fields are available for attribution. No sample media URLs or placeholder records are active by default.

The loader checks basic record shape and duplicate IDs; it does not establish that a recording is authentic, that a remote link works, or that its license permits reuse. Verify the original recording, source, link, credit, and rights before publishing. Image failures display a generated local SVG fallback with a category symbol and the voice name. Existing audio/photo URLs were not replaced as part of the page updates.

## Local checks

This is a static site; deploy the repository through the existing GitHub Pages setup. The service worker caches the archive pages and shared scripts for offline shell access. Remote media remains online-dependent. Browser favorites/comments remain local to each device.
