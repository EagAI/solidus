import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { logo } from "../assets";
import { SITE_NAV } from "../nav";
import "./SiteHeader.css";

function isHashLink(to: string) {
  return to.includes("#");
}

function navItemActive(to: string, pathname: string, hash: string, end?: boolean) {
  if (isHashLink(to)) {
    const [path, itemHash] = to.split("#");
    const base = path || "/";
    return pathname === base && hash === `#${itemHash}`;
  }
  if (end) return pathname === to && !hash;
  return pathname === to || pathname.startsWith(`${to}/`);
}

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname, hash } = useLocation();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
    <header className="site-header">
      <div className="site-header__inner">
        <Link
          className="site-header__logo"
          to="/"
          aria-label="Solidus"
          onClick={closeMenu}
        >
          <img src={logo} alt="Solidus" width={232} height={61} />
        </Link>

        <nav className="site-header__nav" aria-label="Pagrindinė navigacija">
          {SITE_NAV.map((item) => {
            const active = navItemActive(item.to, pathname, hash, item.end);

            if (isHashLink(item.to)) {
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={
                    "site-header__link" +
                    (active ? " site-header__link--active" : "")
                  }
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  "site-header__link" +
                  (isActive ? " site-header__link--active" : "")
                }
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="site-header__actions">
          <a href="#login" className="site-btn site-btn--outline">
            Prisijungti su DISCORD
          </a>
        </div>

        <button
          type="button"
          className={`site-header__burger${menuOpen ? " is-open" : ""}`}
          aria-label={menuOpen ? "Uždaryti meniu" : "Atidaryti meniu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div
        className={`site-header__drawer${menuOpen ? " is-open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <nav className="site-header__drawer-nav">
          {SITE_NAV.map((item) => {
            const active = navItemActive(item.to, pathname, hash, item.end);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={
                  "site-header__drawer-link" +
                  (active ? " site-header__drawer-link--active" : "")
                }
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="site-header__drawer-actions">
          <a
            href="#login"
            className="site-btn site-btn--outline"
            onClick={closeMenu}
          >
            Prisijungti su DISCORD
          </a>
        </div>
      </div>
    </header>
    <div className="site-header__spacer" aria-hidden="true" />
    </>
  );
}
