import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  buildUptimeTimeline,
  overallUptime,
  RECENT_INCIDENTS,
  SERVICES,
  STATUS_LABEL,
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

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("lt-LT", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function barClass(status: DayStatus) {
  return `uptime__bar uptime__bar--${status}`;
}

function UptimeTimeline({ days }: { days: UptimeDay[] }) {
  const [hovered, setHovered] = useState<UptimeDay | null>(null);

  return (
    <div className="uptime__timeline">
      <div className="uptime__bars" role="img" aria-label="90 dienų uptime timeline">
        {days.map((day) => (
          <button
            key={day.date}
            type="button"
            className={barClass(day.status)}
            title={`${day.date}: ${STATUS_LABEL[day.status]} (${day.uptime}%)`}
            aria-label={`${formatDayLabel(day.date)} — ${STATUS_LABEL[day.status]}, ${day.uptime}%`}
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
              <span>
                {STATUS_LABEL[hovered.status]} · {hovered.uptime.toFixed(2)}%
              </span>
              {hovered.note ? <em>{hovered.note}</em> : null}
            </>
          ) : (
            <span className="uptime__tooltip-hint">Užveskite pelę ant dienos</span>
          )}
        </div>
        <span>Šiandien</span>
      </div>

      <div className="uptime__legend">
        <span>
          <i className="uptime__swatch uptime__swatch--operational" /> Veikia
        </span>
        <span>
          <i className="uptime__swatch uptime__swatch--degraded" /> Sutrikimai
        </span>
        <span>
          <i className="uptime__swatch uptime__swatch--outage" /> Neveikia
        </span>
        <span>
          <i className="uptime__swatch uptime__swatch--maintenance" /> Priežiūra
        </span>
      </div>
    </div>
  );
}

export default function UptimePage() {
  const days = useMemo(() => buildUptimeTimeline(90), []);
  const uptime90 = overallUptime(days);
  const uptime30 = overallUptime(days.slice(-30));

  return (
    <div className="uptime">
      <SiteHeader />

      <div className="uptime__hero">
        <p className="uptime__eyebrow">Statusas</p>
        <div className="uptime__hero-row">
          <div>
            <h1>Solidus uptime</h1>
            <p className="uptime__lead">
              Gyvas boto ir susijusių servisų veikimo vaizdas — timeline,
              procentai ir pastarieji incidentai.
            </p>
          </div>
          <div className="uptime__badge">
            <span className="uptime__badge-dot" />
            Visos sistemos veikia
          </div>
        </div>

        <div className="uptime__stats">
          <article className="uptime__stat">
            <p className="uptime__stat-label">90 dienų</p>
            <p className="uptime__stat-value">{uptime90.toFixed(3)}%</p>
          </article>
          <article className="uptime__stat">
            <p className="uptime__stat-label">30 dienų</p>
            <p className="uptime__stat-value">{uptime30.toFixed(3)}%</p>
          </article>
          <article className="uptime__stat">
            <p className="uptime__stat-label">Tikslas</p>
            <p className="uptime__stat-value">99,9%</p>
          </article>
        </div>
      </div>

      <div className="uptime__shell">
        <section className="uptime__section">
          <div className="uptime__section-head">
            <div>
              <p className="uptime__eyebrow">Timeline</p>
              <h2>Paskutinės 90 dienos</h2>
            </div>
            <Link to="/pagalba#statusas" className="uptime__back-link">
              ← Atgal į pagalbą
            </Link>
          </div>
          <UptimeTimeline days={days} />
        </section>

        <section className="uptime__section">
          <p className="uptime__eyebrow">Servisai</p>
          <h2>Komponentų būsena</h2>
          <div className="uptime__services">
            {SERVICES.map((service) => (
              <article key={service.id} className="uptime__service">
                <div className="uptime__service-top">
                  <span
                    className={`uptime__service-dot uptime__service-dot--${service.status}`}
                  />
                  <strong>{service.name}</strong>
                  <em>{STATUS_LABEL[service.status]}</em>
                </div>
                <div className="uptime__service-meta">
                  <span>30d · {service.uptime30d}%</span>
                  <span>~{service.latencyMs} ms</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="uptime__section">
          <p className="uptime__eyebrow">Istorija</p>
          <h2>Pastarieji incidentai</h2>
          <div className="uptime__incidents">
            {RECENT_INCIDENTS.map((incident) => (
              <article key={incident.id} className="uptime__incident">
                <div className="uptime__incident-top">
                  <strong>{incident.title}</strong>
                  <span className="uptime__incident-status">
                    {incident.status === "resolved" ? "Išspręsta" : incident.status}
                  </span>
                </div>
                <p>{incident.summary}</p>
                <div className="uptime__incident-time">
                  <span>Pradžia: {formatDateTime(incident.startedAt)}</span>
                  {incident.resolvedAt ? (
                    <span>Pabaiga: {formatDateTime(incident.resolvedAt)}</span>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <SiteFooter />
    </div>
  );
}
