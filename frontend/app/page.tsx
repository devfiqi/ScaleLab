"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import PreviewCards from "@/components/PreviewCards";
import ArchitectureGraph from "@/components/ArchitectureGraph";
import PromptInput from "@/components/PromptInput";
import type { DesignResult } from "@/types/design";

export default function Page() {
  const [result, setResult] = useState<DesignResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(input: string) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:8080/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Request failed");
      }

      const data: DesignResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-bg">
      <Navbar />
      <Hero />
      <PromptInput onGenerate={handleGenerate} loading={loading} />
      {error && (
        <div className="mx-auto max-w-5xl px-6">
          <p className="border-2 border-bh-red bg-bh-red/10 px-4 py-3 text-sm font-semibold text-bh-red">
            {error}
          </p>
        </div>
      )}
      <PreviewCards result={result} />
      <ArchitectureGraph result={result} />
      <Footer />
    </main>
  );
}
