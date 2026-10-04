import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  aura,
  discordIcon,
  arrowIcon,
  ellipse,
  moderavimasIcon,
  irankiaiIcon,
  ekonomikaIcon,
  automatikaIcon,
  saugumasIcon,
  tinkinimasIcon,
} from "../assets";
import HeroScene from "./HeroScene";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";
import "./HomePage.css";

type TabId =
  | "moderavimas"
  | "irankiai"
  | "ekonomika"
  | "automatika"
  | "apsauga"
  | "tinkinimas";

type FeatureTab = {
  id: TabId;
  label: string;
  shortLabel: string;
  icon: string;
  iconW: number;
  iconH: number;
  title: string;
  paragraphs: [string, string];
  highlight?: string;
};

const FEATURE_TABS: FeatureTab[] = [
  {
    id: "moderavimas",
    label: "MODERAVIMAS",
    shortLabel: "Mod",
    icon: moderavimasIcon,
    iconW: 26,
    iconH: 26,
    title: "Moderavimas be chaoso",
    paragraphs: [
      "Užbaninti, išmesti ar nutildyti narį užtenka vienos komandos — /admin timeout supranta 30min, 2h ar 1d. /admin purge vienu kartu išvalo iki 100 žinučių, o /slap su GIF'u ir XP bauda primena įkyruoliui taisykles.",
      "Kiekviena redaguota ir ištrinta žinutė lieka logų kanale, todėl moderatoriai visada mato, kas iš tikrųjų buvo parašyta.",
    ],
    highlight: "vienos komandos",
  },
  {
    id: "irankiai",
    label: "LYGIAI",
    shortLabel: "Lygiai",
    icon: ekonomikaIcon,
    iconW: 26,
    iconH: 26,
    title: "Lygiai ir XP",
    paragraphs: [
      "Nariai renka XP už bendravimą ir kyla lygiais. /lygis parodo gražią lygio kortelę, o /lyderiai — top 15 serverio narių kaip vieną grafiką, kurią norisi pasidalinti.",
      "Pasiekus lygį, botas pats suteikia rolę ir paskelbia pakilimą kanale — be jokio rankinio darbo.",
    ],
    highlight: "top 15",
  },
  {
    id: "ekonomika",
    label: "TIKETAI",
    shortLabel: "Tiketai",
    icon: irankiaiIcon,
    iconW: 26,
    iconH: 26,
    title: "Tiketai ir giveaway",
    paragraphs: [
      "/ticket išsiunčia skydelį į kanalą: narys pasirenka temą — pagalba, pranešimas ar klausimas — ir botas sukuria privatų kanalą su jūsų komanda. Visą tiketų istoriją matai panelėje.",
      "Giveaway sukuriamas per formą su /giveaway create, o baigti anksčiau ar perrinkti laimėtojus galima viena komanda.",
    ],
    highlight: "privatų kanalą",
  },
  {
    id: "automatika",
    label: "AUTOMATIKA",
    shortLabel: "Auto",
    icon: automatikaIcon,
    iconW: 26,
    iconH: 26,
    title: "Serveris, kuris tvarkosi pats",
    paragraphs: [
      "Naujas narys gauna pasveikinimą su baneriu ar kortele, autorolę ir patvirtinimo mygtuką. Išėjus — atsisveikinimo žinutė.",
      "Prisijungus prie voice „hub“ kanalo, botas sukuria asmeninį kambarį ir jį ištrina, kai visi išeina. Naujas YouTube vaizdo įrašas ar live paskelbiamas automatiškai.",
    ],
    highlight: "patvirtinimo mygtuką",
  },
  {
    id: "apsauga",
    label: "APSAUGA",
    shortLabel: "Apsauga",
    icon: saugumasIcon,
    iconW: 26,
    iconH: 26,
    title: "Apsauga nuo sukčių",
    paragraphs: [
      "Solidus skaito tekstą net nuotraukose ir atpažįsta sukčių schemas — netikrus giveaway ar „nemokamą Nitro“. Siuntėjas iškart gauna timeout, o moderatoriai — pranešimą su mygtukais užbaninti ar paleisti.",
      "Svetimų serverių pakvietimai ištrinami automatiškai, o pasirinktuose kanaluose galima leisti tik nuotraukas.",
    ],
    highlight: "net nuotraukose",
  },
  {
    id: "tinkinimas",
    label: "PANELĖ",
    shortLabel: "Panelė",
    icon: tinkinimasIcon,
    iconW: 26,
    iconH: 26,
    title: "Viskas valdoma svetainėje",
    paragraphs: [
      "Prisijunk su Discord ir matysi visus serverius, kuriuos gali valdyti. Įjunk ar išjunk modulius, pasirink kanalus ir roles — be komandų mokymosi.",
      "Kiekvienas serveris turi savo nustatymus, o panelę mato tik tie, kas tą serverį valdo Discord'e.",
    ],
    highlight: "be komandų mokymosi",
  },
];

