import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-id') && 
  !supabaseAnonKey.includes('your-anon-key')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

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

  if (!isSupabaseConfigured || !supabase) {
    console.warn('Supabase belum dikonfigurasi di file .env.');
    return { data: null, error: null };
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
