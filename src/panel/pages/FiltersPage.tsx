import { useState } from "react";
import { INITIAL_FILTERS } from "../data/mock";
import { PanelCard, PanelPageHeader, PanelToggle } from "../components/ui";

type Filter = {
  id: string;
  name: string;
  enabled: boolean;
  hits: number;
};

export default function FiltersPage() {
  const [filters, setFilters] = useState<Filter[]>(
    INITIAL_FILTERS.map((f) => ({ ...f })),
  );

  function toggle(id: string) {
    setFilters((prev) =>
      prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)),
    );
  }

  return (
    <div className="panel-page">
      <PanelPageHeader
        title="Pranešimų filtrai"
        lead="Automatiniai filtrai prieš spamą, invite ir caps lock."
      />

      <PanelCard>
        <div className="panel-list">
          {filters.map((filter) => (
            <div key={filter.id} className="panel-list-item">
              <div>
                <strong>{filter.name}</strong>
                <span>{filter.hits} blokavimų</span>
              </div>
              <PanelToggle
                on={filter.enabled}
                onToggle={() => toggle(filter.id)}
                label={`${filter.name} įjungimas`}
              />
            </div>
          ))}
        </div>
      </PanelCard>
    </div>
  );
}
