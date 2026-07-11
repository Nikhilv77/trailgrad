import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/seo";

export const alt = "Trailgrad interview-readiness workspace";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "linear-gradient(135deg, #f7fcfa 0%, #d8f5ee 48%, #ffffff 100%)",
          color: "#123f3a",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Arial, Helvetica, sans-serif",
          height: "100%",
          justifyContent: "center",
          padding: "72px",
          width: "100%",
        }}
      >
        <div
          style={{
            alignItems: "center",
            display: "flex",
            gap: "18px",
            marginBottom: "42px",
          }}
        >
          <div
            style={{
              alignItems: "center",
              background: "#159b89",
              borderRadius: "24px",
              color: "#ffffff",
              display: "flex",
              fontSize: "42px",
              fontWeight: 800,
              height: "82px",
              justifyContent: "center",
              width: "82px",
            }}
          >
            T
          </div>
          <div style={{ fontSize: "48px", fontWeight: 800 }}>{siteConfig.name}</div>
        </div>

        <div
          style={{
            fontSize: "76px",
            fontWeight: 900,
            letterSpacing: "-3px",
            lineHeight: 0.95,
            maxWidth: "920px",
            textAlign: "center",
          }}
        >
          Interview-ready before you apply.
        </div>

        <div
          style={{
            color: "#587076",
            fontSize: "30px",
            lineHeight: 1.35,
            marginTop: "34px",
            maxWidth: "820px",
            textAlign: "center",
          }}
        >
          Resume review, project prep, mock practice, and AI feedback in one focused workspace.
        </div>
      </div>
    ),
    size,
  );
}
