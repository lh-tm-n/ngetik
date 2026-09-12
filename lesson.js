(function () {
  'use strict';

  const FINGERS = {
    l_pinky:  { id: 'l_pinky',  name: 'Kelingking Kiri',  hand: 'Tangan Kiri',  color: '#e94560' },
    l_ring:   { id: 'l_ring',   name: 'Jari Manis Kiri',  hand: 'Tangan Kiri',  color: '#ff8c42' },
    l_middle: { id: 'l_middle', name: 'Jari Tengah Kiri', hand: 'Tangan Kiri',  color: '#f0c040' },
    l_index:  { id: 'l_index',  name: 'Jari Telunjuk Kiri', hand: 'Tangan Kiri', color: '#00d2a0' },
    r_index:  { id: 'r_index',  name: 'Jari Telunjuk Kanan', hand: 'Tangan Kanan', color: '#4ecdc4' },
    r_middle: { id: 'r_middle', name: 'Jari Tengah Kanan', hand: 'Tangan Kanan', color: '#38bdf8' },
    r_ring:   { id: 'r_ring',   name: 'Jari Manis Kanan', hand: 'Tangan Kanan', color: '#a855f7' },
    r_pinky:  { id: 'r_pinky',  name: 'Kelingking Kanan', hand: 'Tangan Kanan', color: '#ec4899' },
    thumb:    { id: 'thumb',    name: 'Ibu Jari',         hand: 'Kedua Tangan', color: '#94a3b8' }
  };

  const KEY_FINGER = {
    '1': 'l_pinky', '2': 'l_ring', '3': 'l_middle', '4': 'l_index', '5': 'l_index',
    '6': 'r_index', '7': 'r_index', '8': 'r_middle', '9': 'r_ring', '0': 'r_pinky',
    'q': 'l_pinky', 'w': 'l_ring', 'e': 'l_middle', 'r': 'l_index', 't': 'l_index',
    'y': 'r_index', 'u': 'r_index', 'i': 'r_middle', 'o': 'r_ring', 'p': 'r_pinky',
    'a': 'l_pinky', 's': 'l_ring', 'd': 'l_middle', 'f': 'l_index', 'g': 'l_index',
    'h': 'r_index', 'j': 'r_index', 'k': 'r_middle', 'l': 'r_ring', ';': 'r_pinky',
    'z': 'l_pinky', 'x': 'l_ring', 'c': 'l_middle', 'v': 'l_index', 'b': 'l_index',
    'n': 'r_index', 'm': 'r_index', ',': 'r_middle', '.': 'r_ring', '/': 'r_pinky',
    ' ': 'thumb'
  };

  const FINGER_HOME = {
    l_pinky: 'A', l_ring: 'S', l_middle: 'D', l_index: 'F',
    r_index: 'J', r_middle: 'K', r_ring: 'L', r_pinky: ';'
  };

  const KB_ROWS = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
    [' ']
  ];

  const HOME_KEYS = new Set('asdfjkl;'.split(''));
  const HOME_BASE = 'asdfjkl';

  const KEY_ROW = {};
  KB_ROWS.forEach((row, ri) => {
    row.forEach(k => { KEY_ROW[k] = ri; });
  });

  const LESSONS = [
    { id: 'home', icon: '🏠', title: 'Baris Rumah', keys: 'asdfjkl;',
      desc: 'Posisi dasar semua jari: A S D F (tangan kiri) dan J K L ; (tangan kanan). Mulai dari sini.' },
    { id: 'l-index', icon: '🎯', title: 'Telunjuk Kiri', keys: 'rtfvgb',
      desc: 'Jari telunjuk kiri menjangkau: R T F G dan V B (baris bawah).' },
    { id: 'l-middle', icon: '🔺', title: 'Jari Tengah Kiri', keys: 'edc',
      desc: 'Jari tengah kiri tetap di tombol D, naik ke E dan turun ke C.' },
    { id: 'l-ring', icon: '🔶', title: 'Jari Manis Kiri', keys: 'wsx',
      desc: 'Jari manis kiri tanpa melihat: naik ke W, turun ke X.' },
    { id: 'l-pinky', icon: '🖐️', title: 'Kelingking Kiri', keys: 'qaz',
      desc: 'Kelingking kiri paling ujung: Q, A, dan Z.' },
    { id: 'r-index', icon: '🎯', title: 'Telunjuk Kanan', keys: 'yuhjnm',
      desc: 'Jari telunjuk kanan menjangkau: Y U H J serta N M (baris bawah).' },
    { id: 'r-middle', icon: '🔺', title: 'Jari Tengah Kanan', keys: 'ik,',
      desc: 'Jari tengah kanan: naik dari K ke I, turun ke koma.' },
    { id: 'r-ring', icon: '🔶', title: 'Jari Manis Kanan', keys: 'ol.',
      desc: 'Jari manis kanan: naik dari L ke O, turun ke titik.' },
    { id: 'r-pinky', icon: '🖐️', title: 'Kelingking Kanan', keys: 'p;/',
      desc: 'Kelingking kanan: P, titik koma, dan garis miring.' },
    { id: 'full', icon: '⌨️', title: 'Latihan Penuh', keys: 'qwertyuiopasdfghjklzxcvbnm',
      desc: 'Semua huruf bersama-sama. Jaga posisi jari tetap benar!' }
  ];

  const RAW_POOL = [
    ...WORDS.common,
    ...WORDS.medium,
    ...WORDS.sentences.reduce((acc, s) => acc.concat(s.split(' ')), [])
  ].map(w => w.toLowerCase().replace(/[^a-z]/g, ''));

  const WORD_POOL = [...new Set(RAW_POOL)].filter(w => w.length >= 2 && w.length <= 8);

  function el(tag, cls) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    return node;
  }

  function rgba(hex, alpha) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function buildDrills(lesson) {
    const drills = [];
    const training = [...new Set(lesson.keys.replace(/[^a-z]/g, '').split(''))];
    const home = HOME_BASE.split('');
    const all = [...new Set((lesson.keys + HOME_BASE).replace(/[^a-z]/g, '').split(''))];

    training.forEach(c => {
      drills.push(c, c + c, c + c + c);
    });

    training.forEach(t => {
      home.forEach(h => {
        drills.push(h + t, t + h, h + t + h, t + h + t);
      });
    });

    home.forEach(h1 => {
      home.forEach(h2 => {
        if (h1 !== h2) drills.push(h1 + h2 + h1);
      });
    });

    for (let i = 0; i < 24; i++) {
      const len = 3 + (i % 2);
      let w = '';
      for (let j = 0; j < len; j++) w += all[Math.floor(Math.random() * all.length)];
      drills.push(w);
    }

    return drills;
  }

  function buildWords(lesson) {
    const allowed = new Set((lesson.keys + HOME_BASE).split(''));
    const real = WORD_POOL.filter(w => [...w].every(c => allowed.has(c))).slice(0, 14);
    const list = [...real, ...buildDrills(lesson)];
    return shuffle(list).slice(0, 25);
  }

  class FingerLesson {
    constructor() {
      this.currentLesson = null;
      this.state = null;
      this.keyEls = {};

      this.el = {
        menu: document.getElementById('lessonMenu'),
        area: document.getElementById('lessonArea'),
        grid: document.getElementById('lessonGrid'),
        legendFingers: document.getElementById('legendFingers'),
        progressStrip: document.getElementById('lessonProgressStrip'),
        backBtn: document.getElementById('lessonBackBtn'),
        topIcon: document.getElementById('lessonTopIcon'),
        topTitle: document.getElementById('lessonTopTitle'),
        progress: document.getElementById('lessonProgress'),
        wordDisplay: document.getElementById('lessonWordDisplay'),
        input: document.getElementById('lessonInput'),
        hint: document.getElementById('lessonFingerHint'),
        fingerName: document.getElementById('fingerName'),
        fingerHand: document.getElementById('fingerHand'),
        keyboard: document.getElementById('keyboardView'),
        accuracy: document.getElementById('lessonAccuracy'),
        correct: document.getElementById('lessonCorrect'),
        wrong: document.getElementById('lessonWrong'),
        overlay: document.getElementById('lessonOverlay'),
        overlayClose: document.getElementById('lessonOverlayClose'),
        retryBtn: document.getElementById('lessonRetryBtn'),
        menuBtn: document.getElementById('lessonMenuBtn'),
        bestBadge: document.getElementById('lessonBestBadge'),
        resultAccuracy: document.getElementById('lessonResultAccuracy'),
        resultBest: document.getElementById('lessonResultBest'),
        resultCorrect: document.getElementById('lessonResultCorrect'),
        resultWrong: document.getElementById('lessonResultWrong')
      };

      this.renderLegend();
      this.renderMenu();
      this.renderKeyboard();
      this.bindEvents();
    }

    getScore(id) {
      const v = localStorage.getItem('ngetik.lesson.' + id);
      return v && !isNaN(parseInt(v, 10)) ? parseInt(v, 10) : null;
    }

    setScore(id, pct) {
      const prev = this.getScore(id);
      if (prev === null || pct > prev) {
        localStorage.setItem('ngetik.lesson.' + id, String(pct));
        this.renderMenu();
      }
    }

    renderLegend() {
      const wrap = this.el.legendFingers;
      wrap.innerHTML = '';
      ['l_pinky', 'l_ring', 'l_middle', 'l_index', 'r_index', 'r_middle', 'r_ring', 'r_pinky'].forEach(id => {
        const f = FINGERS[id];
        const chip = el('div', 'lesson-legend-chip');
        chip.style.setProperty('--kcolor', f.color);
        const dot = el('span', 'finger-dot');
        dot.style.background = f.color;
        dot.style.boxShadow = `0 0 8px ${rgba(f.color, 0.6)}`;
        const name = el('span');
        name.textContent = f.name;
        const mark = el('span', 'finger-home');
        mark.textContent = FINGER_HOME[id];
        chip.append(dot, name, mark);
        wrap.appendChild(chip);
      });
    }

    renderMenu() {
      const grid = this.el.grid;
      grid.innerHTML = '';
      let doneCount = 0;

      LESSONS.forEach(lesson => {
        const card = el('div', 'lesson-card');
        card.dataset.id = lesson.id;
        const score = this.getScore(lesson.id);
        const done = score !== null;
        if (done) {
          card.classList.add('done');
          doneCount++;
        }

        const icon = el('div', 'lesson-card-icon');
        icon.textContent = lesson.icon;
        const title = el('h3');
        title.textContent = lesson.title;
        const desc = el('p');
        desc.textContent = lesson.desc;
        const chips = el('div', 'lesson-keys');
        [...new Set(lesson.keys.split(''))].forEach(k => {
          const chip = el('span', 'mini-key');
          chip.textContent = k.toUpperCase();
          const f = FINGERS[KEY_FINGER[k]] || null;
          if (f) {
            chip.style.color = f.color;
            chip.style.borderColor = f.color;
            chip.title = f.name;
          }
          chips.appendChild(chip);
        });

        card.append(icon, title, desc, chips);
        if (done) {
          const badge = el('span', 'done-badge');
          badge.textContent = '✓ ' + score + '%';
          card.appendChild(badge);
        }
        grid.appendChild(card);
      });

      this.el.progressStrip.textContent = `Selesai ${doneCount}/${LESSONS.length} latihan`;
    }

    renderKeyboard() {
      const view = this.el.keyboard;
      view.innerHTML = '';

      KB_ROWS.forEach((row, ri) => {
        const rowEl = el('div', 'kb-row');
        if (ri === 4) rowEl.classList.add('kb-row-space');
        row.forEach(k => {
          const keyEl = el('div', 'kb-key');
          const isSpace = k === ' ';
          keyEl.textContent = isSpace ? 'SPASI' : k.toUpperCase();

          const f = FINGERS[KEY_FINGER[k]] || null;
          if (f) {
            keyEl.dataset.finger = f.id;
            keyEl.style.setProperty('--kcolor', f.color);
            keyEl.title = f.name;
          }
          if (!isSpace && HOME_KEYS.has(k)) keyEl.classList.add('home');
          if (isSpace) keyEl.classList.add('kb-space');

          this.keyEls[k] = keyEl;
          rowEl.appendChild(keyEl);
        });
        view.appendChild(rowEl);
      });
    }

    bindEvents() {
      const input = this.el.input;

      input.addEventListener('input', () => this.onInput());
      input.addEventListener('keydown', (e) => {
        if (e.key === ' ') {
          e.preventDefault();
          this.submit();
        } else if (e.key === 'Tab' || e.key === 'Escape') {
          e.preventDefault();
          this.backToMenu();
        }
      });
      input.addEventListener('focus', () => this.el.wordDisplay.classList.add('focused'));
      input.addEventListener('blur', () => this.el.wordDisplay.classList.remove('focused'));

      this.el.wordDisplay.addEventListener('click', () => input.focus());
      this.el.area.addEventListener('click', (e) => {
        if (!e.target.closest('#lessonBackBtn')) input.focus();
      });

      this.el.grid.addEventListener('click', (e) => {
        const card = e.target.closest('.lesson-card');
        if (card) this.startLesson(card.dataset.id);
      });

      this.el.backBtn.addEventListener('click', () => this.backToMenu());
      this.el.retryBtn.addEventListener('click', () => {
        if (this.currentLesson) this.startLesson(this.currentLesson.id);
      });
      this.el.menuBtn.addEventListener('click', () => this.backToMenu());
      this.el.overlayClose.addEventListener('click', () => this.backToMenu());
      this.el.overlay.addEventListener('click', (e) => {
        if (e.target === this.el.overlay) this.backToMenu();
      });
      this.el.overlay.tabIndex = -1;
      this.el.overlay.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' || e.key === 'Enter') this.backToMenu();
      });
    }

    startLesson(id) {
      const lesson = LESSONS.find(l => l.id === id);
      if (!lesson) return;

      this.currentLesson = lesson;
      this.state = {
        lesson: lesson,
        words: buildWords(lesson),
        index: 0,
        correctWords: 0,
        wrongWords: 0,
        charCorrect: 0,
        charWrong: 0,
        finished: false
      };

      this.el.topIcon.textContent = lesson.icon;
      this.el.topTitle.textContent = lesson.title;
      this.el.menu.classList.add('hidden');
      this.el.overlay.classList.add('hidden');
      this.el.area.classList.remove('hidden');
      this.el.input.value = '';
      this.el.input.disabled = false;

      this.updateProgress();
      this.renderWord();
      this.updateStats();

      setTimeout(() => this.el.input.focus(), 50);
    }

    currentInput() {
      return this.el.input.value.toLowerCase();
    }

    renderWord() {
      const s = this.state;
      const wordEl = this.el.wordDisplay;
      wordEl.innerHTML = '';

      const target = s.words[s.index];
      const typed = this.currentInput();

      const wordSpan = el('span', 'word current');
      target.split('').forEach((c, ci) => {
        const charSpan = el('span', 'char');
        charSpan.textContent = c;
        if (ci < typed.length) {
          charSpan.classList.add(typed[ci] === c ? 'correct' : 'incorrect');
        } else if (ci === typed.length) {
          charSpan.classList.add('current');
        }
        wordSpan.appendChild(charSpan);
      });

      if (typed.length > target.length) {
        for (let i = target.length; i < typed.length; i++) {
          const extra = el('span', 'char extra');
          extra.textContent = typed[i];
          wordSpan.appendChild(extra);
        }
      }

      wordEl.appendChild(wordSpan);
      this.highlightKey(target[typed.length] || null);
    }

    highlightKey(ch) {
      const active = this.el.keyboard.querySelector('.kb-key.active');
      if (active) active.classList.remove('active');

      if (!ch) {
        this.closeHint();
        this.setHandHighlight(null, null);
        return;
      }

      const keyEl = this.keyEls[ch];
      if (keyEl) {
        keyEl.classList.add('active');
        const f = FINGERS[KEY_FINGER[ch]] || null;
        if (f) {
          this.showHint(f);
          this.setHandHighlight(f.id, KEY_ROW[ch] !== undefined ? KEY_ROW[ch] : null);
        } else {
          this.closeHint();
          this.setHandHighlight(null, null);
        }
      } else {
        this.closeHint();
        this.setHandHighlight(null, null);
      }
    }

    setHandHighlight(fingerId, row) {
      document.querySelectorAll('.hand-finger').forEach(f => {
        const target = f.dataset.finger === fingerId;
        f.classList.toggle('active', target);
        f.classList.remove('reach-up', 'reach-down');
        if (target && row !== null) {
          if (row <= 1) f.classList.add('reach-up');
          else if (row === 3) f.classList.add('reach-down');
        }
      });
    }

    showHint(f) {
      this.el.hint.classList.remove('hidden');
      this.el.fingerName.textContent = f.name;
      this.el.fingerHand.textContent = f.hand;
      this.el.hint.style.borderColor = f.color;
      this.el.fingerName.style.background = rgba(f.color, 0.2);
      this.el.fingerName.style.color = f.color;
      this.el.hint.style.boxShadow = `0 0 16px ${rgba(f.color, 0.25)}`;
    }

    closeHint() {
      this.el.hint.classList.add('hidden');
      this.el.hint.style.boxShadow = '';
    }

    onInput() {
      const s = this.state;
      if (!s || s.finished) return;

      this.renderWord();
      this.updateStats();

      const target = s.words[s.index];
      const typed = this.currentInput();
      if (typed.length >= target.length && typed === target) {
        this.submit();
      }
    }

    submit() {
      const s = this.state;
      if (!s || s.finished) return;

      const target = s.words[s.index];
      const typed = this.currentInput();
      const isCorrect = typed === target;

      const len = Math.max(target.length, typed.length);
      for (let i = 0; i < len; i++) {
        if (i < target.length && i < typed.length && typed[i] === target[i]) s.charCorrect++;
        else s.charWrong++;
      }

      if (isCorrect) s.correctWords++;
      else s.wrongWords++;

      s.index++;
      this.el.input.value = '';
      this.updateProgress();
      this.updateStats();

      if (s.index >= s.words.length) {
        this.finish();
      } else {
        this.renderWord();
      }
    }

    updateProgress() {
      const s = this.state;
      this.el.progress.textContent = (s ? s.index : 0) + '/' + (s ? s.words.length : 25);
    }

    updateStats() {
      const s = this.state;
      if (!s) return;
      this.el.correct.textContent = s.correctWords;
      this.el.wrong.textContent = s.wrongWords;
      const total = s.charCorrect + s.charWrong;
      this.el.accuracy.textContent = total > 0 ? Math.round((s.charCorrect / total) * 100) : 100;
    }

    finish() {
      const s = this.state;
      s.finished = true;
      this.highlightKey(null);

      const total = s.charCorrect + s.charWrong;
      const accuracy = total > 0 ? Math.round((s.charCorrect / total) * 100) : 100;
      const prev = this.getScore(s.lesson.id);
      const isRecord = accuracy > 0 && (prev === null || accuracy > prev);
      if (isRecord) this.setScore(s.lesson.id, accuracy);

      this.el.resultAccuracy.textContent = accuracy + '%';
      this.el.resultBest.textContent = Math.max(prev || 0, accuracy) + '%';
      this.el.resultCorrect.textContent = s.correctWords;
      this.el.resultWrong.textContent = s.wrongWords;
      this.el.bestBadge.classList.toggle('hidden', !isRecord);

      this.el.input.blur();
      this.el.overlay.classList.remove('hidden');
      this.el.overlay.focus();
    }

    backToMenu() {
      this.state = null;
      this.el.input.value = '';
      this.el.area.classList.add('hidden');
      this.el.overlay.classList.add('hidden');
      this.el.menu.classList.remove('hidden');
      this.renderMenu();
    }
  }

  window.FingerLesson = FingerLesson;
})();