# Ngetik — Tes Ketik Bahasa Indonesia

Aplikasi web sederhana buat latihan ngetik sepuluh jari dan ngukur kecepatan (WPM) dalam Bahasa Indonesia. Proyek ini sengaja dibikin vanilla—tanpa framework, tanpa library eksternal, murni pakai HTML, CSS, dan JavaScript biasa. Jadi sangat ringan, nggak perlu di-build, dan bisa langsung jalan di browser.

---

## Fitur

Aplikasi ini punya tiga menu utama yang bisa dipakai sesuai kebutuhan:

### Typing Test
Mode buat ngukur kecepatan dan akurasi ngetik. Bisa diatur berdasarkan durasi (15, 30, 60, atau 120 detik) atau jumlah kata (10, 25, 50, atau 100 kata). Ada berbagai tingkat kesulitan mulai dari kata-kata mudah sampai ngetik kalimat utuh. Lengkap dengan indikator huruf benar/salah, peringatan Caps Lock, statistik live, dan grafik performa di akhir tes. Rekor terbaik bakal otomatis tersimpan.

### Dasar Jari (Penempatan Jari QWERTY)
Cocok buat yang baru belajar ngetik 10 jari. Ada keyboard visual dan animasi jari (murni pakai CSS) yang ngasih panduan tombol mana yang harus ditekan pakai jari apa. Latihannya ada 10 tahap bertahap, dari posisi istirahat (home row) sampai gabungan semua jari.

### Typing Game
Biar nggak bosen, ada 4 mini-game santai: Kata Jatuh, Balapan Ketik, Survival, dan Speed Buzz. Semuanya lengkap dengan sistem skor, level, combo, dan nyawa.

---

## Teknologi

- HTML5 — struktur halaman utama (single page).
- CSS3 — styling, tema gelap, CSS variables, dan animasi tangan/jari tanpa JS tambahan.
- JavaScript ES6 — pakai pendekatan OOP ringan (TypingTest, TypingGame, FingerLesson), murni tanpa library.
- localStorage — buat nyimpen rekor skor dan progres latihan di browser biar nggak hilang pas di-refresh.
- Font — menggunakan JetBrains Mono dan Inter.

> Karena nggak pakai build tools, semua asetnya tetap ringan dan langsung dimuat dari file lokal oleh browser.

---

## Struktur Berkas

```text
ngetik/
├── index.html   # Struktur utama antarmuka
├── style.css    # Styling, dark mode, animasi, & responsif
├── words.js     # Database kata dan kalimat Bahasa Indonesia
├── test.js      # Logic untuk mode Typing Test
├── game.js      # Logic untuk mini-games
├── lesson.js    # Logic untuk panduan posisi jari
└── app.js       # Entry point buat navigasi antar menu