import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Customer } from '../types';

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Provider with Google Sheets Scope
export const SPREADSHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets';
const provider = new GoogleAuthProvider();
provider.addScope(SPREADSHEETS_SCOPE);
provider.setCustomParameters({
  prompt: 'select_account',
});

// Access token cached in-memory ONLY (Security constraint: never put in localStorage/sessionStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Listen to auth changes
export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
};

export const getGoogleAccessToken = (): string | null => {
  return cachedAccessToken;
};

// Sign in with Google Popup and obtain Workspace OAuth access token
export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal memperoleh access token Google Sheets dari autentikasi.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('[GoogleAuth] Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const signOutGoogle = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
    cachedAccessToken = null;
  } catch (error) {
    console.error('[GoogleAuth] Sign out error:', error);
  }
};

export interface SpreadsheetInfo {
  id: string;
  url: string;
  title: string;
  createdNow?: boolean;
}

// Stored spreadsheet ID key (spreadsheet ID is not a secret, URL identifier)
const SPREADSHEET_STORAGE_KEY = 'kasirku_member_spreadsheet_id';

export const getSavedSpreadsheetId = (): string | null => {
  try {
    return localStorage.getItem(SPREADSHEET_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const setSavedSpreadsheetId = (id: string): void => {
  try {
    localStorage.setItem(SPREADSHEET_STORAGE_KEY, id);
  } catch {
    // ignore
  }
};

/**
 * Creates or verifies a Google Spreadsheet dedicated for KASIRKU member data.
 */
export const getOrCreateMemberSpreadsheet = async (
  token: string,
  storeName: string = 'KASIRKU'
): Promise<SpreadsheetInfo> => {
  const existingId = getSavedSpreadsheetId();

  if (existingId) {
    // Check if the spreadsheet still exists and is accessible
    try {
      const checkRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${existingId}?fields=spreadsheetId,properties.title`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (checkRes.ok) {
        const data = await checkRes.json();
        return {
          id: existingId,
          title: data.properties?.title || `${storeName} - Data Member & Loyalitas`,
          url: `https://docs.google.com/spreadsheets/d/${existingId}/edit`,
        };
      }
    } catch (e) {
      console.warn('[GoogleSheets] Could not verify existing spreadsheet:', e);
    }
  }

  // Create a brand new formatted spreadsheet
  const createPayload = {
    properties: {
      title: `${storeName} - Data Member & Loyalitas VIP`,
      locale: 'id_ID',
    },
    sheets: [
      {
        properties: {
          title: 'Data Member',
          gridProperties: {
            frozenRowCount: 1,
          },
        },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: [
                  { userEnteredValue: { stringValue: 'ID Member' } },
                  { userEnteredValue: { stringValue: 'Nama Lengkap' } },
                  { userEnteredValue: { stringValue: 'No. WhatsApp / HP' } },
                  { userEnteredValue: { stringValue: 'Email' } },
                  { userEnteredValue: { stringValue: 'Tier Member' } },
                  { userEnteredValue: { stringValue: 'Saldo Poin' } },
                  { userEnteredValue: { stringValue: 'Total Belanja (Rp)' } },
                  { userEnteredValue: { stringValue: 'Total Transaksi' } },
                  { userEnteredValue: { stringValue: 'Kategori Favorit' } },
                  { userEnteredValue: { stringValue: 'Tanggal Daftar' } },
                  { userEnteredValue: { stringValue: 'Waktu Daftar' } },
                  { userEnteredValue: { stringValue: 'Status Akun' } },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(createPayload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'Gagal membuat Google Spreadsheet baru.');
  }

  const createdData = await res.json();
  const spreadsheetId = createdData.spreadsheetId;
  setSavedSpreadsheetId(spreadsheetId);

  // Apply subtle styling to the header row (Bold + Brown brand tint)
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: createdData.sheets?.[0]?.properties?.sheetId || 0,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.588, green: 0.267, blue: 0.027 }, // #964407 brand
                  textFormat: {
                    bold: true,
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                    fontSize: 10,
                  },
                  horizontalAlignment: 'CENTER',
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
            },
          },
        ],
      }),
    });
  } catch (styleErr) {
    console.warn('[GoogleSheets] Header styling skipped:', styleErr);
  }

  return {
    id: spreadsheetId,
    title: createdData.properties?.title || `${storeName} - Data Member`,
    url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    createdNow: true,
  };
};

