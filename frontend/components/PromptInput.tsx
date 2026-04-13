"use client";

import { useState } from "react";

const EXAMPLES = [
  "Design a rate limiter",
  "Design a URL shortener",
  "Design a distributed cache",
  "Design a message queue",
  "Design a notification system",
];

type PromptInputProps = {
  onGenerate: (input: string) => void;
  loading: boolean;
};

export default function PromptInput({ onGenerate, loading }: PromptInputProps) {
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim() || loading) return;
    onGenerate(value.trim());
  }

  return (
    <section id="prompt" className="mx-auto max-w-5xl px-6 pb-10 pt-4">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-muted">
        Describe a system
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Input row */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1 border-3 border-fg bg-card shadow-hard-lg">
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g. Design a token-bucket rate limiter"
              className="w-full bg-transparent px-5 py-4 text-base font-medium text-fg placeholder:text-muted/50 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={!value.trim() || loading}
            className="btn-press border-3 border-fg bg-bh-yellow px-8 py-4 text-sm font-extrabold uppercase tracking-widest text-fg shadow-hard-lg disabled:bg-muted/20 disabled:text-muted/50 disabled:shadow-none"
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>
        {loading ? (
          <p className="text-xs text-muted">
            The model is writing your design—often around 20–45 seconds.
          </p>
        ) : null}

        {/* Example chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[10px] font-bold uppercase tracking-widest text-muted">
            Try:
          </span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setValue(ex)}
              className="btn-press border-2 border-fg bg-card px-3 py-1.5 text-xs font-semibold shadow-hard-sm hover:bg-bh-yellow/20"
            >
              {ex}
            </button>
          ))}
        </div>
      </form>
    </section>
  );
}
