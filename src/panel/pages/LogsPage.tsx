import { useMemo, useState } from "react";
import { INITIAL_LOGS } from "../data/mock";
import { PanelCard, PanelPageHeader, PanelSelect } from "../components/ui";

const EVENT_OPTIONS = [
  { value: "all", label: "Visi įvykiai" },
  { value: "MESSAGE_DELETE", label: "MESSAGE_DELETE" },
  { value: "MEMBER_BAN", label: "MEMBER_BAN" },
  { value: "ROLE_UPDATE", label: "ROLE_UPDATE" },
  { value: "COMMAND", label: "COMMAND" },
];

export default function LogsPage() {
  const [logs] = useState(() => INITIAL_LOGS.map((l) => ({ ...l })));
  const [query, setQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return logs.filter((log) => {
      if (eventFilter !== "all" && log.event !== eventFilter) return false;
      if (!q) return true;
      return (
        log.event.toLowerCase().includes(q) ||
        log.channel.toLowerCase().includes(q) ||
        log.detail.toLowerCase().includes(q)
      );
    });
  }, [logs, query, eventFilter]);

  return (
    <div className="panel-page">
      <PanelPageHeader
        title="Įrašų stebėjimas"
        lead="Serverio įvykių logai realiu laiku (mock)."
      />

      <PanelCard>
        <div className="panel-toolbar">
          <input
            className="panel-input"
            placeholder="Ieškoti..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div style={{ minWidth: 180 }}>
            <PanelSelect
              aria-label="Filtruoti įvykius"
              value={eventFilter}
              options={EVENT_OPTIONS}
              onChange={setEventFilter}
            />
          </div>
        </div>


        <div className="panel-table-wrap">
          <table className="panel-table">
            <thead>
              <tr>
                <th>Laikas</th>
                <th>Įvykis</th>
                <th>Kanalas</th>
                <th>Detalės</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="panel-empty">
                    Nėra įrašų
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id}>
                    <td>{log.time}</td>
                    <td>
                      <code>{log.event}</code>
                    </td>
                    <td>{log.channel}</td>
                    <td>{log.detail}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </PanelCard>
    </div>
  );
}
