import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  animalForDate,
  ANIMALS,
  getAnimal,
  KawaiiAnimal,
  themeFromAnimal,
  type AnimalId,
} from "./animals";
import {
  buildInviteLink,
  createDebouncedSaver,
  createSharedGroup,
  deleteSharedGroup,
  formatCloudError,
  joinSharedGroupByCode,
  loadUserPlanner,
  plannerDataFromState,
  readJoinCodeFromUrl,
  saveUserPlanner,
  signInWithGoogleIdToken,
  signOutCloud,
  watchAuth,
  type SyncStatus,
} from "./cloudSync";
import { isFirebaseConfigured } from "./firebase";
import {
  agendaGlyph,
  CUTE_ICONS,
  DEFAULT_BULLET_COLORS,
  inviteCode,
  isTaskDoneOn,
  loadState,
  moodEmoji,
  MOODS,
  parseJwtPayload,
  RECURRENCE_LABELS,
  saveState,
  TASK_COLORS,
  taskColor,
  taskOccursOn,
  todayIso,
  toggleTaskOnDate,
  uid,
  type BulletKind,
  type Group,
  type MoodId,
  type PlannerState,
  type Recurrence,
  type Task,
  type User,
} from "./types";

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";
const FIREBASE_READY = isFirebaseConfigured();

