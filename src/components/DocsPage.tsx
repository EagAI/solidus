import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  moderavimasIcon,
  irankiaiIcon,
  ekonomikaIcon,
  automatikaIcon,
  saugumasIcon,
  tinkinimasIcon,
} from "../assets";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";
import "./DocsPage.css";

type DocSection = {
  id: string;
  label: string;
  icon?: string;
  group?: string;
};

const TOC: DocSection[] = [
  { id: "pradzia", label: "Pradžia", group: "Bendri" },
  { id: "idiegimas", label: "Įdiegimas", group: "Bendri" },
  { id: "moderavimas", label: "Moderavimas", icon: moderavimasIcon, group: "Funkcijos" },
  { id: "irankiai", label: "Įrankiai", icon: irankiaiIcon, group: "Funkcijos" },
  { id: "ekonomika", label: "Ekonomika", icon: ekonomikaIcon, group: "Funkcijos" },
  { id: "automatika", label: "Automatika", icon: automatikaIcon, group: "Funkcijos" },
  { id: "apsauga", label: "Apsauga", icon: saugumasIcon, group: "Funkcijos" },
  { id: "tinkinimas", label: "Tinkinimas", icon: tinkinimasIcon, group: "Funkcijos" },
  { id: "komandos", label: "Komandos", group: "Naudojimas" },
  { id: "duk", label: "DUK", group: "Naudojimas" },
];

type Indicator = { top: number; height: number };