/** Honest facts instead of made-up audience numbers. */
const STATS = [
  { value: "7", label: "SLASH KOMANDOS" },
  { value: "8", label: "MODULIAI PANELĖJE" },
  { value: "100%", label: "LIETUVIŠKAI" },
] as const;

const HIGHLIGHTS = [
  {
    title: "Lietuviškai iš esmės",
    text: "Komandos, žinutės ir panelė parašytos lietuviškai — ne išverstos mašina.",
  },
  {
    title: "Anti-scam nuotraukose",
    text: "Atpažįsta sukčių tekstą paveikslėliuose, kur įprasti filtrai nemato.",
  },
  {
    title: "Lygių kortelės",
    text: "/lygis ir /lyderiai piešia grafikas su tavo serverio spalvomis.",
  },
  {
    title: "Tiketai su istorija",
    text: "Privatūs pagalbos kanalai, o visi pokalbiai lieka panelėje.",
  },
  {
    title: "Giveaway per formą",
    text: "Prizas, trukmė ir laimėtojų skaičius — be sudėtingų argumentų.",
  },
  {
    title: "Asmeniniai voice kambariai",
    text: "Kiekvienas gauna savo kambarį, kuris dingsta, kai visi išeina.",
  },
  {
    title: "YouTube pranešimai",
    text: "Naujas vaizdo įrašas ar live paskelbiamas tavo kanale automatiškai.",
  },
  {
    title: "Žinučių logai",
    text: "Redaguotos ir ištrintos žinutės išsaugomos moderatoriams.",
  },
] as const;

const STEPS = [
  {
    title: "Prisijunk su Discord",
    text: "Atidaryk panelę — matysi visus serverius, kuriuose esi administratorius.",
  },
  {
    title: "Pakviesk Solidus",
    text: "Prie norimo serverio spausk „Pakviesti“. Komandos atsiras iš karto.",
  },
  {
    title: "Įsijunk, ko reikia",
    text: "Panelėje pasirink modulius, kanalus ir roles. Pakeitimai veikia akimirksniu.",
  },
] as const;

const SVG_W = 1198;
const SVG_H = 433;

const PANEL = {
  left: 1,
  right: 1194,
  bottom: 432,
  bodyTop: 66,
  tabTop: 1,
  bodyR: 30.91,
  /** Match CSS .features__tab border-radius (~18px at desktop width). */
  tabR: 18,
  shoulder: 22,
} as const;

/** Exact Figma first-tab silhouette (shared left wall + concave right join). */
function buildFlushLeftPath(tabRight: number): string {
  const {
    bodyTop: BT,
    tabTop: TT,
    right: R,
    bottom: B,
    left: L,
    bodyR: BR,
    tabR,
    shoulder,
  } = PANEL;
  const tr = tabRight;
  const joinY = TT + tabR + (BT - TT - tabR) * 0.35;

  return [
    `M ${R - BR} ${BT}`,
    `H ${tr + shoulder}`,
    `C ${tr + 12} ${BT} ${tr} ${BT - 12} ${tr} ${joinY}`,
    `V ${TT + tabR}`,
    `C ${tr} ${TT + tabR * 0.45} ${tr - tabR * 0.55} ${TT} ${tr - tabR} ${TT}`,
    `H ${L + BR}`,
    `C ${L + BR * 0.45} ${TT} ${L} ${TT + BR * 0.45} ${L} ${TT + BR}`,
    `V ${B - BR}`,
    `C ${L} ${B - BR * 0.55} ${L + BR * 0.55} ${B} ${L + BR} ${B}`,
    `H ${R - BR}`,
    `C ${R - BR * 0.55} ${B} ${R} ${B - BR * 0.55} ${R} ${B - BR}`,
    `V ${BT + BR}`,
    `C ${R} ${BT + BR * 0.55} ${R - BR * 0.55} ${BT} ${R - BR} ${BT}`,
    `Z`,
  ].join(" ");
}

