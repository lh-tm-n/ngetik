class TypingGame {
  constructor() {
    this.mode = null;
    this.score = 0;
    this.level = 1;
    this.lives = 5;
    this.maxLives = 5;
    this.combo = 0;
    this.maxCombo = 0;
    this.wordsTyped = 0;
    this.isRunning = false;
    this.gameLoop = null;
    this.spawnTimer = null;
    this.buzzTimer = null;
    this.buzzInterval = null;
    this.activeWords = [];
    this.wordSpeed = 1;
    this.spawnInterval = 2000;
    this.raceProgress = 0;
    this.BUZZ_DURATION = 30;
    this.WIN_LAPS = 3;

    this.elements = {
      gameMenu: document.getElementById('gameMenu'),
      gameArea: document.getElementById('gameArea'),
      gameField: document.getElementById('gameField'),
      gameInput: document.getElementById('gameInput'),
      gameScore: document.getElementById('gameScore'),
      gameLevel: document.getElementById('gameLevel'),
      gameLives: document.getElementById('gameLives'),
      gameCombo: document.getElementById('gameCombo'),
      gameLivesContainer: document.getElementById('gameLivesContainer'),
      gameTimerContainer: document.getElementById('gameTimerContainer'),
      gameTimeLeft: document.getElementById('gameTimeLeft'),
      gameBackBtn: document.getElementById('gameBackBtn'),
      gameOverOverlay: document.getElementById('gameOverOverlay'),
      gameOverTitle: document.getElementById('gameOverTitle'),
      gameOverScore: document.getElementById('gameOverScore'),
      gameOverLevel: document.getElementById('gameOverLevel'),
      gameOverWords: document.getElementById('gameOverWords'),
      gameOverBestCombo: document.getElementById('gameOverBestCombo'),
      gameOverBest: document.getElementById('gameOverBest'),
      gameOverClose: document.getElementById('gameOverClose'),
      gameRestartBtn: document.getElementById('gameRestartBtn'),
      gameMenuBtn: document.getElementById('gameMenuBtn'),
    };

    this.bindEvents();
  }

  bindEvents() {
    document.querySelectorAll('.game-mode-card').forEach(card => {
      card.addEventListener('click', () => {
        this.mode = card.dataset.game;
        this.startGame();
      });
    });

    this.elements.gameInput.addEventListener('input', (e) => this.onInput(e));
    this.elements.gameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.backToMenu();
      if (e.key === 'Tab') e.preventDefault();
    });

    this.elements.gameBackBtn.addEventListener('click', () => this.backToMenu());
    this.elements.gameRestartBtn.addEventListener('click', () => this.startGame());
    this.elements.gameMenuBtn.addEventListener('click', () => this.backToMenu());

    this.elements.gameOverOverlay.tabIndex = -1;
    this.elements.gameOverOverlay.addEventListener('click', (e) => {
      if (e.target === this.elements.gameOverOverlay) this.backToMenu();
    });
    this.elements.gameOverOverlay.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.backToMenu();
    });
    this.elements.gameOverClose.addEventListener('click', () => this.backToMenu());
  }

  getRandomWord() {
    let pool = WORD_LISTS.mixed;
    if (this.level >= 4) pool = WORD_LISTS.hard;
    else if (this.level >= 2) pool = WORD_LISTS.medium;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  startGame() {
    this.score = 0;
    this.level = 1;
    this.lives = this.maxLives;
    this.combo = 0;
    this.maxCombo = 0;
    this.wordsTyped = 0;
    this.isRunning = true;
    this.activeWords = [];
    this.wordSpeed = 1;
    this.spawnInterval = 2000;
    this.raceProgress = 0;

    this.elements.gameMenu.classList.add('hidden');
    this.elements.gameOverOverlay.classList.add('hidden');
    this.elements.gameArea.classList.remove('hidden');
    this.elements.gameField.innerHTML = '';
    this.elements.gameInput.value = '';
    this.elements.gameTimeLeft.textContent = this.BUZZ_DURATION;
    this.elements.gameOverBest.classList.add('hidden');

    this.elements.gameTimerContainer.classList.toggle('hidden', this.mode !== 'buzz');
    this.elements.gameLivesContainer.classList.toggle('hidden', this.mode === 'buzz');

    if (this.mode === 'race') {
      this.setupRace();
    }

    this.updateHUD();
    this.gameLoop = requestAnimationFrame((t) => this.loop(t));
    this.startSpawning();

    if (this.mode === 'buzz') {
      this.startBuzzTimer();
    }

    setTimeout(() => this.elements.gameInput.focus(), 100);
  }

  setupRace() {
    this.raceProgress = 0;
    const car = document.createElement('div');
    car.className = 'race-car';
    car.id = 'raceCar';
    car.innerHTML = '<span class="race-car-emoji">🏎️</span>';
    car.style.left = '30px';

    const track = document.createElement('div');
    track.className = 'race-track';

    const flag = document.createElement('div');
    flag.className = 'race-flag';
    flag.textContent = '🏁';

    const finishLine = document.createElement('div');
    finishLine.id = 'finishLine';
    finishLine.style.cssText = 'position:absolute;right:60px;top:0;bottom:0;width:4px;background:repeating-linear-gradient(to bottom,#fff 0,#fff 10px,#000 10px,#000 20px);';

    this.elements.gameField.appendChild(track);
    this.elements.gameField.appendChild(finishLine);
    this.elements.gameField.appendChild(flag);
    this.elements.gameField.appendChild(car);
  }

  clearTimers() {
    if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
    if (this.spawnTimer) clearTimeout(this.spawnTimer);
    if (this.buzzTimer) clearTimeout(this.buzzTimer);
    if (this.buzzInterval) clearInterval(this.buzzInterval);
    this.gameLoop = null;
    this.spawnTimer = null;
    this.buzzTimer = null;
    this.buzzInterval = null;
  }

  startBuzzTimer() {
    const start = Date.now();
    this.buzzInterval = setInterval(() => {
      if (!this.isRunning) return;
      const left = Math.max(0, this.BUZZ_DURATION - Math.floor((Date.now() - start) / 1000));
      this.elements.gameTimeLeft.textContent = left;
    }, 200);

    this.buzzTimer = setTimeout(() => {
      if (this.isRunning) this.finishBuzz();
    }, this.BUZZ_DURATION * 1000);
  }

  loop(timestamp) {
    if (!this.isRunning) return;

    this.update(timestamp);
    this.gameLoop = requestAnimationFrame((t) => this.loop(t));
  }

  update(timestamp) {
    if (this.mode === 'falling') this.updateFalling(timestamp);
    else if (this.mode === 'race') this.updateRace(timestamp);
    else if (this.mode === 'survival') this.updateSurvival(timestamp);
  }

  updateFalling(timestamp) {
    const fieldHeight = this.elements.gameField.clientHeight;

    this.activeWords.forEach((w) => {
      if (w.removed) return;
      w.y += w.speed;
      w.element.style.top = w.y + 'px';

      if (w.y >= fieldHeight - 40) {
        this.missWord(w);
      }
    });

    this.activeWords = this.activeWords.filter(w => !w.removed);
  }

  updateRace(timestamp) {
    const fieldWidth = this.elements.gameField.clientWidth;
    const car = document.getElementById('raceCar');
    if (!car) return;

    const target = fieldWidth - 90;
    car.style.left = (30 + Math.min(this.raceProgress, target)) + 'px';

    if (this.raceProgress >= target) {
      this.levelUp();
      this.raceProgress = 0;

      if (this.level > this.WIN_LAPS) {
        this.gameOver('🏆 Kamu Menang!');
        return;
      }

      const lap = document.createElement('div');
      lap.className = 'float-score';
      lap.textContent = 'Lap ' + (this.level - 1) + ' selesai!';
      lap.style.left = 'calc(50% - 60px)';
      lap.style.top = '40%';
      lap.style.color = 'var(--accent-orange)';
      lap.classList.add('lap-msg');
      this.elements.gameField.appendChild(lap);
      setTimeout(() => lap.remove(), 1200);
    }
  }

  updateSurvival(timestamp) {
    const fieldHeight = this.elements.gameField.clientHeight;

    this.activeWords.forEach((w) => {
      if (w.removed) return;
      w.y += w.speed;
      w.element.style.top = w.y + 'px';

      if (w.y >= fieldHeight - 40) {
        this.missWord(w);
      }
    });

    this.activeWords = this.activeWords.filter(w => !w.removed);
  }

  spawnWord() {
    if (!this.isRunning) return;

    const word = this.getRandomWord();
    const fieldWidth = this.elements.gameField.clientWidth;
    const fieldHeight = this.elements.gameField.clientHeight;

    const el = document.createElement('div');
    el.className = 'game-word';
    el.textContent = word;
    this.elements.gameField.appendChild(el);

    const x = Math.max(20, Math.min(fieldWidth - el.offsetWidth - 60, 20 + Math.random() * (fieldWidth - el.offsetWidth - 60)));

    const wData = {
      text: word,
      element: el,
      x: x,
      y: -30,
      speed: this.wordSpeed,
      removed: false,
    };

    if (this.mode === 'falling' || this.mode === 'survival') {
      el.style.left = x + 'px';
      el.style.top = '-30px';
    } else if (this.mode === 'race') {
      el.style.left = x + 'px';
      el.style.top = (60 + Math.random() * (fieldHeight - 160)) + 'px';
    } else if (this.mode === 'buzz') {
      el.style.left = x + 'px';
      el.style.top = (40 + Math.random() * (fieldHeight - 120)) + 'px';
    }

    this.activeWords.push(wData);

    if (this.mode === 'race' || this.mode === 'buzz') {
      while (this.activeWords.filter(w => !w.removed).length > 12) {
        const oldest = this.activeWords.find(w => !w.removed);
        if (!oldest) break;
        oldest.removed = true;
        oldest.element.classList.add('missed');
        setTimeout(() => oldest.element.remove(), 500);
      }
    }
  }

  missWord(w) {
    w.removed = true;
    w.element.classList.add('missed');
    setTimeout(() => w.element.remove(), 500);

    this.lives--;
    this.combo = 0;
    this.updateHUD();

    if (this.lives <= 0) {
      this.gameOver();
    }
  }

  matchWord(w) {
    w.removed = true;
    w.element.classList.add('matched');
    setTimeout(() => w.element.remove(), 400);

    this.combo++;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    this.wordsTyped++;

    if (this.mode === 'race') {
      this.raceProgress += Math.min(85, 50 + this.combo * 3);
    }

    const comboMultiplier = Math.min(this.combo, 10);
    const points = 10 * comboMultiplier;
    this.score += points;

    this.showFloatingScore(w.element, points);
    this.showCombo();

    this.elements.gameInput.value = '';
    this.updateHUD();
  }

  showFloatingScore(element, points) {
    const rect = element.getBoundingClientRect();
    const fieldRect = this.elements.gameField.getBoundingClientRect();

    const floater = document.createElement('div');
    floater.className = 'float-score';
    floater.textContent = '+' + points;
    floater.style.left = (rect.left - fieldRect.left) + 'px';
    floater.style.top = (rect.top - fieldRect.top) + 'px';
    this.elements.gameField.appendChild(floater);

    setTimeout(() => floater.remove(), 1000);
  }

  showCombo() {
    let comboDisplay = document.getElementById('comboDisplay');
    if (!comboDisplay) {
      comboDisplay = document.createElement('div');
      comboDisplay.className = 'combo-display';
      comboDisplay.id = 'comboDisplay';
      this.elements.gameField.appendChild(comboDisplay);
    }

    if (this.combo >= 3) {
      comboDisplay.textContent = '🔥 x' + this.combo;
      comboDisplay.classList.remove('active');
      void comboDisplay.offsetWidth;
      comboDisplay.classList.add('active');
    } else {
      comboDisplay.classList.remove('active');
    }
  }

  onInput(e) {
    if (!this.isRunning) return;

    const typed = this.elements.gameInput.value.trim().toLowerCase();

    if (typed.length === 0) {
      this.clearTargeting();
      return;
    }

    let matched = null;

    for (const w of this.activeWords) {
      if (w.removed) continue;
      if (w.text === typed) {
        matched = w;
        break;
      }
    }

    if (matched) {
      this.matchWord(matched);
      return;
    }

    this.clearTargeting();

    for (const w of this.activeWords) {
      if (w.removed) continue;
      if (w.text.startsWith(typed)) {
        w.element.classList.add('targeted');
      }
    }
  }

  clearTargeting() {
    this.activeWords.forEach(w => {
      if (!w.removed) w.element.classList.remove('targeted');
    });
  }

  levelUp() {
    this.level++;
    this.wordSpeed += 0.3;
    this.spawnInterval = Math.max(400, this.spawnInterval - 200);

    if (this.mode === 'survival') {
      this.wordSpeed += 0.2;
      this.spawnInterval = Math.max(300, this.spawnInterval - 150);
    }

    if (this.mode !== 'race' && this.mode !== 'buzz') {
      if (this.level % 3 === 0 && this.lives < this.maxLives) {
        this.lives++;
      }
    }

    this.updateHUD();
  }

  updateHUD() {
    this.elements.gameScore.textContent = this.score;
    this.elements.gameLevel.textContent = this.level;
    this.elements.gameCombo.textContent = this.combo > 0 ? 'x' + this.combo : 'x1';

    let hearts = '';
    for (let i = 0; i < this.lives; i++) hearts += '❤️';
    for (let i = this.lives; i < this.maxLives; i++) hearts += '🖤';
    this.elements.gameLives.textContent = hearts;

    if (this.combo >= 5) {
      this.elements.gameCombo.style.color = 'var(--accent-orange)';
    } else if (this.combo >= 3) {
      this.elements.gameCombo.style.color = 'var(--accent-green)';
    } else {
      this.elements.gameCombo.style.color = '';
    }
  }

  getBestKey() {
    return 'ngetik.game.best.' + this.mode;
  }

  getBest() {
    const v = parseInt(localStorage.getItem(this.getBestKey()) || '0', 10);
    return isNaN(v) ? 0 : v;
  }

  saveBest() {
    const prevBest = this.getBest();
    const isRecord = this.score > prevBest && this.score > 0;
    if (isRecord) localStorage.setItem(this.getBestKey(), String(this.score));
    return isRecord;
  }

  finishBuzz() {
    this.gameOver('Waktu Habis!');
  }

  gameOver(title) {
    this.isRunning = false;
    this.clearTimers();

    this.activeWords.forEach(w => {
      if (!w.removed) w.element.remove();
    });
    this.activeWords = [];

    const isRecord = this.saveBest();
    this.elements.gameOverBest.classList.toggle('hidden', !isRecord);

    this.elements.gameOverTitle.textContent = title || 'Game Over!';
    this.elements.gameOverScore.textContent = this.score;
    this.elements.gameOverLevel.textContent = this.level;
    this.elements.gameOverWords.textContent = this.wordsTyped;
    this.elements.gameOverBestCombo.textContent = 'x' + this.maxCombo;

    setTimeout(() => {
      this.elements.gameOverOverlay.classList.remove('hidden');
      this.elements.gameOverOverlay.focus();
    }, 500);
  }

  backToMenu() {
    this.isRunning = false;
    this.clearTimers();

    this.activeWords.forEach(w => {
      if (!w.removed) w.element.remove();
    });
    this.activeWords = [];

    this.elements.gameArea.classList.add('hidden');
    this.elements.gameOverOverlay.classList.add('hidden');
    this.elements.gameMenu.classList.remove('hidden');
  }

  startSpawning() {
    const isBuzz = this.mode === 'buzz';
    const spawn = () => {
      if (!this.isRunning) return;
      this.spawnWord();
      const cap = Math.max(400, this.spawnInterval - (this.level * 80));
      const interval = isBuzz ? Math.max(500, cap) : cap;
      this.spawnTimer = setTimeout(spawn, interval);
    };
    spawn();
  }
}