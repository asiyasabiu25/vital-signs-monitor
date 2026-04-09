import { useState, useEffect, useRef } from "react";

const NORMAL_RANGES = {
  heartRate: { min: 60, max: 100, unit: "bpm", label: "Heart Rate" },
  spo2: { min: 95, max: 100, unit: "%", label: "SpO₂" },
  temperature: { min: 36.1, max: 37.5, unit: "°C", label: "Temperature" },
  systolic: { min: 90, max: 120, unit: "mmHg", label: "Systolic BP" },
  diastolic: { min: 60, max: 80, unit: "mmHg", label: "Diastolic BP" },
};

const PATIENTS = [
  { id: 1, name: "Patient A", age: 34, ward: "Cardiology" },
  { id: 2, name: "Patient B", age: 67, ward: "ICU" },
  { id: 3, name: "Patient C", age: 52, ward: "General" },
];

function generateVital(key, mode) {
  const r = NORMAL_RANGES[key];
  const spread = r.max - r.min;
  if (mode === "stable") {
    return +(r.min + Math.random() * spread).toFixed(1);
  } else if (mode === "warning") {
    const offset = spread * 0.3;
    return Math.random() > 0.5
      ? +(r.max + Math.random() * offset).toFixed(1)
      : +(r.min - Math.random() * offset * 0.5).toFixed(1);
  } else {
    const offset = spread * 0.7;
    return Math.random() > 0.5
      ? +(r.max + Math.random() * offset).toFixed(1)
      : +(r.min - Math.random() * offset).toFixed(1);
  }
}

function getStatus(vitals) {
  const checks = [
    vitals.heartRate < NORMAL_RANGES.heartRate.min || vitals.heartRate > NORMAL_RANGES.heartRate.max,
    vitals.spo2 < NORMAL_RANGES.spo2.min,
    vitals.temperature < NORMAL_RANGES.temperature.min || vitals.temperature > NORMAL_RANGES.temperature.max,
    vitals.systolic < NORMAL_RANGES.systolic.min || vitals.systolic > NORMAL_RANGES.systolic.max,
    vitals.diastolic < NORMAL_RANGES.diastolic.min || vitals.diastolic > NORMAL_RANGES.diastolic.max,
  ];
  const abnormal = checks.filter(Boolean).length;
  if (abnormal === 0) return "stable";
  if (abnormal <= 2) return "warning";
  return "critical";
}

function generateVitals(mode) {
  return {
    heartRate: generateVital("heartRate", mode),
    spo2: generateVital("spo2", mode),
    temperature: generateVital("temperature", mode),
    systolic: generateVital("systolic", mode),
    diastolic: generateVital("diastolic", mode),
  };
}

function ECGWave({ bpm }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    let offset = 0;

    function ecgY(x) {
      const cycle = W * (60 / bpm) * 0.15;
      const pos = ((x + offset) % cycle) / cycle;
      if (pos < 0.1) return H / 2;
      if (pos < 0.15) return H / 2 - (pos - 0.1) * 300;
      if (pos < 0.2) return H / 2 + (pos - 0.15) * 600;
      if (pos < 0.25) return H / 2 - (pos - 0.2) * 800;
      if (pos < 0.35) return H / 2 + (pos - 0.25) * 200;
      if (pos < 0.45) return H / 2 + 20 * Math.sin((pos - 0.35) * Math.PI * 5);
      return H / 2;
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = "#00ff88";
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 6;
      ctx.shadowColor = "#00ff88";
      ctx.beginPath();
      for (let x = 0; x <= W; x++) {
        const y = ecgY(x);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      offset += 2;
      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [bpm]);

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={60}
      style={{ width: "100%", height: "60px" }}
    />
  );
}

