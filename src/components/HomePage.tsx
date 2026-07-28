import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  solidusWordmark,
  robot,
  wave,
  subtleWave,
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
    title: "Lorem ipsum dolor",
    paragraphs: [
      "Sed egestas vulputate sem, malesuada luctus ex egestas vitae. Aliquam pulvinar lacus vitae purus dapibus, ut dictum nunc pharetra. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Sed sit amet efficitur nibh, vitae aliquam sapien. Nullam eu venenatis nibh. Praesent mattis eget sapien tincidunt accumsan.",
      "Cras tellus felis, lacinia ut maximus quis, faucibus sit amet risus. Nullam blandit augue eget imperdiet efficitur. Vivamus sed ante dictum, laoreet libero ac, faucibus justo.",
    ],
    highlight: "natoque penatibus",
  },
  {
    id: "irankiai",
    label: "ĮRANKIAI",
    shortLabel: "Įrankiai",
    icon: irankiaiIcon,
    iconW: 26,
    iconH: 26,
    title: "Įrankiai serveriui",
    paragraphs: [
      "Greiti ir patogūs įrankiai, kurie padeda valdyti roles, kanalus ir narius be triukšmo. Sukurkite šablonus, paleiskite veiksmus vienu mygtuku ir sutaupykite laiką kasdieniam darbui.",
      "Viskas veikia tiesiogiai Discord aplinkoje — jokių papildomų skydelių ar sudėtingų nustatymų, tik aiškūs veiksmai kai jų reikia.",
    ],
    highlight: "vienu mygtuku",
  },
  {
    id: "ekonomika",
    label: "EKONOMIKA",
    shortLabel: "Eko",
    icon: ekonomikaIcon,
    iconW: 26,
    iconH: 26,
    title: "Ekonomikos sistema",
    paragraphs: [
      "Sukurkite serverio ekonomiką su balansu, prekėmis ir apdovanojimais. Skatinkite aktyvumą, prekybą tarp narių ir ilgalaikį įsitraukimą be rankinio darbo.",
      "Nustatykite pajamas, baudas ir parduotuvę pagal savo bendruomenės ritmą — sistema prisitaiko prie jūsų taisyklių.",
    ],
    highlight: "apdovanojimais",
  },
  {
    id: "automatika",
    label: "AUTOMATIKA",
    shortLabel: "Auto",
    icon: automatikaIcon,
    iconW: 26,
    iconH: 26,
    title: "Automatikos srautai",
    paragraphs: [
      "Automatizuokite pasveikinimus, roles, priminimus ir reakcijas. Paleiskite srautus pagal įvykius ir palikite rutiną botui, o sau — svarbiausius sprendimus.",
      "Lanksčios sąlygos ir aiškūs trigeriai leidžia sudėlioti procesus taip, kaip veikia jūsų serveris.",
    ],
    highlight: "Pagal įvykius",
  },
  {
    id: "apsauga",
    label: "APSAUGA",
    shortLabel: "Apsauga",
    icon: saugumasIcon,
    iconW: 26,
    iconH: 26,
    title: "Apsaugos sluoksnis",
    paragraphs: [
      "Apsaugokite bendruomenę nuo spamo, raidų ir kenksmingų nuorodų. Filtrai, limitai ir greiti veiksmai padeda išlaikyti tvarką dar prieš problemoms išaugant.",
      "Matykite incidentus, reaguokite greitai ir laikykite serverį saugų be nuolatinės priežiūros.",
    ],
    highlight: "kenksmingų nuorodų",
  },
  {
    id: "tinkinimas",
    label: "TINKINIMAS",
    shortLabel: "Tinkinimas",
    icon: tinkinimasIcon,
    iconW: 26,
    iconH: 26,
    title: "Pilnas tinkinimas",
    paragraphs: [
      "Derinkite komandas, žinutes ir elgesį pagal savo stilių. Nustatykite kalbą, teises ir išvaizdą taip, kad Solidus jaustųsi natūralia jūsų serverio dalimi.",
      "Keiskite detales bet kada — be perkrovimų ir be painių konfigūracijų.",
    ],
    highlight: "natūralia",
  },
];

const STATS = [
  { value: "100K+", label: "SERVERIŲ" },
  { value: "500K+", label: "NAUDOTOJŲ" },
  { value: "99,9%", label: "VEIKIMO LAIKAS" },
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
        <div className="hero__visual" aria-hidden="true">
          <img className="hero__wave" src={wave} alt="" />
          <img className="hero__subtle" src={subtleWave} alt="" />
          <img className="hero__wordmark" src={solidusWordmark} alt="" />
          <img className="hero__robot" src={robot} alt="" />
        </div>

        <div className="hero__copy">
          <h1 className="hero__title">
            Sukurtas
            <br />
            viskam atvirti
          </h1>
          <p className="hero__desc">
            Galingas ir paprastas botas su funkcijomis, kurios padeda saugoti ir
            tvarkyti jūsų bendruomenę — moderavimas, rolės, automatika ir
            daugiau. Viskas ko reikia bendruomenės valdymui, apsaugai ir augimui
          </p>
          <div className="hero__actions">
            <a href="#invite" className="btn btn--gradient btn--hero-invite">
              <img
                src={discordIcon}
                alt=""
                className="btn__icon"
                width={20}
                height={15}
              />
              Įkelti į DISCORD
            </a>
            <a href="#komandos" className="btn btn--outline-magenta btn--hero-commands">
              Žiūrėti komandas
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

      <section className="features" id="funkcijos">
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

      <section className="cta" id="komandos">
        <h2 className="cta__title">Pasiruošę atnaujinti serverį?</h2>

        <div className="cta__action">
          <div className="cta__aura" aria-hidden="true">
            <img src={aura} alt="" />
          </div>
          <a href="#invite" className="btn btn--gradient btn--cta">
            Pridėti SOLIDUS prie serverio
          </a>
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
