import { useState } from "react";
import { PanelCard, PanelPageHeader, PanelSelect, PanelToast } from "../components/ui";

export default function SettingsPage() {
  const [prefix, setPrefix] = useState("!");
  const [locale, setLocale] = useState("lt");
  const [logChannel, setLogChannel] = useState("#mod-logs");
  const [welcome, setWelcome] = useState("Sveiki atvykę į Solidus HQ!");
  const [toast, setToast] = useState<string | null>(null);

  function save() {
    setToast("Nustatymai išsaugoti (mock)");
    window.setTimeout(() => setToast(null), 2200);
  }

  return (
    <div className="panel-page">
      <PanelPageHeader
        title="Serverio nustatymai"
        lead="Pagrindiniai boto ir serverio parametrai. Pakeitimai saugomi tik lokaliai."
      />

      <PanelCard title="Bendri">
        <div className="panel-form">
          <div className="panel-field">
            <label htmlFor="prefix">Komandų prefix</label>
            <input
              id="prefix"
              className="panel-input"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              maxLength={3}
            />
          </div>
          <div className="panel-field">
            <label htmlFor="locale">Kalba</label>
            <PanelSelect
              id="locale"
              aria-label="Kalba"
              value={locale}
              options={[
                { value: "lt", label: "Lietuvių" },
                { value: "en", label: "English" },
              ]}
              onChange={setLocale}
            />
          </div>
          <div className="panel-field">
            <label htmlFor="log-channel">Log kanalas</label>
            <input
              id="log-channel"
              className="panel-input"
              value={logChannel}
              onChange={(e) => setLogChannel(e.target.value)}
            />
          </div>
          <div className="panel-field">
            <label htmlFor="welcome">Welcome žinutė</label>
            <textarea
              id="welcome"
              className="panel-textarea"
              value={welcome}
              onChange={(e) => setWelcome(e.target.value)}
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
