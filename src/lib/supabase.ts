import { createClient } from '@supabase/supabase-js';

// Hardcoded Supabase Credentials (tidak bergantung pada file .env)
export const SUPABASE_URL = 'https://dlzfugiolifzdxqnnatp.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsemZ1Z2lvbGlmemR4cW5uYXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4MTgzMzksImV4cCI6MjEwNzM5NDMzOX0.MlSV8ujsyWCM1cngOVVhNVoeAs9KvG-Rf5V66RAwxN0';

export const isSupabaseConfigured = true;
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface PesertaResult {
  nim: string;
  nama: string;
  divisi: string;
  link_wa?: string | null;
}

/**
 * Memeriksa status kelulusan peserta seleksi berdasarkan NIM melalui Supabase RPC yang aman.
 * Mencegah SQL Injection & Enumeration attacks.
 */
export async function checkNIM(inputNim: string): Promise<{ data: PesertaResult | null; error: string | null }> {
  const cleanNim = inputNim.trim();

  // 1. Sanitasi & Validasi Input di sisi Client
  if (!cleanNim) {
    return { data: null, error: 'Silakan masukkan NIM terlebih dahulu.' };
  }

  // Enforce panjang dan format angka murni
  if (cleanNim.length < 5 || cleanNim.length > 15 || !/^[0-9a-zA-Z]+$/.test(cleanNim)) {
    return { data: null, error: 'Format NIM tidak valid. Pastikan hanya memasukkan karakter angka/alfanumerik.' };
  }

  try {
    // 2. Panggil fungsi RPC yang terproteksi (SECURITY DEFINER)
    const { data, error } = await supabase.rpc('cek_hasil_seleksi', {
      input_nim: cleanNim
    });

    if (error) {
      console.error('Supabase RPC Error:', error.message);
      return { data: null, error: 'Gagal memverifikasi pangkalan data seleksi.' };
    }

    const result = Array.isArray(data) ? data[0] : data;
    return { data: (result as PesertaResult) || null, error: null };
  } catch (err: any) {
    console.error('Error saat menghubungi Supabase:', err);
    return { data: null, error: 'Terjadi kesalahan jaringan saat memverifikasi data.' };
  }
}
