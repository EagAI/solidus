export type UpdateTag = "nauja" | "patobulinimas" | "pataisymas";

export type UpdateItem = {
  id: string;
  version: string;
  date: string;
  title: string;
  summary: string;
  tag: UpdateTag;
  changes: string[];
};

export const UPDATE_TAG_LABEL: Record<UpdateTag, string> = {
  nauja: "Nauja",
  patobulinimas: "Patobulinimas",
  pataisymas: "Pataisymas",
};

/** Bot + panel release notes, newest first. Add new releases to the top. */
export const UPDATES: UpdateItem[] = [
  {
    id: "0-10-0",
    version: "0.10.0",
    date: "2026-10-04",
    title: "Prisijungimas su Discord ir serverių sąrašas",
    summary:
      "Panelė dabar tikra: prisijungi su Discord ir matai visus savo serverius.",
    tag: "nauja",
    changes: [
      "Prisijungimas su Discord paskyra vietoj bandomojo vartotojo",
      "Serveriai suskirstyti į tris grupes: valdomi, laukiantys boto ir kiti",
      "Mygtukas „Pakviesti“ atidaro Discord su jau pažymėtu serveriu",
      "Serverio nustatymus mato ir keičia tik tie, kas jį valdo Discord'e",
      "Pakvietus botą, slash komandos naujame serveryje atsiranda iš karto",
    ],
  },
  {
    id: "0-9-0",
    version: "0.9.0",
    date: "2026-09-27",
    title: "Moduliai valdomi iš panelės",
    summary:
      "Panelė pradėjo valdyti botą: pakeitimai įsigalioja Discord'e iš karto.",
    tag: "nauja",
    changes: [
      "Pasveikinimai su baneriu arba kortele, atsisveikinimai su {user}",
      "Autorolė naujiems nariams",
      "/parukom ir /slap įjungiami atskirai kiekvienam serveriui",
      "Išjungto modulio komandos dingsta iš Discord meniu",
      "Nustatymai saugomi atskirai kiekvienam serveriui",
    ],
  },
  {
    id: "0-8-0",
    version: "0.8.0",
    date: "2026-09-18",
    title: "Tiketai",
    summary:
      "Pagalbos tiketai su kategorijomis ir visa istorija panelėje.",
    tag: "nauja",
    changes: [
      "/ticket išsiunčia tiketų skydelį į pasirinktą kanalą",
      "Kategorijos: Pagalba, Pranešimas, Klausimas",
      "Kiekvienas tiketas — privatus kanalas su nariu ir komanda",
      "Tiketų istorija ir žinutės matomos panelėje",
    ],
  },
  {
    id: "0-7-0",
    version: "0.7.0",
    date: "2026-09-12",
    title: "Voice kambariai ir YouTube pranešimai",
    summary:
      "Asmeniniai voice kambariai ir automatiniai naujų vaizdo įrašų skelbimai.",
    tag: "nauja",
    changes: [
      "Prisijungus prie „hub“ kanalo sukuriamas asmeninis voice kambarys",
      "Kambarys ištrinamas, kai visi išeina",
      "Naujas YouTube vaizdo įrašas ar live paskelbiamas kanale",
      "/admin live check — rankinis YouTube patikrinimas",
    ],
  },
  {
    id: "0-6-0",
    version: "0.6.0",
    date: "2026-09-07",
    title: "Anti-scam nuotraukose",
    summary:
      "Solidus atpažįsta sukčių schemas net paveikslėliuose.",
    tag: "nauja",
    changes: [
      "Nuotraukų tekstas nuskaitomas ir tikrinamas sukčių schemoms",
      "Siuntėjas gauna timeout, moderatoriai — pranešimą su mygtukais",
      "Užbaninti ar nuimti bausmę galima vienu paspaudimu",
      "Vienas pranešimas per narį, net jei jis siunčia daug nuotraukų iš eilės",
    ],
  },
  {
    id: "0-5-0",
    version: "0.5.0",
    date: "2026-07-29",
    title: "Pirmoji valdymo panelė",
    summary:
      "Svetainėje atsirado valdymo panelė — kol kas bandomoji versija.",
    tag: "nauja",
    changes: [
      "Panelė adresu /panel su šoniniu meniu ir moduliais",
      "Keturios temos: Solidus, šviesi, pilka ir juoda-balta",
      "Pritaikyta telefonui",
    ],
  },
  {
    id: "0-4-0",
    version: "0.4.0",
    date: "2026-07-24",
    title: "Giveaway ir pakvietimų blokavimas",
    summary:
      "Giveaway kūrimas per formą ir apsauga nuo svetimų serverių reklamos.",
    tag: "nauja",
    changes: [
      "/giveaway create atidaro formą prizui, trukmei ir laimėtojų skaičiui",
      "/giveaway end ir /giveaway reroll",
      "Svetimų serverių pakvietimai ištrinami, siuntėjui skiriamas timeout",
    ],
  },
  {
    id: "0-3-1",
    version: "0.3.1",
    date: "2026-07-03",
    title: "Žinučių logai ir stabilumas",
    summary:
      "Moderatoriai mato redaguotas ir ištrintas žinutes.",
    tag: "patobulinimas",
    changes: [
      "Redaguotos ir ištrintos žinutės fiksuojamos logų kanale",
      "XP skiriamas ne dažniau nei kas 5 sekundes — nebėra spam'inimo",
    ],
  },
  {
    id: "0-3-0",
    version: "0.3.0",
    date: "2026-06-28",
    title: "Perrašytas branduolys ir moderavimas",
    summary:
      "Botas perrašytas nuo pagrindų ir gavo moderavimo komandas.",
    tag: "patobulinimas",
    changes: [
      "Nauja duomenų bazė — XP ir nustatymai nebepasimeta po perkrovimo",
      "/admin ban, kick, timeout (30min, 2h, 1d) ir bomb",
      "/admin purge — iki 100 žinučių vienu kartu",
      "/slap su GIF'u, timeout ir XP bauda",
    ],
  },
  {
    id: "0-2-0",
    version: "0.2.0",
    date: "2026-06-19",
    title: "Lyderių lentelė ir lygio rolės",
    summary:
      "Lygiai tapo matomi: grafika, rolės ir pakilimų skelbimai.",
    tag: "nauja",
    changes: [
      "/lyderiai — top 15 narių kaip viena grafika",
      "Lygio rolės: tik aukščiausia arba visos iš eilės",
      "Lygio pakilimų kortelės, didesnės ypatingiems lygiams",
      "/admin lygisbg — individualus kortelės fonas",
    ],
  },
  {
    id: "0-1-0",
    version: "0.1.0",
    date: "2026-06-06",
    title: "Pirmoji Solidus versija",
    summary:
      "Pradžia: lygiai, patvirtinimas ir pasveikinimai viename serveryje.",
    tag: "nauja",
    changes: [
      "XP už žinutes ir /lygis kortelė",
      "Patvirtinimo mygtukas naujiems nariams",
      "Pasveikinimo žinutė prisijungus",
      "/parukom — 10 minučių kvietimas su mygtuku",
    ],
  },
];
