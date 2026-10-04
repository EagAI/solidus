import { useEffect, useState } from "react";
import { loadPanelModules, savePanelModules, type PanelModules } from "../data/modules";
import { PanelCard, PanelPageHeader, PanelToast, PanelToggle } from "../components/ui";

export default function AutorolePage() {
  const [modules, setModules] = useState<PanelModules | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    loadPanelModules().then(setModules);
  }, []);

  if (!modules) return null;
  const autorole = modules.autorole;

  function patch(partial: Partial<PanelModules["autorole"]>) {
    setModules((prev) => (prev ? { ...prev, autorole: { ...prev.autorole, ...partial } } : prev));
  }

  async function save() {
    if (!modules) return;
    await savePanelModules(modules);
    setToast("Auto-rolė išsaugota");
    window.setTimeout(() => setToast(null), 2000);
  }

  return (
    <div className="panel-page">
      <PanelPageHeader
        title="Auto-rolė"
        lead="Rolė, kurią narys gauna prisijungęs. Valdoma čia, ne automatikos sąraše."
      />
      <PanelCard>
        <div className="panel-form">
          <div className="panel-list-item">
            <div>
              <strong>Auto-rolė</strong>
              <span>{autorole.enabled ? "Įjungta" : "Išjungta"}</span>
            </div>
            <PanelToggle on={autorole.enabled} onToggle={() => patch({ enabled: !autorole.enabled })} />
          </div>
          <div className="panel-field">
            <label htmlFor="auto-role">Rolės ID</label>
            <input
              id="auto-role"
              className="panel-input"
              value={autorole.roleId}
              disabled={!autorole.enabled}
              placeholder="Tuščia = NARYS_ROLE_ID iš .env"
              onChange={(e) => patch({ roleId: e.target.value.trim() })}
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
