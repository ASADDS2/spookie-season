import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import topics from "../lib/quiz-topics.json";
import capturedCSS from "../styles/site.css?raw";
import halloweenBanner from "../assets/halloween-banner.jpg";
import { Button } from "../components/ui/button";
import { ArrowUpRight, Check, Ghost, Moon, Sparkles, Trophy } from "lucide-react";
import { useServerFn } from '@tanstack/react-start';
import { supabase } from '@/integrations/supabase/client';
import { registerPlayer, creditAnswer } from '@/lib/leaderboard.functions';
import { shuffleQuestions, type QuizQuestion } from '@/lib/leaderboard-rules';

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
  const register = useServerFn(registerPlayer);
  const credit = useServerFn(creditAnswer);
  const [player, setPlayer] = useState<{ id: string; nickname: string; score: number } | null>(null);
  const [guestToken, setGuestToken] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [ranking, setRanking] = useState<{ id: string; nickname: string; score: number }[]>([]);
  const [rankingError, setRankingError] = useState(false);
  const refreshRanking = async () => {
    const result = await supabase.from('quiz_players').select('id,nickname,score').order('score', { ascending: false }).order('created_at', { ascending: true }).limit(50);
    setRankingError(Boolean(result.error));
    if (result.data) setRanking(result.data);
  };
  useEffect(() => {
    let active = true;
    try {
      const saved = JSON.parse(localStorage.getItem('spookie-player') ?? 'null');
      if (saved?.token && saved?.player?.id) { setGuestToken(saved.token); setPlayer(saved.player); }
    } catch { /* A new player can register when storage is unavailable. */ }
    setReady(true);
    void refreshRanking();
    const interval = setInterval(() => { if (active) void refreshRanking(); }, 15000);
    return () => { active = false; clearInterval(interval); };
  }, []);
  const savePlayer = (next: { id: string; nickname: string; score: number }, token: string) => {
    setPlayer(next);
    try { localStorage.setItem('spookie-player', JSON.stringify({ token, player: next })); } catch { /* Optional persistence. */ }
  };
  const submitAnswer = async (index: number) => {
    if (!question || selected !== null || busy || !guestToken) return;
    setBusy(true); setError('');
    try {
      const updated = await credit({ data: { token: guestToken, questionId: question.id, option: question.options[index]! } });
      savePlayer(updated, guestToken);
      setSelected(index);
      if (index === question.correctIndex) setCorrect(value => value + 1);
      await refreshRanking();
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo guardar la respuesta. Intenta de nuevo.'); }
    finally { setBusy(false); }
  };
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
  const [round, setRound] = useState<QuizQuestion[]>([]);
  const startTopic = (id: string) => {
    const selectedTopic = topics.find(item => item.id === id);
    setRound(selectedTopic ? shuffleQuestions(selectedTopic.questions) : []);
    setTopicId(id); setQuestionIndex(0); setSelected(null); setCorrect(0); setScreen("quiz");
  };
  const topic = topics.find(item => item.id === topicId);
  const question = round[questionIndex];
  const completed = topics.filter(item => item.id in scores).length;
  const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const title = total <= 7 ? "Skittish Newbie" : total <= 13 ? "Witch's Apprentice" : total <= 17 ? "Ghost Hunter" : "Master of the Beyond";
  return (
    <>
      <style>{capturedCSS}</style>
      <div className="spookie-app" id="app">
        <header className="season-header"><div className="season-brand"><Ghost aria-hidden="true" /><span>Spookie Season</span></div><span className="season-header-label">{player ? <><Ghost size={14} /> {player.nickname} · {player.score} aciertos</> : <><Moon size={14} /> Halloween quiz</>}</span></header>
        {ready && !player && <div className="nickname-overlay"><form className="nickname-dialog" aria-labelledby="nickname-heading" onSubmit={async event => {
          event.preventDefault(); if (busy) return; setBusy(true); setError('');
          try {
            const result = await register({ data: { nickname } });
            setGuestToken(result.token); savePlayer(result.player, result.token); storeScores({}); await refreshRanking();
          } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo guardar el apodo.'); }
          finally { setBusy(false); }
        }}><Ghost size={36} /><h2 id="nickname-heading">¿Cómo te llamamos?</h2><label htmlFor="nickname">Tu apodo público</label><input id="nickname" autoFocus autoComplete="nickname" minLength={2} maxLength={24} required value={nickname} onChange={event => setNickname(event.target.value)} placeholder="Tu apodo" /><Button variant="quiz" size="quiz" className="btn btn--primary" type="submit" disabled={busy}>{busy ? 'Guardando…' : 'Entrar a jugar'}</Button>{error && <p role="alert">{error}</p>}</form></div>}
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
              <div className="topic-bottom"><span className={`topic-card__score${item.id in scores ? "" : " topic-card__score--pending"}`}>{item.id in scores ? <><Check size={13} /> {scores[item.id]}/5</> : "Not played"}</span><ArrowUpRight size={18} /></div>
            </Button>)}
          </div>
          {completed === topics.length ? <Button variant="quiz" size="quiz" type="button" className="btn btn--primary" onClick={() => setScreen("finalResult")}>See final result</Button> : completed > 0 && <p className="progress-hint">{completed} of {topics.length} topics completed</p>}
          </section>
          <section className="season-leaderboard"><div className="season-section-heading"><h2><Trophy size={20} /> Clasificación</h2><span>Aciertos únicos · /20</span></div>
            {rankingError ? <p role="alert">No se pudo cargar la clasificación. <Button variant="quiz" size="quiz" onClick={() => void refreshRanking()}>Reintentar</Button></p> : ranking.length === 0 ? <p className="lede">La primera posición está esperando a su jugador.</p> : <table><thead><tr><th scope="col">Puesto</th><th scope="col">Jugador</th><th scope="col">Aciertos</th></tr></thead><tbody>{ranking.map((row, index) => <tr key={row.id} className={row.id === player?.id ? 'ranking-self' : ''}><td>{index + 1}</td><td>{row.nickname}{row.id === player?.id && <span> · Tú</span>}</td><td>{row.score}<span> / 20</span></td></tr>)}</tbody></table>}
          </section>
          <footer className="season-footer"><Ghost size={14} /><span>A few facts. A few frights. A good time.</span></footer>
        </main>}
        {screen === "quiz" && topic && question && <main className="screen screen--quiz">
          <p className="eyebrow">{topic.icon} {topic.title}</p>
          <p className="quiz-progress">Question {questionIndex + 1} / {round.length}</p>
          <div className="question-progress" aria-label={`Question ${questionIndex + 1} of ${round.length}`}>{round.map((item, index) => <span key={item.id} className={index <= questionIndex ? "is-active" : ""} />)}</div>
          <h1 className="question">{question.text}</h1>
          <div className="options">{question.options.map((option, index) => <Button variant="quiz" size="quiz" key={option} type="button" disabled={selected !== null || busy} className={`option${selected !== null ? ` option--locked${index === question.correctIndex ? " option--correct" : index === selected ? " option--wrong" : ""}` : ""}`} onClick={() => void submitAnswer(index)}><span className="option__letter">{String.fromCharCode(65 + index)}</span><span className="option__text">{option}</span></Button>)}</div>
          {busy && <p className="lede" role="status">Guardando respuesta…</p>}
          {error && <p role="alert">{error}</p>}
          {selected !== null && <>
            <div className={`feedback ${selected === question.correctIndex ? "feedback--ok" : "feedback--no"}`} aria-live="polite"><p className="feedback__label">{selected === question.correctIndex ? "Correct!" : "Not quite"}</p><p className="feedback__text">{question.explanation}</p></div>
            <Button variant="quiz" size="quiz" type="button" className="btn btn--primary" onClick={() => {
              if (questionIndex === round.length - 1) { storeScores({ ...scores, [topic.id]: correct }); setScreen("topicResult"); }
              else { setQuestionIndex(value => value + 1); setSelected(null); }
            }}>{questionIndex === round.length - 1 ? "See topic score" : "Next"}</Button>
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
