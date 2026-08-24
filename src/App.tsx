import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { animalForDate, ANIMALS, KawaiiAnimal } from "./animals";
import {
  inviteCode,
  loadState,
  parseJwtPayload,
  saveState,
  todayIso,
  uid,
  type BulletKind,
  type Group,
  type PlannerState,
  type Task,
  type User,
} from "./types";

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

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

function userFromGoogle(credential: string): User {
  const payload = parseJwtPayload(credential);
  return {
    id: `google-${payload.sub}`,
    name: payload.name || "Ami·e Google",
    email: payload.email || "",
    picture: payload.picture,
    provider: "google",
  };
}

export default function App() {
  const [state, setState] = useState<PlannerState>(() => loadState());
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [title, setTitle] = useState("");
  const [bullet, setBullet] = useState<BulletKind>("task");
  const [groupId, setGroupId] = useState<string>("");
  const [panel, setPanel] = useState<"tasks" | "groups">("tasks");
  const [groupName, setGroupName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [groupMessage, setGroupMessage] = useState("");
  const [googleReady, setGoogleReady] = useState(false);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const login = useCallback((user: User) => {
    setState((current) => ({ ...current, user }));
  }, []);

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
      callback: (response) => login(userFromGoogle(response.credential)),
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
  }, [googleReady, login, state.user]);

  const user = state.user;
  const monthDays = useMemo(() => daysInGrid(cursor), [cursor]);
  const selectedAnimal = animalForDate(selectedDate);
  const myGroups = state.groups.filter((group) => user && group.memberIds.includes(user.id));
  const dayTasks = state.tasks
    .filter((task) => task.date === selectedDate)
    .filter((task) => {
      if (!user) return false;
      if (!task.groupId) return task.createdBy === user.id;
      return myGroups.some((group) => group.id === task.groupId);
    });

  const water = state.waterByDate[selectedDate] ?? {
    goal: state.waterDefaultGoal,
    drunk: 0,
    enabled: state.waterEnabled,
  };

  function update(partial: Partial<PlannerState>) {
    setState((current) => ({ ...current, ...partial }));
  }

  function logout() {
    update({ user: null });
  }

  function addTask(event: FormEvent) {
    event.preventDefault();
    if (!user || !title.trim()) return;
    const task: Task = {
      id: uid("task"),
      title: title.trim(),
      done: false,
      date: selectedDate,
      bullet,
      groupId: groupId || null,
      createdBy: user.id,
    };
    update({ tasks: [...state.tasks, task] });
    setTitle("");
  }

  function toggleTask(id: string) {
    update({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task,
      ),
    });
  }

  function removeTask(id: string) {
    update({ tasks: state.tasks.filter((task) => task.id !== id) });
  }

  function createGroup(event: FormEvent) {
    event.preventDefault();
    if (!user || !groupName.trim()) return;
    const group: Group = {
      id: uid("group"),
      name: groupName.trim(),
      inviteCode: inviteCode(),
      adminIds: [user.id],
      memberIds: [user.id],
    };
    update({ groups: [...state.groups, group] });
    setGroupName("");
  }

  function joinGroup(event: FormEvent) {
    event.preventDefault();
    if (!user || !joinCode.trim()) return;
    const code = joinCode.trim().toUpperCase();
    const match = state.groups.find((group) => group.inviteCode === code);
    if (!match) {
      setGroupMessage("Code inconnu sur cet appareil. Le partage live arrivera avec un backend.");
      return;
    }
    if (match.memberIds.includes(user.id)) {
      setGroupMessage(`Tu es déjà dans « ${match.name} ».`);
      setJoinCode("");
      return;
    }
    update({
      groups: state.groups.map((group) =>
        group.id === match.id
          ? { ...group, memberIds: [...group.memberIds, user.id] }
          : group,
      ),
    });
    setGroupMessage(`Bienvenue dans « ${match.name} » !`);
    setJoinCode("");
  }

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
            {ANIMALS.slice(0, 5).map((animal) => (
              <KawaiiAnimal key={animal.id} animal={animal.id} size={64} />
            ))}
          </div>
          <div id="google-signin" className="google-slot" />
          {!GOOGLE_CLIENT_ID && (
            <p className="hint">
              Ajoute <code>VITE_GOOGLE_CLIENT_ID</code> pour activer Google.
              En attendant, tu peux tester en mode démo.
            </p>
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
        <div className="brand">
          <KawaiiAnimal animal={selectedAnimal.id} size={56} />
          <div>
            <h1>Cosy Planner</h1>
            <p>Bullet journal doux · {selectedAnimal.name} du jour</p>
          </div>
        </div>
        <div className="user-chip">
          {user.picture ? (
            <img src={user.picture} alt="" />
          ) : (
            <div className="avatar" />
          )}
          <span>{user.name}</span>
          <button className="ghost" type="button" onClick={logout}>
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
              const counts = state.tasks.filter((task) => task.date === iso);
              const animal = animalForDate(iso);
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
                  <span className="day-num">{day.getDate()}</span>
                  <span aria-hidden="true">{animal.emoji}</span>
                  <span className="day-dots">
                    {counts.some((task) => task.bullet === "task") && (
                      <i className="dot task" />
                    )}
                    {counts.some((task) => task.bullet === "event") && (
                      <i className="dot event" />
                    )}
                    {counts.some((task) => task.bullet === "note") && (
                      <i className="dot note" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mascot-row">
            <KawaiiAnimal animal={selectedAnimal.id} size={72} />
            <div>
              <strong>{selectedAnimal.name} veille sur ta journée</strong>
              <span className="hint">
                {new Date(`${selectedDate}T12:00:00`).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
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
              className={panel === "groups" ? "tab active" : "tab"}
              type="button"
              onClick={() => setPanel("groups")}
            >
              Groupes
            </button>
          </div>

          {panel === "tasks" ? (
            <>
              <h3 className="section-title">Liste du jour</h3>
              <form onSubmit={addTask}>
                <div className="task-form">
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Une petite tâche…"
                    aria-label="Nouvelle tâche"
                  />
                  <select
                    value={bullet}
                    onChange={(event) => setBullet(event.target.value as BulletKind)}
                    aria-label="Type de puce"
                  >
                    <option value="task">Tâche</option>
                    <option value="event">Événement</option>
                    <option value="note">Note</option>
                  </select>
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
              <ul className="task-list" style={{ marginTop: 12 }}>
                {dayTasks.length === 0 && (
                  <li className="hint">Rien pour aujourd’hui. Pose une première puce ✨</li>
                )}
                {dayTasks.map((task) => (
                  <li
                    key={task.id}
                    className={`task-item ${task.bullet} ${task.done ? "done" : ""}`}
                  >
                    <button
                      className="bullet"
                      type="button"
                      aria-label="Marquer comme fait"
                      onClick={() => toggleTask(task.id)}
                    />
                    <span>{task.title}</span>
                    <button className="tiny" type="button" onClick={() => removeTask(task.id)}>
                      retirer
                    </button>
                  </li>
                ))}
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
            </>
          ) : (
            <>
              <h3 className="section-title">Tes cercles cosy</h3>
              <p className="hint">
                Un ou plusieurs administrateurs gèrent le groupe. Sur GitLab
                Pages, les données restent dans ce navigateur (base locale pour
                tester l’interface).
              </p>
              {groupMessage && <p className="hint">{groupMessage}</p>}
              <form className="task-form" onSubmit={createGroup}>
                <input
                  value={groupName}
                  onChange={(event) => setGroupName(event.target.value)}
                  placeholder="Nom du groupe"
                />
                <button className="primary" type="submit">
                  Créer
                </button>
              </form>
              <form className="task-form" onSubmit={joinGroup}>
                <input
                  value={joinCode}
                  onChange={(event) => setJoinCode(event.target.value)}
                  placeholder="Code d’invitation"
                />
                <button className="primary" type="submit">
                  Rejoindre
                </button>
              </form>
              <div className="group-list">
                {myGroups.length === 0 && (
                  <p className="hint">Aucun groupe pour l’instant.</p>
                )}
                {myGroups.map((group) => {
                  const isAdmin = group.adminIds.includes(user.id);
                  return (
                    <article key={group.id} className="group-card">
                      <strong>{group.name}</strong>
                      <div className="hint">Code : {group.inviteCode}</div>
                      {isAdmin && <span className="badge">admin</span>}
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
