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

/** Mock changelog — replace with real release notes later */
export const UPDATES: UpdateItem[] = [
  {
    id: "2-4-0",
    version: "2.4.0",
    date: "2026-07-20",
    title: "Automatiniai įspėjimai ir greitesnis setup",
    summary:
      "Nauji automatiniai pranešimai apie raidus ir patobulintas /setup vedlys.",
    tag: "nauja",
    changes: [
      "Pridėti automatiniai raid įspėjimai pasirinktame kanale",
      "Setup vedlys dabar siūlo rekomenduojamus kanalus ir roles",
      "Greitesnis boto paleidimas po pakvietimo į serverį",
    ],
  },
  {
    id: "2-3-2",
    version: "2.3.2",
    date: "2026-07-08",
    title: "Moderavimo ir ekonomikos pataisymai",
    summary:
      "Ištaisyti keli edge-case’ai mute/kick komandose ir XP skaičiavime.",
    tag: "pataisymas",
    changes: [
      "Ištaisytas mute laiko rodymas lietuvių lokalėje",
      "XP nebesidubliuoja greitai siunčiant žinutes",
      "Stabilesnis /warn istorijos puslapiavimas",
    ],
  },
  {
    id: "2-3-0",
    version: "2.3.0",
    date: "2026-06-22",
    title: "Naujas dashboard ir logų filtrai",
    summary:
      "Valdymo skydelis papildytas filtrais, o loguose lengviau rasti įvykius.",
    tag: "patobulinimas",
    changes: [
      "Dashboard: filtrai pagal modulį ir datą",
      "Logų paieška pagal vartotoją ir komandą",
      "Patobulinti mobilaus dashboard mygtukai",
    ],
  },
  {
    id: "2-2-1",
    version: "2.2.1",
    date: "2026-06-05",
    title: "Slash komandų stabilumas",
    summary:
      "Sumažinti timeout’ai ir pagerintas atsakymų greitis dideliuose serveriuose.",
    tag: "pataisymas",
    changes: [
      "Sumažinti Discord API timeout’ai esant apkrovai",
      "Komandos atsako greičiau serveriuose su 5k+ narių",
      "Ištaisyta reta klaida su /ticket close",
    ],
  },
  {
    id: "2-2-0",
    version: "2.2.0",
    date: "2026-05-18",
    title: "Ticket sistema ir nauji automatai",
    summary:
      "Pilna ticket sistema su kategorijomis ir automatiniais atsakymais.",
    tag: "nauja",
    changes: [
      "Ticket kūrimas, uždarymas ir transcript eksportas",
      "Automatiniai welcome ir goodbye pranešimai",
      "Galimybė priskirti ticket staff role",
    ],
  },
  {
    id: "2-1-0",
    version: "2.1.0",
    date: "2026-04-30",
    title: "Ekonomikos sezonai ir lyderių lentos",
    summary:
      "Sezoniniai event’ai, premijos ir atnaujintos lyderių lentos.",
    tag: "patobulinimas",
    changes: [
      "Sezoniniai ekonomikos event’ai su premijomis",
      "Atnaujinta /leaderboard išvaizda",
      "Galimybė resetinti sezoninį balansą",
    ],
  },
];
