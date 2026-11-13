# Security Specification: SENTRA UIB Cross-Device Account Sync

## 1. Data Invariants
1. **No Account Enumeration**: `list` operations on `/accounts` and `/accountSecrets` are strictly denied (`allow list: if false`).
2. **Non-Readable Write Secrets**: `/accountSecrets/{accountKey}` is strictly non-readable (`allow get, list, delete: if false`) via client SDKs.
3. **Zero Plaintext Passwords**: `accounts/{accountKey}` stores only a salted SHA-256 `passwordHash`, and `statePayload.currentUser` must never include a non-empty `password`.
4. **Atomic Creation**: Creating `/accounts/{accountKey}` requires simultaneously creating `/accountSecrets/{accountKey}` in the same batch (`existsAfter`), and vice versa.
5. **Authorized Updates Only**: Updating `/accounts/{accountKey}` requires an atomic batch update to `/accountSecrets/{accountKey}` (`getAfter(...).data.updatedAt == request.time`) where `previousAuthVerifier == existing().authVerifier`.
6. **Immutability & Temporal Integrity**: `accountKey`, `userId`, `normalizedName`, and `createdAt` are immutable after creation; `createdAt` and `updatedAt` must equal `request.time`.
7. **Strict Key & Payload Guards**: Both collections reject ghost fields (`hasOnly`), oversized strings, invalid 64-char hex keys, and unbounded lists.

## 2. Adversarial "Dirty Dozen" Payloads (Expected: PERMISSION_DENIED)
1. **Collection Enumeration**: `getDocs(collection(db, 'accounts'))` -> denied (`allow list: if false`).
2. **Secret Exfiltration**: `getDoc(doc(db, 'accountSecrets', validKey))` -> denied (`allow get: if false`).
3. **Secret Listing**: `getDocs(collection(db, 'accountSecrets'))` -> denied (`allow list: if false`).
4. **Invalid ID Poisoning**: `getDoc(doc(db, 'accounts', 'not-a-64-char-hex'))` -> denied (`isValidId` fails).
5. **Orphan Account Create (Missing Secret)**: `setDoc(doc(db, 'accounts', key), validAccount)` without `accountSecrets` in batch -> denied (`existsAfter` fails).
6. **Ghost Field Injection**: `setDoc` including `isAdmin: true` on `accounts` -> denied (`hasOnly` fails).
7. **Plaintext Password Leak**: `statePayload.currentUser.password = 'secret123'` -> denied (`password == ''` check fails).
8. **Unauthorized State Overwrite**: `updateDoc(doc(db, 'accounts', key), { statePayload })` without matching `previousAuthVerifier` batch write on `accountSecrets` -> denied (`getAfter` fails).
9. **Wrong AuthVerifier Spoof**: Batch updating `accounts` and `accountSecrets` with bogus `previousAuthVerifier` -> denied (`previousAuthVerifier == existing().authVerifier` fails).
10. **Immutable Field Tampering**: Trying to mutate `userId`, `normalizedName`, or `createdAt` on update -> denied.
11. **Client-Forged Timestamp**: Setting `createdAt` or `updatedAt` to a past/future Date instead of `serverTimestamp()` (`request.time`) -> denied.
12. **Arbitrary Delete**: `deleteDoc(doc(db, 'accounts', key))` -> denied (`allow delete: if false`).
