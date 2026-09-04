"use client";

import { useEffect } from "react";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("global-error", {
      digest: error.digest,
      message: error.message,
      stack: error.stack,
    });
  }, [error]);

  return (
    <html lang="en-NO">
      <body>
        <main style={{ display: "grid", minHeight: "100vh", placeItems: "center", padding: 24 }}>
          <section style={{ maxWidth: 560, textAlign: "center" }}>
            <p
              style={{
                color: "#64748b",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              NordicDrive
            </p>
            <h1 style={{ color: "#020617", fontSize: 48, lineHeight: 1, margin: "16px 0" }}>
              We hit a production fault.
            </h1>
            <p style={{ color: "#475569", lineHeight: 1.7 }}>
              The incident has been logged. You can retry the request while recovery information is
              captured.
            </p>
            <button
              onClick={reset}
              style={{
                background: "#020617",
                border: 0,
                borderRadius: 8,
                color: "white",
                cursor: "pointer",
                fontWeight: 700,
                marginTop: 28,
                padding: "12px 18px",
              }}
              type="button"
            >
              Retry
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
