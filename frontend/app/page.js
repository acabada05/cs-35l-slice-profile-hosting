"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// Fake G-code lines that scroll in the background
const GCODE_LINES = [
  "G28 ; Home all axes",
  "M104 S215 ; Set extruder temp",
  "M140 S60 ; Set bed temp",
  "G1 Z0.2 F3000",
  "G1 X10 Y10 F5000",
  "M106 S255 ; Fan on",
  "G1 E2 F300 ; Prime",
  "layer_height = 0.20",
  "perimeters = 3",
  "fill_density = 15%",
  "fill_pattern = gyroid",
  "support_material = 0",
  "retract_length = 0.5",
  "G1 X150 Y150 E12.5",
  "M73 P24 R14",
  "G92 E0 ; Reset extruder",
  "T0 ; Select tool 0",
  "M221 S100 ; Flow rate",
  "G1 F1800 E-1.5",
  "first_layer_speed = 30%",
  "bridge_speed = 60",
  "external_perimeter_speed = 45",
  "M900 K0.04 ; Linear advance",
  "G4 P500 ; Dwell",
  "M82 ; Absolute extrusion",
];

function GcodeBackground() {
  const containerRef = useRef(null);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    const cols = 4;
    const generated = Array.from({ length: cols }, (_, colIdx) => ({
      id: colIdx,
      lines: Array.from({ length: 30 }, (_, i) =>
        GCODE_LINES[(i + colIdx * 7) % GCODE_LINES.length]
      ),
      duration: 28 + colIdx * 6,
      delay: -(colIdx * 7),
    }));
    setColumns(generated);
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
    >
      <div className="absolute inset-0 bg-zinc-950/80 z-10" />
      <div className="flex h-full gap-8 px-8 opacity-[0.18]">
        {columns.map((col) => (
          <div key={col.id} className="flex-1 overflow-hidden relative">
            <div
              className="flex flex-col gap-3 font-mono text-xs text-emerald-400 whitespace-nowrap"
              style={{
                animation: `scrollUp ${col.duration}s ${col.delay}s linear infinite`,
              }}
            >
              {[...col.lines, ...col.lines].map((line, i) => (
                <span key={i} className="block leading-relaxed">
                  {line}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes scrollUp {
          from { transform: translateY(0); }
          to { transform: translateY(-50%); }
        }
      `}</style>
    </div>
  );
}

function AnimatedChar({ char, delay }) {
  return (
    <span
      className="inline-block opacity-0"
      style={{
        animation: `fadeSlideIn 0.04s ${delay}s forwards`,
      }}
    >
      {char === " " ? "\u00A0" : char}
    </span>
  );
}

function TypewriterHeading({ text }) {
  return (
    <h1 className="font-mono text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
      {text.split("").map((char, i) => (
        <AnimatedChar key={i} char={char} delay={0.3 + i * 0.035} />
      ))}

    </h1>
  );
}

function StatPill({ value, label, delay }) {
  return (
    <div
      className="opacity-0 border border-zinc-700 rounded px-4 py-2 text-center"
      style={{ animation: `fadeSlideIn 0.5s ${delay}s forwards` }}
    >
      <div className="font-mono text-lg font-bold text-white">{value}</div>
      <div className="font-mono text-xs text-zinc-500 mt-0.5">{label}</div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative flex-1 flex items-center justify-center bg-zinc-950 overflow-hidden min-h-[calc(100vh-4rem)]">
      <GcodeBackground />

      {/* Crosshair corners — top left */}
      <span aria-hidden className="absolute top-8 left-8 w-6 h-6 border-t-2 border-l-2 border-zinc-600 z-20" />
      {/* top right */}
      <span aria-hidden className="absolute top-8 right-8 w-6 h-6 border-t-2 border-r-2 border-zinc-600 z-20" />
      {/* bottom left */}
      <span aria-hidden className="absolute bottom-8 left-8 w-6 h-6 border-b-2 border-l-2 border-zinc-600 z-20" />
      {/* bottom right */}
      <span aria-hidden className="absolute bottom-8 right-8 w-6 h-6 border-b-2 border-r-2 border-zinc-600 z-20" />

      <div className="relative z-20 max-w-3xl w-full px-6 py-24 flex flex-col items-start">
        {/* Eyebrow tag */}
        <div
          className="opacity-0 mb-6 inline-flex items-center gap-2 font-mono text-xs text-emerald-400 border border-emerald-400/30 rounded-sm px-3 py-1"
          style={{ animation: "fadeSlideIn 0.5s 0.1s forwards" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          SLICE // PROFILE HOSTING v1.0
        </div>

        {/* Main heading */}
        <TypewriterHeading text="Your profiles." />
        <div
          className="opacity-0 font-mono text-4xl sm:text-6xl font-bold tracking-tight text-zinc-500 leading-tight mb-8"
          style={{ animation: "fadeSlideIn 0.5s 2.2s forwards" }}
        >
          Tuned. Shared.
        </div>

        {/* Sub */}
        <p
          className="opacity-0 font-mono text-sm text-zinc-400 max-w-md leading-relaxed mb-10 border-l-2 border-zinc-700 pl-4"
          style={{ animation: "fadeSlideIn 0.5s 2.5s forwards" }}
        >
          Upload your slicer configs. Browse profiles.
          Compare settings side-by-side. Never lose a tuned profile again.
        </p>

        {/* CTA buttons */}
        <div
          className="opacity-0 flex flex-col sm:flex-row gap-3 mb-14"
          style={{ animation: "fadeSlideIn 0.5s 2.8s forwards" }}
        >
          <Link
            href="/upload"
            className="group inline-flex items-center justify-center gap-2 h-11 px-6 rounded-sm bg-emerald-400 text-zinc-950 font-mono text-sm font-bold hover:bg-emerald-300 transition-colors"
          >
            <span className="font-mono">{">"}</span>
            UPLOAD PROFILE
          </Link>
          <Link
            href="/browse"
            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-sm border border-zinc-600 text-zinc-300 font-mono text-sm font-medium hover:border-zinc-400 hover:text-white transition-colors"
          >
            BROWSE PROFILES
          </Link>
        </div>

        {/* Stats row */}
        <div className="flex gap-4">
          <StatPill value="∞" label="PROFILES" delay={3.1} />
          <StatPill value="3D" label="STL SUPPORT" delay={3.2} />
          <StatPill value="DIFF" label="COMPARE" delay={3.3} />
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}