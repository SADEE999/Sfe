/* SADEE PRO STORE - reliable mobile video controls */
(function () {
  'use strict';
  const SPEEDS = [1, 1.5, 2];

  function attach(video) {
    if (!(video instanceof HTMLVideoElement) || video.dataset.sadeeControls === '1') return;
    video.dataset.sadeeControls = '1';
    video.controls = false;

    const panel = document.createElement('div');
    panel.className = 'sadee-video-controls';
    panel.setAttribute('aria-label', 'Video controls');
    panel.innerHTML = `
      <button type="button" data-sv="play" aria-label="Play video">▶</button>
      <button type="button" data-sv="mute" class="sv-sound" aria-label="Turn sound on" aria-pressed="false">SOUND OFF</button>
      <button type="button" data-sv="speed" aria-label="Playback speed">1x</button>
      <input data-sv="seek" type="range" min="0" max="1000" value="0" step="1" aria-label="Seek video">
      <button type="button" data-sv="replay" aria-label="Replay video">↻</button>
      <button type="button" data-sv="fullscreen" aria-label="Fullscreen">⛶</button>`;
    video.insertAdjacentElement('afterend', panel);

    const play = panel.querySelector('[data-sv="play"]');
    const mute = panel.querySelector('[data-sv="mute"]');
    const speed = panel.querySelector('[data-sv="speed"]');
    const seek = panel.querySelector('[data-sv="seek"]');
    let speedIndex = 0;

    function refresh() {
      play.textContent = video.paused ? '▶' : 'Ⅱ';
      play.setAttribute('aria-label', video.paused ? 'Play video' : 'Pause video');
      const isMuted = video.muted || video.volume === 0;
      mute.textContent = isMuted ? 'SOUND OFF' : 'SOUND ON';
      mute.setAttribute('aria-label', isMuted ? 'Turn sound on' : 'Turn sound off');
      mute.setAttribute('aria-pressed', String(!isMuted));
      if (Number.isFinite(video.duration) && video.duration > 0 && !seek.matches(':active')) {
        seek.value = String(Math.round(video.currentTime / video.duration * 1000));
      }
    }

    // Delegate clicks at the panel level so taps on nested/mobile button content are caught.
    panel.addEventListener('click', async (event) => {
      const button = event.target.closest('button[data-sv]');
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      const action = button.dataset.sv;
      if (action === 'play') {
        if (video.paused) { try { await video.play(); } catch (_) {} }
        else video.pause();
      } else if (action === 'mute') {
        const turnSoundOn = video.muted || video.volume === 0;
        video.muted = !turnSoundOn;
        video.defaultMuted = false;
        video.removeAttribute('muted');
        video.volume = turnSoundOn ? 1 : 0;
        // Calling play inside the tap gesture helps mobile browsers resume audio.
        if (turnSoundOn && video.paused) { try { await video.play(); } catch (_) {} }
      } else if (action === 'speed') {
        speedIndex = (speedIndex + 1) % SPEEDS.length;
        video.playbackRate = SPEEDS[speedIndex];
        speed.textContent = SPEEDS[speedIndex] + 'x';
      } else if (action === 'replay') {
        try { video.currentTime = 0; await video.play(); } catch (_) {}
      } else if (action === 'fullscreen') {
        try {
          if (document.fullscreenElement) await document.exitFullscreen();
          else if (video.requestFullscreen) await video.requestFullscreen();
          else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
        } catch (_) {}
      }
      refresh();
    }, true);

    seek.addEventListener('input', () => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        video.currentTime = Number(seek.value) / 1000 * video.duration;
      }
    });
    ['play', 'pause', 'volumechange', 'timeupdate', 'loadedmetadata', 'durationchange', 'ended', 'emptied'].forEach(name => video.addEventListener(name, refresh));
    const syncVisibility = () => { panel.hidden = video.hidden; };
    new MutationObserver(syncVisibility).observe(video, { attributes: true, attributeFilter: ['hidden'] });
    syncVisibility();
    refresh();
  }

  function scan(node) {
    if (!node || node.nodeType !== 1) return;
    if (node.matches('video')) attach(node);
    node.querySelectorAll?.('video').forEach(attach);
  }
  function start() {
    scan(document.body);
    new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(scan)))
      .observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
