import { createFileRoute } from "@tanstack/react-router";
import capturedCSS from "../styles/site.css?raw";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Spookie Season" }] }),
  staticData: { importedDocument: { html: { "lang": "en" }, body: {  } } },
  component: Index,
});

function Index() {
  return (
    <>
      <style>{capturedCSS}</style>
      <div className="flex justify-center min-h-dvh pt-[20px] pr-[16px] pb-[32px] pl-[16px]" id="app">
        <main className="flex flex-col gap-[16px] max-w-[420px] w-full">
          <p className="text-(--orange) text-[0.75rem] font-extrabold tracking-[0.12em] m-0 uppercase">Halloween Quiz</p>
          <h1 className="text-(--orange-hot) font-[family-name:var(--display)] text-[clamp(2.2rem,9vw,3.2rem)] font-normal tracking-[0.02em] leading-[1.1] m-0">Spookie Season</h1>
          <p className="lede">Pick a topic, answer 5 questions, and learn a short fact after each one.</p>
          <div className="grid gap-[12px] grid-cols-[1fr_1fr]">
            <button className={"topic-card items-start [background:linear-gradient(rgb(58,28,18)_0%,rgb(42,18,12)_100%)] [box-shadow:var(--shadow)] cursor-pointer flex flex-col gap-[4px] min-h-[148px] p-[14px] text-left [color:inherit] [&:focus-visible]:outline-none [&:hover]:outline-none"} type="button">
              <span className="text-[1.8rem] leading-none">🕯️</span>
              <span className="text-[1rem] font-extrabold">History</span>
              <span className="text-(--muted) text-[0.8rem]">By Abraham</span>
              <span className="text-(--muted) text-[0.8rem] font-bold mt-auto">Not played</span>
            </button>
            <button className={"topic-card items-start [background:linear-gradient(rgb(58,28,18)_0%,rgb(42,18,12)_100%)] [box-shadow:var(--shadow)] cursor-pointer flex flex-col gap-[4px] min-h-[148px] p-[14px] text-left [color:inherit] [&:focus-visible]:outline-none [&:hover]:outline-none"} type="button">
              <span className="text-[1.8rem] leading-none">🎃</span>
              <span className="text-[1rem] font-extrabold">Traditions</span>
              <span className="text-(--muted) text-[0.8rem]">By Anyelith</span>
              <span className="text-(--muted) text-[0.8rem] font-bold mt-auto">Not played</span>
            </button>
            <button className={"topic-card items-start [background:linear-gradient(rgb(58,28,18)_0%,rgb(42,18,12)_100%)] [box-shadow:var(--shadow)] cursor-pointer flex flex-col gap-[4px] min-h-[148px] p-[14px] text-left [color:inherit] [&:focus-visible]:outline-none [&:hover]:outline-none"} type="button">
              <span className="text-[1.8rem] leading-none">👻</span>
              <span className="text-[1rem] font-extrabold">Legends &amp; mysteries</span>
              <span className="text-(--muted) text-[0.8rem]">By Sebastian</span>
              <span className="text-(--muted) text-[0.8rem] font-bold mt-auto">Not played</span>
            </button>
            <button className={"topic-card items-start [background:linear-gradient(rgb(58,28,18)_0%,rgb(42,18,12)_100%)] [box-shadow:var(--shadow)] cursor-pointer flex flex-col gap-[4px] min-h-[148px] p-[14px] text-left [color:inherit] [&:focus-visible]:outline-none [&:hover]:outline-none"} type="button">
              <span className="text-[1.8rem] leading-none">🌎</span>
              <span className="text-[1rem] font-extrabold">Around the world</span>
              <span className="text-(--muted) text-[0.8rem]">By Daniel</span>
              <span className="text-(--muted) text-[0.8rem] font-bold mt-auto">Not played</span>
            </button>
          </div>
        </main>
      </div>
    </>
  );
}
