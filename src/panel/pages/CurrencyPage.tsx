import { useState } from "react";
import { PanelCard, PanelPageHeader, PanelToast, PanelToggle } from "../components/ui";

export default function CurrencyPage() {
  const [enabled, setEnabled] = useState(true);
  const [name, setName] = useState("SolidCoins");
  const [symbol, setSymbol] = useState("SC");
  const [daily, setDaily] = useState(100);
  const [toast, setToast] = useState<string | null>(null);

  const wallets = [
    { user: "kai#88", balance: 12400 },
    { user: "mira#1200", balance: 9800 },
    { user: "nova#4421", balance: 6400 },
  ];

  function save() {
    setToast("Valiutos nustatymai išsaugoti");
    window.setTimeout(() => setToast(null), 2200);
  }

  return (
    <div className="panel-page">
      <PanelPageHeader
        title="Valiuta"
        lead="Serverio ekonomikos valiuta ir kasdieniai atlygiai."
      />

      <div className="panel-grid-2">
        <PanelCard title="Nustatymai">
          <div className="panel-form">
            <div className="panel-list-item">
              <div>
                <strong>Ekonomika</strong>
                <span>{enabled ? "Aktyvi" : "Išjungta"}</span>
              </div>
              <PanelToggle on={enabled} onToggle={() => setEnabled((v) => !v)} />
            </div>
            <div className="panel-field">
              <label htmlFor="cur-name">Pavadinimas</label>
              <input
                id="cur-name"
                className="panel-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!enabled}
              />
            </div>
            <div className="panel-field">
              <label htmlFor="cur-symbol">Simbolis</label>
              <input
                id="cur-symbol"
                className="panel-input"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                disabled={!enabled}
              />
            </div>
            <div className="panel-field">
              <label htmlFor="daily">Daily atlygis</label>
              <input
                id="daily"
                className="panel-input"
                type="number"
                value={daily}
                onChange={(e) => setDaily(Number(e.target.value))}
                disabled={!enabled}
              />
            </div>
            <button type="button" className="panel-btn panel-btn--primary" onClick={save}>
              Išsaugoti
            </button>
          </div>
        </PanelCard>

        <PanelCard title={`Turtingiausi (${symbol})`}>
          <div className="panel-list">
            {wallets.map((w) => (
              <div key={w.user} className="panel-list-item">
                <strong>{w.user}</strong>
                <span>
                  {w.balance.toLocaleString()} {symbol}
                </span>
              </div>
            ))}
          </div>
        </PanelCard>
      </div>

      <PanelToast message={toast} />
    </div>
  );
}
