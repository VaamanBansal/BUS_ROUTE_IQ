import React, { useState, useRef, useEffect, useCallback } from "react";

/* ─── GLOBAL STYLES ─── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; background: #f0f4f8; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
  input, select, button { font-family: inherit; }
  input:focus, select:focus { outline: none; }
  input::placeholder { color: #94a3b8; }
  @keyframes fadeUp   { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes cardIn   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin     { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
  @keyframes pulse    { 0%,100% { opacity:1; } 50% { opacity:.35; } }
  @keyframes float    { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
  @keyframes shimmer  { 0% { background-position:-600px 0; } 100% { background-position:600px 0; } }
  @keyframes toastIn  { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
  @keyframes busDrive { from { transform:translateX(-60px); } to { transform:translateX(110vw); } }
  @keyframes glowRed    { 0%,100%{box-shadow:0 0 18px 6px rgba(239,68,68,.9),0 0 40px 12px rgba(239,68,68,.4);} 50%{box-shadow:0 0 28px 10px rgba(239,68,68,1),0 0 60px 20px rgba(239,68,68,.6);} }
  @keyframes glowYellow { 0%,100%{box-shadow:0 0 18px 6px rgba(245,158,11,.9),0 0 40px 12px rgba(245,158,11,.4);} 50%{box-shadow:0 0 28px 10px rgba(245,158,11,1),0 0 60px 20px rgba(245,158,11,.6);} }
  @keyframes glowGreen  { 0%,100%{box-shadow:0 0 18px 6px rgba(34,197,94,.9),0 0 40px 12px rgba(34,197,94,.4);} 50%{box-shadow:0 0 28px 10px rgba(34,197,94,1),0 0 60px 20px rgba(34,197,94,.6);} }
  @keyframes modalIn  { from{opacity:0;transform:scale(.93) translateY(20px);} to{opacity:1;transform:scale(1) translateY(0);} }
  @keyframes ticketIn { from{opacity:0;transform:translateY(30px) scale(.97);} to{opacity:1;transform:translateY(0) scale(1);} }
  @keyframes checkPop { 0%{transform:scale(0);} 60%{transform:scale(1.3);} 100%{transform:scale(1);} }
  @keyframes barcodeScroll { 0%{background-position:0 0;} 100%{background-position:40px 0;} }
  .chip-hover:hover { background:#eff6ff !important; border-color:#93c5fd !important; color:#1d4ed8 !important; }
  .btn-row-hover:hover { background:#f1f5f9 !important; }
  @media (max-width: 1024px) { .sidebar { display:none !important; } }
  @media (max-width: 860px)  { .result-grid { grid-template-columns: 1fr !important; } .search-row { flex-direction:column !important; } }
  @media (max-width: 640px)  { .h1-big { font-size:34px !important; } .nav-links { display:none !important; } .page-pad { padding:24px 16px !important; } .stats-strip { grid-template-columns:repeat(2,1fr) !important; } }
`;

/* ─── DATA ─── */
const STOPS = [
  "Koyambedu Bus Terminus","Anna Nagar Tower","T. Nagar Bus Depot","Adyar Signal",
  "Velachery","Tambaram","Guindy","Vadapalani","Porur","Ambattur","Avadi",
  "Perambur","Royapuram","Chennai Central","Egmore","Mylapore","Nungambakkam",
  "Kodambakkam","Saidapet","Chromepet","Pallavaram","Medavakkam","Sholinganallur",
  "OMR Toll Plaza","Perungudi","Thoraipakkam","Madipakkam","Pammal","Alandur",
  "St. Thomas Mount","Meenambakkam Airport","Pallikaranai","Broadway","Parrys Corner",
  "Washermenpet","Tondiarpet","Thiruvottiyur","Anna Salai","Mount Road",
  "Teynampet","Alwarpet","Thousand Lights","Spencer Plaza","Park Town",
  "Triplicane","Chepauk","Marina Beach","Besant Nagar","Thiruvanmiyur",
  "Selaiyur","Chitlapakkam","Poonamallee","Vandalur","Guduvanchery",
];

const ROUTES_DB = [
  { id:"5C",  color:"#ef4444", stops:["Koyambedu Bus Terminus","Anna Nagar Tower","Nungambakkam","Anna Salai","T. Nagar Bus Depot","Mylapore","Adyar Signal"], type:"Express", ac:false },
  { id:"M70", color:"#0ea5e9", stops:["Ambattur","Vadapalani","Koyambedu Bus Terminus","Guindy","Velachery","Tambaram","Chromepet","Pallavaram"], type:"Metro Feeder", ac:false },
  { id:"47A", color:"#f59e0b", stops:["Broadway","Parrys Corner","Royapuram","Perambur","Ambattur","Poonamallee","Porur"], type:"Ordinary", ac:false },
  { id:"119", color:"#8b5cf6", stops:["Chennai Central","Egmore","Nungambakkam","Kodambakkam","Saidapet","Guindy","St. Thomas Mount","Chromepet","Tambaram","Vandalur","Guduvanchery"], type:"Express", ac:false },
  { id:"23B", color:"#06b6d4", stops:["T. Nagar Bus Depot","Mylapore","Adyar Signal","Thiruvanmiyur","Sholinganallur","OMR Toll Plaza","Perungudi","Thoraipakkam"], type:"Ordinary", ac:false },
  { id:"M9",  color:"#3b82f6", stops:["Koyambedu Bus Terminus","Anna Nagar Tower","Poonamallee","Porur","Guindy","Velachery","Perungudi","Sholinganallur"], type:"Metro Feeder", ac:false },
  { id:"AC1", color:"#10b981", stops:["Chennai Central","Anna Salai","Teynampet","Alwarpet","Adyar Signal","Besant Nagar","Thiruvanmiyur"], type:"AC Express", ac:true },
  { id:"27C", color:"#f97316", stops:["Broadway","Parrys Corner","Washermenpet","Tondiarpet","Thiruvottiyur","Royapuram","Perambur","Egmore","Chennai Central"], type:"Ordinary", ac:false },
  { id:"15G", color:"#e11d48", stops:["Tambaram","Pallavaram","Chromepet","Saidapet","T. Nagar Bus Depot","Thousand Lights","Spencer Plaza","Park Town","Egmore","Chennai Central"], type:"Express", ac:false },
  { id:"A52", color:"#7c3aed", stops:["Meenambakkam Airport","Alandur","Guindy","Anna Salai","Mount Road","Egmore","Perambur","Avadi","Ambattur"], type:"AC Express", ac:true },
  { id:"M12", color:"#0284c7", stops:["Velachery","Medavakkam","Madipakkam","Pallikaranai","Sholinganallur","Perungudi","OMR Toll Plaza","Thoraipakkam"], type:"Metro Feeder", ac:false },
  { id:"33",  color:"#db2777", stops:["Porur","Vadapalani","Kodambakkam","T. Nagar Bus Depot","Saidapet","Guindy","Alandur","St. Thomas Mount","Tambaram"], type:"Ordinary", ac:false },
  { id:"19E", color:"#16a34a", stops:["Anna Nagar Tower","Koyambedu Bus Terminus","Vadapalani","Saidapet","Mylapore","Triplicane","Chepauk","Marina Beach"], type:"Express", ac:false },
  { id:"70A", color:"#ea580c", stops:["Avadi","Ambattur","Koyambedu Bus Terminus","Anna Nagar Tower","Nungambakkam","Egmore","Chennai Central","Perambur"], type:"Ordinary", ac:false },
];

const POPULAR_ROUTES = [
  ["Koyambedu Bus Terminus","Adyar Signal"],
  ["Chennai Central","Velachery"],
  ["T. Nagar Bus Depot","Tambaram"],
  ["Egmore","Sholinganallur"],
  ["Broadway","Guindy"],
  ["Anna Nagar Tower","Marina Beach"],
];

const CROWD_HOURS = [5,4,3,3,4,8,25,60,90,75,55,50,70,80,65,55,60,75,90,85,60,40,20,10];

/* ─── ENGINE ─── */
let _seed = 42;
function rng(seed) {
  _seed = seed;
  return function() {
    _seed = (_seed * 16807) % 2147483647;
    return (_seed - 1) / 2147483646;
  };
}

function findRoutes(from, to) {
  if (!from || !to || from === to) return [];
  const rand = rng(from.length * 131 + to.length * 17);
  const results = [];
  ROUTES_DB.forEach(route => {
    const fi = route.stops.indexOf(from);
    const ti = route.stops.indexOf(to);
    if (fi === -1 || ti === -1 || fi === ti) return;
    const sc = Math.abs(ti - fi);
    const stops = fi < ti ? route.stops.slice(fi, ti + 1) : [...route.stops.slice(ti, fi + 1)].reverse();
    const dist = +(sc * 2.4 + rand() * 2).toFixed(1);
    const mins = Math.round(sc * 5 + (route.type.includes("Express") ? 0 : sc * 1.5) + rand() * 8);
    const fare = route.ac ? Math.max(30, Math.ceil((dist * 2.5) / 5) * 5) : Math.max(10, Math.ceil((dist * 1.2) / 5) * 5);
    const nextBus = Math.floor(rand() * 14 + 2);
    results.push({
      id: `d-${route.id}`, type: "direct", label: "Direct",
      buses: [{ ...route, boardAt: from, alightAt: to, stops, stopsCount: sc }],
      totalMins: mins, totalFare: fare, distance: dist, changes: 0,
      frequency: Math.floor(rand() * 10 + 8), nextBus, co2: +(dist * 0.04).toFixed(2),
      countdown: nextBus * 60,
    });
  });
  if (results.length < 3) {
    outer: for (const r1 of ROUTES_DB) {
      const fi = r1.stops.indexOf(from);
      if (fi === -1) continue;
      for (const r2 of ROUTES_DB) {
        if (r1.id === r2.id) continue;
        const ti = r2.stops.indexOf(to);
        if (ti === -1) continue;
        let common = null;
        for (let i = fi + 1; i < r1.stops.length; i++) {
          const ci2 = r2.stops.indexOf(r1.stops[i]);
          if (ci2 !== -1 && ci2 < ti) { common = r1.stops[i]; break; }
        }
        if (!common) continue;
        const ci1 = r1.stops.indexOf(common);
        const ci2 = r2.stops.indexOf(common);
        const sc1 = Math.abs(ci1 - fi);
        const sc2 = Math.abs(ti - ci2);
        const s1 = fi < ci1 ? r1.stops.slice(fi, ci1 + 1) : [...r1.stops.slice(ci1, fi + 1)].reverse();
        const s2 = ci2 < ti ? r2.stops.slice(ci2, ti + 1) : [...r2.stops.slice(ti, ci2 + 1)].reverse();
        const dist = +((sc1 + sc2) * 2.2).toFixed(1);
        const mins = Math.round(sc1 * 5 + sc2 * 5 + 8 + rand() * 10);
        const fare = Math.round(Math.max(15, (r1.ac ? sc1 * 1.8 : sc1 * 0.8) + (r2.ac ? sc2 * 1.8 : sc2 * 0.8) + 5) / 5) * 5;
        const nextBus = Math.floor(rand() * 18 + 3);
        results.push({
          id: `t-${r1.id}-${r2.id}`, type: "transfer", label: "1 Change",
          buses: [
            { ...r1, boardAt: from, alightAt: common, stops: s1, stopsCount: sc1 },
            { ...r2, boardAt: common, alightAt: to, stops: s2, stopsCount: sc2 },
          ],
          totalMins: mins, totalFare: fare, distance: dist, changes: 1, transferAt: common,
          frequency: Math.floor(rand() * 12 + 6), nextBus, co2: +(dist * 0.04).toFixed(2),
          countdown: nextBus * 60,
        });
        if (results.length >= 5) break outer;
      }
    }
  }
  results.sort((a, b) => a.changes - b.changes || a.totalMins - b.totalMins);
  if (results[0]) results[0].badge = "Recommended";
  const fastest = [...results].sort((a, b) => a.totalMins - b.totalMins)[0];
  if (fastest && fastest.id !== results[0]?.id) fastest.badge = "Fastest";
  const cheapest = [...results].sort((a, b) => a.totalFare - b.totalFare)[0];
  if (cheapest && cheapest.id !== results[0]?.id && cheapest.id !== fastest?.id) cheapest.badge = "Cheapest";
  return results.slice(0, 5);
}

function getTraffic() {
  const h = new Date().getHours();
  if ((h >= 8 && h <= 10) || (h >= 17 && h <= 20)) return { level: "High", color: "#ef4444", extra: 12 };
  if ((h >= 11 && h <= 16) || (h >= 21 && h <= 22)) return { level: "Moderate", color: "#f59e0b", extra: 5 };
  return { level: "Low", color: "#22c55e", extra: 0 };
}

function getWeather() {
  const idx = Math.floor(Date.now() / 1000 / 300) % 4;
  return [
    { icon: "☀️", label: "Sunny", delay: 0 },
    { icon: "⛅", label: "Partly Cloudy", delay: 2 },
    { icon: "🌧️", label: "Raining", delay: 8 },
    { icon: "🌩️", label: "Thunderstorm", delay: 15 },
  ][idx];
}

/* ─── TRAFFIC LIGHT ─── */
function TrafficLight() {
  const [phase, setPhase] = useState(0); // 0=red, 1=yellow, 2=green
  const DURATIONS = [4000, 1500, 4000];
  useEffect(() => {
    const tick = () => setPhase(p => (p + 1) % 3);
    const id = setTimeout(tick, DURATIONS[phase]);
    return () => clearTimeout(id);
  }, [phase]);
  const colors = [
    { off: "#3d1010", on: "#ef4444", glow: "glowRed",    label: "STOP" },
    { off: "#3d2c00", on: "#f59e0b", glow: "glowYellow", label: "WAIT" },
    { off: "#0a2a0a", on: "#22c55e", glow: "glowGreen",  label: "GO" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      {/* Pole */}
      <div style={{
        background: "linear-gradient(180deg,#1e293b,#334155)",
        borderRadius: 16, padding: "14px 10px", display: "flex", flexDirection: "column",
        gap: 10, boxShadow: "0 8px 32px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.07)",
        border: "2px solid #475569",
      }}>
        {colors.map((c, i) => (
          <div key={i} style={{ position: "relative" }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: phase === i ? c.on : c.off,
              animation: phase === i ? `${c.glow} 1.2s ease-in-out infinite` : "none",
              transition: "background 0.3s ease",
              border: `2.5px solid ${phase === i ? c.on : "#475569"}`,
            }} />
          </div>
        ))}
      </div>
      <div style={{
        fontSize: 8, fontWeight: 900, letterSpacing: "0.15em",
        color: colors[phase].on, marginTop: 3,
        textShadow: `0 0 8px ${colors[phase].on}`,
        animation: `pulse 1s ease-in-out infinite`,
      }}>{colors[phase].label}</div>
      {/* Pole stem */}
      <div style={{ width: 4, height: 30, background: "linear-gradient(180deg,#475569,#1e293b)", borderRadius: 2 }} />
    </div>
  );
}

