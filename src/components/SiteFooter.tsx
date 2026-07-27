import { Link } from "react-router-dom";
import { logo, socialDiscord, whatsappIcon, socialMail } from "../assets";
import { FOOTER_LEGAL, FOOTER_NAV } from "../nav";
import "./SiteFooter.css";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <Link className="site-footer__logo" to="/" aria-label="Solidus">
          <img src={logo} alt="Solidus" />
        </Link>

        <ul className="site-footer__col">
          {FOOTER_NAV.map((item) => (
            <li key={item.to}>
              <Link to={item.to}>{item.label}</Link>
            </li>
          ))}
        </ul>

        <ul className="site-footer__col">
          {FOOTER_LEGAL.map((item) => (
            <li key={item.label}>
              <Link to={item.to}>{item.label}</Link>
            </li>
          ))}
        </ul>

        <div className="site-footer__social">
          <p className="site-footer__social-title">Pasikalbėkime?</p>
          <div className="site-footer__social-icons">
            <a href="#discord" aria-label="Discord">
              <img src={socialDiscord} alt="" width={26} height={19} />
            </a>
            <a href="#whatsapp" aria-label="WhatsApp">
              <img src={whatsappIcon} alt="" width={24} height={24} />
            </a>
            <a href="mailto:support@solidus.bot" aria-label="El. paštas">
              <img src={socialMail} alt="" width={24} height={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
