import { useMemo, useState } from "react";
import { INITIAL_COMMANDS } from "../data/mock";
import { PanelCard, PanelPageHeader, PanelToast, PanelToggle } from "../components/ui";

type Command = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: string;
};

export default function CommandsPage() {
  const [commands, setCommands] = useState<Command[]>(
    INITIAL_COMMANDS.map((c) => ({ ...c })),
  );
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q),
    );
  }, [commands, query]);

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }

  function toggle(id: string) {
    setCommands((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)),
    );
  }

  function addCommand() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const cmdName = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    setCommands((prev) => [
      {
        id: `cmd-${Date.now()}`,
        name: cmdName,
        description: description.trim() || "Nauja komanda",
        enabled: true,
        category: "Bendra",
      },
      ...prev,
    ]);
    setName("");
    setDescription("");
    showToast("Komanda pridėta");
  }

  return (
    <div className="panel-page">
      <PanelPageHeader
        title="Komandos"
        lead="Įjunkite, išjunkite ir pridėkite botų komandas."
      />

      <PanelCard>
        <div className="panel-toolbar">
          <input
            className="panel-input"
            placeholder="Ieškoti komandos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="panel-table-wrap">
          <table className="panel-table">
            <thead>
              <tr>
                <th>Komanda</th>
                <th>Kategorija</th>
                <th>Aprašymas</th>
                <th>Būsena</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cmd) => (
                <tr key={cmd.id}>
                  <td>
                    <strong>{cmd.name}</strong>
                  </td>
                  <td>{cmd.category}</td>
                  <td>{cmd.description}</td>
                  <td>
                    <PanelToggle
                      on={cmd.enabled}
                      onToggle={() => toggle(cmd.id)}
                      label={`${cmd.name} įjungimas`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PanelCard>

      <PanelCard title="Pridėti komandą">
        <div className="panel-form">
          <div className="panel-field">
            <label htmlFor="cmd-name">Pavadinimas</label>
            <input
              id="cmd-name"
              className="panel-input"
              placeholder="/pvz"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="panel-field">
            <label htmlFor="cmd-desc">Aprašymas</label>
            <input
              id="cmd-desc"
              className="panel-input"
              placeholder="Ką komanda daro"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <button type="button" className="panel-btn panel-btn--primary" onClick={addCommand}>
            Pridėti komandą
          </button>
        </div>
      </PanelCard>

      <PanelToast message={toast} />
    </div>
  );
}
