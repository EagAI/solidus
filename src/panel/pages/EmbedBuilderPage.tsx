import { useMemo, useState, type ReactNode } from "react";
import {
  PanelPageHeader,
  PanelToast,
  PanelToggle,
} from "../components/ui";
import "./EmbedBuilderPage.css";

type EmbedField = {
  id: string;
  name: string;
  value: string;
  inline: boolean;
};

type EmbedState = {
  content: string;
  authorName: string;
  authorIcon: string;
  authorUrl: string;
  title: string;
  titleUrl: string;
  description: string;
  color: string;
  thumbnail: string;
  image: string;
  footerText: string;
  footerIcon: string;
  timestamp: boolean;
  fields: EmbedField[];
};

type SectionKey =
  | "content"
  | "author"
  | "body"
  | "fields"
  | "media"
  | "footer"
  | "json";

const DEFAULT_OPEN: Record<SectionKey, boolean> = {
  content: true,
  author: false,
  body: true,
  fields: false,
  media: false,
  footer: false,
  json: true,
};

function CollapsibleSection({
  title,
  open,
  onToggle,
  children,
  className = "",
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel-card embed__section${open ? " is-open" : ""} ${className}`.trim()}>
      <button
        type="button"
        className="embed__section-toggle"
        onClick={onToggle}
        aria-expanded={open}
      >
        <span>{title}</span>
        <svg viewBox="0 0 12 8" aria-hidden="true">
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
      {open ? <div className="embed__section-body">{children}</div> : null}
    </section>
  );
}

const DEFAULT_EMBED: EmbedState = {
  content: "",
  authorName: "Solidus",
  authorIcon: "",
  authorUrl: "",
  title: "Sveiki atvykę!",
  titleUrl: "",
  description:
    "Tai yra **embed** peržiūra. Redaguokite laukus kairėje ir matykite Discord stiliaus rezultatą.",
  color: "#6b4eff",
  thumbnail: "",
  image: "",
  footerText: "Solidus Bot",
  footerIcon: "",
  timestamp: true,
  fields: [
    { id: "f1", name: "Serveris", value: "Solidus HQ", inline: true },
    { id: "f2", name: "Nariai", value: "1,248", inline: true },
  ],
};

function buildPayload(embed: EmbedState) {
  const embedObj: Record<string, unknown> = {};

  if (embed.title.trim()) embedObj.title = embed.title.trim();
  if (embed.titleUrl.trim()) embedObj.url = embed.titleUrl.trim();
  if (embed.description.trim()) embedObj.description = embed.description.trim();
  if (embed.color) {
    embedObj.color = Number.parseInt(embed.color.replace("#", ""), 16);
  }

  if (embed.authorName.trim()) {
    embedObj.author = {
      name: embed.authorName.trim(),
      ...(embed.authorIcon.trim() ? { icon_url: embed.authorIcon.trim() } : {}),
      ...(embed.authorUrl.trim() ? { url: embed.authorUrl.trim() } : {}),
    };
  }

  if (embed.thumbnail.trim()) {
    embedObj.thumbnail = { url: embed.thumbnail.trim() };
  }

  if (embed.image.trim()) {
    embedObj.image = { url: embed.image.trim() };
  }

  if (embed.footerText.trim() || embed.timestamp) {
    embedObj.footer = {
      ...(embed.footerText.trim() ? { text: embed.footerText.trim() } : {}),
      ...(embed.footerIcon.trim() ? { icon_url: embed.footerIcon.trim() } : {}),
    };
  }

  if (embed.timestamp) {
    embedObj.timestamp = new Date().toISOString();
  }

  const fields = embed.fields
    .filter((f) => f.name.trim() || f.value.trim())
    .map((f) => ({
      name: f.name.trim() || "\u200b",
      value: f.value.trim() || "\u200b",
      inline: f.inline,
    }));

  if (fields.length) embedObj.fields = fields;

  return {
    content: embed.content.trim() || undefined,
    embeds: [embedObj],
  };
}

function renderMarkdownLite(text: string) {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br />");
}

export default function EmbedBuilderPage() {
  const [embed, setEmbed] = useState<EmbedState>(DEFAULT_EMBED);
  const [tab, setTab] = useState<"gui" | "json">("gui");
  const [openSections, setOpenSections] = useState(DEFAULT_OPEN);
  const [toast, setToast] = useState<string | null>(null);

  const payload = useMemo(() => buildPayload(embed), [embed]);
  const json = useMemo(() => JSON.stringify(payload, null, 2), [payload]);

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }

  function toggleSection(key: SectionKey) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function patch(partial: Partial<EmbedState>) {
    setEmbed((prev) => ({ ...prev, ...partial }));
  }

  function updateField(id: string, partial: Partial<EmbedField>) {
    setEmbed((prev) => ({
      ...prev,
      fields: prev.fields.map((f) => (f.id === id ? { ...f, ...partial } : f)),
    }));
  }

  function addField() {
    setEmbed((prev) => ({
      ...prev,
      fields: [
        ...prev.fields,
        { id: `f-${Date.now()}`, name: "", value: "", inline: false },
      ],
    }));
  }

  function removeField(id: string) {
    setEmbed((prev) => ({
      ...prev,
      fields: prev.fields.filter((f) => f.id !== id),
    }));
  }

  async function copyJson() {
    try {
      await navigator.clipboard.writeText(json);
      showToast("JSON nukopijuotas");
    } catch {
      showToast("Nepavyko nukopijuoti");
    }
  }

  function resetEmbed() {
    setEmbed(DEFAULT_EMBED);
    showToast("Atstatyta");
  }

  function sendMock() {
    showToast("Embed išsiųstas (mock)");
  }

  const hasEmbedBody =
    embed.title ||
    embed.description ||
    embed.authorName ||
    embed.footerText ||
    embed.image ||
    embed.thumbnail ||
    embed.fields.some((f) => f.name || f.value);

  return (
    <div className="panel-page">
      <PanelPageHeader
        title="Embed builder"
        lead="Kurkite Discord embed žinutes su gyva peržiūra — panašiai kaip klasikinis embed builder."
        actions={
          <div className="embed__head-actions">
            <button type="button" className="panel-btn panel-btn--ghost" onClick={resetEmbed}>
              Atstatyti
            </button>
            <button type="button" className="panel-btn panel-btn--ghost" onClick={copyJson}>
              Kopijuoti JSON
            </button>
            <button type="button" className="panel-btn panel-btn--primary" onClick={sendMock}>
              Siųsti (mock)
            </button>
          </div>
        }
      />

      <div className="embed__tabs">
        <button
          type="button"
          className={"embed__tab" + (tab === "gui" ? " is-active" : "")}
          onClick={() => setTab("gui")}
        >
          GUI
        </button>
        <button
          type="button"
          className={"embed__tab" + (tab === "json" ? " is-active" : "")}
          onClick={() => setTab("json")}
        >
          JSON
        </button>
      </div>

      <div className="embed__layout">
        <div className="embed__editor">
          {tab === "json" ? (
            <CollapsibleSection
              title="JSON"
              open={openSections.json}
              onToggle={() => toggleSection("json")}
            >
              <textarea
                className="panel-textarea embed__json"
                value={json}
                readOnly
                spellCheck={false}
              />
              <button type="button" className="panel-btn panel-btn--primary" onClick={copyJson}>
                Kopijuoti
              </button>
            </CollapsibleSection>
          ) : (
            <>
              <CollapsibleSection
                title="Žinutės turinys"
                open={openSections.content}
                onToggle={() => toggleSection("content")}
              >
                <div className="panel-field">
                  <label htmlFor="msg-content">Message content</label>
                  <textarea
                    id="msg-content"
                    className="panel-textarea"
                    value={embed.content}
                    onChange={(e) => patch({ content: e.target.value })}
                    placeholder="Tekstas virš embed..."
                  />
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                title="Author"
                open={openSections.author}
                onToggle={() => toggleSection("author")}
              >
                <div className="embed__grid">
                  <div className="panel-field">
                    <label htmlFor="author-name">Vardas</label>
                    <input
                      id="author-name"
                      className="panel-input"
                      value={embed.authorName}
                      onChange={(e) => patch({ authorName: e.target.value })}
                    />
                  </div>
                  <div className="panel-field">
                    <label htmlFor="author-url">URL</label>
                    <input
                      id="author-url"
                      className="panel-input"
                      value={embed.authorUrl}
                      onChange={(e) => patch({ authorUrl: e.target.value })}
                      placeholder="https://"
                    />
                  </div>
                </div>
                <div className="panel-field">
                  <label htmlFor="author-icon">Icon URL</label>
                  <input
                    id="author-icon"
                    className="panel-input"
                    value={embed.authorIcon}
                    onChange={(e) => patch({ authorIcon: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                title="Body"
                open={openSections.body}
                onToggle={() => toggleSection("body")}
              >
                <div className="embed__grid">
                  <div className="panel-field">
                    <label htmlFor="embed-title">Title</label>
                    <input
                      id="embed-title"
                      className="panel-input"
                      value={embed.title}
                      onChange={(e) => patch({ title: e.target.value })}
                    />
                  </div>
                  <div className="panel-field">
                    <label htmlFor="embed-title-url">Title URL</label>
                    <input
                      id="embed-title-url"
                      className="panel-input"
                      value={embed.titleUrl}
                      onChange={(e) => patch({ titleUrl: e.target.value })}
                      placeholder="https://"
                    />
                  </div>
                </div>
                <div className="panel-field">
                  <label htmlFor="embed-desc">Description</label>
                  <textarea
                    id="embed-desc"
                    className="panel-textarea"
                    value={embed.description}
                    onChange={(e) => patch({ description: e.target.value })}
                    placeholder="**bold**, *italic*, `code`"
                  />
                </div>
                <div className="panel-field">
                  <label htmlFor="embed-color">Spalva</label>
                  <div className="embed__color-row">
                    <input
                      id="embed-color"
                      type="color"
                      value={embed.color}
                      onChange={(e) => patch({ color: e.target.value })}
                      className="embed__color"
                    />
                    <input
                      className="panel-input"
                      value={embed.color}
                      onChange={(e) => patch({ color: e.target.value })}
                    />
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                title={`Fields (${embed.fields.length})`}
                open={openSections.fields}
                onToggle={() => toggleSection("fields")}
              >
                <div className="embed__fields">
                  {embed.fields.map((field, index) => (
                    <div key={field.id} className="embed__field-card">
                      <div className="embed__field-head">
                        <strong>Field {index + 1}</strong>
                        <button
                          type="button"
                          className="panel-btn panel-btn--danger"
                          onClick={() => removeField(field.id)}
                        >
                          Šalinti
                        </button>
                      </div>
                      <div className="panel-field">
                        <label>Name</label>
                        <input
                          className="panel-input"
                          value={field.name}
                          onChange={(e) =>
                            updateField(field.id, { name: e.target.value })
                          }
                        />
                      </div>
                      <div className="panel-field">
                        <label>Value</label>
                        <textarea
                          className="panel-textarea"
                          value={field.value}
                          onChange={(e) =>
                            updateField(field.id, { value: e.target.value })
                          }
                        />
                      </div>
                      <div className="panel-list-item">
                        <div>
                          <strong>Inline</strong>
                          <span>Rodyti šalia kitų fields</span>
                        </div>
                        <PanelToggle
                          on={field.inline}
                          onToggle={() =>
                            updateField(field.id, { inline: !field.inline })
                          }
                          label="Inline"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" className="panel-btn panel-btn--ghost" onClick={addField}>
                  + Naujas field
                </button>
              </CollapsibleSection>

              <CollapsibleSection
                title="Media"
                open={openSections.media}
                onToggle={() => toggleSection("media")}
              >
                <div className="panel-field">
                  <label htmlFor="thumb">Thumbnail URL</label>
                  <input
                    id="thumb"
                    className="panel-input"
                    value={embed.thumbnail}
                    onChange={(e) => patch({ thumbnail: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="panel-field">
                  <label htmlFor="image">Image URL</label>
                  <input
                    id="image"
                    className="panel-input"
                    value={embed.image}
                    onChange={(e) => patch({ image: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                title="Footer"
                open={openSections.footer}
                onToggle={() => toggleSection("footer")}
              >
                <div className="panel-field">
                  <label htmlFor="footer-text">Tekstas</label>
                  <input
                    id="footer-text"
                    className="panel-input"
                    value={embed.footerText}
                    onChange={(e) => patch({ footerText: e.target.value })}
                  />
                </div>
                <div className="panel-field">
                  <label htmlFor="footer-icon">Icon URL</label>
                  <input
                    id="footer-icon"
                    className="panel-input"
                    value={embed.footerIcon}
                    onChange={(e) => patch({ footerIcon: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="panel-list-item">
                  <div>
                    <strong>Timestamp</strong>
                    <span>Rodyti dabartinę datą footer'yje</span>
                  </div>
                  <PanelToggle
                    on={embed.timestamp}
                    onToggle={() => patch({ timestamp: !embed.timestamp })}
                    label="Timestamp"
                  />
                </div>
              </CollapsibleSection>
            </>
          )}
        </div>

        <div className="embed__preview-wrap">
          <section className="panel-card embed__preview-card">
            <h2 className="panel-card__title">Preview</h2>
            <div className="discord-preview">
              <div className="discord-preview__msg">
                <div className="discord-preview__avatar" aria-hidden="true">
                  S
                </div>
                <div className="discord-preview__body">
                  <div className="discord-preview__meta">
                    <strong>Solidus</strong>
                    <span className="discord-preview__bot">BOT</span>
                    <span className="discord-preview__time">Today at 18:52</span>
                  </div>

                  {embed.content.trim() ? (
                    <p className="discord-preview__content">{embed.content}</p>
                  ) : null}

                  {hasEmbedBody ? (
                    <div
                      className="discord-embed"
                      style={{ borderLeftColor: embed.color || "#202225" }}
                    >
                      <div className="discord-embed__grid">
                        <div className="discord-embed__main">
                          {embed.authorName.trim() ? (
                            <div className="discord-embed__author">
                              {embed.authorIcon.trim() ? (
                                <img src={embed.authorIcon} alt="" />
                              ) : null}
                              {embed.authorUrl.trim() ? (
                                <a href={embed.authorUrl} target="_blank" rel="noreferrer">
                                  {embed.authorName}
                                </a>
                              ) : (
                                <span>{embed.authorName}</span>
                              )}
                            </div>
                          ) : null}

                          {embed.title.trim() ? (
                            <div className="discord-embed__title">
                              {embed.titleUrl.trim() ? (
                                <a href={embed.titleUrl} target="_blank" rel="noreferrer">
                                  {embed.title}
                                </a>
                              ) : (
                                embed.title
                              )}
                            </div>
                          ) : null}

                          {embed.description.trim() ? (
                            <div
                              className="discord-embed__desc"
                              dangerouslySetInnerHTML={{
                                __html: renderMarkdownLite(embed.description),
                              }}
                            />
                          ) : null}

                          {embed.fields.some((f) => f.name || f.value) ? (
                            <div className="discord-embed__fields">
                              {embed.fields
                                .filter((f) => f.name || f.value)
                                .map((f) => (
                                  <div
                                    key={f.id}
                                    className={
                                      "discord-embed__field" +
                                      (f.inline ? " is-inline" : "")
                                    }
                                  >
                                    <div className="discord-embed__field-name">
                                      {f.name || "\u200b"}
                                    </div>
                                    <div
                                      className="discord-embed__field-value"
                                      dangerouslySetInnerHTML={{
                                        __html: renderMarkdownLite(
                                          f.value || "\u200b",
                                        ),
                                      }}
                                    />
                                  </div>
                                ))}
                            </div>
                          ) : null}
                        </div>

                        {embed.thumbnail.trim() ? (
                          <img
                            className="discord-embed__thumb"
                            src={embed.thumbnail}
                            alt=""
                          />
                        ) : null}
                      </div>

                      {embed.image.trim() ? (
                        <img className="discord-embed__image" src={embed.image} alt="" />
                      ) : null}

                      {(embed.footerText.trim() || embed.timestamp) && (
                        <div className="discord-embed__footer">
                          {embed.footerIcon.trim() ? (
                            <img src={embed.footerIcon} alt="" />
                          ) : null}
                          <span>
                            {[
                              embed.footerText.trim() || null,
                              embed.timestamp
                                ? new Date().toLocaleString("lt-LT")
                                : null,
                            ]
                              .filter(Boolean)
                              .join(" • ")}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="discord-preview__empty">Nothing here</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <PanelToast message={toast} />
    </div>
  );
}
