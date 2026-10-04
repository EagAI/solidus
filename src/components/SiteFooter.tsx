import { Link } from "react-router-dom";
import { logo, socialDiscord, whatsappIcon, socialMail } from "../assets";
import { CONTACTS, FOOTER_GROUPS } from "../nav";
import "./SiteFooter.css";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <Link className="site-footer__logo" to="/" aria-label="Solidus">
            <img src={logo} alt="Solidus" />
          </Link>
          <p>Lietuviškas Discord botas bendruomenėms.</p>
        </div>

        {FOOTER_GROUPS.map((group) => (
          <nav key={group.title} className="site-footer__col" aria-label={group.title}>
            <p className="site-footer__heading">{group.title}</p>
            <ul>
              {group.links.map((item) => (
                <li key={item.to}>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="site-footer__col">
          <p className="site-footer__heading">Pasikalbėkime</p>
          <div className="site-footer__social-icons">
            {CONTACTS.discord ? (
              <a href={CONTACTS.discord} target="_blank" rel="noreferrer" aria-label="Discord">
                <img src={socialDiscord} alt="" width={26} height={19} />
              </a>
            ) : null}
            {CONTACTS.whatsapp ? (
              <a href={CONTACTS.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp">
                <img src={whatsappIcon} alt="" width={24} height={24} />
              </a>
            ) : null}
            <a href={`mailto:${CONTACTS.email}`} aria-label="El. paštas">
              <img src={socialMail} alt="" width={24} height={18} />
            </a>
          </div>
          <a className="site-footer__email" href={`mailto:${CONTACTS.email}`}>
            {CONTACTS.email}
          </a>
        </div>
      </div>

      <p className="site-footer__copy">© {new Date().getFullYear()} Solidus</p>
    </footer>
  );
}