/* ─── LOGIN MODAL ─── */
function LoginModal({ onClose, onLogin }) {
  const [mode, setMode] = useState("login"); // login | register
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handle = (field, val) => { setForm(f => ({ ...f, [field]: val })); setErr(""); };

  const submit = () => {
    if (!form.email || !form.password) { setErr("Please fill in all fields."); return; }
    if (mode === "register" && !form.name) { setErr("Please enter your name."); return; }
    if (form.password.length < 4) { setErr("Password must be at least 4 characters."); return; }
    setLoading(true);
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem("biq_users") || "[]");
      if (mode === "register") {
        if (users.find(u => u.email === form.email)) { setErr("Email already registered."); setLoading(false); return; }
        const newUser = { name: form.name || form.email.split("@")[0], email: form.email, password: form.password };
        localStorage.setItem("biq_users", JSON.stringify([...users, newUser]));
        onLogin(newUser);
      } else {
        const user = users.find(u => u.email === form.email && u.password === form.password);
        if (!user) { setErr("Invalid email or password."); setLoading(false); return; }
        onLogin(user);
      }
    }, 700);
  };

  return (
    <div style={{ position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,.65)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20 }} onClick={onClose}>
      <div style={{ background:"#fff",borderRadius:24,padding:36,width:"100%",maxWidth:420,boxShadow:"0 40px 100px rgba(0,0,0,.45)",animation:"modalIn .35s cubic-bezier(.22,1,.36,1)" }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
          <div style={{ fontSize:24,fontWeight:900,color:"#0f172a" }}>{mode==="login"?"Welcome back 👋":"Join BusRouteIQ 🚌"}</div>
          <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",fontSize:22,color:"#94a3b8",lineHeight:1 }}>✕</button>
        </div>
        <div style={{ fontSize:13,color:"#64748b",marginBottom:28 }}>{mode==="login"?"Sign in to book tickets and save routes.":"Create a free account to get started."}</div>

        {/* Toggle */}
        <div style={{ display:"flex",background:"#f1f5f9",borderRadius:12,padding:4,marginBottom:24 }}>
          {["login","register"].map(m=>(
            <button key={m} onClick={()=>{setMode(m);setErr("");}} style={{
              flex:1,padding:"9px 0",borderRadius:9,border:"none",cursor:"pointer",
              background:mode===m?"#fff":"transparent",
              color:mode===m?"#0f172a":"#94a3b8",
              fontWeight:800,fontSize:13,
              boxShadow:mode===m?"0 2px 8px rgba(0,0,0,.1)":"none",
              transition:"all .2s"
            }}>{m==="login"?"Sign In":"Register"}</button>
          ))}
        </div>

        {mode==="register"&&(
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:11,fontWeight:700,color:"#64748b",marginBottom:6,letterSpacing:"0.05em" }}>FULL NAME</div>
            <input value={form.name} onChange={e=>handle("name",e.target.value)} placeholder="Arjun Kumar"
              style={{ width:"100%",padding:"13px 15px",borderRadius:11,border:"2px solid #e2e8f0",fontSize:14,fontWeight:600,color:"#0f172a",background:"#f8fafc",transition:"border .2s" }}
              onFocus={e=>e.target.style.borderColor="#6366f1"} onBlur={e=>e.target.style.borderColor="#e2e8f0"} />
          </div>
        )}
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:11,fontWeight:700,color:"#64748b",marginBottom:6,letterSpacing:"0.05em" }}>EMAIL</div>
          <input value={form.email} onChange={e=>handle("email",e.target.value)} placeholder="you@example.com" type="email"
            style={{ width:"100%",padding:"13px 15px",borderRadius:11,border:"2px solid #e2e8f0",fontSize:14,fontWeight:600,color:"#0f172a",background:"#f8fafc",transition:"border .2s" }}
            onFocus={e=>e.target.style.borderColor="#6366f1"} onBlur={e=>e.target.style.borderColor="#e2e8f0"} />
        </div>
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:11,fontWeight:700,color:"#64748b",marginBottom:6,letterSpacing:"0.05em" }}>PASSWORD</div>
          <input value={form.password} onChange={e=>handle("password",e.target.value)} placeholder="••••••••" type="password"
            style={{ width:"100%",padding:"13px 15px",borderRadius:11,border:"2px solid #e2e8f0",fontSize:14,fontWeight:600,color:"#0f172a",background:"#f8fafc",transition:"border .2s" }}
            onFocus={e=>e.target.style.borderColor="#6366f1"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}
            onKeyDown={e=>e.key==="Enter"&&submit()} />
        </div>
        {err&&<div style={{ background:"#fef2f2",border:"1px solid #fecaca",borderRadius:9,padding:"10px 14px",fontSize:12,fontWeight:700,color:"#dc2626",marginBottom:16 }}>⚠️ {err}</div>}
        <button onClick={submit} disabled={loading} style={{
          width:"100%",padding:"14px",borderRadius:12,border:"none",cursor:"pointer",
          background:"linear-gradient(135deg,#3b82f6,#6366f1)",color:"#fff",
          fontSize:15,fontWeight:800,letterSpacing:"-0.2px",
          boxShadow:"0 8px 24px rgba(99,102,241,.45)",transition:"all .2s",
          display:"flex",alignItems:"center",justifyContent:"center",gap:8,
        }}>
          {loading?<div style={{ width:18,height:18,border:"2.5px solid rgba(255,255,255,.35)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .7s linear infinite" }}/>:null}
          {loading?"Please wait…":mode==="login"?"Sign In →":"Create Account →"}
        </button>
        <div style={{ textAlign:"center",marginTop:16,fontSize:11,color:"#94a3b8" }}>
          {mode==="login"?"Demo: register first, then sign in":"Your data stays local — no server needed"}
        </div>
      </div>
    </div>
  );
}

/* ─── TICKET BOOKING PAGE ─── */
function generateTicketId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return "TK" + Array.from({length:8},()=>chars[Math.floor(Math.random()*chars.length)]).join("");
}

