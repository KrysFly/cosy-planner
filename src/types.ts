export type AuthProvider = "google" | "demo";

export type User = {
  id: string;
  name: string;
  email: string;
  picture?: string;
  provider: AuthProvider;
};

export type BulletKind = "task" | "event" | "note";

export type Task = {
  id: string;
  title: string;
  done: boolean;
  date: string;
  bullet: BulletKind;
  groupId: string | null;
  createdBy: string;
};

export type Group = {
  id: string;
  name: string;
  inviteCode: string;
  adminIds: string[];
  memberIds: string[];
};

export type WaterDay = {
  goal: number;
  drunk: number;
  enabled: boolean;
};

export type PlannerState = {
  user: User | null;
  tasks: Task[];
  groups: Group[];
  waterByDate: Record<string, WaterDay>;
  waterDefaultGoal: number;
  waterEnabled: boolean;
};

export const STORAGE_KEY = "cosy-planner-v1";

export function todayIso(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function uid(prefix = "id"): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function inviteCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

export function emptyState(): PlannerState {
  return {
    user: null,
    tasks: [],
    groups: [],
    waterByDate: {},
    waterDefaultGoal: 8,
    waterEnabled: false,
  };
}

export function loadState(): PlannerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<PlannerState>;
    return { ...emptyState(), ...parsed };
  } catch {
    return emptyState();
  }
}

export function saveState(state: PlannerState): void {
  const { user, ...rest } = state;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...rest, user }));
}

export function parseJwtPayload(token: string): {
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
} {
  const payload = token.split(".")[1];
  const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
  return JSON.parse(json) as {
    sub: string;
    name?: string;
    email?: string;
    picture?: string;
  };
}