/** Exact Figma last-tab silhouette (concave left join + shared right wall). */
function buildFlushRightPath(tabLeft: number): string {
  const {
    bodyTop: BT,
    tabTop: TT,
    right: R,
    bottom: B,
    left: L,
    bodyR: BR,
    tabR,
    shoulder,
  } = PANEL;
  const tl = tabLeft;
  const joinY = TT + tabR + (BT - TT - tabR) * 0.35;

  return [
    `M ${L + BR} ${BT}`,
    `H ${tl - shoulder}`,
    `C ${tl - 12} ${BT} ${tl} ${BT - 12} ${tl} ${joinY}`,
    `V ${TT + tabR}`,
    `C ${tl} ${TT + tabR * 0.45} ${tl + tabR * 0.55} ${TT} ${tl + tabR} ${TT}`,
    `H ${R - BR}`,
    `C ${R - BR * 0.45} ${TT} ${R} ${TT + BR * 0.45} ${R} ${TT + BR}`,
    `V ${B - BR}`,
    `C ${R} ${B - BR * 0.55} ${R - BR * 0.55} ${B} ${R - BR} ${B}`,
    `H ${L + BR}`,
    `C ${L + BR * 0.55} ${B} ${L} ${B - BR * 0.55} ${L} ${B - BR}`,
    `V ${BT + BR}`,
    `C ${L} ${BT + BR * 0.55} ${L + BR * 0.55} ${BT} ${L + BR} ${BT}`,
    `Z`,
  ].join(" ");
}

/** Middle-tab notch with matching top radii + concave shoulders. */
function buildMiddlePath(tabLeft: number, tabWidth: number): string {
  const {
    left: L,
    right: R,
    bottom: B,
    bodyTop: BT,
    tabTop: TT,
    bodyR: BR,
    tabR,
    shoulder,
  } = PANEL;
  const tl = Math.max(L + BR + 8, tabLeft);
  const tr = Math.min(R - BR - 8, tabLeft + tabWidth);
  const leftShoulder = Math.max(L + BR, tl - shoulder);
  const rightShoulder = Math.min(R - BR, tr + shoulder);
  const joinY = TT + tabR + (BT - TT - tabR) * 0.35;

  return [
    `M ${L + BR} ${BT}`,
    `H ${leftShoulder}`,
    `C ${tl - 12} ${BT} ${tl} ${BT - 12} ${tl} ${joinY}`,
    `V ${TT + tabR}`,
    `C ${tl} ${TT + tabR * 0.45} ${tl + tabR * 0.55} ${TT} ${tl + tabR} ${TT}`,
    `H ${tr - tabR}`,
    `C ${tr - tabR * 0.55} ${TT} ${tr} ${TT + tabR * 0.45} ${tr} ${TT + tabR}`,
    `V ${joinY}`,
    `C ${tr} ${BT - 12} ${tr + 12} ${BT} ${rightShoulder} ${BT}`,
    `H ${R - BR}`,
    `C ${R - BR * 0.45} ${BT} ${R} ${BT + BR * 0.45} ${R} ${BT + BR}`,
    `V ${B - BR}`,
    `C ${R} ${B - BR * 0.45} ${R - BR * 0.45} ${B} ${R - BR} ${B}`,
    `H ${L + BR}`,
    `C ${L + BR * 0.45} ${B} ${L} ${B - BR * 0.45} ${L} ${B - BR}`,
    `V ${BT + BR}`,
    `C ${L} ${BT + BR * 0.45} ${L + BR * 0.45} ${BT} ${L + BR} ${BT}`,
    `Z`,
  ].join(" ");
}

