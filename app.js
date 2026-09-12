document.addEventListener('DOMContentLoaded', () => {
  const test = new TypingTest();
  const game = new TypingGame();
  const lesson = new FingerLesson();

  // Navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const page = btn.dataset.page;
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

      if (page === 'test') {
        document.getElementById('testPage').classList.add('active');
        test.reset();
      } else if (page === 'lesson') {
        document.getElementById('lessonPage').classList.add('active');
        lesson.backToMenu();
      } else if (page === 'game') {
        document.getElementById('gamePage').classList.add('active');
        game.backToMenu();
      }
    });
  });

  // Test mode config (time/words)
  document.querySelectorAll('.config-btn[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.config-btn[data-mode]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const mode = btn.dataset.mode;
      test.setMode(mode);

      document.getElementById('timeConfig').classList.toggle('hidden', mode !== 'time');
      document.getElementById('wordsConfig').classList.toggle('hidden', mode !== 'words');
    });
  });

  // Time config
  document.querySelectorAll('#timeConfig .config-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#timeConfig .config-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      test.setTime(parseInt(btn.dataset.value));
    });
  });

  // Words config
  document.querySelectorAll('#wordsConfig .config-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#wordsConfig .config-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      test.setWordCount(parseInt(btn.dataset.value));
    });
  });

  // Difficulty config
  document.querySelectorAll('.config-btn[data-difficulty]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.config-btn[data-difficulty]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      test.setDifficulty(btn.dataset.difficulty);
    });
  });

  // Start
  test.reset();
});
