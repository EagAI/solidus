import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  averageUptime,
  buildTimeline,
  STATUS_LABEL,
  useUptime,
  type DayStatus,
  type UptimeDay,
} from "../data/uptime";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";
import "./UptimePage.css";

function formatDayLabel(date: string) {
  const d = new Date(`${date}T12:00:00`);
  return d.toLocaleDateString("lt-LT", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(ts: number) {
  return new Date(ts).toLocaleString("lt-LT", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(ms: number) {
  const min = Math.floor(ms / 60_000);
  const d = Math.floor(min / 1440);
  const h = Math.floor((min % 1440) / 60);
  const m = min % 60;
  if (d) return `${d} d. ${h} val.`;
  if (h) return `${h} val. ${m} min.`;
  return `${m} min.`;
}

function percent(value: number | null) {
  return value === null ? "—" : `${value.toFixed(2)}%`;
}

function dayText(day: UptimeDay) {
  return day.uptime === null
    ? STATUS_LABEL.nodata
    : `${STATUS_LABEL[day.status]} · ${day.uptime.toFixed(2)}%`;
}

function UptimeTimeline({ days }: { days: UptimeDay[] }) {
  const [hovered, setHovered] = useState<UptimeDay | null>(null);

  return (
    <div className="uptime__timeline">
      <div className="uptime__bars" role="img" aria-label="90 dienų veikimo istorija">
        {days.map((day) => (
          <button
            key={day.date}
            type="button"
            className={`uptime__bar uptime__bar--${day.status}`}
            title={`${day.date}: ${dayText(day)}`}
            aria-label={`${formatDayLabel(day.date)} — ${dayText(day)}`}
            onMouseEnter={() => setHovered(day)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(day)}
            onBlur={() => setHovered(null)}
          />
        ))}
      </div>

      <div className="uptime__timeline-meta">
        <span>Prieš 90 d.</span>
        <div className="uptime__tooltip" aria-live="polite">
          {hovered ? (
            <>
              <strong>{formatDayLabel(hovered.date)}</strong>
              <span>{dayText(hovered)}</span>
            </>
          ) : (
            <span className="uptime__tooltip-hint">Užveskite pelę ant dienos</span>
          )}
        </div>
        <span>Šiandien</span>
      </div>

      <div className="uptime__legend">
        {(["operational", "degraded", "outage", "nodata"] as DayStatus[]).map((s) => (
          <span key={s}>
            <i className={`uptime__swatch uptime__swatch--${s}`} /> {STATUS_LABEL[s]}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function UptimePage() {
  const state = useUptime();
  const report = state.status === "ready" ? state.report : null;
  const days = useMemo(() => buildTimeline(report, 90), [report]);
  const uptime90 = averageUptime(days);
  const uptime30 = averageUptime(days.slice(-30));

  const botUp = report?.online ?? false;
  const badge =
    state.status === "loading"
      ? { cls: " uptime__badge--loading", text: "Tikrinama…" }
      : botUp
        ? { cls: "", text: "Visos sistemos veikia" }
        : { cls: " uptime__badge--down", text: "Botas šiuo metu neveikia" };

  const services: { name: string; status: DayStatus; text: string; meta: string }[] = [
    {
      name: "Discord botas",
      status: state.status === "loading" ? "nodata" : botUp ? "operational" : "outage",
      text: state.status === "loading" ? "Tikrinama" : botUp ? "Veikia" : "Neveikia",
      meta:
        report?.pingMs != null ? `Ping ~${report.pingMs} ms` : "Ping nežinomas",
    },
    {
      name: "Valdymo panelė",
      status:
        state.status === "loading" ? "nodata" : report ? "operational" : "outage",
      text: state.status === "loading" ? "Tikrinama" : report ? "Veikia" : "Nepasiekiama",
      meta: report
        ? `Veikia be perkrovimo ${formatDuration(Date.now() - report.startedAt)}`
        : "—",
    },
  ];

  return (
    <div className="uptime">
      <SiteHeader />

      <div className="uptime__hero">
        <p className="uptime__eyebrow">Statusas</p>
        <div className="uptime__hero-row">
          <div>
            <h1>Sistemos statusas</h1>
            <p className="uptime__lead">
              Ar Solidus botas ir valdymo panelė veikia dabar, ir kaip jie veikė
              per pastarąsias 90 dienų. Duomenys atnaujinami kas minutę.
            </p>
          </div>
          <div className={`uptime__badge${badge.cls}`} role="status">
            <span className="uptime__badge-dot" />
            {badge.text}
          </div>
        </div>

        <div className="uptime__stats">
          <article className="uptime__stat">
            <p className="uptime__stat-label">90 dienų</p>
            <p className="uptime__stat-value">{percent(uptime90)}</p>
          </article>
          <article className="uptime__stat">
            <p className="uptime__stat-label">30 dienų</p>
            <p className="uptime__stat-value">{percent(uptime30)}</p>
          </article>
          <article className="uptime__stat">
            <p className="uptime__stat-label">Serverių</p>
            <p className="uptime__stat-value">{report?.guilds ?? "—"}</p>
          </article>
        </div>
      </div>

      <div className="uptime__shell">
        <section className="uptime__section">
          <div className="uptime__section-head">
            <div>
              <p className="uptime__eyebrow">Istorija</p>
              <h2>Paskutinės 90 dienos</h2>
            </div>
            <Link to="/pagalba" className="uptime__back-link">
              Reikia pagalbos? →
            </Link>
          </div>
          <UptimeTimeline days={days} />
          {report ? (
            <p className="uptime__empty" style={{ marginTop: 12 }}>
              Sekama nuo {formatDateTime(report.trackedSince)}.
            </p>
          ) : null}
        </section>

        <section className="uptime__section">
          <p className="uptime__eyebrow">Dabar</p>
          <h2>Komponentų būsena</h2>
          <div className="uptime__services">
            {services.map((service) => (
              <article key={service.name} className="uptime__service">
                <div className="uptime__service-top">
                  <span
                    className={`uptime__service-dot uptime__service-dot--${service.status}`}
                  />
                  <strong>{service.name}</strong>
                  <em>{service.text}</em>
                </div>
                <div className="uptime__service-meta">
                  <span>{service.meta}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="uptime__section">
          <p className="uptime__eyebrow">Sutrikimai</p>
          <h2>Pastarieji sutrikimai</h2>
          {report && report.outages.length ? (
            <div className="uptime__incidents">
              {report.outages.map((o) => (
                <article key={o.start} className="uptime__incident">
                  <div className="uptime__incident-top">
                    <strong>Botas buvo nepasiekiamas</strong>
                    <span className="uptime__incident-status">{o.minutes} min.</span>
                  </div>
                  <div className="uptime__incident-time">
                    <span>Pradžia: {formatDateTime(o.start)}</span>
                    <span>Pabaiga: {formatDateTime(o.end)}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="uptime__empty">
              {report
                ? "Sutrikimų neužfiksuota."
                : state.status === "loading"
                  ? "Kraunama…"
                  : "Istorija nepasiekiama, kol botas neveikia."}
            </p>
          )}
        </section>
      </div>

      <SiteFooter />
    </div>
  );
}
