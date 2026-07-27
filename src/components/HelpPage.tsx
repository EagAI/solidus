import { Link } from "react-router-dom";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";
import "./HelpPage.css";

const TOPICS = [
  {
    id: "kontaktai",
    title: "Susisiekite",
    text: "Nepavyksta rasti atsakymo? Parašykite mums — atsakome greitai.",
  },
  {
    id: "statusas",
    title: "Sistemos statusas",
    text: "Patikrinkite, ar Solidus veikia stabiliai ir ar nėra planinių darbų.",
  },
  {
    id: "pranesimas",
    title: "Pranešti apie klaidą",
    text: "Radote bug’ą ar keistą elgesį? Aprašykite žingsnius ir mes patikrinsime.",
  },
] as const;

export default function HelpPage() {
  return (
    <div className="help">
      <SiteHeader />

      <div className="help__hero">
        <p className="help__eyebrow">Pagalba</p>
        <h1>Kuo galime padėti?</h1>
        <p className="help__lead">
          Greiti atsakymai, kontaktai ir palaikymas Solidus Discord botui.
          Daugiau techninių detalių rasite dokumentacijoje.
        </p>
        <div className="help__hero-actions">
          <Link to="/dokumentacija" className="site-btn site-btn--gradient">
            Atidaryti dokumentaciją
          </Link>
          <a href="#duk" className="site-btn site-btn--outline">
            Žiūrėti DUK
          </a>
        </div>
      </div>

      <div className="help__shell">
        <section className="help__section" id="greita-pagalba">
          <p className="help__eyebrow">Greita pagalba</p>
          <h2>Dažniausi keliai</h2>
          <div className="help__cards">
            {TOPICS.map((topic) => (
              <a key={topic.id} href={`#${topic.id}`} className="help__card">
                <h3>{topic.title}</h3>
                <p>{topic.text}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="help__section" id="duk">
          <p className="help__eyebrow">DUK</p>
          <h2>Dažnai užduodami klausimai</h2>
          <div className="help__faq">
            <details open>
              <summary>Kaip įkelti Solidus į savo serverį?</summary>
              <p>
                Paspauskite „Įkelti į DISCORD“, pasirinkite serverį ir suteikite
                reikalingas teises. Tada paleiskite <code>/setup</code>.
              </p>
            </details>
            <details>
              <summary>Kodėl nematau slash komandų?</summary>
              <p>
                Palaukite kelias minutes arba perkraukite Discord. Taip pat
                patikrinkite, ar botas turi teisę naudoti application commands.
              </p>
            </details>
            <details>
              <summary>Kaip išjungti atskirus modulius?</summary>
              <p>
                Eikite į <code>/config modules</code> ir išjunkite nereikalingas
                funkcijas. Daugiau —{" "}
                <Link to="/dokumentacija#tinkinimas">dokumentacijoje</Link>.
              </p>
            </details>
            <details>
              <summary>Ar Solidus saugo žinučių turinį?</summary>
              <p>
                Moderavimo veiksmai ir logai saugomi pagal jūsų nustatymus.
                Detaliau skaitykite privatumo politiką žemiau.
              </p>
            </details>
            <details>
              <summary>Kur gauti gyvą pagalbą?</summary>
              <p>
                Naudokite Discord, WhatsApp ar X kontaktus šio puslapio apačioje
                arba sekcijoje „Susisiekite“.
              </p>
            </details>
          </div>
        </section>

        <section className="help__section" id="kontaktai">
          <p className="help__eyebrow">Kontaktai</p>
          <h2>Susisiekite</h2>
          <p className="help__text">
            Pasirinkite patogiausią kanalą. Paprastai atsakome per 24 valandas.
          </p>
          <div className="help__contact-grid">
            <a href="#discord" className="help__contact">
              <span className="help__contact-label">Discord</span>
              <strong>Solidus Support</strong>
              <span>Bendruomenė ir greiti atsakymai</span>
            </a>
            <a href="#whatsapp" className="help__contact">
              <span className="help__contact-label">WhatsApp</span>
              <strong>Palaikymo pokalbis</strong>
              <span>Trumpi klausimai ir incidentai</span>
            </a>
            <a href="mailto:support@solidus.bot" className="help__contact">
              <span className="help__contact-label">El. paštas</span>
              <strong>support@solidus.bot</strong>
              <span>Formalūs prašymai ir ataskaitos</span>
            </a>
          </div>
        </section>

        <section className="help__section" id="statusas">
          <p className="help__eyebrow">Statusas</p>
          <div className="help__section-head">
            <h2>Sistemos būsena</h2>
            <Link to="/uptime" className="help__uptime-link">
              Žiūrėti boto uptime →
            </Link>
          </div>
          <div className="help__status">
            <div className="help__status-row">
              <span className="help__status-dot help__status-dot--ok" />
              <div>
                <strong>API / Bot core</strong>
                <p>Veikia normaliai</p>
              </div>
            </div>
            <div className="help__status-row">
              <span className="help__status-dot help__status-dot--ok" />
              <div>
                <strong>Slash komandos</strong>
                <p>Veikia normaliai</p>
              </div>
            </div>
            <div className="help__status-row">
              <span className="help__status-dot help__status-dot--ok" />
              <div>
                <strong>Dashboard</strong>
                <p>Veikia normaliai</p>
              </div>
            </div>
          </div>
          <Link to="/uptime" className="help__uptime-card">
            <div>
              <strong>Uptime timeline</strong>
              <p>90 dienų istorija, servisai ir pastarieji incidentai.</p>
            </div>
            <span>Atidaryti</span>
          </Link>
        </section>

        <section className="help__section" id="pranesimas">
          <p className="help__eyebrow">Incidentai</p>
          <h2>Pranešti apie problemą</h2>
          <p className="help__text">
            Kai rašote, pridėkite: serverio ID, komandą, laiką ir ką bandėte
            daryti. Tai padeda greičiau rasti priežastį.
          </p>
          <ol className="help__steps">
            <li>
              <strong>Aprašykite veiksmus</strong>
              <span>Kas įvyko prieš klaidą ir ką matėte.</span>
            </li>
            <li>
              <strong>Pridėkite screenshot’ą</strong>
              <span>Jei įmanoma — klaidos žinutę ar logą.</span>
            </li>
            <li>
              <strong>Išsiųskite per Discord / el. paštą</strong>
              <span>Mes patvirtinsime gavimą ir atsakysime.</span>
            </li>
          </ol>
        </section>

        <section className="help__section" id="salygos">
          <p className="help__eyebrow">Teisinė info</p>
          <h2>Sąlygos</h2>
          <p className="help__text">
            Naudodami Solidus sutinkate laikytis Discord taisyklių ir nenaudoti
            boto kenksmingai veiklai. Pilną sąlygų tekstą galime pateikti pagal
            užklausą.
          </p>
        </section>

        <section className="help__section" id="privatumas">
          <p className="help__eyebrow">Teisinė info</p>
          <h2>Privatumo politika</h2>
          <p className="help__text">
            Renkame tik tiek duomenų, kiek reikia boto funkcijoms (pvz., serverio
            ID, nustatymus, moderavimo logus). Duomenys nenaudojami reklamai.
          </p>
        </section>

        <section className="help__section" id="slapukai">
          <p className="help__eyebrow">Teisinė info</p>
          <h2>Slapukų politika</h2>
          <p className="help__text">
            Svetainė gali naudoti būtinus slapukus sesijai ir nustatymams.
            Nebūtinus slapukus galite valdyti naršyklės nustatymuose.
          </p>
        </section>
      </div>

      <SiteFooter />
    </div>
  );
}
