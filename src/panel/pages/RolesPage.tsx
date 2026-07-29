import { useState } from "react";
import { INITIAL_ROLES } from "../data/mock";
import { PanelCard, PanelPageHeader, PanelToast } from "../components/ui";

type Role = {
  id: string;
  name: string;
  members: number;
  color: string;
};

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES.map((r) => ({ ...r })));
  const [name, setName] = useState("");
  const [color, setColor] = useState("#6b4eff");
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }

  function addRole() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setRoles((prev) => [
      { id: `role-${Date.now()}`, name: trimmed, members: 0, color },
      ...prev,
    ]);
    setName("");
    showToast("Rolė pridėta");
  }

  function removeRole(id: string) {
    setRoles((prev) => prev.filter((r) => r.id !== id));
    showToast("Rolė pašalinta");
  }

  return (
    <div className="panel-page">
      <PanelPageHeader
        title="Rolių valdymas"
        lead="Tvarkykite serverio roles ir jų spalvas."
      />

      <PanelCard title="Rolės">
        <div className="panel-list">
          {roles.map((role) => (
            <div key={role.id} className="panel-list-item">
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span
                  aria-hidden="true"
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: role.color,
                    boxShadow: `0 0 10px ${role.color}88`,
                  }}
                />
                <div>
                  <strong>{role.name}</strong>
                  <span>{role.members} narių</span>
                </div>
              </div>
              <button
                type="button"
                className="panel-btn panel-btn--danger"
                onClick={() => removeRole(role.id)}
              >
                Šalinti
              </button>
            </div>
          ))}
        </div>
      </PanelCard>

      <PanelCard title="Pridėti rolę">
        <div className="panel-form">
          <div className="panel-field">
            <label htmlFor="role-name">Pavadinimas</label>
            <input
              id="role-name"
              className="panel-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Pvz. Helper"
            />
          </div>
          <div className="panel-field">
            <label htmlFor="role-color">Spalva</label>
            <input
              id="role-color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{ width: 56, height: 40, padding: 4, borderRadius: 10 }}
            />
          </div>
          <button type="button" className="panel-btn panel-btn--primary" onClick={addRole}>
            Pridėti rolę
          </button>
        </div>
      </PanelCard>

      <PanelToast message={toast} />
    </div>
  );
}
