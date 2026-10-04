import { useEffect, useState } from "react";
import { loadPanelModules, savePanelModules, type PanelModules } from "../data/modules";
import { PanelCard, PanelPageHeader, PanelToast, PanelToggle } from "../components/ui";
import TicketsHistory from "./TicketsHistory";

type TicketSection = "nustatymai" | "istorija";

const COPY: Record<TicketSection, { title: string; lead: string }> = {
  nustatymai: {
    title: "Tiketų nustatymai",
    lead: "Įjungimas, kategorijos, skydelio tekstas ir staff rolės.",
  },
  istorija: {
    title: "Tiketų istorija",
    lead: "Atidaryti ir uždaryti tiketai su vieša Discord nuoroda.",
  },
};

export default function TicketsPage({ section }: { section: TicketSection }) {
  const [modules, setModules] = useState<PanelModules | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [subName, setSubName] = useState("");

  useEffect(() => {
    loadPanelModules().then(setModules);
  }, []);

  if (!modules) return null;
  const tickets = modules.tickets;

  function patch(partial: Partial<PanelModules["tickets"]>) {
    setModules((prev) =>
      prev ? { ...prev, tickets: { ...prev.tickets, ...partial } } : prev,
    );
  }

  async function save(next = modules) {
    if (!next) return;
    setModules(next);
    await savePanelModules(next);
    setToast("Tiketų nustatymai išsaugoti");
    window.setTimeout(() => setToast(null), 2200);
  }

  function addSubcategory() {
    const name = subName.trim();
    if (!name || !modules) return;
    const next: PanelModules = {
      ...modules,
      tickets: {
        ...modules.tickets,
        subcategories: [
          ...modules.tickets.subcategories,
          { id: `sub-${Date.now()}`, name },
        ],
      },
    };
    setSubName("");
    void save(next);
  }

  function removeSubcategory(id: string) {
    if (!modules) return;
    const next: PanelModules = {
      ...modules,
      tickets: {
        ...modules.tickets,
        subcategories: modules.tickets.subcategories.filter((item) => item.id !== id),
      },
    };
    void save(next);
  }

  return (
    <div className="panel-page">
      <PanelPageHeader title={COPY[section].title} lead={COPY[section].lead} />

      {section === "nustatymai" ? (
        <>
          <PanelCard>
            <div className="panel-list-item">
              <div>
                <strong>Tiketai</strong>
                <span>{tickets.enabled ? "Įjungti" : "Išjungti"}</span>
              </div>
              <PanelToggle
                on={tickets.enabled}
                onToggle={() => patch({ enabled: !tickets.enabled })}
                label="Tiketai"
              />
            </div>
          </PanelCard>

          <PanelCard title="Skydelio tekstas">
            <div className="panel-form">
              <div className="panel-field">
                <label htmlFor="ticket-title">Antraštė</label>
                <input
                  id="ticket-title"
                  className="panel-input"
                  value={tickets.title}
                  disabled={!tickets.enabled}
                  onChange={(e) => patch({ title: e.target.value })}
                />
              </div>
              <div className="panel-field">
                <label htmlFor="ticket-desc">Aprašymas</label>
                <textarea
                  id="ticket-desc"
                  className="panel-textarea"
                  value={tickets.description}
                  disabled={!tickets.enabled}
                  onChange={(e) => patch({ description: e.target.value })}
                />
              </div>
            </div>
          </PanelCard>

          <PanelCard title="Kanalai ir rolės">
            <div className="panel-form">
              <div className="panel-field">
                <label htmlFor="ticket-cat">Discord kategorijos ID</label>
                <input
                  id="ticket-cat"
                  className="panel-input"
                  value={tickets.categoryId}
                  placeholder="Kur kuriami ticket kanalai"
                  disabled={!tickets.enabled}
                  onChange={(e) => patch({ categoryId: e.target.value.trim() })}
                />
              </div>
              <div className="panel-field">
                <label htmlFor="ticket-staff">Staff rolių ID</label>
                <input
                  id="ticket-staff"
                  className="panel-input"
                  value={tickets.staffRoleIds}
                  placeholder="Keli ID per kablelį"
                  disabled={!tickets.enabled}
                  onChange={(e) => patch({ staffRoleIds: e.target.value })}
                />
              </div>
              <button type="button" className="panel-btn panel-btn--primary" onClick={() => save()}>
                Išsaugoti
              </button>
            </div>
          </PanelCard>

          <PanelCard title="Kategorijos">
            <div className="panel-list">
              {tickets.subcategories.map((item) => (
                <div key={item.id} className="panel-list-item">
                  <strong>{item.name}</strong>
                  <button
                    type="button"
                    className="panel-btn panel-btn--danger"
                    onClick={() => removeSubcategory(item.id)}
                    disabled={!tickets.enabled}
                  >
                    Šalinti
                  </button>
                </div>
              ))}
            </div>
            <div className="panel-toolbar" style={{ marginTop: 12 }}>
              <input
                className="panel-input"
                value={subName}
                placeholder="Nauja kategorija"
                disabled={!tickets.enabled}
                onChange={(e) => setSubName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addSubcategory();
                }}
              />
              <button
                type="button"
                className="panel-btn panel-btn--ghost"
                onClick={addSubcategory}
                disabled={!tickets.enabled}
              >
                Pridėti
              </button>
            </div>
          </PanelCard>
        </>
      ) : null}

      {section === "istorija" ? <TicketsHistory /> : null}

      <PanelToast message={toast} />
    </div>
  );
}