function monthLabel(cursor: Date): string {
  return cursor.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

function startOfCalendar(cursor: Date): Date {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const weekday = (first.getDay() + 6) % 7;
  first.setDate(first.getDate() - weekday);
  return first;
}

function daysInGrid(cursor: Date): Date[] {
  const start = startOfCalendar(cursor);
  return Array.from({ length: 42 }, (_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    return day;
  });
}

function userFromGoogleJwt(credential: string): User {
  const payload = parseJwtPayload(credential);
  return {
    id: `google-${payload.sub}`,
    name: payload.name || "Ami·e Google",
    email: payload.email || "",
    picture: payload.picture,
    provider: "google",
  };
}

function syncLabel(status: SyncStatus): string | null {
  switch (status) {
    case "loading":
      return "Chargement…";
    case "saving":
      return "Sync…";
    case "synced":
      return "Synchronisé";
    case "error":
      return "Erreur de sync";
    case "offline":
      return "Hors ligne";
    default:
      return null;
  }
}

export default function App() {
  const [state, setState] = useState<PlannerState>(() => {
    const loaded = loadState();
    // Firebase session is restored via watchAuth; avoid a stale Google cache.
    if (FIREBASE_READY && loaded.user?.provider === "google") {
      return { ...loaded, user: null };
    }
    return loaded;
  });
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [title, setTitle] = useState("");
  const [masterTitle, setMasterTitle] = useState("");
  const [masterIcon, setMasterIcon] = useState("📌");
  const [masterCustomIcon, setMasterCustomIcon] = useState("");
  const [bullet, setBullet] = useState<BulletKind>("task");
  const [groupId, setGroupId] = useState<string>("");
  const [recurrence, setRecurrence] = useState<Recurrence>("once");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [icon, setIcon] = useState("✨");
  const [customIcon, setCustomIcon] = useState("");
  const [color, setColor] = useState<string>(DEFAULT_BULLET_COLORS.task);
  const [panel, setPanel] = useState<"tasks" | "master" | "groups">("tasks");
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [masterFormOpen, setMasterFormOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [groupMessage, setGroupMessage] = useState("");
  const [groupBusy, setGroupBusy] = useState(false);
  const [copiedLinkFor, setCopiedLinkFor] = useState<string | null>(null);
  const [googleReady, setGoogleReady] = useState(false);
  const [totemOpen, setTotemOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [syncError, setSyncError] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const totemRef = useRef<HTMLDivElement>(null);
  const skipNextCloudSave = useRef(false);
  const hydratedCloudUid = useRef<string | null>(null);
  const pendingJoinRef = useRef<string | null>(null);
  const joinAttemptKeyRef = useRef<string | null>(null);
  const cloudSaver = useRef(
    createDebouncedSaver(500, (ok, error) => {
      if (ok) {
        setSyncError(null);
        setSyncStatus("synced");
        return;
      }
      setSyncError(formatCloudError(error));
      setSyncStatus("error");
    }),
  );

  const user = state.user;
  const isCloudUser = Boolean(user && user.provider === "google" && FIREBASE_READY);

  useEffect(() => {
    const code = readJoinCodeFromUrl({ clear: true });
    if (!code) return;
    pendingJoinRef.current = code;
    setJoinCode(code);
    setPanel("groups");
    setGroupMessage("Code d’invitation détecté. Connecte-toi pour rejoindre le groupe.");
  }, []);

  useEffect(() => {
    if (!user) return;
    if (user.provider === "demo" || !FIREBASE_READY) {
      saveState(state);
      return;
    }
    if (user.provider === "google") {
      // Local cache for faster reopen; source of truth is Firestore.
      saveState(state);
      if (skipNextCloudSave.current) {
        skipNextCloudSave.current = false;
        return;
      }
      if (hydratedCloudUid.current !== user.id) return;
      setSyncStatus("saving");
      cloudSaver.current.schedule(user.id, plannerDataFromState(state));
    }
  }, [state, user]);

  useEffect(() => {
    const saver = cloudSaver.current;
    return () => {
      saver.cancel();
    };
  }, []);

  const hydrateFromCloud = useCallback(
    async (nextUser: User, localSnapshot: PlannerState) => {
      if (!FIREBASE_READY || nextUser.provider !== "google") {
        setState({ ...localSnapshot, user: nextUser });
        return;
      }
      setSyncStatus("loading");
      setSyncError(null);
      try {
        const remote = await loadUserPlanner(nextUser.id);
        if (remote) {
          skipNextCloudSave.current = true;
          hydratedCloudUid.current = nextUser.id;
          setState({ ...remote, user: nextUser });
          setSyncStatus("synced");
          return;
        }
        const migrated = plannerDataFromState(localSnapshot);
        await saveUserPlanner(nextUser.id, migrated);
        skipNextCloudSave.current = true;
        hydratedCloudUid.current = nextUser.id;
        setState({ ...migrated, user: nextUser });
        setSyncStatus("synced");
      } catch (error) {
        skipNextCloudSave.current = true;
        hydratedCloudUid.current = nextUser.id;
        setState({ ...localSnapshot, user: nextUser });
        setSyncError(formatCloudError(error));
        setSyncStatus("error");
      }
    },
    [],
  );

  useEffect(() => {
    if (!FIREBASE_READY) return;
    let cancelled = false;
    const unsub = watchAuth((authUser) => {
      if (cancelled) return;
      if (authUser) {
        if (hydratedCloudUid.current === authUser.id) return;
        void hydrateFromCloud(authUser, loadState());
        return;
      }
      setState((current) => {
        if (current.user?.provider === "google") {
          hydratedCloudUid.current = null;
          setSyncStatus("idle");
          return { ...current, user: null };
        }
        return current;
      });
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, [hydrateFromCloud]);

  const login = useCallback((nextUser: User) => {
    setState((current) => ({ ...current, user: nextUser }));
  }, []);

  const handleGoogleCredential = useCallback(
    async (credential: string) => {
      setAuthBusy(true);
      const localSnapshot = loadState();
      try {
        if (FIREBASE_READY) {
          const nextUser = await signInWithGoogleIdToken(credential);
          await hydrateFromCloud(nextUser, { ...localSnapshot, user: nextUser });
        } else {
          const nextUser = userFromGoogleJwt(credential);
          hydratedCloudUid.current = null;
          setSyncStatus("idle");
          setSyncError(null);
          setState({ ...localSnapshot, user: nextUser });
        }
      } catch (error) {
        setSyncError(formatCloudError(error));
        setSyncStatus("error");
        // Do not fall back to a JWT-only Google session when Firebase is on:
        // Firestore would keep failing without Auth.
        if (!FIREBASE_READY) {
          const nextUser = userFromGoogleJwt(credential);
          setState({ ...localSnapshot, user: nextUser });
        }
      } finally {
        setAuthBusy(false);
      }
    },
    [hydrateFromCloud],
  );

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || state.user) return;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => setGoogleReady(true);
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [state.user]);

  useEffect(() => {
    if (!googleReady || !GOOGLE_CLIENT_ID || state.user) return;
    const slot = document.getElementById("google-signin");
    if (!slot || !window.google) return;
    slot.replaceChildren();
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => {
        void handleGoogleCredential(response.credential);
      },
      ux_mode: "popup",
      auto_select: false,
      itp_support: true,
      use_fedcm_for_prompt: true,
    });
    window.google.accounts.id.renderButton(slot, {
      theme: "outline",
      size: "large",
      shape: "pill",
      text: "continue_with",
      locale: "fr",
      width: 320,
    });
  }, [googleReady, handleGoogleCredential, state.user]);

  const totem = getAnimal(state.totemAnimalId);
  const theme = useMemo(() => themeFromAnimal(totem), [totem]);

  useEffect(() => {
    const root = document.documentElement;
    for (const [key, value] of Object.entries(theme)) {
      root.style.setProperty(key, value);
    }
  }, [theme]);

  useEffect(() => {
    if (!totemOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (totemRef.current && !totemRef.current.contains(event.target as Node)) {
        setTotemOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setTotemOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [totemOpen]);

  const monthDays = useMemo(() => daysInGrid(cursor), [cursor]);
  const selectedAnimal = animalForDate(selectedDate);
  const myGroups = state.groups.filter((group) => user && group.memberIds.includes(user.id));

  const visibleTasks = useMemo(() => {
    if (!user) return [] as Task[];
    return state.tasks.filter((task) => {
      if (!task.groupId) return task.createdBy === user.id;
      return myGroups.some((group) => group.id === task.groupId);
    });
  }, [myGroups, state.tasks, user]);

  const dayTasks = visibleTasks.filter(
    (task) => !task.master && taskOccursOn(task, selectedDate),
  );
  const masterTasks = visibleTasks.filter((task) => task.master);

  const water = state.waterByDate[selectedDate] ?? {
    goal: state.waterDefaultGoal,
    drunk: 0,
    enabled: state.waterEnabled,
  };
  const dayMood = state.moodByDate[selectedDate]?.mood ?? null;
  const dayMoodComment = state.moodByDate[selectedDate]?.comment ?? "";

  const chosenIcon = customIcon.trim() || icon;
  const chosenMasterIcon = masterCustomIcon.trim() || masterIcon;
  const statusText = isCloudUser ? syncLabel(syncStatus) : null;

  function update(partial: Partial<PlannerState>) {
    setState((current) => ({ ...current, ...partial }));
  }

  function setTotem(id: AnimalId) {
    update({ totemAnimalId: id });
    setTotemOpen(false);
  }

  async function logout() {
    cloudSaver.current.cancel();
    hydratedCloudUid.current = null;
    setSyncStatus("idle");
    setSyncError(null);
    if (FIREBASE_READY && user?.provider === "google") {
      try {
        await signOutCloud();
      } catch {
        // Ignore sign-out errors; still clear local session.
      }
    }
    update({ user: null });
  }

  function addTask(event: FormEvent) {
    event.preventDefault();
    if (!user || !title.trim()) return;
    const spanStart = startDate || selectedDate;
    if (endDate && spanStart > endDate) return;
    const task: Task = {
      id: uid("task"),
      title: title.trim(),
      done: false,
      date: startDate || selectedDate,
      bullet,
      groupId: groupId || null,
      createdBy: user.id,
      recurrence,
      startDate: startDate || null,
      endDate: endDate || null,
      icon: chosenIcon,
      color,
      doneDates: [],
      master: false,
    };
    update({ tasks: [...state.tasks, task] });
    setTitle("");
    setCustomIcon("");
    setAddFormOpen(false);
  }

  function addMasterTask(event: FormEvent) {
    event.preventDefault();
    if (!user || !masterTitle.trim()) return;
    const task: Task = {
      id: uid("master"),
      title: masterTitle.trim(),
      done: false,
      date: todayIso(),
      bullet: "task",
      groupId: null,
      createdBy: user.id,
      recurrence: "once",
      startDate: null,
      endDate: null,
      icon: chosenMasterIcon || "📌",
      color: DEFAULT_BULLET_COLORS.task,
      doneDates: [],
      master: true,
    };
    update({ tasks: [...state.tasks, task] });
    setMasterTitle("");
    setMasterCustomIcon("");
    setMasterFormOpen(false);
  }

  function toggleTask(id: string) {
    update({
      tasks: state.tasks.map((task) =>
        task.id === id ? toggleTaskOnDate(task, selectedDate) : task,
      ),
    });
  }

  function removeTask(id: string) {
    update({ tasks: state.tasks.filter((task) => task.id !== id) });
  }

  /** Swap with the adjacent peer in the visible list (masters among masters, day tasks among day tasks). */
  function moveTask(id: string, direction: -1 | 1, peerIds: string[]) {
    const peerIndex = peerIds.indexOf(id);
    const swapId = peerIds[peerIndex + direction];
    if (!swapId) return;
    const tasks = [...state.tasks];
    const from = tasks.findIndex((task) => task.id === id);
    const to = tasks.findIndex((task) => task.id === swapId);
    if (from < 0 || to < 0) return;
    [tasks[from], tasks[to]] = [tasks[to], tasks[from]];
    update({ tasks });
  }

  function mergeJoinedGroup(group: Group) {
    setState((current) => {
      const exists = current.groups.some((item) => item.id === group.id);
      return {
        ...current,
        groups: exists
          ? current.groups.map((item) => (item.id === group.id ? group : item))
          : [...current.groups, group],
      };
    });
  }

  async function performJoin(codeRaw: string): Promise<void> {
    if (!user) return;
    const code = codeRaw.trim().toUpperCase();
    if (!code) return;

    const local = state.groups.find((group) => group.inviteCode === code);
    if (local?.memberIds.includes(user.id)) {
      setGroupMessage(`Tu es déjà dans « ${local.name} ».`);
      setJoinCode("");
      return;
    }

    if (isCloudUser) {
      setGroupBusy(true);
      try {
        const result = await joinSharedGroupByCode(user.id, code);
        if (!result.ok) {
          setGroupMessage(
            result.reason === "not_found"
              ? "Code inconnu. Vérifie le lien ou demande un nouveau code."
              : "Impossible de rejoindre ce groupe pour le moment.",
          );
          return;
        }
        mergeJoinedGroup(result.group);
        setGroupMessage(
          result.alreadyMember
            ? `Tu es déjà dans « ${result.group.name} ».`
            : `Bienvenue dans « ${result.group.name} » !`,
        );
        setJoinCode("");
      } catch (error) {
        setGroupMessage(formatCloudError(error));
      } finally {
        setGroupBusy(false);
      }
      return;
    }

    if (!local) {
      setGroupMessage(
        "Code inconnu sur cet appareil. En mode démo, le code ne marche que sur le même navigateur — connecte-toi avec Google pour rejoindre via un lien.",
      );
      return;
    }

    mergeJoinedGroup({ ...local, memberIds: [...local.memberIds, user.id] });
    setGroupMessage(`Bienvenue dans « ${local.name} » !`);
    setJoinCode("");
  }

  async function createGroup(event: FormEvent) {
    event.preventDefault();
    if (!user || !groupName.trim() || groupBusy) return;
    const name = groupName.trim();

    if (isCloudUser) {
      setGroupBusy(true);
      try {
        const group = await createSharedGroup(user.id, name);
        setState((current) => ({ ...current, groups: [...current.groups, group] }));
        setGroupName("");
        setGroupMessage(
          `Groupe « ${group.name} » créé. Partage le lien ou le code ${group.inviteCode}.`,
        );
      } catch (error) {
        setGroupMessage(formatCloudError(error));
      } finally {
        setGroupBusy(false);
      }
      return;
    }

    const group: Group = {
      id: uid("group"),
      name,
      inviteCode: inviteCode(),
      adminIds: [user.id],
      memberIds: [user.id],
    };
    update({ groups: [...state.groups, group] });
    setGroupName("");
    setGroupMessage(`Groupe « ${group.name} » créé. Partage le lien ou le code ${group.inviteCode}.`);
  }

  function joinGroup(event: FormEvent) {
    event.preventDefault();
    if (!user || !joinCode.trim() || groupBusy) return;
    void performJoin(joinCode);
  }

  async function copyInviteLink(group: Group) {
    const link = buildInviteLink(group.inviteCode);
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLinkFor(group.id);
      setGroupMessage(`Lien copié pour « ${group.name} ».`);
      window.setTimeout(() => {
        setCopiedLinkFor((current) => (current === group.id ? null : current));
      }, 2000);
    } catch {
      setGroupMessage(`Copie ce lien : ${link}`);
    }
  }

  async function deleteGroup(group: Group) {
    if (!user || !group.adminIds.includes(user.id) || groupBusy) return;
    const ok = window.confirm(
      `Supprimer le groupe « ${group.name} » ? Les membres ne pourront plus le rejoindre avec ce code.`,
    );
    if (!ok) return;

    if (isCloudUser) {
      setGroupBusy(true);
      try {
        await deleteSharedGroup(group);
      } catch (error) {
        setGroupMessage(formatCloudError(error));
        setGroupBusy(false);
        return;
      }
      setGroupBusy(false);
    }

    setState((current) => ({
      ...current,
      groups: current.groups.filter((item) => item.id !== group.id),
      tasks: current.tasks.map((task) =>
        task.groupId === group.id ? { ...task, groupId: null } : task,
      ),
    }));
    if (groupId === group.id) setGroupId("");
    setGroupMessage(`Groupe « ${group.name} » supprimé.`);
  }

  useEffect(() => {
    const code = pendingJoinRef.current;
    if (!user || !code || groupBusy) return;
    if (isCloudUser && hydratedCloudUid.current !== user.id) return;
    const attemptKey = `${user.id}:${code}`;
    if (joinAttemptKeyRef.current === attemptKey) return;
    joinAttemptKeyRef.current = attemptKey;
    pendingJoinRef.current = null;
    setPanel("groups");
    setJoinCode(code);
    void performJoin(code);
  }, [user, isCloudUser, syncStatus, groupBusy, state.groups]);

  function toggleAdmin(group: Group, memberId: string) {
    if (!user || !group.adminIds.includes(user.id)) return;
    const isAdmin = group.adminIds.includes(memberId);
    if (isAdmin && group.adminIds.length === 1) return;
    update({
      groups: state.groups.map((item) =>
        item.id === group.id
          ? {
              ...item,
              adminIds: isAdmin
                ? item.adminIds.filter((id) => id !== memberId)
                : [...item.adminIds, memberId],
            }
          : item,
      ),
    });
  }

  function setWaterGoal(goal: number) {
    const nextGoal = Math.max(1, Math.min(16, goal));
    update({
      waterDefaultGoal: nextGoal,
      waterByDate: {
        ...state.waterByDate,
        [selectedDate]: { ...water, goal: nextGoal },
      },
    });
  }

  function toggleGlass(index: number) {
    const drunk = index < water.drunk ? index : index + 1;
    update({
      waterByDate: {
        ...state.waterByDate,
        [selectedDate]: { ...water, drunk, enabled: true },
      },
      waterEnabled: true,
    });
  }

  function setMood(mood: MoodId) {
    const next = { ...state.moodByDate };
    if (dayMood === mood) {
      delete next[selectedDate];
    } else {
      const comment = next[selectedDate]?.comment?.trim();
      next[selectedDate] = comment ? { mood, comment } : { mood };
    }
    update({ moodByDate: next });
  }

  function setMoodComment(comment: string) {
    if (!dayMood) return;
    const next = { ...state.moodByDate };
    const trimmed = comment.slice(0, 500);
    next[selectedDate] = trimmed.trim()
      ? { mood: dayMood, comment: trimmed }
      : { mood: dayMood };
    update({ moodByDate: next });
  }

  if (!user) {
    return (
      <div className="login">
        <div className="card login-card">
          <h1>Cosy Planner</h1>
          <p className="hint">
            Un bullet journal pastel, avec des animaux kawaii, pour poser tes
            tâches en douceur.
          </p>
          <div className="login-animals">
            {ANIMALS.slice(0, 6).map((animal) => (
              <KawaiiAnimal key={animal.id} animal={animal.id} size={64} />
            ))}
          </div>
          <div id="google-signin" className="google-slot" />
          {authBusy && <p className="hint">Connexion en cours…</p>}
          {syncError && (
            <p className="hint sync-error" role="alert">
              {syncError}
            </p>
          )}
          {!GOOGLE_CLIENT_ID && (
            <p className="hint">
              Ajoute <code>VITE_GOOGLE_CLIENT_ID</code> pour activer Google.
              En attendant, tu peux tester en mode démo.
            </p>
          )}
          {GOOGLE_CLIENT_ID && !FIREBASE_READY && (
            <p className="hint">
              Google est prêt, mais la sync cloud demande les variables{" "}
              <code>VITE_FIREBASE_*</code> (voir README). Sans elles, les données
              restent locales.
            </p>
          )}
          {GOOGLE_CLIENT_ID && FIREBASE_READY && (
            <p className="hint">Avec Google, ton planner est sauvegardé dans le cloud.</p>
          )}
          <button
            className="primary"
            type="button"
            onClick={() =>
              login({
                id: "demo-user",
                name: "Mode démo",
                email: "demo@cosy.local",
                provider: "demo",
              })
            }
          >
            Continuer en mode démo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand" ref={totemRef}>
          <button
            type="button"
            className={totemOpen ? "totem-trigger open" : "totem-trigger"}
            aria-label={`Changer l’animal totem (actuel : ${totem.name})`}
            aria-expanded={totemOpen}
            aria-haspopup="dialog"
            onClick={() => setTotemOpen((open) => !open)}
          >
            <KawaiiAnimal animal={totem.id} size={56} />
            <span className="totem-caret" aria-hidden="true">
              ▾
            </span>
          </button>
          <div>
            <h1>Cosy Planner</h1>
            <p>
              Totem · {totem.name} {totem.emoji}
              {statusText ? ` · ${statusText}` : ""}
            </p>
            {syncError && isCloudUser && (
              <p className="hint sync-error" role="alert">
                {syncError}
              </p>
            )}
          </div>
          {totemOpen && (
            <div className="totem-popover" role="dialog" aria-label="Choisir ton animal totem">
              <div className="totem-popover-head">
                <strong>Ton animal totem</strong>
                <span className="hint">Il colore toute l’interface</span>
              </div>
              <div className="totem-grid">
                {ANIMALS.map((animal) => (
                  <button
                    key={animal.id}
                    type="button"
                    className={
                      animal.id === totem.id ? "totem-option active" : "totem-option"
                    }
                    onClick={() => setTotem(animal.id)}
                    title={animal.name}
                    aria-label={animal.name}
                    aria-pressed={animal.id === totem.id}
                  >
                    <KawaiiAnimal animal={animal.id} size={48} />
                    <span>{animal.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="user-chip">
          {user.picture ? (
            <img src={user.picture} alt="" />
          ) : (
            <div className="avatar" />
          )}
          <span>{user.name}</span>
          <button className="ghost" type="button" onClick={() => void logout()}>
            Quitter
          </button>
        </div>
      </header>

      <div className="layout">
        <section className="card">
          <div className="agenda-head">
            <button
              className="round"
              type="button"
              aria-label="Mois précédent"
              onClick={() =>
                setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
              }
            >
              ‹
            </button>
            <h2>{monthLabel(cursor)}</h2>
            <button
              className="round"
              type="button"
              aria-label="Mois suivant"
              onClick={() =>
                setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
              }
            >
              ›
            </button>
          </div>
          <div className="weekdays">
            {WEEKDAYS.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
          <div className="month-grid">
            {monthDays.map((day) => {
              const iso = todayIso(day);
              const inMonth = day.getMonth() === cursor.getMonth();
              const dayMarks = visibleTasks.filter(
                (task) => !task.master && taskOccursOn(task, iso),
              );
              const shown = dayMarks.slice(0, 3);
              const extra = dayMarks.length - shown.length;
              const animal = animalForDate(iso);
              const moodMark = moodEmoji(state.moodByDate[iso]?.mood);
              return (
                <button
                  key={iso}
                  className={[
                    "day",
                    inMonth ? "" : "muted",
                    iso === selectedDate ? "selected" : "",
                    iso === todayIso() ? "today" : "",
                  ].join(" ")}
                  type="button"
                  onClick={() => setSelectedDate(iso)}
                >
                  <span className="day-top">
                    <span className="day-num">{day.getDate()}</span>
                    <span className="day-top-marks" aria-hidden="true">
                      {moodMark && <span className="day-mood">{moodMark}</span>}
                      <span className="day-animal">{animal.emoji}</span>
                    </span>
                  </span>
                  <span className="day-icons">
                    {shown.map((task) => {
                      const tint = taskColor(task);
                      const done = isTaskDoneOn(task, iso);
                      return (
                        <span
                          key={task.id}
                          className={done ? "day-task-icon done" : "day-task-icon"}
                          style={{
                            backgroundColor: `${tint}33`,
                            boxShadow: `inset 0 0 0 1.5px ${tint}`,
                          }}
                          title={task.title}
                        >
                          {agendaGlyph(task)}
                        </span>
                      );
                    })}
                    {extra > 0 && <span className="day-more">+{extra}</span>}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mascot-row">
            <KawaiiAnimal animal={totem.id} size={72} />
            <div>
              <strong>{totem.name} veille sur ta journée</strong>
              <span className="hint">
                {new Date(`${selectedDate}T12:00:00`).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
                {" · "}
                {selectedAnimal.emoji} du jour : {selectedAnimal.name}
              </span>
            </div>
          </div>
        </section>

        <aside className="card">
          <div className="tabs">
            <button
              className={panel === "tasks" ? "tab active" : "tab"}
              type="button"
              onClick={() => setPanel("tasks")}
            >
              Tâches
            </button>
            <button
              className={panel === "master" ? "tab active" : "tab"}
              type="button"
              onClick={() => setPanel("master")}
            >
              Master TODO
            </button>
            <button
              className={panel === "groups" ? "tab active" : "tab"}
              type="button"
              onClick={() => setPanel("groups")}
            >
              Groupes
            </button>
          </div>

          {panel === "master" ? (
            <>
              <h3 className="section-title">Master TODO</h3>
              <p className="hint master-hint">
                Liste générale sans date. Clique sur la puce pour la griser et
                valider la tâche pour le jour sélectionné.
              </p>
              <button
                type="button"
                className={masterFormOpen ? "add-toggle open" : "add-toggle"}
                aria-expanded={masterFormOpen}
                aria-controls="add-master-form"
                onClick={() => setMasterFormOpen((open) => !open)}
              >
                <span aria-hidden="true">{masterFormOpen ? "▾" : "▸"}</span>
                Ajout d&apos;une Master TODO
              </button>
              {masterFormOpen && (
                <form
                  id="add-master-form"
                  onSubmit={addMasterTask}
                  className="master-form"
                >
                  <div className="task-form">
                    <input
                      value={masterTitle}
                      onChange={(event) => setMasterTitle(event.target.value)}
                      placeholder="Une tâche récurrente du quotidien…"
                      aria-label="Nouvelle Master TODO"
                      autoFocus
                    />
                    <button className="primary" type="submit">
                      Ajouter
                    </button>
                  </div>
                  <span className="field-label">Icône</span>
                  <div
                    className="icon-picker"
                    role="listbox"
                    aria-label="Choisir une icône Master TODO"
                  >
                    <button
                      type="button"
                      className={!chosenMasterIcon ? "icon-chip active" : "icon-chip"}
                      aria-label="Sans icône"
                      onClick={() => {
                        setMasterIcon("");
                        setMasterCustomIcon("");
                      }}
                    >
                      ·
                    </button>
                    {(["📌", ...CUTE_ICONS] as const).map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        className={
                          chosenMasterIcon === emoji && !masterCustomIcon.trim()
                            ? "icon-chip active"
                            : "icon-chip"
                        }
                        aria-label={`Icône ${emoji}`}
                        onClick={() => {
                          setMasterIcon(emoji);
                          setMasterCustomIcon("");
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <input
                    className="field"
                    value={masterCustomIcon}
                    onChange={(event) => setMasterCustomIcon(event.target.value)}
                    placeholder="Ou une autre icône / emoji…"
                    aria-label="Icône Master TODO personnalisée"
                    maxLength={8}
                  />
                </form>
              )}
              <ul className="task-list master-list">
                {masterTasks.length === 0 && (
                  <li className="hint">Aucune Master TODO pour l’instant.</li>
                )}
                {masterTasks.map((task, index) => {
                  const done = isTaskDoneOn(task, selectedDate);
                  const tint = taskColor(task);
                  const peerIds = masterTasks.map((t) => t.id);
                  return (
                    <li
                      key={task.id}
                      className={`task-item master ${done ? "done" : ""}`}
                      style={{ ["--task-color" as string]: tint }}
                    >
                      <button
                        className="bullet"
                        type="button"
                        aria-label="Marquer comme fait pour ce jour"
                        aria-pressed={done}
                        onClick={() => toggleTask(task.id)}
                      />
                      <span
                        className={task.icon ? "task-icon" : "task-icon fallback"}
                        aria-hidden="true"
                        style={{
                          backgroundColor: `${tint}22`,
                          boxShadow: `inset 0 0 0 1.5px ${tint}`,
                        }}
                      >
                        {agendaGlyph(task)}
                      </span>
                      <div className="task-body">
                        <span>{task.title}</span>
                        <small className="task-meta">
                          {done ? "Fait ce jour" : "À faire ce jour"}
                        </small>
                      </div>
                      <div className="task-actions">
                        <button
                          className="tiny reorder"
                          type="button"
                          aria-label="Monter"
                          disabled={index === 0}
                          onClick={() => moveTask(task.id, -1, peerIds)}
                        >
                          ▲
                        </button>
                        <button
                          className="tiny reorder"
                          type="button"
                          aria-label="Descendre"
                          disabled={index === masterTasks.length - 1}
                          onClick={() => moveTask(task.id, 1, peerIds)}
                        >
                          ▼
                        </button>
                        <button className="tiny" type="button" onClick={() => removeTask(task.id)}>
                          retirer
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : panel === "tasks" ? (
            <>
              <h3 className="section-title">Liste du jour</h3>
              <button
                type="button"
                className={addFormOpen ? "add-toggle open" : "add-toggle"}
                aria-expanded={addFormOpen}
                aria-controls="add-task-form"
                onClick={() => setAddFormOpen((open) => !open)}
              >
                <span aria-hidden="true">{addFormOpen ? "▾" : "▸"}</span>
                Ajout d&apos;une tâche/évènement/note
              </button>
              {addFormOpen && (
                <form id="add-task-form" onSubmit={addTask} className="add-task-form">
                  <div className="task-form">
                    <input
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="Une petite tâche…"
                      aria-label="Nouvelle tâche"
                      autoFocus
                    />
                    <select
                      value={bullet}
                      onChange={(event) => {
                        const next = event.target.value as BulletKind;
                        setBullet(next);
                        if (
                          (TASK_COLORS as readonly string[]).includes(color) ||
                          color === DEFAULT_BULLET_COLORS[bullet]
                        ) {
                          setColor(DEFAULT_BULLET_COLORS[next]);
                        }
                      }}
                      aria-label="Type de puce"
                    >
                      <option value="task">Tâche</option>
                      <option value="event">Événement</option>
                      <option value="note">Note</option>
                    </select>
                  </div>

                  <label className="field-label" htmlFor="recurrence">
                    Fréquence
                  </label>
                  <select
                    id="recurrence"
                    className="field"
                    value={recurrence}
                    onChange={(event) => setRecurrence(event.target.value as Recurrence)}
                    aria-label="Fréquence"
                  >
                    {(Object.keys(RECURRENCE_LABELS) as Recurrence[]).map((key) => (
                      <option key={key} value={key}>
                        {RECURRENCE_LABELS[key]}
                      </option>
                    ))}
                  </select>

                  <div className="date-row">
                    <label className="date-field">
                      <span className="field-label">Début (optionnel)</span>
                      <input
                        className="field"
                        type="date"
                        value={startDate}
                        onChange={(event) => setStartDate(event.target.value)}
                        aria-label="Date de début"
                      />
                    </label>
                    <label className="date-field">
                      <span className="field-label">Fin (optionnel)</span>
                      <input
                        className="field"
                        type="date"
                        value={endDate}
                        min={startDate || selectedDate}
                        onChange={(event) => setEndDate(event.target.value)}
                        aria-label="Date de fin"
                      />
                    </label>
                  </div>

                  <span className="field-label">Icône</span>
                  <div className="icon-picker" role="listbox" aria-label="Choisir une icône">
                    <button
                      type="button"
                      className={!chosenIcon ? "icon-chip active" : "icon-chip"}
                      aria-label="Sans icône"
                      onClick={() => {
                        setIcon("");
                        setCustomIcon("");
                      }}
                    >
                      ·
                    </button>
                    {CUTE_ICONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        className={
                          chosenIcon === emoji && !customIcon.trim()
                            ? "icon-chip active"
                            : "icon-chip"
                        }
                        aria-label={`Icône ${emoji}`}
                        onClick={() => {
                          setIcon(emoji);
                          setCustomIcon("");
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <input
                    className="field"
                    value={customIcon}
                    onChange={(event) => setCustomIcon(event.target.value)}
                    placeholder="Ou une autre icône / emoji…"
                    aria-label="Icône personnalisée"
                    maxLength={8}
                  />

                  <span className="field-label">Couleur</span>
                  <div className="color-picker" role="listbox" aria-label="Choisir une couleur">
                    {TASK_COLORS.map((swatch) => (
                      <button
                        key={swatch}
                        type="button"
                        className={color === swatch ? "color-chip active" : "color-chip"}
                        style={{ backgroundColor: swatch }}
                        aria-label={`Couleur ${swatch}`}
                        onClick={() => setColor(swatch)}
                      />
                    ))}
                    <label className="color-custom" title="Couleur libre">
                      <input
                        type="color"
                        value={color}
                        onChange={(event) => setColor(event.target.value)}
                        aria-label="Couleur personnalisée"
                      />
                    </label>
                  </div>

                  <select
                    className="field"
                    value={groupId}
                    onChange={(event) => setGroupId(event.target.value)}
                    aria-label="Partager avec un groupe"
                  >
                    <option value="">Personnel</option>
                    {myGroups.map((group) => (
                      <option key={group.id} value={group.id}>
                        Groupe · {group.name}
                      </option>
                    ))}
                  </select>
                  <div style={{ height: 10 }} />
                  <button className="primary" type="submit">
                    Ajouter
                  </button>
                </form>
              )}
              <ul className="task-list" style={{ marginTop: 12 }}>
                {dayTasks.length === 0 && (
                  <li className="hint">Rien pour aujourd’hui. Pose une première puce ✨</li>
                )}
                {dayTasks.map((task, index) => {
                  const done = isTaskDoneOn(task, selectedDate);
                  const tint = taskColor(task);
                  const peerIds = dayTasks.map((t) => t.id);
                  return (
                    <li
                      key={task.id}
                      className={`task-item ${task.bullet} ${done ? "done" : ""}`}
                      style={{ ["--task-color" as string]: tint }}
                    >
                      <button
                        className="bullet"
                        type="button"
                        aria-label="Marquer comme fait"
                        aria-pressed={done}
                        onClick={() => toggleTask(task.id)}
                      />
                      <span
                        className={task.icon ? "task-icon" : "task-icon fallback"}
                        aria-hidden="true"
                        style={{
                          backgroundColor: `${tint}22`,
                          boxShadow: `inset 0 0 0 1.5px ${tint}`,
                        }}
                      >
                        {agendaGlyph(task)}
                      </span>
                      <div className="task-body">
                        <span>{task.title}</span>
                        {task.recurrence !== "once" ? (
                          <small className="task-meta">
                            {RECURRENCE_LABELS[task.recurrence]}
                            {task.startDate || task.endDate
                              ? ` · ${task.startDate ?? task.date} → ${task.endDate ?? "…"}`
                              : ""}
                          </small>
                        ) : (
                          task.endDate && (
                            <small className="task-meta">
                              {task.startDate ?? task.date} → {task.endDate}
                            </small>
                          )
                        )}
                      </div>
                      <div className="task-actions">
                        <button
                          className="tiny reorder"
                          type="button"
                          aria-label="Monter"
                          disabled={index === 0}
                          onClick={() => moveTask(task.id, -1, peerIds)}
                        >
                          ▲
                        </button>
                        <button
                          className="tiny reorder"
                          type="button"
                          aria-label="Descendre"
                          disabled={index === dayTasks.length - 1}
                          onClick={() => moveTask(task.id, 1, peerIds)}
                        >
                          ▼
                        </button>
                        <button className="tiny" type="button" onClick={() => removeTask(task.id)}>
                          retirer
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <h3 className="section-title" style={{ marginTop: 22 }}>
                Verres d’eau
                <label className="hint">
                  <input
                    type="checkbox"
                    checked={state.waterEnabled}
                    onChange={(event) => update({ waterEnabled: event.target.checked })}
                  />{" "}
                  activer
                </label>
              </h3>
              {state.waterEnabled && (
                <>
                  <p className="hint">
                    Objectif du jour : {water.goal} verre{water.goal > 1 ? "s" : ""}
                  </p>
                  <input
                    className="field"
                    type="number"
                    min={1}
                    max={16}
                    value={water.goal}
                    onChange={(event) => setWaterGoal(Number(event.target.value))}
                    aria-label="Nombre de verres"
                  />
                  <div className="glasses" style={{ marginTop: 10 }}>
                    {Array.from({ length: water.goal }, (_, index) => (
                      <button
                        key={index}
                        className={index < water.drunk ? "glass full" : "glass"}
                        type="button"
                        aria-label={`Verre ${index + 1}`}
                        onClick={() => toggleGlass(index)}
                      />
                    ))}
                  </div>
                </>
              )}

              <h3 className="section-title" style={{ marginTop: 22 }}>
                Humeur du jour
              </h3>
              <p className="hint">
                {dayMood
                  ? `Tu te sens ${MOODS.find((m) => m.id === dayMood)?.label.toLowerCase()} aujourd’hui.`
                  : "Comment te sens-tu ce jour-là ?"}
              </p>
              <div className="mood-picker" role="group" aria-label="Humeur du jour">
                {MOODS.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    className={dayMood === entry.id ? "mood-chip active" : "mood-chip"}
                    aria-label={entry.label}
                    aria-pressed={dayMood === entry.id}
                    title={entry.label}
                    onClick={() => setMood(entry.id)}
                  >
                    <span className="mood-emoji" aria-hidden="true">
                      {entry.emoji}
                    </span>
                    <span className="mood-label">{entry.label}</span>
                  </button>
                ))}
              </div>
              <label className="mood-comment-label" htmlFor="mood-comment">
                Commentaire
              </label>
              <textarea
                id="mood-comment"
                className="mood-comment"
                value={dayMoodComment}
                onChange={(event) => setMoodComment(event.target.value)}
                placeholder={
                  dayMood
                    ? "Une petite note sur ton humeur…"
                    : "Choisis d’abord une humeur pour laisser un commentaire."
                }
                disabled={!dayMood}
                rows={3}
                maxLength={500}
                aria-label="Commentaire sur l’humeur du jour"
              />
            </>
          ) : (
            <>
              <h3 className="section-title">Tes cercles cosy</h3>
              <p className="hint">
                {isCloudUser
                  ? "Crée un groupe, copie le lien d’invitation et envoie-le. Tes ami·es rejoignent avec Google et le code du lien."
                  : "Un ou plusieurs administrateurs gèrent le groupe. En mode démo, les codes ne marchent que sur cet appareil — Google active les liens entre comptes."}
              </p>
              {groupMessage && <p className="hint">{groupMessage}</p>}
              <form className="task-form" onSubmit={createGroup}>
                <input
                  value={groupName}
                  onChange={(event) => setGroupName(event.target.value)}
                  placeholder="Nom du groupe"
                  disabled={groupBusy}
                />
                <button className="primary" type="submit" disabled={groupBusy}>
                  Créer
                </button>
              </form>
              <form className="task-form" onSubmit={joinGroup}>
                <input
                  value={joinCode}
                  onChange={(event) => setJoinCode(event.target.value)}
                  placeholder="Code d’invitation"
                  disabled={groupBusy}
                />
                <button className="primary" type="submit" disabled={groupBusy}>
                  Rejoindre
                </button>
              </form>
              <div className="group-list">
                {myGroups.length === 0 && (
                  <p className="hint">Aucun groupe pour l’instant.</p>
                )}
                {myGroups.map((group) => {
                  const isAdmin = group.adminIds.includes(user.id);
                  const inviteLink = isAdmin ? buildInviteLink(group.inviteCode) : null;
                  return (
                    <article key={group.id} className="group-card">
                      <div className="group-card-head">
                        <strong>{group.name}</strong>
                        {isAdmin && <span className="badge">admin</span>}
                      </div>
                      {isAdmin && inviteLink && (
                        <div className="group-invite">
                          <div className="hint">Code : {group.inviteCode}</div>
                          <a
                            className="group-invite-link"
                            href={inviteLink}
                            onClick={(event) => event.preventDefault()}
                          >
                            {inviteLink}
                          </a>
                          <div className="group-invite-actions">
                            <button
                              className="tiny"
                              type="button"
                              onClick={() => void copyInviteLink(group)}
                            >
                              {copiedLinkFor === group.id ? "Lien copié" : "Copier le lien"}
                            </button>
                            <button
                              className="tiny danger"
                              type="button"
                              disabled={groupBusy}
                              onClick={() => void deleteGroup(group)}
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      )}
                      {!isAdmin && (
                        <div className="hint">Membre · code géré par un admin</div>
                      )}
                      <ul className="hint">
                        {group.memberIds.map((memberId) => (
                          <li key={memberId}>
                            {memberId === user.id ? "Toi" : memberId}
                            {isAdmin && memberId !== user.id && (
                              <>
                                {" "}
                                <button
                                  className="tiny"
                                  type="button"
                                  onClick={() => toggleAdmin(group, memberId)}
                                >
                                  {group.adminIds.includes(memberId)
                                    ? "retirer admin"
                                    : "nommer admin"}
                                </button>
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
