import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { logo } from "../assets";
import { isSiteUnlocked, unlockSite, verifyPasscode } from "../auth";
import "./ConstructionGate.css";

type ConstructionGateProps = {
  children: ReactNode;
};

export default function ConstructionGate({ children }: ConstructionGateProps) {
  const [unlocked, setUnlocked] = useState(() => isSiteUnlocked());
  const [modalOpen, setModalOpen] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!modalOpen) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(timer);
  }, [modalOpen]);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModalOpen(false);
        setError("");
        setPasscode("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  if (unlocked) return <>{children}</>;

  const openModal = () => {
    setModalOpen(true);
    setError("");
    setPasscode("");
  };

  const closeModal = () => {
    setModalOpen(false);
    setError("");
    setPasscode("");
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (verifyPasscode(passcode)) {
      unlockSite();
      setUnlocked(true);
      return;
    }
    setError("Neteisingas passcode. Bandykite dar kartą.");
    setPasscode("");
    inputRef.current?.focus();
  };

  return (
    <div className="gate">
      <div className="gate__glow gate__glow--left" aria-hidden="true" />
      <div className="gate__glow gate__glow--right" aria-hidden="true" />

      <div className="gate__card">
        <img className="gate__logo" src={logo} alt="Solidus" />
        <p className="gate__eyebrow">Solidus</p>
        <h1>Website under construction</h1>
        <p className="gate__text">
          Šiuo metu svetainė kuriama.
        </p>

        <button type="button" className="gate__access" onClick={openModal}>
          Access to view
        </button>
      </div>

      {modalOpen ? (
        <div
          className="gate__overlay"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            className="gate__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <button
              type="button"
              className="gate__close"
              aria-label="Uždaryti"
              onClick={closeModal}
            >
              ×
            </button>
            <h2 id={titleId}>Enter passcode</h2>
            <p className="gate__modal-text">
              Įveskite access kodą, kad peržiūrėtumėte svetainę.
            </p>
            <form className="gate__form" onSubmit={onSubmit}>
              <label className="gate__label" htmlFor="site-passcode">
                Passcode
              </label>
              <input
                id="site-passcode"
                ref={inputRef}
                className="gate__input"
                type="password"
                autoComplete="off"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (error) setError("");
                }}
                placeholder="••••••••"
              />
              {error ? <p className="gate__error">{error}</p> : null}
              <button type="submit" className="gate__submit">
                Unlock
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
