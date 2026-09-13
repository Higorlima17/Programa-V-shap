import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import {
  Home, Dumbbell, TrendingUp, User, ChevronLeft, ChevronRight,
  Check, Repeat, ChevronDown, ChevronUp, Flame, CalendarCheck,
  Moon, Battery, Utensils, Activity
} from "lucide-react";

/* ---------------------------------------------------------------------- */
/* Dados do programa (convertidos da especificação)                        */
/* ---------------------------------------------------------------------- */

const WEEKDAY_LABELS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

const SESSIONS = [
  {
    title: "Costas e bíceps",
    focus: "Largura e espessura das costas",
    exercises: [
      { id: "s0e0", name: "Barra fixa", alt: "Puxada alta", sets: 4, repMin: 6, repMax: 10 },
      { id: "s0e1", name: "Remada curvada", sets: 4, repMin: 6, repMax: 10 },
      { id: "s0e2", name: "Puxada neutra", sets: 3, repMin: 8, repMax: 12 },
      { id: "s0e3", name: "Remada baixa", sets: 3, repMin: 8, repMax: 12 },
      { id: "s0e4", name: "Pulldown braço estendido", sets: 3, repMin: 12, repMax: 15 },
      { id: "s0e5", name: "Rosca direta", sets: 3, repMin: 8, repMax: 12 },
      { id: "s0e6", name: "Rosca martelo", sets: 3, repMin: 10, repMax: 12 },
    ],
  },
  {
    title: "Pernas A e abdômen",
    focus: "Quadríceps, panturrilhas e abdômen",
    exercises: [
      { id: "s1e0", name: "Agachamento livre", sets: 4, repMin: 6, repMax: 10 },
      { id: "s1e1", name: "Leg press", sets: 4, repMin: 8, repMax: 12 },
      { id: "s1e2", name: "Cadeira extensora", sets: 3, repMin: 10, repMax: 15 },
      { id: "s1e3", name: "Afundo", alt: "Búlgaro", sets: 3, repMin: 8, repMax: 12 },
      { id: "s1e4", name: "Panturrilha em pé", sets: 4, repMin: 10, repMax: 15 },
      { id: "s1e5", name: "Panturrilha sentado", sets: 3, repMin: 12, repMax: 20 },
      { id: "s1e6", name: "Elevação de pernas", sets: 3, repMin: 10, repMax: 15 },
      { id: "s1e7", name: "Crunch máquina/cabo", sets: 3, repMin: 12, repMax: 15 },
    ],
  },
  {
    title: "Peito, ombros e tríceps",
    focus: "Peitoral, deltoides e tríceps",
    exercises: [
      { id: "s2e0", name: "Supino inclinado", sets: 4, repMin: 6, repMax: 10 },
      { id: "s2e1", name: "Supino reto", sets: 3, repMin: 8, repMax: 12 },
      { id: "s2e2", name: "Crucifixo/Crossover", sets: 3, repMin: 10, repMax: 15 },
      { id: "s2e3", name: "Desenvolvimento", sets: 3, repMin: 6, repMax: 10 },
      { id: "s2e4", name: "Elevação lateral", sets: 4, repMin: 10, repMax: 15 },
      { id: "s2e5", name: "Crucifixo inverso", sets: 3, repMin: 12, repMax: 15 },
      { id: "s2e6", name: "Tríceps testa", sets: 3, repMin: 8, repMax: 12 },
      { id: "s2e7", name: "Tríceps corda", sets: 3, repMin: 10, repMax: 15 },
    ],
  },
  {
    title: "Costas, ombros e abdômen",
    focus: "Reforço de dorsais, deltoides e core",
    exercises: [
      { id: "s3e0", name: "Barra fixa", alt: "Puxada alta", sets: 4, repMin: 6, repMax: 10 },
      { id: "s3e1", name: "Remada unilateral", sets: 3, repMin: 8, repMax: 12 },
      { id: "s3e2", name: "Puxada aberta", sets: 3, repMin: 8, repMax: 12 },
      { id: "s3e3", name: "Pullover no cabo", sets: 3, repMin: 12, repMax: 15 },
      { id: "s3e4", name: "Elevação lateral", sets: 4, repMin: 12, repMax: 15 },
      { id: "s3e5", name: "Elevação lateral no cabo", sets: 3, repMin: 12, repMax: 15 },
      { id: "s3e6", name: "Crucifixo inverso", sets: 3, repMin: 12, repMax: 15 },
      { id: "s3e7", name: "Crunch no cabo", sets: 3, repMin: 12, repMax: 15 },
      { id: "s3e8", name: "Elevação de pernas", sets: 3, repMin: 10, repMax: 15 },
    ],
  },
  {
    title: "Pernas B e peito",
    focus: "Posterior de coxa, glúteos, panturrilhas e peito",
    exercises: [
      { id: "s4e0", name: "Levantamento terra romeno", sets: 4, repMin: 6, repMax: 10 },
      { id: "s4e1", name: "Mesa flexora", sets: 4, repMin: 8, repMax: 12 },
      { id: "s4e2", name: "Hip thrust", sets: 3, repMin: 8, repMax: 12 },
      { id: "s4e3", name: "Agachamento búlgaro", sets: 3, repMin: 8, repMax: 12 },
      { id: "s4e4", name: "Cadeira flexora", sets: 3, repMin: 10, repMax: 15 },
      { id: "s4e5", name: "Panturrilha", sets: 4, repMin: 10, repMax: 15 },
      { id: "s4e6", name: "Supino inclinado", sets: 3, repMin: 8, repMax: 12 },
      { id: "s4e7", name: "Crossover", sets: 3, repMin: 10, repMax: 15 },
    ],
  },
];

