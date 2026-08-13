-- ============================================================================
-- Migrasi: Optimasi query Dashboard & Data Murid (Tes Baca Al-Quran)
-- Cara pakai: buka Supabase Dashboard → SQL Editor → paste semua → Run
-- Aman dijalankan berkali-kali (pakai CREATE OR REPLACE / IF NOT EXISTS)
-- ============================================================================

-- 1) VIEW: tes terakhir per murid
--    Menggantikan pola lama di Dashboard.jsx yang narik SELURUH tabel
--    hasil_tes lalu di-loop di JS buat cari tes terbaru per murid.
--    Dengan DISTINCT ON, Postgres yang mengerjakan itu sekali di server,
--    dan jumlah baris hasil view ini dibatasi maksimal = jumlah murid
--    (bukan terus bertambah seiring jumlah tes yang diinput).
CREATE OR REPLACE VIEW last_test_per_murid
WITH (security_invoker = true) AS
SELECT DISTINCT ON (murid_id) *
FROM hasil_tes
ORDER BY murid_id, tanggal_tes DESC, created_at DESC;

GRANT SELECT ON last_test_per_murid TO authenticated;

-- 2) FUNCTION: statistik dashboard (total murid, tes hari ini, rata-rata skor)
--    Dihitung langsung di database (COUNT/AVG), bukan fetch semua baris
--    ke client lalu dihitung manual di JavaScript.
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
  total_murid    BIGINT,
  tes_hari_ini   BIGINT,
  rata_rata_skor NUMERIC
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    (SELECT COUNT(*) FROM murid)                                        AS total_murid,
    (SELECT COUNT(*) FROM hasil_tes WHERE tanggal_tes = CURRENT_DATE)    AS tes_hari_ini,
    (SELECT ROUND(AVG(skor_total), 1) FROM hasil_tes)                   AS rata_rata_skor;
$$;

GRANT EXECUTE ON FUNCTION get_dashboard_stats() TO authenticated;

-- 3) INDEX: mempercepat sort/pencarian nama murid dan lookup tes per murid.
--    Tanpa index ini, ORDER BY nama dan filter murid_id akan makin lambat
--    seiring data bertambah (full table scan).
CREATE INDEX IF NOT EXISTS idx_murid_nama       ON murid (nama);
CREATE INDEX IF NOT EXISTS idx_hasil_tes_murid   ON hasil_tes (murid_id);
CREATE INDEX IF NOT EXISTS idx_hasil_tes_tanggal ON hasil_tes (tanggal_tes);

-- ============================================================================
-- Verifikasi cepat setelah dijalankan:
--   SELECT * FROM get_dashboard_stats();
--   SELECT * FROM last_test_per_murid LIMIT 5;
-- ============================================================================
