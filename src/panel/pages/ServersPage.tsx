import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { discordIcon, robot } from "../../assets";
import { GUILD_KEY } from "../data/modules";
import { initials, usePanelSession, type PanelGuild } from "../session";
import "./ServersPage.css";

function GuildIcon({ guild }: { guild: PanelGuild }) {
  return guild.icon ? (
    <img className="servers__icon" src={guild.icon} alt="" />
  ) : (
    <span className="servers__icon servers__icon--text">{initials(guild.name)}</span>
  );
}

function GuildCard({
  guild,
  onManage,
  onInvite,
}: {
  guild: PanelGuild;
  onManage: (g: PanelGuild) => void;
  onInvite: (g: PanelGuild) => void;
}) {
  const kind = guild.canManage ? (guild.botIn ? "manage" : "invite") : "member";

  return (
    <article className={`servers__card servers__card--${kind}`}>
      <div className="servers__banner" aria-hidden="true">
        {guild.icon ? <img src={guild.icon} alt="" /> : null}
      </div>
      <GuildIcon guild={guild} />
      <div className="servers__meta">
        <strong title={guild.name}>{guild.name}</strong>
        <span>
          {guild.owner ? "Savininkas" : guild.canManage ? "Administratorius" : "Narys"}
          {guild.botIn ? <em className="servers__badge">Solidus</em> : null}
        </span>
      </div>

      {kind === "manage" ? (
        <button
          type="button"
          className="panel-btn panel-btn--primary servers__action"
          onClick={() => onManage(guild)}
        >
          Valdyti
        </button>
      ) : kind === "invite" ? (
        <button
          type="button"
          className="panel-btn panel-btn--ghost servers__action"
          onClick={() => onInvite(guild)}
        >
          Pakviesti
        </button>
      ) : (
        <span className="servers__note">
          {guild.botIn ? "Solidus veikia" : "Reikia admin teisių"}
        </span>
      )}
    </article>
  );
}

function Section({
  title,
  hint,
  guilds,
  ...handlers
}: {
  title: string;
  hint: string;
  guilds: PanelGuild[];
  onManage: (g: PanelGuild) => void;
  onInvite: (g: PanelGuild) => void;
}) {
  if (!guilds.length) return null;
  return (
    <section className="servers__section">
      <header>
        <h2>
          {title} <span>{guilds.length}</span>
        </h2>
        <p>{hint}</p>
      </header>
      <div className="servers__grid">
        {guilds.map((g) => (
          <GuildCard key={g.id} guild={g} {...handlers} />
        ))}
      </div>
    </section>
  );
}

export default function ServersPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { session, refresh } = usePanelSession();
  const loginFailed = params.get("login") === "failed";

  // After the invite tab is closed, pick up the newly joined server.
  useEffect(() => {
    let last = 0;
    const onFocus = () => {
      if (Date.now() - last < 10_000) return;
      last = Date.now();
      void refresh(true);
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  function manage(guild: PanelGuild) {
    localStorage.setItem(GUILD_KEY, guild.id);
    navigate("/panel/valdymas");
  }

  function invite(guild: PanelGuild) {
    window.open(
      `/api/invite?guildId=${encodeURIComponent(guild.id)}`,
      "solidus-invite",
      "width=520,height=780",
    );
  }

  if (session.status === "loading") {
    return (
      <div className="servers">
        <div className="servers__grid">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="servers__card servers__card--skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (session.status === "offline" || session.status === "guest") {
    const offline = session.status === "offline";
    return (
      <div className="servers servers--center">
        <div className="servers__login">
          <img className="servers__login-robot" src={robot} alt="" />
          <h1>{offline ? "Botas šiuo metu neveikia" : "Prisijunk prie Solidus panelės"}</h1>
          <p>
            {offline
              ? "Panelė negauna atsakymo iš Solidus boto. Pabandyk po minutės."
              : "Prisijunk su Discord – parodysim visus tavo serverius ir tuos, kuriuose gali valdyti Solidus."}
          </p>
          {loginFailed && !offline ? (
            <p className="servers__error" role="alert">
              Prisijungti nepavyko. Bandyk dar kartą.
            </p>
          ) : null}
          {offline ? (
            <button type="button" className="panel-btn panel-btn--ghost" onClick={() => void refresh()}>
              Bandyti dar kartą
            </button>
          ) : (
            <a className="panel-btn panel-btn--primary servers__discord" href="/api/auth/login">
              <img src={discordIcon} alt="" width={20} height={15} />
              Prisijungti su Discord
            </a>
          )}
        </div>
      </div>
    );
  }

  const { user, guilds } = session;
  const managed = guilds.filter((g) => g.canManage && g.botIn);
  const invitable = guilds.filter((g) => g.canManage && !g.botIn);
  const others = guilds.filter((g) => !g.canManage);

  return (
    <div className="servers">
      <header className="servers__head">
        <div>
          <h1>Sveikas, {user.globalName}</h1>
          <p>Pasirink serverį, kurį nori valdyti, arba pakviesk Solidus į naują.</p>
        </div>
        <button
          type="button"
          className="panel-btn panel-btn--ghost"
          onClick={() => {
            if (loginFailed) setParams({});
            void refresh(true);
          }}
        >
          Atnaujinti sąrašą
        </button>
      </header>

      {!managed.length && !invitable.length ? (
        <p className="servers__empty">
          Neturi serverio, kuriame būtum savininkas ar turėtum „Manage Server“ teisę.
          Susikurk serverį Discord'e ir paspausk „Atnaujinti sąrašą“.
        </p>
      ) : null}

      <Section
        title="Valdomi serveriai"
        hint="Solidus jau čia – gali keisti nustatymus."
        guilds={managed}
        onManage={manage}
        onInvite={invite}
      />
      <Section
        title="Pakviesk Solidus"
        hint="Tu čia administratorius, bet boto dar nėra."
        guilds={invitable}
        onManage={manage}
        onInvite={invite}
      />
      <Section
        title="Kiti serveriai"
        hint="Čia esi narys – valdyti gali tik administratoriai."
        guilds={others}
        onManage={manage}
        onInvite={invite}
      />
    </div>
  );
}
