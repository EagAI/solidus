import { useEffect, useId, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate, Navigate } from "react-router-dom";
import {
  logo,
  menuLogoutIcon,
  menuSettingsIcon,
  menuUserIcon,
  robot,
  themeIcon,
} from "../assets";
import { PANEL_NAV, type PanelNavItem } from "./panelNav";
import { initials, usePanelSessionState } from "./session";
import { GUILD_KEY } from "./data/modules";
import "./PanelLayout.css";
import "./panel.css";

const THEME_KEY = "solidus-panel-theme";
const THEME_CLASSES = [
  "panel-theme-solidus",
  "panel-theme-light",
  "panel-theme-gray",
  "panel-theme-bw",
] as const;

type PanelTheme = "solidus" | "light" | "gray" | "bw";

const THEMES: { id: PanelTheme; label: string }[] = [
  { id: "solidus", label: "Solidus" },
  { id: "light", label: "Šviesus" },
  { id: "gray", label: "Pilkas / baltas" },
  { id: "bw", label: "Juodas / baltas" },
];

function readTheme(): PanelTheme {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (
      stored === "solidus" ||
      stored === "light" ||
      stored === "gray" ||
      stored === "bw"
    ) {
      return stored;
    }
    if (stored === "dark") return "solidus";
  } catch {
    /* ignore */
  }
  return "solidus";
}

function themeClass(theme: PanelTheme): string {
  if (theme === "light") return " panel--light";
  if (theme === "gray") return " panel--gray";
  if (theme === "bw") return " panel--bw";
  return "";
}

function ThemeSwatch({ theme }: { theme: PanelTheme }) {
  return (
    <span
      className={`panel__theme-swatch panel__theme-swatch--${theme}`}
      aria-hidden="true"
    >
      <span className="panel__theme-swatch-side" />
      <span className="panel__theme-swatch-main">
        <span className="panel__theme-swatch-bar" />
        <span className="panel__theme-swatch-cards">
          <i />
          <i />
        </span>
      </span>
    </span>
  );
}

