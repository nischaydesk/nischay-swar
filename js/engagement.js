/* ==========================================================================
   NISCHAY SWAR (निश्चय स्वर) — REAL LIKES, SAFE COMMENTS & WHATSAPP SHARE
   File: js/engagement.js
   ========================================================================== */

window.NSEngagement = (function () {
  "use strict";

  function getVoices() {
    return window.NISCHAY_VOICES_DATA || [];
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function containsBlockedWord(text) {
    const lower = text.toLowerCase();
    return window.NSConfig.BLOCKED_WORDS.some((word) => lower.includes(word));
  }

  function syncToCloud(payload) {
    const url = window.NSConfig.GOOGLE_SHEET_API_URL;
    if (!url) return;
    fetch(url, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).catch(() => {});
  }

  function toggleVoiceLike(voiceId) {
    const { state, isVoiceLiked, saveStorage, showToast, formatNumber, getVoiceLikes } = window.NSConfig;
    const voice = getVoices().find((v) => v.id === voiceId);
    if (!voice) return;

    const alreadyLiked = isVoiceLiked(voiceId);
    if (alreadyLiked) {
      state.likedIds = state.likedIds.filter((id) => id !== voiceId);
      state.extraLikes[voiceId] = Math.max(0, (state.extraLikes[voiceId] || 1) - 1);
      showToast("पसंदीदा से हटाया गया");
    } else {
      state.likedIds.push(voiceId);
      state.extraLikes[voiceId] = (state.extraLikes[voiceId] || 0) + 1;
      showToast("❤️ पसंदीदा आवाज़ों में जोड़ा गया!");
      syncToCloud({ action: "like", voiceId: voice.id });
    }

    saveStorage();

    if (window.NSRenderer) {
      window.NSRenderer.updateGlobalStats();
      window.NSRenderer.renderVoicesGrid();
    }
    if (window.NSAudio) {
      window.NSAudio.updatePlayerUI();
    }

    if (state.activeModalVoiceId === voiceId) {
      const likeBtn = document.getElementById("modalLikeBtn");
      const likeCountEl = document.getElementById("modalLikeCount");
      if (likeBtn) likeBtn.classList.toggle("liked", !alreadyLiked);
      if (likeCountEl) likeCountEl.textContent = formatNumber(getVoiceLikes(voice));
    }
  }

  function shareVoice(voiceId) {
    const { getLocalizedField } = window.NSConfig;
    const voice = getVoices().find((v) => v.id === voiceId);
    if (!voice) return;

    const title = getLocalizedField(voice.name);
    const bio = getLocalizedField(voice.bio);
    const shareText = `🎙️ *Nischay Swar (निश्चय स्वर)* पर सुनें *${title} (${voice.year})* की 100% असली आवाज़!\n\n"${bio}"\n\nअभी सुनें 👇\n${window.location.href}`;

    if (navigator.share) {
      navigator.share({
        title: `Nischay Swar — ${title}`,
        text: shareText,
        url: window.location.href
      }).catch(() => {});
    } else {
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
      window.open(waUrl, "_blank");
    }
  }

  function renderCommentsList(voice) {
    const listEl = document.getElementById("commentsList");
    const countEl = document.getElementById("modalCommentCount");
    if (!listEl || !voice) return;

    const saved = window.NSConfig.state.userComments[voice.id] || [];
    const combined = [...saved, ...(voice.initialComments || [])];
    if (countEl) countEl.textContent = combined.length;

    if (combined.length === 0) {
      listEl.innerHTML = `<p style="color:var(--text-muted); font-size:0.84rem; text-align:center; padding:12px;">अभी तक कोई प्रतिक्रिया नहीं है। सबसे पहले अपने विचार लिखें!</p>`;
      return;
    }

    listEl.innerHTML = combined
      .map(
        (c) => `
        <div class="comment-item">
          <div class="comment-item-top">
            <span class="comment-author">${escapeHtml(c.author)}</span>
            <span class="comment-time">${escapeHtml(c.time)}</span>
          </div>
          <p class="comment-body">${escapeHtml(c.text)}</p>
        </div>
      `
      )
      .join("");
  }

  function handleCommentSubmit(e) {
    e.preventDefault();
    const { state, saveStorage } = window.NSConfig;
    if (!state.activeModalVoiceId) return;

    const authorInput = document.getElementById("commentAuthorInput");
    const textInput = document.getElementById("commentTextInput");
    const feedbackEl = document.getElementById("commentFeedbackMsg");

    const author = authorInput.value.trim();
    const text = textInput.value.trim();
    if (!author || !text) return;

    // Anti-spam & abusive language blocker
    if (
      containsBlockedWord(author) ||
      containsBlockedWord(text) ||
      text.includes("http://") ||
      text.includes("https://")
    ) {
      feedbackEl.textContent = "⚠️ सुरक्षा नियम: अभद्र भाषा या बाहरी लिंक पोस्ट करना मना है।";
      feedbackEl.className = "comment-feedback error";
      feedbackEl.classList.remove("hidden");
      return;
    }

    const newComment = {
      author,
      text,
      time: "अभी (Just now)"
    };

    if (!state.userComments[state.activeModalVoiceId]) {
      state.userComments[state.activeModalVoiceId] = [];
    }
    state.userComments[state.activeModalVoiceId].unshift(newComment);
    saveStorage();

    textInput.value = "";
    feedbackEl.textContent = "✅ आपकी प्रतिक्रिया सफलतापूर्वक जोड़ दी गई है!";
    feedbackEl.className = "comment-feedback success";
    feedbackEl.classList.remove("hidden");

    const voice = getVoices().find((v) => v.id === state.activeModalVoiceId);
    if (voice) renderCommentsList(voice);
    if (window.NSRenderer) window.NSRenderer.renderVoicesGrid();

    syncToCloud({
      action: "comment",
      voiceId: state.activeModalVoiceId,
      author,
      text
    });

    setTimeout(() => feedbackEl.classList.add("hidden"), 3000);
  }

  return {
    toggleVoiceLike,
    shareVoice,
    renderCommentsList,
    handleCommentSubmit,
    syncToCloud
  };
})();