/**
 * Appends a new member directly to the Google Sheet.
 */
export const appendMemberToGoogleSheet = async (
  member: Customer,
  token: string,
  storeName: string = 'KASIRKU'
): Promise<{ success: boolean; spreadsheetUrl?: string; error?: string }> => {
  try {
    const sheetInfo = await getOrCreateMemberSpreadsheet(token, storeName);
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const timeStr = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const values = [
      [
        member.id,
        member.name,
        `'${member.phone}`, // Leading quote preserves Indonesian 08... leading zero in Sheets
        member.email || '-',
        member.tier,
        member.points,
        member.totalSpent || 0,
        member.transactionsCount || 0,
        member.favoriteCategory || 'Coffee',
        dateStr,
        timeStr,
        'Aktif',
      ],
    ];

    const range = encodeURIComponent("'Data Member'!A:L");
    const appendRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetInfo.id}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values }),
      }
    );

    if (!appendRes.ok) {
      const err = await appendRes.json().catch(() => ({}));
      throw new Error(err?.error?.message || 'Gagal menambahkan baris ke Google Sheet.');
    }

    return {
      success: true,
      spreadsheetUrl: sheetInfo.url,
    };
  } catch (error: any) {
    console.error('[GoogleSheets] appendMember error:', error);
    return {
      success: false,
      error: error?.message || 'Gagal menyimpan ke Google Sheet.',
    };
  }
};

/**
 * Bulk syncs all current members to Google Sheets, skipping any that already exist.
 */
export const syncAllMembersToGoogleSheet = async (
  customers: Customer[],
  token: string,
  storeName: string = 'KASIRKU'
): Promise<{
  success: boolean;
  syncedCount: number;
  totalCount: number;
  spreadsheetUrl: string;
  error?: string;
}> => {
  try {
    const sheetInfo = await getOrCreateMemberSpreadsheet(token, storeName);

    // Read existing rows to check which customer IDs already exist
    const readRange = encodeURIComponent("'Data Member'!A:A");
    const readRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetInfo.id}/values/${readRange}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const existingIds = new Set<string>();
    if (readRes.ok) {
      const readData = await readRes.json();
      const rows: string[][] = readData.values || [];
      rows.forEach((row) => {
        if (row[0]) existingIds.add(String(row[0]).trim());
      });
    }

    // Filter customers not yet in the sheet
    const toAdd = customers.filter((c) => !existingIds.has(c.id));

    if (toAdd.length === 0) {
      return {
        success: true,
        syncedCount: 0,
        totalCount: customers.length,
        spreadsheetUrl: sheetInfo.url,
      };
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const timeStr = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const values = toAdd.map((c) => [
      c.id,
      c.name,
      `'${c.phone}`,
      c.email || '-',
      c.tier,
      c.points,
      c.totalSpent || 0,
      c.transactionsCount || 0,
      c.favoriteCategory || 'Coffee',
      c.createdAt ? c.createdAt.split('T')[0] : dateStr,
      timeStr,
      'Aktif',
    ]);

    const appendRange = encodeURIComponent("'Data Member'!A:L");
    const appendRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetInfo.id}/values/${appendRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values }),
      }
    );

    if (!appendRes.ok) {
      const err = await appendRes.json().catch(() => ({}));
      throw new Error(err?.error?.message || 'Gagal sinkronisasi data ke Google Sheets.');
    }

    return {
      success: true,
      syncedCount: toAdd.length,
      totalCount: customers.length,
      spreadsheetUrl: sheetInfo.url,
    };
  } catch (error: any) {
    console.error('[GoogleSheets] syncAllMembers error:', error);
    return {
      success: false,
      syncedCount: 0,
      totalCount: customers.length,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${getSavedSpreadsheetId() || ''}/edit`,
      error: error?.message || 'Gagal melakukan sinkronisasi member ke Google Sheets.',
    };
  }
};
