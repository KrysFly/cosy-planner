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
  /** Days on which this task was checked off (per-day validation). */
  doneDates: string[];
  /**
   * Master TODO: undated standing item, shown every day at the top.
   * Completion is always tracked per day via doneDates.
   */
  master: boolean;
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

export type MoodId = "great" | "good" | "ok" | "low" | "bad";

export type MoodDay = {
  mood: MoodId;
};

export const MOODS: ReadonlyArray<{ id: MoodId; emoji: string; label: string }> = [
  { id: "great", emoji: "😄", label: "Super" },
  { id: "good", emoji: "🙂", label: "Bien" },
  { id: "ok", emoji: "😐", label: "OK" },
  { id: "low", emoji: "😔", label: "Bof" },
  { id: "bad", emoji: "😢", label: "Difficile" },
];

export function moodEmoji(id: MoodId | undefined | null): string | null {
  if (!id) return null;
  return MOODS.find((m) => m.id === id)?.emoji ?? null;
}

function isMoodId(value: unknown): value is MoodId {
  return (
    value === "great" ||
    value === "good" ||
    value === "ok" ||
    value === "low" ||
    value === "bad"
  );
}

export function normalizeMoodByDate(
  raw: unknown,
): Record<string, MoodDay> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, MoodDay> = {};
  for (const [iso, entry] of Object.entries(raw as Record<string, unknown>)) {
    if (!entry || typeof entry !== "object") continue;
    const mood = (entry as { mood?: unknown }).mood;
    if (isMoodId(mood)) out[iso] = { mood };
  }
  return out;
}

/** Planner payload stored in Firestore (no auth user). */
export type PlannerData = {
  tasks: Task[];
  groups: Group[];
  waterByDate: Record<string, WaterDay>;
  waterDefaultGoal: number;
  waterEnabled: boolean;
  /** Per-day mood (YYYY-MM-DD → MoodDay). */
  moodByDate: Record<string, MoodDay>;
  /** Animal totem id — drives UI theme colors. */
  totemAnimalId: string;
};

export type PlannerState = PlannerData & {
  user: User | null;
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
    moodByDate: {},
    totemAnimalId: "bear",
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

function addDaysIso(iso: string, delta: number): string {
  const { y, m, d } = parseIsoParts(iso);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + delta);
  return todayIso(date);
}

/** Inclusive day count between two YYYY-MM-DD dates (1 if same day). */
function inclusiveSpanDays(start: string, end: string): number {
  if (end < start) return 1;
  const a = parseIsoParts(start);
  const b = parseIsoParts(end);
  const ms =
    new Date(b.y, b.m - 1, b.d).getTime() - new Date(a.y, a.m - 1, a.d).getTime();
  return Math.floor(ms / 86_400_000) + 1;
}

/** First day of the (first) occurrence span. */
function occurrenceAnchor(task: Task): string {
  return task.startDate ?? task.date;
}

/** How many days each occurrence covers (from début→fin, or 1 day). */
function occurrenceDurationDays(task: Task): number {
  const anchor = occurrenceAnchor(task);
  if (!task.endDate) return 1;
  return inclusiveSpanDays(anchor, task.endDate);
}

/** True if an occurrence of this task starts on `iso`. */
function isOccurrenceStart(task: Task, iso: string): boolean {
  const anchor = occurrenceAnchor(task);
  if (iso < anchor) return false;

  switch (task.recurrence) {
    case "once":
      return iso === anchor;
    case "daily":
      return true;
    case "weekly":
      return weekdayIndex(iso) === weekdayIndex(anchor);
    case "monthly":
      return dayOfMonth(iso) === dayOfMonth(anchor);
    default:
      return false;
  }
}

export function normalizeTask(raw: Partial<Task> & Pick<Task, "id" | "title" | "createdBy">): Task {
  const master = Boolean(raw.master);
  const date = raw.date || todayIso();
  let doneDates = Array.isArray(raw.doneDates) ? [...raw.doneDates] : [];
  const done = Boolean(raw.done);
  // Migrate legacy once tasks that only used the global `done` flag.
  if (done && doneDates.length === 0 && !master) {
    doneDates = [date];
    if (raw.startDate && raw.endDate && raw.startDate <= raw.endDate) {
      const span = inclusiveSpanDays(raw.startDate, raw.endDate);
      doneDates = Array.from({ length: span }, (_, i) => addDaysIso(raw.startDate!, i));
    }
  }
  return {
    id: raw.id,
    title: raw.title,
    done,
    date,
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
    doneDates,
    master,
  };
}

/**
 * True if the task should appear on the given YYYY-MM-DD day.
 * Master TODOs appear every day. Otherwise début/fin define the duration
 * of one occurrence (inclusive); recurring tasks repeat that span.
 */
export function taskOccursOn(task: Task, iso: string): boolean {
  if (task.master) return true;
  const duration = occurrenceDurationDays(task);
  for (let offset = 0; offset < duration; offset += 1) {
    if (isOccurrenceStart(task, addDaysIso(iso, -offset))) return true;
  }
  return false;
}

/** Completion is always per calendar day (incl. multi-day and master tasks). */
export function isTaskDoneOn(task: Task, iso: string): boolean {
  return task.doneDates.includes(iso);
}

export function toggleTaskOnDate(task: Task, iso: string): Task {
  const done = task.doneDates.includes(iso);
  const doneDates = done
    ? task.doneDates.filter((day) => day !== iso)
    : [...task.doneDates, iso];
  return {
    ...task,
    doneDates,
    // Keep legacy `done` in sync for once non-master tasks.
    done: task.master || task.recurrence !== "once" ? false : doneDates.length > 0,
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
      moodByDate: normalizeMoodByDate(parsed.moodByDate),
      totemAnimalId:
        typeof parsed.totemAnimalId === "string" && parsed.totemAnimalId
          ? parsed.totemAnimalId
          : "bear",
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
