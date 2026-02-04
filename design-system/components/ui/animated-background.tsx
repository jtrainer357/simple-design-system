"use client";
import * as React from "react";

export function AnimatedBackground() {
  return (
    <>
      <div className="animated-background">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      {/* Diagonal grey gradient from upper right */}
      <div
        className="pointer-events-none fixed inset-0 z-[-1]"
        style={{
          background: "linear-gradient(225deg, rgba(128, 128, 128, 0.09) 0%, transparent 50%)",
        }}
      />
    </>
  );
}
