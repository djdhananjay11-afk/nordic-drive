"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("route-error", {
      digest: error.digest,
      message: error.message,
      stack: error.stack,
    });
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-5 text-center text-white">
      <section className="max-w-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/45">
          NordicDrive
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal md:text-6xl">
          Something went off route.
        </h1>
        <p className="mt-5 leading-8 text-white/62">
          We logged the issue. Try again, or return to the catalog while the platform recovers.
        </p>
        <Button
          className="mt-8 bg-white text-slate-950 hover:bg-white/88"
          onClick={reset}
          size="lg"
          type="button"
        >
          Try again
        </Button>
      </section>
    </main>
  );
}
