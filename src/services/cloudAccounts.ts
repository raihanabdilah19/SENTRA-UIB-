import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  AppStateData,
  INITIAL_STATE,
  createFreshAccountData,
  loadAccountAppData,
  normalizeAccountName,
} from './storage';
import { User } from '../types';

const ACTIVE_CLOUD_SESSION_KEY = 'sentra_uib_cloud_session_v1';
const MAX_FIRESTORE_PAYLOAD_BYTES = 850_000;

export interface CloudSessionMeta {
  accountKey: string;
  userId: string;
  normalizedName: string;
  authVerifier: string;
  passwordHash: string;
}

// Pure-TS SHA-256 fallback in case crypto.subtle is unavailable (e.g. non-HTTPS LAN access)
const sha256Fallback = (ascii: string): string => {
  const rightRotate = (value: number, amount: number) =>
    (value >>> amount) | (value << (32 - amount));

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let result = '';
  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;

  const hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;

  const isComposite: Record<number, boolean> = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (let i = 0; i < 313; i += candidate) {
        isComposite[i] = true;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  let msg = ascii + '\x80';
  while ((msg.length % 64) - 56) msg += '\x00';
  for (let i = 0; i < msg.length; i++) {
    const j = msg.charCodeAt(i);
    if (j >> 8) return '';
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength;

  for (let j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash.slice(0);

    for (let i = 0; i < 64; i++) {
      const w15 = w[i - 15];
      const w2 = w[i - 2];
      const a = hash[0];
      const e = hash[4];
      const temp1 =
        hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
        ((e & hash[5]) ^ (~e & hash[6])) +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] +
                (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                w[i - 7] +
                (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
              0);
      const temp2 =
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

      hash.unshift((temp1 + temp2) | 0);
      hash.pop();
      hash[4] = (hash[4] + temp1) | 0;
    }

    for (let i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (let i = 0; i < 8; i++) {
    for (let j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
};

const utf8ToBytes = (str: string): Uint8Array => new TextEncoder().encode(str);

export const sha256Hex = async (input: string): Promise<string> => {
  const bytes = utf8ToBytes(input);
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle) {
    const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes as BufferSource);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return sha256Fallback(binary);
};

export const computeAccountKey = async (name: string): Promise<string> =>
  sha256Hex(`sentra_uib_acct_v1:${normalizeAccountName(name)}`);

export const computePasswordHash = async (name: string, password: string): Promise<string> =>
  sha256Hex(`sentra_uib_login_v1:${normalizeAccountName(name)}:${password.trim()}`);

export const computeAuthVerifier = async (name: string, password: string): Promise<string> =>
  sha256Hex(`sentra_uib_write_v1:${normalizeAccountName(name)}:${password.trim()}`);

export const saveCloudSessionMeta = (meta: CloudSessionMeta | null): void => {
  if (typeof window === 'undefined') return;
  try {
    if (meta) {
      localStorage.setItem(ACTIVE_CLOUD_SESSION_KEY, JSON.stringify(meta));
    } else {
      localStorage.removeItem(ACTIVE_CLOUD_SESSION_KEY);
    }
  } catch {
    // Ignore storage restrictions
  }
};

export const loadCloudSessionMeta = (): CloudSessionMeta | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ACTIVE_CLOUD_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CloudSessionMeta;
    if (
      parsed?.accountKey &&
      parsed?.userId &&
      parsed?.authVerifier &&
      parsed?.passwordHash
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

// Recursively remove undefined fields because Firestore rejects `undefined` values
const stripUndefined = <T>(val: T): T => {
  if (Array.isArray(val)) {
    return val.map((item) => stripUndefined(item)) as unknown as T;
  }
  if (val !== null && typeof val === 'object') {
    const cleanObj: Record<string, unknown> = {};
    Object.entries(val as Record<string, unknown>).forEach(([k, v]) => {
      if (v !== undefined) {
        cleanObj[k] = stripUndefined(v);
      }
    });
    return cleanObj as T;
  }
  return val;
};

export const sanitizeStatePayloadForCloud = (
  state: AppStateData
): { payload: AppStateData; trimmedLargeAttachments: boolean } => {
  const safeUser: User = {
    id: state.currentUser.id || 'user-' + Date.now(),
    name: (state.currentUser.name || 'Pengguna').trim().replace(/\s+/g, ' ').slice(0, 160),
    email: state.currentUser.email || '',
    password: '', // Never store plaintext password in Firestore
    role: state.currentUser.role || 'superadmin',
    avatar:
      state.currentUser.avatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    nim: state.currentUser.nim || '',
    division: state.currentUser.division || 'SENTRA UIB',
    phone: state.currentUser.phone || '',
    lastActive: state.currentUser.lastActive || 'Aktif Sekarang',
  };

  let payload: AppStateData = stripUndefined({
    users: [],
    currentUser: safeUser,
    suratMasuk: (state.suratMasuk || []).slice(0, 500),
    suratKeluar: (state.suratKeluar || []).slice(0, 500),
    bukuAgenda: (state.bukuAgenda || []).slice(0, 1000),
    dokumen: (state.dokumen || []).slice(0, 500),
    proposalLpj: (state.proposalLpj || []).slice(0, 500),
    transaksi: (state.transaksi || []).slice(0, 1000),
    agenda: (state.agenda || []).slice(0, 500),
    kejadianPenting: (state.kejadianPenting || []).slice(0, 500),
    aktivitas: (state.aktivitas || []).slice(0, 200),
    notifications: (state.notifications || []).slice(0, 200),
    backupInfo: { ...INITIAL_STATE.backupInfo, ...(state.backupInfo || {}) },
    integrations: { ...INITIAL_STATE.integrations, ...(state.integrations || {}) },
    theme: { ...INITIAL_STATE.theme, ...(state.theme || {}) },
    vaultEncrypted: Boolean(state.vaultEncrypted ?? true),
    encryptionKeyHint: String(state.encryptionKeyHint || INITIAL_STATE.encryptionKeyHint).slice(
      0,
      120
    ),
  });

  let trimmedLargeAttachments = false;
  const byteSize = () => new TextEncoder().encode(JSON.stringify(payload)).length;

  if (byteSize() > MAX_FIRESTORE_PAYLOAD_BYTES) {
    trimmedLargeAttachments = true;
    payload = {
      ...payload,
      dokumen: payload.dokumen.map((d) =>
        d.fileData && d.fileData.length > 50_000 ? { ...d, fileData: '' } : d
      ),
      proposalLpj: payload.proposalLpj.map((p) =>
        p.fileData && p.fileData.length > 50_000 ? { ...p, fileData: '' } : p
      ),
      suratMasuk: payload.suratMasuk.map((s) =>
        s.fileData && s.fileData.length > 50_000 ? { ...s, fileData: '' } : s
      ),
    };
  }

  return { payload, trimmedLargeAttachments };
};

export const hydrateStateFromCloudPayload = (
  payload: Partial<AppStateData> | undefined,
  user: User,
  localAccounts: User[]
): AppStateData => {
  const safeRemote = payload || {};
  return {
    ...INITIAL_STATE,
    ...safeRemote,
    users: localAccounts,
    currentUser: {
      ...(safeRemote.currentUser || user),
      ...user,
      password: user.password || '',
    },
    suratMasuk: safeRemote.suratMasuk || [],
    suratKeluar: safeRemote.suratKeluar || [],
    bukuAgenda: safeRemote.bukuAgenda || [],
    dokumen: safeRemote.dokumen || [],
    proposalLpj: safeRemote.proposalLpj || [],
    transaksi: safeRemote.transaksi || [],
    agenda: safeRemote.agenda || [],
    kejadianPenting: safeRemote.kejadianPenting || [],
    aktivitas: safeRemote.aktivitas || [],
    notifications: safeRemote.notifications || [],
    theme: { ...INITIAL_STATE.theme, ...(safeRemote.theme || {}) },
    integrations: { ...INITIAL_STATE.integrations, ...(safeRemote.integrations || {}) },
    backupInfo: { ...INITIAL_STATE.backupInfo, ...(safeRemote.backupInfo || {}) },
  };
};

export interface CloudAuthResult {
  ok: boolean;
  user?: User;
  stateData?: AppStateData;
  sessionMeta?: CloudSessionMeta;
  error?: string;
}

export const registerAccountInCloud = async (
  name: string,
  password: string,
  localAccounts: User[]
): Promise<CloudAuthResult> => {
  const cleanName = name.trim().replace(/\s+/g, ' ');
  const cleanPassword = password.trim();
  const normalizedName = normalizeAccountName(cleanName);

  if (!cleanName) return { ok: false, error: 'Nama lengkap wajib diisi.' };
  if (!cleanPassword) return { ok: false, error: 'Password wajib diisi.' };

  const accountKey = await computeAccountKey(cleanName);
  const passwordHash = await computePasswordHash(cleanName, cleanPassword);
  const authVerifier = await computeAuthVerifier(cleanName, cleanPassword);
  const docPath = `accounts/${accountKey}`;

  try {
    const existingSnap = await getDoc(doc(db, 'accounts', accountKey));
    if (existingSnap.exists()) {
      return {
        ok: false,
        error: `Nama akun "${cleanName}" sudah terdaftar. Silakan masuk melalui tab "Masuk Akun".`,
      };
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docPath);
  }

  const newUser: User = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: cleanName,
    email: '',
    password: cleanPassword,
    role: 'superadmin',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    nim: '',
    division: 'SENTRA UIB',
    phone: '',
    lastActive: 'Aktif Sekarang',
  };

  const freshData = createFreshAccountData(newUser, [...localAccounts, newUser]);
  const { payload } = sanitizeStatePayloadForCloud(freshData);

  try {
    const batch = writeBatch(db);
    batch.set(doc(db, 'accountSecrets', accountKey), {
      accountKey,
      authVerifier,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    batch.set(doc(db, 'accounts', accountKey), {
      accountKey,
      userId: newUser.id,
      normalizedName,
      displayName: cleanName.slice(0, 160),
      passwordHash,
      statePayload: payload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }

  return {
    ok: true,
    user: newUser,
    stateData: freshData,
    sessionMeta: {
      accountKey,
      userId: newUser.id,
      normalizedName,
      authVerifier,
      passwordHash,
    },
  };
};

export const loginAccountFromCloud = async (
  name: string,
  password: string,
  localAccounts: User[]
): Promise<CloudAuthResult> => {
  const cleanName = name.trim().replace(/\s+/g, ' ');
  const cleanPassword = password.trim();
  const normalizedName = normalizeAccountName(cleanName);

  if (!cleanName || !cleanPassword) {
    return { ok: false, error: 'Nama lengkap dan password wajib diisi.' };
  }

  const accountKey = await computeAccountKey(cleanName);
  const passwordHash = await computePasswordHash(cleanName, cleanPassword);
  const authVerifier = await computeAuthVerifier(cleanName, cleanPassword);
  const docPath = `accounts/${accountKey}`;

  let snapData: Record<string, unknown> | null = null;
  try {
    const snap = await getDoc(doc(db, 'accounts', accountKey));
    if (snap.exists()) {
      snapData = snap.data() as Record<string, unknown>;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docPath);
  }

  // Fallback: If account exists only in this device's legacy localStorage, auto-migrate to cloud now
  if (!snapData) {
    const localMatch = localAccounts.find(
      (u) => normalizeAccountName(u.name) === normalizedName
    );
    if (localMatch) {
      const localPwd = (localMatch.password || '').trim();
      if (localPwd === '' || localPwd === cleanPassword) {
        const migratedUser: User = {
          ...localMatch,
          name: cleanName,
          password: cleanPassword,
          lastActive: 'Aktif Sekarang',
        };
        const localData = loadAccountAppData(migratedUser, localAccounts);
        const { payload } = sanitizeStatePayloadForCloud(localData);

        try {
          const batch = writeBatch(db);
          batch.set(doc(db, 'accountSecrets', accountKey), {
            accountKey,
            authVerifier,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          batch.set(doc(db, 'accounts', accountKey), {
            accountKey,
            userId: migratedUser.id,
            normalizedName,
            displayName: cleanName.slice(0, 160),
            passwordHash,
            statePayload: payload,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          await batch.commit();
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, docPath);
        }

        return {
          ok: true,
          user: migratedUser,
          stateData: localData,
          sessionMeta: {
            accountKey,
            userId: migratedUser.id,
            normalizedName,
            authVerifier,
            passwordHash,
          },
        };
      }
      return {
        ok: false,
        error: 'Password tidak sesuai. Silakan periksa kembali password Anda.',
      };
    }

    return {
      ok: false,
      error: `Akun "${cleanName}" belum terdaftar. Silakan buat akun baru di tab "Buat Akun Baru".`,
    };
  }

  if (snapData.passwordHash !== passwordHash) {
    return {
      ok: false,
      error: 'Password tidak sesuai. Silakan periksa kembali password Anda.',
    };
  }

  const remotePayload = snapData.statePayload as Partial<AppStateData> | undefined;
  const remoteUser = remotePayload?.currentUser;
  const loggedUser: User = {
    id: String(snapData.userId || remoteUser?.id || `user-${Date.now()}`),
    name: String(snapData.displayName || remoteUser?.name || cleanName),
    email: remoteUser?.email || '',
    password: cleanPassword,
    role: remoteUser?.role || 'superadmin',
    avatar:
      remoteUser?.avatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    nim: remoteUser?.nim || '',
    division: remoteUser?.division || 'SENTRA UIB',
    phone: remoteUser?.phone || '',
    lastActive: 'Aktif Sekarang',
  };

  const mergedAccounts = localAccounts.some(
    (u) => normalizeAccountName(u.name) === normalizedName
  )
    ? localAccounts.map((u) =>
        normalizeAccountName(u.name) === normalizedName ? loggedUser : u
      )
    : [...localAccounts, loggedUser];

  const hydratedState = hydrateStateFromCloudPayload(remotePayload, loggedUser, mergedAccounts);

  return {
    ok: true,
    user: loggedUser,
    stateData: hydratedState,
    sessionMeta: {
      accountKey,
      userId: loggedUser.id,
      normalizedName,
      authVerifier,
      passwordHash,
    },
  };
};

export const saveAccountStateToCloud = async (
  sessionMeta: CloudSessionMeta,
  stateData: AppStateData
): Promise<{ trimmedLargeAttachments: boolean }> => {
  const { payload, trimmedLargeAttachments } = sanitizeStatePayloadForCloud(stateData);
  const docPath = `accounts/${sessionMeta.accountKey}`;

  try {
    const batch = writeBatch(db);
    batch.update(doc(db, 'accountSecrets', sessionMeta.accountKey), {
      authVerifier: sessionMeta.authVerifier,
      previousAuthVerifier: sessionMeta.authVerifier,
      updatedAt: serverTimestamp(),
    });
    batch.update(doc(db, 'accounts', sessionMeta.accountKey), {
      displayName: payload.currentUser.name,
      passwordHash: sessionMeta.passwordHash,
      statePayload: payload,
      updatedAt: serverTimestamp(),
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }

  return { trimmedLargeAttachments };
};

export const updateAccountCredentialsInCloud = async (
  prevSession: CloudSessionMeta,
  newUser: User,
  stateData: AppStateData
): Promise<{ ok: boolean; sessionMeta?: CloudSessionMeta; error?: string }> => {
  const cleanName = newUser.name.trim().replace(/\s+/g, ' ');
  const cleanPassword = (newUser.password || '').trim();
  const nextNormalized = normalizeAccountName(cleanName);

  if (!cleanName || !cleanPassword) {
    return { ok: false, error: 'Nama lengkap dan password wajib diisi.' };
  }

  const nextAccountKey = await computeAccountKey(cleanName);
  const nextPasswordHash = await computePasswordHash(cleanName, cleanPassword);
  const nextAuthVerifier = await computeAuthVerifier(cleanName, cleanPassword);
  const { payload } = sanitizeStatePayloadForCloud({
    ...stateData,
    currentUser: newUser,
  });

  if (nextAccountKey === prevSession.accountKey) {
    const docPath = `accounts/${prevSession.accountKey}`;
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'accountSecrets', prevSession.accountKey), {
        authVerifier: nextAuthVerifier,
        previousAuthVerifier: prevSession.authVerifier,
        updatedAt: serverTimestamp(),
      });
      batch.update(doc(db, 'accounts', prevSession.accountKey), {
        displayName: cleanName.slice(0, 160),
        passwordHash: nextPasswordHash,
        statePayload: payload,
        updatedAt: serverTimestamp(),
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, docPath);
    }

    return {
      ok: true,
      sessionMeta: {
        accountKey: prevSession.accountKey,
        userId: prevSession.userId,
        normalizedName: nextNormalized,
        authVerifier: nextAuthVerifier,
        passwordHash: nextPasswordHash,
      },
    };
  }

  // Name changed to a different normalized name -> create new cloud account doc
  const nextDocPath = `accounts/${nextAccountKey}`;
  try {
    const existing = await getDoc(doc(db, 'accounts', nextAccountKey));
    if (existing.exists()) {
      return {
        ok: false,
        error: `Nama akun "${cleanName}" sudah digunakan oleh akun lain.`,
      };
    }

    const batch = writeBatch(db);
    batch.set(doc(db, 'accountSecrets', nextAccountKey), {
      accountKey: nextAccountKey,
      authVerifier: nextAuthVerifier,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    batch.set(doc(db, 'accounts', nextAccountKey), {
      accountKey: nextAccountKey,
      userId: newUser.id,
      normalizedName: nextNormalized,
      displayName: cleanName.slice(0, 160),
      passwordHash: nextPasswordHash,
      statePayload: payload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, nextDocPath);
  }

  return {
    ok: true,
    sessionMeta: {
      accountKey: nextAccountKey,
      userId: newUser.id,
      normalizedName: nextNormalized,
      authVerifier: nextAuthVerifier,
      passwordHash: nextPasswordHash,
    },
  };
};

export const syncLegacyLocalAccountsToCloud = async (localAccounts: User[]): Promise<void> => {
  for (const acc of localAccounts) {
    const cleanName = (acc.name || '').trim().replace(/\s+/g, ' ');
    const cleanPassword = (acc.password || '').trim();
    if (!cleanName || !cleanPassword) continue;

    const normalizedName = normalizeAccountName(cleanName);
    const accountKey = await computeAccountKey(cleanName);
    const passwordHash = await computePasswordHash(cleanName, cleanPassword);
    const authVerifier = await computeAuthVerifier(cleanName, cleanPassword);
    const docPath = `accounts/${accountKey}`;

    try {
      const existingSnap = await getDoc(doc(db, 'accounts', accountKey));
      if (existingSnap.exists()) continue;

      const localData = loadAccountAppData(acc, localAccounts);
      const { payload } = sanitizeStatePayloadForCloud(localData);

      const batch = writeBatch(db);
      batch.set(doc(db, 'accountSecrets', accountKey), {
        accountKey,
        authVerifier,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      batch.set(doc(db, 'accounts', accountKey), {
        accountKey,
        userId: acc.id,
        normalizedName,
        displayName: cleanName.slice(0, 160),
        passwordHash,
        statePayload: payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  }
};

export const subscribeToAccountCloud = (
  accountKey: string,
  activeUser: User,
  localAccounts: User[],
  onRemoteUpdate: (remoteState: AppStateData) => void
): Unsubscribe => {
  const docPath = `accounts/${accountKey}`;
  return onSnapshot(
    doc(db, 'accounts', accountKey),
    (snapshot) => {
      if (!snapshot.exists()) return;
      if (snapshot.metadata.hasPendingWrites) return;
      const data = snapshot.data() as Record<string, unknown>;
      const remotePayload = data.statePayload as Partial<AppStateData> | undefined;
      if (!remotePayload) return;
      const hydrated = hydrateStateFromCloudPayload(remotePayload, activeUser, localAccounts);
      onRemoteUpdate(hydrated);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, docPath);
    }
  );
};
