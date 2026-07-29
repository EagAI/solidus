import { Link } from "react-router-dom";
import {
  ACTIVITY,
  BOT_STATUS,
  DASH_STATS,
  POPULAR_COMMANDS,
  QUICK_ACTIONS,
  RESOURCES,
  SERVER_INFO,
} from "../data/mock";
import { PanelCard, PanelPageHeader } from "../components/ui";
import "./DashboardPage.css";

export default function DashboardPage() {
  const maxSpark = Math.max(...BOT_STATUS.sparkline);

  return (
    <div className="panel-page dash">
      <PanelPageHeader
        title="Valdymo skydelis"
        lead="Valdykite Solidus botą ir stebėkite aktyvumą realiu laiku."
      />

      <div className="dash__stats">
        {DASH_STATS.map((stat) => (
          <article key={stat.id} className="dash__stat">
            <p className="dash__stat-label">{stat.label}</p>
            <p className="dash__stat-value">{stat.value}</p>
            <p className="dash__stat-delta">{stat.delta}</p>
          </article>
        ))}
      </div>

      <div className="dash__mid">
        <PanelCard title="Boto būsena" className="dash__status">
          <div className="dash__status-main">
            <span className="dash__status-pill">
              <i /> {BOT_STATUS.label}
            </span>
            <div className="dash__status-grid">
              <div>
                <span>Discord API</span>
                <strong>{BOT_STATUS.api}</strong>
              </div>
              <div>
                <span>Duomenų bazė</span>
                <strong>{BOT_STATUS.database}</strong>
              </div>
              <div>
                <span>Uptime</span>
                <strong>{BOT_STATUS.uptime}</strong>
              </div>
            </div>
          </div>
          <svg
            className="dash__spark"
            viewBox="0 0 120 36"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polyline
              fill="none"
              stroke="url(#dashSparkGrad)"
              strokeWidth="2"
              points={BOT_STATUS.sparkline
                .map((v, i) => {
                  const x = (i / (BOT_STATUS.sparkline.length - 1)) * 120;
                  const y = 32 - (v / maxSpark) * 28;
                  return `${x},${y}`;
                })
                .join(" ")}
            />
            <defs>
              <linearGradient id="dashSparkGrad" x1="0" y1="0" x2="1" y2="0">
                <stop stopColor="#6b4eff" />
                <stop offset="1" stopColor="#49aefe" />
              </linearGradient>
            </defs>
          </svg>
        </PanelCard>

        <PanelCard title="Naujausia veikla" className="dash__activity">
          <ul className="dash__activity-list">
            {ACTIVITY.map((item) => (
              <li key={item.id}>
                <span className={`dash__activity-dot dash__activity-dot--${item.type}`} />
                <div>
                  <strong>{item.text}</strong>
                  <span>
                    {item.user} · {item.time}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </PanelCard>

        <div className="dash__side-stack">
          <PanelCard title="Populiariausios komandos">
            <ul className="dash__bars">
              {POPULAR_COMMANDS.map((cmd) => (
                <li key={cmd.name}>
                  <div className="dash__bars-meta">
                    <strong>{cmd.name}</strong>
                    <span>{cmd.uses}</span>
                  </div>
                  <div className="dash__bars-track">
                    <i style={{ width: `${cmd.pct}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </PanelCard>

          <PanelCard title="Serverio informacija">
            <dl className="dash__server">
              <div>
                <dt>Pavadinimas</dt>
                <dd>{SERVER_INFO.name}</dd>
              </div>
              <div>
                <dt>Savininkas</dt>
                <dd>{SERVER_INFO.owner}</dd>
              </div>
              <div>
                <dt>Sukurta</dt>
                <dd>{SERVER_INFO.created}</dd>
              </div>
              <div>
                <dt>Regionas</dt>
                <dd>{SERVER_INFO.region}</dd>
              </div>
              <div>
                <dt>Narių limitas</dt>
                <dd>{SERVER_INFO.userLimit}</dd>
              </div>
            </dl>
          </PanelCard>
        </div>
      </div>

      <PanelCard title="Greiti veiksmai">
        <div className="dash__actions">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.id} to={action.to} className="dash__action">
              <img src={action.icon} alt="" width={28} height={28} aria-hidden="true" />
              <span>{action.label}</span>
            </Link>
          ))}
        </div>
      </PanelCard>

      <div className="dash__bottom">
        <PanelCard title="Sistemos ištekliai">
          <div className="dash__gauges">
            {RESOURCES.map((res) => (
              <div key={res.id} className="dash__gauge">
                <svg viewBox="0 0 36 36" aria-hidden="true">
                  <circle cx="18" cy="18" r="15.5" className="dash__gauge-track" />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    className="dash__gauge-value"
                    style={{
                      strokeDasharray: `${res.value} ${100 - res.value}`,
                    }}
                  />
                </svg>
                <strong>{res.value}%</strong>
                <span>{res.label}</span>
              </div>
            ))}
          </div>
        </PanelCard>

        <PanelCard title="Atnaujinimai" className="dash__updates">
          <p className="dash__version">V2.4.1</p>
          <p className="dash__version-note">Dabartinė Solidus versija</p>
          <Link to="/atnaujinimai" className="panel-btn panel-btn--ghost">
            Peržiūrėti pakeitimus
          </Link>
        </PanelCard>
      </div>
    </div>
  );
}