function getPhase(week) {
  if (week <= 3) return { name: "Base e adaptação", rir: "2–3", volume: "Volume normal", tone: "blue" };
  if (week === 4) return { name: "Deload", rir: "4–5", volume: "Redução de 40–50%", tone: "amber", deload: true };
  if (week <= 7) return { name: "Hipertrofia progressiva", rir: "1–3", volume: "Volume normal", tone: "orange" };
  if (week === 8) return { name: "Deload", rir: "4–5", volume: "Redução de 40–50%", tone: "amber", deload: true };
  if (week <= 11) return { name: "Intensificação", rir: "1–2", volume: "Volume normal", tone: "orange" };
  return { name: "Consolidação", rir: "2–3", volume: "Redução de 20–30%", tone: "green" };
}

const TONE_COLORS = {
  blue: "#4FA3FF",
  amber: "#FFC145",
  orange: "#FF5630",
  green: "#3ECF8E",
};

/* ---------------------------------------------------------------------- */
/* Dados simulados de histórico (semanas já concluídas antes da atual)     */
/* ---------------------------------------------------------------------- */

function seedHistory() {
  // Nenhuma sessão concluída ainda: o usuário está começando o ciclo agora.
  return { completed: new Set(), volumeHistory: [] };
}

/* ---------------------------------------------------------------------- */
/* Componentes auxiliares                                                  */
/* ---------------------------------------------------------------------- */

