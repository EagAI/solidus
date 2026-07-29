import { useState } from "react";
import { INITIAL_WARNINGS } from "../data/mock";
import { PanelCard, PanelPageHeader, PanelToast } from "../components/ui";

type Warning = {
  id: string;
  user: string;
  reason: string;
  by: string;
  date: string;
};

export default function WarningsPage() {
  const [warnings, setWarnings] = useState<Warning[]>(
    INITIAL_WARNINGS.map((w) => ({ ...w })),
  );
  const [user, setUser] = useState("");
  const [reason, setReason] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }

  function addWarning() {
    if (!user.trim() || !reason.trim()) return;
    setWarnings((prev) => [
      {
        id: `w-${Date.now()}`,
        user: user.trim(),
        reason: reason.trim(),
        by: "EagWasTaken",
        date: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ]);
    setUser("");
    setReason("");
    showToast("Įspėjimas išduotas");
  }

  function removeWarning(id: string) {
    setWarnings((prev) => prev.filter((w) => w.id !== id));
    showToast("Įspėjimas pašalintas");
  }

  return (
    <div className="panel-page">
      <PanelPageHeader
        title="Įspėjimai"
        lead="Peržiūrėkite ir išduokite narių įspėjimus."
      />

      <PanelCard title="Naujas įspėjimas">
        <div className="panel-form">
          <div className="panel-field">
            <label htmlFor="warn-user">Narys</label>
            <input
              id="warn-user"
              className="panel-input"
              placeholder="user#0000"
              value={user}
              onChange={(e) => setUser(e.target.value)}
            />
          </div>
          <div className="panel-field">
            <label htmlFor="warn-reason">Priežastis</label>
            <input
              id="warn-reason"
              className="panel-input"
              placeholder="Kodėl įspėjama"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <button type="button" className="panel-btn panel-btn--primary" onClick={addWarning}>
            Išduoti įspėjimą
          </button>
        </div>
      </PanelCard>

      <PanelCard title="Istorija">
        <div className="panel-table-wrap">
          <table className="panel-table">
            <thead>
              <tr>
                <th>Narys</th>
                <th>Priežastis</th>
                <th>Išdavė</th>
                <th>Data</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {warnings.map((w) => (
                <tr key={w.id}>
                  <td>{w.user}</td>
                  <td>{w.reason}</td>
                  <td>{w.by}</td>
                  <td>{w.date}</td>
                  <td>
                    <button
                      type="button"
                      className="panel-btn panel-btn--danger"
                      onClick={() => removeWarning(w.id)}
                    >
                      Šalinti
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PanelCard>

      <PanelToast message={toast} />
    </div>
  );
}
