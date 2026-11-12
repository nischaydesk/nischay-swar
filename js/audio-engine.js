/* ==========================================================================
   NISCHAY SWAR (निश्चय स्वर) — SPOTIFY-STYLE AUDIO PLAYER & REAL LISTEN ENGINE
   File: js/audio-engine.js
   ========================================================================== */

window.NSAudio = (function () {
  "use strict";

  const SPEEDS = [1, 1.25, 1.5, 0.85];

  function getAudioEl() {
    return document.getElementById("htmlAudioElement");
  }

  function getVoices() {
    return window.NISCHAY_VOICES_DATA || [];
  }

  function updatePlayerUI() {
    const { state, getLocalizedField, isVoiceLiked } = window.NSConfig;
    const voices = getVoices();
    const voice = voices[state.currentTrackIndex];
    if (!voice) return;

    const avatar = document.getElementById("playerAvatar");
    const title = document.getElementById("playerTrackTitle");
    const sub = document.getElementById("playerTrackSub");
    const playPauseBtn = document.getElementById("mainPlayPauseBtn");
    const quickLikeBtn = document.getElementById("playerQuickLikeBtn");

    if (avatar) {
      avatar.src = voice.photo;
      avatar.onerror = () => {
        if (window.NSImageFallback) window.NSImageFallback(avatar);
      };
    }
    if (title) title.textContent = getLocalizedField(voice.name);
    if (sub) sub.textContent = `${voice.year} • ${getLocalizedField(voice.role)}`;
    if (playPauseBtn) playPauseBtn.textContent = state.isPlaying ? "⏸" : "▶";
    if (quickLikeBtn) quickLikeBtn.textContent = isVoiceLiked(voice.id) ? "❤️" : "🤍";
  }

  function playVoiceById(voiceId) {
    const { state, showToast } = window.NSConfig;
    const voices = getVoices();
    const audio = getAudioEl();
    const idx = voices.findIndex((v) => v.id === voiceId);
    if (idx === -1 || !audio) return;

    const voice = voices[idx];
    const isSameTrack = state.currentTrackIndex === idx && audio.src;

    if (isSameTrack) {
      if (audio.paused) {
        audio.play().catch(() => showToast("⚠️ ऑडियो लोड नहीं हो सका, इंटरनेट जांचें"));
      } else {
        audio.pause();
      }
      return;
    }

    state.currentTrackIndex = idx;
    state.playCountedForCurrentTrack = false;
    audio.src = voice.audioUrl;
    audio.playbackRate = state.playbackSpeed;

    const stickyBar = document.getElementById("stickyAudioPlayer");
    if (stickyBar) stickyBar.classList.remove("hidden");
    updatePlayerUI();

    audio
      .play()
      .then(() => {
        state.isPlaying = true;
        updatePlayerUI();
        if (window.NSRenderer) window.NSRenderer.renderVoicesGrid();
      })
      .catch(() => {
        showToast("⚠️ ऑडियो चलाने के लिए दोबारा Play दबाएं");
      });
  }

  function playNext() {
    const voices = getVoices();
    if (!voices.length) return;
    const nextIdx = (window.NSConfig.state.currentTrackIndex + 1) % voices.length;
    playVoiceById(voices[nextIdx].id);
  }

  function playPrev() {
    const voices = getVoices();
    if (!voices.length) return;
    const len = voices.length;
    const prevIdx = (window.NSConfig.state.currentTrackIndex - 1 + len) % len;
    playVoiceById(voices[prevIdx].id);
  }

  function cycleSpeed() {
    const { state } = window.NSConfig;
    const audio = getAudioEl();
    const speedBtn = document.getElementById("playerSpeedBtn");
    const idx = SPEEDS.indexOf(state.playbackSpeed);
    state.playbackSpeed = SPEEDS[(idx + 1) % SPEEDS.length];
    if (audio) audio.playbackRate = state.playbackSpeed;
    if (speedBtn) speedBtn.textContent = `${state.playbackSpeed}x`;
  }

  function registerRealListenIfEligible() {
    const { state, saveStorage, formatNumber, getVoicePlays } = window.NSConfig;
    const audio = getAudioEl();
    if (!audio || state.playCountedForCurrentTrack) return;

    // Count as real listen after 4 seconds of genuine playback
    if (audio.currentTime >= 4) {
      state.playCountedForCurrentTrack = true;
      const voice = getVoices()[state.currentTrackIndex];
      if (!voice) return;

      state.extraPlays[voice.id] = (state.extraPlays[voice.id] || 0) + 1;
      saveStorage();

      if (window.NSRenderer) {
        window.NSRenderer.updateGlobalStats();
        window.NSRenderer.renderVoicesGrid();
      }

      if (state.activeModalVoiceId === voice.id) {
        const modalPlayEl = document.getElementById("modalPlayCount");
        if (modalPlayEl) modalPlayEl.textContent = formatNumber(getVoicePlays(voice));
      }

      if (window.NSEngagement) {
        window.NSEngagement.syncToCloud({ action: "play", voiceId: voice.id });
      }
    }
  }

  function initAudioListeners() {
    const audio = getAudioEl();
    if (!audio) return;

    const progressWrap = document.getElementById("progressBarContainer");
    const progressFill = document.getElementById("playerProgressFill");
    const curTimeEl = document.getElementById("currentTimeText");
    const durTimeEl = document.getElementById("durationTimeText");

    audio.addEventListener("play", () => {
      window.NSConfig.state.isPlaying = true;
      updatePlayerUI();
      if (window.NSRenderer) window.NSRenderer.renderVoicesGrid();
    });

    audio.addEventListener("pause", () => {
      window.NSConfig.state.isPlaying = false;
      updatePlayerUI();
      if (window.NSRenderer) window.NSRenderer.renderVoicesGrid();
    });

    audio.addEventListener("timeupdate", () => {
      registerRealListenIfEligible();
      if (audio.duration) {
        const pct = (audio.currentTime / audio.duration) * 100;
        if (progressFill) progressFill.style.width = `${pct}%`;
        if (curTimeEl) curTimeEl.textContent = window.NSConfig.formatSeconds(audio.currentTime);
        if (durTimeEl) durTimeEl.textContent = window.NSConfig.formatSeconds(audio.duration);
      }
    });

    audio.addEventListener("ended", () => {
      window.NSConfig.state.isPlaying = false;
      updatePlayerUI();
      if (window.NSRenderer) window.NSRenderer.renderVoicesGrid();
    });

    if (progressWrap) {
      progressWrap.addEventListener("click", (e) => {
        if (!audio.duration) return;
        const rect = progressWrap.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        audio.currentTime = ratio * audio.duration;
      });
    }
  }

  return {
    playVoiceById,
    playNext,
    playPrev,
    cycleSpeed,
    updatePlayerUI,
    initAudioListeners
  };
})();
