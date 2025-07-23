


window.playVocabAudio = playVocabAudio;

function smoothScrollToBottom(element, duration = 1100) {
  const start = element.scrollTop;
  const end = element.scrollHeight - element.clientHeight;
  const change = end - start;
  if (change === 0) return;
  const startTime = performance.now();
  function animateScroll(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    element.scrollTop = start + change * ease;
    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    }
  }
  requestAnimationFrame(animateScroll);
}

let currentIdx = 0;
let audioPlayer = null;
let lastSpeakerBtn = null;
let isVocabReviewHintShown = false; // 友善提示旗標

function showDialogue(idx) {
  const chatBox = document.getElementById('chatBox');
  const tapHint = document.getElementById('tapHint');
  const vocabBox = document.getElementById('vocabReview');

  chatBox.style.display = 'flex';
  vocabBox.style.display = 'none';

  if (idx >= dialogue.length) {
    if (!isVocabReviewHintShown) {
      tapHint.innerHTML = '🎉 你已看完整段對話！<br>繼續點一下，學習本段重點單字/短語<br><br><br>';
      tapHint.style.color = '#008763';
      isVocabReviewHintShown = true;
      return;
    } else {
      showVocabReview();
      return;
    }
  }

  // 移除 tapHint
  if (chatBox.contains(tapHint)) chatBox.removeChild(tapHint);

  const msg = dialogue[idx];
  const div = document.createElement('div');
  div.className = 'chat-msg ' + msg.role;
  // 新增 toggle switch
  div.innerHTML = `
    <div class="bubble">
      ${msg.en}
      <button class="speaker-icon" title="播放讀音" data-audio="${msg.audio}" onclick="playAudio(this)">
        <svg class="speaker-svg" width="19" height="19" viewBox="0 0 20 20" fill="none">
          <path d="M4 8v4h4l5 5V3l-5 5H4z" fill="#666"/>
          <path d="M15 8c1 1 1 3 0 4" stroke="#666" stroke-width="1.3" fill="none"/>
        </svg>
        <span class="spinner"></span>
      </button>
      <label class="toggle-switch">
  <input type="checkbox" onchange="toggleTranslation(this)">
  <span class="toggle-slider">
    <span class="toggle-label">中</span>
  </span>
</label>

    </div>
<div class="translation" style="display:none">${msg.zh}</div>
  `;
  chatBox.appendChild(div);

  // 如果是最後一句，馬上顯示提示
  if (idx === dialogue.length - 1) {
    tapHint.innerHTML = '🎉 你已看完整段對話！<br>繼續點一下，學習本段重點單字/短語<br><br><br>';
    tapHint.style.color = '#008763';
    chatBox.appendChild(tapHint);
    isVocabReviewHintShown = true;
  } else {
    chatBox.appendChild(tapHint);
  }

  smoothScrollToBottom(chatBox, 1200);
}

// 切換中文顯示/隱藏（適用 toggle switch）
function toggleTranslation(checkbox) {
  // 最保險是找 .chat-msg > .bubble > .toggle-switch 對應的兄弟 .translation
  const chatMsgDiv = checkbox.closest('.chat-msg');
  const translationDiv = chatMsgDiv.querySelector('.translation');
  if (!translationDiv) return;
  translationDiv.style.display = checkbox.checked ? 'block' : 'none';
}




function playAudio(btn) {
  if (lastSpeakerBtn && lastSpeakerBtn !== btn) lastSpeakerBtn.classList.remove('loading');
  if (audioPlayer) { audioPlayer.pause(); audioPlayer.currentTime = 0; }
  btn.classList.add('loading');
  lastSpeakerBtn = btn;
  const audioUrl = btn.getAttribute('data-audio');
  audioPlayer = new Audio(audioUrl);
  audioPlayer.addEventListener('playing', function () { btn.classList.remove('loading'); });
  audioPlayer.addEventListener('canplay', function () { btn.classList.remove('loading'); });
  audioPlayer.addEventListener('error', function () { btn.classList.remove('loading'); alert('讀音播放失敗，請稍後再試。'); });
  audioPlayer.play().catch(() => { btn.classList.remove('loading'); });
}

