"use client";

import { useReportWebVitals } from "next/web-vitals";

const vitalsEndpoint = "/api/monitoring/web-vitals";

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    const payload = JSON.stringify({
      id: metric.id,
      name: metric.name,
      rating: metric.rating,
      startTime: metric.startTime,
      value: metric.value,
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(vitalsEndpoint, payload);
      return;
    }

    void fetch(vitalsEndpoint, {
      body: payload,
      headers: {
        "Content-Type": "application/json",
      },
      keepalive: true,
      method: "POST",
    });
  });

  return null;
}