function VitalCard({ label, value, unit, rangeKey, animate }) {
  const r = NORMAL_RANGES[rangeKey];
  const isHigh = value > r.max;
  const isLow = value < r.min;
  const isAbnormal = isHigh || isLow;

  const color = isAbnormal ? (isHigh ? "#ff4d4d" : "#ff9900") : "#00ff88";

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${isAbnormal ? color : "rgba(255,255,255,0.08)"}`,
        borderRadius: "12px",
        padding: "16px",
        position: "relative",
        overflow: "hidden",
        transition: "border-color 0.4s",
        boxShadow: isAbnormal ? `0 0 12px ${color}33` : "none",
      }}
    >
      <div style={{ fontSize: "11px", color: "#888", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>
        {label}
      </div>
      <div
        style={{
          fontSize: "28px",
          fontFamily: "'Space Mono', monospace",
          color,
          transition: "color 0.4s",
          animation: animate ? "pulse 0.3s ease" : "none",
        }}
      >
        {value}
        <span style={{ fontSize: "13px", marginLeft: "4px", color: "#666" }}>{unit}</span>
      </div>
      <div style={{ fontSize: "10px", color: "#555", marginTop: "4px" }}>
        Normal: {r.min}–{r.max} {unit}
      </div>
      {isAbnormal && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            fontSize: "10px",
            background: color,
            color: "#000",
            padding: "2px 6px",
            borderRadius: "4px",
            fontWeight: "bold",
            letterSpacing: "0.05em",
          }}
        >
          {isHigh ? "HIGH" : "LOW"}
        </div>
      )}
    </div>
  );
}

function App() {
  const [selectedPatient, setSelectedPatient] = useState(PATIENTS[0]);
  const [mode, setMode] = useState("stable");
  const [vitals, setVitals] = useState(generateVitals("stable"));
  const [history, setHistory] = useState([]);
  const [tick, setTick] = useState(0);
  const [time, setTime] = useState(new Date());
  const [alerts, setAlerts] = useState([]);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const newVitals = generateVitals(mode);
      const status = getStatus(newVitals);
      setVitals(newVitals);
      setTick((t) => t + 1);
      setTime(new Date());
      setAnimating(true);
      setTimeout(() => setAnimating(false), 300);

      setHistory((h) => {
        const entry = { ...newVitals, time: new Date().toLocaleTimeString(), status };
        return [...h.slice(-8), entry];
      });

      if (status !== "stable") {
        const msg =
          status === "critical"
            ? `⚠ CRITICAL: ${selectedPatient.name} — multiple vitals out of range`
            : `⚡ WARNING: ${selectedPatient.name} — abnormal reading detected`;
        setAlerts((a) => [{ msg, time: new Date().toLocaleTimeString(), status }, ...a.slice(0, 3)]);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [mode, selectedPatient]);

  const status = getStatus(vitals);
  const statusColor = { stable: "#00ff88", warning: "#ff9900", critical: "#ff4d4d" }[status];
  const statusLabel = { stable: "● STABLE", warning: "⚠ WARNING", critical: "✦ CRITICAL" }[status];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050a0e",
        color: "#e0e0e0",
        fontFamily: "'DM Sans', sans-serif",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes slideIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0f14; }
        ::-webkit-scrollbar-thumb { background: #1e2a35; border-radius: 4px; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ fontSize: "11px", color: "#00ff88", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "4px" }}>
            Biomedical Systems Simulation
          </div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 600, color: "#fff", letterSpacing: "-0.02em" }}>
            Patient Vital Signs Monitor
          </h1>
          <div style={{ fontSize: "12px", color: "#555", marginTop: "4px" }}>
            Simulates sensor-to-alert embedded logic · Built by Asiya Sabiu Sulaiman
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "20px", color: "#fff" }}>
            {time.toLocaleTimeString()}
          </div>
          <div style={{ fontSize: "11px", color: "#444" }}>{time.toLocaleDateString()}</div>
        </div>
      </div>

      {/* Patient + Mode Selectors */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "200px" }}>
          <div style={{ fontSize: "11px", color: "#555", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Patient</div>
          <div style={{ display: "flex", gap: "8px" }}>
            {PATIENTS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPatient(p)}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  background: selectedPatient.id === p.id ? "rgba(0,255,136,0.1)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${selectedPatient.id === p.id ? "#00ff88" : "rgba(255,255,255,0.06)"}`,
                  borderRadius: "8px",
                  color: selectedPatient.id === p.id ? "#00ff88" : "#666",
                  fontSize: "12px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {p.name}<br />
                <span style={{ fontSize: "10px", color: "#444" }}>{p.ward}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ minWidth: "220px" }}>
          <div style={{ fontSize: "11px", color: "#555", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Simulate Condition</div>
          <div style={{ display: "flex", gap: "8px" }}>
            {["stable", "warning", "critical"].map((m) => {
              const c = { stable: "#00ff88", warning: "#ff9900", critical: "#ff4d4d" }[m];
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    flex: 1,
                    padding: "8px",
                    background: mode === m ? `${c}18` : "rgba(255,255,255,0.03)",
                    border: `1px solid ${mode === m ? c : "rgba(255,255,255,0.06)"}`,
                    borderRadius: "8px",
                    color: mode === m ? c : "#555",
                    fontSize: "11px",
                    cursor: "pointer",
                    textTransform: "capitalize",
                    transition: "all 0.2s",
                  }}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <div
        style={{
          background: `${statusColor}12`,
          border: `1px solid ${statusColor}44`,
          borderRadius: "10px",
          padding: "12px 18px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          animation: status === "critical" ? "pulse 1.2s infinite" : "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ color: statusColor, fontWeight: 600, letterSpacing: "0.05em", fontSize: "14px" }}>{statusLabel}</span>
          <span style={{ color: "#444", fontSize: "12px" }}>|</span>
          <span style={{ fontSize: "13px", color: "#888" }}>{selectedPatient.name} · {selectedPatient.age}y · {selectedPatient.ward}</span>
        </div>
        <span style={{ fontSize: "11px", color: "#444" }}>Update #{tick}</span>
      </div>

      {/* ECG */}
      <div style={{
        background: "rgba(0,255,136,0.03)",
        border: "1px solid rgba(0,255,136,0.1)",
        borderRadius: "12px",
        padding: "16px",
        marginBottom: "20px",
      }}>
        <div style={{ fontSize: "11px", color: "#555", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          ECG Waveform — {vitals.heartRate} bpm
        </div>
        <ECGWave bpm={vitals.heartRate} />
      </div>

      {/* Vitals Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", marginBottom: "24px" }}>
        <VitalCard label="Heart Rate" value={vitals.heartRate} unit="bpm" rangeKey="heartRate" animate={animating} />
        <VitalCard label="SpO₂" value={vitals.spo2} unit="%" rangeKey="spo2" animate={animating} />
        <VitalCard label="Temperature" value={vitals.temperature} unit="°C" rangeKey="temperature" animate={animating} />
        <VitalCard label="Systolic BP" value={vitals.systolic} unit="mmHg" rangeKey="systolic" animate={animating} />
        <VitalCard label="Diastolic BP" value={vitals.diastolic} unit="mmHg" rangeKey="diastolic" animate={animating} />
      </div>

      {/* Bottom: History + Alerts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {/* History */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "16px" }}>
          <div style={{ fontSize: "11px", color: "#555", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Reading History</div>
          {history.length === 0 && <div style={{ color: "#333", fontSize: "12px" }}>Waiting for readings…</div>}
          {[...history].reverse().map((h, i) => {
            const c = { stable: "#00ff88", warning: "#ff9900", critical: "#ff4d4d" }[h.status];
            return (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", animation: "slideIn 0.3s ease" }}>
                <span style={{ fontSize: "11px", color: "#444" }}>{h.time}</span>
                <span style={{ fontSize: "11px", fontFamily: "'Space Mono', monospace", color: "#888" }}>
                  {h.heartRate}bpm · {h.spo2}% · {h.temperature}°C
                </span>
                <span style={{ fontSize: "10px", color: c, fontWeight: 600 }}>{h.status.toUpperCase()}</span>
              </div>
            );
          })}
        </div>

        {/* Alerts */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "16px" }}>
          <div style={{ fontSize: "11px", color: "#555", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Alert Log</div>
          {alerts.length === 0 && <div style={{ color: "#333", fontSize: "12px" }}>No alerts — patient stable</div>}
          {alerts.map((a, i) => {
            const c = { warning: "#ff9900", critical: "#ff4d4d" }[a.status] || "#888";
            return (
              <div key={i} style={{ padding: "8px 10px", marginBottom: "8px", background: `${c}10`, border: `1px solid ${c}33`, borderRadius: "8px", animation: "slideIn 0.3s ease" }}>
                <div style={{ fontSize: "12px", color: c }}>{a.msg}</div>
                <div style={{ fontSize: "10px", color: "#444", marginTop: "2px" }}>{a.time}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer note */}
      <div style={{ marginTop: "24px", padding: "14px 18px", background: "rgba(255,255,255,0.02)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ fontSize: "11px", color: "#444", lineHeight: "1.7" }}>
          <span style={{ color: "#666" }}>How this works:</span> Each sensor reading is generated every 2 seconds simulating hardware sensor polling. Conditional logic checks each vital against clinically accurate thresholds (sourced from Human Physiology training) to trigger status changes and alerts — mirroring how embedded systems process real-world inputs into actionable outputs.
        </div>
      </div>
    </div>
  );
}

export default App;