type FlushMode = "left" | "right" | "middle";

function buildPanelPath(
  tabLeft: number,
  tabWidth: number,
  flush: FlushMode,
): string {
  if (flush === "left") {
    return buildFlushLeftPath(Math.max(140, tabLeft + tabWidth));
  }
  if (flush === "right") {
    return buildFlushRightPath(Math.min(PANEL.right - 140, tabLeft));
  }
  return buildMiddlePath(tabLeft, tabWidth);
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function renderParagraph(text: string, highlight?: string) {
  if (!highlight) return text;
  const idx = text.toLowerCase().indexOf(highlight.toLowerCase());
  if (idx === -1) return text;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + highlight.length);
  const after = text.slice(idx + highlight.length);
  return (
    <>
      {before}
      <strong>{match}</strong>
      {after}
    </>
  );
}

function FeaturePanelBorder({
  tabLeft,
  tabWidth,
  flush,
}: {
  tabLeft: number;
  tabWidth: number;
  flush: FlushMode;
}) {
  const path = useMemo(
    () => buildPanelPath(tabLeft, tabWidth, flush),
    [tabLeft, tabWidth, flush],
  );

  return (
    <svg
      className="features__panel-svg"
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path
        d={path}
        stroke="url(#features-panel-gradient)"
        strokeWidth="2"
        strokeMiterlimit="10"
        fill="none"
      />
      <defs>
        <linearGradient
          id="features-panel-gradient"
          x1={SVG_W / 2}
          y1="1"
          x2={SVG_W / 2}
          y2={SVG_H - 1}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#4AAFFE" />
          <stop offset="1" stopColor="#B849FF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function HomePage() {
  const [activeId, setActiveId] = useState<TabId>("moderavimas");
  const activeTab = FEATURE_TABS.find((t) => t.id === activeId) ?? FEATURE_TABS[0];
  const activeIndex = FEATURE_TABS.findIndex((t) => t.id === activeId);
  const flushMode: FlushMode =
    activeIndex <= 0
      ? "left"
      : activeIndex >= FEATURE_TABS.length - 1
        ? "right"
        : "middle";
  const shellRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [target, setTarget] = useState({ left: 12, width: 180 });
  const [anim, setAnim] = useState({ left: 12, width: 180 });
  const animRef = useRef(anim);
  const rafRef = useRef<number | null>(null);
  const { hash } = useLocation();

  const measureActiveTab = () => {
    const shell = shellRef.current;
    const tabBtn = tabsRef.current?.querySelector<HTMLElement>(
      `[data-tab="${activeId}"]`,
    );
    if (!shell || !tabBtn) return;

    const shellRect = shell.getBoundingClientRect();
    if (shellRect.width < 1) return;

    const tabRect = tabBtn.getBoundingClientRect();
    const scaleX = SVG_W / shellRect.width;
    setTarget({
      left: (tabRect.left - shellRect.left) * scaleX,
      width: tabRect.width * scaleX,
    });
  };

  useEffect(() => {
    animRef.current = anim;
  }, [anim]);

  useEffect(() => {
    measureActiveTab();
    const shell = shellRef.current;
    if (!shell || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => measureActiveTab());
    observer.observe(shell);
    window.addEventListener("resize", measureActiveTab);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measureActiveTab);
    };
  }, [activeId]);

  useEffect(() => {
    const from = animRef.current;
    const to = target;
    if (
      Math.abs(from.left - to.left) < 0.2 &&
      Math.abs(from.width - to.width) < 0.2
    ) {
      setAnim(to);
      return;
    }

    const duration = 380;
    const start = performance.now();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const e = easeInOutCubic(t);
      setAnim({
        left: from.left + (to.left - from.left) * e,
        width: from.width + (to.width - from.width) * e,
      });
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else rafRef.current = null;
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target.left, target.width]);

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".home .reveal");
    if (typeof IntersectionObserver === "undefined") {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      },
      // Any part entering (minus a 10% bottom band) — works for tall sections too.
      { threshold: 0, rootMargin: "0px 0px -10% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!hash) return;
    const id = hash.replace("#", "");
    const el = document.getElementById(id);
    if (!el) return;
    const timer = window.setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
    return () => window.clearTimeout(timer);
  }, [hash]);

  return (
    <div className="home">
      <SiteHeader />

      <section className="hero">
        <HeroScene />

        <div className="hero__copy">
          <h1 className="hero__title">
            Tavo serverio
            <br />
            dešinė ranka
          </h1>
          <p className="hero__desc">
            Lietuviškas Discord botas, kuris saugo nuo sukčių, skaičiuoja
            lygius, tvarko tiketus ir pasveikina naujus narius. Viską
            nustatai svetainėje — prisijungi su Discord ir pasirenki serverį.
          </p>
          <div className="hero__actions">
            <Link to="/panel" className="btn btn--gradient btn--hero-invite">
              <img
                src={discordIcon}
                alt=""
                className="btn__icon"
                width={20}
                height={15}
              />
              Pridėti į Discord
            </Link>
            <a href="#funkcijos" className="btn btn--outline-magenta btn--hero-commands">
              Žiūrėti funkcijas
              <span className="btn__arrow" aria-hidden="true">
                <img src={ellipse} alt="" width={20} height={20} />
                <img
                  src={arrowIcon}
                  alt=""
                  className="btn__arrow-chevron"
                  width={5}
                  height={10}
                />
              </span>
            </a>
          </div>
        </div>
      </section>

      <section className="features reveal" id="funkcijos">
        <div className="features__blur" aria-hidden="true" />

        <div className="features__shell" ref={shellRef}>
          <div className="features__panel" aria-hidden="true">
            <FeaturePanelBorder
              tabLeft={anim.left}
              tabWidth={anim.width}
              flush={flushMode}
            />
          </div>

          <div
            className="features__tabs"
            ref={tabsRef}
            role="tablist"
            aria-label="Funkcijos"
          >
            {FEATURE_TABS.map((tab) => {
              const selected = tab.id === activeId;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls="features-panel"
                  aria-label={tab.label}
                  title={tab.label}
                  id={`tab-${tab.id}`}
                  className={`features__tab${selected ? " features__tab--active" : ""}`}
                  data-tab={tab.id}
                  onClick={() => setActiveId(tab.id)}
                >
                  <img
                    src={tab.icon}
                    alt=""
                    width={tab.iconW}
                    height={tab.iconH}
                  />
                  <span className="features__tab-label">{tab.label}</span>
                  <span className="features__tab-short">{tab.shortLabel}</span>
                </button>
              );
            })}
          </div>

          <div
            className="features__content"
            role="tabpanel"
            id="features-panel"
            aria-labelledby={`tab-${activeId}`}
            key={activeId}
          >
            <h2 className="features__title">{activeTab.title}</h2>
            <div className="features__body">
              <p>
                {renderParagraph(activeTab.paragraphs[0], activeTab.highlight)}
              </p>
              <p>{activeTab.paragraphs[1]}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="why reveal" aria-labelledby="why-title">
        <p className="why__kicker">Kodėl Solidus?</p>
        <h2 className="why__title" id="why-title">
          Viskas, ko reikia bendruomenei
        </h2>
        <div className="why__grid">
          {HIGHLIGHTS.map((item) => (
            <article key={item.title} className="why__card">
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="steps reveal" aria-labelledby="steps-title">
        <h2 className="steps__title" id="steps-title">
          Pradėk per minutę
        </h2>
        <ol className="steps__list">
          {STEPS.map((step, i) => (
            <li key={step.title} className="steps__item">
              <span className="steps__num" aria-hidden="true">
                {i + 1}
              </span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="cta reveal" id="komandos">
        <h2 className="cta__title">Pasiruošę atnaujinti serverį?</h2>

        <div className="cta__action">
          <div className="cta__aura" aria-hidden="true">
            <img src={aura} alt="" />
          </div>
          <Link to="/panel" className="btn btn--gradient btn--cta">
            Pridėti SOLIDUS prie serverio
          </Link>
        </div>

        <div className="cta__stats">
          {STATS.map((stat) => (
            <div key={stat.label} className="cta__stat">
              <p className="cta__stat-value">{stat.value}</p>
              <p className="cta__stat-label">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
