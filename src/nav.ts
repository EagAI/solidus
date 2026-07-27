export type NavItem = {
  label: string;
  to: string;
  end?: boolean;
};

/** Primary site navigation */
export const SITE_NAV: NavItem[] = [
  { label: "PAGRINDINIS", to: "/", end: true },
  { label: "ATNAUJINIMAI", to: "/atnaujinimai" },
  { label: "DOKUMENTACIJA", to: "/dokumentacija" },
  { label: "PAGALBA", to: "/pagalba" },
];

export const FOOTER_NAV = [
  { label: "Atnaujinimai", to: "/atnaujinimai" },
  { label: "Komandos", to: "/dokumentacija#komandos" },
  { label: "Dokumentacija", to: "/dokumentacija" },
  { label: "Pagalba", to: "/pagalba" },
] as const;

export const FOOTER_LEGAL = [
  { label: "Sąlygos", to: "/pagalba#salygos" },
  { label: "Privatumo politika", to: "/pagalba#privatumas" },
  { label: "Slapukų politika", to: "/pagalba#slapukai" },
  { label: "Tvarkyti slapukus", to: "/pagalba#slapukai" },
] as const;
