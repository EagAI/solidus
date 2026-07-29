import { useState } from "react";
import { INITIAL_BLACKLIST } from "../data/mock";
import { PanelCard, PanelPageHeader, PanelToast } from "../components/ui";

type Entry = {
  id: string;
  word: string;
  addedBy: string;
  date: string;
};

export default function BlacklistPage() {
  const [entries, setEntries] = useState<Entry[]>(
    INITIAL_BLACKLIST.map((e) => ({ ...e })),
  );
  const [word, setWord] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }

  function addWord() {
    const trimmed = word.trim();
    if (!trimmed) return;
    setEntries((prev) => [
      {
        id: `b-${Date.now()}`,
        word: trimmed,
        addedBy: "EagWasTaken",
        date: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ]);
    setWord("");
    showToast("Žodis pridėtas");
  }

  function remove(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    showToast("Žodis pašalintas");
  }

  return (
    <div className="panel-page">
      <PanelPageHeader
        title="Žodžių juodasis sąrašas"
        lead="Blokuojami žodžiai ir frazės serverio chatuose."
      />

      <PanelCard title="Pridėti žodį">
        <div className="panel-toolbar">
          <input
            className="panel-input"
            placeholder="Žodis arba frazė"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addWord();
            }}
          />
          <button type="button" className="panel-btn panel-btn--primary" onClick={addWord}>
            Pridėti
          </button>
        </div>
      </PanelCard>

      <PanelCard title="Sąrašas">
        <div className="panel-table-wrap">
          <table className="panel-table">
            <thead>
              <tr>
                <th>Žodis</th>
                <th>Pridėjo</th>
                <th>Data</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <code>{entry.word}</code>
                  </td>
                  <td>{entry.addedBy}</td>
                  <td>{entry.date}</td>
                  <td>
                    <button
                      type="button"
                      className="panel-btn panel-btn--danger"
                      onClick={() => remove(entry.id)}
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
