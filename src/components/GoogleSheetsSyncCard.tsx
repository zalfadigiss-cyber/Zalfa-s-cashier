import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Sparkles,
  Database,
  Layers,
} from 'lucide-react';
import { Customer } from '../types';
import {
  auth,
  initGoogleAuth,
  signInWithGoogle,
  signOutGoogle,
  getGoogleAccessToken,
  syncAllMembersToGoogleSheet,
  getOrCreateMemberSpreadsheet,
  getSavedSpreadsheetId,
} from '../services/googleSheets';
import { User } from 'firebase/auth';

interface GoogleSheetsSyncCardProps {
  customers: Customer[];
  storeName?: string;
  onSyncComplete?: (count: number) => void;
  compact?: boolean;
}

export const GoogleSignInButton: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  label?: string;
  className?: string;
  id?: string;
}> = ({ onClick, disabled, label = 'Sign in with Google', className = '', id = 'gsi-btn' }) => (
  <button
    id={id}
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-[#dadce0] bg-white hover:bg-[#f8f9fa] active:bg-[#f1f3f4] text-[#3c4043] font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-50 ${className}`}
  >
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 shrink-0">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
      <path fill="none" d="M0 0h48v48H0z" />
    </svg>
    <span>{label}</span>
  </button>
);

export const GoogleSheetsSyncCard: React.FC<GoogleSheetsSyncCardProps> = ({
  customers,
  storeName = 'KASIRKU',
  onSyncComplete,
  compact = false,
}) => {
  const [googleUser, setGoogleUser] = useState<User | null>(auth.currentUser);
  const [token, setToken] = useState<string | null>(getGoogleAccessToken());
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | null>(() => {
    const savedId = getSavedSpreadsheetId();
    return savedId ? `https://docs.google.com/spreadsheets/d/${savedId}/edit` : null;
  });
  const [spreadsheetTitle, setSpreadsheetTitle] = useState<string>(
    `${storeName} - Data Member & Loyalitas`
  );
  const [syncStatus, setSyncStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // Init auth listener
  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (u, tok) => {
        setGoogleUser(u);
        setToken(tok);
      },
      () => {
        setGoogleUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    setSyncStatus({ type: null, message: '' });
    try {
      const res = await signInWithGoogle();
      setGoogleUser(res.user);
      setToken(res.accessToken);

      // Verify or create the spreadsheet immediately
      const sheetInfo = await getOrCreateMemberSpreadsheet(res.accessToken, storeName);
      setSpreadsheetUrl(sheetInfo.url);
      setSpreadsheetTitle(sheetInfo.title);

      setSyncStatus({
        type: 'success',
        message: 'Google Sheets berhasil dihubungkan! Spreadsheet siap digunakan.',
      });
    } catch (err: any) {
      console.error('[GoogleConnect] Error:', err);
      setSyncStatus({
        type: 'error',
        message: err?.message || 'Gagal menghubungkan ke akun Google.',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await signOutGoogle();
    setGoogleUser(null);
    setToken(null);
    setSyncStatus({
      type: 'success',
      message: 'Koneksi akun Google berhasil diputuskan.',
    });
  };

  const handleSyncAll = async () => {
    if (!token) {
      await handleConnect();
      return;
    }

    setIsSyncing(true);
    setSyncStatus({ type: null, message: '' });
    try {
      const result = await syncAllMembersToGoogleSheet(customers, token, storeName);
      if (result.success) {
        setSpreadsheetUrl(result.spreadsheetUrl);
        setSyncStatus({
          type: 'success',
          message:
            result.syncedCount > 0
              ? `Berhasil menyinkronkan ${result.syncedCount} member baru ke Google Sheet! (Total: ${result.totalCount} member).`
              : `Semua data (${result.totalCount} member) sudah tersinkronisasi rapi di Google Sheet.`,
        });
        if (onSyncComplete) onSyncComplete(result.syncedCount);
      } else {
        setSyncStatus({
          type: 'error',
          message: result.error || 'Gagal sinkronisasi data member ke Google Sheets.',
        });
      }
    } catch (err: any) {
      setSyncStatus({
        type: 'error',
        message: err?.message || 'Terjadi kesalahan saat sinkronisasi Google Sheets.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  if (compact) {
    return (
      <div className="p-3.5 rounded-2xl bg-white border border-[#ebdcd3] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#201b14]">Google Sheets Sync</span>
              {token ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Terhubung
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px]">
                  Belum Terhubung
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#69615b]">
              {token
                ? `${googleUser?.email || 'Akun Google'} • Data member otomatis tersimpan`
                : 'Hubungkan untuk menyimpan pendaftaran member ke spreadsheet Anda'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {token ? (
            <>
              {spreadsheetUrl && (
                <a
                  href={spreadsheetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-[#fff8f4] hover:bg-amber-100/60 border border-[#ebdcd3] text-[#7e3905] font-semibold text-[11px] flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Buka Sheet</span>
                </a>
              )}
              <button
                type="button"
                onClick={handleSyncAll}
                disabled={isSyncing}
                className="px-3 py-1.5 rounded-xl bg-[#964407] hover:bg-[#7e3905] text-white font-bold text-[11px] flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-60 cursor-pointer shadow-xs"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Menyinkronkan...' : `Sync (${customers.length})`}</span>
              </button>
            </>
          ) : (
            <GoogleSignInButton
              onClick={handleConnect}
              disabled={isConnecting}
              label={isConnecting ? 'Menghubungkan...' : 'Hubungkan Google Sheet'}
              className="py-1.5 text-xs"
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-[#ebdcd3] shadow-sm p-6 sm:p-7 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ebdcd3] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shadow-xs">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base sm:text-lg text-[#201b14] font-serif">
                Integrasi Google Sheets & Cloud Sync
              </h3>
              {token ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Terhubung
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 text-xs font-semibold">
                  Siap Dihubungkan
                </span>
              )}
            </div>
            <p className="text-xs text-[#69615b] mt-0.5">
              Simpan dan sinkronkan data member secara otomatis ke Google Spreadsheet Anda.
            </p>
          </div>
        </div>

        {token && (
          <button
            type="button"
            onClick={handleDisconnect}
            className="self-start sm:self-auto text-xs text-[#847870] hover:text-red-600 font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Putuskan Akun</span>
          </button>
        )}
      </div>

      {/* Sync Status Banner */}
      {syncStatus.message && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-start gap-2.5 ${
            syncStatus.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-red-50 text-red-900 border border-red-200'
          }`}
        >
          {syncStatus.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          )}
          <span>{syncStatus.message}</span>
        </div>
      )}

      {/* Connection Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Box 1: Info Akun & Database */}
        <div className="p-4 rounded-2xl bg-[#fff8f4] border border-[#ebdcd3] space-y-2">
          <div className="flex items-center gap-2 text-[#964407] font-bold">
            <Database className="w-4 h-4" />
            <span>Alur Sinkronisasi Data Member:</span>
          </div>
          <p className="text-[#51443b] leading-relaxed">
            Setiap ada pengunjung yang mendaftar menjadi member via formulir sign up, data otomatis tercatat di:
          </p>
          <ul className="space-y-1.5 pl-1 font-medium text-[#201b14]">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span>Database Turso Cloud (Tabel customers & points)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span>Google Spreadsheet (Tab &apos;Data Member&apos;)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span>Sistem Kasir POS (Pencarian member instan)</span>
            </li>
          </ul>
        </div>

        {/* Box 2: Target Spreadsheet */}
        <div className="p-4 rounded-2xl bg-[#fff8f4] border border-[#ebdcd3] space-y-2.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#964407] font-bold">
              <Layers className="w-4 h-4" />
              <span>Target Google Spreadsheet:</span>
            </div>
            <p className="text-[#201b14] font-bold text-sm mt-1 truncate">
              {spreadsheetTitle}
            </p>
            <p className="text-[11px] text-[#69615b] mt-0.5">
              Kolom: ID, Nama, No. WhatsApp, Email, Tier, Poin, Kategori Favorit, Waktu Daftar.
            </p>
          </div>

          {spreadsheetUrl && (
            <a
              href={spreadsheetUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#964407] hover:text-[#7e3905] underline mt-1"
            >
              <span>Buka Dokumen di Google Sheets</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="text-xs text-[#69615b]">
          {token ? (
            <span>
              Akun: <strong className="text-[#201b14]">{googleUser?.email || 'Google User'}</strong> &bull; Total data lokal: {customers.length} member
            </span>
          ) : (
            <span>Tekan tombol di samping untuk mengizinkan aplikasi menyimpan ke Google Sheets Anda.</span>
          )}
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {token ? (
            <>
              {spreadsheetUrl && (
                <a
                  href={spreadsheetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl border border-[#ebdcd3] bg-white hover:bg-stone-50 text-[#51443b] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#964407]" />
                  <span>Lihat Spreadsheet</span>
                </a>
              )}
              <button
                id="btn-sync-all-members-sheets"
                type="button"
                onClick={handleSyncAll}
                disabled={isSyncing}
                className="px-5 py-2.5 rounded-xl bg-[#964407] hover:bg-[#7e3905] text-white font-extrabold text-xs shadow-md transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Menyinkronkan...' : `Sinkronkan Semua Data (${customers.length})`}</span>
              </button>
            </>
          ) : (
            <GoogleSignInButton
              id="btn-connect-google-sheets"
              onClick={handleConnect}
              disabled={isConnecting}
              label={isConnecting ? 'Membuka Google Popup...' : 'Hubungkan Akun Google'}
            />
          )}
        </div>
      </div>
    </div>
  );
};
