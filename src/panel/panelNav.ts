export type PanelNavItem = {
  label: string;
  to: string;
  end?: boolean;
  badge?: string;
};

export type PanelNavGroup = {
  id: string;
  label?: string;
  items: PanelNavItem[];
};

export const PANEL_NAV: PanelNavGroup[] = [
  {
    id: "home",
    items: [{ label: "Pagrindinis", to: "/panel", end: true }],
  },
  {
    id: "valdymas",
    label: "VALDYMAS",
    items: [
      { label: "Komandos", to: "/panel/komandos" },
      { label: "Automatika", to: "/panel/automatika" },
      { label: "Rolių valdymas", to: "/panel/roles" },
      { label: "Įspėjimai", to: "/panel/ispejimai" },
      { label: "Serverio nustatymai", to: "/panel/nustatymai" },
    ],
  },
  {
    id: "moderavimas",
    label: "MODERAVIMAS",
    items: [
      { label: "Pranešimų filtrai", to: "/panel/filtrai" },
      { label: "Žodžių juodasis sąrašas", to: "/panel/blacklist" },
      { label: "Anti-raid apsauga", to: "/panel/anti-raid" },
      { label: "Įrašų stebėjimas", to: "/panel/logai" },
    ],
  },
  {
    id: "ekonomika",
    label: "EKONOMIKA",
    items: [
      { label: "Lygiai ir XP", to: "/panel/lygiai" },
      { label: "Valiuta", to: "/panel/valiuta" },
      { label: "Parduotuvė", to: "/panel/parduotuve" },
    ],
  },
  {
    id: "irankiai",
    label: "ĮRANKIAI",
    items: [
      { label: "Giveaway", to: "/panel/giveaway" },
      { label: "Apklausos", to: "/panel/apklausos", badge: "Nauja" },
      { label: "Embed builder", to: "/panel/embed", badge: "Nauja" },
      { label: "Balso kanalai", to: "/panel/voice" },
    ],
  },
];

export const PANEL_USER = {
  name: "EagWasTaken",
  role: "Savininkas",
  initials: "EW",
} as const;