function playVocabAudio(url, btn) {
  if (!url) return;
  btn.style.opacity = 0.4;
  const audio = new Audio(url);
  audio.addEventListener('ended', () => { btn.style.opacity = 0.7; });
  audio.addEventListener('error', () => { btn.style.opacity = 0.7; });
  audio.play();
}

function showVocabReview() {
  const vocabBox = document.getElementById('vocabReview');
  let html = `<div style="font-size:1.08em;margin-bottom:13px;color:#008763;">
    ⭐ 重點單字／短語回顧（點喇叭聽讀音）
  </div>`;
  vocabularies.forEach(v => {
    html += `
      <div class="vocab-item">
        <div class="vocab-head">
          <div style="display: flex; align-items: center; gap: 7px;">
            <span class="vocab-en">${v.en}</span>
            <button class="vocab-speaker" title="單字讀音" onclick="playVocabAudio('${v.audio}',this)">
              <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
                <path d="M4 8v4h4l5 5V3l-5 5H4z" fill="#0ba26e"/>
              </svg>
            </button>
          </div>
          <div style="margin-top:2px;">
            <span class="vocab-zh">${v.zh}</span>
          </div>
        </div>
        <div class="vocab-example">
          ${v.example}
          <button class="vocab-speaker" title="例句讀音" onclick="playVocabAudio('${v.example_audio}',this)">
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
              <path d="M4 8v4h4l5 5V3l-5 5H4z" fill="#0ba26e"/>
            </svg>
          </button>
        </div>
        <span class="vocab-example-zh">${v.example_zh}</span>
      </div>
    `;
  });
  html += `<div style="text-align:center; margin-top: 22px;">
    <button id="backToChatBtn" style="
      background: #0ba26e; color: #fff; border: none; border-radius: 6px;
      padding: 8px 22px; font-size: 1em; font-weight: 500; cursor: pointer;">
      返回對話
    </button>
  </div>`;
  vocabBox.innerHTML = html;
  vocabBox.style.display = 'flex';
  document.getElementById('chatBox').style.display = 'none';
  setTimeout(() => {
    document.getElementById('backToChatBtn').onclick = function() {
      vocabBox.style.display = 'none';
      document.getElementById('chatBox').style.display = 'flex';
      currentIdx = dialogue.length;
      isVocabReviewHintShown = false;
      const tapHint = document.getElementById('tapHint');
      tapHint.innerHTML = '再點一下學習重點單字／短語';
      tapHint.style.color = '#008763';
      if (!document.getElementById('chatBox').contains(tapHint)) {
        document.getElementById('chatBox').appendChild(tapHint);
      }
    };
  }, 0);
}

window.onload = function() {
  showDialogue(0);
  currentIdx = 1;
};

document.getElementById('chatBox').addEventListener('click', function(e) {
  if (
    e.target.closest('.speaker-icon') ||
    (e.target.closest('label.toggle-switch')) ||
    (e.target.classList && e.target.classList.contains('toggle-slider'))
  ) return;
  showDialogue(currentIdx);
  currentIdx++;
});

document.querySelector('.chat-container').addEventListener('click', function(e) {
  if (
    e.target.id === 'chatBox' ||
    e.target.classList.contains('bubble') ||
    e.target.classList.contains('translation') ||
    e.target.classList.contains('tap-hint') ||
    e.target.closest('.speaker-icon') ||
    e.target.closest('label.toggle-switch') ||
    (e.target.classList && e.target.classList.contains('toggle-slider'))
  ) {
    return;
  }
  showDialogue(currentIdx);
  currentIdx++;
});

function hideOverlay() {
  const ov = document.getElementById('startOverlay');
  ov.style.opacity = 0;
  setTimeout(()=>{ ov.style.display = 'none'; }, 330);
}
