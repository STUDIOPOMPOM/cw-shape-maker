import React, { useState, useMemo, useEffect } from "react";
import { RATIOS, COLORS, DEFAULT_PARAMS, PRESETS, buildShape, randomParams, validScallopCounts, domeAvailable, activeCategories } from "./engine.js";

// ============================================================
// EXPORT (SVG exact path; PNG 2560px long edge, transparent)
// ============================================================
const EXPORT_LONG_EDGE = 2560;
function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
function exportSVG(params) {
  download(new Blob([buildShape(params).svg], { type: "image/svg+xml" }), `cw-shape-${Date.now()}.svg`);
}
function exportPNG(params) {
  const { W, H, svg } = buildShape(params);
  const scale = EXPORT_LONG_EDGE / Math.max(W, H);
  const pw = Math.round(W * scale), ph = Math.round(H * scale);
  const img = new Image();
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  img.onload = () => {
    const c = document.createElement("canvas");
    c.width = pw; c.height = ph;
    c.getContext("2d").drawImage(img, 0, 0, pw, ph);
    c.toBlob((b) => { download(b, `cw-shape-${Date.now()}.png`); URL.revokeObjectURL(url); }, "image/png");
  };
  img.src = url;
}

// ============================================================
// UI — CW Shape Maker (responsive)
// Left panel: fixed 468px, fixed type. Preview: fluid.
// Below MIN_W x MIN_H → "expand browser" gate.
// Mobile devices → "desktop only" gate.
// ============================================================

const LOGO_SVG = `<svg width="36" height="20" viewBox="0 0 36 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M32.5805 18.2942V19.1041H3.23952V18.2942H32.5805ZM35.0101 15.8646V3.23952C35.0101 1.89766 33.9223 0.809879 32.5805 0.809879H3.23952C1.89766 0.809879 0.809879 1.89766 0.809879 3.23952V15.8646C0.809879 17.2065 1.89766 18.2942 3.23952 18.2942V19.1041L3.15594 19.1031C1.40543 19.0587 0 17.6258 0 15.8646V3.23952C5.99082e-07 1.47832 1.40543 0.0453818 3.15594 0.00105453L3.23952 0H32.5805C34.3696 0 35.82 1.45038 35.82 3.23952V15.8646C35.82 17.6537 34.3696 19.1041 32.5805 19.1041V18.2942C33.9223 18.2942 35.0101 17.2065 35.0101 15.8646Z" fill="#191814"/>
<path d="M11.9528 11.6113V11.7792C11.948 11.7529 11.9432 11.7267 11.9389 11.7005C11.9338 11.6709 11.9291 11.6411 11.9248 11.6113H11.9528Z" fill="#FFFAF5"/>
<path d="M11.9527 11.6113V11.7005H11.9389C11.9338 11.6709 11.9291 11.6411 11.9248 11.6113H11.9527Z" fill="#FFFAF5"/>
<g clip-path="url(#clip0_4996_771)">
<path d="M28.4278 9.5719C28.4278 10.862 27.4264 11.8986 26.1859 11.8986C24.9454 11.8986 23.9419 10.861 23.9419 9.5719V7.54144C23.9419 7.40315 23.8298 7.29102 23.6915 7.29102H20.4272C20.289 7.29102 20.1768 7.40315 20.1768 7.54144V9.5719C20.1768 10.862 19.1753 11.8986 17.9349 11.8986C16.6946 11.8986 15.691 10.861 15.691 9.5719V7.54144C15.691 7.40315 15.5789 7.29102 15.4406 7.29102H12.1772C12.0389 7.29102 11.9268 7.40315 11.9268 7.54144V11.5112C11.9268 11.7055 12.0027 11.8922 12.1383 12.0314L15.4484 15.4263C15.5629 15.5437 15.7201 15.6101 15.8841 15.6101H19.9824C20.1465 15.6101 20.3036 15.5439 20.4181 15.4263L21.8471 13.9605C21.9631 13.8416 22.1542 13.8416 22.2702 13.9605L23.6992 15.4263C23.8137 15.5437 23.9709 15.6101 24.1349 15.6101H28.3651C28.4448 15.6101 28.5211 15.5779 28.5767 15.5208L31.9791 12.0314C32.1147 11.8922 32.1907 11.7056 32.1907 11.5112V7.54144C32.1907 7.40315 32.0785 7.29102 31.9402 7.29102H28.6779C28.5396 7.29102 28.4275 7.40315 28.4275 7.54144V9.5719H28.4278Z" fill="#191814"/>
<path d="M9.80244 15.6089C9.80244 15.6089 9.80244 15.6089 9.80259 15.6089H11.6311C11.7943 15.6089 11.9266 15.4767 11.9266 15.3134V12.1087C11.9266 11.9454 11.7943 11.8132 11.6311 11.8132H9.68233C8.44349 11.8132 7.43941 10.8007 7.43941 9.55152C7.43941 8.30234 8.44349 7.28985 9.68233 7.28985H11.676C11.8143 7.28985 11.9264 7.17771 11.9264 7.03942V3.74457C11.9264 3.60628 11.8143 3.49414 11.676 3.49414H9.68366C6.40535 3.49414 3.74033 6.14261 3.67783 9.43348C3.61357 12.8292 6.43431 15.6089 9.80244 15.6089Z" fill="#191814"/>
</g>
<defs>
<clipPath id="clip0_4996_771">
<rect width="28.5151" height="12.1149" fill="white" transform="translate(3.67676 3.49414)"/>
</clipPath>
</defs>
</svg>`;
const MIN_W = 1000;  // smallest workable viewport width
const MIN_H = 600;   // smallest workable viewport height

