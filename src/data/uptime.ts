import { useEffect, useState } from "react";

export type DayStatus = "operational" | "degraded" | "outage" | "nodata";

export type UptimeDay = {
  date: string; // YYYY-MM-DD
  status: DayStatus;
  /** null = the bot was not tracking yet that day */
  uptime: number | null;
};

export type Outage = { start: number; end: number; minutes: number };

/** Shape of GET /api/uptime (Bot/solidus/src/modules/uptime.js). */
export type UptimeReport = {
  online: boolean;
  pingMs: number | null;
  guilds: number | null;
  startedAt: number;
  trackedSince: number;
  days: { date: string; uptime: number | null }[];
  outages: Outage[];
};

export const STATUS_LABEL: Record<DayStatus, string> = {
  operational: "Veikė",
  degraded: "Su pertrūkiais",
  outage: "Neveikė",
  nodata: "Nėra duomenų",
};

function statusFor(uptime: number | null): DayStatus {
  if (uptime === null) return "nodata";
  if (uptime >= 99.5) return "operational";
  if (uptime >= 95) return "degraded";
  return "outage";
}

/** Last `count` days ending today; days the bot wasn't tracking yet are "nodata". */
export function buildTimeline(report: UptimeReport | null, count = 90): UptimeDay[] {
  const byDate = new Map(report?.days.map((d) => [d.date, d.uptime]) ?? []);
  const today = new Date();
  const result: UptimeDay[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i));
    const date = d.toISOString().slice(0, 10);
    const uptime = byDate.get(date) ?? null;
    result.push({ date, uptime, status: statusFor(uptime) });
  }
  return result;
}

/** Average over days that have data; null when nothing was tracked yet. */
export function averageUptime(days: UptimeDay[]): number | null {
  const tracked = days.filter((d) => d.uptime !== null);
  if (!tracked.length) return null;
  const sum = tracked.reduce((acc, d) => acc + (d.uptime ?? 0), 0);
  return Math.round((sum / tracked.length) * 100) / 100;
}

export type UptimeState =
  | { status: "loading" }
  /** The panel API itself didn't answer: bot process is down. */
  | { status: "unreachable" }
  | { status: "ready"; report: UptimeReport };

/** Polls /api/uptime every 60 s while the page is open. */
export function useUptime(): UptimeState {
  const [state, setState] = useState<UptimeState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetch("/api/uptime")
        .then((res) => {
          if (!res.ok) throw new Error(String(res.status));
          return res.json() as Promise<UptimeReport>;
        })
        .then((report) => !cancelled && setState({ status: "ready", report }))
        .catch(() => !cancelled && setState({ status: "unreachable" }));
    void load();
    const timer = window.setInterval(load, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  return state;
}
