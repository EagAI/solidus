import { useEffect, useState } from "react";
import {
  loadPanelModules,
  savePanelModules,
  type PanelModules,
} from "../data/modules";
import { PanelCard, PanelPageHeader, PanelToast, PanelToggle } from "../components/ui";

export default function ExtrasPage() {
  const [modules, setModules] = useState<PanelModules | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    loadPanelModules().then(setModules);
  }, []);

  if (!modules) return null;

  function patch<K extends keyof PanelModules>(key: K, partial: Partial<PanelModules[K]>) {
    setModules((prev) =>
      prev ? { ...prev, [key]: { ...prev[key], ...partial } } : prev,
    );
  }

  async function save() {
    if (!modules) return;
    await savePanelModules(modules);
    setToast("Išsaugota. Slap / parukom komandos atsinaujins perkrovus botą.");
    window.setTimeout(() => setToast(null), 2600);
  }

  return (
    <div className="panel-page">
      <PanelPageHeader
        title="Extras"
        lead="Įjunk tik tai, ko reikia. Išjungti moduliai neregistruoja komandų ir nesimaišo."
      />

      <PanelCard title="Parukom">
        <div className="panel-form">
          <div className="panel-list-item">
            <div>
              <strong>/parukom</strong>
              <span>Rūkalio kvietimas kanale</span>
            </div>
            <PanelToggle
              on={modules.parukom.enabled}
              onToggle={() => patch("parukom", { enabled: !modules.parukom.enabled })}
            />
          </div>
          <div className="panel-field">
            <label htmlFor="parukom-xp">XP už mygtuką</label>
            <input
              id="parukom-xp"
              className="panel-input"
              type="number"
              value={modules.parukom.xp}
              disabled={!modules.parukom.enabled}
              onChange={(e) => patch("parukom", { xp: Number(e.target.value) })}
            />
          </div>
          <div className="panel-field">
            <label htmlFor="parukom-role">Rūkalių rolės ID</label>
            <input
              id="parukom-role"
              className="panel-input"
              value={modules.parukom.roleId}
              disabled={!modules.parukom.enabled}
              onChange={(e) => patch("parukom", { roleId: e.target.value.trim() })}
            />
          </div>
        </div>
      </PanelCard>

      <PanelCard title="Slap">
        <div className="panel-form">
          <div className="panel-list-item">
            <div>
              <strong>/slap</strong>
              <span>GIF + timeout + XP bauda</span>
            </div>
            <PanelToggle
              on={modules.slap.enabled}
              onToggle={() => patch("slap", { enabled: !modules.slap.enabled })}
            />
          </div>
          <div className="panel-field">
            <label htmlFor="slap-gif">GIF nuoroda</label>
            <input
              id="slap-gif"
              className="panel-input"
              value={modules.slap.gifUrl}
              disabled={!modules.slap.enabled}
              onChange={(e) => patch("slap", { gifUrl: e.target.value })}
            />
          </div>
          <div className="panel-field">
            <label htmlFor="slap-min">Timeout (min)</label>
            <input
              id="slap-min"
              className="panel-input"
              type="number"
              value={modules.slap.timeoutMin}
              disabled={!modules.slap.enabled}
              onChange={(e) => patch("slap", { timeoutMin: Number(e.target.value) })}
            />
          </div>
          <div className="panel-field">
            <label htmlFor="slap-xp">XP bauda</label>
            <input
              id="slap-xp"
              className="panel-input"
              type="number"
              value={modules.slap.xpPenalty}
              disabled={!modules.slap.enabled}
              onChange={(e) => patch("slap", { xpPenalty: Number(e.target.value) })}
            />
          </div>
        </div>
      </PanelCard>

      <PanelCard title="Kiti moduliai">
        <div className="panel-list">
          {(
            [
              ["hitcar", "Hitcar"],
              ["jail", "Jail"],
              ["economy", "Ekonomika"],
            ] as const
          ).map(([id, label]) => (
            <div key={id} className="panel-list-item">
              <strong>{label}</strong>
              <PanelToggle
                on={modules.extras[id]}
                onToggle={() => patch("extras", { [id]: !modules.extras[id] })}
                label={label}
              />
            </div>
          ))}
        </div>
      </PanelCard>

      <button type="button" className="panel-btn panel-btn--primary" onClick={save}>
        Išsaugoti
      </button>
      <PanelToast message={toast} />
    </div>
  );
}
