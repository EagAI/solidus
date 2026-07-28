import { Link } from "react-router-dom";
import { TEAM } from "../data/team";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";
import "./TeamPage.css";

function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

export default function TeamPage() {
  return (
    <div className="team">
      <SiteHeader />

      <div className="team__hero">
        <p className="team__eyebrow">Komanda</p>
        <h1>Žmonės už Solidus</h1>
        <p className="team__lead">
          Maža komanda, kuri kuria Discord botą bendruomenėms — nuo produkto
          krypties iki dizaino.
        </p>
        <div className="team__hero-actions">
          <Link to="/pagalba" className="site-btn site-btn--gradient">
            Susisiekti
          </Link>
          <Link to="/atnaujinimai" className="site-btn site-btn--outline">
            Atnaujinimai
          </Link>
        </div>
      </div>

      <div className="team__shell">
        <ul className="team__grid">
          {TEAM.map((member) => (
            <li
              key={member.id}
              className={`team__card team__card--${member.accent}`}
              id={member.id}
            >
              <div className="team__avatar" aria-hidden="true">
                <span>{initials(member.name)}</span>
              </div>
              <p className="team__role">{member.role}</p>
              <h2 className="team__name">{member.name}</h2>
              <p className="team__bio">{member.bio}</p>
            </li>
          ))}
        </ul>
      </div>

      <SiteFooter />
    </div>
  );
}
