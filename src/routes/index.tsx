import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import topics from "../lib/quiz-topics.json";
import capturedCSS from "../styles/site.css?raw";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Spookie Season — Halloween Quiz" },
    { name: "description", content: "Explore Halloween history, traditions, legends, and celebrations around the world in twenty quiz questions." },
    { property: "og:title", content: "Spookie Season — Halloween Quiz" },
    { property: "og:description", content: "Test your Halloween knowledge across four spooky topics." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  staticData: { importedDocument: { html: { "lang": "en" }, body: {  } } },
  component: Index,
});

function Index() {
  const [screen, setScreen] = useState<"home" | "quiz" | "topicResult" | "finalResult">("home");
  const [topicId, setTopicId] = useState<string | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem("spookie-season-scores") ?? "{}");
      if (saved && typeof saved === "object" && !Array.isArray(saved)) {
        setScores(Object.fromEntries(Object.entries(saved).filter(([, score]) => typeof score === "number" && Number.isFinite(score))));
      }
    } catch { /* Preserve the source's graceful storage fallback. */ }
  }, []);
  const storeScores = (next: Record<string, number>) => {
    setScores(next);
    try { localStorage.setItem("spookie-season-scores", JSON.stringify(next)); } catch { /* Storage is optional. */ }
  };
  const startTopic = (id: string) => {
    setTopicId(id); setQuestionIndex(0); setSelected(null); setCorrect(0); setScreen("quiz");
  };
  const topic = topics.find(item => item.id === topicId);
  const question = topic?.questions[questionIndex];
  const completed = topics.filter(item => item.id in scores).length;
  const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const title = total <= 7 ? "Skittish Newbie" : total <= 13 ? "Witch's Apprentice" : total <= 17 ? "Ghost Hunter" : "Master of the Beyond";
  return (
    <>
      <style>{capturedCSS}</style>
      <div className="flex justify-center min-h-dvh pt-[20px] pr-[16px] pb-[32px] pl-[16px]" id="app">
        {screen === "home" && <main className="flex flex-col gap-[16px] max-w-[420px] w-full">
          <p className="text-(--orange) text-[0.75rem] font-extrabold tracking-[0.12em] m-0 uppercase">Halloween Quiz</p>
          <h1 className="text-(--orange-hot) font-[family-name:var(--display)] text-[clamp(2.2rem,9vw,3.2rem)] font-normal tracking-[0.02em] leading-[1.1] m-0">Spookie Season</h1>
          <p className="lede">Pick a topic, answer 5 questions, and learn a short fact after each one.</p>
          <div className="grid gap-[12px] grid-cols-[1fr_1fr]">
            {topics.map(item => <button key={item.id} onClick={() => startTopic(item.id)} className={`topic-card topic-card-restored${item.id in scores ? " topic-card--done" : ""}`} type="button">
              <span className="text-[1.8rem] leading-none">{item.icon}</span>
              <span className="text-[1rem] font-extrabold">{item.title}</span>
              <span className="text-(--muted) text-[0.8rem]">By {item.author}</span>
              <span className={`topic-card__score${item.id in scores ? "" : " topic-card__score--pending"}`}>{item.id in scores ? `${scores[item.id]}/5` : "Not played"}</span>
            </button>)}
          </div>
          {completed === topics.length ? <button type="button" className="btn btn--primary" onClick={() => setScreen("finalResult")}>See final result</button> : completed > 0 && <p className="progress-hint">{completed} of {topics.length} topics completed</p>}
        </main>}
        {screen === "quiz" && topic && question && <main className="screen screen--quiz">
          <p className="eyebrow">{topic.icon} {topic.title}</p>
          <p className="quiz-progress">Question {questionIndex + 1} / {topic.questions.length}</p>
          <h1 className="question">{question.text}</h1>
          <div className="options">{question.options.map((option, index) => <button key={option} type="button" disabled={selected !== null} className={`option${selected !== null ? ` option--locked${index === question.correctIndex ? " option--correct" : index === selected ? " option--wrong" : ""}` : ""}`} onClick={() => {
            if (selected !== null) return;
            setSelected(index); if (index === question.correctIndex) setCorrect(value => value + 1);
          }}><span className="option__letter">{String.fromCharCode(65 + index)}</span><span className="option__text">{option}</span></button>)}</div>
          {selected !== null && <>
            <div className={`feedback ${selected === question.correctIndex ? "feedback--ok" : "feedback--no"}`} aria-live="polite"><p className="feedback__label">{selected === question.correctIndex ? "Correct!" : "Not quite"}</p><p className="feedback__text">{question.explanation}</p></div>
            <button type="button" className="btn btn--primary" onClick={() => {
              if (questionIndex === topic.questions.length - 1) { storeScores({ ...scores, [topic.id]: correct }); setScreen("topicResult"); }
              else { setQuestionIndex(value => value + 1); setSelected(null); }
            }}>{questionIndex === topic.questions.length - 1 ? "See topic score" : "Next"}</button>
          </>}
        </main>}
        {screen === "topicResult" && topic && <main className="screen screen--result">
          <p className="eyebrow">{topic.icon} {topic.title}</p><h1 className="title">Topic complete</h1><p className="score-big">{scores[topic.id]}/{topic.questions.length}</p>
          <p className="lede">{correct === topic.questions.length ? "Perfect score! " : ""}You can replay this topic anytime; the new score replaces the old one.</p>
          <button type="button" className="btn btn--primary" onClick={() => setScreen("home")}>Back to home</button>
        </main>}
        {screen === "finalResult" && <main className="screen screen--final">
          <p className="eyebrow">Final result</p><h1 className="title title--glow">{title}</h1><p className="score-big">{total}/20</p>
          <p className="lede">Four topics, twenty questions, and a title from beyond. Dare to try again?</p>
          <button type="button" className="btn btn--primary" onClick={() => { storeScores({}); setScreen("home"); setTopicId(null); setQuestionIndex(0); setSelected(null); setCorrect(0); }}>Play again</button>
        </main>}
      </div>
    </>
  );
}
