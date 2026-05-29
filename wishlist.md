# LeeStreamTVPro — Feature Wishlist 🎯

A curated list of features and improvements that would elevate LeeStreamTVPro from a powerful scraping engine into a full premium streaming platform experience.

---

## 🔖 Watchlist & Favourites
- [x] **Personal Watchlist** — Save movies & shows to a "My List" tab, persisted in localStorage. One-tap add from any poster card or the detail modal.
- [x] **Continue Watching Row** — Track playback progress per title and show a dedicated "Continue Watching" carousel on the Home tab with resume timestamps and progress bars on posters.
- [x] **Watch History** — Log every stream that was played with timestamp, resolution, and provider. Browseable history page with the ability to re-launch the same stream or re-scrape.

---

## 🎬 Playback & Player Enhancements
- [ ] **Subtitle Support** — Load `.srt` / `.vtt` subtitle files from OpenSubtitles API or allow manual upload. Render text tracks over the built-in HTML5 player with font size and colour options.
- [ ] **Next Episode Auto-Play** — After a TV series episode finishes, show a 15-second countdown overlay to automatically scrape and play the next episode (S01E02 → S01E03).
- [ ] **Multiple Audio Track Selection** — If the HLS stream contains multiple audio tracks, expose a language picker in the player controls overlay.
- [x] **Picture-in-Picture (PiP)** — Add a PiP toggle button so users can browse the catalog while a stream plays in a floating mini-player corner.
- [ ] **Playback Speed Control** — Allow 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x speed adjustment via the player controls.
- [ ] **Skip Intro / Skip Recap Buttons** — Allow users to manually set or auto-detect skip markers for TV series intros.

---

## 🔍 Discovery & Catalog
- [x] **Genre Browsing** — Dedicated genre filter page (Action, Comedy, Horror, Sci-Fi, etc.) using TMDb genre endpoints. Grid or carousel per genre.
- [ ] **Trending by Time Period** — Toggle trending movies/shows by day, week, or month instead of only the default weekly trending.
- [ ] **Top Rated & Upcoming Tabs** — Add TMDb "top_rated" and "upcoming" endpoints as additional catalog sections.
- [ ] **Similar / Recommended Titles** — Show a "You Might Also Like" row inside the Media Detail Modal, pulled from TMDb's `/recommendations` endpoint.
- [x] **Actor / Director Pages** — Tap on a cast member to see their filmography and jump to any title.
- [/] **Advanced Search Filters** — Filter search results and browse catalogs by release date / year.

---

## 🎨 UI & Experience
- [x] **Splash Screen / Boot Animation** — Show a cinematic LeeStreamTVPro animated logo on cold start while the initial TMDb data loads.
- [x] **Multiple Hero Banner Rotation** — Rotate through the top 5 trending items on the Home hero banner with a smooth crossfade every 8 seconds, with dot indicators.
- [x] **Poster Long-Press Quick Actions** — Long-press (or hold Enter on remote) on a poster card to show a context menu: "Add to Watchlist", "Mark as Watched", "View Details".
- [ ] **Dark / OLED Black Theme Toggle** — Offer a true OLED black mode (`#000000` backgrounds) for AMOLED TV screens to save power and enhance contrast.
- [ ] **Notification Toasts** — Replace `alert()` calls with elegant slide-in toast notifications for errors, success messages, and automation triggers.
- [ ] **Skeleton → Content Transition Animations** — Animate skeleton loaders morphing into real poster cards with a smooth fade/scale transition.

---

## ⚙️ Settings & Configuration
- [ ] **Export / Import Settings** — Allow users to export their full config (scraper segments, automation rules) as a JSON file and import on another device.
- [ ] **Parental Controls / Content Filter** — Filter out adult-rated content or set a minimum age rating threshold.
- [ ] **Custom Scraper Endpoint Manager** — Allow users to add, remove, and reorder custom scraper endpoints beyond the built-in four (Torrentio, NoTorrent, StreamViX, HdHub).
- [ ] **Scraper Timeout Configuration** — Let users adjust the per-provider timeout threshold (currently hardcoded) from settings.

---

## 📡 Streaming & Scraping
- [ ] **Stream Quality Preference** — Global preference to auto-select preferred resolution (4K > 1080p > 720p) instead of just "Auto-Select 4K" toggle.
- [ ] **Favourite Providers** — Pin preferred providers (e.g. always try HdHub first) and deprioritise or disable others.
- [ ] **Stream Health Indicator** — Before launching, quick-ping the stream URL to show a green/yellow/red health badge indicating whether the link is alive.
- [ ] **Magnet / Torrent Direct Integration** — For non-debrid users, offer the option to copy magnet links to clipboard or open in a local torrent client.

---

## 📱 Platform & Deployment
- [x] **PWA Install Prompt** — Add a service worker and web manifest so the app can be installed as a Progressive Web App on any device, with an offline fallback page.
- [x] **Chromecast / Google Cast Support** — Cast the current stream to a Chromecast-enabled TV directly from the built-in player.
- [ ] **Multi-Device Sync** — Optional cloud sync (Firebase/Supabase) for watchlist, history, and settings across devices using a simple PIN or QR code pairing.
- [ ] **Android TV Launcher Integration** — Generate a Leanback launcher tile so the app appears in the Android TV home screen apps row.
- [ ] **Keyboard Shortcuts Help Overlay** — Press `?` to show a modal listing all keyboard/remote shortcuts for power users.

---

## 🛡️ Reliability & Performance
- [ ] **Stream Retry with Fallback** — If a stream fails in the HTML5 player, automatically try the next stream in the sorted list before showing the error screen.
- [ ] **Lazy Loading Posters with Blur Placeholder** — Show a tiny blurred thumbnail (blurhash) while high-res posters load, eliminating layout shift.
- [ ] **Caching TMDb Responses** — Cache trending/search results in sessionStorage for instant back-navigation without re-fetching.
- [x] **Scraper Execution Timing** — Display per-provider response times (ms) in the thread monitor cards for performance visibility.

---

> 💡 *Priority suggestion*: **Continue Watching + Next Episode Auto-Play** would have the biggest quality-of-life impact for daily TV series viewing on Firestick/Google TV.
