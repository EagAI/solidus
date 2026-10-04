import { useEffect, useState } from "react";
import { loadPanelModules, savePanelModules, type PanelModules } from "../data/modules";
import { PanelCard, PanelPageHeader, PanelToast, PanelToggle } from "../components/ui";

export default function GoodbyePage() {
  const [modules, setModules] = useState<PanelModules | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    loadPanelModules().then(setModules);
  }, []);

  if (!modules) return null;
  const goodbye = modules.goodbye;

  function patch(partial: Partial<PanelModules["goodbye"]>) {
    setModules((prev) => (prev ? { ...prev, goodbye: { ...prev.goodbye, ...partial } } : prev));
  }

  async function save() {
    if (!modules) return;
    await savePanelModules(modules);
    setToast("Goodbye išsaugotas");
    window.setTimeout(() => setToast(null), 2000);
  }

  return (
    <div className="panel-page">
      <PanelPageHeader
        title="Goodbye"
        lead="Žinutė, kai narys išeina. Tas pats prisijungimo modulis kaip Entrance, ne atskira automatikos taisyklė."
      />
      <PanelCard>
        <div className="panel-form">
          <div className="panel-list-item">
            <div>
              <strong>Goodbye</strong>
              <span>{goodbye.enabled ? "Įjungta" : "Išjungta"}</span>
            </div>
            <PanelToggle on={goodbye.enabled} onToggle={() => patch({ enabled: !goodbye.enabled })} />
          </div>
          <div className="panel-field">
            <label htmlFor="bye-ch">Kanalo ID</label>
            <input
              id="bye-ch"
              className="panel-input"
              value={goodbye.channelId}
              disabled={!goodbye.enabled}
              placeholder="Tuščia = tas pats kaip entrance"
              onChange={(e) => patch({ channelId: e.target.value.trim() })}
            />
          </div>
          <div className="panel-field">
            <label htmlFor="bye-msg">Žinutė</label>
            <textarea
              id="bye-msg"
              className="panel-textarea"
              value={goodbye.message}
              disabled={!goodbye.enabled}
              onChange={(e) => patch({ message: e.target.value })}
            />
          </div>
          <button type="button" className="panel-btn panel-btn--primary" onClick={save}>
            Išsaugoti
          </button>
        </div>
      </PanelCard>
      <PanelToast message={toast} />
    </div>
  );
}
