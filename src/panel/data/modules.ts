export type PanelModules = {
  entrance: { enabled: boolean; style: "banner" | "card"; channelId: string };
  goodbye: { enabled: boolean; channelId: string; message: string };
  autorole: { enabled: boolean; roleId: string };
  levels: { enabled: boolean; backgroundUrl: string };
  leaderboard: { enabled: boolean; accent: string };
  parukom: { enabled: boolean; xp: number; roleId: string };
  slap: { enabled: boolean; gifUrl: string; timeoutMin: number; xpPenalty: number };
  tickets: {
    enabled: boolean;
    categoryId: string;
    staffRoleIds: string;
    title: string;
    description: string;
    subcategories: { id: string; name: string }[];
    history: {
      id: string;
      number: string;
      opener: string;
      subcategory: string;
      status: "open" | "closed";
      url: string;
      openedAt: string;
      closedAt: string;
    }[];
  };
  extras: { hitcar: boolean; jail: boolean; economy: boolean };
};

export const DEFAULT_MODULES: PanelModules = {
  entrance: { enabled: true, style: "banner", channelId: "" },
  goodbye: { enabled: false, channelId: "", message: "Viso gero, {user}." },
  autorole: { enabled: true, roleId: "" },
  levels: { enabled: true, backgroundUrl: "" },
  leaderboard: { enabled: true, accent: "#f26522" },
  parukom: { enabled: true, xp: 35, roleId: "" },
  slap: {
    enabled: false,
    gifUrl: "https://klipy.com/gifs/slap-13622",
    timeoutMin: 5,
    xpPenalty: 1000,
  },
  tickets: {
    enabled: true,
    categoryId: "",
    staffRoleIds: "",
    title: "Pagalba",
    description:
      'Jeigu turite klausimų ar norite kažką pranešti, paspauskite „Atidaryti ticket".',
    subcategories: [
      { id: "help", name: "Pagalba" },
      { id: "report", name: "Pranešimas" },
      { id: "question", name: "Klausimas" },
    ],
    history: [
      {
        id: "t1",
        number: "0007",
        opener: "mira#1200",
        subcategory: "Pagalba",
        status: "open",
        url: "https://discord.com/channels/123/456",
        openedAt: "2026-09-25 14:10",
        closedAt: "",
      },
      {
        id: "t2",
        number: "0006",
        opener: "kai#88",
        subcategory: "Pranešimas",
        status: "closed",
        url: "https://discord.com/channels/123/789",
        openedAt: "2026-09-24 19:02",
        closedAt: "2026-09-24 21:40",
      },
    ],
  },
  extras: { hitcar: false, jail: false, economy: false },
};

const KEY = "solidus-panel-modules";
export const GUILD_KEY = "solidus-guild-id";

export function selectedGuildId() {
  return localStorage.getItem(GUILD_KEY) || "";
}

export function guildHeaders(): HeadersInit {
  const guildId = selectedGuildId();
  return guildId
    ? { "Content-Type": "application/json", "X-Guild-Id": guildId }
    : { "Content-Type": "application/json" };
}

function merge(raw: Partial<PanelModules> | null): PanelModules {
  const base = structuredClone(DEFAULT_MODULES);
  if (!raw) return base;
  (Object.keys(base) as (keyof PanelModules)[]).forEach((key) => {
    const value = raw[key];
    if (value && typeof value === "object") Object.assign(base[key], value);
  });
  return base;
}

export async function loadPanelModules(): Promise<PanelModules> {
  try {
    const res = await fetch("/api/modules", { headers: guildHeaders(), credentials: "include" });
    if (res.ok) return merge(await res.json());
  } catch {
    /* bot API offline */
  }
  try {
    const stored = localStorage.getItem(KEY);
    if (stored) return merge(JSON.parse(stored));
  } catch {
    /* ignore */
  }
  return structuredClone(DEFAULT_MODULES);
}

export async function savePanelModules(next: PanelModules): Promise<void> {
  localStorage.setItem(KEY, JSON.stringify(next));
  await fetch("/api/modules", {
    method: "PUT",
    headers: guildHeaders(),
    credentials: "include",
    body: JSON.stringify(next),
  }).catch(() => undefined);
}
