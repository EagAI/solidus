import { useEffect, useState } from "react";
import {
  loadPanelModules,
  savePanelModules,
  type PanelModules,
} from "../data/modules";
import { PanelCard, PanelPageHeader, PanelToast, PanelToggle } from "../components/ui";
import "./EntrancePage.css";

export default function EntrancePage() {
  const [modules, setModules] = useState<PanelModules | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    loadPanelModules().then(setModules);
  }, []);

  if (!modules) return null;
  const entrance = modules.entrance;

  function patch(partial: Partial<PanelModules["entrance"]>) {
    setModules((prev) =>
      prev ? { ...prev, entrance: { ...prev.entrance, ...partial } } : prev,
    );
  }

  async function save() {
    if (!modules) return;
    await savePanelModules(modules);
    setToast("Entrance išsaugotas");
    window.setTimeout(() => setToast(null), 2200);
  }

  return (
    <div className="panel-page">
      <PanelPageHeader
        title="Entrance"
        lead="Tai ir yra welcome. Stilius, kanalas ir ar sveikinimas siunčiamas. Goodbye ir auto-rolė yra šalia, po Prisijungimas."
      />

      <PanelCard>
        <div className="panel-list-item">
          <div>
            <strong>Entrance</strong>
            <span>{entrance.enabled ? "Įjungtas" : "Išjungtas — botas nesiunčia sveikinimo"}</span>
          </div>
          <PanelToggle
            on={entrance.enabled}
            onToggle={() => patch({ enabled: !entrance.enabled })}
            label="Entrance"
          />
        </div>
      </PanelCard>

      <div className="entrance__choices">
        <button
          type="button"
          className={"entrance__choice" + (entrance.style === "banner" ? " is-active" : "")}
          onClick={() => patch({ style: "banner" })}
        >
          <div className="entrance__banner" aria-hidden="true">
            <span className="entrance__avatar" />
            <span>
              <strong>Sveiki</strong>
              <em>Narys prisijungė</em>
            </span>
          </div>
          <p>Banneris</p>
        </button>
        <button
          type="button"
          className={"entrance__choice" + (entrance.style === "card" ? " is-active" : "")}
          onClick={() => patch({ style: "card" })}
        >
          <div className="entrance__card" aria-hidden="true">
            <span className="entrance__avatar entrance__avatar--lg" />
            <strong>Vardas</strong>
            <em>Sveiki atvykę!</em>
          </div>
          <p>Kortelė</p>
        </button>
      </div>

      <PanelCard title="Kanalas">
        <div className="panel-field">
          <label htmlFor="welcome-ch">Welcome kanalo ID</label>
          <input
            id="welcome-ch"
            className="panel-input"
            value={entrance.channelId}
            placeholder="Tuščia = WELCOME_CHANNEL_ID iš .env"
            onChange={(e) => patch({ channelId: e.target.value.trim() })}
          />
        </div>
        <button type="button" className="panel-btn panel-btn--primary" onClick={save}>
          Išsaugoti
        </button>
      </PanelCard>
      <PanelToast message={toast} />
    </div>
  );
}
