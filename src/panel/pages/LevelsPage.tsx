import { useMemo, useState } from "react";
import {
  INITIAL_LEADERBOARD,
  INITIAL_LEVEL_MILESTONES,
  INITIAL_ROLES,
} from "../data/mock";
import {
  PanelCard,
  PanelPageHeader,
  PanelSelect,
  PanelToast,
  PanelToggle,
} from "../components/ui";
import "./LevelsPage.css";

type Milestone = {
  id: string;
  level: number;
  roleId: string;
  roleName: string;
  rewardXp: number;
  rewardCoins: number;
  announce: boolean;
  removePrevious: boolean;
};

export default function LevelsPage() {
  const [enabled, setEnabled] = useState(true);
  const [xpPerMsg, setXpPerMsg] = useState(15);
  const [xpPerVoice, setXpPerVoice] = useState(10);
  const [cooldown, setCooldown] = useState(60);
  const [stackRoles, setStackRoles] = useState(false);
  const [announce, setAnnounce] = useState(true);
  const [dmReward, setDmReward] = useState(false);
  const [ignoreBots, setIgnoreBots] = useState(true);
  const [announceChannel, setAnnounceChannel] = useState("#levels");

  const [milestones, setMilestones] = useState<Milestone[]>(
    INITIAL_LEVEL_MILESTONES.map((m) => ({ ...m })),
  );
  const [level, setLevel] = useState(15);
  const [roleId, setRoleId] = useState<string>(INITIAL_ROLES[4]?.id ?? "member");
  const [rewardCoins, setRewardCoins] = useState(100);
  const [rewardXp, setRewardXp] = useState(0);
  const [milestoneAnnounce, setMilestoneAnnounce] = useState(true);
  const [removePrevious, setRemovePrevious] = useState(true);

  const [toast, setToast] = useState<string | null>(null);

  const roleOptions = INITIAL_ROLES.map((role) => ({
    value: role.id,
    label: role.name,
  }));

  const channelOptions = [
    { value: "#levels", label: "#levels" },
    { value: "#general", label: "#general" },
    { value: "#mod-logs", label: "#mod-logs" },
  ];

  const sortedMilestones = useMemo(
    () => [...milestones].sort((a, b) => a.level - b.level),
    [milestones],
  );

  const selectedRole = INITIAL_ROLES.find((r) => r.id === roleId);

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }

  function saveSettings() {
    showToast("XP sistemos nustatymai išsaugoti");
  }

  function addMilestone() {
    if (level < 1) {
      showToast("Lygis turi būti ≥ 1");
      return;
    }
    if (milestones.some((m) => m.level === level)) {
      showToast(`Lygis ${level} jau turi milestone`);
      return;
    }

    setMilestones((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        level,
        roleId,
        roleName: selectedRole?.name ?? "—",
        rewardXp,
        rewardCoins,
        announce: milestoneAnnounce,
        removePrevious,
      },
    ]);
    setLevel((v) => v + 5);
    setRewardCoins(100);
    setRewardXp(0);
    showToast(`Milestone L${level} pridėtas`);
  }

  function removeMilestone(id: string) {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
    showToast("Milestone pašalintas");
  }

  return (
    <div className="panel-page">
      <PanelPageHeader
        title="Lygiai ir XP"
        lead="XP sistema, lygio milestone'ai ir automatinės rolės pasiekus lygį."
      />

      <div className="panel-grid-2">
        <PanelCard title="XP sistema">
          <div className="panel-form">
            <div className="panel-list-item">
              <div>
                <strong>XP sistema</strong>
                <span>{enabled ? "Įjungta" : "Išjungta"}</span>
              </div>
              <PanelToggle
                on={enabled}
                onToggle={() => setEnabled((v) => !v)}
                label="XP sistema"
              />
            </div>

            <div className="levels__grid">
              <div className="panel-field">
                <label htmlFor="xp-msg">XP už žinutę</label>
                <input
                  id="xp-msg"
                  className="panel-input"
                  type="number"
                  min={0}
                  value={xpPerMsg}
                  onChange={(e) => setXpPerMsg(Number(e.target.value))}
                  disabled={!enabled}
                />
              </div>
              <div className="panel-field">
                <label htmlFor="xp-voice">XP / min voice</label>
                <input
                  id="xp-voice"
                  className="panel-input"
                  type="number"
                  min={0}
                  value={xpPerVoice}
                  onChange={(e) => setXpPerVoice(Number(e.target.value))}
                  disabled={!enabled}
                />
              </div>
              <div className="panel-field">
                <label htmlFor="cd">Cooldown (sek.)</label>
                <input
                  id="cd"
                  className="panel-input"
                  type="number"
                  min={0}
                  value={cooldown}
                  onChange={(e) => setCooldown(Number(e.target.value))}
                  disabled={!enabled}
                />
              </div>
              <div className="panel-field">
                <label htmlFor="announce-ch">Level-up kanalas</label>
                <PanelSelect
                  id="announce-ch"
                  aria-label="Level-up kanalas"
                  value={announceChannel}
                  options={channelOptions}
                  onChange={setAnnounceChannel}
                  disabled={!enabled || !announce}
                />
              </div>
            </div>

            <div className="levels__toggles">
              <div className="panel-list-item">
                <div>
                  <strong>Level-up pranešimai</strong>
                  <span>Skelbti pasiekus naują lygį</span>
                </div>
                <PanelToggle
                  on={announce}
                  onToggle={() => setAnnounce((v) => !v)}
                  label="Level-up pranešimai"
                />
              </div>
              <div className="panel-list-item">
                <div>
                  <strong>DM apie atlygį</strong>
                  <span>Siųsti privačią žinutę nariui</span>
                </div>
                <PanelToggle
                  on={dmReward}
                  onToggle={() => setDmReward((v) => !v)}
                  label="DM apie atlygį"
                />
              </div>
              <div className="panel-list-item">
                <div>
                  <strong>Ignoruoti botus</strong>
                  <span>Botai negauna XP</span>
                </div>
                <PanelToggle
                  on={ignoreBots}
                  onToggle={() => setIgnoreBots((v) => !v)}
                  label="Ignoruoti botus"
                />
              </div>
              <div className="panel-list-item">
                <div>
                  <strong>Kaupti roles</strong>
                  <span>Palikti senas lygio roles (nekrauti = tik naujausia)</span>
                </div>
                <PanelToggle
                  on={stackRoles}
                  onToggle={() => setStackRoles((v) => !v)}
                  label="Kaupti roles"
                />
              </div>
            </div>

            <button
              type="button"
              className="panel-btn panel-btn--primary"
              onClick={saveSettings}
              disabled={!enabled}
            >
              Išsaugoti nustatymus
            </button>
          </div>
        </PanelCard>

        <PanelCard title="Lyderių lenta">
          <div className="panel-table-wrap">
            <table className="panel-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Narys</th>
                  <th>Lygis</th>
                  <th>XP</th>
                </tr>
              </thead>
              <tbody>
                {[...INITIAL_LEADERBOARD]
                  .sort((a, b) => b.xp - a.xp)
                  .map((row, i) => (
                    <tr key={row.user}>
                      <td>{i + 1}</td>
                      <td>{row.user}</td>
                      <td>
                        <span className="levels__lvl">L{row.level}</span>
                      </td>
                      <td>{row.xp.toLocaleString()}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </PanelCard>
      </div>

      <PanelCard title="Lygio milestone'ai">
        <p className="levels__lead">
          Pasiekus lygį botas gali duoti rolę, SolidCoins ir paskelbti pranešimą.
        </p>

        {sortedMilestones.length === 0 ? (
          <div className="panel-empty">Dar nėra milestone'ų</div>
        ) : (
          <div className="panel-table-wrap">
            <table className="panel-table">
              <thead>
                <tr>
                  <th>Lygis</th>
                  <th>Rolė</th>
                  <th>Atlygis</th>
                  <th>Parinktys</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {sortedMilestones.map((m) => {
                  const role = INITIAL_ROLES.find((r) => r.id === m.roleId);
                  return (
                    <tr key={m.id}>
                      <td>
                        <span className="levels__lvl">L{m.level}</span>
                      </td>
                      <td>
                        <span className="levels__role">
                          <i
                            style={{ background: role?.color ?? "#6b7280" }}
                            aria-hidden="true"
                          />
                          {m.roleName}
                        </span>
                      </td>
                      <td>
                        {[
                          m.rewardCoins > 0 ? `+${m.rewardCoins} SC` : null,
                          m.rewardXp > 0 ? `+${m.rewardXp} XP` : null,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </td>
                      <td>
                        <div className="levels__tags">
                          {m.announce ? <span className="panel-badge">Skelbti</span> : null}
                          {m.removePrevious ? (
                            <span className="panel-badge">Keisti rolę</span>
                          ) : (
                            <span className="panel-badge">Kaupti</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="panel-btn panel-btn--danger"
                          onClick={() => removeMilestone(m.id)}
                        >
                          Šalinti
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </PanelCard>

      <PanelCard title="Pridėti milestone">
        <div className="panel-form levels__form">
          <div className="levels__grid">
            <div className="panel-field">
              <label htmlFor="ms-level">Lygis</label>
              <input
                id="ms-level"
                className="panel-input"
                type="number"
                min={1}
                value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
                disabled={!enabled}
              />
            </div>
            <div className="panel-field">
              <label htmlFor="ms-role">Serverio rolė</label>
              <PanelSelect
                id="ms-role"
                aria-label="Serverio rolė"
                value={roleId}
                options={roleOptions}
                onChange={setRoleId}
                disabled={!enabled}
              />
            </div>
            <div className="panel-field">
              <label htmlFor="ms-coins">Bonus SolidCoins</label>
              <input
                id="ms-coins"
                className="panel-input"
                type="number"
                min={0}
                value={rewardCoins}
                onChange={(e) => setRewardCoins(Number(e.target.value))}
                disabled={!enabled}
              />
            </div>
            <div className="panel-field">
              <label htmlFor="ms-xp">Bonus XP</label>
              <input
                id="ms-xp"
                className="panel-input"
                type="number"
                min={0}
                value={rewardXp}
                onChange={(e) => setRewardXp(Number(e.target.value))}
                disabled={!enabled}
              />
            </div>
          </div>

          <div className="levels__toggles">
            <div className="panel-list-item">
              <div>
                <strong>Skelbti pasiekimą</strong>
                <span>Pranešimas level-up kanale</span>
              </div>
              <PanelToggle
                on={milestoneAnnounce}
                onToggle={() => setMilestoneAnnounce((v) => !v)}
                label="Skelbti pasiekimą"
              />
            </div>
            <div className="panel-list-item">
              <div>
                <strong>Pašalinti ankstesnę lygio rolę</strong>
                <span>Palikti tik naujausią milestone rolę</span>
              </div>
              <PanelToggle
                on={removePrevious}
                onToggle={() => setRemovePrevious((v) => !v)}
                label="Pašalinti ankstesnę rolę"
              />
            </div>
          </div>

          <div className="levels__summary">
            <strong>Santrauka</strong>
            <p>
              Pasiekus <strong>L{level}</strong> narys gaus rolę „
              {selectedRole?.name ?? "—"}“
              {rewardCoins > 0 ? ` ir +${rewardCoins} SC` : ""}
              {rewardXp > 0 ? ` bei +${rewardXp} XP` : ""}.
            </p>
          </div>

          <button
            type="button"
            className="panel-btn panel-btn--primary"
            onClick={addMilestone}
            disabled={!enabled}
          >
            Pridėti milestone
          </button>
        </div>
      </PanelCard>

      <PanelToast message={toast} />
    </div>
  );
}
