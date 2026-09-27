"use client";

import { useEffect, useRef, useState } from "react";
import CursorGlow from "./CursorGlow";

export default function CursorHost() {
  const containerRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const body = document.body;
    containerRef.current = body;
    body.classList.add("custom-cursor-hidden");
    const frame = window.requestAnimationFrame(() => setMounted(true));

    return () => {
      window.cancelAnimationFrame(frame);
      body.classList.remove("custom-cursor-hidden");
    };
  }, []);

  return mounted ? (
    <>
      <style>{`
        @media (pointer: fine) and (prefers-reduced-motion: no-preference) {
          body.custom-cursor-hidden,
          body.custom-cursor-hidden * {
            cursor: none !important;
          }

          body.custom-cursor-hidden select,
          body.custom-cursor-hidden input,
          body.custom-cursor-hidden textarea {
            cursor: auto !important;
          }
        }
      `}</style>
      <CursorGlow containerRef={containerRef} />
    </>
  ) : null;
}