function NavBranch({ item }: { item: PanelNavItem }) {
  const { pathname } = useLocation();
  const open = pathname.startsWith(item.to);
  const [expanded, setExpanded] = useState(open);

  useEffect(() => {
    if (open) setExpanded(true);
  }, [open]);

  if (!item.children?.length) {
    return (
      <NavLink
        to={item.to}
        end={item.end}
        className={({ isActive }) => "panel__nav-link" + (isActive ? " is-active" : "")}
      >
        <span>{item.label}</span>
        {item.badge ? <span className="panel__nav-badge">{item.badge}</span> : null}
      </NavLink>
    );
  }

  return (
    <div className={"panel__nav-branch" + (expanded ? " is-open" : "")}>
      <button
        type="button"
        className={"panel__nav-link panel__nav-parent" + (open ? " is-active" : "")}
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
      >
        <span>{item.label}</span>
        <svg viewBox="0 0 12 8" aria-hidden="true">
          <path
            d="M1 1.5 6 6.5 11 1.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>
      {expanded ? (
        <div className="panel__nav-sub">
          {item.children.map((child) => (
            <NavLink
              key={child.to}
              to={child.to}
              className={({ isActive }) =>
                "panel__nav-link panel__nav-sublink" + (isActive ? " is-active" : "")
              }
            >
              <span>{child.label}</span>
            </NavLink>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function UserAvatar({ name, src }: { name: string; src: string | null }) {
  return (
    <span className="panel__avatar" aria-hidden="true">
      {src ? <img src={src} alt="" /> : initials(name)}
    </span>
  );
}

export default function PanelLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [theme, setTheme] = useState<PanelTheme>(() => readTheme());
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [, setGuildId] = useState(() => localStorage.getItem(GUILD_KEY) || "");
  // Read on every render: pages set it right before navigate(), so state would lag a render.
  const guildId = localStorage.getItem(GUILD_KEY) || "";
  const themeRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const themeMenuId = useId();
  const userMenuId = useId();
  const sessionCtx = usePanelSessionState();
  const { session } = sessionCtx;
  const user = session.status === "ready" ? session.user : null;
  const activeGuild =
    session.status === "ready"
      ? session.guilds.find((g) => g.id === guildId && g.canManage && g.botIn) ?? null
      : null;

  // Stored server is no longer manageable (left it, lost perms, bot kicked) → forget it.
  useEffect(() => {
    if (session.status !== "ready" || !guildId || activeGuild) return;
    localStorage.removeItem(GUILD_KEY);
    setGuildId("");
  }, [session.status, guildId, activeGuild]);

  useEffect(() => {
    setMenuOpen(false);
    setThemeOpen(false);
    setUserOpen(false);
    setGuildId(localStorage.getItem(GUILD_KEY) || "");
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }

    const root = document.documentElement;
    for (const cls of THEME_CLASSES) root.classList.remove(cls);
    root.classList.add(`panel-theme-${theme}`);

    return () => {
      for (const cls of THEME_CLASSES) root.classList.remove(cls);
    };
  }, [theme]);

  useEffect(() => {
    if (!themeOpen && !userOpen) return;

    function onPointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (themeOpen && !themeRef.current?.contains(target)) {
        setThemeOpen(false);
      }
      if (userOpen && !userRef.current?.contains(target)) {
        setUserOpen(false);
      }
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setThemeOpen(false);
        setUserOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [themeOpen, userOpen]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  }

  const signedIn = session.status === "ready";
  const nav = guildId && signedIn
    ? PANEL_NAV
    : PANEL_NAV.filter((group) => group.id === "home").map((group) => ({
        ...group,
        items: group.items.filter((item) => item.to === "/panel"),
      }));

  const blocked =
    session.status === "guest" ||
    session.status === "offline" ||
    (session.status === "ready" && !activeGuild);
  if (pathname !== "/panel" && (!guildId || blocked)) {
    return <Navigate to="/panel" replace />;
  }

  return (
    <div className={`panel${themeClass(theme)}`}>
      <header className="panel__top">
        <Link to="/panel" className="panel__brand" aria-label="Solidus panel">
          <img src={logo} alt="" width={36} height={36} />
          SOLIDUS
        </Link>

        <div className="panel__top-right">
          <div className="panel__theme" ref={themeRef}>
            <button
              type="button"
              className="panel__theme-trigger"
              aria-label="Pasirinkti temą"
              aria-haspopup="listbox"
              aria-expanded={themeOpen}
              aria-controls={themeMenuId}
              onClick={() => {
                setThemeOpen((v) => !v);
                setUserOpen(false);
              }}
            >
              <img
                src={themeIcon}
                alt=""
                width={22}
                height={22}
                className="panel__theme-icon"
                aria-hidden="true"
              />
            </button>

            {themeOpen ? (
              <div
                id={themeMenuId}
                className="panel__theme-menu"
                role="listbox"
                aria-label="Temos"
              >
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="option"
                    aria-selected={theme === t.id}
                    aria-label={t.label}
                    title={t.label}
                    className={
                      "panel__theme-option" + (theme === t.id ? " is-active" : "")
                    }
                    onClick={() => {
                      setTheme(t.id);
                      setThemeOpen(false);
                    }}
                  >
                    <ThemeSwatch theme={t.id} />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {user ? (
          <div className="panel__user-wrap" ref={userRef}>
            <button
              type="button"
              className="panel__user"
              aria-label="Vartotojo meniu"
              aria-haspopup="menu"
              aria-expanded={userOpen}
              aria-controls={userMenuId}
              onClick={() => {
                setUserOpen((v) => !v);
                setThemeOpen(false);
              }}
            >
              <UserAvatar name={user?.globalName ?? ""} src={user?.avatar ?? null} />
              <span className="panel__user-meta">
                <strong>{user?.globalName}</strong>
                <span>{activeGuild?.name ?? "Serveris nepasirinktas"}</span>
              </span>
            </button>

            {userOpen ? (
              <div
                id={userMenuId}
                className="panel__user-menu"
                role="menu"
                aria-label="Vartotojo parinktys"
              >
                <div className="panel__user-menu-head">
                  <UserAvatar name={user?.globalName ?? ""} src={user?.avatar ?? null} />
                  <div>
                    <strong>{user?.globalName}</strong>
                    <span>@{user?.username}</span>
                  </div>
                </div>

                <button
                  type="button"
                  role="menuitem"
                  className="panel__user-menu-item"
                  onClick={() => {
                    setUserOpen(false);
                    navigate("/panel");
                  }}
                >
                  <img src={menuUserIcon} alt="" width={18} height={18} />
                  Keisti serverį
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className="panel__user-menu-item"
                  onClick={() => {
                    setUserOpen(false);
                    navigate("/panel/nustatymai");
                  }}
                >
                  <img src={menuSettingsIcon} alt="" width={18} height={18} />
                  Nustatymai
                </button>

                <div className="panel__user-menu-sep" role="separator" />

                <button
                  type="button"
                  role="menuitem"
                  className="panel__user-menu-item panel__user-menu-item--danger"
                  onClick={() => {
                    setUserOpen(false);
                    localStorage.removeItem(GUILD_KEY);
                    setGuildId("");
                    void sessionCtx.logout().then(() => {
                      showToast("Atsijungta");
                      navigate("/panel");
                    });
                  }}
                >
                  <img src={menuLogoutIcon} alt="" width={18} height={18} />
                  Atsijungti
                </button>
              </div>
            ) : null}
          </div>
          ) : null}

          <button
            type="button"
            className="panel__menu-btn"
            aria-label={menuOpen ? "Uždaryti meniu" : "Atidaryti meniu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <div className="panel__body">
        <div
          className={`panel__backdrop${menuOpen ? " is-open" : ""}`}
          onClick={() => setMenuOpen(false)}
          aria-hidden={!menuOpen}
        />

        <aside className={`panel__sidebar${menuOpen ? " is-open" : ""}`}>
          <div className="panel__mascot" aria-hidden="true">
            <img src={robot} alt="" />
          </div>

          <nav aria-label="Panelio navigacija">
            {nav.map((group) => (
              <div key={group.id} className="panel__nav-group">
                {group.label ? (
                  <p className="panel__nav-label">{group.label}</p>
                ) : null}
                {group.items.map((item) => (
                  <NavBranch key={item.to} item={item} />
                ))}
              </div>
            ))}
          </nav>

          <div className="panel__sidebar-footer">
            <Link to="/dokumentacija" className="panel__docs-link">
              Dokumentacija
            </Link>
          </div>
        </aside>

        <main className="panel__main">
          <Outlet context={sessionCtx} />
        </main>
      </div>

      {toast ? <div className="panel-toast">{toast}</div> : null}
    </div>
  );
}
