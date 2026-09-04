import { ImageResponse } from "next/og";

export const alt = "NordicDrive electric car comparison platform";
export const contentType = "image/png";
export const runtime = "edge";
export const size = {
  height: 630,
  width: 1200,
};

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "linear-gradient(135deg, #f8fafc 0%, #dbeafe 45%, #ffffff 100%)",
        color: "#020617",
        display: "flex",
        height: "100%",
        justifyContent: "center",
        padding: 72,
        position: "relative",
        width: "100%",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.62)",
          border: "1px solid rgba(148,163,184,0.28)",
          borderRadius: 28,
          bottom: 52,
          display: "flex",
          height: 178,
          left: 90,
          position: "absolute",
          right: 90,
        }}
      />
      <div
        style={{
          background: "#020617",
          borderRadius: 999,
          bottom: 78,
          display: "flex",
          height: 72,
          left: 198,
          position: "absolute",
          width: 72,
        }}
      />
      <div
        style={{
          background: "#020617",
          borderRadius: 999,
          bottom: 78,
          display: "flex",
          height: 72,
          position: "absolute",
          right: 198,
          width: 72,
        }}
      />
      <div
        style={{
          display: "flex",
            flexDirection: "column",
            gap: 20,
            maxWidth: 860,
            textAlign: "center",
          }}
        >
        <div
          style={{
            color: "#475569",
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: 7,
            textTransform: "uppercase",
          }}
        >
          NordicDrive
        </div>
        <div style={{ fontSize: 84, fontWeight: 700, letterSpacing: -1, lineHeight: 0.96 }}>
          Electric car intelligence for Norway.
        </div>
        <div style={{ color: "#475569", fontSize: 31, lineHeight: 1.35 }}>
          Compare range, price, charging, launches, and AI recommendations.
        </div>
      </div>
    </div>,
    size,
  );
}