function ETicket({ ticket, onClose, onDownload }) {
  const ticketRef = useRef(null);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    // Generate downloadable HTML ticket
    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>BusRouteIQ E-Ticket - ${ticket.ticketId}</title>
<style>
  body { margin:0; background:#f0f4f8; font-family: 'Segoe UI', sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; }
  .ticket { background:#fff; width:480px; border-radius:20px; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,.2); }
  .header { background:linear-gradient(135deg,#0f172a,#1e3a5f); color:#fff; padding:28px 32px; }
  .logo { font-size:22px; font-weight:900; margin-bottom:4px; }
  .logo span { color:#60a5fa; }
  .subtitle { font-size:11px; color:#94a3b8; letter-spacing:.08em; }
  .badge { display:inline-block; background:rgba(34,197,94,.2); border:1px solid rgba(34,197,94,.4); color:#4ade80; padding:4px 12px; border-radius:20px; font-size:10px; font-weight:800; margin-top:10px; }
  .route-section { padding:24px 32px; border-bottom:2px dashed #e2e8f0; }
  .route-row { display:flex; align-items:center; gap:0; margin-bottom:8px; }
  .stop-label { font-size:10px; font-weight:700; color:#94a3b8; letter-spacing:.08em; text-transform:uppercase; margin-bottom:4px; }
  .stop-name { font-size:16px; font-weight:900; color:#0f172a; }
  .arrow { flex:1; text-align:center; font-size:22px; color:#3b82f6; }
  .details-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:0; padding:20px 32px; border-bottom:2px dashed #e2e8f0; }
  .detail-item { text-align:center; padding:12px 8px; }
  .detail-val { font-size:18px; font-weight:900; color:#0f172a; }
  .detail-label { font-size:9px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:.06em; margin-top:3px; }
  .passenger-section { padding:20px 32px; border-bottom:2px dashed #e2e8f0; }
  .passenger-label { font-size:10px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:.08em; margin-bottom:6px; }
  .passenger-name { font-size:18px; font-weight:900; color:#0f172a; }
  .barcode-section { padding:20px 32px; text-align:center; background:#f8fafc; }
  .barcode { font-family:monospace; font-size:36px; letter-spacing:4px; color:#0f172a; line-height:1; margin-bottom:6px; font-weight:900; }
  .ticket-id { font-size:12px; font-weight:800; color:#64748b; letter-spacing:.15em; }
  .footer { background:#0f172a; padding:16px 32px; text-align:center; }
  .footer-text { font-size:10px; color:#475569; }
</style>
</head>
<body>
<div class="ticket">
  <div class="header">
    <div class="logo">BusRoute<span>IQ</span></div>
    <div class="subtitle">CHENNAI METROPOLITAN TRANSPORT CORPORATION</div>
    <div class="badge">✓ CONFIRMED E-TICKET</div>
  </div>
  <div class="route-section">
    <div class="route-row">
      <div>
        <div class="stop-label">From</div>
        <div class="stop-name">${ticket.from}</div>
      </div>
      <div class="arrow">→</div>
      <div style="text-align:right">
        <div class="stop-label">To</div>
        <div class="stop-name">${ticket.to}</div>
      </div>
    </div>
  </div>
  <div class="details-grid">
    <div class="detail-item">
      <div class="detail-val">${ticket.busId}</div>
      <div class="detail-label">Bus No.</div>
    </div>
    <div class="detail-item">
      <div class="detail-val">₹${ticket.fare}</div>
      <div class="detail-label">Fare</div>
    </div>
    <div class="detail-item">
      <div class="detail-val">${ticket.date}</div>
      <div class="detail-label">Date</div>
    </div>
    <div class="detail-item">
      <div class="detail-val">${ticket.departureTime}</div>
      <div class="detail-label">Departure</div>
    </div>
    <div class="detail-item">
      <div class="detail-val">${ticket.seatType}</div>
      <div class="detail-label">Seat Type</div>
    </div>
    <div class="detail-item">
      <div class="detail-val">${ticket.passengers}</div>
      <div class="detail-label">Passenger(s)</div>
    </div>
  </div>
  <div class="passenger-section">
    <div class="passenger-label">Passenger Name</div>
    <div class="passenger-name">${ticket.passengerName}</div>
  </div>
  <div class="barcode-section">
    <div class="barcode">||| || | ||| | || |||</div>
    <div class="ticket-id">${ticket.ticketId}</div>
  </div>
  <div class="footer">
    <div class="footer-text">This is a simulated e-ticket for demonstration purposes only. Valid on date of travel.</div>
  </div>
</div>
</body>
</html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BusRouteIQ_${ticket.ticketId}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  // Mini barcode visual
  const barBits = Array.from({length:48},(_,i)=> (i*7+13)%3===0?3:((i*3+7)%5===0?6:((i%4===0)?10:4)));

  return (
    <div style={{ position:"fixed",inset:0,zIndex:1100,background:"rgba(0,0,0,.75)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,overflow:"auto" }} onClick={onClose}>
      <div style={{ animation:"ticketIn .4s cubic-bezier(.22,1,.36,1)" }} onClick={e=>e.stopPropagation()}>
        {/* Ticket */}
        <div ref={ticketRef} style={{
          background:"#fff",width:"100%",maxWidth:460,borderRadius:22,overflow:"hidden",
          boxShadow:"0 40px 100px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.15)",
        }}>
          {/* Header */}
          <div style={{ background:"linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#0f2847 100%)", padding:"24px 28px 20px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute",top:-40,right:-40,width:160,height:160,borderRadius:"50%",background:"rgba(59,130,246,.1)" }} />
            <div style={{ position:"absolute",bottom:-30,left:-20,width:120,height:120,borderRadius:"50%",background:"rgba(99,102,241,.08)" }} />
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",position:"relative",zIndex:1 }}>
              <div>
                <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4 }}>
                  <div style={{ width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,#3b82f6,#6366f1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16 }}>🚌</div>
                  <div>
                    <span style={{ fontWeight:900,fontSize:17,color:"#fff" }}>BusRoute</span>
                    <span style={{ fontWeight:900,fontSize:17,color:"#60a5fa" }}>IQ</span>
                  </div>
                </div>
                <div style={{ fontSize:9,color:"#64748b",letterSpacing:"0.1em",fontWeight:700 }}>CHENNAI METROPOLITAN TRANSPORT</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ background:"rgba(34,197,94,.2)",border:"1px solid rgba(34,197,94,.4)",borderRadius:20,padding:"5px 12px",display:"inline-flex",alignItems:"center",gap:5 }}>
                  <div style={{ width:7,height:7,borderRadius:"50%",background:"#22c55e",animation:"pulse 1.5s infinite" }} />
                  <span style={{ fontSize:10,fontWeight:800,color:"#4ade80" }}>CONFIRMED</span>
                </div>
              </div>
            </div>
            <div style={{ marginTop:14,position:"relative",zIndex:1 }}>
              <div style={{ display:"flex",alignItems:"center",gap:0 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:9,fontWeight:700,color:"#64748b",letterSpacing:"0.1em",marginBottom:3 }}>FROM</div>
                  <div style={{ fontSize:15,fontWeight:900,color:"#fff",lineHeight:1.2 }}>{ticket.from}</div>
                </div>
                <div style={{ padding:"0 16px",textAlign:"center" }}>
                  <div style={{ fontSize:20,color:"#60a5fa" }}>✈</div>
                  <div style={{ width:60,height:1.5,background:"linear-gradient(90deg,transparent,#60a5fa,transparent)",margin:"4px 0" }} />
                </div>
                <div style={{ flex:1,textAlign:"right" }}>
                  <div style={{ fontSize:9,fontWeight:700,color:"#64748b",letterSpacing:"0.1em",marginBottom:3 }}>TO</div>
                  <div style={{ fontSize:15,fontWeight:900,color:"#fff",lineHeight:1.2 }}>{ticket.to}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tear line */}
          <div style={{ position:"relative",height:24,background:"#f8fafc",display:"flex",alignItems:"center" }}>
            <div style={{ position:"absolute",left:-12,width:24,height:24,borderRadius:"50%",background:"#f0f4f8" }} />
            <div style={{ flex:1,marginLeft:12,marginRight:12,borderTop:"2.5px dashed #e2e8f0" }} />
            <div style={{ position:"absolute",right:-12,width:24,height:24,borderRadius:"50%",background:"#f0f4f8" }} />
          </div>

          {/* Details grid */}
          <div style={{ padding:"16px 28px",background:"#fff" }}>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16 }}>
              {[
                { icon:"🚌",label:"Bus No.",val:ticket.busId },
                { icon:"🎟️",label:"Fare",val:`₹${ticket.fare}` },
                { icon:"📅",label:"Date",val:ticket.date },
                { icon:"🕐",label:"Departure",val:ticket.departureTime },
                { icon:"💺",label:"Seat Type",val:ticket.seatType },
                { icon:"👤",label:"Passengers",val:ticket.passengers },
              ].map(d=>(
                <div key={d.label} style={{ background:"#f8fafc",borderRadius:10,padding:"10px 8px",textAlign:"center",border:"1px solid #f1f5f9" }}>
                  <div style={{ fontSize:16,marginBottom:2 }}>{d.icon}</div>
                  <div style={{ fontSize:14,fontWeight:900,color:"#0f172a" }}>{d.val}</div>
                  <div style={{ fontSize:8,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.06em",marginTop:2 }}>{d.label}</div>
                </div>
              ))}
            </div>

            {/* Passenger */}
            <div style={{ background:"linear-gradient(135deg,#eff6ff,#f0fdf4)",borderRadius:12,padding:"12px 16px",marginBottom:14,border:"1.5px solid #e0f2fe",display:"flex",alignItems:"center",gap:12 }}>
              <div style={{ width:40,height:40,borderRadius:"50%",background:"linear-gradient(135deg,#3b82f6,#6366f1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>👤</div>
              <div>
                <div style={{ fontSize:10,fontWeight:700,color:"#94a3b8",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:2 }}>Passenger Name</div>
                <div style={{ fontSize:16,fontWeight:900,color:"#0f172a" }}>{ticket.passengerName}</div>
                {ticket.ac && <div style={{ display:"inline-block",background:"#e0f2fe",color:"#0369a1",fontSize:9,fontWeight:800,padding:"2px 8px",borderRadius:10,marginTop:3 }}>❄ AC Bus</div>}
              </div>
              <div style={{ marginLeft:"auto",textAlign:"right" }}>
                <div style={{ fontSize:10,fontWeight:700,color:"#94a3b8",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:2 }}>Bus Type</div>
                <div style={{ fontSize:12,fontWeight:800,color:"#0f172a" }}>{ticket.busType}</div>
              </div>
            </div>
          </div>

          {/* Tear line */}
          <div style={{ position:"relative",height:24,background:"#f8fafc",display:"flex",alignItems:"center" }}>
            <div style={{ position:"absolute",left:-12,width:24,height:24,borderRadius:"50%",background:"#f0f4f8" }} />
            <div style={{ flex:1,marginLeft:12,marginRight:12,borderTop:"2.5px dashed #e2e8f0" }} />
            <div style={{ position:"absolute",right:-12,width:24,height:24,borderRadius:"50%",background:"#f0f4f8" }} />
          </div>

          {/* Barcode area */}
          <div style={{ padding:"20px 28px 24px",background:"#fff",textAlign:"center" }}>
            <div style={{ display:"flex",justifyContent:"center",gap:1,height:48,alignItems:"flex-end",marginBottom:8 }}>
              {barBits.map((h,i)=>(
                <div key={i} style={{ width:i%3===0?3:2,height:h,background:"#0f172a",borderRadius:"1px 1px 0 0",opacity:0.85+(i%4)*0.05 }} />
              ))}
            </div>
            <div style={{ fontFamily:"monospace",fontSize:11,fontWeight:800,letterSpacing:"0.25em",color:"#64748b",marginBottom:4 }}>
              {ticket.ticketId}
            </div>
            <div style={{ fontSize:10,color:"#94a3b8",fontWeight:500 }}>Scan or show this at boarding</div>
          </div>

          {/* Footer */}
          <div style={{ background:"#0f172a",padding:"14px 28px",textAlign:"center" }}>
            <div style={{ fontSize:9,color:"#475569",fontWeight:500 }}>
              Simulated e-ticket for demo · Valid on travel date · Issued {new Date().toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display:"flex",gap:10,marginTop:16,justifyContent:"center" }}>
          <button onClick={handleDownload} style={{
            display:"flex",alignItems:"center",gap:7,padding:"12px 24px",borderRadius:13,
            background:downloaded?"#16a34a":"linear-gradient(135deg,#3b82f6,#6366f1)",
            color:"#fff",border:"none",cursor:"pointer",fontSize:14,fontWeight:800,
            boxShadow:"0 8px 24px rgba(99,102,241,.45)",transition:"all .25s",
          }}>
            {downloaded?<span style={{ animation:"checkPop .3s ease" }}>✅</span>:"📥"}
            {downloaded?"Downloaded!":"Download Ticket"}
          </button>
          <button onClick={onClose} style={{
            padding:"12px 20px",borderRadius:13,background:"rgba(255,255,255,.15)",
            color:"#fff",border:"1.5px solid rgba(255,255,255,.25)",cursor:"pointer",fontSize:14,fontWeight:700,
            transition:"all .2s",
          }}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ─── TICKET BOOKING PAGE ─── */
function BookingPage({ user, onBack, addToast, routes: preRoutes }) {
  const [step, setStep] = useState(1); // 1=search, 2=select, 3=details, 4=confirm
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [passengers, setPassengers] = useState(1);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [seatType, setSeatType] = useState("Window");
  const [form, setForm] = useState({ name: user?.name || "", phone: "", email: user?.email || "" });
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [showTicket, setShowTicket] = useState(false);

  const searchRoutes = () => {
    if (!from || !to || from === to) { addToast("Select valid From and To stops.","warn"); return; }
    setLoading(true);
    setTimeout(() => {
      const r = findRoutes(from, to);
      setRoutes(r); setLoading(false);
      if (r.length > 0) { setStep(2); } else { addToast("No routes found.","warn"); }
    }, 600);
  };

  const confirmBooking = () => {
    if (!form.name || !form.phone) { addToast("Please fill in all passenger details.","warn"); return; }
    setLoading(true);
    setTimeout(() => {
      const dep = new Date();
      dep.setMinutes(dep.getMinutes() + (selectedRoute.nextBus || 8));
      const t = {
        ticketId: generateTicketId(),
        from, to,
        busId: selectedRoute.buses[0].id,
        busType: selectedRoute.buses[0].type,
        ac: selectedRoute.buses.some(b => b.ac),
        fare: selectedRoute.totalFare * passengers,
        date: new Date(date).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }),
        departureTime: dep.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" }),
        seatType,
        passengers,
        passengerName: form.name,
        phone: form.phone,
        email: form.email,
        bookedAt: new Date().toLocaleString("en-IN"),
      };
      setTicket(t);
      // save to local
      const prev = JSON.parse(localStorage.getItem("biq_tickets") || "[]");
      localStorage.setItem("biq_tickets", JSON.stringify([t, ...prev]));
      setLoading(false);
      setShowTicket(true);
      addToast("Ticket booked successfully! 🎉","success");
    }, 900);
  };

  const T = { bg:"#f8fafc",cardBg:"#fff",bd:"#e2e8f0",txt:"#0f172a",sub:"#64748b" };

  // Progress bar
  const steps = ["Search","Select Route","Passenger Info","Confirm"];

  return (
    <div style={{ minHeight:"100vh",background:"#f0f4f8",paddingBottom:80 }}>
      {showTicket && ticket && (
        <ETicket ticket={ticket} onClose={()=>setShowTicket(false)} onDownload={()=>{}} />
      )}

      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#0f172a,#1e3a5f)",padding:"28px 40px 24px" }}>
        <div style={{ maxWidth:800,margin:"0 auto" }}>
          <button onClick={onBack} style={{ background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.2)",color:"#fff",borderRadius:9,padding:"7px 14px",cursor:"pointer",fontSize:13,fontWeight:700,marginBottom:16,display:"flex",alignItems:"center",gap:6 }}>
            ← Back to Routes
          </button>
          <h1 style={{ fontSize:30,fontWeight:900,color:"#fff",letterSpacing:"-1px",marginBottom:4 }}>🎟️ Book a Ticket</h1>
          <p style={{ fontSize:13,color:"#94a3b8",fontWeight:500 }}>Chennai Metropolitan Transport · Instant e-ticket</p>
        </div>
      </div>

      {/* Stepper */}
      <div style={{ background:"#fff",borderBottom:"1px solid #e2e8f0",padding:"16px 40px" }}>
        <div style={{ maxWidth:800,margin:"0 auto",display:"flex",gap:0,alignItems:"center" }}>
          {steps.map((s,i)=>(
            <React.Fragment key={s}>
              <div style={{ display:"flex",alignItems:"center",gap:8,flex:i<steps.length-1?0:0 }}>
                <div style={{
                  width:30,height:30,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
                  background:step>i+1?"#16a34a":step===i+1?"#3b82f6":"#f1f5f9",
                  color:step>=i+1?"#fff":"#94a3b8",
                  fontSize:13,fontWeight:900,flexShrink:0,
                  boxShadow:step===i+1?"0 0 0 4px rgba(59,130,246,.2)":"none",
                  transition:"all .3s"
                }}>
                  {step>i+1?"✓":i+1}
                </div>
                <span style={{ fontSize:12,fontWeight:700,color:step===i+1?"#3b82f6":step>i+1?"#16a34a":"#94a3b8",whiteSpace:"nowrap" }}>{s}</span>
              </div>
              {i<steps.length-1&&(
                <div style={{ flex:1,height:2,background:step>i+1?"#16a34a":"#f1f5f9",margin:"0 10px",borderRadius:1,transition:"background .3s" }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:800,margin:"0 auto",padding:"32px 24px" }}>

        {/* STEP 1 */}
        {step===1&&(
          <div style={{ background:"#fff",borderRadius:20,padding:28,border:"1.5px solid #e2e8f0",boxShadow:"0 4px 20px rgba(0,0,0,.06)",animation:"fadeUp .4s ease" }}>
            <h2 style={{ fontSize:20,fontWeight:900,color:"#0f172a",marginBottom:6 }}>Where are you going?</h2>
            <p style={{ fontSize:13,color:"#64748b",marginBottom:24 }}>Select your stops, date and number of passengers.</p>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14 }}>
              <div>
                <div style={{ fontSize:11,fontWeight:700,color:"#64748b",marginBottom:6,letterSpacing:"0.06em",textTransform:"uppercase" }}>🔵 From Stop</div>
                <StopInput label="Boarding Stop" value={from} onChange={setFrom} placeholder="Search stop…" accent="#6366f1" emoji="🔵" />
              </div>
              <div>
                <div style={{ fontSize:11,fontWeight:700,color:"#64748b",marginBottom:6,letterSpacing:"0.06em",textTransform:"uppercase" }}>📍 To Stop</div>
                <StopInput label="Destination Stop" value={to} onChange={setTo} placeholder="Search stop…" accent="#0ea5e9" emoji="📍" />
              </div>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:24 }}>
              <div>
                <div style={{ fontSize:11,fontWeight:700,color:"#64748b",marginBottom:6,letterSpacing:"0.06em",textTransform:"uppercase" }}>📅 Travel Date</div>
                <input type="date" value={date} onChange={e=>setDate(e.target.value)} min={new Date().toISOString().split("T")[0]}
                  style={{ width:"100%",padding:"13px 15px",borderRadius:12,border:"2px solid #e2e8f0",fontSize:14,fontWeight:600,color:"#0f172a",background:"#f8fafc",cursor:"pointer" }}
                  onFocus={e=>e.target.style.borderColor="#6366f1"} onBlur={e=>e.target.style.borderColor="#e2e8f0"} />
              </div>
              <div>
                <div style={{ fontSize:11,fontWeight:700,color:"#64748b",marginBottom:6,letterSpacing:"0.06em",textTransform:"uppercase" }}>👥 Passengers</div>
                <select value={passengers} onChange={e=>setPassengers(Number(e.target.value))}
                  style={{ width:"100%",padding:"13px 15px",borderRadius:12,border:"2px solid #e2e8f0",fontSize:14,fontWeight:600,color:"#0f172a",background:"#f8fafc",cursor:"pointer",appearance:"none" }}>
                  {[1,2,3,4,5].map(n=><option key={n} value={n}>{n} Passenger{n>1?"s":""}</option>)}
                </select>
              </div>
            </div>
            <button onClick={searchRoutes} disabled={!from||!to||loading} style={{
              width:"100%",padding:"15px",borderRadius:13,border:"none",cursor:from&&to?"pointer":"not-allowed",
              background:from&&to?"linear-gradient(135deg,#3b82f6,#6366f1)":"#e2e8f0",
              color:from&&to?"#fff":"#94a3b8",fontSize:16,fontWeight:900,
              boxShadow:from&&to?"0 8px 28px rgba(99,102,241,.4)":"none",
              display:"flex",alignItems:"center",justifyContent:"center",gap:10,transition:"all .2s"
            }}>
              {loading?<div style={{ width:20,height:20,border:"2.5px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .7s linear infinite" }}/>:"🔍"}
              {loading?"Searching routes…":"Search Available Routes"}
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step===2&&(
          <div style={{ animation:"fadeUp .4s ease" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18 }}>
              <div>
                <h2 style={{ fontSize:20,fontWeight:900,color:"#0f172a" }}>Choose your route</h2>
                <p style={{ fontSize:13,color:"#64748b",marginTop:2 }}>{from} → {to} · {routes.length} options</p>
              </div>
              <button onClick={()=>setStep(1)} style={{ background:"#f1f5f9",border:"1.5px solid #e2e8f0",color:"#64748b",borderRadius:9,padding:"7px 14px",cursor:"pointer",fontSize:12,fontWeight:700 }}>← Edit Search</button>
            </div>
            <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
              {routes.map((r,i)=>{
                const mainColor = r.buses[0].color;
                const isSelected = selectedRoute?.id===r.id;
                return (
                  <div key={r.id} onClick={()=>setSelectedRoute(r)} style={{
                    background:"#fff",borderRadius:16,padding:"16px 20px",
                    border:isSelected?`2.5px solid ${mainColor}`:"1.5px solid #e2e8f0",
                    cursor:"pointer",transition:"all .2s",
                    boxShadow:isSelected?`0 8px 24px ${mainColor}30`:"0 2px 8px rgba(0,0,0,.06)",
                    transform:isSelected?"translateY(-1px)":"none",
                  }}>
                    <div style={{ display:"flex",alignItems:"center",gap:12,flexWrap:"wrap" }}>
                      <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                        {r.buses.map((b,bi)=>(
                          <React.Fragment key={bi}>
                            <div style={{ background:b.color,borderRadius:8,padding:"5px 12px",display:"flex",alignItems:"center",gap:5 }}>
                              <span style={{ fontSize:11,color:"#fff" }}>🚌</span>
                              <span style={{ fontSize:14,fontWeight:900,color:"#fff",fontFamily:"monospace" }}>{b.id}</span>
                            </div>
                            {bi<r.buses.length-1&&<span style={{ fontSize:12,color:"#f97316",fontWeight:800 }}>↔</span>}
                          </React.Fragment>
                        ))}
                        {r.badge&&<span style={{ background:"#dcfce7",color:"#15803d",fontSize:10,fontWeight:800,padding:"3px 9px",borderRadius:20,border:"1px solid #86efac" }}>⭐ {r.badge}</span>}
                      </div>
                      <div style={{ marginLeft:"auto",display:"flex",gap:16,alignItems:"center" }}>
                        <div style={{ textAlign:"center" }}>
                          <div style={{ fontSize:16,fontWeight:900,color:"#0f172a" }}>{r.totalMins}m</div>
                          <div style={{ fontSize:9,color:"#94a3b8",fontWeight:700 }}>DURATION</div>
                        </div>
                        <div style={{ textAlign:"center" }}>
                          <div style={{ fontSize:16,fontWeight:900,color:"#16a34a" }}>₹{r.totalFare * passengers}</div>
                          <div style={{ fontSize:9,color:"#94a3b8",fontWeight:700 }}>TOTAL FARE</div>
                        </div>
                        <div style={{ textAlign:"center" }}>
                          <div style={{ fontSize:16,fontWeight:900,color:"#3b82f6" }}>{r.nextBus}m</div>
                          <div style={{ fontSize:9,color:"#94a3b8",fontWeight:700 }}>NEXT BUS</div>
                        </div>
                        <div style={{
                          width:28,height:28,borderRadius:"50%",border:`2.5px solid ${isSelected?mainColor:"#e2e8f0"}`,
                          background:isSelected?mainColor:"transparent",display:"flex",alignItems:"center",justifyContent:"center",
                          flexShrink:0,transition:"all .2s"
                        }}>
                          {isSelected&&<div style={{ width:10,height:10,borderRadius:"50%",background:"#fff" }}/>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <button onClick={()=>{ if(!selectedRoute){addToast("Please select a route.","warn");return;} setStep(3); }}
              style={{ marginTop:20,width:"100%",padding:"15px",borderRadius:13,border:"none",cursor:selectedRoute?"pointer":"not-allowed",
              background:selectedRoute?"linear-gradient(135deg,#3b82f6,#6366f1)":"#e2e8f0",
              color:selectedRoute?"#fff":"#94a3b8",fontSize:15,fontWeight:900,
              boxShadow:selectedRoute?"0 8px 28px rgba(99,102,241,.4)":"none",transition:"all .2s" }}>
              Continue with {selectedRoute?`Bus ${selectedRoute.buses[0].id}`:"selected route"} →
            </button>
          </div>
        )}

        {/* STEP 3 */}
        {step===3&&selectedRoute&&(
          <div style={{ animation:"fadeUp .4s ease" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
              <h2 style={{ fontSize:20,fontWeight:900,color:"#0f172a" }}>Passenger Details</h2>
              <button onClick={()=>setStep(2)} style={{ background:"#f1f5f9",border:"1.5px solid #e2e8f0",color:"#64748b",borderRadius:9,padding:"7px 14px",cursor:"pointer",fontSize:12,fontWeight:700 }}>← Back</button>
            </div>

            {/* Selected route summary */}
            <div style={{ background:"linear-gradient(135deg,#eff6ff,#f0fdf4)",borderRadius:14,padding:"14px 18px",marginBottom:22,border:"1.5px solid #bfdbfe" }}>
              <div style={{ display:"flex",alignItems:"center",gap:10,flexWrap:"wrap" }}>
                <div style={{ background:selectedRoute.buses[0].color,borderRadius:8,padding:"5px 12px",display:"flex",alignItems:"center",gap:5 }}>
                  <span style={{ color:"#fff",fontSize:12,fontWeight:900,fontFamily:"monospace" }}>{selectedRoute.buses[0].id}</span>
                </div>
                <span style={{ fontWeight:700,color:"#0f172a",fontSize:14 }}>{from} → {to}</span>
                <span style={{ marginLeft:"auto",fontWeight:900,color:"#16a34a",fontSize:16 }}>₹{selectedRoute.totalFare*passengers}</span>
              </div>
            </div>

            <div style={{ background:"#fff",borderRadius:18,padding:24,border:"1.5px solid #e2e8f0",boxShadow:"0 4px 16px rgba(0,0,0,.05)" }}>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16 }}>
                <div style={{ gridColumn:"1/-1" }}>
                  <div style={{ fontSize:11,fontWeight:700,color:"#64748b",marginBottom:6,letterSpacing:"0.06em",textTransform:"uppercase" }}>Full Name *</div>
                  <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Arjun Kumar"
                    style={{ width:"100%",padding:"13px 15px",borderRadius:11,border:"2px solid #e2e8f0",fontSize:14,fontWeight:600,color:"#0f172a",background:"#f8fafc",transition:"border .2s" }}
                    onFocus={e=>e.target.style.borderColor="#6366f1"} onBlur={e=>e.target.style.borderColor="#e2e8f0"} />
                </div>
                <div>
                  <div style={{ fontSize:11,fontWeight:700,color:"#64748b",marginBottom:6,letterSpacing:"0.06em",textTransform:"uppercase" }}>Phone Number *</div>
                  <input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="+91 98765 43210" type="tel"
                    style={{ width:"100%",padding:"13px 15px",borderRadius:11,border:"2px solid #e2e8f0",fontSize:14,fontWeight:600,color:"#0f172a",background:"#f8fafc",transition:"border .2s" }}
                    onFocus={e=>e.target.style.borderColor="#6366f1"} onBlur={e=>e.target.style.borderColor="#e2e8f0"} />
                </div>
                <div>
                  <div style={{ fontSize:11,fontWeight:700,color:"#64748b",marginBottom:6,letterSpacing:"0.06em",textTransform:"uppercase" }}>Email</div>
                  <input value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="you@example.com" type="email"
                    style={{ width:"100%",padding:"13px 15px",borderRadius:11,border:"2px solid #e2e8f0",fontSize:14,fontWeight:600,color:"#0f172a",background:"#f8fafc",transition:"border .2s" }}
                    onFocus={e=>e.target.style.borderColor="#6366f1"} onBlur={e=>e.target.style.borderColor="#e2e8f0"} />
                </div>
              </div>
              <div>
                <div style={{ fontSize:11,fontWeight:700,color:"#64748b",marginBottom:10,letterSpacing:"0.06em",textTransform:"uppercase" }}>Seat Preference</div>
                <div style={{ display:"flex",gap:10 }}>
                  {["Window","Aisle","Any"].map(s=>(
                    <button key={s} onClick={()=>setSeatType(s)} style={{
                      flex:1,padding:"10px 8px",borderRadius:10,border:`2px solid ${seatType===s?"#6366f1":"#e2e8f0"}`,
                      background:seatType===s?"#ede9fe":"#f8fafc",color:seatType===s?"#6366f1":"#64748b",
                      fontSize:13,fontWeight:700,cursor:"pointer",transition:"all .18s",
                    }}>
                      {s==="Window"?"🪟":s==="Aisle"?"🚶":"🎲"} {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={()=>setStep(4)} style={{ marginTop:20,width:"100%",padding:"15px",borderRadius:13,border:"none",cursor:"pointer",
              background:"linear-gradient(135deg,#3b82f6,#6366f1)",color:"#fff",fontSize:15,fontWeight:900,
              boxShadow:"0 8px 28px rgba(99,102,241,.4)",transition:"all .2s" }}>
              Review Booking →
            </button>
          </div>
        )}

        {/* STEP 4 */}
        {step===4&&selectedRoute&&(
          <div style={{ animation:"fadeUp .4s ease" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
              <h2 style={{ fontSize:20,fontWeight:900,color:"#0f172a" }}>Confirm Booking</h2>
              <button onClick={()=>setStep(3)} style={{ background:"#f1f5f9",border:"1.5px solid #e2e8f0",color:"#64748b",borderRadius:9,padding:"7px 14px",cursor:"pointer",fontSize:12,fontWeight:700 }}>← Edit</button>
            </div>

            <div style={{ background:"#fff",borderRadius:20,overflow:"hidden",border:"1.5px solid #e2e8f0",boxShadow:"0 4px 20px rgba(0,0,0,.07)",marginBottom:16 }}>
              <div style={{ background:"linear-gradient(135deg,#0f172a,#1e3a5f)",padding:"18px 24px" }}>
                <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <div style={{ width:38,height:38,borderRadius:9,background:"linear-gradient(135deg,#3b82f6,#6366f1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>🎟️</div>
                  <div>
                    <div style={{ fontWeight:900,color:"#fff",fontSize:16 }}>Booking Summary</div>
                    <div style={{ fontSize:11,color:"#64748b" }}>Review before confirming</div>
                  </div>
                </div>
              </div>
              {[
                {l:"Route",v:`${from} → ${to}`,icon:"🗺️"},
                {l:"Bus Number",v:selectedRoute.buses.map(b=>b.id).join(" + "),icon:"🚌"},
                {l:"Bus Type",v:selectedRoute.buses[0].type,icon:"🏷️"},
                {l:"Travel Date",v:new Date(date).toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"}),icon:"📅"},
                {l:"Passengers",v:`${passengers} Passenger${passengers>1?"s":""}`,icon:"👥"},
                {l:"Seat Preference",v:seatType,icon:"💺"},
                {l:"Passenger Name",v:form.name,icon:"👤"},
                {l:"Phone",v:form.phone,icon:"📱"},
                {l:"Duration",v:`~${selectedRoute.totalMins} minutes`,icon:"⏱️"},
              ].map((r,i)=>(
                <div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 24px",borderBottom:"1px solid #f1f5f9" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8,fontSize:13,color:"#64748b",fontWeight:600 }}>
                    <span>{r.icon}</span>{r.l}
                  </div>
                  <div style={{ fontSize:13,fontWeight:800,color:"#0f172a" }}>{r.v}</div>
                </div>
              ))}
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 24px",background:"linear-gradient(135deg,#f0fdf4,#eff6ff)" }}>
                <div style={{ fontSize:15,fontWeight:800,color:"#0f172a" }}>Total Amount</div>
                <div style={{ fontSize:26,fontWeight:900,color:"#16a34a" }}>₹{selectedRoute.totalFare*passengers}</div>
              </div>
            </div>

            <div style={{ background:"#fef9c3",borderRadius:12,padding:"12px 16px",border:"1px solid #fde047",marginBottom:16,fontSize:12,fontWeight:600,color:"#a16207" }}>
              💡 This is a simulated booking — no real payment required. Your e-ticket will be generated instantly!
            </div>

            <button onClick={confirmBooking} disabled={loading} style={{
              width:"100%",padding:"17px",borderRadius:14,border:"none",cursor:"pointer",
              background:"linear-gradient(135deg,#16a34a,#15803d)",color:"#fff",fontSize:16,fontWeight:900,
              boxShadow:"0 8px 28px rgba(22,163,74,.45)",transition:"all .2s",
              display:"flex",alignItems:"center",justifyContent:"center",gap:10
            }}>
              {loading?<div style={{ width:20,height:20,border:"2.5px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .7s linear infinite" }}/>:"✅"}
              {loading?"Generating Your E-Ticket…":"Confirm & Get E-Ticket"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── SMALL COMPONENTS ─── */
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(id); }, []);
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-2px", fontVariantNumeric: "tabular-nums", color: "#0f172a" }}>
        {time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
      </div>
      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, fontWeight: 600 }}>
        {time.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}
      </div>
    </div>
  );
}

function CountdownRing({ totalSecs, color }) {
  const [secs, setSecs] = useState(totalSecs);
  useEffect(() => {
    setSecs(totalSecs);
    const id = setInterval(() => setSecs(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [totalSecs]);
  const pct = totalSecs > 0 ? secs / totalSecs : 0;
  const r = 18, circ = 2 * Math.PI * r;
  const urgent = secs < 120;
  const mins = Math.floor(secs / 60);
  const secsLeft = secs % 60;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}>
        <svg width="44" height="44" viewBox="0 0 44 44" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="22" cy="22" r={r} fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
          <circle cx="22" cy="22" r={r} fill="none" stroke={urgent ? "#ef4444" : color} strokeWidth="3.5"
            strokeDasharray={`${pct * circ} ${circ}`} strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.9s ease" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900, color: urgent ? "#ef4444" : color }}>
          {mins}m
        </div>
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 800, color: urgent ? "#ef4444" : "#0f172a" }}>
          {secs === 0 ? "Departed" : `${mins}:${String(secsLeft).padStart(2, "0")}`}
        </div>
        <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>until departure</div>
      </div>
    </div>
  );
}

function CrowdChart() {
  const [hov, setHov] = useState(null);
  const cur = new Date().getHours();
  const getColor = (v) => v < 30 ? "#22c55e" : v < 60 ? "#f59e0b" : v < 80 ? "#f97316" : "#ef4444";
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Crowd Level by Hour</div>
      <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 56, position: "relative" }}>
        {CROWD_HOURS.map((v, h) => {
          const c = getColor(v);
          const isCur = h === cur;
          return (
            <div key={h} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", cursor: "pointer" }}
              onMouseEnter={() => setHov(h)} onMouseLeave={() => setHov(null)}>
              {hov === h && (
                <div style={{ position: "absolute", bottom: "105%", background: "#0f172a", color: "#fff", fontSize: 9, fontWeight: 700, padding: "3px 6px", borderRadius: 5, whiteSpace: "nowrap", zIndex: 20 }}>
                  {h}:00 — {v}%
                </div>
              )}
              <div style={{ width: "100%", borderRadius: "3px 3px 0 0", height: `${Math.max(3, v * 0.54)}px`, background: c, opacity: isCur ? 1 : hov === h ? 0.9 : 0.6, boxShadow: isCur ? `0 0 6px ${c}` : "none", outline: isCur ? `2px solid ${c}` : "none", transition: "opacity .2s" }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 9, color: "#94a3b8", fontWeight: 600 }}>
        {["12AM","6AM","12PM","6PM","11PM"].map(l => <span key={l}>{l}</span>)}
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
        {[["#22c55e","Low"],["#f59e0b","Moderate"],["#f97316","High"],["#ef4444","Packed"]].map(([c,l]) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 7, height: 7, borderRadius: 2, background: c }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8" }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RouteSVGMap({ route }) {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => { setDrawn(false); const t = setTimeout(() => setDrawn(true), 80); return () => clearTimeout(t); }, [route.id]);
  const [hov, setHov] = useState(null);
  const allStops = [...new Set(route.buses.flatMap(b => b.stops))];
  const W = 560, H = 70, pad = 36;
  const xOf = i => pad + (i / Math.max(allStops.length - 1, 1)) * (W - pad * 2);
  return (
    <div style={{ overflowX: "auto" }}>
      <svg viewBox={`0 0 ${W} ${H + 36}`} style={{ width: "100%", minWidth: 280 }}>
        <line x1={pad} y1={H / 2} x2={W - pad} y2={H / 2} stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
        {route.buses.map((bus, bi) => {
          const si = allStops.indexOf(bus.stops[0]);
          const ei = allStops.indexOf(bus.stops[bus.stops.length - 1]);
          const x1 = xOf(Math.min(si, ei)), x2 = xOf(Math.max(si, ei));
          return (
            <line key={bi} x1={x1} y1={H / 2} x2={drawn ? x2 : x1} y2={H / 2}
              stroke={bus.color} strokeWidth="4" strokeLinecap="round"
              style={{ transition: drawn ? `x2 0.8s ease ${bi * 0.3}s` : "none" }} />
          );
        })}
        {allStops.map((stop, i) => {
          const x = xOf(i);
          const isBoard = route.buses.some(b => b.boardAt === stop);
          const isAlight = route.buses.some(b => b.alightAt === stop);
          const isTx = route.transferAt === stop;
          const isHov = hov === stop;
          const rad = isBoard || isAlight ? 7 : isTx ? 5 : 3.5;
          const fill = isBoard ? "#3b82f6" : isAlight ? "#22c55e" : isTx ? "#f97316" : "#cbd5e1";
          const showLabel = isBoard || isAlight || isTx || isHov;
          const labelY = i % 2 === 0 ? H / 2 - 13 : H / 2 + 20;
          return (
            <g key={stop} style={{ cursor: "pointer" }}
              onMouseEnter={() => setHov(stop)} onMouseLeave={() => setHov(null)}>
              <circle cx={x} cy={H / 2} r={isHov ? rad + 2.5 : rad} fill={fill} stroke="#fff" strokeWidth="2" style={{ transition: "r .15s" }} />
              {showLabel && <text x={x} y={labelY} textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#64748b" fontFamily="inherit">{stop.length > 13 ? stop.slice(0, 12) + "…" : stop}</text>}
              {isBoard && <text x={x} y={i % 2 === 0 ? H / 2 - 23 : H / 2 + 30} textAnchor="middle" fontSize="7" fontWeight="900" fill="#3b82f6">BOARD</text>}
              {isAlight && <text x={x} y={i % 2 === 0 ? H / 2 - 23 : H / 2 + 30} textAnchor="middle" fontSize="7" fontWeight="900" fill="#22c55e">ALIGHT</text>}
            </g>
          );
        })}
        {route.buses.map((bus, bi) => (
          <g key={bi}>
            <circle cx={20 + bi * 80} cy={H + 22} r="5" fill={bus.color} />
            <text x={30 + bi * 80} y={H + 26} fontSize="9" fontWeight="700" fill="#64748b" fontFamily="inherit">Bus {bus.id}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function CompareModal({ routes, onClose }) {
  const [idxA, setIdxA] = useState(0);
  const [idxB, setIdxB] = useState(Math.min(1, routes.length - 1));
  const A = routes[idxA], B = routes[idxB];
  const rows = [
    { label:"Duration", va:`${A.totalMins} min`, vb:`${B.totalMins} min`, win:A.totalMins<B.totalMins?"a":A.totalMins>B.totalMins?"b":"tie" },
    { label:"Total Fare", va:`₹${A.totalFare}`, vb:`₹${B.totalFare}`, win:A.totalFare<B.totalFare?"a":A.totalFare>B.totalFare?"b":"tie" },
    { label:"Distance", va:`${A.distance} km`, vb:`${B.distance} km`, win:A.distance<B.distance?"a":A.distance>B.distance?"b":"tie" },
    { label:"Next Bus", va:`${A.nextBus} min`, vb:`${B.nextBus} min`, win:A.nextBus<B.nextBus?"a":A.nextBus>B.nextBus?"b":"tie" },
    { label:"Transfers", va:`${A.changes}`, vb:`${B.changes}`, win:A.changes<B.changes?"a":A.changes>B.changes?"b":"tie" },
    { label:"CO₂ Saved", va:`${A.co2} kg`, vb:`${B.co2} kg`, win:A.co2>B.co2?"a":A.co2<B.co2?"b":"tie" },
  ];
  const aWins = rows.filter(r => r.win === "a").length;
  const bWins = rows.filter(r => r.win === "b").length;
  return (
    <div style={{ position:"fixed",inset:0,zIndex:900,background:"rgba(0,0,0,.55)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20 }} onClick={onClose}>
      <div style={{ background:"#fff",borderRadius:22,padding:28,width:"100%",maxWidth:580,maxHeight:"88vh",overflowY:"auto",boxShadow:"0 32px 80px rgba(0,0,0,.35)" }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
          <div style={{ fontSize:18,fontWeight:900,color:"#0f172a" }}>⚔️ Compare Routes</div>
          <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",fontSize:20,color:"#94a3b8" }}>✕</button>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 40px 1fr",gap:10,alignItems:"center",marginBottom:18 }}>
          <select value={idxA} onChange={e=>setIdxA(Number(e.target.value))} style={{ padding:"10px 12px",borderRadius:10,border:"1.5px solid #e2e8f0",background:"#f8fafc",fontWeight:700,fontSize:13,cursor:"pointer",color:"#0f172a" }}>
            {routes.map((r,i)=><option key={r.id} value={i}>Route {i+1}: {r.buses.map(b=>b.id).join("+")}</option>)}
          </select>
          <div style={{ textAlign:"center",fontSize:18 }}>⚡</div>
          <select value={idxB} onChange={e=>setIdxB(Number(e.target.value))} style={{ padding:"10px 12px",borderRadius:10,border:"1.5px solid #e2e8f0",background:"#f8fafc",fontWeight:700,fontSize:13,cursor:"pointer",color:"#0f172a" }}>
            {routes.map((r,i)=><option key={r.id} value={i}>Route {i+1}: {r.buses.map(b=>b.id).join("+")}</option>)}
          </select>
        </div>
        {idxA!==idxB&&(
          <div style={{ background:aWins>bWins?"#dcfce7":bWins>aWins?"#dbeafe":"#fef9c3",borderRadius:10,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:8,border:`1px solid ${aWins>bWins?"#bbf7d0":bWins>aWins?"#bfdbfe":"#fde047"}` }}>
            <span style={{ fontSize:18 }}>🏆</span>
            <span style={{ fontSize:13,fontWeight:800,color:aWins>bWins?"#15803d":bWins>aWins?"#1d4ed8":"#a16207" }}>
              {aWins>bWins?`Route ${idxA+1} wins ${aWins}–${bWins}`:bWins>aWins?`Route ${idxB+1} wins ${bWins}–${aWins}`:"It's a tie!"}
            </span>
          </div>
        )}
        {idxA!==idxB&&rows.map(row=>(
          <div key={row.label} style={{ display:"grid",gridTemplateColumns:"1fr 90px 1fr",gap:8,alignItems:"center",padding:"8px 0",borderBottom:"1px solid #f1f5f9" }}>
            <div style={{ padding:"8px 12px",borderRadius:8,background:row.win==="a"?"#dcfce7":"#f8fafc",textAlign:"center",fontWeight:800,fontSize:14,color:row.win==="a"?"#15803d":"#0f172a",border:row.win==="a"?"1.5px solid #bbf7d0":"1.5px solid transparent" }}>{row.va}</div>
            <div style={{ textAlign:"center",fontSize:10,fontWeight:700,color:"#94a3b8",letterSpacing:"0.05em" }}>{row.label}</div>
            <div style={{ padding:"8px 12px",borderRadius:8,background:row.win==="b"?"#dbeafe":"#f8fafc",textAlign:"center",fontWeight:800,fontSize:14,color:row.win==="b"?"#1d4ed8":"#0f172a",border:row.win==="b"?"1.5px solid #bfdbfe":"1.5px solid transparent" }}>{row.vb}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3800); return () => clearTimeout(t); }, []);
  const bg = type === "success" ? "#16a34a" : type === "warn" ? "#d97706" : "#3b82f6";
  return (
    <div style={{ background:bg,color:"#fff",borderRadius:12,padding:"13px 18px",fontSize:13,fontWeight:700,boxShadow:"0 8px 28px rgba(0,0,0,.2)",display:"flex",alignItems:"center",gap:10,animation:"toastIn .3s ease",maxWidth:320 }}>
      <span style={{ fontSize:18 }}>{type==="success"?"✅":type==="warn"?"⚠️":"🔔"}</span>{msg}
    </div>
  );
}

function StopInput({ label, value, onChange, placeholder, accent, emoji }) {
  const [q, setQ] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const filtered = q.length > 0 ? STOPS.filter(s => s.toLowerCase().includes(q.toLowerCase())).slice(0, 8) : STOPS.slice(0, 8);
  useEffect(() => { setQ(value); }, [value]);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} style={{ position:"relative",flex:1,minWidth:180 }}>
      <div onClick={()=>setOpen(true)} style={{ display:"flex",alignItems:"center",gap:12,background:"#fff",borderRadius:14,padding:"13px 16px",border:`2px solid ${open?accent:"#e2e8f0"}`,boxShadow:open?`0 0 0 4px ${accent}22, 0 4px 16px rgba(0,0,0,.09)`:"0 2px 8px rgba(0,0,0,.06)",transition:"border-color .2s, box-shadow .2s",cursor:"text" }}>
        <div style={{ width:38,height:38,borderRadius:9,background:`${accent}15`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:19 }}>{emoji}</div>
        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ fontSize:10,fontWeight:800,color:"#94a3b8",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:2 }}>{label}</div>
          <input value={q} onChange={e=>{setQ(e.target.value);onChange("");setOpen(true);}} onFocus={()=>setOpen(true)} placeholder={placeholder}
            style={{ border:"none",background:"transparent",width:"100%",fontSize:14,fontWeight:600,color:"#0f172a" }} />
        </div>
        {q&&<button onClick={e=>{e.stopPropagation();setQ("");onChange("");}} style={{ background:"none",border:"none",cursor:"pointer",color:"#94a3b8",fontSize:16,padding:2,display:"flex" }}>✕</button>}
      </div>
      {open&&filtered.length>0&&(
        <div style={{ position:"absolute",top:"calc(100% + 6px)",left:0,right:0,zIndex:500,background:"#fff",borderRadius:12,overflow:"hidden",boxShadow:"0 20px 56px rgba(0,0,0,.16)",border:"1.5px solid #f1f5f9" }}>
          <div style={{ padding:"7px 14px 5px",borderBottom:"1px solid #f8fafc" }}>
            <span style={{ fontSize:10,fontWeight:700,color:"#94a3b8",letterSpacing:"0.08em" }}>SELECT A STOP</span>
          </div>
          {filtered.map((s,i)=>(
            <div key={s} onClick={()=>{setQ(s);onChange(s);setOpen(false);}}
              style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 14px",cursor:"pointer",borderBottom:i<filtered.length-1?"1px solid #f8fafc":"none",fontSize:13,fontWeight:500,color:"#1e293b",transition:"background .1s" }}
              onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div style={{ width:26,height:26,borderRadius:7,background:`${accent}14`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:12 }}>📍</div>
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── ROUTE CARD ─── */
function RouteCard({ route, index, saved, onSave, compareSelected, onCompareToggle, trafficExtra, onBook }) {
  const [expanded, setExpanded] = useState(index === 0);
  const [activeTab, setActiveTab] = useState("stops");
  const BADGE = {
    "Recommended": { bg:"#dcfce7",txt:"#15803d",bd:"#86efac",pre:"★ " },
    "Fastest":     { bg:"#dbeafe",txt:"#1d4ed8",bd:"#93c5fd",pre:"⚡ " },
    "Cheapest":    { bg:"#fef9c3",txt:"#a16207",bd:"#fde047",pre:"₹ " },
  };
  const bm = route.badge ? BADGE[route.badge] : null;
  const mainColor = route.buses[0].color;
  const adjMins = route.totalMins + trafficExtra;
  const handleShare = async () => {
    const text = `🚌 Bus Route: ${route.buses.map(b=>b.id).join(" → ")}\n⏱ ${adjMins} min | 💰 ₹${route.totalFare}\n📍 ${route.buses[0].boardAt} → ${route.buses[route.buses.length-1].alightAt}`;
    if (navigator.share) { try { await navigator.share({title:"BusRouteIQ",text}); } catch(_){} }
    else if (navigator.clipboard) { navigator.clipboard.writeText(text); }
  };
  return (
    <div style={{ background:"#fff",borderRadius:20,border:route.badge==="Recommended"?"2px solid #86efac":"1.5px solid #e2e8f0",overflow:"hidden",boxShadow:route.badge==="Recommended"?"0 8px 32px rgba(16,185,129,.13), 0 2px 8px rgba(0,0,0,.05)":"0 4px 16px rgba(0,0,0,.07)",animation:`cardIn .4s cubic-bezier(.22,1,.36,1) ${index*.07}s both`,transition:"transform .2s, box-shadow .2s",outline:compareSelected?"2.5px solid #6366f1":"none",outlineOffset:2 }}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 16px 48px rgba(0,0,0,.12)";}}
      onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow=route.badge==="Recommended"?"0 8px 32px rgba(16,185,129,.13), 0 2px 8px rgba(0,0,0,.05)":"0 4px 16px rgba(0,0,0,.07)";}}>
      <div style={{ height:5,background:route.buses.length>1?`linear-gradient(90deg,${route.buses[0].color},${route.buses[route.buses.length-1].color})`:mainColor }} />
      <div style={{ padding:"18px 20px 14px" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:12,flexWrap:"wrap" }}>
          <div style={{ display:"flex",alignItems:"center",gap:7,flexWrap:"wrap" }}>
            {route.buses.map((bus,bi)=>(
              <div key={bi} style={{ display:"flex",alignItems:"center",gap:6 }}>
                <div style={{ display:"flex",alignItems:"center",gap:5,background:bus.color,borderRadius:9,padding:"5px 12px",boxShadow:`0 3px 10px ${bus.color}55` }}>
                  <span style={{ fontSize:11,color:"#fff" }}>🚌</span>
                  <span style={{ fontSize:14,fontWeight:900,color:"#fff",letterSpacing:"0.05em",fontFamily:"monospace" }}>{bus.id}</span>
                  <span style={{ fontSize:8,color:"rgba(255,255,255,.75)",fontWeight:600 }}>{bus.type.split(" ")[0].toUpperCase()}</span>
                </div>
                {bi<route.buses.length-1&&<div style={{ background:"#fff7ed",border:"1px solid #fed7aa",borderRadius:6,padding:"3px 7px",fontSize:9,fontWeight:800,color:"#ea580c" }}>↔ CHANGE</div>}
              </div>
            ))}
            {route.buses.some(b=>b.ac)&&<span style={{ fontSize:10,fontWeight:800,padding:"4px 9px",borderRadius:20,background:"#e0f2fe",color:"#0369a1",border:"1px solid #bae6fd" }}>❄ AC</span>}
          </div>
          {bm&&<span style={{ fontSize:11,fontWeight:800,padding:"5px 11px",borderRadius:20,background:bm.bg,color:bm.txt,border:`1.5px solid ${bm.bd}`,whiteSpace:"nowrap",letterSpacing:"0.04em" }}>{bm.pre}{route.badge.toUpperCase()}</span>}
        </div>
        <div style={{ display:"flex",alignItems:"center",background:"#f8fafc",borderRadius:11,padding:"11px 14px",marginBottom:14 }}>
          {route.buses.map((bus,bi)=>(
            <div key={bi} style={{ display:"flex",alignItems:"center",flex:1,minWidth:0 }}>
              {bi===0&&<div style={{ width:10,height:10,borderRadius:"50%",border:`2.5px solid ${bus.color}`,background:"#fff",flexShrink:0 }}/>}
              <div style={{ flex:1,position:"relative",margin:"0 5px",height:4,background:`linear-gradient(90deg,${bus.color}55,${bus.color})`,borderRadius:2 }}>
                <div style={{ position:"absolute",top:-8,left:"50%",transform:"translateX(-50%)",background:bus.color,borderRadius:5,padding:"1px 6px",fontSize:9,fontWeight:900,color:"#fff",whiteSpace:"nowrap" }}>{bus.id}</div>
              </div>
              {bi<route.buses.length-1&&<div style={{ width:18,height:18,borderRadius:"50%",background:"#fff7ed",border:"2px solid #fed7aa",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:9 }}>↔</div>}
              {bi===route.buses.length-1&&<div style={{ width:10,height:10,borderRadius:"50%",background:bus.color,boxShadow:`0 0 0 3px ${bus.color}30`,flexShrink:0 }}/>}
            </div>
          ))}
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:12 }}>
          {[
            {icon:"🕐",label:"Duration",val:`${adjMins}m`,sub:`${route.distance}km${trafficExtra>0?` +${trafficExtra}m 🚦`:""}`},
            {icon:"🎟️",label:"Fare",val:`₹${route.totalFare}`,sub:route.buses.some(b=>b.ac)?"AC Rate":"Regular"},
            {icon:"📡",label:"Frequency",val:`${route.frequency}m`,sub:"Interval"},
            {icon:"🌿",label:"CO₂ Saved",val:`${route.co2}kg`,sub:"vs car"},
          ].map(s=>(
            <div key={s.label} style={{ background:"#f8fafc",borderRadius:10,padding:"10px 8px",textAlign:"center",border:"1px solid #f1f5f9" }}>
              <div style={{ fontSize:17,marginBottom:3 }}>{s.icon}</div>
              <div style={{ fontSize:14,fontWeight:900,color:"#0f172a",lineHeight:1 }}>{s.val}</div>
              <div style={{ fontSize:9,fontWeight:600,color:"#94a3b8",marginTop:3,textTransform:"uppercase",letterSpacing:"0.05em" }}>{s.sub}</div>
            </div>
          ))}
        </div>
        <div style={{ background:"#f8fafc",borderRadius:10,padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"space-between",border:"1px solid #f1f5f9" }}>
          <div style={{ fontSize:11,fontWeight:700,color:"#64748b" }}>Next departure</div>
          <CountdownRing totalSecs={route.countdown} color={mainColor} />
        </div>
        <div style={{ display:"flex",gap:7,flexWrap:"wrap" }}>
          {[
            {icon:"🔖",label:saved?"Saved ✓":"Save",active:saved,action:onSave},
            {icon:"⚔️",label:compareSelected?"✓ Selected":"Compare",active:compareSelected,action:onCompareToggle},
            {icon:"📤",label:"Share",active:false,action:handleShare},
          ].map(btn=>(
            <button key={btn.label} onClick={btn.action} style={{ display:"flex",alignItems:"center",gap:5,padding:"6px 13px",borderRadius:20,border:`1.5px solid ${btn.active?"#818cf8":"#e2e8f0"}`,background:btn.active?"#ede9fe":"transparent",color:btn.active?"#6366f1":"#64748b",fontSize:12,fontWeight:700,cursor:"pointer",transition:"all .18s" }}>{btn.icon} {btn.label}</button>
          ))}
          {/* Book Ticket button */}
          <button onClick={onBook} style={{ display:"flex",alignItems:"center",gap:5,padding:"6px 15px",borderRadius:20,border:"none",background:"linear-gradient(135deg,#16a34a,#15803d)",color:"#fff",fontSize:12,fontWeight:800,cursor:"pointer",transition:"all .18s",boxShadow:"0 4px 12px rgba(22,163,74,.35)" }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 6px 18px rgba(22,163,74,.5)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 4px 12px rgba(22,163,74,.35)";}}>
            🎟️ Book Ticket
          </button>
        </div>
      </div>
      <button onClick={()=>setExpanded(e=>!e)} className="btn-row-hover" style={{ width:"100%",background:"#f8fafc",border:"none",borderTop:"1.5px solid #f1f5f9",padding:"11px 20px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7,color:"#64748b",fontSize:11,fontWeight:700,letterSpacing:"0.07em",transition:"background .15s" }}>
        <span>{expanded?"▲":"▼"}</span>{expanded?"HIDE DETAILS":"VIEW JOURNEY DETAILS"}
      </button>
      {expanded&&(
        <div style={{ borderTop:"1px solid #f1f5f9" }}>
          <div style={{ display:"flex",background:"#f8fafc",borderBottom:"1px solid #f1f5f9" }}>
            {[{id:"stops",label:"🛑 Stops"},{id:"map",label:"🗺️ Map"},{id:"fare",label:"💰 Fare"}].map(tab=>(
              <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{ flex:1,padding:"10px 6px",border:"none",background:"transparent",cursor:"pointer",fontSize:12,fontWeight:700,color:activeTab===tab.id?mainColor:"#64748b",borderBottom:activeTab===tab.id?`2.5px solid ${mainColor}`:"2.5px solid transparent",transition:"color .15s" }}>{tab.label}</button>
            ))}
          </div>
          <div style={{ padding:"16px 20px 20px" }}>
            {activeTab==="stops"&&route.buses.map((bus,bi)=>(
              <div key={bi}>
                {bi>0&&(
                  <div style={{ margin:"12px 0",padding:"10px 14px",background:"#fff7ed",border:"1.5px solid #fed7aa",borderRadius:10,display:"flex",alignItems:"center",gap:8 }}>
                    <span style={{ fontSize:16 }}>🔄</span>
                    <div>
                      <div style={{ fontSize:12,fontWeight:800,color:"#9a3412" }}>Transfer at {route.transferAt}</div>
                      <div style={{ fontSize:10,color:"#c2410c",marginTop:1 }}>Alight Bus {route.buses[bi-1].id} · Board Bus {bus.id} · ~5 min walk</div>
                    </div>
                  </div>
                )}
                <div style={{ marginTop:bi>0?0:4,border:`1.5px solid ${bus.color}30`,borderRadius:12,overflow:"hidden" }}>
                  <div style={{ background:`${bus.color}12`,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,borderBottom:`1px solid ${bus.color}20` }}>
                    <div style={{ width:30,height:30,borderRadius:8,background:bus.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14 }}>🚌</div>
                    <div>
                      <div style={{ fontWeight:900,fontSize:13,color:bus.color }}>Bus {bus.id} — {bus.type}</div>
                      <div style={{ fontSize:10,color:"#94a3b8",marginTop:1 }}>{bus.stopsCount} stops · ~{Math.round(bus.stopsCount*2.3)} km</div>
                    </div>
                  </div>
                  <div style={{ padding:"14px",position:"relative" }}>
                    <div style={{ position:"absolute",left:25,top:24,bottom:24,width:2,background:`${bus.color}22`,borderRadius:1 }}/>
                    {bus.stops.map((stop,si)=>{
                      const isF=si===0,isL=si===bus.stops.length-1;
                      return (
                        <div key={stop} style={{ display:"flex",alignItems:"center",gap:10,marginBottom:si<bus.stops.length-1?10:0,opacity:(!isF&&!isL)?0.65:1 }}>
                          <div style={{ width:18,height:18,borderRadius:"50%",flexShrink:0,zIndex:1,background:isF||isL?bus.color:"#fff",border:`2.5px solid ${bus.color}`,display:"flex",alignItems:"center",justifyContent:"center" }}>
                            {(isF||isL)&&<div style={{ width:5,height:5,borderRadius:"50%",background:"#fff" }}/>}
                          </div>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:isF||isL?13:12,fontWeight:isF||isL?700:400,color:isF||isL?"#0f172a":"#64748b" }}>{stop}</div>
                            {isF&&<div style={{ fontSize:9,color:bus.color,fontWeight:700,marginTop:1 }}>BOARD HERE</div>}
                            {isL&&<div style={{ fontSize:9,color:"#16a34a",fontWeight:700,marginTop:1 }}>ALIGHT HERE</div>}
                          </div>
                          <div style={{ fontSize:10,color:"#cbd5e1",flexShrink:0 }}>{isF?"0:00":`~${si*5}m`}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
            {activeTab==="map"&&(
              <div style={{ paddingTop:6 }}>
                <RouteSVGMap route={route}/>
                <div style={{ fontSize:11,color:"#94a3b8",marginTop:6,textAlign:"center" }}>Hover stops to see names · 🔵 Board · 🟢 Alight</div>
              </div>
            )}
            {activeTab==="fare"&&(
              <div style={{ paddingTop:4 }}>
                {route.buses.map((bus,i)=>{
                  const f=bus.ac?Math.max(30,Math.ceil(bus.stopsCount*1.8/5)*5):Math.max(10,Math.ceil(bus.stopsCount*0.8/5)*5);
                  const pct=Math.round((f/Math.max(route.totalFare,1))*100);
                  return (
                    <div key={i} style={{ marginBottom:14 }}>
                      <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
                        <div style={{ display:"flex",alignItems:"center",gap:7 }}>
                          <div style={{ width:8,height:8,borderRadius:"50%",background:bus.color }}/>
                          <span style={{ fontSize:13,color:"#0f172a",fontWeight:600 }}>Bus {bus.id} · {bus.stopsCount} stops{bus.ac?" (AC)":""}</span>
                        </div>
                        <span style={{ fontSize:13,fontWeight:800,color:"#16a34a" }}>₹{f}</span>
                      </div>
                      <div style={{ height:8,background:"#f1f5f9",borderRadius:4,overflow:"hidden" }}>
                        <div style={{ height:"100%",width:`${pct}%`,background:bus.color,borderRadius:4,transition:"width .8s ease" }}/>
                      </div>
                    </div>
                  );
                })}
                <div style={{ display:"flex",justifyContent:"space-between",borderTop:"2px dashed #e2e8f0",paddingTop:12,marginTop:6 }}>
                  <span style={{ fontSize:14,fontWeight:800,color:"#0f172a" }}>Total Fare</span>
                  <span style={{ fontSize:20,fontWeight:900,color:"#16a34a" }}>₹{route.totalFare}</span>
                </div>
                <div style={{ marginTop:12,padding:"10px 14px",background:"#f0fdf4",borderRadius:10,border:"1px solid #bbf7d0",fontSize:12,color:"#15803d",fontWeight:600 }}>
                  💡 {route.buses.some(b=>b.ac)?"AC bus fare includes comfort surcharge.":"Use a monthly pass to save up to 40% on this route."}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── MAIN APP ─── */
export default function App() {
  const [page, setPage] = useState("home"); // home | booking
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [routes, setRoutes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [filter, setFilter] = useState("all");
  const [darkMode, setDarkMode] = useState(false);
  const [saved, setSaved] = useState(() => { try { return JSON.parse(localStorage.getItem("biq_saved") || "[]"); } catch { return []; } });
  const [compareIds, setCompareIds] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem("biq_user") || "null"); } catch { return null; } });
  const [bookingRoute, setBookingRoute] = useState(null);
  const resultsRef = useRef(null);
  const traffic = getTraffic();
  const weather = getWeather();

  const addToast = useCallback((msg, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4200);
  }, []);

  const doSearch = useCallback(() => {
    if (!from || !to) return;
    setLoading(true); setSearched(true); setCompareIds([]);
    setTimeout(() => {
      const r = findRoutes(from, to);
      setRoutes(r); setLoading(false); setFilter("all");
      if (r.length > 0) {
        addToast(`Found ${r.length} routes! Next bus in ${r[0].nextBus} min.`, "success");
        if (r[0].nextBus <= 3) addToast(`Bus ${r[0].buses[0].id} arrives in ${r[0].nextBus} min! 🚌`, "warn");
      } else { addToast("No routes found — try different stops.", "warn"); }
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    }, 720);
  }, [from, to, addToast]);

  const swap = () => { const t = from; setFrom(to); setTo(t); setRoutes(null); setSearched(false); };

  const toggleSave = route => {
    const key = route.id;
    setSaved(prev => {
      const next = prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key];
      localStorage.setItem("biq_saved", JSON.stringify(next));
      addToast(prev.includes(key) ? "Route removed." : "Route saved! ✓", "success");
      return next;
    });
  };

  const toggleCompare = id => {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 2) { addToast("Max 2 routes for comparison.", "warn"); return prev; }
      const next = [...prev, id];
      if (next.length === 2) setTimeout(() => setShowCompare(true), 300);
      return next;
    });
  };

  const handleBook = (route) => {
    if (!user) { addToast("Please sign in to book tickets.", "warn"); setShowLogin(true); return; }
    setBookingRoute(route);
    setPage("booking");
  };

  const handleLogin = (u) => {
    setUser(u);
    localStorage.setItem("biq_user", JSON.stringify(u));
    setShowLogin(false);
    addToast(`Welcome back, ${u.name}! 👋`, "success");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("biq_user");
    addToast("Signed out successfully.", "info");
  };

  const filtered = routes ? routes.filter(r => {
    if (filter === "direct") return r.changes === 0;
    if (filter === "fastest") return r === [...routes].sort((a, b) => a.totalMins - b.totalMins)[0];
    if (filter === "cheapest") return r === [...routes].sort((a, b) => a.totalFare - b.totalFare)[0];
    if (filter === "ac") return r.buses.some(b => b.ac);
    if (filter === "saved") return saved.includes(r.id);
    return true;
  }) : [];

  const T = {
    bg: darkMode ? "#0f172a" : "#f0f4f8",
    navBg: darkMode ? "#1e293b" : "#fff",
    cardBg: darkMode ? "#1e293b" : "#fff",
    bd: darkMode ? "#334155" : "#e2e8f0",
    txt: darkMode ? "#f1f5f9" : "#0f172a",
    sub: darkMode ? "#94a3b8" : "#64748b",
    muted: darkMode ? "#475569" : "#cbd5e1",
    statBg: darkMode ? "#0f172a" : "#f8fafc",
  };

  if (page === "booking") {
    return (
      <div style={{ fontFamily:"'Plus Jakarta Sans', system-ui, sans-serif" }}>
        <style>{STYLES}</style>
        <BookingPage user={user} onBack={()=>setPage("home")} addToast={addToast} routes={bookingRoute?[bookingRoute]:[]} />
        <div style={{ position:"fixed",top:20,right:20,zIndex:9999,display:"flex",flexDirection:"column",gap:8 }}>
          {toasts.map(t=><Toast key={t.id} msg={t.msg} type={t.type} onDone={()=>setToasts(p=>p.filter(x=>x.id!==t.id))}/>)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans', system-ui, sans-serif",background:T.bg,minHeight:"100vh",color:T.txt,transition:"background .25s, color .25s" }}>
      <style>{STYLES}</style>

      {/* Toasts */}
      <div style={{ position:"fixed",top:76,right:20,zIndex:9999,display:"flex",flexDirection:"column",gap:8 }}>
        {toasts.map(t=><Toast key={t.id} msg={t.msg} type={t.type} onDone={()=>setToasts(p=>p.filter(x=>x.id!==t.id))}/>)}
      </div>

      {showLogin && <LoginModal onClose={()=>setShowLogin(false)} onLogin={handleLogin}/>}
      {showCompare && routes && routes.filter(r=>compareIds.includes(r.id)).length>=2 && (
        <CompareModal routes={routes.filter(r=>compareIds.includes(r.id))} onClose={()=>setShowCompare(false)}/>
      )}

      {/* NAV */}
      <nav style={{ background:T.navBg,borderBottom:`1px solid ${T.bd}`,position:"sticky",top:0,zIndex:300,boxShadow:"0 1px 16px rgba(0,0,0,.09)",transition:"background .25s" }}>
        <div style={{ maxWidth:1380,margin:"0 auto",padding:"0 32px",height:64,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ width:40,height:40,borderRadius:11,background:"linear-gradient(135deg,#3b82f6,#6366f1)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 14px rgba(99,102,241,.4)",fontSize:20 }}>🚌</div>
            <div>
              <span style={{ fontWeight:900,fontSize:18,color:T.txt,letterSpacing:"-0.5px" }}>BusRoute</span>
              <span style={{ fontWeight:900,fontSize:18,color:"#3b82f6",letterSpacing:"-0.5px" }}>IQ</span>
              <div style={{ fontSize:9,fontWeight:700,color:T.sub,letterSpacing:"0.07em" }}>CHENNAI TRANSIT</div>
            </div>
          </div>
          <div className="nav-links" style={{ display:"flex",gap:24 }}>
            {["Routes","Stops","Schedule","Alerts"].map(l=>(
              <a key={l} href="#" style={{ fontSize:14,fontWeight:600,color:T.sub,textDecoration:"none" }}
                onMouseEnter={e=>e.currentTarget.style.color=T.txt}
                onMouseLeave={e=>e.currentTarget.style.color=T.sub}>{l}</a>
            ))}
            <a href="#" onClick={e=>{e.preventDefault();setPage("booking");}} style={{ fontSize:14,fontWeight:700,color:"#16a34a",textDecoration:"none",display:"flex",alignItems:"center",gap:4 }}
              onMouseEnter={e=>e.currentTarget.style.opacity="0.8"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
              🎟️ Book Ticket
            </a>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            {compareIds.length===2&&(
              <button onClick={()=>setShowCompare(true)} style={{ padding:"7px 14px",borderRadius:20,background:"#6366f1",color:"#fff",border:"none",cursor:"pointer",fontSize:12,fontWeight:800,display:"flex",alignItems:"center",gap:5,boxShadow:"0 4px 12px rgba(99,102,241,.45)" }}>
                ⚔️ Compare
              </button>
            )}
            <div style={{ display:"flex",alignItems:"center",gap:6,background:darkMode?"#1e293b":"#f0fdf4",border:`1px solid ${darkMode?"#334155":"#bbf7d0"}`,borderRadius:20,padding:"6px 12px" }}>
              <div style={{ width:7,height:7,borderRadius:"50%",background:"#22c55e",animation:"pulse 2s infinite" }}/>
              <span style={{ fontSize:11,fontWeight:700,color:darkMode?"#86efac":"#16a34a" }}>Live</span>
            </div>
            {/* User button */}
            {user ? (
              <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                <div style={{ display:"flex",alignItems:"center",gap:7,background:darkMode?"#1e293b":"#eff6ff",borderRadius:20,padding:"6px 14px",border:`1px solid ${darkMode?"#334155":"#bfdbfe"}` }}>
                  <div style={{ width:26,height:26,borderRadius:"50%",background:"linear-gradient(135deg,#3b82f6,#6366f1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#fff",fontWeight:800 }}>
                    {user.name[0].toUpperCase()}
                  </div>
                  <span style={{ fontSize:12,fontWeight:700,color:darkMode?"#93c5fd":"#1d4ed8" }}>{user.name.split(" ")[0]}</span>
                </div>
                <button onClick={handleLogout} style={{ background:"none",border:`1px solid ${T.bd}`,color:T.sub,borderRadius:20,padding:"6px 12px",cursor:"pointer",fontSize:11,fontWeight:700,transition:"all .18s" }}
                  onMouseEnter={e=>{e.currentTarget.style.background="#fef2f2";e.currentTarget.style.color="#dc2626";e.currentTarget.style.borderColor="#fecaca";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color=T.sub;e.currentTarget.style.borderColor=T.bd;}}>
                  Sign Out
                </button>
              </div>
            ) : (
              <button onClick={()=>setShowLogin(true)} style={{ padding:"8px 18px",borderRadius:20,background:"linear-gradient(135deg,#3b82f6,#6366f1)",color:"#fff",border:"none",cursor:"pointer",fontSize:13,fontWeight:800,boxShadow:"0 4px 12px rgba(99,102,241,.4)",transition:"all .18s",display:"flex",alignItems:"center",gap:6 }}>
                👤 Sign In
              </button>
            )}
            <button onClick={()=>setDarkMode(d=>!d)} style={{ width:38,height:38,borderRadius:9,border:`1.5px solid ${T.bd}`,background:T.cardBg,cursor:"pointer",fontSize:17,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s" }}>
              {darkMode?"☀️":"🌙"}
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background:darkMode?"linear-gradient(140deg,#000d1a,#0f172a,#0a1628)":"linear-gradient(140deg,#0f172a,#1e3a5f,#0f2847)",position:"relative",overflow:"hidden",padding:"64px 40px 80px",transition:"background .3s" }}>
        {/* Animated buses */}
        <div style={{ position:"absolute",bottom:6,left:0,right:0,height:32,overflow:"hidden",pointerEvents:"none" }}>
          {[0,4,8].map((delay,i)=>(
            <div key={i} style={{ position:"absolute",bottom:4,fontSize:18+i*2,opacity:1-i*0.3,animation:`busDrive ${11+i}s linear ${delay}s infinite` }}>🚌</div>
          ))}
        </div>
        {/* BG orbs */}
        <div style={{ position:"absolute",inset:0,pointerEvents:"none" }}>
          <div style={{ position:"absolute",top:-100,right:-80,width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(59,130,246,.12) 0%,transparent 65%)" }}/>
          <div style={{ position:"absolute",bottom:-120,left:-60,width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(99,102,241,.1) 0%,transparent 65%)" }}/>
        </div>

        <div style={{ maxWidth:1380,margin:"0 auto",position:"relative",zIndex:1 }}>
          {/* Traffic light in hero — top right corner */}
          <div style={{ position:"absolute",top:0,right:40,zIndex:10 }}>
            <TrafficLight/>
          </div>

          <div style={{ display:"inline-flex",alignItems:"center",gap:8,background:"rgba(59,130,246,.18)",border:"1px solid rgba(59,130,246,.35)",borderRadius:20,padding:"6px 14px",marginBottom:20,animation:"fadeUp .5s ease" }}>
            <span style={{ fontSize:12 }}>🚌</span>
            <span style={{ fontSize:11,fontWeight:800,color:"#7dd3fc",letterSpacing:"0.08em" }}>CHENNAI METROPOLITAN TRANSPORT CORPORATION</span>
          </div>
          <h1 className="h1-big" style={{ fontSize:56,fontWeight:900,color:"#fff",letterSpacing:"-2px",lineHeight:1.08,marginBottom:14,animation:"fadeUp .5s ease .1s both" }}>
            Smart routes.<br/>
            <span style={{ background:"linear-gradient(90deg,#60a5fa,#a78bfa,#34d399)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>Live timings.</span>
            <br/>Zero confusion.
          </h1>
          <p style={{ fontSize:16,color:"#94a3b8",fontWeight:500,maxWidth:480,lineHeight:1.7,marginBottom:38,animation:"fadeUp .5s ease .2s both" }}>
            Real-time routes, fare breakdowns, crowd heatmaps, countdown timers &amp; instant e-ticket booking — all in one place.
          </p>

          {/* Search card */}
          <div style={{ background:"#fff",borderRadius:22,padding:24,boxShadow:"0 32px 80px rgba(0,0,0,.4)",maxWidth:940,animation:"fadeUp .6s ease .3s both" }}>
            <div style={{ fontSize:10,fontWeight:800,color:"#94a3b8",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12 }}>Plan Your Journey</div>
            <div className="search-row" style={{ display:"flex",gap:10,alignItems:"stretch" }}>
              <StopInput label="From — Boarding Stop" value={from} onChange={setFrom} placeholder="Search starting stop…" accent="#6366f1" emoji="🔵"/>
              <button onClick={swap} style={{ flexShrink:0,width:46,height:46,alignSelf:"center",background:"#f1f5f9",border:"1.5px solid #e2e8f0",borderRadius:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,transition:"all .2s" }}
                onMouseEnter={e=>{e.currentTarget.style.background="#ede9fe";e.currentTarget.style.borderColor="#a5b4fc";}}
                onMouseLeave={e=>{e.currentTarget.style.background="#f1f5f9";e.currentTarget.style.borderColor="#e2e8f0";}}>⇅</button>
              <StopInput label="To — Destination Stop" value={to} onChange={setTo} placeholder="Search destination stop…" accent="#0ea5e9" emoji="📍"/>
              <button onClick={doSearch} disabled={!from||!to||loading} style={{
                flexShrink:0,padding:"0 28px",borderRadius:13,border:"none",
                cursor:from&&to?"pointer":"not-allowed",
                background:from&&to?"linear-gradient(135deg,#3b82f6,#6366f1)":"#e2e8f0",
                color:from&&to?"#fff":"#94a3b8",
                fontSize:14,fontWeight:800,display:"flex",alignItems:"center",gap:8,minWidth:140,justifyContent:"center",
                boxShadow:from&&to?"0 8px 28px rgba(99,102,241,.45)":"none",transition:"all .2s",
              }}
                onMouseEnter={e=>{if(from&&to){e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 12px 36px rgba(99,102,241,.55)";}}}
                onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow=from&&to?"0 8px 28px rgba(99,102,241,.45)":"none";}}>
                {loading?<div style={{ width:17,height:17,border:"2.5px solid rgba(255,255,255,.35)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .7s linear infinite" }}/>:"🔍"}
                {loading?"Searching…":"Find Routes"}
              </button>
            </div>
            {!searched&&(
              <div style={{ marginTop:14,paddingTop:14,borderTop:"1px solid #f1f5f9" }}>
                <span style={{ fontSize:10,fontWeight:700,color:"#94a3b8",letterSpacing:"0.08em",textTransform:"uppercase",marginRight:8 }}>Popular:</span>
                {POPULAR_ROUTES.map(([f,t])=>(
                  <button key={`${f}-${t}`} className="chip-hover"
                    onClick={()=>{
                      setFrom(f);setTo(t);
                      setTimeout(()=>{
                        const r=findRoutes(f,t);
                        setRoutes(r);setSearched(true);setFilter("all");
                        setTimeout(()=>resultsRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),120);
                      },50);
                    }}
                    style={{ display:"inline-flex",alignItems:"center",gap:4,margin:"4px 5px 4px 0",background:"#f8fafc",border:"1.5px solid #e2e8f0",borderRadius:20,padding:"5px 12px",cursor:"pointer",fontSize:12,fontWeight:600,color:"#64748b",transition:"all .18s" }}>
                    <span style={{ color:"#3b82f6",fontSize:9 }}>●</span>{f.split(" ")[0]} → {t.split(" ")[0]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div ref={resultsRef} className="page-pad" style={{ maxWidth:1380,margin:"0 auto",padding:"40px 32px 80px" }}>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 300px",gap:26,alignItems:"start" }}>
          {/* LEFT */}
          <div>
            {loading&&(
              <div>
                <div style={{ height:26,width:200,background:T.cardBg,borderRadius:8,marginBottom:18,backgroundImage:`linear-gradient(90deg,${T.cardBg} 25%,${T.statBg} 50%,${T.cardBg} 75%)`,backgroundSize:"600px 100%",animation:"shimmer 1.3s ease infinite" }}/>
                <div className="result-grid" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
                  {[0,1,2,3].map(i=>(
                    <div key={i} style={{ height:220,background:T.cardBg,borderRadius:18,backgroundImage:`linear-gradient(90deg,${T.cardBg} 25%,${T.statBg} 50%,${T.cardBg} 75%)`,backgroundSize:"800px 100%",animation:`shimmer 1.4s ease ${i*.12}s infinite` }}/>
                  ))}
                </div>
              </div>
            )}
            {!loading&&searched&&routes!==null&&(
              <div>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:10 }}>
                  <div>
                    <h2 style={{ fontSize:22,fontWeight:900,color:T.txt,letterSpacing:"-0.4px" }}>
                      {filtered.length>0?`${filtered.length} route${filtered.length!==1?"s":""} found`:"No routes found"}
                    </h2>
                    <p style={{ fontSize:13,color:T.sub,marginTop:3,fontWeight:500 }}>
                      <span style={{ color:"#3b82f6",fontWeight:700 }}>{from}</span>
                      <span style={{ margin:"0 6px",color:T.muted }}>→</span>
                      <span style={{ color:"#6366f1",fontWeight:700 }}>{to}</span>
                    </p>
                  </div>
                  {compareIds.length>0&&(
                    <div style={{ display:"flex",alignItems:"center",gap:8,background:darkMode?"#1e293b":"#ede9fe",border:`1px solid ${darkMode?"#4338ca":"#c7d2fe"}`,borderRadius:10,padding:"7px 12px" }}>
                      <span style={{ fontSize:12,fontWeight:700,color:"#6366f1" }}>{compareIds.length}/2 selected</span>
                      {compareIds.length===2&&<button onClick={()=>setShowCompare(true)} style={{ background:"#6366f1",color:"#fff",border:"none",borderRadius:7,padding:"3px 9px",fontSize:11,fontWeight:800,cursor:"pointer" }}>Compare ⚔️</button>}
                    </div>
                  )}
                </div>
                {routes.length>0&&(
                  <div style={{ display:"flex",gap:7,marginBottom:22,flexWrap:"wrap" }}>
                    {[
                      {id:"all",label:"🗺️ All"},
                      {id:"direct",label:"⚡ Direct"},
                      {id:"fastest",label:"🕐 Fastest"},
                      {id:"cheapest",label:"💰 Cheapest"},
                      {id:"ac",label:"❄ AC Buses"},
                      {id:"saved",label:`🔖 Saved (${saved.length})`},
                    ].map(f=>(
                      <button key={f.id} onClick={()=>setFilter(f.id)} style={{
                        padding:"7px 14px",borderRadius:20,cursor:"pointer",
                        fontSize:12,fontWeight:700,transition:"all .18s",
                        background:filter===f.id?"#0f172a":T.cardBg,
                        color:filter===f.id?"#fff":T.sub,
                        border:filter===f.id?"2px solid #0f172a":`2px solid ${T.bd}`,
                        boxShadow:filter===f.id?"0 4px 14px rgba(15,23,42,.22)":"0 1px 4px rgba(0,0,0,.05)",
                      }}>{f.label}</button>
                    ))}
                  </div>
                )}
                {filtered.length>0?(
                  <div className="result-grid" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
                    {filtered.map((r,i)=>(
                      <div key={r.id} style={{ gridColumn:r.badge==="Recommended"?"1 / -1":"auto" }}>
                        <RouteCard route={r} index={i} saved={saved.includes(r.id)} onSave={()=>toggleSave(r)} compareSelected={compareIds.includes(r.id)} onCompareToggle={()=>toggleCompare(r.id)} trafficExtra={traffic.extra} onBook={()=>handleBook(r)}/>
                      </div>
                    ))}
                  </div>
                ):(
                  <div style={{ textAlign:"center",padding:"64px 24px",background:T.cardBg,borderRadius:20,border:`1.5px solid ${T.bd}` }}>
                    <div style={{ fontSize:52,marginBottom:12 }}>🔍</div>
                    <h3 style={{ fontSize:18,fontWeight:800,color:T.txt,marginBottom:8 }}>No routes match this filter</h3>
                    <p style={{ fontSize:13,color:T.sub,marginBottom:14 }}>Try a different filter or change your stops</p>
                    <button onClick={()=>setFilter("all")} style={{ padding:"9px 22px",background:"#0f172a",color:"#fff",border:"none",borderRadius:11,fontSize:13,fontWeight:700,cursor:"pointer" }}>Show All</button>
                  </div>
                )}
              </div>
            )}
            {!loading&&!searched&&(
              <div style={{ textAlign:"center",padding:"72px 24px",animation:"fadeUp .6s ease" }}>
                <div style={{ fontSize:72,marginBottom:16,animation:"float 3s ease-in-out infinite",display:"inline-block" }}>🚌</div>
                <h2 style={{ fontSize:24,fontWeight:900,color:T.txt,marginBottom:10 }}>Where are you headed?</h2>
                <p style={{ fontSize:14,color:T.sub,maxWidth:380,margin:"0 auto",lineHeight:1.7 }}>
                  Enter your boarding stop and destination above to discover real-time routes with live countdown timers.
                </p>
                <button onClick={()=>setPage("booking")} style={{ marginTop:24,padding:"12px 28px",borderRadius:13,background:"linear-gradient(135deg,#16a34a,#15803d)",color:"#fff",border:"none",cursor:"pointer",fontSize:14,fontWeight:800,boxShadow:"0 8px 24px rgba(22,163,74,.4)",display:"inline-flex",alignItems:"center",gap:8 }}>
                  🎟️ Book a Ticket Directly
                </button>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <aside className="sidebar" style={{ display:"flex",flexDirection:"column",gap:14,position:"sticky",top:80 }}>
            <div style={{ background:T.cardBg,borderRadius:16,padding:18,border:`1.5px solid ${T.bd}`,textAlign:"center" }}>
              <div style={{ fontSize:10,fontWeight:800,color:T.sub,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:10 }}>🕐 Live Clock</div>
              <LiveClock/>
            </div>
            {/* Traffic light in sidebar too */}
            <div style={{ background:T.cardBg,borderRadius:16,padding:16,border:`1.5px solid ${T.bd}`,display:"flex",flexDirection:"column",alignItems:"center",gap:8 }}>
              <div style={{ fontSize:10,fontWeight:800,color:T.sub,letterSpacing:"0.09em",textTransform:"uppercase" }}>🚦 Traffic Signal</div>
              <TrafficLight/>
              <div style={{ fontSize:11,color:T.sub,fontWeight:600,textAlign:"center" }}>Live signal simulation · Auto-cycles every few seconds</div>
            </div>
            <div style={{ background:T.cardBg,borderRadius:16,padding:16,border:`1.5px solid ${T.bd}` }}>
              <div style={{ fontSize:10,fontWeight:800,color:T.sub,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:12 }}>Today's Conditions</div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                <div style={{ background:T.statBg,borderRadius:11,padding:"12px 10px" }}>
                  <div style={{ fontSize:24,marginBottom:4 }}>{weather.icon}</div>
                  <div style={{ fontSize:12,fontWeight:800,color:T.txt }}>{weather.label}</div>
                  <div style={{ fontSize:9,color:T.sub,marginTop:2 }}>Chennai Weather</div>
                  {weather.delay>0&&<div style={{ fontSize:9,color:"#f59e0b",fontWeight:700,marginTop:3 }}>+{weather.delay}m delay</div>}
                </div>
                <div style={{ background:T.statBg,borderRadius:11,padding:"12px 10px" }}>
                  <div style={{ width:24,height:24,borderRadius:6,background:`${traffic.color}22`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:4 }}>
                    <div style={{ width:9,height:9,borderRadius:"50%",background:traffic.color }}/>
                  </div>
                  <div style={{ fontSize:12,fontWeight:800,color:T.txt }}>{traffic.level}</div>
                  <div style={{ fontSize:9,color:T.sub,marginTop:2 }}>Traffic Now</div>
                  {traffic.extra>0&&<div style={{ fontSize:9,color:"#f59e0b",fontWeight:700,marginTop:3 }}>+{traffic.extra}m added</div>}
                </div>
              </div>
            </div>
            <div style={{ background:T.cardBg,borderRadius:16,padding:16,border:`1.5px solid ${T.bd}` }}>
              <CrowdChart/>
            </div>
            {/* Book ticket CTA */}
            <div style={{ background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",borderRadius:14,padding:16,border:"1.5px solid #86efac",cursor:"pointer" }} onClick={()=>{ if(!user){setShowLogin(true);addToast("Sign in to book tickets","warn");return;} setPage("booking");}}>
              <div style={{ fontSize:22,marginBottom:6 }}>🎟️</div>
              <div style={{ fontSize:13,fontWeight:900,color:"#15803d",marginBottom:4 }}>Book Your Ticket</div>
              <div style={{ fontSize:11,color:"#166534",lineHeight:1.5 }}>Instant e-ticket with QR code. Download and show at boarding.</div>
              <div style={{ marginTop:10,display:"inline-flex",alignItems:"center",gap:5,background:"#16a34a",color:"#fff",padding:"7px 14px",borderRadius:9,fontSize:12,fontWeight:800 }}>
                Book Now →
              </div>
            </div>
            <div style={{ background:darkMode?"#1e293b":"#ede9fe",borderRadius:14,padding:14,border:`1.5px solid ${darkMode?"#4338ca":"#c7d2fe"}` }}>
              <div style={{ fontSize:13,fontWeight:800,color:"#6366f1",marginBottom:5 }}>⚔️ Compare Mode</div>
              <div style={{ fontSize:11,color:T.sub,lineHeight:1.6 }}>Click <strong style={{ color:"#6366f1" }}>Compare</strong> on any 2 cards, then tap <strong style={{ color:"#6366f1" }}>Compare ⚔️</strong> for a side-by-side breakdown.</div>
            </div>
            {saved.length>0&&(
              <div style={{ background:T.cardBg,borderRadius:14,padding:14,border:`1.5px solid ${T.bd}` }}>
                <div style={{ fontSize:10,fontWeight:800,color:T.sub,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:8 }}>🔖 Saved Routes</div>
                <div style={{ fontSize:12,color:T.sub,marginBottom:10 }}>{saved.length} route{saved.length!==1?"s":""} saved.</div>
                <button onClick={()=>setFilter("saved")} style={{ width:"100%",padding:"8px",background:"#6366f1",color:"#fff",border:"none",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer" }}>View Saved →</button>
              </div>
            )}
            <div style={{ background:T.cardBg,borderRadius:14,padding:14,border:`1.5px solid ${T.bd}` }}>
              <div style={{ fontSize:10,fontWeight:800,color:T.sub,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:10 }}>💡 Quick Tips</div>
              {["AC buses cost more but faster in traffic.","Metro Feeder buses link to CMRL stations.","Arrive 3 min early — buses run ahead of schedule!","Monthly passes save up to 40% on fares."].map((tip,i)=>(
                <div key={i} style={{ display:"flex",gap:7,alignItems:"flex-start",marginBottom:7,fontSize:11,color:T.sub,lineHeight:1.5 }}>
                  <span style={{ color:"#3b82f6",fontWeight:900,flexShrink:0 }}>›</span>{tip}
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>

      {/* STATS STRIP */}
      <div style={{ background:T.cardBg,borderTop:`1px solid ${T.bd}`,borderBottom:`1px solid ${T.bd}` }}>
        <div style={{ maxWidth:1380,margin:"0 auto",padding:"0 32px" }}>
          <div className="stats-strip" style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)" }}>
            {[
              {icon:"🚌",v:"14+",l:"Bus Lines",s:"Across Chennai"},
              {icon:"📍",v:"54+",l:"Bus Stops",s:"City coverage"},
              {icon:"🎟️",v:"Instant",l:"E-Ticket Booking",s:"Download & go"},
              {icon:"⚔️",v:"New",l:"Compare Mode",s:"Side-by-side"},
            ].map((s,i)=>(
              <div key={s.l} style={{ padding:"24px 26px",borderRight:i<3?`1px solid ${T.bd}`:"none",display:"flex",alignItems:"center",gap:14 }}>
                <div style={{ fontSize:30 }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize:22,fontWeight:900,color:T.txt,lineHeight:1 }}>{s.v}</div>
                  <div style={{ fontSize:12,fontWeight:700,color:T.txt,marginTop:2 }}>{s.l}</div>
                  <div style={{ fontSize:10,color:T.sub,marginTop:1 }}>{s.s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background:"#0f172a",padding:"32px 40px",textAlign:"center" }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:8 }}>
          <div style={{ width:30,height:30,borderRadius:8,background:"linear-gradient(135deg,#3b82f6,#6366f1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15 }}>🚌</div>
          <span style={{ fontWeight:900,color:"#fff",fontSize:15 }}>BusRoute<span style={{ color:"#60a5fa" }}>IQ</span></span>
        </div>
        <p style={{ fontSize:11,color:"#475569",fontWeight:500 }}>Simulated demonstration · Chennai Metropolitan Transport Corporation · Built with React</p>
      </footer>
    </div>
  );
}
