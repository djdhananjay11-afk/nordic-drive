"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { motion } from "framer-motion";
import { ArrowRight, Bot, BrainCircuit, Check, Loader2, Search, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Recommendation = {
  key: string;
  brand: string;
  model: string;
  href: string;
  score: number;
  priceNok: number;
  rangeWltpKm: number;
  winterRangeKm: number;
  chargingMinutes: number;
  reasons: string[];
  tradeoffs: string[];
};

type RecommendationResponse = {
  query: string;
  recommendations: Recommendation[];
  summary: string;
  poweredBy: "openai" | "local";
};

type SearchResponse = {
  results: Array<{
    car: {
      brand: string;
      href: string;
      key: string;
      model: string;
      priceNok: number;
      rangeWltpKm: number;
      winterRangeKm: number;
    };
    reason: string;
    score: number;
  }>;
};

const examplePrompts = [
  "Best family EV under 600000 NOK with long range",
  "Luxury SUV for winter trips and towing",
  "Fast charging EV for Oslo to Bergen weekends",
] as const;

const defaultPrompt = examplePrompts[0];

const quizQuestions = [
  {
    id: "budget",
    label: "Budget",
    options: ["Under 500000 NOK", "Under 600000 NOK", "Under 850000 NOK", "Flexible premium budget"],
  },
  {
    id: "seats",
    label: "Seats",
    options: ["5 seats", "7 seats", "Family with child seats"],
  },
  {
    id: "driving",
    label: "Driving",
    options: ["City commuting", "Long winter road trips", "Cabin weekends", "Mixed family use"],
  },
  {
    id: "priority",
    label: "Priority",
    options: ["Longest range", "Lowest price", "Luxury comfort", "Performance", "Fast charging"],
  },
] as const;

type QuizAnswerKey = (typeof quizQuestions)[number]["id"];

export function AIAssistantView() {
  const [query, setQuery] = useState<string>(defaultPrompt);
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResponse["results"]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [needsTowing, setNeedsTowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isQuizLoading, setIsQuizLoading] = useState(false);

  async function runRecommendation(nextQuery = query) {
    setIsLoading(true);
    setQuery(nextQuery);

    try {
      const [recommendationResponse, searchResponse] = await Promise.all([
        fetch("/api/ai/recommendations", {
          body: JSON.stringify({ query: nextQuery }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        }),
        fetch("/api/ai/search", {
          body: JSON.stringify({ query: nextQuery, limit: 4 }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        }),
      ]);

      if (recommendationResponse.ok) {
        setRecommendation((await recommendationResponse.json()) as RecommendationResponse);
      }

      if (searchResponse.ok) {
        const payload = (await searchResponse.json()) as SearchResponse;
        setSearchResults(payload.results);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function runQuiz() {
    setIsQuizLoading(true);

    try {
      const response = await fetch("/api/ai/quiz", {
        body: JSON.stringify({
          answers: {
            ...quizAnswers,
            towing: needsTowing,
          },
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (response.ok) {
        setRecommendation((await response.json()) as RecommendationResponse);
      }
    } finally {
      setIsQuizLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef4f8_46%,#ffffff_100%)] text-slate-950">
      <section className="relative overflow-hidden px-5 pb-10 pt-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_0%,rgba(255,255,255,0.96),rgba(219,234,254,0.6)_42%,rgba(248,250,252,0)_74%)]" />
        <div className="absolute left-1/2 top-0 h-72 w-[760px] -translate-x-1/2 rounded-full bg-white/70 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-end gap-8 lg:grid-cols-[1fr_0.78fr]">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              <Sparkles className="size-4" />
              NordicDrive AI
            </p>
            <h1 className="mt-4 max-w-4xl text-5xl font-semibold tracking-normal md:text-7xl">
              Ask for the EV you actually need.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Natural-language search, semantic vehicle matching, comparison summaries, and a Norway-focused EV quiz.
            </p>
          </div>

          <GlassCard className="bg-slate-950 p-6 text-white shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-white/48">
              <BrainCircuit className="size-4" />
              AI architecture
            </div>
            <div className="mt-5 grid gap-3 text-sm text-white/70">
              <div>OpenAI Responses API for summaries and parsing</div>
              <div>OpenAI embeddings with local vector fallback</div>
              <div>Deterministic ranking for predictable recommendations</div>
            </div>
          </GlassCard>
        </div>
      </section>

      <section className="px-5 py-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_0.86fr]">
          <GlassCard className="bg-white/80 p-4 shadow-sm md:p-6">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              <Bot className="size-4" />
              AI car recommendations
            </div>
            <div className="mt-5 flex flex-col gap-3 md:flex-row">
              <input
                className="h-12 flex-1 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-950"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Best family EV under 600000 NOK with long range"
                value={query}
              />
              <Button
                className="bg-slate-950 text-white hover:bg-slate-800"
                disabled={isLoading || query.trim().length < 3}
                onClick={() => runRecommendation()}
                size="xl"
                type="button"
              >
                {isLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Search className="mr-2 size-4" />}
                Ask AI
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {examplePrompts.map((prompt) => (
                <button
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-950 hover:bg-white"
                  key={prompt}
                  onClick={() => runRecommendation(prompt)}
                  type="button"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {recommendation ? <RecommendationResults recommendation={recommendation} /> : <EmptyRecommendationState />}
          </GlassCard>

          <GlassCard className="bg-white/80 p-4 shadow-sm md:p-6">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              <Search className="size-4" />
              Semantic search
            </div>
            <div className="mt-5 space-y-3">
              {searchResults.length > 0 ? (
                searchResults.map((result) => (
                  <Link className="block" href={result.car.href as Route} key={result.car.key}>
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-950 hover:bg-white">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                            {result.car.brand}
                          </div>
                          <div className="mt-1 text-lg font-semibold">{result.car.model}</div>
                        </div>
                        <div className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                          {Math.round(result.score * 100)}%
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-500">{result.reason}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-md border border-dashed border-slate-200 p-6 text-sm leading-6 text-slate-500">
                  Search results will appear here after your first AI query.
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </section>

      <section className="px-5 pb-24 pt-8">
        <div className="mx-auto max-w-7xl">
          <GlassCard className="bg-white/80 p-4 shadow-sm md:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">EV recommendation quiz</p>
                <h2 className="mt-2 text-3xl font-semibold">Find a short list in under a minute.</h2>
              </div>
              <Button className="bg-slate-950 text-white hover:bg-slate-800" disabled={isQuizLoading} onClick={runQuiz} size="lg">
                {isQuizLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
                Generate picks
              </Button>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-4">
              {quizQuestions.map((question) => (
                <QuizQuestion
                  key={question.id}
                  onSelect={(value) => setQuizAnswers((current) => ({ ...current, [question.id]: value }))}
                  question={question}
                  selected={quizAnswers[question.id]}
                />
              ))}
            </div>

            <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
              <input checked={needsTowing} onChange={(event) => setNeedsTowing(event.target.checked)} type="checkbox" />
              I need towing for cabin trips, trailer, or winter gear.
            </label>
          </GlassCard>
        </div>
      </section>
    </main>
  );
}

function RecommendationResults({ recommendation }: { recommendation: RecommendationResponse }) {
  return (
    <motion.div animate={{ opacity: 1, y: 0 }} className="mt-6" initial={{ opacity: 0, y: 12 }}>
      <div className="rounded-md bg-slate-950 p-5 text-white">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/48">
          {recommendation.poweredBy === "openai" ? "OpenAI generated" : "Local fallback"}
        </div>
        <p className="mt-3 text-lg font-semibold leading-7">{recommendation.summary}</p>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {recommendation.recommendations.map((car, index) => (
          <Link href={car.href as Route} key={car.key}>
            <div className="h-full rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-slate-950">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">{car.brand}</div>
                  <h3 className="mt-1 text-2xl font-semibold">{car.model}</h3>
                </div>
                <div className="rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white">#{index + 1}</div>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  animate={{ width: `${car.score}%` }}
                  className="h-full rounded-full bg-slate-950"
                  initial={{ width: 0 }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-500">Match score {car.score}</div>
              <div className="mt-5 grid gap-2 text-sm text-slate-600">
                {car.reasons.map((reason) => (
                  <div className="flex gap-2" key={reason}>
                    <Check className="mt-0.5 size-4 text-emerald-600" />
                    {reason}
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center text-sm font-semibold text-slate-950">
                View details
                <ArrowRight className="ml-2 size-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}

function EmptyRecommendationState() {
  return (
    <div className="mt-6 rounded-md border border-dashed border-slate-200 bg-slate-50 p-6 text-sm leading-6 text-slate-500">
      Try the example request: “Best family EV under 600000 NOK with long range.”
    </div>
  );
}

function QuizQuestion({
  onSelect,
  question,
  selected,
}: {
  onSelect: (value: string) => void;
  question: {
    id: QuizAnswerKey;
    label: string;
    options: readonly string[];
  };
  selected?: string | undefined;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">{question.label}</div>
      <div className="mt-4 space-y-2">
        {question.options.map((option) => (
          <button
            className={cn(
              "w-full rounded-md border px-3 py-2 text-left text-sm font-semibold transition",
              selected === option ? "border-slate-950 bg-white text-slate-950" : "border-slate-200 bg-white/60 text-slate-600",
            )}
            key={option}
            onClick={() => onSelect(option)}
            type="button"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
