-- ==============================================================================
-- SKEMA TABEL SUPABASE: PENGUMUMAN SELEKSI EKSPEDISI BIRU 2026 (DEFENSIVE HARDENED)
-- ==============================================================================

-- 1. Buat Tabel Pengumuman (Hanya menyimpan data peserta yang DITERIMA)
create table if not exists public.pengumuman (
  id uuid default gen_random_uuid() primary key,
  nim varchar(20) unique not null,
  nama text not null,
  divisi text not null,
  link_wa text,
  created_at timestamptz default now()
);

-- 2. Buat Index Pencarian Cepat Berdasarkan NIM
create index if not exists idx_pengumuman_nim on public.pengumuman (nim);

-- 3. Aktifkan Row Level Security (RLS)
alter table public.pengumuman enable row level security;

-- 4. KEAMANAN LEVEL TINGGI: Cabut seluruh akses langsung (Direct REST API Query)
-- Mencegah penyerang mendownload seluruh isi tabel melalui console browser
revoke all on table public.pengumuman from anon, authenticated;

-- 5. Buat Fungsi RPC Berkeamanan Tinggi (SECURITY DEFINER):
-- Hanya mengembalikan 1 baris sesuai NIM yang dicari dengan validasi format ketat
create or replace function public.cek_hasil_seleksi(input_nim text)
returns table (
  nim varchar(20),
  nama text,
  divisi text,
  link_wa text
) 
language plpgsql
security definer
as $$
declare
  clean_nim text;
begin
  clean_nim := trim(input_nim);

  -- Validasi Keamanan: NIM harus berpanjang 5-15 karakter dan hanya angka/huruf
  if length(clean_nim) < 5 or length(clean_nim) > 15 or clean_nim !~ '^[0-9a-zA-Z]+$' then
    return;
  end if;

  return query
  select p.nim, p.nama, p.divisi, p.link_wa
  from public.pengumuman p
  where p.nim = clean_nim
  limit 1;
end;
$$;

-- 6. Berikan izin eksekusi HANYA pada fungsi RPC (Bukan pada tabel mentah)
grant execute on function public.cek_hasil_seleksi(text) to anon;
grant execute on function public.cek_hasil_seleksi(text) to authenticated;
