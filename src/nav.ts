export type NavItem = {
  label: string;
  to: string;
  end?: boolean;
};

/** Primary site navigation */
export const SITE_NAV: NavItem[] = [
  { label: "PAGRINDINIS", to: "/", end: true },
  { label: "ATNAUJINIMAI", to: "/atnaujinimai" },
  { label: "KOMANDA", to: "/komanda" },
  { label: "PAGALBA", to: "/pagalba" },
];

export type FooterGroup = { title: string; links: NavItem[] };

/** Footer: everything reachable, grouped the way people look for it. */
export const FOOTER_GROUPS: FooterGroup[] = [
  {
    title: "Solidus",
    links: [
      { label: "Funkcijos", to: "/#funkcijos" },
      { label: "Valdymo panelė", to: "/panel" },
      { label: "Atnaujinimai", to: "/atnaujinimai" },
      { label: "Komanda", to: "/komanda" },
    ],
  },
  {
    title: "Pagalba",
    links: [
      { label: "Dokumentacija", to: "/dokumentacija" },
      { label: "Sistemos statusas", to: "/uptime" },
      { label: "DUK", to: "/pagalba#duk" },
      { label: "Pranešti apie klaidą", to: "/pagalba#pranesimas" },
    ],
  },
  {
    title: "Teisinė info",
    links: [
      { label: "Naudojimo sąlygos", to: "/salygos" },
      { label: "Privatumo politika", to: "/pagalba#privatumas" },
      { label: "Slapukų politika", to: "/pagalba#slapukai" },
    ],
  },
];

/**
 * Contact channels. Leave a URL empty and that channel is hidden everywhere
 * (footer + Pagalba page) instead of showing a dead link.
 */
export const CONTACTS = {
  discord: "",
  whatsapp: "",
  email: "support@solidus.bot",
} as const;
