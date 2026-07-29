import { useState } from "react";
import { PanelCard, PanelPageHeader, PanelSelect, PanelToast, PanelToggle } from "../components/ui";

export default function AntiRaidPage() {
  const [enabled, setEnabled] = useState(true);
  const [joinLimit, setJoinLimit] = useState(8);
  const [windowSec, setWindowSec] = useState(10);
  const [action, setAction] = useState("lockdown");
  const [toast, setToast] = useState<string | null>(null);

  function save() {
    setToast("Anti-raid nustatymai išsaugoti");
    window.setTimeout(() => setToast(null), 2200);
  }

  return (
    <div className="panel-page">
      <PanelPageHeader
        title="Anti-raid apsauga"
        lead="Apsaugokite serverį nuo masinių joinų ir raidų."
      />

      <div className="panel-grid-2">
        <PanelCard title="Būsena">
          <div className="panel-list-item">
            <div>
              <strong>Anti-raid</strong>
              <span>{enabled ? "Apsauga aktyvi" : "Išjungta"}</span>
            </div>
            <PanelToggle
              on={enabled}
              onToggle={() => setEnabled((v) => !v)}
              label="Anti-raid įjungimas"
            />
          </div>
        </PanelCard>

        <PanelCard title="Parametrai">
          <div className="panel-form">
            <div className="panel-field">
              <label htmlFor="join-limit">Max joinų</label>
              <input
                id="join-limit"
                className="panel-input"
                type="number"
                min={1}
                max={50}
                value={joinLimit}
                onChange={(e) => setJoinLimit(Number(e.target.value))}
                disabled={!enabled}
              />
            </div>
            <div className="panel-field">
              <label htmlFor="window">Laiko langas (sek.)</label>
              <input
                id="window"
                className="panel-input"
                type="number"
                min={5}
                max={120}
                value={windowSec}
                onChange={(e) => setWindowSec(Number(e.target.value))}
                disabled={!enabled}
              />
            </div>
            <div className="panel-field">
              <label htmlFor="action">Veiksmas</label>
              <PanelSelect
                id="action"
                aria-label="Veiksmas"
                value={action}
                disabled={!enabled}
                options={[
                  { value: "lockdown", label: "Lockdown" },
                  { value: "kick", label: "Kick naujus" },
                  { value: "ban", label: "Ban naujus" },
                ]}
                onChange={setAction}
              />
            </div>
            <button
              type="button"
              className="panel-btn panel-btn--primary"
              onClick={save}
              disabled={!enabled}
            >
              Išsaugoti
            </button>
          </div>
        </PanelCard>
      </div>

      <PanelCard title="Paskutiniai incidentai">
        <div className="panel-list">
          <div className="panel-list-item">
            <div>
              <strong>Įtartinas join spike</strong>
              <span>12 joinų per 8 sek. · prieš 3 d.</span>
            </div>
            <span className="panel-badge">Sustabdyta</span>
          </div>
          <div className="panel-list-item">
            <div>
              <strong>Invite flood</strong>
              <span>#general · prieš 9 d.</span>
            </div>
            <span className="panel-badge">Filtruota</span>
          </div>
        </div>
      </PanelCard>

      <PanelToast message={toast} />
    </div>
  );
}
