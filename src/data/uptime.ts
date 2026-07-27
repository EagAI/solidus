export type DayStatus = "operational" | "degraded" | "outage" | "maintenance";

export type UptimeDay = {
  date: string; // YYYY-MM-DD
  status: DayStatus;
  uptime: number; // 0-100
  note?: string;
};

export type ServiceStatus = {
  id: string;
  name: string;
  status: DayStatus;
  uptime30d: number;
  latencyMs: number;
};

export type Incident = {
  id: string;
  title: string;
  status: "resolved" | "monitoring" | "investigating";
  startedAt: string;
  resolvedAt?: string;
  summary: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

/** Deterministic pseudo-random from date string */
function seedFromDate(date: string) {
  let h = 0;
  for (let i = 0; i < date.length; i++) h = (h * 31 + date.charCodeAt(i)) >>> 0;
  return h;
}

function statusForSeed(seed: number): { status: DayStatus; uptime: number; note?: string } {
  const roll = seed % 100;
  if (roll < 2) {
    return {
      status: "outage",
      uptime: 92 + (seed % 5),
      note: "Trumpas API sutrikimas",
    };
  }
  if (roll < 6) {
    return {
      status: "degraded",
      uptime: 97 + (seed % 2),
      note: "Padidėjęs atsako laikas",
    };
  }
  if (roll < 9) {
    return {
      status: "maintenance",
      uptime: 99.2,
      note: "Planiniai atnaujinimai",
    };
  }
  return {
    status: "operational",
    uptime: 99.9 + ((seed % 10) / 1000),
  };
}

export function buildUptimeTimeline(days = 90): UptimeDay[] {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const result: UptimeDay[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * DAY_MS);
    const date = formatDate(d);
    const seeded = statusForSeed(seedFromDate(date));
    result.push({ date, ...seeded });
  }

  // Keep recent few days mostly healthy for a realistic "now" feel
  for (let i = result.length - 5; i < result.length; i++) {
    if (i < 0) continue;
    result[i] = {
      ...result[i],
      status: "operational",
      uptime: 100,
      note: undefined,
    };
  }

  return result;
}

export function overallUptime(days: UptimeDay[]): number {
  if (!days.length) return 100;
  const sum = days.reduce((acc, d) => acc + d.uptime, 0);
  return Math.round((sum / days.length) * 1000) / 1000;
}

export const SERVICES: ServiceStatus[] = [
  {
    id: "bot-core",
    name: "Bot core",
    status: "operational",
    uptime30d: 99.98,
    latencyMs: 42,
  },
  {
    id: "slash",
    name: "Slash komandos",
    status: "operational",
    uptime30d: 99.95,
    latencyMs: 68,
  },
  {
    id: "automod",
    name: "Automod / Apsauga",
    status: "operational",
    uptime30d: 99.97,
    latencyMs: 55,
  },
  {
    id: "dashboard",
    name: "Dashboard",
    status: "operational",
    uptime30d: 99.91,
    latencyMs: 120,
  },
];

export const RECENT_INCIDENTS: Incident[] = [
  {
    id: "inc-2401",
    title: "Padidėjęs Discord gateway atsako laikas",
    status: "resolved",
    startedAt: "2026-07-12T14:20:00Z",
    resolvedAt: "2026-07-12T15:05:00Z",
    summary:
      "Laikinai lėtesnės slash komandos dėl Discord API apkrovos. Automatiškai atsistatė.",
  },
  {
    id: "inc-2318",
    title: "Planiniai atnaujinimai",
    status: "resolved",
    startedAt: "2026-06-28T02:00:00Z",
    resolvedAt: "2026-06-28T02:35:00Z",
    summary: "Deploy’intas naujas automod filtras. Trumpas reconnect’as (~2 min).",
  },
  {
    id: "inc-2290",
    title: "Dalies regionų jungčių sutrikimas",
    status: "resolved",
    startedAt: "2026-05-19T09:10:00Z",
    resolvedAt: "2026-05-19T10:40:00Z",
    summary:
      "EU regiono mazgas buvo nepasiekiamas. Trafikas nukreiptas, servisas atkurtas.",
  },
];

export const STATUS_LABEL: Record<DayStatus, string> = {
  operational: "Veikia",
  degraded: "Sutrikimai",
  outage: "Neveikia",
  maintenance: "Priežiūra",
};
