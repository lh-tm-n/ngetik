class TypingTest {
  constructor() {
    this.words = [];
    this.wordResults = [];
    this.typedWords = [];
    this.sentences = [];
    this.sentenceStarts = [];
    this.currentWordIndex = 0;
    this.correctWords = 0;
    this.wrongWords = 0;
    this.totalCharsTyped = 0;
    this.startTime = null;
    this.timer = null;
    this.isRunning = false;
    this.isFinished = false;
    this.mode = 'time';
    this.timeLimit = 30;
    this.wordLimit = 25;
    this.difficulty = 'mixed';
    this.timeRemaining = 30;
    this.wpmHistory = [];
    this.lastPushSec = 0;
    this._lastSentence = -1;

    this.elements = {
      wordDisplay: document.getElementById('wordDisplay'),
      typingInput: document.getElementById('typingInput'),
      typingContainer: document.getElementById('typingContainer'),
      timerFill: document.getElementById('timerFill'),
      timerText: document.getElementById('timerText'),
      liveWpm: document.getElementById('liveWpm'),
      liveAccuracy: document.getElementById('liveAccuracy'),
      liveCorrect: document.getElementById('liveCorrect'),
      liveWrong: document.getElementById('liveWrong'),
      resultsOverlay: document.getElementById('resultsOverlay'),
      retryBtn: document.getElementById('retryBtn'),
      resultBest: document.getElementById('resultBest'),
      resultClose: document.getElementById('resultClose'),
      capsWarning: document.getElementById('capsWarning'),
    };

    this.bindEvents();
    this.updateHeaderStats();
  }

  bindEvents() {
    this.elements.typingInput.addEventListener('input', (e) => this.onInput(e));
    this.elements.typingInput.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        this.reset();
      } else if (this.isFinished && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        this.reset();
      } else if (e.key === ' ' || e.key === 'Enter') {
        if (e.key === ' ') {
          const targetWord = this.words[this.currentWordIndex];
          const typedLen = this.elements.typingInput.value.length;
          if (targetWord && typedLen < targetWord.length && targetWord[typedLen] === ' ') {
            return;
          }
        }
        e.preventDefault();
        this.submitWord();
      }

      try {
        if (e.getModifierState) {
          this.elements.capsWarning.classList.toggle('hidden', !e.getModifierState('CapsLock'));
        }
      } catch (err) { /* windows bangs often throw on getModifierState */ }
    });
    this.elements.typingContainer.addEventListener('click', () => {
      this.elements.typingInput.focus();
      this.elements.typingContainer.classList.add('focused');
    });
    this.elements.retryBtn.addEventListener('click', () => {
      this.elements.resultsOverlay.classList.add('hidden');
      this.reset();
    });

    this.elements.resultClose.addEventListener('click', () => this.reset());
    this.elements.resultsOverlay.tabIndex = -1;
    this.elements.resultsOverlay.addEventListener('click', (e) => {
      if (e.target === this.elements.resultsOverlay) this.reset();
    });
    this.elements.resultsOverlay.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'Enter') this.reset();
    });
  }

  generateWords() {
    const count = this.mode === 'words'
      ? this.wordLimit + 15
      : Math.max(100, Math.ceil(this.timeLimit * 6) + 20);

    this.words = [];
    this.wordResults = [];
    this.typedWords = [];
    this.sentences = [];
    this.sentenceStarts = [];

    if (this.difficulty === 'sentence') {
      while (this.words.length < count) {
        const sentence = SENTENCES_ID[Math.floor(Math.random() * SENTENCES_ID.length)];
        this.sentences.push(sentence);
        this.sentenceStarts.push(this.words.length);
        sentence.split(' ').forEach((w) => {
          if (this.words.length >= count) return;
          this.words.push(w);
          this.wordResults.push(null);
          this.typedWords.push('');
        });
      }
      return;
    }

    const wordPool = this.difficulty === 'easy'
      ? WORD_LISTS.easy
      : this.difficulty === 'hard'
        ? WORD_LISTS.hard
        : WORD_LISTS.mixed;

    while (this.words.length < count) {
      const word = wordPool[Math.floor(Math.random() * wordPool.length)];
      this.words.push(word);
      this.wordResults.push(null);
      this.typedWords.push('');
    }
  }

  renderWords() {
    const display = this.elements.wordDisplay;
    display.innerHTML = '';

    let start;
    let end;
    if (this.difficulty === 'sentence' && this.sentenceStarts.length) {
      const s = this.currentSentenceIndex();
      start = this.sentenceStarts[s];
      end = s + 1 < this.sentenceStarts.length ? this.sentenceStarts[s + 1] : this.words.length;
    } else {
      start = Math.max(0, this.currentWordIndex - 2);
      end = Math.min(this.words.length, this.currentWordIndex + 15);
    }

    for (let i = start; i < end; i++) {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'word';
      if (i === this.currentWordIndex) {
        wordSpan.classList.add('current');
      } else if (i < this.currentWordIndex) {
        const typed = this.typedWords[i] || '';
        if (typed === this.words[i]) wordSpan.classList.add('correct');
        else wordSpan.classList.add('incorrect');

        const len = Math.max(this.words[i].length, typed.length);
        for (let ci = 0; ci < len; ci++) {
          const charSpan = document.createElement('span');
          charSpan.className = 'char';
          charSpan.textContent = typed[ci] !== undefined ? typed[ci] : this.words[i][ci];

          if (ci < this.words[i].length && ci < typed.length) {
            charSpan.classList.add(typed[ci] === this.words[i][ci] ? 'correct' : 'incorrect');
          } else if (ci >= typed.length && ci < this.words[i].length) {
            charSpan.classList.add('incorrect');
          } else if (ci >= this.words[i].length) {
            charSpan.classList.add('incorrect', 'extra');
          }
          wordSpan.appendChild(charSpan);
        }
      }

      if (i === this.currentWordIndex) {
        const chars = this.words[i].split('');
        chars.forEach((char, ci) => {
          const charSpan = document.createElement('span');
          charSpan.className = 'char';
          charSpan.textContent = char;

          const typed = this.elements.typingInput.value;
          if (ci < typed.length) {
            charSpan.classList.add(typed[ci] === char ? 'correct' : 'incorrect');
          } else if (ci === typed.length) {
            charSpan.classList.add('current');
          }

          wordSpan.appendChild(charSpan);
        });

        const typed = this.elements.typingInput.value;
        if (typed.length > this.words[i].length) {
          for (let ei = this.words[i].length; ei < typed.length; ei++) {
            const extra = document.createElement('span');
            extra.className = 'char extra';
            extra.textContent = typed[ei];
            wordSpan.appendChild(extra);
          }
        }
      }

      const space = document.createTextNode(' ');
      display.appendChild(wordSpan);
      display.appendChild(space);
    }

    this.updateSentenceInfo();
  }

  currentSentenceIndex() {
    let s = 0;
    for (let j = this.sentenceStarts.length - 1; j >= 0; j--) {
      if (this.sentenceStarts[j] <= this.currentWordIndex) {
        s = j;
        break;
      }
    }
    return s;
  }

  updateSentenceInfo() {
    const counter = document.getElementById('sentenceCounter');
    const display = this.elements.wordDisplay;
    if (!counter) return;

    const isSentence = this.difficulty === 'sentence';
    counter.classList.toggle('hidden', !isSentence);
    display.classList.toggle('sentence-mode', isSentence);

    if (isSentence) {
      const s = this.currentSentenceIndex();
      counter.textContent = 'Kalimat ke-' + (s + 1) + ' dari ' + this.sentences.length;

      if (this._lastSentence !== s) {
        this._lastSentence = s;
        display.classList.remove('sentence-switch');
        void display.offsetWidth;
        display.classList.add('sentence-switch');
      }
    } else {
      this._lastSentence = -1;
    }
  }

  compareWord(target, typed) {
    let correct = 0;
    let incorrect = 0;
    const len = Math.max(target.length, typed.length);
    for (let i = 0; i < len; i++) {
      if (i < target.length && i < typed.length && typed[i] === target[i]) correct++;
      else incorrect++;
    }
    return { correct, incorrect };
  }

  computeTypingStats() {
    let correct = 0;
    let incorrect = 0;

    for (let i = 0; i < this.currentWordIndex; i++) {
      const pair = this.compareWord(this.words[i], this.typedWords[i] || '');
      correct += pair.correct;
      incorrect += pair.incorrect;
    }

    if (this.isRunning && !this.isFinished && this.currentWordIndex < this.words.length) {
      const pair = this.compareWord(this.words[this.currentWordIndex], this.elements.typingInput.value);
      correct += pair.correct;
      incorrect += pair.incorrect;
    }

    return { correct, incorrect, total: correct + incorrect };
  }

  currentWpm() {
    if (!this.startTime) return 0;
    const minutes = (Date.now() - this.startTime) / 60000;
    if (minutes <= 0) return 0;
    return Math.round((this.computeTypingStats().correct / 5) / minutes);
  }

  onInput(e) {
    if (this.isFinished) return;

    if (!this.isRunning && this.elements.typingInput.value.length > 0) {
      this.start();
    }

    const value = this.elements.typingInput.value;
    if (/[A-Z]/.test(value)) {
      this.elements.capsWarning.classList.remove('hidden');
    } else {
      this.elements.capsWarning.classList.add('hidden');
    }

    this.renderWords();
    this.updateLiveStats();
  }

  submitWord() {
    const typed = this.elements.typingInput.value;

    if (!this.isRunning && typed.length > 0) {
      this.start();
    }

    if (typed.length > 0) {
      this.checkWord(typed);
    }

    this.elements.typingInput.value = '';
    this.elements.capsWarning.classList.add('hidden');
    this.renderWords();
    this.updateLiveStats();
  }

  checkWord(typed) {
    const target = this.words[this.currentWordIndex];
    if (!target) {
      this.finish();
      return;
    }

    const isCorrect = typed === target;

    this.wordResults[this.currentWordIndex] = isCorrect;
    this.typedWords[this.currentWordIndex] = typed;

    if (isCorrect) {
      this.correctWords++;
    } else {
      this.wrongWords++;
    }

    this.totalCharsTyped += typed.length;
    this.currentWordIndex++;

    if (this.mode === 'words' && this.currentWordIndex >= this.wordLimit) {
      this.finish();
    } else if (this.currentWordIndex >= this.words.length) {
      this.finish();
    }
  }

  start() {
    this.isRunning = true;
    this.startTime = Date.now();
    this.timeRemaining = this.timeLimit;
    this.lastPushSec = 0;

    if (this.mode === 'time') {
      this.timer = setInterval(() => this.tick(), 100);
    }
  }

  tick() {
    const elapsed = (Date.now() - this.startTime) / 1000;
    this.timeRemaining = Math.max(0, this.timeLimit - elapsed);

    const pct = (this.timeRemaining / this.timeLimit) * 100;
    this.elements.timerFill.style.width = pct + '%';
    this.elements.timerText.textContent = Math.ceil(this.timeRemaining);

    if (this.timeRemaining <= 5) {
      this.elements.timerFill.style.background = 'var(--incorrect)';
    } else {
      this.elements.timerFill.style.background = '';
    }

    const curSec = Math.floor(elapsed);
    if (curSec !== this.lastPushSec) {
      this.lastPushSec = curSec;
      this.wpmHistory.push(this.currentWpm());
    }

    this.updateLiveStats();

    if (this.timeRemaining <= 0) {
      this.finish();
    }
  }

  updateLiveStats() {
    if (!this.startTime) {
      this.elements.liveWpm.textContent = '0';
      this.elements.liveAccuracy.textContent = '100';
      this.elements.liveCorrect.textContent = '0';
      this.elements.liveWrong.textContent = '0';
      return;
    }

    const wpm = this.currentWpm();
    const { correct, incorrect } = this.computeTypingStats();
    const totalTyped = correct + incorrect;
    const accuracy = totalTyped > 0 ? Math.round((correct / totalTyped) * 100) : 100;

    this.elements.liveWpm.textContent = wpm;
    this.elements.liveAccuracy.textContent = accuracy;
    this.elements.liveCorrect.textContent = this.correctWords;
    this.elements.liveWrong.textContent = this.wrongWords;
  }

  getBestKey() {
    return this.mode === 'time'
      ? `ngetik.best.${this.timeLimit}s`
      : `ngetik.best.${this.wordLimit}w`;
  }

  getBest() {
    const v = parseInt(localStorage.getItem(this.getBestKey()) || '0', 10);
    return isNaN(v) ? 0 : v;
  }

  saveBest(wpm) {
    const key = this.getBestKey();
    const prevBest = this.getBest();
    const isRecord = wpm > prevBest && wpm > 0;
    if (isRecord) localStorage.setItem(key, String(wpm));

    const overallKey = 'ngetik.best.test';
    const prevOverall = parseInt(localStorage.getItem(overallKey) || '0', 10);
    if (wpm > prevOverall) localStorage.setItem(overallKey, String(wpm));

    this.updateHeaderStats();
    return isRecord;
  }

  updateHeaderStats() {
    const best = parseInt(localStorage.getItem('ngetik.best.test') || '0', 10);
    const el = document.getElementById('headerStats');
    if (el) el.textContent = best > 0 ? 'Rekor: ' + best + ' WPM' : 'Rekor: —';
  }

  finish() {
    this.isFinished = true;
    this.isRunning = false;
    if (this.timer) clearInterval(this.timer);

    const elapsed = this.startTime ? (Date.now() - this.startTime) / 1000 : this.timeLimit;
    const minutes = elapsed / 60;
    const { correct, incorrect } = this.computeTypingStats();
    const totalTyped = correct + incorrect;
    const wpm = minutes > 0 ? Math.round((correct / 5) / minutes) : 0;
    const accuracy = totalTyped > 0 ? Math.round((correct / totalTyped) * 100) : 100;
    const chars = this.words.slice(0, this.currentWordIndex).reduce((sum, w) => sum + w.length, 0);

    const isRecord = this.saveBest(wpm);
    this.elements.resultBest.classList.toggle('hidden', !isRecord);

    document.getElementById('resultWpm').textContent = wpm;
    document.getElementById('resultAccuracy').textContent = accuracy + '%';
    document.getElementById('resultCorrect').textContent = this.correctWords;
    document.getElementById('resultWrong').textContent = this.wrongWords;
    document.getElementById('resultChars').textContent = chars;
    document.getElementById('resultTime').textContent = Math.round(elapsed) + 's';

    this.wpmHistory.push(wpm);
    this.renderWpmGraph();

    setTimeout(() => {
      this.elements.resultsOverlay.classList.remove('hidden');
      this.elements.resultsOverlay.focus();
    }, 300);
  }

  renderWpmGraph() {
    const container = document.getElementById('wpmGraph');
    container.innerHTML = '';

    if (this.wpmHistory.length === 0) return;

    const maxWpm = Math.max(...this.wpmHistory, 1);
    const step = Math.max(1, Math.floor(this.wpmHistory.length / 40));
    const sampled = this.wpmHistory.filter((_, i) => i % step === 0);

    sampled.forEach((wpm) => {
      const bar = document.createElement('div');
      bar.className = 'wpm-bar';
      bar.style.height = Math.max(4, (wpm / maxWpm) * 80) + 'px';
      container.appendChild(bar);
    });
  }

  reset() {
    if (this.timer) clearInterval(this.timer);

    this.currentWordIndex = 0;
    this.correctWords = 0;
    this.wrongWords = 0;
    this.totalCharsTyped = 0;
    this.startTime = null;
    this.isRunning = false;
    this.isFinished = false;
    this.wpmHistory = [];
    this.timeRemaining = this.timeLimit;
    this.sentences = [];
    this.sentenceStarts = [];
    this._lastSentence = -1;

    this.generateWords();
    this.renderWords();

    this.elements.typingInput.value = '';
    this.elements.timerFill.style.width = '100%';
    this.elements.timerFill.style.background = '';
    this.elements.timerText.textContent = this.timeLimit;
    this.elements.resultsOverlay.classList.add('hidden');
    this.elements.resultBest.classList.add('hidden');
    this.elements.capsWarning.classList.add('hidden');

    this.updateLiveStats();

    setTimeout(() => {
      this.elements.typingInput.focus();
    }, 100);
  }

  setMode(mode) {
    this.mode = mode;
    this.reset();
  }

  setTime(seconds) {
    this.timeLimit = seconds;
    this.timeRemaining = seconds;
    this.reset();
  }

  setWordCount(count) {
    this.wordLimit = count;
    this.reset();
  }

  setDifficulty(diff) {
    this.difficulty = diff;
    this.reset();
  }
}