function ChevronDivider({ color = "#FF5630", opacity = 1 }) {
  return (
    <svg viewBox="0 0 200 20" style={{ width: "100%", height: 14, display: "block", opacity }} preserveAspectRatio="none">
      <polyline points="0,0 100,18 200,0" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatChip({ icon, label, value }) {
  return (
    <div className="stat-chip">
      <div className="stat-chip-icon">{icon}</div>
      <div>
        <div className="stat-chip-value">{value}</div>
        <div className="stat-chip-label">{label}</div>
      </div>
    </div>
  );
}

function SetRow({ index, data, target, onChange }) {
  return (
    <div className="set-row">
      <div className="set-num">{index + 1}</div>
      <input
        className="set-input"
        type="number"
        inputMode="decimal"
        placeholder="kg"
        value={data.weight}
        onChange={(e) => onChange({ ...data, weight: e.target.value })}
      />
      <input
        className="set-input"
        type="number"
        inputMode="numeric"
        placeholder={`${target.repMin}–${target.repMax}`}
        value={data.reps}
        onChange={(e) => onChange({ ...data, reps: e.target.value })}
      />
      <select
        className="set-select"
        value={data.rir}
        onChange={(e) => onChange({ ...data, rir: e.target.value })}
      >
        <option value="">RIR</option>
        {[0, 1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
      <button
        className={"set-done" + (data.done ? " on" : "")}
        onClick={() => onChange({ ...data, done: !data.done })}
        aria-label="Marcar série concluída"
      >
        <Check size={15} />
      </button>
    </div>
  );
}

function ExerciseCard({ ex, log, onUpdateSet, phase }) {
  const [open, setOpen] = useState(true);
  const [swapped, setSwapped] = useState(false);
  const displayName = swapped && ex.alt ? ex.alt : ex.name;

  const allDone = log.every((s) => s.done);
  const hitTop = log.every((s) => s.done && Number(s.reps) >= ex.repMax && s.reps !== "");

  return (
    <div className="exercise-card">
      <button className="exercise-head" onClick={() => setOpen(!open)}>
        <div className="exercise-head-left">
          <div className={"exercise-dot" + (allDone ? " done" : "")} />
          <div>
            <div className="exercise-name">
              {displayName}
              {ex.alt && (
                <span
                  className="swap-btn"
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); setSwapped(!swapped); }}
                  title="Trocar variação"
                >
                  <Repeat size={12} /> {swapped ? ex.name : ex.alt}
                </span>
              )}
            </div>
            <div className="exercise-meta">{ex.sets}×{ex.repMin}–{ex.repMax} · RIR alvo {phase.rir}</div>
          </div>
        </div>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {open && (
        <div className="exercise-body">
          <div className="set-row set-row-labels">
            <div className="set-num">Série</div>
            <div className="set-input-label">Carga</div>
            <div className="set-input-label">Reps</div>
            <div className="set-input-label">RIR</div>
            <div />
          </div>
          {log.map((s, i) => (
            <SetRow
              key={i}
              index={i}
              data={s}
              target={ex}
              onChange={(next) => onUpdateSet(ex.id, i, next)}
            />
          ))}
          {hitTop && (
            <div className="suggestion-chip">
              Sugestão: considerar +2,5&nbsp;kg na próxima sessão
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* App principal                                                           */
/* ---------------------------------------------------------------------- */

const STORAGE_KEY = "vshape:state";

function buildDefaultState() {
  const seeded = seedHistory();
  return {
    week: 1,
    dayIdx: 0,
    completed: [], // array de strings "week-dayIdx"; convertido para Set em memória
    volumeHistory: seeded.volumeHistory,
    logs: {},
    sessionStarted: {},
    measurements: [],
    checkins: [],
  };
}

export default function App() {
  const [tab, setTab] = useState("hoje");
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved | error

  const [week, setWeek] = useState(1);
  const [dayIdx, setDayIdx] = useState(0);
  const [completed, setCompleted] = useState(new Set());
  const [volumeHistory, setVolumeHistory] = useState([]);
  const [logs, setLogs] = useState({});
  const [sessionStarted, setSessionStarted] = useState({});
  const [measurements, setMeasurements] = useState([]);
  const [checkins, setCheckins] = useState([]);

  // Carrega o estado salvo (se existir) ao montar o app.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const data = raw ? JSON.parse(raw) : buildDefaultState();
      setWeek(data.week ?? 1);
      setDayIdx(data.dayIdx ?? 0);
      setCompleted(new Set(data.completed ?? []));
      setVolumeHistory(data.volumeHistory ?? []);
      setLogs(data.logs ?? {});
      setSessionStarted(data.sessionStarted ?? {});
      setMeasurements(data.measurements ?? []);
      setCheckins(data.checkins ?? []);
    } catch (e) {
      // Nenhum dado salvo ainda, ou dado corrompido: começa do zero.
      const def = buildDefaultState();
      setWeek(def.week);
      setDayIdx(def.dayIdx);
      setVolumeHistory(def.volumeHistory);
    } finally {
      setLoaded(true);
    }
  }, []);

  // Salva automaticamente (com pequeno atraso) sempre que algo relevante muda.
  const saveTimer = useRef(null);
  useEffect(() => {
    if (!loaded) return; // evita sobrescrever antes de carregar
    setSaveStatus("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        const payload = {
          week, dayIdx, completed: Array.from(completed), volumeHistory,
          logs, sessionStarted, measurements, checkins,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        setSaveStatus("saved");
      } catch (e) {
        setSaveStatus("error");
      }
    }, 500);
    return () => clearTimeout(saveTimer.current);
  }, [loaded, week, dayIdx, completed, volumeHistory, logs, sessionStarted, measurements, checkins]);

  const phase = getPhase(week);
  const toneColor = TONE_COLORS[phase.tone];
  const session = SESSIONS[dayIdx];
  const sessionKey = `${week}-${dayIdx}`;

  const sessionsThisWeek = useMemo(() => {
    let n = 0;
    for (let d = 0; d < 5; d++) if (completed.has(`${week}-${d}`)) n++;
    return n;
  }, [completed, week]);

  const streak = useMemo(() => {
    // conta sessões concluídas consecutivas olhando para trás a partir de hoje
    let count = 0;
    let w = week, d = dayIdx - 1;
    while (true) {
      if (d < 0) { w -= 1; d = 4; if (w < 1) break; }
      if (completed.has(`${w}-${d}`)) { count++; d -= 1; } else break;
    }
    return count;
  }, [completed, week, dayIdx]);

  function ensureLog(wk, di) {
    const key = `${wk}-${di}`;
    if (logs[key]) return;
    const initial = {};
    SESSIONS[di].exercises.forEach((ex) => {
      initial[ex.id] = Array.from({ length: ex.sets }, () => ({ weight: "", reps: "", rir: "", done: false }));
    });
    setLogs((prev) => ({ ...prev, [key]: initial }));
  }

  function startSession() {
    ensureLog(week, dayIdx);
    setSessionStarted((prev) => ({ ...prev, [sessionKey]: true }));
    setTab("treino");
  }

  function updateSet(exId, setIndex, next) {
    setLogs((prev) => {
      const key = sessionKey;
      const current = prev[key] || {};
      const exSets = [...(current[exId] || [])];
      exSets[setIndex] = next;
      return { ...prev, [key]: { ...current, [exId]: exSets } };
    });
  }

  function finishSession() {
    const key = sessionKey;
    const dayLogs = logs[key] || {};
    let vol = 0;
    Object.values(dayLogs).forEach((sets) => {
      sets.forEach((s) => { vol += (Number(s.weight) || 0) * (Number(s.reps) || 0); });
    });
    setCompleted((prev) => new Set(prev).add(key));
    setVolumeHistory((prev) => {
      const label = `S${week}`;
      const existing = prev.find((p) => p.week === label);
      if (existing) return prev; // não duplica se já registrado
      return [...prev, { week: label, volume: vol || 0, sessoes: sessionsThisWeek + 1 }];
    });
    setTab("hoje");
  }

  const currentLog = logs[sessionKey];

  if (!loaded) {
    return (
      <div style={{
        fontFamily: "Inter, sans-serif", background: "#121316", color: "#9A9DA6",
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
      }}>
        Carregando seu progresso...
      </div>
    );
  }

  return (
    <div className="app-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');

        :root {
          --bg: #121316;
          --surface: #1B1D22;
          --surface-2: #22252B;
          --border: #2E323A;
          --text: #F2F1ED;
          --text-dim: #9A9DA6;
          --accent: #FF5630;
          --accent-dim: rgba(255,86,48,0.14);
          --green: #3ECF8E;
          --blue: #4FA3FF;
          --amber: #FFC145;
        }
        * { box-sizing: border-box; }
        .app-root {
          font-family: 'Inter', sans-serif;
          background: var(--bg);
          color: var(--text);
          max-width: 430px;
          margin: 0 auto;
          min-height: 100vh;
          padding-bottom: 84px;
          position: relative;
        }
        .heading-font { font-family: 'Barlow Condensed', sans-serif; }

        /* Top bar */
        .topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 18px 4px;
        }
        .brand { font-family: 'Barlow Condensed', sans-serif; font-size: 15px; letter-spacing: 0.4px; color: var(--text-dim); }
        .week-stepper { display: flex; align-items: center; gap: 10px; }
        .week-stepper button {
          background: var(--surface-2); border: 1px solid var(--border); color: var(--text);
          width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
          cursor: pointer;
        }
        .week-label { font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 600; min-width: 92px; text-align: center; }

        .content { padding: 10px 18px 8px; }

        /* Phase banner */
        .phase-banner {
          display: flex; align-items: center; justify-content: space-between;
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 14px; padding: 12px 14px; margin: 8px 0 14px;
        }
        .phase-name { font-family: 'Barlow Condensed', sans-serif; font-size: 19px; font-weight: 600; }
        .phase-sub { color: var(--text-dim); font-size: 12.5px; margin-top: 2px; }
        .phase-dot { width: 9px; height: 9px; border-radius: 50%; display: inline-block; margin-right: 7px; }

        /* Day pills */
        .day-pills { display: flex; gap: 8px; margin-bottom: 14px; }
        .day-pill {
          flex: 1; text-align: center; padding: 9px 0; border-radius: 10px;
          background: var(--surface); border: 1px solid var(--border); cursor: pointer;
          font-size: 12.5px; color: var(--text-dim); position: relative;
        }
        .day-pill.active { border-color: var(--accent); color: var(--text); background: var(--accent-dim); }
        .day-pill .chk { position: absolute; top: -6px; right: -6px; background: var(--green); border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; }

        /* Hero card */
        .hero-card {
          background: linear-gradient(180deg, var(--surface) 0%, var(--surface-2) 100%);
          border: 1px solid var(--border); border-radius: 18px; padding: 20px; overflow: hidden; position: relative;
        }
        .hero-focus { color: var(--text-dim); font-size: 13px; margin-top: 4px; }
        .hero-title { font-family: 'Barlow Condensed', sans-serif; font-size: 30px; font-weight: 700; line-height: 1.05; margin-top: 6px; }
        .hero-count { color: var(--text-dim); font-size: 12.5px; margin-top: 10px; }
        .cta-btn {
          margin-top: 16px; width: 100%; background: var(--accent); color: #16110D; border: none;
          padding: 13px; border-radius: 12px; font-weight: 700; font-size: 15px; cursor: pointer;
          font-family: 'Inter', sans-serif;
        }
        .cta-btn.secondary { background: transparent; border: 1px solid var(--border); color: var(--text); }

        /* Stat chips */
        .stat-row { display: flex; gap: 10px; margin-top: 14px; }
        .stat-chip { flex: 1; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 10px 12px; display: flex; align-items: center; gap: 9px; }
        .stat-chip-icon { color: var(--accent); flex-shrink: 0; }
        .stat-chip-value { font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 700; line-height: 1; }
        .stat-chip-label { color: var(--text-dim); font-size: 10.5px; margin-top: 3px; }

        /* Exercise cards */
        .exercise-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; margin-bottom: 10px; overflow: hidden; }
        .exercise-head { width: 100%; background: none; border: none; color: var(--text); padding: 14px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; text-align: left; }
        .exercise-head-left { display: flex; align-items: center; gap: 11px; }
        .exercise-dot { width: 9px; height: 9px; border-radius: 50%; background: var(--border); flex-shrink: 0; }
        .exercise-dot.done { background: var(--green); }
        .exercise-name { font-size: 14.5px; font-weight: 600; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .exercise-meta { color: var(--text-dim); font-size: 12px; margin-top: 2px; }
        .swap-btn { display: inline-flex; align-items: center; gap: 3px; font-size: 10.5px; color: var(--blue); font-weight: 500; border: 1px solid rgba(79,163,255,0.35); padding: 2px 7px; border-radius: 20px; }
        .exercise-body { padding: 0 14px 14px; }

        .set-row { display: grid; grid-template-columns: 30px 1fr 1fr 60px 34px; gap: 6px; align-items: center; margin-bottom: 6px; }
        .set-row-labels { color: var(--text-dim); font-size: 10.5px; margin-bottom: 8px; }
        .set-input-label { text-align: center; }
        .set-num { color: var(--text-dim); font-size: 12px; text-align: center; }
        .set-input, .set-select {
          background: var(--surface-2); border: 1px solid var(--border); color: var(--text);
          border-radius: 8px; padding: 8px 6px; font-size: 13px; width: 100%; text-align: center;
          font-family: 'Inter', sans-serif;
        }
        .set-done {
          background: var(--surface-2); border: 1px solid var(--border); color: var(--text-dim);
          border-radius: 8px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer;
        }
        .set-done.on { background: var(--green); border-color: var(--green); color: #0E1512; }
        .suggestion-chip { margin-top: 8px; background: rgba(62,207,142,0.12); color: var(--green); border: 1px solid rgba(62,207,142,0.3); border-radius: 10px; padding: 8px 10px; font-size: 12px; }

        .finish-btn { width: 100%; background: var(--green); color: #0E1512; border: none; padding: 14px; border-radius: 12px; font-weight: 700; font-size: 15px; margin-top: 6px; cursor: pointer; }

        .section-title { font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 600; margin: 18px 0 10px; }
        .empty-state { text-align: center; color: var(--text-dim); padding: 60px 20px; font-size: 13.5px; }

        /* Progresso */
        .metric-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 6px; }
        .metric-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 12px 10px; text-align: center; }
        .metric-value { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 700; }
        .metric-label { color: var(--text-dim); font-size: 10px; margin-top: 3px; }
        .chart-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 14px 6px 8px; margin-top: 14px; }
        .chart-title { font-size: 12.5px; color: var(--text-dim); padding-left: 10px; margin-bottom: 4px; }

        .measure-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        .measure-table th, .measure-table td { text-align: center; padding: 8px 4px; font-size: 12px; border-bottom: 1px solid var(--border); }
        .measure-table th { color: var(--text-dim); font-weight: 500; font-size: 11px; }

        /* Perfil */
        .field-group { margin-bottom: 12px; }
        .field-label { font-size: 12px; color: var(--text-dim); margin-bottom: 5px; display: block; }
        .field-input { width: 100%; background: var(--surface); border: 1px solid var(--border); color: var(--text); border-radius: 10px; padding: 10px 12px; font-size: 13.5px; font-family: 'Inter', sans-serif; }
        textarea.field-input { resize: vertical; min-height: 60px; }
        .field-row { display: flex; gap: 8px; }
        .save-btn { width: 100%; background: var(--accent); color: #16110D; border: none; padding: 12px; border-radius: 12px; font-weight: 700; cursor: pointer; margin-top: 4px; }
        .checkin-item { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 10px 12px; margin-top: 8px; font-size: 12.5px; }
        .checkin-item .row { display: flex; justify-content: space-between; color: var(--text-dim); margin-top: 3px; }
        .disclaimer { font-size: 11.5px; color: var(--text-dim); text-align: center; margin-top: 22px; line-height: 1.5; padding: 0 8px; }

        /* Bottom nav */
        .bottom-nav {
          position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
          width: 100%; max-width: 430px; background: rgba(27,29,34,0.96); backdrop-filter: blur(6px);
          border-top: 1px solid var(--border); display: flex; padding: 10px 8px 14px;
        }
        .nav-btn { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; background: none; border: none; color: var(--text-dim); font-size: 10.5px; cursor: pointer; font-family: 'Inter', sans-serif; }
        .nav-btn.active { color: var(--accent); }
      `}</style>

      {/* ---------- TOP BAR ---------- */}
      <div className="topbar">
        <div>
          <div className="brand heading-font">Programa V-Shape</div>
          <div style={{ fontSize: 9.5, color: saveStatus === "error" ? "#FF5630" : "var(--text-dim)", marginTop: 2 }}>
            {saveStatus === "saving" && "Salvando..."}
            {saveStatus === "saved" && "Progresso salvo"}
            {saveStatus === "error" && "Falha ao salvar"}
          </div>
        </div>
        <div className="week-stepper">
          <button onClick={() => setWeek((w) => Math.max(1, w - 1))}><ChevronLeft size={16} /></button>
          <div className="week-label heading-font">Semana {week}/12</div>
          <button onClick={() => setWeek((w) => Math.min(12, w + 1))}><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* ---------- TAB: HOJE ---------- */}
      {tab === "hoje" && (
        <div className="content">
          <div className="phase-banner">
            <div>
              <div className="phase-name heading-font">
                <span className="phase-dot" style={{ background: toneColor }} />
                {phase.name}
              </div>
              <div className="phase-sub">RIR alvo {phase.rir} · {phase.volume}</div>
            </div>
          </div>

          <div className="day-pills">
            {WEEKDAY_LABELS.map((d, i) => (
              <div
                key={d}
                className={"day-pill" + (i === dayIdx ? " active" : "")}
                onClick={() => setDayIdx(i)}
              >
                {d.slice(0, 3)}
                {completed.has(`${week}-${i}`) && (
                  <span className="chk"><Check size={10} color="#0E1512" /></span>
                )}
              </div>
            ))}
          </div>

          <div className="hero-card">
            <ChevronDivider color={toneColor} opacity={0.5} />
            <div className="hero-focus">{WEEKDAY_LABELS[dayIdx]}-feira</div>
            <div className="hero-title heading-font">{session.title}</div>
            <div className="hero-count">{session.focus} · {session.exercises.length} exercícios · 60–80 min</div>
            {completed.has(sessionKey) ? (
              <button className="cta-btn secondary" onClick={() => { ensureLog(week, dayIdx); setTab("treino"); }}>
                Sessão concluída · revisar
              </button>
            ) : (
              <button className="cta-btn" onClick={startSession}>
                {sessionStarted[sessionKey] ? "Continuar treino" : "Iniciar treino"}
              </button>
            )}
          </div>

          <div className="stat-row">
            <StatChip icon={<CalendarCheck size={18} />} value={`${sessionsThisWeek}/5`} label="Sessões na semana" />
            <StatChip icon={<Flame size={18} />} value={streak} label="Sequência" />
            <StatChip icon={<Activity size={18} />} value={phase.deload ? "Agora" : week < 4 ? `${4 - week}sem` : week < 8 ? `${8 - week}sem` : week < 12 ? `${12 - week}sem` : "—"} label="Próximo deload" />
          </div>
        </div>
      )}

      {/* ---------- TAB: TREINO ---------- */}
      {tab === "treino" && (
        <div className="content">
          {!currentLog ? (
            <div className="empty-state">
              Selecione um treino na aba <strong>Hoje</strong> e toque em "Iniciar treino" para começar a registrar suas séries.
            </div>
          ) : (
            <>
              <div className="phase-sub" style={{ marginBottom: 10 }}>
                {WEEKDAY_LABELS[dayIdx]}-feira · {session.title} · RIR alvo {phase.rir}
              </div>
              {session.exercises.map((ex) => (
                <ExerciseCard
                  key={ex.id}
                  ex={ex}
                  phase={phase}
                  log={currentLog[ex.id]}
                  onUpdateSet={updateSet}
                />
              ))}
              {!completed.has(sessionKey) && (
                <button className="finish-btn" onClick={finishSession}>Concluir sessão</button>
              )}
            </>
          )}
        </div>
      )}

      {/* ---------- TAB: PROGRESSO ---------- */}
      {tab === "progresso" && (
        <div className="content">
          <div className="metric-grid">
            <div className="metric-card">
              <div className="metric-value heading-font">{Math.round((volumeHistory.reduce((a, v) => a + v.sessoes, 0) / ((week - 1) * 5 || 1)) * 100)}%</div>
              <div className="metric-label">Aderência</div>
            </div>
            <div className="metric-card">
              <div className="metric-value heading-font">{volumeHistory.reduce((a, v) => a + v.sessoes, 0)}<span style={{ fontSize: 13, color: "var(--text-dim)" }}>/60</span></div>
              <div className="metric-label">Sessões concluídas</div>
            </div>
            <div className="metric-card">
              <div className="metric-value heading-font">{[4, 8, 12].filter((w) => w < week).length}<span style={{ fontSize: 13, color: "var(--text-dim)" }}>/3</span></div>
              <div className="metric-label">Deloads feitos</div>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-title">Volume semanal (kg × reps)</div>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={volumeHistory} margin={{ top: 6, right: 14, left: -14, bottom: 0 }}>
                <CartesianGrid stroke="#2E323A" vertical={false} />
                <XAxis dataKey="week" stroke="#9A9DA6" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#9A9DA6" fontSize={11} tickLine={false} axisLine={false} width={40} />
                <Tooltip contentStyle={{ background: "#22252B", border: "1px solid #2E323A", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="volume" stroke="#FF5630" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <div className="chart-title">Sessões concluídas por semana</div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={volumeHistory} margin={{ top: 6, right: 14, left: -14, bottom: 0 }}>
                <CartesianGrid stroke="#2E323A" vertical={false} />
                <XAxis dataKey="week" stroke="#9A9DA6" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#9A9DA6" fontSize={11} tickLine={false} axisLine={false} width={24} domain={[0, 5]} />
                <Tooltip contentStyle={{ background: "#22252B", border: "1px solid #2E323A", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="sessoes" fill="#4FA3FF" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="section-title heading-font">Evolução de medidas</div>
          {measurements.length === 0 ? (
            <div className="empty-state" style={{ padding: "20px 0" }}>
              Nenhuma medida registrada ainda. Adicione a primeira em <strong>Perfil</strong>.
            </div>
          ) : (
            <table className="measure-table">
              <thead>
                <tr><th>Semana</th><th>Peso</th><th>Cintura</th><th>Ombro</th><th>Braço</th></tr>
              </thead>
              <tbody>
                {measurements.map((m) => (
                  <tr key={m.checkpoint}>
                    <td>S{m.checkpoint}</td><td>{m.peso}kg</td><td>{m.cintura}cm</td><td>{m.ombro}cm</td><td>{m.braco}cm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ---------- TAB: PERFIL ---------- */}
      {tab === "perfil" && (
        <PerfilTab
          week={week}
          measurements={measurements}
          setMeasurements={setMeasurements}
          checkins={checkins}
          setCheckins={setCheckins}
        />
      )}

      {/* ---------- BOTTOM NAV ---------- */}
      <div className="bottom-nav">
        <button className={"nav-btn" + (tab === "hoje" ? " active" : "")} onClick={() => setTab("hoje")}>
          <Home size={20} /> Hoje
        </button>
        <button className={"nav-btn" + (tab === "treino" ? " active" : "")} onClick={() => setTab("treino")}>
          <Dumbbell size={20} /> Treino
        </button>
        <button className={"nav-btn" + (tab === "progresso" ? " active" : "")} onClick={() => setTab("progresso")}>
          <TrendingUp size={20} /> Progresso
        </button>
        <button className={"nav-btn" + (tab === "perfil" ? " active" : "")} onClick={() => setTab("perfil")}>
          <User size={20} /> Perfil
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Aba Perfil (medidas + check-in)                                         */
/* ---------------------------------------------------------------------- */

function PerfilTab({ week, measurements, setMeasurements, checkins, setCheckins }) {
  const checkpointOptions = [0, 4, 8, 12].filter((cp) => !measurements.some((m) => m.checkpoint === cp));
  const [mForm, setMForm] = useState({ checkpoint: checkpointOptions[0] ?? 4, peso: "", cintura: "", ombro: "", braco: "" });
  const [cForm, setCForm] = useState({ sono: "3", energia: "3", fome: "3", dor: "0", obs: "" });

  function saveMeasurement() {
    if (!mForm.peso) return;
    setMeasurements((prev) => [...prev, { ...mForm, checkpoint: Number(mForm.checkpoint) }].sort((a, b) => a.checkpoint - b.checkpoint));
    setMForm({ checkpoint: "", peso: "", cintura: "", ombro: "", braco: "" });
  }

  function saveCheckin() {
    setCheckins((prev) => [{ ...cForm, week }, ...prev]);
    setCForm({ sono: "3", energia: "3", fome: "3", dor: "0", obs: "" });
  }

  return (
    <div className="content">
      <div className="section-title heading-font" style={{ marginTop: 6 }}>Registrar medidas</div>
      {checkpointOptions.length > 0 ? (
        <>
          <div className="field-group">
            <label className="field-label">Checkpoint da semana</label>
            <select className="field-input" value={mForm.checkpoint} onChange={(e) => setMForm({ ...mForm, checkpoint: e.target.value })}>
              {checkpointOptions.map((cp) => <option key={cp} value={cp}>Semana {cp}</option>)}
            </select>
          </div>
          <div className="field-row">
            <div className="field-group" style={{ flex: 1 }}>
              <label className="field-label">Peso (kg)</label>
              <input className="field-input" type="number" value={mForm.peso} onChange={(e) => setMForm({ ...mForm, peso: e.target.value })} />
            </div>
            <div className="field-group" style={{ flex: 1 }}>
              <label className="field-label">Cintura (cm)</label>
              <input className="field-input" type="number" value={mForm.cintura} onChange={(e) => setMForm({ ...mForm, cintura: e.target.value })} />
            </div>
          </div>
          <div className="field-row">
            <div className="field-group" style={{ flex: 1 }}>
              <label className="field-label">Ombro (cm)</label>
              <input className="field-input" type="number" value={mForm.ombro} onChange={(e) => setMForm({ ...mForm, ombro: e.target.value })} />
            </div>
            <div className="field-group" style={{ flex: 1 }}>
              <label className="field-label">Braço (cm)</label>
              <input className="field-input" type="number" value={mForm.braco} onChange={(e) => setMForm({ ...mForm, braco: e.target.value })} />
            </div>
          </div>
          <button className="save-btn" onClick={saveMeasurement}>Salvar medidas</button>
        </>
      ) : (
        <div className="empty-state" style={{ padding: "20px 0" }}>Medidas registradas em todos os checkpoints (0, 4, 8, 12).</div>
      )}

      <div className="section-title heading-font">Check-in semanal</div>
      <div className="field-group">
        <label className="field-label"><Moon size={12} style={{ verticalAlign: -2 }} /> Qualidade do sono (1–5)</label>
        <input className="field-input" type="range" min="1" max="5" value={cForm.sono} onChange={(e) => setCForm({ ...cForm, sono: e.target.value })} />
      </div>
      <div className="field-group">
        <label className="field-label"><Battery size={12} style={{ verticalAlign: -2 }} /> Energia (1–5)</label>
        <input className="field-input" type="range" min="1" max="5" value={cForm.energia} onChange={(e) => setCForm({ ...cForm, energia: e.target.value })} />
      </div>
      <div className="field-group">
        <label className="field-label"><Utensils size={12} style={{ verticalAlign: -2 }} /> Fome/apetite (1–5)</label>
        <input className="field-input" type="range" min="1" max="5" value={cForm.fome} onChange={(e) => setCForm({ ...cForm, fome: e.target.value })} />
      </div>
      <div className="field-group">
        <label className="field-label">Dor ou desconforto (0–5)</label>
        <input className="field-input" type="range" min="0" max="5" value={cForm.dor} onChange={(e) => setCForm({ ...cForm, dor: e.target.value })} />
      </div>
      <div className="field-group">
        <label className="field-label">Observações</label>
        <textarea className="field-input" value={cForm.obs} onChange={(e) => setCForm({ ...cForm, obs: e.target.value })} placeholder="Como foi a semana de treinos..." />
      </div>
      <button className="save-btn" onClick={saveCheckin}>Salvar check-in</button>

      {checkins.map((c, i) => (
        <div className="checkin-item" key={i}>
          <strong>Semana {c.week}</strong>
          <div className="row"><span>Sono {c.sono}/5</span><span>Energia {c.energia}/5</span><span>Fome {c.fome}/5</span><span>Dor {c.dor}/5</span></div>
          {c.obs && <div style={{ marginTop: 6, color: "var(--text-dim)" }}>{c.obs}</div>}
        </div>
      ))}

      <div className="disclaimer">
        Este aplicativo registra sua execução e sugere progressões simples. Ele não substitui avaliação profissional — dor persistente deve ser avaliada por um especialista.
      </div>
    </div>
  );
}
