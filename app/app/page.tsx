"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const FOODS = [
  { e: "🍕", left: 5, delay: 0.0, dur: 1.8, size: 48 },
  { e: "🍛", left: 15, delay: 0.3, dur: 2.0, size: 56 },
  { e: "🍔", left: 25, delay: 0.1, dur: 1.7, size: 44 },
  { e: "🥘", left: 35, delay: 0.5, dur: 2.1, size: 60 },
  { e: "🍜", left: 45, delay: 0.2, dur: 1.9, size: 50 },
  { e: "🍚", left: 55, delay: 0.6, dur: 1.8, size: 46 },
  { e: "🌮", left: 65, delay: 0.1, dur: 2.0, size: 54 },
  { e: "🥗", left: 75, delay: 0.4, dur: 1.7, size: 48 },
  { e: "🍞", left: 85, delay: 0.2, dur: 2.1, size: 52 },
  { e: "🍲", left: 92, delay: 0.5, dur: 1.9, size: 58 },
  { e: "🥟", left: 10, delay: 0.8, dur: 1.8, size: 44 },
  { e: "🍗", left: 30, delay: 0.9, dur: 2.0, size: 50 },
  { e: "🍅", left: 50, delay: 0.7, dur: 1.7, size: 42 },
  { e: "🥕", left: 70, delay: 0.9, dur: 1.9, size: 46 },
  { e: "🧅", left: 88, delay: 0.8, dur: 2.0, size: 44 },
];

export default function Home() {
  const router = useRouter();
  const [starting, setStarting] = useState(false);

  const handleStart = () => {
    if (starting) return;
    setStarting(true);
    setTimeout(() => router.push("/kitchen"), 2600);
  };

  const steps = [
    { icon: "🍲", title: "Kitchen posts", text: "Leftover hot food, quantity and cooked time." },
    { icon: "⏱️", title: "Timer runs", text: "A live 2-hour safe window, green then red." },
    { icon: "🤝", title: "NGO claims", text: "First NGO to claim rescues the meals." },
  ];

  return (
    <main className="relative mx-auto max-w-5xl px-6 py-14 text-center">
      <style>{`
        @keyframes lcRise {
          0%   { transform: translateY(0) rotate(0deg); opacity: 0; }
          15%  { opacity: 1; }
          100% { transform: translateY(-115vh) rotate(360deg); opacity: 1; }
        }
        @keyframes lcPotBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-18px) scale(1.08); }
        }
        @keyframes lcSteam {
          0%   { transform: translateY(0) scale(0.6); opacity: 0; }
          30%  { opacity: 0.8; }
          100% { transform: translateY(-90px) scale(1.6); opacity: 0; }
        }
        @keyframes lcPopIn {
          0%   { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Start animation overlay */}
      <div
        className="fixed inset-0 z-[100] overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-red-600"
        style={{
          opacity: starting ? 1 : 0,
          pointerEvents: starting ? "auto" : "none",
          transition: "opacity 0.4s ease",
        }}
      >
        {starting &&
          FOODS.map((f, i) => (
            <span
              key={i}
              className="absolute"
              style={{
                left: `${f.left}%`,
                bottom: "-80px",
                fontSize: f.size,
                animation: `lcRise ${f.dur}s ease-in ${f.delay}s infinite`,
              }}
            >
              {f.e}
            </span>
          ))}

        {starting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="relative">
              {[0, 0.4, 0.8].map((d, i) => (
                <span
                  key={i}
                  className="absolute -top-6 h-8 w-8 rounded-full bg-white/70 blur-md"
                  style={{
                    left: `${20 + i * 30}px`,
                    animation: `lcSteam 1.6s ease-out ${d}s infinite`,
                  }}
                />
              ))}
              <div
                style={{
                  fontSize: 110,
                  animation: "lcPotBounce 0.9s ease-in-out infinite",
                }}
              >
                🍲
              </div>
            </div>
            <p
              className="mt-6 text-3xl font-extrabold text-white drop-shadow-lg"
              style={{ animation: "lcPopIn 0.6s ease 0.3s both" }}
            >
              Heading to the kitchen...
            </p>
          </div>
        )}
      </div>

      <div className="float text-7xl">🍲</div>

      <span className="mt-6 inline-block rounded-full border border-orange-300 bg-white px-4 py-1 text-sm font-semibold text-orange-600">
        TechByte &apos;26 · SDG 2 & SDG 12
      </span>

      <h1 className="mt-6 text-5xl font-extrabold leading-tight text-orange-950 md:text-6xl">
        Rescue hot food <br />
        <span className="text-orange-500">before the clock runs out.</span>
      </h1>

      <p className="mx-auto mt-5 max-w-2xl text-lg text-orange-800">
        LastCall connects kitchens with leftover food to NGOs that can claim it
        within a 2-hour safe window. Less waste, more meals.
      </p>

      <button
        onClick={handleStart}
        className="mt-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-10 py-4 text-lg font-bold text-white shadow-lg shadow-orange-300 transition hover:scale-105 active:scale-95"
      >
        Start 🚀
      </button>

      <div className="mt-16 grid gap-5 md:grid-cols-3">
        {steps.map((s) => (
          <div
            key={s.title}
            className="rounded-2xl border border-orange-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="text-3xl">{s.icon}</div>
            <h3 className="mt-3 text-lg font-bold text-orange-950">{s.title}</h3>
            <p className="mt-1 text-orange-800">{s.text}</p>
          </div>
        ))}
      </div>
    </main>
  );
}