const UI_COLORS = [
  { hex: "#FFFAF5", name: "Linen" }, { hex: "#191814", name: "Charcoal" },
  { hex: "#CCCBCA", name: "Concrete" }, { hex: "#EDE8E4", name: "Limewash" },
  { hex: "#EFEEBD", name: "Eucalypt" }, { hex: "#A56C38", name: "Brown" },
  { hex: "#F9E982", name: "Yellow" }, { hex: "#F8CCAC", name: "Peach" },
  { hex: "#FA632B", name: "Red" }, { hex: "#B0CB43", name: "Lime" },
  { hex: "#B5DBF4", name: "Light Blue" }, { hex: "#65B07B", name: "Spearmint" },
  { hex: "#C5D1FF", name: "Aqua" }, { hex: "#A98B48", name: "Dirty Brown" },
];

const CSS = `
@font-face {
  font-family: "ABC ROM Condensed";
  src: url("/fonts/ABCROMCondensed-Medium-Trial.otf") format("opentype");
  font-weight: 500;
}
.cwsm * { box-sizing: border-box; margin: 0; padding: 0; }
.cwsm {
  font-family: "neue-haas-unica", "Neue Haas Unica W1G", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-weight: 500; color: #191814; -webkit-font-smoothing: antialiased;
}
.cwsm-title {
  font-family: "ABC ROM Condensed", "ABC ROM Condensed Unlicensed Trial", Georgia, serif;
  font-weight: 500; font-size: 36px; line-height: 105%; color: #191814;
}
.cwsm-label { font-size: 10px; font-weight: 500; line-height: 105%; color: #191814; }
.cwsm-sublabel { font-size: 10px; font-weight: 400; line-height: 105%; color: #191814; width: 44px; flex-shrink: 0; }
.cwsm-chip {
  display: inline-flex; align-items: center; justify-content: center;
  height: 25px; padding: 10px; gap: 10px; border-radius: 5px;
  border: 0.5px solid #CCCBCA; background: transparent;
  font-family: inherit; font-size: 10px; font-weight: 500; line-height: 130%;
  color: rgba(25,24,20,0.3); cursor: pointer; white-space: nowrap;
  transition: background .12s, color .12s, border-color .12s;
}
.cwsm-chip:hover { background: #191814; border-color: #191814; color: #FFFAF5; }
.cwsm-chip.active { background: #F9E982; border-color: #F9E982; color: #000; }
.cwsm-chip.active:hover { background: #F9E982; border-color: #F9E982; color: #000; }
.cwsm-btn {
  display: inline-flex; align-items: center; justify-content: center;
  height: 25px; padding: 10px; border-radius: 5px; border: none;
  font-family: inherit; font-size: 10px; font-weight: 500; line-height: 130%;
  color: #191814; cursor: pointer; transition: background .12s, color .12s;
}
.cwsm-btn:hover { background: #191814 !important; color: #FFFAF5; }
.cwsm-swatch {
  width: 25px; height: 25px; border-radius: 5px; border: 0.5px solid #191814;
  cursor: pointer; padding: 0;
}
.cwsm-swatch.selected { outline: 1px solid #191814; outline-offset: 2px; }
.cwsm-step-btn {
  background: none; border: none; font-family: inherit; font-size: 12px; font-weight: 500;
  color: #191814; cursor: pointer; width: 18px; height: 25px; line-height: 25px;
}
.cwsm-step-btn:disabled { color: rgba(25,24,20,0.25); cursor: default; }
.cwsm-step-box {
  width: 34px; height: 25px; background: #EDE8E4; border-radius: 5px;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 500;
}
.cwsm-group.locked { opacity: 0.1; pointer-events: none; }
.cwsm-scroll { scrollbar-width: none; }
.cwsm-scroll::-webkit-scrollbar { width: 0; height: 0; }
`;

