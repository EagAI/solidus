import { useState } from "react";
import { INITIAL_AUTOMATION } from "../data/mock";
import { PanelPageHeader, PanelToast, PanelToggle } from "../components/ui";

type Rule = {
  id: string;
  name: string;
  trigger: string;
  enabled: boolean;
};

export default function AutomationPage() {
  const [rules, setRules] = useState<Rule[]>(INITIAL_AUTOMATION.map((r) => ({ ...r })));
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editTrigger, setEditTrigger] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }

  function toggle(id: string) {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
    );
  }

  function startEdit(rule: Rule) {
    setEditing(rule.id);
    setEditName(rule.name);
    setEditTrigger(rule.trigger);
  }

  function saveEdit() {
    if (!editing) return;
    setRules((prev) =>
      prev.map((r) =>
        r.id === editing
          ? { ...r, name: editName.trim() || r.name, trigger: editTrigger.trim() || r.trigger }
          : r,
      ),
    );
    setEditing(null);
    showToast("Taisyklė atnaujinta");
  }

  return (
    <div className="panel-page">
      <PanelPageHeader
        title="Automatika"
        lead="Automatinės taisyklės narių prisijungimui, rolėms ir įvykiams."
      />

      <div className="panel-list">
        {rules.map((rule) => (
          <article key={rule.id} className="panel-list-item" style={{ flexWrap: "wrap" }}>
            {editing === rule.id ? (
              <div className="panel-form" style={{ flex: 1, minWidth: 220 }}>
                <input
                  className="panel-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <input
                  className="panel-input"
                  value={editTrigger}
                  onChange={(e) => setEditTrigger(e.target.value)}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" className="panel-btn panel-btn--primary" onClick={saveEdit}>
                    Išsaugoti
                  </button>
                  <button
                    type="button"
                    className="panel-btn panel-btn--ghost"
                    onClick={() => setEditing(null)}
                  >
                    Atšaukti
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <strong>{rule.name}</strong>
                <span>Trigger: {rule.trigger}</span>
              </div>
            )}
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {editing !== rule.id ? (
                <button
                  type="button"
                  className="panel-btn panel-btn--ghost"
                  onClick={() => startEdit(rule)}
                >
                  Redaguoti
                </button>
              ) : null}
              <PanelToggle
                on={rule.enabled}
                onToggle={() => toggle(rule.id)}
                label={`${rule.name} įjungimas`}
              />
            </div>
          </article>
        ))}
      </div>

      <PanelToast message={toast} />
    </div>
  );
}
