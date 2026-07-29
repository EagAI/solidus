import { useState } from "react";
import { INITIAL_ROLES, INITIAL_SHOP } from "../data/mock";
import {
  PanelCard,
  PanelPageHeader,
  PanelSelect,
  PanelToast,
  PanelToggle,
} from "../components/ui";
import "./ShopPage.css";

type RewardType = "role" | "xp_boost" | "currency" | "custom";

type Item = {
  id: string;
  name: string;
  price: number;
  stock: number;
  rewardType: RewardType;
  roleId: string;
  roleName: string;
  durationDays: number;
  temporary: boolean;
  stackable: boolean;
  announce: boolean;
  description: string;
};

const REWARD_OPTIONS = [
  { value: "role", label: "Rolė (pvz. VIP)" },
  { value: "xp_boost", label: "XP boost" },
  { value: "currency", label: "Valiuta (SolidCoins)" },
  { value: "custom", label: "Custom" },
];

const XP_OPTIONS = [
  { value: "2", label: "x2" },
  { value: "3", label: "x3" },
  { value: "5", label: "x5" },
];

const DURATION_OPTIONS = [
  { value: "1", label: "1 diena" },
  { value: "3", label: "3 dienos" },
  { value: "7", label: "7 dienos" },
  { value: "14", label: "14 dienų" },
  { value: "30", label: "30 dienų" },
  { value: "90", label: "90 dienų" },
];

function rewardLabel(item: Item): string {
  if (item.rewardType === "role") {
    const dur =
      item.temporary && item.durationDays > 0
        ? ` · ${item.durationDays}d`
        : !item.temporary
          ? " · amžinai"
          : "";
    return `Rolė: ${item.roleName || "—"}${dur}`;
  }
  if (item.rewardType === "xp_boost") {
    return `XP boost${item.durationDays ? ` · ${item.durationDays}d` : ""}`;
  }
  if (item.rewardType === "currency") return "Valiutos paketas";
  return "Custom atlygis";
}

