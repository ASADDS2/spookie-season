import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import topics from "../lib/quiz-topics.json";
import capturedCSS from "../styles/site.css?raw";
import halloweenBanner from "../assets/halloween-banner.jpg";
import { Button } from "../components/ui/button";
import { ArrowUpRight, Check, Ghost, Moon, Sparkles, Trophy } from "lucide-react";

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
      <div className="spookie-app" id="app">
        <header className="season-header"><div className="season-brand"><Ghost aria-hidden="true" /><span>Spookie Season</span></div><span className="season-header-label"><Moon size={14} /> Halloween quiz</span></header>
        {screen === "home" && <main className="season-home">
          <section className="season-hero">
            <img src={halloweenBanner} width={1536} height={512} alt="Glowing pumpkins, a friendly ghost, and a black cat beneath a Halloween moon" />
            <div className="season-hero-copy"><p className="eyebrow"><Sparkles size={13} /> A little curious. A little spooky.</p>
            <h1 className="title">Spookie Season</h1>
            <p className="lede">Pick a topic, answer 5 questions, and learn a short fact after each one.</p>
            <div className="season-meta"><span>4 topics</span><span>20 questions</span><span>One spooky adventure</span></div></div>
          </section>
          <section className="season-topics"><div className="season-section-heading"><h2>Choose your chapter</h2><span><Trophy size={15} /> {completed} / 4 completed</span></div>
          <div className="topic-grid">
            {topics.map((item, index) => <Button variant="quiz" size="quiz" key={item.id} onClick={() => startTopic(item.id)} data-topic={item.id} className={`topic-card topic-card-restored${item.id in scores ? " topic-card--done" : ""}`} type="button">
              <div className="topic-top"><span className="topic-card__icon">{item.icon}</span><span className="topic-number">0{index + 1}</span></div>
              <span className="topic-card__title">{item.title}</span>
              <span className="topic-card__author">By {item.author}</span>
              <div className="topic-bottom"><span className={`topic-card__score${item.id in scores ? "" : " topic-card__score--pending"}`}>{item.id in scores ? <><Check size={13} /> {scores[item.id]}/5</> : "Not played"}</span><ArrowUpRight size={18} /></div>
            </Button>)}
          </div>
          {completed === topics.length ? <Button variant="quiz" size="quiz" type="button" className="btn btn--primary" onClick={() => setScreen("finalResult")}>See final result</Button> : completed > 0 && <p className="progress-hint">{completed} of {topics.length} topics completed</p>}
          </section>
          <footer className="season-footer"><Ghost size={14} /><span>A few facts. A few frights. A good time.</span></footer>
        </main>}
        {screen === "quiz" && topic && question && <main className="screen screen--quiz">
          <p className="eyebrow">{topic.icon} {topic.title}</p>
          <p className="quiz-progress">Question {questionIndex + 1} / {topic.questions.length}</p>
          <div className="question-progress" aria-label={`Question ${questionIndex + 1} of 5`}>{topic.questions.map((item, index) => <span key={item.id} className={index <= questionIndex ? "is-active" : ""} />)}</div>
          <h1 className="question">{question.text}</h1>
          <div className="options">{question.options.map((option, index) => <Button variant="quiz" size="quiz" key={option} type="button" disabled={selected !== null} className={`option${selected !== null ? ` option--locked${index === question.correctIndex ? " option--correct" : index === selected ? " option--wrong" : ""}` : ""}`} onClick={() => {
            if (selected !== null) return;
            setSelected(index); if (index === question.correctIndex) setCorrect(value => value + 1);
          }}><span className="option__letter">{String.fromCharCode(65 + index)}</span><span className="option__text">{option}</span></Button>)}</div>
          {selected !== null && <>
            <div className={`feedback ${selected === question.correctIndex ? "feedback--ok" : "feedback--no"}`} aria-live="polite"><p className="feedback__label">{selected === question.correctIndex ? "Correct!" : "Not quite"}</p><p className="feedback__text">{question.explanation}</p></div>
            <Button variant="quiz" size="quiz" type="button" className="btn btn--primary" onClick={() => {
              if (questionIndex === topic.questions.length - 1) { storeScores({ ...scores, [topic.id]: correct }); setScreen("topicResult"); }
              else { setQuestionIndex(value => value + 1); setSelected(null); }
            }}>{questionIndex === topic.questions.length - 1 ? "See topic score" : "Next"}</Button>
          </>}
        </main>}
        {screen === "topicResult" && topic && <main className="screen screen--result">
          <p className="eyebrow">{topic.icon} {topic.title}</p><h1 className="title">Topic complete</h1><p className="score-big">{scores[topic.id]}/{topic.questions.length}</p>
          <p className="lede">{correct === topic.questions.length ? "Perfect score! " : ""}You can replay this topic anytime; the new score replaces the old one.</p>
          <Button variant="quiz" size="quiz" type="button" className="btn btn--primary" onClick={() => setScreen("home")}>Back to home</Button>
        </main>}
        {screen === "finalResult" && <main className="screen screen--final">
          <p className="eyebrow">Final result</p><h1 className="title title--glow">{title}</h1><p className="score-big">{total}/20</p>
          <p className="lede">Four topics, twenty questions, and a title from beyond. Dare to try again?</p>
          <Button variant="quiz" size="quiz" type="button" className="btn btn--primary" onClick={() => { storeScores({}); setScreen("home"); setTopicId(null); setQuestionIndex(0); setSelected(null); setCorrect(0); }}>Play again</Button>
        </main>}
      </div>
    </>
  );
}
