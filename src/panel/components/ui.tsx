import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import "../panel.css";

export function PanelPageHeader({
  title,
  lead,
  actions,
}: {
  title: string;
  lead?: string;
  actions?: ReactNode;
}) {
  return (
    <div
      className="panel-page__head"
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div>
        <h1>{title}</h1>
        {lead ? <p>{lead}</p> : null}
      </div>
      {actions}
    </div>
  );
}

export function PanelCard({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel-card ${className}`.trim()}>
      {title ? <h2 className="panel-card__title">{title}</h2> : null}
      {children}
    </section>
  );
}

export function PanelToggle({
  on,
  onToggle,
  label,
}: {
  on: boolean;
  onToggle: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      className={`panel-toggle${on ? " is-on" : ""}`}
      onClick={onToggle}
      aria-pressed={on}
      aria-label={label ?? (on ? "Įjungta" : "Išjungta")}
    >
      <span />
    </button>
  );
}

export function PanelToast({ message }: { message: string | null }) {
  if (!message) return null;
  return <div className="panel-toast">{message}</div>;
}

export type PanelSelectOption = {
  value: string;
  label: string;
};

export function PanelSelect({
  id,
  value,
  options,
  onChange,
  disabled,
  "aria-label": ariaLabel,
}: {
  id?: string;
  value: string;
  options: PanelSelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  "aria-label"?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      className={`panel-select${open ? " is-open" : ""}${disabled ? " is-disabled" : ""}`}
      ref={rootRef}
    >
      <button
        type="button"
        id={id}
        className="panel-select__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => {
          if (!disabled) setOpen((v) => !v);
        }}
      >
        <span>{selected?.label ?? "—"}</span>
        <svg className="panel-select__chevron" viewBox="0 0 12 8" aria-hidden="true">
          <path
            d="M1 1.5 6 6.5 11 1.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open ? (
        <ul id={listId} className="panel-select__menu" role="listbox" aria-label={ariaLabel}>
          {options.map((option) => {
            const active = option.value === value;
            return (
              <li key={option.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={
                    "panel-select__option" + (active ? " is-active" : "")
                  }
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
