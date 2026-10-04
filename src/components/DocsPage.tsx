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
  { id: "panele", label: "Valdymo panelė", icon: tinkinimasIcon, group: "Bendri" },
  { id: "moderavimas", label: "Moderavimas", icon: moderavimasIcon, group: "Funkcijos" },
  { id: "lygiai", label: "Lygiai ir XP", icon: ekonomikaIcon, group: "Funkcijos" },
  { id: "irankiai", label: "Tiketai ir giveaway", icon: irankiaiIcon, group: "Funkcijos" },
  { id: "automatika", label: "Automatika", icon: automatikaIcon, group: "Funkcijos" },
  { id: "apsauga", label: "Apsauga", icon: saugumasIcon, group: "Funkcijos" },
  { id: "komandos", label: "Visos komandos", group: "Naudojimas" },
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
              Visos boto funkcijos, komandos ir valdymo panelė vienoje vietoje.
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
              Solidus — lietuviškas Discord botas bendruomenėms: lygiai ir XP,
              moderavimas, tiketai, giveaway, automatiniai pasveikinimai ir
              apsauga nuo sukčių. Nustatymai keičiami svetainės valdymo
              panelėje, o kasdienis darbas vyksta per slash komandas.
            </p>
            <div className="docs__cards">
              <article className="docs__card">
                <h3>Pakvietimas per panelę</h3>
                <p>
                  Prisijunk su Discord, pasirink serverį ir pakviesk botą vienu
                  paspaudimu.
                </p>
              </article>
              <article className="docs__card">
                <h3>Nustatymai per serverį</h3>
                <p>Kiekvienas serveris turi savo modulius, kanalus ir roles.</p>
              </article>
              <article className="docs__card">
                <h3>Slash komandos</h3>
                <p>
                  Įvesk <code>/</code> Discord'e ir pasirink Solidus komandą.
                </p>
              </article>
            </div>
          </section>

          <section className="docs__section" id="idiegimas">
            <p className="docs__eyebrow">Bendri</p>
            <h2>Įdiegimas</h2>
            <ol className="docs__steps">
              <li>
                <strong>Atidaryk valdymo panelę</strong>
                <span>
                  Eik į <Link to="/panel">solidus.bot/panel</Link> ir spausk
                  „Prisijungti su Discord“.
                </span>
              </li>
              <li>
                <strong>Pasirink serverį</strong>
                <span>
                  Skiltyje „Pakviesk Solidus“ prie norimo serverio spausk
                  „Pakviesti“. Discord lange serveris jau bus pažymėtas.
                </span>
              </li>
              <li>
                <strong>Patvirtink teises</strong>
                <span>
                  Botas prašo Administrator teisės, kad veiktų moderavimas,
                  rolės, tiketų kanalai ir voice kambariai.
                </span>
              </li>
              <li>
                <strong>Patikrink veikimą</strong>
                <span>
                  Grįžk į panelę — serveris atsiras skiltyje „Valdomi serveriai“.
                  Discord'e įvesk <code>/lygis</code>: jei botas atsako, viskas
                  veikia.
                </span>
              </li>
            </ol>
          </section>

          <section className="docs__section" id="panele">
            <p className="docs__eyebrow">Bendri</p>
            <div className="docs__heading-row">
              <img src={tinkinimasIcon} alt="" width={32} height={32} />
              <h2>Valdymo panelė</h2>
            </div>
            <p>
              Prisijungęs su Discord matai visus savo serverius, suskirstytus į
              tris grupes:
            </p>
            <div className="docs__table-wrap">
              <table className="docs__table">
                <thead>
                  <tr>
                    <th>Grupė</th>
                    <th>Kas čia patenka</th>
                    <th>Ką gali daryti</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Valdomi serveriai</td>
                    <td>
                      Esi savininkas, Administrator arba turi Manage Server, ir
                      Solidus jau yra
                    </td>
                    <td>„Valdyti“ — keisti serverio nustatymus</td>
                  </tr>
                  <tr>
                    <td>Pakviesk Solidus</td>
                    <td>Turi tas pačias teises, bet boto dar nėra</td>
                    <td>„Pakviesti“ — įkelti botą</td>
                  </tr>
                  <tr>
                    <td>Kiti serveriai</td>
                    <td>Esi paprastas narys</td>
                    <td>Tik matai, ar Solidus ten veikia</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <ul className="docs__bullets">
              <li>
                <strong>Nustatymai saugomi atskirai kiekvienam serveriui</strong>{" "}
                — pakeitimai viename neturi įtakos kitam.
              </li>
              <li>
                <strong>Moduliai</strong> — įjunk ar išjunk pasveikinimus,
                atsisveikinimus, autorolę, lygius, tiketus, <code>/parukom</code>{" "}
                ir <code>/slap</code>. Išjungto modulio komandos dingsta iš
                Discord meniu.
              </li>
              <li>
                <strong>Saugumas</strong> — serverio nustatymus mato ir keičia
                tik tie, kas tą serverį valdo Discord'e. Praradus teises,
                prieiga prie panelės dingsta.
              </li>
            </ul>
          </section>

          <section className="docs__section" id="moderavimas">
            <p className="docs__eyebrow">Funkcijos</p>
            <div className="docs__heading-row">
              <img src={moderavimasIcon} alt="" width={32} height={32} />
              <h2>Moderavimas</h2>
            </div>
            <p>
              Moderavimo komandas gali naudoti serverio savininkas ir
              moderatorių rolės.
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
                      <code>/admin ban</code>
                    </td>
                    <td>Užbanina narį, priežastis nebūtina.</td>
                  </tr>
                  <tr>
                    <td>
                      <code>/admin kick</code>
                    </td>
                    <td>Išmeta narį iš serverio.</td>
                  </tr>
                  <tr>
                    <td>
                      <code>/admin timeout</code>
                    </td>
                    <td>
                      Laiko limitas nariui: <code>30min</code>, <code>2h</code>,{" "}
                      <code>1d</code> arba skaičius minutėmis.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code>/admin bomb</code>
                    </td>
                    <td>10 sekundžių timeout su pranešimu kanale.</td>
                  </tr>
                  <tr>
                    <td>
                      <code>/admin purge</code>
                    </td>
                    <td>Ištrina žinutes kanale (iki 100 vienu kartu).</td>
                  </tr>
                  <tr>
                    <td>
                      <code>/slap</code>
                    </td>
                    <td>
                      Atsako į žinutę slap GIF'u, duoda timeout ir atima XP.
                      Reikia Moderate Members teisės.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Redaguotos ir ištrintos žinutės automatiškai užfiksuojamos logų
              kanale.
            </p>
          </section>

          <section className="docs__section" id="lygiai">
            <p className="docs__eyebrow">Funkcijos</p>
            <div className="docs__heading-row">
              <img src={ekonomikaIcon} alt="" width={32} height={32} />
              <h2>Lygiai ir XP</h2>
            </div>
            <p>
              Nariai gauna XP už bendravimą ir kyla lygiais. Numatyta: 15 XP už
              žinutę, ne dažniau nei kas 5 sekundes.
            </p>
            <div className="docs__cards docs__cards--2">
              <article className="docs__card">
                <h3>Lygio kortelė</h3>
                <p>
                  <code>/lygis</code> parodo tavo ar kito nario kortelę su XP
                  progresu.
                </p>
              </article>
              <article className="docs__card">
                <h3>Lyderių lentelė</h3>
                <p>
                  <code>/lyderiai</code> — top 15 narių pagal XP kaip grafika.
                </p>
              </article>
              <article className="docs__card">
                <h3>Lygio pakilimai</h3>
                <p>
                  Pakilus lygiu, botas paskelbia kortelę. Ypatingiems lygiams —
                  didesnė, šventinė.
                </p>
              </article>
              <article className="docs__card">
                <h3>Lygio rolės</h3>
                <p>
                  Pasiekus lygį, suteikiama rolė. Galima palikti tik aukščiausią
                  arba kaupti visas.
                </p>
              </article>
            </div>
            <p>
              Moderatoriai gali uždėti nariui individualų kortelės foną su{" "}
              <code>/admin lygisbg</code>.
            </p>
          </section>

          <section className="docs__section" id="irankiai">
            <p className="docs__eyebrow">Funkcijos</p>
            <div className="docs__heading-row">
              <img src={irankiaiIcon} alt="" width={32} height={32} />
              <h2>Tiketai ir giveaway</h2>
            </div>
            <ul className="docs__bullets">
              <li>
                <strong>Tiketai</strong> — <code>/ticket</code> išsiunčia
                skydelį į kanalą. Narys pasirenka kategoriją (Pagalba,
                Pranešimas, Klausimas), ir botas sukuria privatų kanalą su
                komanda. Visa tiketų istorija matoma panelėje.
              </li>
              <li>
                <strong>Giveaway</strong> — <code>/giveaway create</code>{" "}
                atidaro formą prizui ir trukmei. <code>/giveaway end</code>{" "}
                baigia anksčiau, <code>/giveaway reroll</code> išrenka naujus
                laimėtojus.
              </li>
              <li>
                <strong>/parukom</strong> — 10 minučių kvietimas „parūkyti“ su
                mygtuku. Prisijungę gauna šiek tiek XP.
              </li>
            </ul>
          </section>

          <section className="docs__section" id="automatika">
            <p className="docs__eyebrow">Funkcijos</p>
            <div className="docs__heading-row">
              <img src={automatikaIcon} alt="" width={32} height={32} />
              <h2>Automatika</h2>
            </div>
            <ul className="docs__bullets">
              <li>
                <strong>Pasveikinimai</strong> — naujam nariui pasveikinimas
                kanale, baneris arba kortelė (keičiama panelėje).
              </li>
              <li>
                <strong>Atsisveikinimai</strong> — žinutė išėjus nariui, su{" "}
                <code>{"{user}"}</code> vietoje vardo.
              </li>
              <li>
                <strong>Autorolė ir patvirtinimas</strong> — prisijungęs narys
                gauna rolę, o paspaudęs patvirtinimo mygtuką — pilną prieigą.
              </li>
              <li>
                <strong>Voice kambariai</strong> — prisijungus prie „hub“
                kanalo, botas sukuria tau asmeninį voice kambarį ir ištrina jį,
                kai visi išeina.
              </li>
              <li>
                <strong>YouTube skelbimai</strong> — naujas vaizdo įrašas ar
                live automatiškai paskelbiamas kanale.
              </li>
            </ul>
          </section>

          <section className="docs__section" id="apsauga">
            <p className="docs__eyebrow">Funkcijos</p>
            <div className="docs__heading-row">
              <img src={saugumasIcon} alt="" width={32} height={32} />
              <h2>Apsauga</h2>
            </div>
            <div className="docs__table-wrap">
              <table className="docs__table">
                <thead>
                  <tr>
                    <th>Apsauga</th>
                    <th>Ką daro</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Anti-scam (nuotraukos)</td>
                    <td>
                      Nuskaito įkeltų nuotraukų tekstą ir atpažįsta sukčių
                      schemas (netikri giveaway, „nemokamas Nitro“). Siuntėjas
                      gauna timeout, o moderatoriai — pranešimą su mygtukais.
                    </td>
                  </tr>
                  <tr>
                    <td>Discord pakvietimai</td>
                    <td>
                      Svetimų serverių pakvietimai ištrinami, siuntėjui
                      skiriamas timeout. Moderatoriai gali užbaninti arba nuimti
                      bausmę vienu mygtuku.
                    </td>
                  </tr>
                  <tr>
                    <td>Tik nuotraukų kanalai</td>
                    <td>
                      Pasirinktuose kanaluose tekstinės žinutės be nuotraukos
                      trinamos.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="docs__section" id="komandos">
            <p className="docs__eyebrow">Naudojimas</p>
            <h2>Visos komandos</h2>
            <div className="docs__table-wrap">
              <table className="docs__table">
                <thead>
                  <tr>
                    <th>Komanda</th>
                    <th>Kas gali</th>
                    <th>Aprašymas</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <code>/lygis [narys]</code>
                    </td>
                    <td>Visi</td>
                    <td>Lygio kortelė.</td>
                  </tr>
                  <tr>
                    <td>
                      <code>/lyderiai</code>
                    </td>
                    <td>Visi</td>
                    <td>Top 15 pagal XP.</td>
                  </tr>
                  <tr>
                    <td>
                      <code>/parukom</code>
                    </td>
                    <td>Visi</td>
                    <td>Rūkalio kvietimas kanale.</td>
                  </tr>
                  <tr>
                    <td>
                      <code>/admin …</code>
                    </td>
                    <td>Moderatoriai</td>
                    <td>ban, kick, timeout, bomb, purge, lygisbg.</td>
                  </tr>
                  <tr>
                    <td>
                      <code>/giveaway …</code>
                    </td>
                    <td>Moderatoriai</td>
                    <td>create, end, reroll.</td>
                  </tr>
                  <tr>
                    <td>
                      <code>/slap</code>
                    </td>
                    <td>Moderate Members</td>
                    <td>Slap GIF, timeout ir XP bauda.</td>
                  </tr>
                  <tr>
                    <td>
                      <code>/ticket</code>
                    </td>
                    <td>Manage Channels</td>
                    <td>Tiketų skydelis į kanalą.</td>
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
                <summary>Kodėl nematau savo serverio panelėje?</summary>
                <p>
                  Panelė leidžia valdyti tik serverius, kuriuose esi savininkas
                  arba turi Administrator ar Manage Server teisę. Jei teisę
                  gavai ką tik, spausk „Atnaujinti sąrašą“.
                </p>
              </details>
              <details>
                <summary>
                  Pakviečiau botą, bet serveris vis dar „Pakviesk Solidus“
                  skiltyje.
                </summary>
                <p>
                  Grįžk į panelės skirtuką — sąrašas atsinaujina automatiškai.
                  Jei ne, spausk „Atnaujinti sąrašą“.
                </p>
              </details>
              <details>
                <summary>Kodėl komanda nerodoma Discord meniu?</summary>
                <p>
                  Gali būti, kad modulis išjungtas panelėje, arba tau trūksta
                  teisės (pvz. <code>/ticket</code> reikia Manage Channels).
                  Paleisk Discord iš naujo, kad atsinaujintų komandų sąrašas.
                </p>
              </details>
              <details>
                <summary>Kaip išjungti funkciją, kurios nereikia?</summary>
                <p>
                  Panelėje pasirink serverį ir išjunk modulį. Pakeitimai
                  įsigalioja iš karto.
                </p>
              </details>
              <details>
                <summary>Kaip gauti daugiau pagalbos?</summary>
                <p>
                  Eik į <Link to="/pagalba#kontaktai">Pagalbos</Link> puslapį —
                  ten rasi kontaktus ir <Link to="/uptime">sistemos statusą</Link>.
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
