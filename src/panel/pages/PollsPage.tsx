import { useState } from "react";
import { INITIAL_POLLS, POLL_CHANNELS } from "../data/mock";
import {
  PanelCard,
  PanelPageHeader,
  PanelSelect,
  PanelToast,
} from "../components/ui";
import "./PollsPage.css";

type Poll = {
  id: string;
  question: string;
  channel: string;
  votes: number;
  active: boolean;
  answers: string[];
};

export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>(
    INITIAL_POLLS.map((p) => ({ ...p, answers: [...p.answers] })),
  );
  const [question, setQuestion] = useState("");
  const [channel, setChannel] = useState<string>(POLL_CHANNELS[0].value);
  const [answers, setAnswers] = useState<string[]>(["Taip", "Ne"]);
  const [toast, setToast] = useState<string | null>(null);

  const channelOptions = POLL_CHANNELS.map((c) => ({
    value: c.value,
    label: c.label,
  }));

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }

  function updateAnswer(index: number, value: string) {
    setAnswers((prev) => prev.map((a, i) => (i === index ? value : a)));
  }

  function addAnswer() {
    if (answers.length >= 10) {
      showToast("Maks. 10 atsakymų");
      return;
    }
    setAnswers((prev) => [...prev, ""]);
  }

  function removeAnswer(index: number) {
    if (answers.length <= 2) {
      showToast("Reikia bent 2 atsakymų");
      return;
    }
    setAnswers((prev) => prev.filter((_, i) => i !== index));
  }

  function create() {
    if (!question.trim()) {
      showToast("Įveskite klausimą");
      return;
    }

    const cleanAnswers = answers.map((a) => a.trim()).filter(Boolean);
    if (cleanAnswers.length < 2) {
      showToast("Pridėkite bent 2 atsakymus");
      return;
    }

    setPolls((prev) => [
      {
        id: `p-${Date.now()}`,
        question: question.trim(),
        channel,
        votes: 0,
        active: true,
        answers: cleanAnswers,
      },
      ...prev,
    ]);
    setQuestion("");
    setAnswers(["Taip", "Ne"]);
    setChannel(POLL_CHANNELS[0].value);
    showToast(`Apklausa sukurta kanale ${channel}`);
  }

  function closePoll(id: string) {
    setPolls((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: false } : p)),
    );
    showToast("Apklausa uždaryta");
  }

  return (
    <div className="panel-page">
      <PanelPageHeader
        title="Apklausos"
        lead="Kurkite apklausas su atsakymais ir pasirinkite kanalą, kur postinti."
        actions={<span className="panel-badge">Nauja</span>}
      />

      <PanelCard title="Nauja apklausa">
        <div className="panel-form">
          <div className="panel-field">
            <label htmlFor="poll-q">Klausimas</label>
            <input
              id="poll-q"
              className="panel-input"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ką norite sužinoti?"
            />
          </div>

          <div className="panel-field">
            <label htmlFor="poll-channel">Kanalas</label>
            <PanelSelect
              id="poll-channel"
              aria-label="Kanalas"
              value={channel}
              options={channelOptions}
              onChange={setChannel}
            />
            <p className="polls__hint">Apklausa bus paskelbta šiame kanale.</p>
          </div>

          <div className="panel-field">
            <label>Atsakymai</label>
            <div className="polls__answers">
              {answers.map((answer, index) => (
                <div key={index} className="polls__answer-row">
                  <span className="polls__answer-index" aria-hidden="true">
                    {index + 1}
                  </span>
                  <input
                    className="panel-input"
                    value={answer}
                    onChange={(e) => updateAnswer(index, e.target.value)}
                    placeholder={`Atsakymas ${index + 1}`}
                    aria-label={`Atsakymas ${index + 1}`}
                  />
                  <button
                    type="button"
                    className="panel-btn panel-btn--danger"
                    onClick={() => removeAnswer(index)}
                    disabled={answers.length <= 2}
                    aria-label={`Šalinti atsakymą ${index + 1}`}
                  >
                    Šalinti
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="panel-btn panel-btn--ghost"
              onClick={addAnswer}
              disabled={answers.length >= 10}
            >
              + Pridėti atsakymą
            </button>
          </div>

          <button type="button" className="panel-btn panel-btn--primary" onClick={create}>
            Sukurti apklausą
          </button>
        </div>
      </PanelCard>

      <PanelCard title="Sąrašas">
        <div className="panel-list">
          {polls.map((poll) => (
            <div key={poll.id} className="polls__item">
              <div className="polls__item-main">
                <strong>{poll.question}</strong>
                <span>
                  {poll.channel} · {poll.votes} balsų ·{" "}
                  {poll.active ? "Aktyvi" : "Uždaryta"}
                </span>
                <ul className="polls__item-answers">
                  {poll.answers.map((answer) => (
                    <li key={answer}>{answer}</li>
                  ))}
                </ul>
              </div>
              {poll.active ? (
                <button
                  type="button"
                  className="panel-btn panel-btn--ghost"
                  onClick={() => closePoll(poll.id)}
                >
                  Uždaryti
                </button>
              ) : (
                <span className="panel-badge">Archyvas</span>
              )}
            </div>
          ))}
        </div>
      </PanelCard>

      <PanelToast message={toast} />
    </div>
  );
}
