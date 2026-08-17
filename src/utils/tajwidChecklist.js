// Checklist Evaluasi Tajwid & Makhraj Terstruktur untuk Penilaian Baca Al-Qur'an
export const TAJWID_CATEGORIES = [
  {
    id: 'kelancaran',
    name: 'Kelancaran & Adab',
    icon: '🗣️',
    items: [
      { text: 'Bacaan Rapi & Tartil 🌟', type: 'positive' },
      { text: 'Tergesa-gesa / Kurang Lancar', type: 'eval' },
      { text: 'Terbata-bata / Sering Mengulang Kata', type: 'eval' },
      { text: 'Suara Kurang Jelas / Terlalu Pelan', type: 'eval' },
    ],
  },
  {
    id: 'makhraj',
    name: 'Makhraj (Tempat Keluar Huruf)',
    icon: '👄',
    items: [
      { text: 'Makhraj & Sifat Huruf Sangat Baik 🌟', type: 'positive' },
      { text: 'Makhraj \'Ain / Ha\' / Kha\' Tertukar', type: 'eval' },
      { text: 'Makhraj Ta\' / Tha\' / Dal / Dzal Tertukar', type: 'eval' },
      { text: 'Makhraj Sin / Syin / Tsa Tertukar', type: 'eval' },
      { text: 'Makhraj Qaf / Kaf Tertukar', type: 'eval' },
      { text: 'Huruf Tebal (Shod/Dhad/Tho/Zho) Kurang Tegas (Tafkhim)', type: 'eval' },
      { text: 'Huruf Tipis (Tarqiq) Terbawa Tebal', type: 'eval' },
      { text: 'Dhad Tertukar dengan Zho/Dal', type: 'eval' },
    ],
  },
  {
    id: 'nun_mati',
    name: 'Hukum Nun Mati & Tanwin',
    icon: '📜',
    items: [
      { text: 'Idzhar Halqi Sudah Jelas 🌟', type: 'positive' },
      { text: 'Idgham Bighunnah Belum Didengungkan', type: 'eval' },
      { text: 'Idgham Bilaghunnah Masih Berdengung', type: 'eval' },
      { text: 'Iqlab Belum Tepat (Mim Kecil Belum Jelas)', type: 'eval' },
      { text: 'Ikhfa\' Haqiqi Belum Samar', type: 'eval' },
    ],
  },
  {
    id: 'mim_mati',
    name: 'Hukum Mim Mati',
    icon: '✨',
    items: [
      { text: 'Idzhar Syafawi Sudah Tepat 🌟', type: 'positive' },
      { text: 'Ikhfa\' Syafawi Kurang Berdengung', type: 'eval' },
      { text: 'Idgham Mitslain (Mimi) Belum Melebur', type: 'eval' },
    ],
  },
  {
    id: 'ghunnah',
    name: 'Ghunnah',
    icon: '🔔',
    items: [
      { text: 'Ghunnah Sudah Pas (2 Harakat) 🌟', type: 'positive' },
      { text: 'Ghunnah Kurang Panjang', type: 'eval' },
      { text: 'Ghunnah Berlebihan', type: 'eval' },
    ],
  },
  {
    id: 'qalqalah',
    name: 'Qalqalah',
    icon: '⚡',
    items: [
      { text: 'Qalqalah Sudah Mantap 🌟', type: 'positive' },
      { text: 'Qalqalah Kurang Mantap/Memantul', type: 'eval' },
      { text: 'Qalqalah Kubra (Saat Waqaf) Belum Jelas', type: 'eval' },
    ],
  },
  {
    id: 'mad',
    name: 'Mad (Panjang-Pendek)',
    icon: '📏',
    items: [
      { text: 'Mad Thabi\'i Sudah Pas (2 Harakat) 🌟', type: 'positive' },
      { text: 'Mad Thabi\'i Terlalu Cepat (< 2 Harakat)', type: 'eval' },
      { text: 'Mad Wajib/Jaiz Kurang Panjang (4-5 Harakat)', type: 'eval' },
      { text: 'Mad Lazim Kurang Panjang (6 Harakat)', type: 'eval' },
      { text: 'Mad \'Iwadh di Akhir Ayat Belum Tepat', type: 'eval' },
      { text: 'Mad Silah Belum Diperpanjang', type: 'eval' },
    ],
  },
  {
    id: 'waqaf',
    name: 'Waqaf & Ibtida\'',
    icon: '🛑',
    items: [
      { text: 'Waqaf & Ibtida\' Tepat 🌟', type: 'positive' },
      { text: 'Waqaf di Tengah Kata/Kalimat (Memutus Makna)', type: 'eval' },
      { text: 'Ibtida\' (Memulai Bacaan) Kurang Tepat', type: 'eval' },
    ],
  },
  {
    id: 'lam_ra',
    name: 'Lam & Ra\' (Tafkhim/Tarqiq)',
    icon: '💎',
    items: [
      { text: 'Lam Jalalah (Lafadz Allah) Tafkhim/Tarqiq Sudah Tepat 🌟', type: 'positive' },
      { text: 'Lam Jalalah Tertukar Tebal-Tipis', type: 'eval' },
      { text: 'Ra\' Tafkhim/Tarqiq Tertukar', type: 'eval' },
    ],
  },
]
