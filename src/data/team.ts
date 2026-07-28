export type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  accent: "blue" | "purple" | "mixed";
};

export const TEAM: TeamMember[] = [
  {
    id: "eag",
    name: "Eag",
    role: "Lead",
    bio: "Solidus projekto vadovas. Atsakingas už viziją, kryptį ir pagrindinius sprendimus.",
    accent: "mixed",
  },
  {
    id: "kasteris",
    name: "Kasteris",
    role: "Co-lead",
    bio: "Bendravadovas kartu su Eag. Padeda vesti komandą, planuoti ir įgyvendinti Solidus plėtrą.",
    accent: "blue",
  },
  {
    id: "netimera",
    name: "Netimera",
    role: "UI / UX dizainerė",
    bio: "Kuria Solidus sąsajas ir vartotojo patirtį — nuo layout’ų iki detalių, kurios daro produktą aiškų ir malonų naudoti.",
    accent: "purple",
  },
];
