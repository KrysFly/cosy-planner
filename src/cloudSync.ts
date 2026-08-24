import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signOut,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  arrayUnion,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { getFirebaseAuth, getFirestoreDb, isFirebaseConfigured } from "./firebase";
import {
  emptyState,
  inviteCode as generateInviteCode,
  normalizeMoodByDate,
  normalizeTask,
  uid,
  type Group,
  type PlannerData,
  type PlannerState,
  type Task,
  type User,
} from "./types";

export type SyncStatus = "idle" | "loading" | "saving" | "synced" | "error" | "offline";

export function formatCloudError(error: unknown): string {
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code: unknown }).code)
      : "";
  const message =
    error && typeof error === "object" && "message" in error
      ? String((error as { message: unknown }).message)
      : error instanceof Error
        ? error.message
        : "";

  if (code.includes("permission-denied") || message.includes("permission-denied")) {
    return "Firestore refuse l’accès : active Auth Google et publie les règles (firestore.rules).";
  }
  if (
    code.includes("not-found") ||
    message.includes("does not exist") ||
    message.toLowerCase().includes("database")
  ) {
    return "Base Firestore absente : crée-la dans Firebase Console → Firestore Database.";
  }
  if (code.includes("auth/") || code.startsWith("auth/")) {
    return `Auth Google Firebase : ${code}. Active le fournisseur Google dans Authentication.`;
  }
  if (code.includes("unauthorized-domain") || message.includes("unauthorized-domain")) {
    return "Domaine non autorisé : ajoute krysfly.github.io dans Authentication → Settings.";
  }
  if (code) return `${code}${message ? ` — ${message}` : ""}`;
  return message || "Erreur de synchronisation inconnue.";
}

/** Firestore rejects `undefined` fields. */
function stripUndefined<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function userDocRef(uid: string) {
  const db = getFirestoreDb();
  if (!db) throw new Error("Firestore non configuré");
  return doc(db, "users", uid);
}

export function plannerDataFromState(state: PlannerState): PlannerData {
  return {
    tasks: state.tasks,
    groups: state.groups,
    waterByDate: state.waterByDate,
    waterDefaultGoal: state.waterDefaultGoal,
    waterEnabled: state.waterEnabled,
    moodByDate: state.moodByDate,
    totemAnimalId: state.totemAnimalId,
  };
}

export function normalizePlannerData(raw: Partial<PlannerData> | undefined): PlannerData {
  const base = emptyState();
  return {
    tasks: (raw?.tasks ?? []).map((task) =>
      normalizeTask(task as Partial<Task> & Pick<Task, "id" | "title" | "createdBy">),
    ),
    groups: Array.isArray(raw?.groups) ? raw.groups : [],
    waterByDate: raw?.waterByDate && typeof raw.waterByDate === "object" ? raw.waterByDate : {},
    waterDefaultGoal:
      typeof raw?.waterDefaultGoal === "number" ? raw.waterDefaultGoal : base.waterDefaultGoal,
    waterEnabled: Boolean(raw?.waterEnabled),
    moodByDate: normalizeMoodByDate(raw?.moodByDate),
    totemAnimalId:
      typeof raw?.totemAnimalId === "string" && raw.totemAnimalId
        ? raw.totemAnimalId
        : base.totemAnimalId,
  };
}

export async function signInWithGoogleIdToken(idToken: string): Promise<User> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase non configuré");
  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, credential);
  return userFromFirebase(result.user);
}

export function userFromFirebase(fbUser: FirebaseUser): User {
  return {
    id: fbUser.uid,
    name: fbUser.displayName || "Ami·e Google",
    email: fbUser.email || "",
    picture: fbUser.photoURL ?? undefined,
    provider: "google",
  };
}

export async function signOutCloud(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) return;
  await signOut(auth);
}

/** Subscribe to Firebase Auth; returns unsubscribe. */
export function watchAuth(onUser: (user: User | null) => void): () => void {
  const auth = getFirebaseAuth();
  if (!auth) {
    onUser(null);
    return () => undefined;
  }
  return onAuthStateChanged(auth, (fbUser) => {
    onUser(fbUser ? userFromFirebase(fbUser) : null);
  });
}

/** Returns null if the document does not exist yet. */
export async function loadUserPlanner(uid: string): Promise<PlannerData | null> {
  if (!isFirebaseConfigured()) return null;
  const snap = await getDoc(userDocRef(uid));
  if (!snap.exists()) return null;
  return normalizePlannerData(snap.data() as Partial<PlannerData>);
}

export async function saveUserPlanner(uid: string, data: PlannerData): Promise<void> {
  if (!isFirebaseConfigured()) return;
  await setDoc(
    userDocRef(uid),
    {
      ...stripUndefined(data),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export function createDebouncedSaver(
  delayMs = 500,
  onResult?: (ok: boolean, error?: unknown) => void,
): {
  schedule: (uid: string, data: PlannerData) => void;
  flush: () => Promise<void>;
  cancel: () => void;
} {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: { uid: string; data: PlannerData } | null = null;
  let inFlight: Promise<void> | null = null;

  const run = async () => {
    if (!pending) return;
    const job = pending;
    pending = null;
    inFlight = saveUserPlanner(job.uid, job.data)
      .then(() => onResult?.(true))
      .catch((error) => onResult?.(false, error))
      .finally(() => {
        inFlight = null;
      });
    await inFlight;
  };

  return {
    schedule(uid, data) {
      pending = { uid, data };
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        void run();
      }, delayMs);
    },
    async flush() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      if (inFlight) await inFlight;
      await run();
    },
    cancel() {
      if (timer) clearTimeout(timer);
      timer = null;
      pending = null;
    },
  };
}

