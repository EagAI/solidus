import { Link } from "react-router-dom";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";
import "./TermsPage.css";

const SECTIONS = [
  {
    id: "priemimas",
    title: "1. Sąlygų priėmimas",
    body: [
      "Naudodami Solidus Discord botą („Solidus“, „botas“, „paslauga“), Solidus svetainę ar susijusias paslaugas, jūs sutinkate su šiomis Naudojimo sąlygomis.",
      "Jei nesutinkate su šiomis sąlygomis, nekvieskite Solidus į savo Discord serverį ir nesinaudokite paslauga.",
    ],
  },
  {
    id: "paslauga",
    title: "2. Paslaugos aprašymas",
    body: [
      "Solidus yra Discord botas, skirtas serverių moderavimui, automatikai, apsaugai, ekonomikai, tinkinimui ir kitoms bendruomenės valdymo funkcijoms.",
      "Solidus veikia Discord platformoje ir priklauso nuo Discord API bei Discord paslaugų prieinamumo. Solidus nėra Discord Inc. produktas ir nėra oficialiai susijęs su Discord, išskyrus tai, kad veikia kaip trečiosios šalies botas Discord ekosistemoje.",
    ],
  },
  {
    id: "discord",
    title: "3. Discord taisyklės",
    body: [
      "Naudodami Solidus, privalote laikytis Discord Terms of Service, Discord Community Guidelines ir kitų taikomų Discord taisyklių.",
      "Solidus naudojimo teisė nereiškia, kad galite pažeisti Discord taisykles. Už savo Discord paskyrą, serverius ir turinį atsakote jūs.",
    ],
  },
  {
    id: "teisės",
    title: "4. Teisės ir leidimai",
    body: [
      "Kviečiant Solidus į serverį, serverio administratorius suteikia botui Discord leidimus (pvz., skaityti / siųsti žinutes, valdyti roles, moderuoti narius), reikalingus funkcijoms veikti.",
      "Jūs esate atsakingi už tai, kad Solidus būtų suteikti tik reikalingi leidimai, ir už teisingą boto konfigūraciją savo serveryje.",
      "Solidus negali veikti be Discord suteiktų leidimų. Jei atšauksite leidimus, dalis ar visos funkcijos gali neveikti.",
    ],
  },
  {
    id: "atsakomybe-naudotojo",
    title: "5. Naudotojo atsakomybė",
    body: [
      "Jūs esate atsakingi už:",
    ],
    list: [
      "savo Discord serverio turinį, narius ir nustatymus;",
      "Solidus komandų ir modulių naudojimą savo serveryje;",
      "tai, kad turite teisę valdyti serverį, į kurį kviečiate Solidus;",
      "bet kokius veiksmus, atliktus naudojant Solidus jūsų serveryje;",
      "tai, kad Solidus nenaudosite neteisėtai ar kenksmingai.",
    ],
  },
  {
    id: "draudziama",
    title: "6. Draudžiamas naudojimas",
    body: [
      "Naudodami Solidus, jūs įsipareigojate nenaudoti paslaugos:",
    ],
    list: [
      "spamui, raidams, harassamentui ar kitam kenksmingam elgesiui;",
      "neteisėtam turiniui platinti ar saugoti;",
      "bandymams apeiti apsaugas, įsilaužti ar perkrauti Solidus / Discord sistemas;",
      "automatinėms atakoms, scraping’ui ar piktnaudžiavimui Discord API;",
      "veiksmams, kurie pažeidžia įstatymus, Discord taisykles ar trečiųjų šalių teises.",
    ],
    after: [
      "Solidus komanda pasilieka teisę apriboti ar nutraukti prieigą prie boto, jei pastebimas piktnaudžiavimas.",
    ],
  },
  {
    id: "duomenys",
    title: "7. Duomenys ir privatumas",
    body: [
      "Solidus gali apdoroti duomenis, reikalingus boto veikimui Discord serveryje (pvz., serverio ID, kanalų ID, vartotojų ID, komandų istoriją, nustatymus), pagal Discord API galimybes ir jūsų konfigūraciją.",
      "Detalesnė informacija apie duomenų tvarkymą pateikiama Solidus Privatumo politikoje. Naudodami Solidus, sutinkate ir su ta politika, kiek ji taikoma paslaugai.",
    ],
  },
  {
    id: "prieinamumas",
    title: "8. Prieinamumas ir pakeitimai",
    body: [
      "Stengiamės, kad Solidus veiktų stabiliai, tačiau negarantame nenutrūkstamo veikimo. Galimi trikdžiai dėl Discord API, priežiūros, atnaujinimų ar force majeure.",
      "Solidus funkcijos, komandos ir sąsaja gali keistis. Apie svarbesnius pakeitimus stengiamės informuoti per Solidus kanalus (pvz., svetainės atnaujinimus ar Discord).",
    ],
  },
  {
    id: "nuosavybe",
    title: "9. Intelektinė nuosavybė",
    body: [
      "Solidus pavadinimas, logotipas, dizainas, kodas ir susijusi medžiaga priklauso Solidus komandai ar jos licencijuotojams.",
      "Negalite kopijuoti, perpardavinėti, skaidyti ar apsimesti Solidus be raštiško leidimo, išskyrus atvejus, kai tai leidžia taikoma teisė ar atvira licencija (jei tokia būtų aiškiai nurodyta).",
    ],
  },
  {
    id: "atsakomybes-apribojimas",
    title: "10. Atsakomybės apribojimas",
    body: [
      "Solidus teikiamas „toks, koks yra“ ir „kaip prieinama“, be jokių išreikštų ar numanomų garantijų, kiek tai leidžia įstatymai.",
      "Solidus komanda neatsako už netiesioginius, atsitiktinius ar pasekminius nuostolius, kylančius dėl boto naudojimo ar neveikimo, įskaitant serverio turinio praradimą, narių veiksmus ar Discord platformos sutrikimus.",
      "Jūs naudojate Solidus savo rizika ir esate atsakingi už savo serverio saugumą bei atsargines kopijas, kur jos įmanomos.",
    ],
  },
  {
    id: "nutraukimas",
    title: "11. Nutraukimas",
    body: [
      "Galite bet kada pašalinti Solidus iš savo Discord serverio.",
      "Mes galime laikinai ar visam laikui apriboti Solidus prieigą prie serverio ar paskyros, jei pažeidžiamos šios sąlygos, Discord taisyklės ar kyla saugumo / piktnaudžiavimo rizika.",
    ],
  },
  {
    id: "pakeitimai",
    title: "12. Sąlygų keitimas",
    body: [
      "Galime atnaujinti šias Naudojimo sąlygas. Atnaujinta versija skelbiama šioje Solidus svetainėje su atnaujinimo data.",
      "Tolesnis Solidus naudojimas po pakeitimų paskelbimo reiškia sutikimą su atnaujintomis sąlygomis.",
    ],
  },
  {
    id: "kontaktai",
    title: "13. Kontaktai",
    body: [
      "Klausimais dėl šių sąlygų ar Solidus paslaugos rašykite:",
    ],
    list: [
      "El. paštas: support@solidus.bot",
      "Pagalba svetainėje: /pagalba",
    ],
  },
] as const;

