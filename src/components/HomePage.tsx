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
  x: number;
  width: number;
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
    iconW: 29,
    iconH: 29,
    x: 1,
    width: 197.5,
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
    iconW: 32,
    iconH: 32,
    x: 209,
    width: 190,
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
    iconW: 34,
    iconH: 34,
    x: 409,
    width: 190,
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
    iconW: 31,
    iconH: 31,
    x: 609,
    width: 189,
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
    iconW: 29,
    iconH: 29,
    x: 806,
    width: 190,
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
    iconW: 27,
    iconH: 27,
    x: 996.5,
    width: 197.5,
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

const PANEL = {
  left: 1,
  right: 1194,
  bottom: 432,
  bodyTop: 77.1051,
  tabTop: 1,
  bodyR: 30.91,
  tabR: 20,
} as const;

function buildFlushLeftPath(tabRight: number): string {
  const tr = tabRight;
  return [
    `M 1163.09 77.1051`,
    `H ${tr + 35.938}`,
    `H ${tr + 29.358}`,
    `C ${tr + 12.285} 77.1051 ${tr} 65.1255 ${tr} 48.0165`,
    `V 27.7141`,
    `C ${tr - 0.339} 12.0282 ${tr - 14.985} 1 ${tr - 30.614} 1`,
    `H 31.9107`,
    `C 14.8371 0.991731 1 14.8576 1 31.9665`,
    `V 401.025`,
    `C 1 418.134 14.8371 432 31.9107 432`,
    `H 1163.09`,
    `C 1180.16 432 1194 418.134 1194 401.025`,
    `V 108.08`,
    `C 1194 90.9709 1180.16 77.1051 1163.09 77.1051`,
    `Z`,
  ].join(" ");
}

function buildFlushRightPath(tabLeft: number): string {
  const tl = tabLeft;
  const R = PANEL.right;
  return [
    `M 31.91 77.1051`,
    `H ${tl - 35.938}`,
    `H ${tl - 29.358}`,
    `C ${tl - 12.285} 77.1051 ${tl} 65.1255 ${tl} 48.0165`,
    `V 27.7141`,
    `C ${tl + 0.339} 12.0282 ${tl + 14.985} 1 ${tl + 30.614} 1`,
    `H ${R - 31.9107}`,
    `C ${R - 14.8371} 0.991731 ${R} 14.8576 ${R} 31.9665`,
    `V 401.025`,
    `C ${R} 418.134 ${R - 14.8371} 432 ${R - 31.9107} 432`,
    `H 31.9107`,
    `C 14.8371 432 1 418.134 1 401.025`,
    `V 108.08`,
    `C 1 90.9709 14.8371 77.1051 31.91 77.1051`,
    `Z`,
  ].join(" ");
}

function buildMiddlePath(tabLeft: number, tabWidth: number): string {
  const { left: L, right: R, bottom: B, bodyTop: BT, tabTop: TT, bodyR: BR } =
    PANEL;
  const shoulder = 29.5;
  const tl = Math.max(L + BR + 8, tabLeft);
  const tr = Math.min(R - BR - 8, tabLeft + tabWidth);
  const leftShoulder = Math.max(L + BR, tl - shoulder);
  const rightShoulder = Math.min(R - BR, tr + shoulder);

  return [
    `M ${L + BR} ${BT}`,
    `H ${leftShoulder}`,
    `C ${tl - 12.285} ${BT} ${tl} ${BT - 11.98} ${tl} ${BT - 29.09}`,
    `V ${TT + 26.714}`,
    `C ${tl} ${TT + 11.028} ${tl + 14.985} ${TT} ${tl + 30.614} ${TT}`,
    `H ${tr - 30.614}`,
    `C ${tr - 14.985} ${TT} ${tr} ${TT + 11.028} ${tr} ${TT + 26.714}`,
    `V ${BT - 29.09}`,
    `C ${tr} ${BT - 11.98} ${tr + 12.285} ${BT} ${rightShoulder} ${BT}`,
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

function buildPanelPath(tabLeft: number, tabWidth: number): string {
  const tabRight = tabLeft + tabWidth;
  if (tabLeft <= 12) {
    return buildFlushLeftPath(Math.max(160, Math.min(240, tabRight)));
  }
  if (tabRight >= PANEL.right - 12) {
    return buildFlushRightPath(
      Math.max(PANEL.right - 240, Math.min(PANEL.right - 160, tabLeft)),
    );
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
}: {
  tabLeft: number;
  tabWidth: number;
}) {
  const path = useMemo(
    () => buildPanelPath(tabLeft, tabWidth),
    [tabLeft, tabWidth],
  );

  return (
    <svg
      className="features__panel-svg"
      viewBox="0 0 1198 433"
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
          x1="597.5"
          y1="1"
          x2="597.5"
          y2="432"
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
  const [anim, setAnim] = useState({
    left: activeTab.x,
    width: activeTab.width,
  });
  const animRef = useRef(anim);
  const rafRef = useRef<number | null>(null);
  const { hash } = useLocation();

  useEffect(() => {
    animRef.current = anim;
  }, [anim]);

  useEffect(() => {
    const from = animRef.current;
    const to = { left: activeTab.x, width: activeTab.width };
    if (from.left === to.left && from.width === to.width) return;

    const duration = 420;
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
  }, [activeTab.x, activeTab.width]);

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

        <div className="features__shell">
          <div className="features__panel" aria-hidden="true">
            <FeaturePanelBorder tabLeft={anim.left} tabWidth={anim.width} />
          </div>

          <div className="features__tabs" role="tablist" aria-label="Funkcijos">
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
        <a href="#invite" className="btn btn--gradient btn--cta">
          Pridėti SOLIDUS prie serverio
        </a>
        <div className="cta__stats">
          {STATS.map((stat) => (
            <div key={stat.label} className="cta__stat">
              <p className="cta__stat-value">{stat.value}</p>
              <p className="cta__stat-label">{stat.label}</p>
            </div>
          ))}
        </div>
        <div className="cta__aura" aria-hidden="true">
          <img src={aura} alt="" />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
