"use client";
import { useEffect, useState } from "react";

type Safety = {
  status: "verified" | "failed" | "missing" | "invalid";
  message: string;
};
type Food = {
  id: string;
  name: string;
  meals: number;
  address: string;
  cookedAt: number;
  temperature: number | null;
  safety: Safety;
  lat: number | null;
  lng: number | null;
  claimed: boolean;
  claimedBy?: string;
  distanceKm?: number;
};
const WINDOW = 120 * 60000; // 2-hour safe window
const MIN_TEMP = 60; // °C

const SAFETY_BADGE: Record<Safety["status"], { label: string; cls: string }> = {
  verified: { label: "✅ Verified", cls: "bg-green-100 text-green-700" },
  failed: { label: "❌ Failed", cls: "bg-red-100 text-red-700" },
  missing: { label: "⚠️ Missing", cls: "bg-yellow-100 text-yellow-800" },
  invalid: { label: "⚠️ Invalid", cls: "bg-yellow-100 text-yellow-800" },
};

function nowLocal() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function Kitchen() {
  const [f, setF] = useState({ name: "", meals: "", cookedAt: "", address: "", temperature: "" });
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [locMsg, setLocMsg] = useState("");
  const [posts, setPosts] = useState<Food[]>([]);
  const [done, setDone] = useState(false);
  const [now, setNow] = useState(Date.now());

  async function load() {
    setPosts(await (await fetch("/api/food")).json());
  }
  useEffect(() => {
    setF((p) => ({ ...p, cookedAt: nowLocal() }));
    load();
    const t = setInterval(load, 3000);
    const c = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearInterval(t);
      clearInterval(c);
    };
  }, []);

  function getLocation() {
    if (!navigator.geolocation) {
      setLocMsg("❌ This browser does not support location.");
      return;
    }
    setLocMsg("Getting your location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocMsg("");
      },
      () => setLocMsg("❌ Could not get location. Allow location access and try again."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/food", {
      method: "POST",
      body: JSON.stringify({
        ...f,
        cookedAt: new Date(f.cookedAt).toISOString(),
        lat: loc?.lat ?? "",
        lng: loc?.lng ?? "",
      }),
    });
    setF({ name: "", meals: "", cookedAt: nowLocal(), address: "", temperature: "" });
    setDone(true);
    load();
    setTimeout(() => setDone(false), 3000);
  }

  function status(p: Food) {
    if (p.claimed)
      return {
        label: `Claimed by ${p.claimedBy || "an NGO"}${p.distanceKm !== undefined ? ` (${p.distanceKm} km)` : ""}`,
        cls: "bg-blue-100 text-blue-700",
      };
    if (p.cookedAt + WINDOW <= now) return { label: "Expired", cls: "bg-gray-200 text-gray-600" };
    if (p.safety?.status !== "verified")
      return { label: "Blocked: safety", cls: "bg-red-100 text-red-700" };
    return { label: "Available", cls: "bg-green-100 text-green-700" };
  }

  function tempHint() {
    if (f.temperature.trim() === "")
      return { text: "⚠️ Missing: NGOs will not be able to claim this food.", cls: "text-yellow-700" };
    const t = Number(f.temperature);
    if (!Number.isFinite(t) || t < 0 || t > 150)
      return { text: "⚠️ Invalid reading: NGOs will not be able to claim this food.", cls: "text-yellow-700" };
    if (t < MIN_TEMP)
      return { text: `❌ Below ${MIN_TEMP}°C: unsafe, claim will be blocked.`, cls: "text-red-600" };
    return { text: "✅ Safe temperature. NGOs can claim this.", cls: "text-green-700" };
  }
  const hint = tempHint();

  const claimedCount = posts.filter((p) => p.claimed).length;
  const expiredCount = posts.filter((p) => !p.claimed && p.cookedAt + WINDOW <= now).length;
  const blockedCount = posts.filter(
    (p) => !p.claimed && p.cookedAt + WINDOW > now && p.safety?.status !== "verified"
  ).length;
  const availableCount = posts.length - claimedCount - expiredCount - blockedCount;

  const stats = [
    { icon: "📋", label: "Total posted", value: posts.length, cls: "text-orange-950" },
    { icon: "🟢", label: "Available", value: availableCount, cls: "text-green-700" },
    { icon: "🤝", label: "Claimed", value: claimedCount, cls: "text-blue-700" },
    { icon: "🚫", label: "Blocked", value: blockedCount, cls: "text-red-600" },
    { icon: "⛔", label: "Expired", value: expiredCount, cls: "text-gray-600" },
  ];

  const input =
    "w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-orange-950 placeholder-orange-400 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100";
  const label = "mb-2 block text-sm font-semibold text-orange-900";

  return (
    <div className="text-orange-950">
      <header className="border-b border-orange-200 bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-100">🍲 LastCall · Kitchen</p>
            <h1 className="text-3xl font-extrabold">Rescue tonight&apos;s surplus food</h1>
            <p className="mt-1 text-orange-50">
              Post surplus meals with temperature and location so NGOs within 15 km can trust and reach them.
            </p>
          </div>
          <a
            href="/ngo"
            className="rounded-full bg-white px-6 py-3 font-bold text-orange-600 shadow-md transition hover:scale-105"
          >
            NGO view →
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-orange-200 bg-white p-4 text-center shadow-sm">
              <p className="text-2xl">{s.icon}</p>
              <p className={`text-3xl font-extrabold ${s.cls}`}>{s.value}</p>
              <p className="text-sm font-semibold text-orange-800">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-10 md:grid-cols-[1fr_1.2fr]">
          <form
            onSubmit={submit}
            className="space-y-5 rounded-[2rem] border border-orange-200 bg-white p-8 shadow-lg shadow-orange-100"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-500">New food post</p>
              <h2 className="text-2xl font-extrabold">What can be collected?</h2>
            </div>
            <div>
              <label className={label}>🍛 Food name</label>
              <input
                required
                className={input}
                placeholder="e.g. Vegetable biryani"
                value={f.name}
                onChange={(e) => setF({ ...f, name: e.target.value })}
              />
            </div>
            <div>
              <label className={label}>🍽️ Quantity (meals)</label>
              <input
                required
                type="number"
                min="1"
                className={input}
                placeholder="e.g. 30"
                value={f.meals}
                onChange={(e) => setF({ ...f, meals: e.target.value })}
              />
            </div>
            <div>
              <label className={label}>🌡️ Recorded temperature (°C)</label>
              <input
                type="number"
                step="0.1"
                className={input}
                placeholder="e.g. 72"
                value={f.temperature}
                onChange={(e) => setF({ ...f, temperature: e.target.value })}
              />
              <p className={`mt-2 text-sm font-semibold ${hint.cls}`}>{hint.text}</p>
            </div>
            <div>
              <label className={label}>⏱️ Cooked time</label>
              <input
                required
                type="datetime-local"
                className={input}
                value={f.cookedAt}
                onChange={(e) => setF({ ...f, cookedAt: e.target.value })}
              />
            </div>
            <div>
              <label className={label}>📍 Pickup address</label>
              <textarea
                required
                rows={3}
                className={input}
                placeholder="Building, street, locality, city"
                value={f.address}
                onChange={(e) => setF({ ...f, address: e.target.value })}
              />
            </div>
            <div>
              <label className={label}>🛰️ Kitchen location (for the 15 km check)</label>
              <button
                type="button"
                onClick={getLocation}
                className="w-full rounded-full border-2 border-orange-400 bg-white py-3 font-bold text-orange-600 transition hover:bg-orange-50"
              >
                📍 Use my location
              </button>
              {loc && (
                <p className="mt-2 text-sm font-semibold text-green-700">
                  ✅ Location saved ({loc.lat.toFixed(4)}, {loc.lng.toFixed(4)})
                </p>
              )}
              {!loc && !locMsg && (
                <p className="mt-2 text-sm font-semibold text-yellow-700">
                  ⚠️ No location: NGOs will not be able to claim this food.
                </p>
              )}
              {locMsg && <p className="mt-2 text-sm font-semibold text-red-600">{locMsg}</p>}
            </div>
            <button className="w-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 py-4 text-lg font-bold text-white shadow-lg shadow-orange-200 transition hover:scale-[1.02] active:scale-95">
              Post food 🚀
            </button>
            {done && (
              <p className="pop-in text-center font-semibold text-green-700">✅ Posted! Safety check applied.</p>
            )}
          </form>

          <section>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-500">Your board</p>
            <div className="mb-4 flex items-end justify-between">
              <h2 className="text-3xl font-extrabold">Posted food</h2>
              <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
                {posts.length} posts
              </span>
            </div>
            {posts.length === 0 ? (
              <div className="rounded-3xl border-2 border-dashed border-orange-300 bg-white/60 p-10 text-center">
                <div className="text-5xl">🍽️</div>
                <p className="mt-2 text-lg font-bold">Nothing posted yet.</p>
                <p className="text-orange-800">Your newly posted meals will appear here for NGOs to find.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...posts].reverse().map((p) => {
                  const s = status(p);
                  const sb = SAFETY_BADGE[p.safety?.status ?? "missing"];
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-3 rounded-3xl border border-orange-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div>
                        <p className="text-lg font-bold">🍛 {p.name}</p>
                        <p className="text-sm text-orange-800">
                          {p.meals} meals · {p.address}
                        </p>
                        <p className="mt-1 text-sm font-semibold">
                          🌡️ {p.temperature !== null && p.temperature !== undefined ? `${p.temperature}°C` : "No reading"}{" "}
                          <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${sb.cls}`}>
                            {sb.label}
                          </span>
                        </p>
                        <p className="mt-1 text-xs font-semibold text-orange-700">
                          {p.lat !== null && p.lat !== undefined ? "📍 Location saved" : "⚠️ No location"}
                        </p>
                      </div>
                      <span className={`whitespace-nowrap rounded-full px-4 py-1 text-sm font-semibold ${s.cls}`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}