export default function DocsPage() {
  const [activeId, setActiveId] = useState(TOC[0].id);
  const [indicator, setIndicator] = useState<Indicator>({ top: 0, height: 40 });
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const sections = TOC.map((item) => document.getElementById(item.id)).filter(
      Boolean,
    ) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0.1, 0.25, 0.5, 0.75],
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const btn = itemRefs.current[activeId];
    const nav = navRef.current;
    if (!btn || !nav) return;

    const navBox = nav.getBoundingClientRect();
    const btnBox = btn.getBoundingClientRect();
    setIndicator({
      top: btnBox.top - navBox.top + nav.scrollTop,
      height: btnBox.height,
    });
  }, [activeId]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    setActiveId(id);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  let lastGroup = "";

  return (
    <div className="docs">
      <SiteHeader />

      <div className="docs__shell">
        <aside className="docs__sidebar">
          <div className="docs__sidebar-card">
            <p className="docs__sidebar-kicker">Dokumentacija</p>
            <h1 className="docs__sidebar-title">Solidus gidas</h1>
            <p className="docs__sidebar-desc">
              Visos bot funkcijos, komandos ir nustatymai vienoje vietoje.
            </p>

            <nav className="docs__toc" ref={navRef} aria-label="Turinys">
              <span
                className="docs__toc-indicator"
                style={{
                  transform: `translateY(${indicator.top}px)`,
                  height: indicator.height,
                }}
                aria-hidden="true"
              />

              {TOC.map((item) => {
                const showGroup = item.group && item.group !== lastGroup;
                if (item.group) lastGroup = item.group;

                return (
                  <div key={item.id} className="docs__toc-block">
                    {showGroup ? (
                      <p className="docs__toc-group">{item.group}</p>
                    ) : null}
                    <button
                      type="button"
                      className={
                        "docs__toc-item" +
                        (activeId === item.id ? " docs__toc-item--active" : "")
                      }
                      ref={(node) => {
                        itemRefs.current[item.id] = node;
                      }}
                      onClick={() => scrollTo(item.id)}
                    >
                      {item.icon ? (
                        <img src={item.icon} alt="" width={20} height={20} />
                      ) : (
                        <span className="docs__toc-dot" />
                      )}
                      <span>{item.label}</span>
                    </button>
                  </div>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="docs__main">
          <section className="docs__section" id="pradzia">
            <p className="docs__eyebrow">Pradžia</p>
            <h2>Sveiki atvykę į Solidus</h2>
            <p>
              Solidus — galingas ir paprastas Discord botas bendruomenių
              valdymui, apsaugai ir augimui. Ši dokumentacija padės greitai
              įdiegti botą ir išnaudoti visas funkcijas.
            </p>
            <div className="docs__cards">
              <article className="docs__card">
                <h3>Greitas startas</h3>
                <p>Įkelkite botą, suteikite teises ir pradėkite per kelias minutes.</p>
              </article>
              <article className="docs__card">
                <h3>Moduliai</h3>
                <p>Moderavimas, ekonomika, automatika, apsauga ir tinkinimas.</p>
              </article>
              <article className="docs__card">
                <h3>Slash komandos</h3>
                <p>Visos pagrindinės komandos veikia per Discord slash meniu.</p>
              </article>
            </div>
          </section>

          <section className="docs__section" id="idiegimas">
            <p className="docs__eyebrow">Bendri</p>
            <h2>Įdiegimas</h2>
            <ol className="docs__steps">
              <li>
                <strong>Įkelkite Solidus</strong>
                <span>Paspauskite „Įkelti į DISCORD“ ir pasirinkite serverį.</span>
              </li>
              <li>
                <strong>Suteikite teises</strong>
                <span>
                  Rekomenduojame rolę su Manage Messages, Manage Roles, Kick/Ban
                  ir View Channels.
                </span>
              </li>
              <li>
                <strong>Paleiskite sąranką</strong>
                <span>
                  Naudokite <code>/setup</code> ir pasirinkite log kanalą bei
                  pagrindines roles.
                </span>
              </li>
              <li>
                <strong>Patikrinkite veikimą</strong>
                <span>
                  Įveskite <code>/help</code> — jei botas atsako, viskas veikia.
                </span>
              </li>
            </ol>
          </section>

          <section className="docs__section" id="moderavimas">
            <p className="docs__eyebrow">Funkcijos</p>
            <div className="docs__heading-row">
              <img src={moderavimasIcon} alt="" width={32} height={32} />
              <h2>Moderavimas</h2>
            </div>
            <p>
              Greiti ir saugūs moderavimo veiksmai su aiškiais logais. Išsaugokite
              tvarką be chaoso pokalbiuose.
            </p>
            <div className="docs__table-wrap">
              <table className="docs__table">
                <thead>
                  <tr>
                    <th>Komanda</th>
                    <th>Aprašymas</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <code>/warn</code>
                    </td>
                    <td>Įspėja narį ir įrašo priežastį į logus.</td>
                  </tr>
                  <tr>
                    <td>
                      <code>/mute</code>
                    </td>
                    <td>Laikinai apriboja rašymą pasirinktame kanale ar visur.</td>
                  </tr>
                  <tr>
                    <td>
                      <code>/kick</code>
                    </td>
                    <td>Pašalina narį iš serverio su priežastimi.</td>
                  </tr>
                  <tr>
                    <td>
                      <code>/ban</code>
                    </td>
                    <td>Užblokuoja narį ir neleidžia grįžti be leidimo.</td>
                  </tr>
                  <tr>
                    <td>
                      <code>/purge</code>
                    </td>
                    <td>Išvalo nurodytą žinučių kiekį kanale.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="docs__section" id="irankiai">
            <p className="docs__eyebrow">Funkcijos</p>
            <div className="docs__heading-row">
              <img src={irankiaiIcon} alt="" width={32} height={32} />
              <h2>Įrankiai</h2>
            </div>
            <p>
              Kasdieniai serverio įrankiai rolėms, kanalams ir narių valdymui —
              be papildomų skydelių.
            </p>
            <ul className="docs__bullets">
              <li>
                <strong>Role meniu</strong> — nariai patys pasiima roles per
                mygtukus ar select meniu.
              </li>
              <li>
                <strong>Embed kūrimas</strong> — gražūs skelbimai ir taisyklės
                per <code>/embed</code>.
              </li>
              <li>
                <strong>Šablonai</strong> — išsaugokite dažnus veiksmus ir
                paleiskite juos vienu mygtuku.
              </li>
              <li>
                <strong>Statistika</strong> — serverio aktyvumo ir narių
                suvestinės.
              </li>
            </ul>
          </section>

          <section className="docs__section" id="ekonomika">
            <p className="docs__eyebrow">Funkcijos</p>
            <div className="docs__heading-row">
              <img src={ekonomikaIcon} alt="" width={32} height={32} />
              <h2>Ekonomika</h2>
            </div>
            <p>
              Sukurkite serverio ekonomiką su balansu, parduotuve ir
              apdovanojimais už aktyvumą.
            </p>
            <div className="docs__cards docs__cards--2">
              <article className="docs__card">
                <h3>Valiuta</h3>
                <p>
                  Nustatykite pavadinimą, simbolį ir pradinius kreditus naujiems
                  nariams.
                </p>
              </article>
              <article className="docs__card">
                <h3>Parduotuvė</h3>
                <p>
                  Pardavinėkite roles, daiktus ar privilegijas už serverio
                  kreditus.
                </p>
              </article>
              <article className="docs__card">
                <h3>Darbai</h3>
                <p>
                  Kasdieniai <code>/work</code>, <code>/daily</code> ir kiti
                  uždarbio šaltiniai.
                </p>
              </article>
              <article className="docs__card">
                <h3>Lyderių lentelė</h3>
                <p>
                  Rodykite turtingiausius narius ir skatinkite sveiką
                  konkurenciją.
                </p>
              </article>
            </div>
          </section>

          <section className="docs__section" id="automatika">
            <p className="docs__eyebrow">Funkcijos</p>
            <div className="docs__heading-row">
              <img src={automatikaIcon} alt="" width={32} height={32} />
              <h2>Automatika</h2>
            </div>
            <p>
              Automatizuokite pasveikinimus, roles, priminimus ir reakcijas pagal
              įvykius.
            </p>
            <ul className="docs__bullets">
              <li>
                <strong>Welcome srautai</strong> — automatinė žinutė, rolė ir DM
                naujiems nariams.
              </li>
              <li>
                <strong>Reaction roles</strong> — rolės pagal emoji reakcijas.
              </li>
              <li>
                <strong>Planuoti pranešimai</strong> — skelbimai ir reminderiai
                pagal grafiką.
              </li>
              <li>
                <strong>Trigeriai</strong> — paleiskite veiksmus pagal žodžius,
                roles ar kanalus.
              </li>
            </ul>
          </section>

          <section className="docs__section" id="apsauga">
            <p className="docs__eyebrow">Funkcijos</p>
            <div className="docs__heading-row">
              <img src={saugumasIcon} alt="" width={32} height={32} />
              <h2>Apsauga</h2>
            </div>
            <p>
              Apsaugokite bendruomenę nuo spamo, raidų ir kenksmingų nuorodų dar
              prieš incidentams išaugant.
            </p>
            <div className="docs__table-wrap">
              <table className="docs__table">
                <thead>
                  <tr>
                    <th>Filtras</th>
                    <th>Ką daro</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Anti-spam</td>
                    <td>Ribojimai greitam žinučių ir mention spamui.</td>
                  </tr>
                  <tr>
                    <td>Anti-raid</td>
                    <td>Laikinai stabdo masinius join’us ir automatiškai mute’ina.</td>
                  </tr>
                  <tr>
                    <td>Nuorodų filtras</td>
                    <td>Blokuoja nežinomus ar pavojingus domenus.</td>
                  </tr>
                  <tr>
                    <td>Žodžių filtras</td>
                    <td>Automatiškai trina arba mute’ina pagal blacklist.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="docs__section" id="tinkinimas">
            <p className="docs__eyebrow">Funkcijos</p>
            <div className="docs__heading-row">
              <img src={tinkinimasIcon} alt="" width={32} height={32} />
              <h2>Tinkinimas</h2>
            </div>
            <p>
              Derinkite Solidus pagal savo serverio stilių — kalbą, teises,
              žinutes ir modulius.
            </p>
            <ul className="docs__bullets">
              <li>
                <strong>Kalba</strong> — lietuvių / anglų atsakymai.
              </li>
              <li>
                <strong>Prefix / slash</strong> — pasirinkite kaip nariai kviečia
                komandas.
              </li>
              <li>
                <strong>Moduliai</strong> — įjunkite tik tai, ko reikia jūsų
                bendruomenei.
              </li>
              <li>
                <strong>Teisių matricos</strong> — apribokite komandas pagal roles.
              </li>
            </ul>
          </section>

          <section className="docs__section" id="komandos">
            <p className="docs__eyebrow">Naudojimas</p>
            <h2>Komandos</h2>
            <p>
              Dažniausios slash komandos. Pilną sąrašą visada rasite su{" "}
              <code>/help</code>.
            </p>
            <div className="docs__table-wrap">
              <table className="docs__table">
                <thead>
                  <tr>
                    <th>Komanda</th>
                    <th>Modulis</th>
                    <th>Aprašymas</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <code>/setup</code>
                    </td>
                    <td>Bendri</td>
                    <td>Pradinė serverio konfigūracija.</td>
                  </tr>
                  <tr>
                    <td>
                      <code>/help</code>
                    </td>
                    <td>Bendri</td>
                    <td>Komandų pagalba ir moduliai.</td>
                  </tr>
                  <tr>
                    <td>
                      <code>/userinfo</code>
                    </td>
                    <td>Įrankiai</td>
                    <td>Nario informacija ir rolės.</td>
                  </tr>
                  <tr>
                    <td>
                      <code>/balance</code>
                    </td>
                    <td>Ekonomika</td>
                    <td>Parodo kreditų balansą.</td>
                  </tr>
                  <tr>
                    <td>
                      <code>/automod</code>
                    </td>
                    <td>Apsauga</td>
                    <td>Automod filtrų nustatymai.</td>
                  </tr>
                  <tr>
                    <td>
                      <code>/config</code>
                    </td>
                    <td>Tinkinimas</td>
                    <td>Serverio nustatymų skydelis.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="docs__section" id="duk">
            <p className="docs__eyebrow">Naudojimas</p>
            <h2>Dažni klausimai</h2>
            <div className="docs__faq">
              <details open>
                <summary>Kodėl botas neatsako į komandas?</summary>
                <p>
                  Patikrinkite, ar Solidus turi teisę matyti kanalą ir naudoti
                  slash komandas. Taip pat paleiskite Discord iš naujo, kad
                  atsinaujintų komandų meniu.
                </p>
              </details>
              <details>
                <summary>Ar galima išjungti atskirus modulius?</summary>
                <p>
                  Taip. Naudokite <code>/config modules</code> ir išjunkite
                  nereikalingas funkcijas.
                </p>
              </details>
              <details>
                <summary>Kur keliauja moderavimo logai?</summary>
                <p>
                  Į kanalą, kurį pasirinkote per <code>/setup</code> arba{" "}
                  <code>/config logs</code>.
                </p>
              </details>
              <details>
                <summary>Kaip gauti daugiau pagalbos?</summary>
                <p>
                  Eikite į <Link to="/pagalba">Pagalbos</Link> puslapį arba
                  parašykite per Discord, WhatsApp ar X.
                </p>
              </details>
            </div>
          </section>
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
