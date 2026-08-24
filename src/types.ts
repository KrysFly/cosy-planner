export type AuthProvider = "google" | "demo";

export type User = {
  id: string;
  name: string;
  email: string;
  picture?: string;
  provider: AuthProvider;
};

export type BulletKind = "task" | "event" | "note";

export type Recurrence = "once" | "daily" | "weekly" | "monthly";

export type Task = {
  id: string;
  title: string;
  done: boolean;
  date: string;
  bullet: BulletKind;
  groupId: string | null;
  createdBy: string;
  recurrence: Recurrence;
  startDate: string | null;
  endDate: string | null;
  icon: string;
  color: string;
  doneDates: string[];
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

export const CUTE_ICONS = [
  "✨",
  "🌸",
  "⭐",
  "🐻",
  "🍓",
  "☁️",
  "🎀",
  "🌱",
  "☕",
  "🐱",
  "🐰",
  "🌙",
  "💌",
  "🧁",
  "🧸",
  "🦋",
  "🍋",
  "🫧",
] as const;

export const TASK_COLORS = [
  "#f3a6c0",
  "#a78bfa",
  "#67c4ae",
  "#f5b47a",
  "#7eb8e8",
  "#e8c84a",
  "#ef8a7a",
  "#c4b5fd",
  "#9ad9c6",
  "#f0a0d0",
] as const;

export const DEFAULT_BULLET_COLORS: Record<BulletKind, string> = {
  task: "#f3a6c0",
  event: "#a78bfa",
  note: "#67c4ae",
};

export const RECURRENCE_LABELS: Record<Recurrence, string> = {
  once: "Une fois",
  daily: "Quotidien",
  weekly: "Hebdomadaire",
  monthly: "Mensuel",
};

/** Glyph shown on the agenda when a task has no custom icon. */
export function agendaGlyph(task: Pick<Task, "icon" | "bullet">): string {
  if (task.icon) return task.icon;
  if (task.bullet === "event") return "◆";
  if (task.bullet === "note") return "✎";
  return "•";
}

export function taskColor(task: Pick<Task, "color" | "bullet">): string {
  return task.color || DEFAULT_BULLET_COLORS[task.bullet];
}

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

function parseIsoParts(iso: string): { y: number; m: number; d: number } {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
}

function weekdayIndex(iso: string): number {
  const { y, m, d } = parseIsoParts(iso);
  return new Date(y, m - 1, d).getDay();
}

function dayOfMonth(iso: string): number {
  return parseIsoParts(iso).d;
}

export function normalizeTask(raw: Partial<Task> & Pick<Task, "id" | "title" | "createdBy">): Task {
  return {
    id: raw.id,
    title: raw.title,
    done: Boolean(raw.done),
    date: raw.date || todayIso(),
    bullet: raw.bullet === "event" || raw.bullet === "note" ? raw.bullet : "task",
    groupId: raw.groupId ?? null,
    createdBy: raw.createdBy,
    recurrence:
      raw.recurrence === "daily" ||
      raw.recurrence === "weekly" ||
      raw.recurrence === "monthly" ||
      raw.recurrence === "once"
        ? raw.recurrence
        : "once",
    startDate: raw.startDate || null,
    endDate: raw.endDate || null,
    icon: typeof raw.icon === "string" ? raw.icon : "",
    color:
      typeof raw.color === "string" && raw.color
        ? raw.color
        : DEFAULT_BULLET_COLORS[
            raw.bullet === "event" || raw.bullet === "note" ? raw.bullet : "task"
          ],
    doneDates: Array.isArray(raw.doneDates) ? raw.doneDates : [],
  };
}

/** True if the task should appear on the given YYYY-MM-DD day. */
export function taskOccursOn(task: Task, iso: string): boolean {
  if (task.startDate && iso < task.startDate) return false;
  if (task.endDate && iso > task.endDate) return false;

  switch (task.recurrence) {
    case "once":
      return iso === task.date;
    case "daily":
      return true;
    case "weekly":
      return weekdayIndex(iso) === weekdayIndex(task.date);
    case "monthly":
      return dayOfMonth(iso) === dayOfMonth(task.date);
    default:
      return false;
  }
}

export function isTaskDoneOn(task: Task, iso: string): boolean {
  if (task.recurrence === "once") return task.done;
  return task.doneDates.includes(iso);
}

export function toggleTaskOnDate(task: Task, iso: string): Task {
  if (task.recurrence === "once") {
    return { ...task, done: !task.done };
  }
  const done = task.doneDates.includes(iso);
  return {
    ...task,
    doneDates: done
      ? task.doneDates.filter((day) => day !== iso)
      : [...task.doneDates, iso],
  };
}

export function loadState(): PlannerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<PlannerState>;
    const base = { ...emptyState(), ...parsed };
    return {
      ...base,
      tasks: (parsed.tasks ?? []).map((task) =>
        normalizeTask(task as Partial<Task> & Pick<Task, "id" | "title" | "createdBy">),
      ),
    };
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
