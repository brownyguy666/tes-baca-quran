# Tes Baca Al-Quran — Aplikasi Penilaian

Aplikasi web untuk guru mengetes dan mencatat kemampuan membaca Al-Quran murid, sekaligus menghasilkan **sertifikat PDF berlabel islami**.

**Stack**: React + Vite + Tailwind CSS · Supabase (Auth + PostgreSQL) · jsPDF + html2canvas · Deploy ke Netlify

---

## 📋 Prasyarat

- Node.js ≥ 18
- Akun [Supabase](https://supabase.com) (gratis)
- Akun [Netlify](https://netlify.com) (gratis) + GitHub repo

---

## 🗄️ Setup Supabase

### 1. Buat Project Supabase
1. Login ke [supabase.com](https://supabase.com) → **New Project**
2. Catat **Project URL** dan **anon public key** (Settings → API)

### 2. Buat Tabel Database
Buka **SQL Editor** di Supabase dashboard, lalu jalankan SQL berikut:

```sql
-- ── Tabel murid ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS murid (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama       TEXT NOT NULL,
  kelas      TEXT NOT NULL,
  nisn       TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Tabel hasil_tes ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hasil_tes (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  murid_id         UUID REFERENCES murid(id) ON DELETE CASCADE,
  tanggal_tes      DATE NOT NULL,
  ayat_dibaca      TEXT,
  skor_makhraj     NUMERIC(5,2) NOT NULL CHECK (skor_makhraj BETWEEN 0 AND 100),
  skor_tajwid      NUMERIC(5,2) NOT NULL CHECK (skor_tajwid BETWEEN 0 AND 100),
  skor_kelancaran  NUMERIC(5,2) NOT NULL CHECK (skor_kelancaran BETWEEN 0 AND 100),
  skor_total       NUMERIC(5,2),
  level            TEXT,
  guru_penguji     TEXT,
  catatan          TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE murid ENABLE ROW LEVEL SECURITY;
ALTER TABLE hasil_tes ENABLE ROW LEVEL SECURITY;

-- Policy: hanya user yang sudah login (authenticated) yang bisa akses
CREATE POLICY "Authenticated full access" ON murid
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated full access" ON hasil_tes
  FOR ALL USING (auth.role() = 'authenticated');
```

### 3. Buat Akun Guru
Akun guru **tidak bisa dibuat sendiri** dari aplikasi — harus dibuat manual oleh admin:

1. Buka Supabase dashboard → **Authentication** → **Users**
2. Klik **Add User** → masukkan email dan password guru
3. Guru bisa langsung login dengan akun tersebut

> **Catatan**: Akun guru tidak bisa mendaftar sendiri melalui aplikasi. Ini disengaja untuk keamanan.

---

## 💻 Setup Lokal

```bash
# 1. Clone repo
git clone https://github.com/USERNAME/tes-baca-quran.git
cd tes-baca-quran

# 2. Install dependencies
npm install

# 3. Salin dan isi .env
cp .env.example .env
# Edit .env: isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY

# 4. Jalankan dev server
npm run dev
```

File `.env` yang dibutuhkan:
```
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🚀 Deploy ke Netlify

### Cara 1: Via GitHub (Recommended)
1. Push kode ke GitHub repository
2. Login [netlify.com](https://netlify.com) → **Add New Site** → **Import from Git**
3. Pilih repository ini
4. Build settings akan terdeteksi otomatis dari `netlify.toml`
5. Tambahkan **Environment Variables** di Netlify:
   - `VITE_SUPABASE_URL` = URL project Supabase kamu
   - `VITE_SUPABASE_ANON_KEY` = anon key Supabase kamu
6. Klik **Deploy**

### Cara 2: Manual via CLI
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

---

## 🖥️ Embed sebagai iFrame

Aplikasi ini responsif dan bisa ditanam di website sekolah:

```html
<iframe
  src="https://your-site.netlify.app"
  width="100%"
  height="700px"
  frameborder="0"
  style="border-radius: 12px;"
></iframe>
```

---

## 📐 Formula Penilaian

```
Skor Total = (Makhraj × 35%) + (Tajwid × 40%) + (Kelancaran × 25%)
```

| Level | Rentang |
|-------|---------|
| 🌱 Pemula | 0–40 |
| 📚 Dasar | 41–60 |
| 📈 Menengah | 61–75 |
| ✅ Mahir | 76–90 |
| 🌟 Mumtaz (Tartil) | 91–100 |

---

## 🔧 Menambah Kriteria Penilaian Baru

Edit file `src/utils/scoring.js` — tambahkan entry baru di array `CRITERIA`:

```js
{
  key: 'waqaf',          // key unik (harus matching dengan kolom DB)
  label: 'Waqaf',
  description: 'Ketepatan tempat berhenti membaca',
  icon: '⏸️',
  weight: 0.20,          // pastikan total semua weight = 1.0
  guidance: [
    { range: '0–40', label: 'Belum tepat', desc: '...' },
    // ...
  ],
}
```

Lalu tambahkan kolom baru di Supabase:
```sql
ALTER TABLE hasil_tes ADD COLUMN skor_waqaf NUMERIC(5,2) CHECK (skor_waqaf BETWEEN 0 AND 100);
```

---

## 📂 Struktur Kode

```
src/
├── lib/supabase.js          # Supabase client (env vars only)
├── contexts/AuthContext.jsx # Auth state global
├── utils/
│   ├── scoring.js           # Formula & tabel level (modular)
│   └── pdfGenerator.js      # html2canvas + jsPDF
├── components/
│   ├── Layout.jsx           # Sidebar + topbar
│   ├── ProtectedRoute.jsx   # Auth guard
│   └── CertificateTemplate.jsx # Template sertifikat PDF
└── pages/
    ├── Login.jsx
    ├── Dashboard.jsx
    ├── Students.jsx         # CRUD murid
    ├── NewTest.jsx          # Form tes (slider + real-time scoring)
    ├── TestHistory.jsx      # Riwayat per murid
    └── TestResult.jsx       # Hasil tes + unduh PDF
```

---

## 🎨 Mengganti Logo Sekolah

Ganti file `public/school-logo.png` dengan logo sekolah yang sebenarnya.  
Ukuran yang disarankan: **200×200px**, format PNG dengan background transparan.

---

© 2024 SMP Negeri 2 Glagah