function requireDb() {
  const db = getFirestoreDb();
  if (!db) throw new Error("Firestore non configuré");
  return db;
}

function normalizeGroup(raw: Partial<Group> & Pick<Group, "id">): Group {
  return {
    id: raw.id,
    name: typeof raw.name === "string" ? raw.name : "Groupe",
    inviteCode: typeof raw.inviteCode === "string" ? raw.inviteCode.toUpperCase() : "",
    adminIds: Array.isArray(raw.adminIds) ? raw.adminIds.map(String) : [],
    memberIds: Array.isArray(raw.memberIds) ? raw.memberIds.map(String) : [],
  };
}

export async function loadSharedGroup(groupId: string): Promise<Group | null> {
  if (!isFirebaseConfigured()) return null;
  const snap = await getDoc(doc(requireDb(), "groups", groupId));
  if (!snap.exists()) return null;
  return normalizeGroup({ id: snap.id, ...(snap.data() as Partial<Group>) });
}

/**
 * Creates a shared group + invite index. Retries a few times on invite code collision.
 */
export async function createSharedGroup(
  ownerId: string,
  name: string,
): Promise<Group> {
  const db = requireDb();
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Nom de groupe requis");

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const group: Group = {
      id: uid("group"),
      name: trimmed,
      inviteCode: generateInviteCode(),
      adminIds: [ownerId],
      memberIds: [ownerId],
    };
    const inviteRef = doc(db, "invites", group.inviteCode);
    const existing = await getDoc(inviteRef);
    if (existing.exists()) continue;

    const batch = writeBatch(db);
    batch.set(doc(db, "groups", group.id), {
      ...stripUndefined(group),
      createdAt: serverTimestamp(),
    });
    batch.set(inviteRef, { groupId: group.id });
    await batch.commit();
    return group;
  }

  throw new Error("Impossible de générer un code d’invitation unique.");
}

export type JoinSharedResult =
  | { ok: true; group: Group; alreadyMember: boolean }
  | { ok: false; reason: "not_found" | "unavailable" };

/**
 * Resolves invite code → shared group, adds the user to memberIds if needed.
 */
export async function joinSharedGroupByCode(
  userId: string,
  code: string,
): Promise<JoinSharedResult> {
  if (!isFirebaseConfigured()) return { ok: false, reason: "unavailable" };
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { ok: false, reason: "not_found" };

  const db = requireDb();
  const inviteSnap = await getDoc(doc(db, "invites", normalized));
  if (!inviteSnap.exists()) return { ok: false, reason: "not_found" };

  const groupId = String((inviteSnap.data() as { groupId?: unknown }).groupId ?? "");
  if (!groupId) return { ok: false, reason: "not_found" };

  const groupRef = doc(db, "groups", groupId);
  const groupSnap = await getDoc(groupRef);
  if (!groupSnap.exists()) return { ok: false, reason: "not_found" };

  let group = normalizeGroup({ id: groupSnap.id, ...(groupSnap.data() as Partial<Group>) });
  if (group.memberIds.includes(userId)) {
    return { ok: true, group, alreadyMember: true };
  }

  await updateDoc(groupRef, { memberIds: arrayUnion(userId) });
  group = { ...group, memberIds: [...group.memberIds, userId] };
  return { ok: true, group, alreadyMember: false };
}

/** Shareable invite URL for the current deployment (respects Vite base). */
export function buildInviteLink(code: string): string {
  const normalized = code.trim().toUpperCase();
  const base = import.meta.env.BASE_URL || "/";
  const url = new URL(base, window.location.origin);
  url.searchParams.set("join", normalized);
  return url.toString();
}

/** Read pending invite code from `?join=` (or hash query) and optionally strip it from the URL. */
export function readJoinCodeFromUrl(options?: { clear?: boolean }): string | null {
  const fromSearch = new URLSearchParams(window.location.search).get("join");
  let fromHash: string | null = null;
  const hash = window.location.hash;
  if (hash.includes("?")) {
    fromHash = new URLSearchParams(hash.slice(hash.indexOf("?") + 1)).get("join");
  } else if (hash.startsWith("#join=")) {
    fromHash = decodeURIComponent(hash.slice("#join=".length));
  }

  const code = (fromSearch || fromHash || "").trim().toUpperCase();
  if (!code) return null;

  if (options?.clear !== false) {
    const url = new URL(window.location.href);
    url.searchParams.delete("join");
    if (url.hash.includes("?")) {
      const [path, qs] = url.hash.split("?");
      const params = new URLSearchParams(qs);
      params.delete("join");
      const next = params.toString();
      url.hash = next ? `${path}?${next}` : path;
    } else if (url.hash.startsWith("#join=")) {
      url.hash = "";
    }
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }

  return code;
}