export default function TermsPage() {
  return (
    <div className="terms">
      <SiteHeader />

      <div className="terms__hero">
        <p className="terms__eyebrow">Teisinė informacija</p>
        <h1>Solidus naudojimo sąlygos</h1>
        <p className="terms__lead">
          Šios sąlygos taikomos Solidus Discord botui ir susijusioms Solidus
          paslaugoms. Prašome jas perskaityti prieš kviečiant botą į serverį.
        </p>
        <p className="terms__meta">Paskutinį kartą atnaujinta: 2026-07-28</p>
        <div className="terms__hero-actions">
          <Link to="/pagalba" className="site-btn site-btn--outline">
            Pagalba
          </Link>
          <a href="mailto:support@solidus.bot" className="site-btn site-btn--gradient">
            support@solidus.bot
          </a>
        </div>
      </div>

      <div className="terms__shell">
        <nav className="terms__toc" aria-label="Sąlygų turinys">
          <p className="terms__toc-title">Turinys</p>
          <ol>
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>{section.title}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="terms__content">
          {SECTIONS.map((section) => (
            <section key={section.id} id={section.id} className="terms__section">
              <h2>{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {"list" in section && section.list ? (
                <ul>
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {"after" in section && section.after
                ? section.after.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))
                : null}
            </section>
          ))}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
