import { Link } from "react-router-dom";
import {
  UPDATES,
  UPDATE_TAG_LABEL,
  type UpdateTag,
} from "../data/updates";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";
import "./UpdatesPage.css";

function formatDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("lt-LT", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function tagClass(tag: UpdateTag) {
  return `updates__tag updates__tag--${tag}`;
}

export default function UpdatesPage() {
  return (
    <div className="updates">
      <SiteHeader />

      <div className="updates__hero">
        <p className="updates__eyebrow">Atnaujinimai</p>
        <h1>Kas naujo Solidus?</h1>
        <p className="updates__lead">
          Trumpa istorija apie paleistas versijas, naujas funkcijas ir
          pataisymus. Šiuo metu rodomi pavyzdiniai duomenys.
        </p>
        <div className="updates__hero-actions">
          <Link to="/dokumentacija" className="site-btn site-btn--gradient">
            Dokumentacija
          </Link>
          <Link to="/uptime" className="site-btn site-btn--outline">
            Sistemos statusas
          </Link>
        </div>
      </div>

      <div className="updates__shell">
        <ol className="updates__timeline">
          {UPDATES.map((item, index) => (
            <li key={item.id} className="updates__item" id={`v-${item.version}`}>
              <div className="updates__rail" aria-hidden="true">
                <span className="updates__dot" />
                {index < UPDATES.length - 1 ? (
                  <span className="updates__line" />
                ) : null}
              </div>

              <article className="updates__card">
                <header className="updates__card-head">
                  <div className="updates__meta">
                    <time dateTime={item.date}>{formatDate(item.date)}</time>
                    <span className="updates__version">v{item.version}</span>
                    <span className={tagClass(item.tag)}>
                      {UPDATE_TAG_LABEL[item.tag]}
                    </span>
                  </div>
                  <h2>{item.title}</h2>
                  <p className="updates__summary">{item.summary}</p>
                </header>

                <ul className="updates__changes">
                  {item.changes.map((change) => (
                    <li key={change}>{change}</li>
                  ))}
                </ul>
              </article>
            </li>
          ))}
        </ol>
      </div>

      <SiteFooter />
    </div>
  );
}
