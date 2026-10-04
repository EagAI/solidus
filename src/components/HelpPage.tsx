import { Link } from "react-router-dom";
import { useUptime } from "../data/uptime";
import { CONTACTS } from "../nav";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";
import "./HelpPage.css";

const MAIL_SUBJECT = encodeURIComponent("Solidus pagalba");

const REPORT_TIPS = [
  {
    title: "Kas nutiko",
    text: "Ką darei, kokią komandą naudojai ir ką matei vietoj to, ko tikėjaisi.",
  },
  {
    title: "Kur ir kada",
    text: "Serverio pavadinimas ar ID ir apytikslis laikas — taip greičiau rasime įrašą.",
  },
  {
    title: "Ekrano nuotrauka",
    text: "Jei gali — pridėk klaidos žinutės ar keisto boto atsakymo nuotrauką.",
  },
] as const;

/** Live bot state from /api/uptime, shown on the status quick card. */
function StatusCard() {
  const state = useUptime();
  const loading = state.status === "loading";
  const up = state.status === "ready" && state.report.online;
  const tone = loading ? "wait" : up ? "ok" : "down";
  const text = loading
    ? "Tikrinama…"
    : up
      ? "Botas ir panelė veikia"
      : "Botas šiuo metu neveikia";

  return (
    <Link to="/uptime" className="help__quick" id="statusas">
      <span className="help__quick-label">Sistemos statusas</span>
      <strong className="help__status-line">
        <span className={`help__status-dot help__status-dot--${tone}`} />
        {text}
      </strong>
      <span className="help__quick-text">Istorija ir sutrikimai per 90 dienų</span>
    </Link>
  );
}

