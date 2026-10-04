import { useEffect, useState } from "react";
import "./TicketsHistory.css";
import { guildHeaders } from "../data/modules";

type TicketRow = {
  id: number;
  openerName: string;
  category: string;
  status: string;
  openedAt: number;
  closedAt: number | null;
  url: string;
};

type TicketMessage = {
  id: number;
  authorName: string;
  bot: boolean;
  content: string;
  createdAt: number;
};

function formatTime(ms: number) {
  if (!ms) return "";
  return new Date(ms).toLocaleString("lt-LT", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TicketsHistory() {
  const [status, setStatus] = useState<"all" | "open" | "closed">("all");
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    fetch(`/api/tickets?status=${status}`, { headers: guildHeaders(), credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error("db");
        return res.json() as Promise<{ tickets: TicketRow[] }>;
      })
      .then((data) => {
        if (cancel) return;
        setError(null);
        setTickets(data.tickets ?? []);
        setSelectedId((current) => {
          if (current && data.tickets?.some((row) => row.id === current)) return current;
          return data.tickets?.[0]?.id ?? null;
        });
      })
      .catch(() => {
        if (!cancel) {
          setTickets([]);
          setError("Duomenų bazė nepasiekiama. Paleisk Solidus botą.");
        }
      });
    return () => {
      cancel = true;
    };
  }, [status]);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }
    let cancel = false;
    fetch(`/api/tickets/${selectedId}`, { headers: guildHeaders(), credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error("missing");
        return res.json() as Promise<{ messages: TicketMessage[] }>;
      })
      .then((data) => {
        if (!cancel) setMessages(data.messages ?? []);
      })
      .catch(() => {
        if (!cancel) setMessages([]);
      });
    return () => {
      cancel = true;
    };
  }, [selectedId]);

  const selected = tickets.find((row) => row.id === selectedId) ?? null;

  return (
    <div className="ticket-history">
      <div className="ticket-history__list">
        <div className="ticket-history__filters">
          {(
            [
              ["all", "Visi"],
              ["open", "Atidaryti"],
              ["closed", "Uždaryti"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={status === id ? "is-active" : ""}
              onClick={() => setStatus(id)}
            >
              {label}
            </button>
          ))}
        </div>
        {error ? <p className="ticket-history__empty">{error}</p> : null}
        {!error && tickets.length === 0 ? (
          <p className="ticket-history__empty">Duomenų bazėje tiketų nėra.</p>
        ) : null}
        {tickets.map((ticket) => (
          <button
            key={ticket.id}
            type="button"
            className={
              "ticket-history__item" + (ticket.id === selectedId ? " is-active" : "")
            }
            onClick={() => setSelectedId(ticket.id)}
          >
            <strong>
              #{ticket.id} {ticket.openerName || "Narys"}
            </strong>
            <span>
              {ticket.category || "Bendra"} · {ticket.status === "open" ? "Atidarytas" : "Uždarytas"}
            </span>
          </button>
        ))}
      </div>

      <div className="discord-log">
        {selected ? (
          <>
            <div className="discord-log__head">
              <div>
                <strong>ticket-{String(selected.id).padStart(4, "0")}</strong>
                <span>
                  {selected.category || "Bendra"} · {formatTime(selected.openedAt)}
                </span>
              </div>
              {selected.url ? (
                <a href={selected.url} target="_blank" rel="noreferrer">
                  Discord
                </a>
              ) : null}
            </div>
            <div className="discord-log__chat">
              {messages.length === 0 ? (
                <p className="ticket-history__empty">Šiame tikete žinučių nėra.</p>
              ) : (
                messages.map((message) => (
                  <article key={message.id} className="discord-log__msg">
                    <div className="discord-log__avatar" aria-hidden="true">
                      {message.authorName.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <div className="discord-log__meta">
                        <strong>{message.authorName}</strong>
                        {message.bot ? <span className="discord-log__bot">BOT</span> : null}
                        <time>{formatTime(message.createdAt)}</time>
                      </div>
                      <p>{message.content}</p>
                    </div>
                  </article>
                ))
              )}
            </div>
          </>
        ) : (
          <p className="ticket-history__empty">Pasirink tiketą.</p>
        )}
      </div>
    </div>
  );
}