export default function ShopPage() {
  const [items, setItems] = useState<Item[]>(INITIAL_SHOP.map((i) => ({ ...i })));
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rewardType, setRewardType] = useState<RewardType>("role");
  const [roleId, setRoleId] = useState<string>(
    INITIAL_ROLES[1]?.id ?? INITIAL_ROLES[0].id,
  );
  const [durationDays, setDurationDays] = useState(7);
  const [xpMult, setXpMult] = useState(2);
  const [bonusSc, setBonusSc] = useState(250);
  const [price, setPrice] = useState(100);
  const [stock, setStock] = useState(10);
  const [temporary, setTemporary] = useState(true);
  const [stackable, setStackable] = useState(false);
  const [announce, setAnnounce] = useState(true);
  const [unlimitedStock, setUnlimitedStock] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const selectedRole = INITIAL_ROLES.find((r) => r.id === roleId);
  const roleOptions = INITIAL_ROLES.map((role) => ({
    value: role.id,
    label: role.name,
  }));

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }

  function resetForm() {
    setName("");
    setDescription("");
    setRewardType("role");
    setRoleId(INITIAL_ROLES[1]?.id ?? INITIAL_ROLES[0].id);
    setDurationDays(7);
    setXpMult(2);
    setBonusSc(250);
    setPrice(100);
    setStock(10);
    setTemporary(true);
    setStackable(false);
    setAnnounce(true);
    setUnlimitedStock(false);
  }

  function addItem() {
    if (!name.trim()) {
      showToast("Įveskite pavadinimą");
      return;
    }
    if (rewardType === "role" && !roleId) {
      showToast("Pasirinkite rolę");
      return;
    }

    const desc =
      description.trim() ||
      (rewardType === "role"
        ? `Duoda rolę „${selectedRole?.name ?? "—"}“`
        : rewardType === "xp_boost"
          ? `XP boost x${xpMult}`
          : rewardType === "currency"
            ? `+${bonusSc} SC`
            : "");

    setItems((prev) => [
      {
        id: `s-${Date.now()}`,
        name: name.trim(),
        price,
        stock: unlimitedStock ? -1 : stock,
        rewardType,
        roleId: rewardType === "role" ? roleId : "",
        roleName: rewardType === "role" ? selectedRole?.name ?? "" : "",
        durationDays: temporary ? durationDays : 0,
        temporary:
          rewardType === "role" || rewardType === "xp_boost" ? temporary : false,
        stackable,
        announce,
        description: desc,
      },
      ...prev,
    ]);
    resetForm();
    showToast("Prekė pridėta");
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    showToast("Prekė pašalinta");
  }

  return (
    <div className="panel-page">
      <PanelPageHeader
        title="Parduotuvė"
        lead="Prekės, kurias nariai gali nusipirkti už serverio valiutą."
      />

      <PanelCard title="Prekės">
        <div className="panel-table-wrap">
          <table className="panel-table">
            <thead>
              <tr>
                <th>Pavadinimas</th>
                <th>Atlygis</th>
                <th>Kaina</th>
                <th>Atsargos</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.name}</strong>
                    {item.description ? (
                      <div className="shop__item-desc">{item.description}</div>
                    ) : null}
                  </td>
                  <td>
                    <span className="shop__reward-pill">{rewardLabel(item)}</span>
                  </td>
                  <td>{item.price} SC</td>
                  <td>{item.stock < 0 ? "∞" : item.stock}</td>
                  <td>
                    <button
                      type="button"
                      className="panel-btn panel-btn--danger"
                      onClick={() => remove(item.id)}
                    >
                      Šalinti
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PanelCard>

      <PanelCard title="Pridėti prekę">
        <div className="panel-form shop__form">
          <div className="panel-field">
            <label htmlFor="item-name">Pavadinimas</label>
            <input
              id="item-name"
              className="panel-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Pvz. VIP 7 dienos"
            />
          </div>

          <div className="panel-field">
            <label htmlFor="item-desc">Aprašymas</label>
            <textarea
              id="item-desc"
              className="panel-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Trumpas prekės aprašymas nariams"
            />
          </div>

          <div className="shop__settings">
            <h3 className="shop__settings-title">Nustatymai</h3>

            <div className="panel-field">
              <label htmlFor="reward-type">Atlygio tipas</label>
              <PanelSelect
                id="reward-type"
                aria-label="Atlygio tipas"
                value={rewardType}
                options={REWARD_OPTIONS}
                onChange={(v) => setRewardType(v as RewardType)}
              />
            </div>

            {rewardType === "role" ? (
              <div className="panel-field">
                <label htmlFor="item-role">Serverio rolė</label>
                <PanelSelect
                  id="item-role"
                  aria-label="Serverio rolė"
                  value={roleId}
                  options={roleOptions}
                  onChange={setRoleId}
                />
                <p className="shop__hint">
                  Pirkėjas automatiškai gaus šią rolę. VIP = pasirinkite VIP rolę.
                </p>
              </div>
            ) : null}

            {rewardType === "xp_boost" ? (
              <div className="panel-field">
                <label htmlFor="xp-mult">XP daugiklis</label>
                <PanelSelect
                  id="xp-mult"
                  aria-label="XP daugiklis"
                  value={String(xpMult)}
                  options={XP_OPTIONS}
                  onChange={(v) => setXpMult(Number(v))}
                />
              </div>
            ) : null}

            {rewardType === "currency" ? (
              <div className="panel-field">
                <label htmlFor="bonus-sc">Bonus SolidCoins</label>
                <input
                  id="bonus-sc"
                  className="panel-input"
                  type="number"
                  min={1}
                  value={bonusSc}
                  onChange={(e) => setBonusSc(Number(e.target.value))}
                />
              </div>
            ) : null}

            {(rewardType === "role" || rewardType === "xp_boost") && (
              <>
                <div className="panel-list-item">
                  <div>
                    <strong>Laikinas atlygis</strong>
                    <span>
                      {temporary
                        ? "Po termino rolė / boost pašalinamas"
                        : "Lieka amžinai"}
                    </span>
                  </div>
                  <PanelToggle
                    on={temporary}
                    onToggle={() => setTemporary((v) => !v)}
                    label="Laikinas atlygis"
                  />
                </div>

                {temporary ? (
                  <div className="panel-field">
                    <label htmlFor="duration">Trukmė</label>
                    <PanelSelect
                      id="duration"
                      aria-label="Trukmė"
                      value={String(durationDays)}
                      options={DURATION_OPTIONS}
                      onChange={(v) => setDurationDays(Number(v))}
                    />
                  </div>
                ) : null}
              </>
            )}

            <div className="shop__grid">
              <div className="panel-field">
                <label htmlFor="item-price">Kaina (SC)</label>
                <input
                  id="item-price"
                  className="panel-input"
                  type="number"
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                />
              </div>
              <div className="panel-field">
                <label htmlFor="item-stock">Atsargos</label>
                <input
                  id="item-stock"
                  className="panel-input"
                  type="number"
                  min={0}
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  disabled={unlimitedStock}
                />
              </div>
            </div>

            <div className="shop__toggles">
              <div className="panel-list-item">
                <div>
                  <strong>Neribotos atsargos</strong>
                  <span>Kiekis neribojamas</span>
                </div>
                <PanelToggle
                  on={unlimitedStock}
                  onToggle={() => setUnlimitedStock((v) => !v)}
                  label="Neribotos atsargos"
                />
              </div>
              <div className="panel-list-item">
                <div>
                  <strong>Galima krauti</strong>
                  <span>Leidžia pirkti kelis kartus / pratęsti</span>
                </div>
                <PanelToggle
                  on={stackable}
                  onToggle={() => setStackable((v) => !v)}
                  label="Galima krauti"
                />
              </div>
              <div className="panel-list-item">
                <div>
                  <strong>Skelbti pirkimą</strong>
                  <span>Pranešimas shop log kanale</span>
                </div>
                <PanelToggle
                  on={announce}
                  onToggle={() => setAnnounce((v) => !v)}
                  label="Skelbti pirkimą"
                />
              </div>
            </div>
          </div>

          <button type="button" className="panel-btn panel-btn--primary" onClick={addItem}>
            Pridėti prekę
          </button>
        </div>
      </PanelCard>

      <PanelToast message={toast} />
    </div>
  );
}