export default function HelpPage() {
  return (
    <div className="help">
      <SiteHeader />

      <div className="help__hero">
        <p className="help__eyebrow">Pagalba</p>
        <h1>Kuo galime padėti?</h1>
        <p className="help__lead">
          Daugumą atsakymų rasi žemiau arba dokumentacijoje. Jei ne — parašyk
          mums, atsakome per 24 valandas.
        </p>

        <div className="help__quick-grid">
          <Link to="/dokumentacija" className="help__quick">
            <span className="help__quick-label">Dokumentacija</span>
            <strong>Visos funkcijos ir komandos</strong>
            <span className="help__quick-text">Įdiegimas, panelė ir moduliai</span>
          </Link>
          <StatusCard />
          <a href="#duk" className="help__quick">
            <span className="help__quick-label">DUK</span>
            <strong>Dažni klausimai</strong>
            <span className="help__quick-text">Greiti atsakymai į tipines problemas</span>
          </a>
          <a href="#kontaktai" className="help__quick">
            <span className="help__quick-label">Susisiekti</span>
            <strong>Parašyk mums</strong>
            <span className="help__quick-text">Klaidos, klausimai ir pasiūlymai</span>
          </a>
        </div>
      </div>

      <div className="help__shell">
        <section className="help__section" id="duk">
          <p className="help__eyebrow">DUK</p>
          <h2>Dažnai užduodami klausimai</h2>
          <div className="help__faq">
            <details open>
              <summary>Kaip pridėti Solidus į savo serverį?</summary>
              <p>
                Atidaryk <Link to="/panel">valdymo panelę</Link>, prisijunk su
                Discord ir prie norimo serverio spausk „Pakviesti“. Serverį
                matysi, jei esi jo savininkas arba turi Administrator ar Manage
                Server teisę.
              </p>
            </details>
            <details>
              <summary>Kodėl nematau slash komandų?</summary>
              <p>
                Perkrauk Discord (Ctrl+R). Jei vis tiek nėra — patikrink, ar
                modulis įjungtas panelėje ir ar turi reikiamą teisę (pvz.{" "}
                <code>/ticket</code> reikia Manage Channels).
              </p>
            </details>
            <details>
              <summary>Nematau savo serverio panelėje.</summary>
              <p>
                Panelėje rodomi tik serveriai, kuriuose esi savininkas arba turi
                Administrator ar Manage Server teisę. Jei teisę gavai ką tik,
                spausk „Atnaujinti sąrašą“.
              </p>
            </details>
            <details>
              <summary>Kaip išjungti funkciją, kurios nereikia?</summary>
              <p>
                Panelėje pasirink serverį ir išjunk modulį — jo komandos dingsta
                iš Discord meniu iš karto. Visi moduliai aprašyti{" "}
                <Link to="/dokumentacija#panele">dokumentacijoje</Link>.
              </p>
            </details>
            <details>
              <summary>Ar Solidus saugo žinučių turinį?</summary>
              <p>
                Tik tiek, kiek reikia funkcijoms: redaguotos ir ištrintos
                žinutės siunčiamos į logų kanalą, o tiketų pokalbiai saugomi,
                kad matytum juos panelėje. Daugiau —{" "}
                <a href="#privatumas">privatumo politikoje</a>.
              </p>
            </details>
            <details>
              <summary>Botas neatsako. Ką daryti?</summary>
              <p>
                Pirmiausia pažiūrėk <Link to="/uptime">sistemos statusą</Link>.
                Jei ten viskas veikia — <a href="#kontaktai">parašyk mums</a> ir
                nurodyk serverį bei komandą.
              </p>
            </details>
          </div>
        </section>

        <section className="help__section" id="kontaktai">
          <p className="help__eyebrow">Kontaktai</p>
          <h2>Susisiekite</h2>

          <div className="help__contact-layout">
            <div className="help__contact-list">
              <a
                href={`mailto:${CONTACTS.email}?subject=${MAIL_SUBJECT}`}
                className="help__contact"
              >
                <span className="help__contact-label">El. paštas</span>
                <strong>{CONTACTS.email}</strong>
                <span>Atsakome per 24 valandas</span>
              </a>
              {CONTACTS.discord ? (
                <a
                  href={CONTACTS.discord}
                  target="_blank"
                  rel="noreferrer"
                  className="help__contact"
                >
                  <span className="help__contact-label">Discord</span>
                  <strong>Solidus pagalbos serveris</strong>
                  <span>Bendruomenė ir greiti atsakymai</span>
                </a>
              ) : null}
              {CONTACTS.whatsapp ? (
                <a
                  href={CONTACTS.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="help__contact"
                >
                  <span className="help__contact-label">WhatsApp</span>
                  <strong>Palaikymo pokalbis</strong>
                  <span>Trumpi klausimai</span>
                </a>
              ) : null}
            </div>

            <div className="help__report" id="pranesimas">
              <h3>Radai klaidą? Parašyk:</h3>
              <ol className="help__steps">
                {REPORT_TIPS.map((tip) => (
                  <li key={tip.title}>
                    <strong>{tip.title}</strong>
                    <span>{tip.text}</span>
                  </li>
                ))}
              </ol>
              <a
                href={`mailto:${CONTACTS.email}?subject=${encodeURIComponent("Solidus klaida")}`}
                className="site-btn site-btn--gradient help__report-btn"
              >
                Pranešti apie klaidą
              </a>
            </div>
          </div>
        </section>

        <section className="help__section" id="teisine">
          <p className="help__eyebrow">Teisinė info</p>
          <h2>Sąlygos ir privatumas</h2>
          <div className="help__legal">
            <article className="help__legal-card" id="salygos">
              <h3>Naudojimo sąlygos</h3>
              <p>
                Naudodamas Solidus sutinki laikytis Discord taisyklių ir
                nenaudoti boto kenksmingai veiklai.
              </p>
              <Link to="/salygos">Skaityti visas sąlygas →</Link>
            </article>
            <article className="help__legal-card" id="privatumas">
              <h3>Privatumo politika</h3>
              <p>
                Saugome tik tai, ko reikia boto funkcijoms: serverio nustatymus,
                narių XP ir lygius, tiketų pokalbius ir moderavimo logus.
                Prisijungus prie panelės matome tavo Discord vardą, avatarą ir
                serverių sąrašą — tik tam, kad parodytume, kuriuos serverius gali
                valdyti. Duomenys nenaudojami reklamai ir neperduodami
                tretiesiems asmenims.
              </p>
            </article>
            <article className="help__legal-card" id="slapukai">
              <h3>Slapukai</h3>
              <p>
                Naudojame tik vieną būtiną slapuką — prisijungimo prie panelės
                sesijai. Panelės tema ir pasirinktas serveris išsaugomi tavo
                naršyklėje. Reklaminių ar sekimo slapukų nėra.
              </p>
            </article>
          </div>
        </section>
      </div>

      <SiteFooter />
    </div>
  );
}
