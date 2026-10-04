export type PanelNavItem = {
  label: string;
  to: string;
  end?: boolean;
  badge?: string;
  children?: PanelNavItem[];
};

export type PanelNavGroup = {
  id: string;
  label?: string;
  items: PanelNavItem[];
};

export const PANEL_NAV: PanelNavGroup[] = [
  {
    id: "home",
    items: [
      { label: "Serveriai", to: "/panel", end: true },
      { label: "Pagrindinis", to: "/panel/valdymas" },
    ],
  },
  {
    id: "nariai",
    label: "NARIAI",
    items: [
      {
        label: "Prisijungimas",
        to: "/panel/nariai",
        children: [
          { label: "Entrance", to: "/panel/nariai/entrance" },
          { label: "Goodbye", to: "/panel/nariai/goodbye" },
          { label: "Auto-rolė", to: "/panel/nariai/autorole" },
        ],
      },
      { label: "Rolės", to: "/panel/roles" },
    ],
  },
  {
    id: "moderavimas",
    label: "MODERAVIMAS",
    items: [
      { label: "Įspėjimai", to: "/panel/ispejimai" },
      { label: "Filtrai", to: "/panel/filtrai" },
      { label: "Juodasis sąrašas", to: "/panel/blacklist" },
      { label: "Anti-raid", to: "/panel/anti-raid" },
      { label: "Logai", to: "/panel/logai" },
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
    id: "bendruomene",
    label: "BENDRUOMENĖ",
    items: [
      {
        label: "Tiketai",
        to: "/panel/tiketai",
        children: [
          { label: "Nustatymai", to: "/panel/tiketai/nustatymai" },
          { label: "Istorija", to: "/panel/tiketai/istorija" },
        ],
      },
      { label: "Giveaway", to: "/panel/giveaway" },
      { label: "Apklausos", to: "/panel/apklausos" },
      { label: "Balso kanalai", to: "/panel/voice" },
    ],
  },
  {
    id: "irankiai",
    label: "ĮRANKIAI",
    items: [
      { label: "Komandos", to: "/panel/komandos" },
      { label: "Embed", to: "/panel/embed" },
      { label: "Extras", to: "/panel/extras" },
    ],
  },
  {
    id: "nustatymai",
    label: "NUSTATYMAI",
    items: [{ label: "Serveris", to: "/panel/nustatymai" }],
  },
];

export const PANEL_USER = {
  name: "EagWasTaken",
  role: "Savininkas",
  initials: "EW",
} as const;
