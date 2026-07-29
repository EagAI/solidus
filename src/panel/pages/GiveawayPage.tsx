import { useState } from "react";
import { INITIAL_GIVEAWAYS } from "../data/mock";
import { PanelCard, PanelPageHeader, PanelToast } from "../components/ui";

type Giveaway = {
  id: string;
  prize: string;
  ends: string;
  entries: number;
  active: boolean;
};

export default function GiveawayPage() {
  const [items, setItems] = useState<Giveaway[]>(
    INITIAL_GIVEAWAYS.map((g) => ({ ...g })),
  );
  const [prize, setPrize] = useState("");
  const [ends, setEnds] = useState("2026-08-15");
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }

  function create() {
    if (!prize.trim()) return;
    setItems((prev) => [
      {
        id: `g-${Date.now()}`,
        prize: prize.trim(),
        ends,
        entries: 0,
        active: true,
      },
      ...prev,
    ]);
    setPrize("");
    showToast("Giveaway sukurtas");
  }

  function endGiveaway(id: string) {
    setItems((prev) =>
      prev.map((g) => (g.id === id ? { ...g, active: false } : g)),
    );
    showToast("Giveaway baigtas");
  }

  return (
    <div className="panel-page">
      <PanelPageHeader
        title="Giveaway"
        lead="Kurkite ir valdykite prizų traukimus."
      />

      <PanelCard title="Naujas giveaway">
        <div className="panel-form">
          <div className="panel-field">
            <label htmlFor="prize">Prizas</label>
            <input
              id="prize"
              className="panel-input"
              value={prize}
              onChange={(e) => setPrize(e.target.value)}
              placeholder="Pvz. Discord Nitro"
            />
          </div>
          <div className="panel-field">
            <label htmlFor="ends">Pabaiga</label>
            <input
              id="ends"
              className="panel-input"
              type="date"
              value={ends}
              onChange={(e) => setEnds(e.target.value)}
            />
          </div>
          <button type="button" className="panel-btn panel-btn--primary" onClick={create}>
            Sukurti
          </button>
        </div>
      </PanelCard>

      <PanelCard title="Aktyvūs / archyvas">
        <div className="panel-list">
          {items.map((g) => (
            <div key={g.id} className="panel-list-item">
              <div>
                <strong>{g.prize}</strong>
                <span>
                  {g.entries} dalyvių · iki {g.ends} ·{" "}
                  {g.active ? "Aktyvus" : "Baigtas"}
                </span>
              </div>
              {g.active ? (
                <button
                  type="button"
                  className="panel-btn panel-btn--ghost"
                  onClick={() => endGiveaway(g.id)}
                >
                  Baigti
                </button>
              ) : (
                <span className="panel-badge">Archyvas</span>
              )}
            </div>
          ))}
        </div>
      </PanelCard>

      <PanelToast message={toast} />
    </div>
  );
}