function Chip({ label, active, onClick }) {
  return (
    <button className={"cwsm-chip" + (active ? " active" : "")} onClick={onClick}>
      {label}
    </button>
  );
}

function ChipRow({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
      {options.map((o) => (
        <Chip key={o.v} label={o.label} active={value === o.v} onClick={() => onChange(o.v)} />
      ))}
    </div>
  );
}

function Group({ label, locked, children }) {
  return (
    <div className={"cwsm-group" + (locked ? " locked" : "")}>
      <div className="cwsm-label" style={{ marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

// slider: 1px divider, 0.5px track carrying the 8px orange dot, S/M/L below
function SizeControl({ value, onChange }) {
  const W = 333, DOT = 8;
  const x = ((value - 1) / 2) * (W - DOT);
  const setFromClientX = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const rel = (e.clientX - rect.left) / rect.width;
    onChange(rel < 1 / 3 ? 1 : rel < 2 / 3 ? 2 : 3);
  };
  return (
    <div style={{ width: W, marginTop: 12 }}>
      <div style={{ position: "relative", width: W, height: 14, cursor: "pointer" }}
        onClick={setFromClientX}>
        <div style={{ position: "absolute", top: 6.5, left: 2, width: W - 4, height: 0.5, background: "#CCCBCA" }} />
        <div style={{
          position: "absolute", top: 3, left: x, width: DOT, height: DOT,
          borderRadius: DOT, background: "#FA632B", transition: "left .15s",
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", width: W, marginTop: 4 }}>
        {["S", "M", "L"].map((t, i) => (
          <span key={t} className="cwsm-label" style={{ cursor: "pointer", letterSpacing: "-0.01em" }}
            onClick={() => onChange(i + 1)}>{t}</span>
        ))}
      </div>
    </div>
  );
}

// stepper: minus / limewash number box / plus
function Stepper({ value, options, onChange }) {
  const idx = options.indexOf(value);
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <button className="cwsm-step-btn" disabled={idx <= 0} onClick={() => onChange(options[idx - 1])}>−</button>
      <span className="cwsm-step-box">{value}</span>
      <button className="cwsm-step-btn" disabled={idx >= options.length - 1} onClick={() => onChange(options[idx + 1])}>+</button>
    </div>
  );
}

// full-screen gate: centred logo + message on linen
function Gate({ message }) {
  return (
    <div className="cwsm" style={{
      width: "100vw", height: "100vh", background: "#FFFAF5",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 18, padding: "0 24px", textAlign: "center",
    }}>
      <style>{CSS}</style>
      <div dangerouslySetInnerHTML={{ __html: LOGO_SVG }} />
      <div className="cwsm-title" style={{ maxWidth: 900 }}>{message}</div>
    </div>
  );
}

const PRESET_ORDER = ["Tag", "Pinch", "Bump", "Scallop", "Arch", "Bowtie", "Dome", "Pills", "Tabs"];

function isMobileDevice() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const uaMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua);
  const touchSmall = (navigator.maxTouchPoints || 0) > 1 &&
    Math.min(window.screen.width, window.screen.height) < 820;
  return uaMobile || touchSmall;
}

export default function CWShapeMaker() {
  const [params, setParams] = useState({
    ...DEFAULT_PARAMS,
    edge: { type: "scallops", side: "bottom", count: 3, size: 2 },
  });
  const [bg, setBg] = useState("#EDE8E4");
  const [applied, setApplied] = useState("Scallop");
  const [vp, setVp] = useState({ w: 9999, h: 9999 });
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    if (!document.getElementById("cwsm-typekit")) {
      const l = document.createElement("link");
      l.id = "cwsm-typekit"; l.rel = "stylesheet";
      l.href = "https://use.typekit.net/vzp5eof.css";
      document.head.appendChild(l);
    }
    setMobile(isMobileDevice());
    const measure = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const set = (patch) => { setApplied(null); setParams((p) => ({ ...p, ...patch })); };
  const setCat = (cat, patch) => { setApplied(null); setParams((p) => ({ ...p, [cat]: { ...p[cat], ...patch } })); };
  const setRatio = (r) => setParams((p) => {
    const next = { ...p, ratio: r };
    if (next.edge.type === "dome" && !domeAvailable(r)) next.edge = { ...next.edge, type: "bump", size: 3 };
    return next;
  });

  const active = activeCategories(params);
  const full = active.length >= 2;
  const locked = (cat) => full && !active.includes(cat);

  const svg = useMemo(() => buildShape(params).svg, [params]);
  const scallopCounts = validScallopCounts(params.ratio);

  const edgeOptions = [
    { v: "none", label: "None" },
    ...(params.sides.type === "notch" ? [] : [{ v: "scallops", label: "Scallop" }]),
    { v: "bites", label: "Bites" }, { v: "arch", label: "Arch" }, { v: "bump", label: "Bump" },
    ...(domeAvailable(params.ratio) ? [{ v: "dome", label: "Dome" }] : []),
  ];
  const sideOptions = [
    { v: "none", label: "None" }, { v: "pinch", label: "Pinch" },
    ...(params.edge.type === "scallops" ? [] : [{ v: "notch", label: "Notch" }]),
    { v: "tabs", label: "Tabs" }, { v: "stack", label: "Stack" },
  ];

  const applyPreset = (name) => {
    setParams({
      ...JSON.parse(JSON.stringify(DEFAULT_PARAMS)),
      ratio: params.ratio,
      ...JSON.parse(JSON.stringify(PRESETS[name])),
    });
    setApplied(name);
  };

  const subRow = { display: "flex", alignItems: "center", gap: 8, marginTop: 8 };

  // ---- gates ----
  if (mobile) return <Gate message="This tool is for desktop use only." />;
  if (vp.w < MIN_W || vp.h < MIN_H)
    return <Gate message="Expand the browser size to continue using this tool." />;

  return (
    <div className="cwsm" style={{ width: "100vw", height: "100vh", display: "flex", overflow: "hidden", background: "#FFFAF5" }}>
      <style>{CSS}</style>

      {/* ============ LEFT PANEL — fixed 468px ============ */}
      <div style={{ width: 468, minWidth: 468, height: "100%", background: "#FFFAF5", display: "flex", flexDirection: "column" }}>
        {/* header: logo / title / actions at spec positions */}
        <div style={{ position: "relative", height: 175, flexShrink: 0 }}>
          <div style={{ position: "absolute", left: 40, top: 30 }}
            dangerouslySetInnerHTML={{ __html: LOGO_SVG }} />
          <div className="cwsm-title" style={{ position: "absolute", left: 39, top: 70 }}>Shape Maker</div>
          <div style={{ position: "absolute", left: 41, top: 126, display: "flex", gap: 8 }}>
            <button className="cwsm-btn" style={{ background: "#B0CB43" }}
              onClick={() => { setParams(randomParams(params.ratio)); setApplied(null); }}>Shuffle</button>
            <button className="cwsm-btn" style={{ background: "#B5DBF4" }}
              onClick={() => { setParams({ ...JSON.parse(JSON.stringify(DEFAULT_PARAMS)), ratio: params.ratio, color: params.color }); setApplied(null); }}>Reset</button>
          </div>
        </div>

        {/* scrolling controls */}
        <div className="cwsm-scroll" style={{ flex: 1, overflowY: "auto", paddingLeft: 40, paddingRight: 40 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 22, width: 388, paddingBottom: 16 }}>
            <Group label="Start from a classic">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {PRESET_ORDER.map((name) => (
                  <Chip key={name} label={name} active={applied === name} onClick={() => applyPreset(name)} />
                ))}
              </div>
            </Group>

            <Group label="Format">
              <ChipRow value={params.ratio} onChange={setRatio}
                options={Object.keys(RATIOS).map((r) => ({ v: r, label: r }))} />
            </Group>

            <Group label="Colour">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, width: 210 }}>
                {UI_COLORS.map((c) => (
                  <button key={c.hex} title={c.name}
                    className={"cwsm-swatch" + (params.color === c.hex ? " selected" : "")}
                    style={{ background: c.hex }} onClick={() => set({ color: c.hex })} />
                ))}
              </div>
            </Group>

            <Group label="Edge" locked={locked("edge")}>
              <ChipRow value={params.edge.type} options={edgeOptions}
                onChange={(v) => setCat("edge", { type: v, count: v === "scallops" && !scallopCounts.includes(params.edge.count) ? scallopCounts[0] : params.edge.count })} />
              {params.edge.type !== "none" && (
                <div style={subRow}>
                  <span className="cwsm-sublabel">Position</span>
                  <ChipRow value={params.edge.side} onChange={(v) => setCat("edge", { side: v })}
                    options={[{ v: "top", label: "Top" }, { v: "bottom", label: "Bottom" }]} />
                  {(params.edge.type === "scallops" || params.edge.type === "bites") && (
                    <>
                      <span className="cwsm-sublabel" style={{ width: "auto", marginLeft: 8 }}>Count</span>
                      <Stepper value={params.edge.count}
                        options={params.edge.type === "scallops" ? scallopCounts : [1, 2, 3]}
                        onChange={(v) => setCat("edge", { count: v })} />
                    </>
                  )}
                </div>
              )}
              {params.edge.type !== "none" && params.edge.type !== "scallops" && params.edge.type !== "dome" && (
                <SizeControl value={params.edge.size} onChange={(v) => setCat("edge", { size: v })} />
              )}
            </Group>

            <Group label="Corners" locked={locked("corners")}>
              <ChipRow value={params.corners.style} onChange={(v) => setCat("corners", { style: v })}
                options={[{ v: "none", label: "None" }, { v: "round", label: "Round" }, { v: "chamfer", label: "Chamfer" }]} />
              {params.corners.style !== "none" && (
                <div style={subRow}>
                  <span className="cwsm-sublabel">Which</span>
                  <ChipRow value={params.corners.which} onChange={(v) => setCat("corners", { which: v })}
                    options={[{ v: "all", label: "All" }, { v: "top", label: "Top" }, { v: "bottom", label: "Bottom" }]} />
                </div>
              )}
              {params.corners.style !== "none" && (
                <SizeControl value={params.corners.size} onChange={(v) => setCat("corners", { size: v })} />
              )}
            </Group>

            <Group label="Sides" locked={locked("sides")}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ChipRow value={params.sides.type} options={sideOptions}
                  onChange={(v) => setCat("sides", { type: v })} />
                {params.sides.type === "stack" && (
                  <Stepper value={params.sides.count} options={[2, 3, 4]}
                    onChange={(v) => setCat("sides", { count: v })} />
                )}
              </div>
              {params.sides.type !== "none" && (
                <SizeControl value={params.sides.size} onChange={(v) => setCat("sides", { size: v })} />
              )}
            </Group>

            <Group label="Hole" locked={locked("hole")}>
              <ChipRow value={params.hole.type} onChange={(v) => setCat("hole", { type: v })}
                options={[{ v: "none", label: "Off" }, { v: "circle", label: "Circle" }, { v: "square", label: "Square" }]} />
              {params.hole.type !== "none" && (
                <SizeControl value={params.hole.size} onChange={(v) => setCat("hole", { size: v })} />
              )}
            </Group>
          </div>
        </div>

        {/* footer: exports always visible */}
        <div style={{ flexShrink: 0, padding: "10px 0 30px 41px", display: "flex", gap: 8, background: "#FFFAF5" }}>
          <button className="cwsm-btn" style={{ background: "#B0CB43" }} onClick={() => exportSVG(params)}>Export SVG</button>
          <button className="cwsm-btn" style={{ background: "#B5DBF4" }} onClick={() => exportPNG(params)}>Export PNG</button>
        </div>
      </div>

      {/* ============ RIGHT: FLUID PREVIEW ============ */}
      <div style={{
        flex: 1, height: "100%", minWidth: 0, background: bg, transition: "background .2s",
        position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ position: "absolute", top: 30, right: 40, display: "flex", gap: 4 }}>
          {[["#FFFAF5", "Linen"], ["#191814", "Charcoal"], ["#CCCBCA", "Concrete"]].map(([hex, name]) => (
            <button key={hex} title={name} className={"cwsm-swatch" + (bg === hex ? " selected" : "")}
              style={{ background: hex }} onClick={() => setBg(hex)} />
          ))}
        </div>
        <div style={{
          width: "58%", height: "62%", minWidth: 200,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
          dangerouslySetInnerHTML={{ __html: svg.replace("<svg ", '<svg style="max-width:100%;max-height:100%;width:auto;height:auto" ') }} />
      </div>
    </div>
  );
}
