import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signOut,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirestoreDb, isFirebaseConfigured } from "./firebase";
import {
  emptyState,
  normalizeMoodByDate,
  normalizeTask,
  type PlannerData,
  type PlannerState,
  type Task,
  type User,
} from "./types";

export type SyncStatus = "idle" | "loading" | "saving" | "synced" | "error" | "offline";

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
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export function createDebouncedSaver(
  delayMs = 500,
  onResult?: (ok: boolean) => void,
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
      .catch(() => onResult?.(false))
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
