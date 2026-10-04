import { useEffect, useState } from "react";
import { loadPanelModules, savePanelModules, type PanelModules } from "../data/modules";
import { PanelCard, PanelToast } from "../components/ui";

export default function LevelsLook() {
  const [modules, setModules] = useState<PanelModules | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    loadPanelModules().then(setModules);
  }, []);

  if (!modules) return null;

  const accent = /^#[0-9a-fA-F]{6}$/.test(modules.leaderboard.accent)
    ? modules.leaderboard.accent
    : "#f26522";

  async function save(next: PanelModules) {
    setModules(next);
    await savePanelModules(next);
    setToast("Išsaugota");
    window.setTimeout(() => setToast(null), 1800);
  }

  return (
    <>
      <PanelCard title="Lygio kortelės fonas">
        <div className="panel-field">
          <label htmlFor="lvl-bg">Nuotraukos URL (jpg, png, webp)</label>
          <input
            id="lvl-bg"
            className="panel-input"
            value={modules.levels.backgroundUrl}
            placeholder="https://..."
            onChange={(e) =>
              setModules({
                ...modules,
                levels: { ...modules.levels, backgroundUrl: e.target.value },
              })
            }
          />
        </div>
        {modules.levels.backgroundUrl ? (
          <img
            src={modules.levels.backgroundUrl}
            alt="Lygio fono peržiūra"
            style={{
              marginTop: 12,
              width: "100%",
              maxHeight: 160,
              objectFit: "cover",
              borderRadius: 12,
              border: "1px solid var(--panel-line)",
            }}
          />
        ) : null}
        <button
          type="button"
          className="panel-btn panel-btn--primary"
          style={{ marginTop: 12 }}
          onClick={() => save(modules)}
        >
          Išsaugoti foną
        </button>
      </PanelCard>

      <PanelCard title="Lyderių lentelės spalva">
        <div className="panel-field">
          <label htmlFor="lb-hex">Hex</label>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              id="lb-color"
              type="color"
              value={accent}
              onChange={(e) =>
                setModules({
                  ...modules,
                  leaderboard: { ...modules.leaderboard, accent: e.target.value },
                })
              }
              style={{ width: 48, height: 40, padding: 4, borderRadius: 8 }}
            />
            <input
              id="lb-hex"
              className="panel-input"
              value={modules.leaderboard.accent}
              onChange={(e) =>
                setModules({
                  ...modules,
                  leaderboard: { ...modules.leaderboard, accent: e.target.value },
                })
              }
            />
          </div>
        </div>
        <div
          style={{
            marginTop: 14,
            borderRadius: 12,
            overflow: "hidden",
            borderLeft: `6px solid ${accent}`,
            background: "#1a1614",
            color: "#fff",
            padding: "12px 14px",
          }}
        >
          {["kai#88", "mira#1200", "nova#4421"].map((name, i) => (
            <div
              key={name}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderTop: i ? "1px solid rgba(255,255,255,0.08)" : undefined,
              }}
            >
              <span>
                <b style={{ color: accent, marginRight: 8 }}>{i + 1}</b>
                {name}
              </span>
              <span style={{ color: accent }}>L{42 - i * 4}</span>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="panel-btn panel-btn--primary"
          style={{ marginTop: 12 }}
          onClick={() => save(modules)}
        >
          Išsaugoti spalvą
        </button>
      </PanelCard>
      <PanelToast message={toast} />
    </>
  );
}
