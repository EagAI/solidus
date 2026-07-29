import { useState } from "react";
import { INITIAL_VOICE } from "../data/mock";
import { PanelCard, PanelPageHeader, PanelToast, PanelToggle } from "../components/ui";

type Channel = {
  id: string;
  name: string;
  users: number;
  limit: number;
};

export default function VoicePage() {
  const [channels, setChannels] = useState<Channel[]>(
    INITIAL_VOICE.map((v) => ({ ...v })),
  );
  const [autoCreate, setAutoCreate] = useState(true);
  const [name, setName] = useState("");
  const [limit, setLimit] = useState(10);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }

  function addChannel() {
    if (!name.trim()) return;
    setChannels((prev) => [
      {
        id: `v-${Date.now()}`,
        name: name.trim(),
        users: 0,
        limit,
      },
      ...prev,
    ]);
    setName("");
    showToast("Balso kanalas pridėtas");
  }

  function remove(id: string) {
    setChannels((prev) => prev.filter((c) => c.id !== id));
    showToast("Kanalas pašalintas");
  }

  return (
    <div className="panel-page">
      <PanelPageHeader
        title="Balso kanalai"
        lead="Valdykite voice lobby ir auto-create kanalus."
      />

      <PanelCard title="Nustatymai">
        <div className="panel-list-item">
          <div>
            <strong>Auto-create kanalai</strong>
            <span>Sukuria laikinus voice kambarius</span>
          </div>
          <PanelToggle
            on={autoCreate}
            onToggle={() => setAutoCreate((v) => !v)}
            label="Auto-create"
          />
        </div>
      </PanelCard>

      <PanelCard title="Kanalai">
        <div className="panel-list">
          {channels.map((ch) => (
            <div key={ch.id} className="panel-list-item">
              <div>
                <strong>{ch.name}</strong>
                <span>
                  {ch.users}
                  {ch.limit > 0 ? ` / ${ch.limit}` : ""} narių
                </span>
              </div>
              <button
                type="button"
                className="panel-btn panel-btn--danger"
                onClick={() => remove(ch.id)}
              >
                Šalinti
              </button>
            </div>
          ))}
        </div>
      </PanelCard>

      <PanelCard title="Pridėti kanalą">
        <div className="panel-form">
          <div className="panel-field">
            <label htmlFor="voice-name">Pavadinimas</label>
            <input
              id="voice-name"
              className="panel-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="panel-field">
            <label htmlFor="voice-limit">Limitas (0 = be limito)</label>
            <input
              id="voice-limit"
              className="panel-input"
              type="number"
              min={0}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            />
          </div>
          <button type="button" className="panel-btn panel-btn--primary" onClick={addChannel}>
            Pridėti
          </button>
        </div>
      </PanelCard>

      <PanelToast message={toast} />
    </div>
  );
}
