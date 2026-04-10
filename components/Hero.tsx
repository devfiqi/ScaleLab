export default function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-6 pb-2 pt-10">
      <div className="flex items-start gap-4">
        <div className="mt-2 h-5 w-5 shrink-0 bg-bh-red" />
        <div>
          <h1 className="text-3xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-4xl">
            System Design
            <br />
            Playground
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
            Describe a system. Receive a structured analysis — components,
            tradeoffs, bottlenecks, failure modes, and scaling strategies.
          </p>
        </div>
      </div>
    </section>
  );
}
