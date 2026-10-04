import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

export type PanelGuild = {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  /** Owner / Administrator / Manage Server — may invite the bot and use the panel. */
  canManage: boolean;
  /** Solidus is already in this server. */
  botIn: boolean;
};

export type PanelUser = {
  id: string;
  username: string;
  globalName: string;
  avatar: string | null;
};

export type PanelSession =
  | { status: "loading" }
  | { status: "offline" }
  | { status: "guest" }
  | { status: "ready"; user: PanelUser; guilds: PanelGuild[] };

export type PanelSessionContext = {
  session: PanelSession;
  refresh: (force?: boolean) => Promise<void>;
  logout: () => Promise<void>;
};

export function usePanelSessionState(): PanelSessionContext {
  const [session, setSession] = useState<PanelSession>({ status: "loading" });

  const refresh = useCallback(async (force = false) => {
    try {
      const res = await fetch(`/api/auth/me${force ? "?refresh=1" : ""}`, {
        credentials: "include",
      });
      if (res.status === 401) {
        setSession({ status: "guest" });
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { user: PanelUser; guilds: PanelGuild[] };
      setSession({ status: "ready", user: data.user, guilds: data.guilds ?? [] });
    } catch {
      // Dev proxy / nginx answer 5xx when the bot process is down.
      setSession({ status: "offline" });
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(
      () => undefined,
    );
    setSession({ status: "guest" });
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { session, refresh, logout };
}

export function usePanelSession() {
  return useOutletContext<PanelSessionContext>();
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters =
    parts.length > 1 ? parts[0][0] + parts[1][0] : (parts[0] ?? "?").slice(0, 2);
  return letters.toUpperCase();
}
