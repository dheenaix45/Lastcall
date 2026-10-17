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
};
type Mode = "gps" | "near" | "far";

const WINDOW = 120 * 60000; // 2-hour safe window
const MAX_KM = 15; // pickup radius

const SAFETY_BADGE: Record<Safety["status"], { label: string; cls: string }> = {
    verified: { label: "✅ Verified", cls: "bg-green-100 text-green-700" },
    failed: { label: "❌ Failed", cls: "bg-red-100 text-red-700" },
    missing: { label: "⚠️ Missing", cls: "bg-yellow-100 text-yellow-800" },
    invalid: { label: "⚠️ Invalid", cls: "bg-yellow-100 text-yellow-800" },
};

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
    const R = 6371;
    const rad = (d: number) => (d * Math.PI) / 180;
    const dLat = rad(lat2 - lat1);
    const dLng = rad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
}

function mapsLink(f: Food) {
    if (f.lat !== null && f.lat !== undefined && f.lng !== null && f.lng !== undefined) {
        return `https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lng}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(f.address)}`;
}

export default function NGO() {
    const [foods, setFoods] = useState<Food[]>([]);
    const [now, setNow] = useState(Date.now());
    const [ngoName, setNgoName] = useState("");
    const [warn, setWarn] = useState(false);
    const [error, setError] = useState("");
    const [mode, setMode] = useState<Mode>("gps");
    const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);
    const [locMsg, setLocMsg] = useState("");

    async function load() {
        setFoods(await (await fetch("/api/food")).json());
    }
    useEffect(() => {
        load();
        const a = setInterval(load, 3000);
        const b = setInterval(() => setNow(Date.now()), 1000);
        return () => {
            clearInterval(a);
            clearInterval(b);
        };
    }, []);

    function getLocation() {
        setMode("gps");
        if (!navigator.geolocation) {
            setLocMsg("❌ This browser does not support location. Use a demo button.");
            return;
        }
        setLocMsg("Getting your location...");
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setLocMsg("");
            },
            () => setLocMsg("❌ Could not get location. Allow access, or use a demo button."),
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }

    const demoKm = mode === "near" ? 3 : mode === "far" ? 25 : null;

    function distanceFor(f: Food): number | null {
        if (demoKm !== null) return demoKm;
        if (loc && f.lat !== null && f.lat !== undefined && f.lng !== null && f.lng !== undefined) {
            return haversineKm(f.lat, f.lng, loc.lat, loc.lng);
        }
        return null;
    }

    async function claim(id: string) {
        if (!ngoName.trim()) {
            setWarn(true);
            return;
        }
        setWarn(false);
        setError("");
        const res = await fetch("/api/food", {
            method: "PATCH",
            body: JSON.stringify({
                id,
                ngoName: ngoName.trim(),
                ngoLat: loc?.lat ?? "",
                ngoLng: loc?.lng ?? "",
                demoKm: demoKm ?? "",
            }),
        });
        if (!res.ok) {
            const d = await res.json().catch(() => ({}));
            setError(d.error || "Could not claim this food.");
        }
        load();
    }

    const isExpired = (f: Food) => f.cookedAt + WINDOW <= now;
    const isSafe = (f: Food) => f.safety?.status === "verified";

    const claimedList = foods.filter((f) => f.claimed);
    const expired = foods.filter((f) => !f.claimed && isExpired(f));
    const live = foods.filter((f) => !f.claimed && !isExpired(f));
    const open = live.filter(isSafe);
    const blocked = live.filter((f) => !isSafe(f));

    const saved = claimedList.reduce((s, f) => s + f.meals, 0);
    const openMeals = open.reduce((s, f) => s + f.meals, 0);
    const wasted = expired.reduce((s, f) => s + f.meals, 0);

    const stats = [
        { icon: "📋", label: "Total posted", value: foods.length, cls: "text-orange-950" },
        { icon: "🟢", label: "Available", value: open.length, cls: "text-green-700" },
        { icon: "🤝", label: "Claimed", value: claimedList.length, cls: "text-blue-700" },
        { icon: "🚫", label: "Blocked", value: blocked.length, cls: "text-red-600" },
        { icon: "⛔", label: "Expired", value: expired.length, cls: "text-gray-600" },
    ];

    const modeBtn = (active: boolean) =>
        `rounded-full px-4 py-2 text-sm font-bold transition ${active ? "bg-orange-500 text-white shadow" : "border border-orange-300 bg-white text-orange-700 hover:bg-orange-50"
        }`;

    return (
        <div className="text-orange-950">
            <header className="border-b border-orange-200 bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-100">🍲 LastCall · NGO</p>
                        <h1 className="text-3xl font-extrabold">Claim food before it&apos;s unsafe</h1>
                        <p className="mt-1 text-orange-50">Only safety-verified food within {MAX_KM} km can be claimed.</p>
                    </div>
                    <a
                        href="/kitchen"
                        className="rounded-full bg-white px-6 py-3 font-bold text-orange-600 shadow-md transition hover:scale-105"
                    >
                        ← Kitchen view
                    </a>
                </div>
            </header>

            <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
                {/* Impact cards */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-[2rem] bg-gradient-to-br from-orange-500 to-red-500 p-6 text-white shadow-lg shadow-orange-200">
                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-100">💚 Impact</p>
                        <p className="text-6xl font-extrabold">{saved}</p>
                        <p className="font-semibold">meals saved</p>
                    </div>
                    <div className="rounded-[2rem] border border-orange-200 bg-white p-6 shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-500">🍽️ Available now</p>
                        <p className="text-6xl font-extrabold">{openMeals}</p>
                        <p className="font-semibold text-orange-800">safe meals waiting for pickup</p>
                    </div>
                    <div className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">🗑️ Wasted</p>
                        <p className="text-6xl font-extrabold text-gray-600">{wasted}</p>
                        <p className="font-semibold text-gray-500">meals expired unclaimed</p>
                    </div>
                </div>

                {/* Stats bar */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                    {stats.map((s) => (
                        <div key={s.label} className="rounded-2xl border border-orange-200 bg-white p-4 text-center shadow-sm">
                            <p className="text-2xl">{s.icon}</p>
                            <p className={`text-3xl font-extrabold ${s.cls}`}>{s.value}</p>
                            <p className="text-sm font-semibold text-orange-800">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* NGO name + location */}
                <div className="space-y-5 rounded-[2rem] border border-orange-200 bg-white p-6 shadow-sm">
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-orange-900">🏠 Your NGO name</label>
                        <input
                            className="w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-orange-950 placeholder-orange-400 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
                            placeholder="e.g. Helping Hands"
                            value={ngoName}
                            onChange={(e) => {
                                setNgoName(e.target.value);
                                setWarn(false);
                            }}
                        />
                        {warn && (
                            <p className="mt-2 text-sm font-semibold text-red-600">Please enter your NGO name before claiming.</p>
                        )}
                        {error && <p className="mt-2 text-sm font-semibold text-red-600">🚫 {error}</p>}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-orange-900">
                            📍 Your location (pickup limit {MAX_KM} km)
                        </label>
                        <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={getLocation} className={modeBtn(mode === "gps")}>
                                📍 Use my location
                            </button>
                            <button type="button" onClick={() => setMode("near")} className={modeBtn(mode === "near")}>
                                Demo: 3 km (nearby)
                            </button>
                            <button type="button" onClick={() => setMode("far")} className={modeBtn(mode === "far")}>
                                Demo: 25 km (too far)
                            </button>
                        </div>
                        {mode === "gps" && loc && (
                            <p className="mt-2 text-sm font-semibold text-green-700">
                                ✅ Location saved ({loc.lat.toFixed(4)}, {loc.lng.toFixed(4)})
                            </p>
                        )}
                        {mode === "gps" && !loc && !locMsg && (
                            <p className="mt-2 text-sm font-semibold text-yellow-700">
                                ⚠️ Location not set: you cannot claim until it is.
                            </p>
                        )}
                        {mode !== "gps" && (
                            <p className="mt-2 text-sm font-semibold text-orange-700">🧪 Demo mode: distance is set to {demoKm} km.</p>
                        )}
                        {locMsg && <p className="mt-2 text-sm font-semibold text-red-600">{locMsg}</p>}
                    </div>
                </div>

                {/* Available */}
                <section>
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-500">Live board</p>
                    <h2 className="mb-4 text-3xl font-extrabold">Available food</h2>

                    {open.length === 0 ? (
                        <div className="rounded-3xl border-2 border-dashed border-orange-300 bg-white/60 p-10 text-center">
                            <div className="text-5xl">🍽️</div>
                            <p className="mt-2 text-lg font-bold">No safe food available right now.</p>
                            <p className="text-orange-800">New verified posts from kitchens will appear here instantly.</p>
                        </div>
                    ) : (
                        <div className="grid gap-5 md:grid-cols-2">
                            {open.map((f) => {
                                const left = Math.floor((f.cookedAt + WINDOW - now) / 1000);
                                const pct = Math.max(0, Math.min(100, (left / (WINDOW / 1000)) * 100));
                                const tone =
                                    left > 3600
                                        ? ["text-green-700", "bg-green-600"]
                                        : left > 1200
                                            ? ["text-orange-600", "bg-orange-500"]
                                            : ["text-red-600", "bg-red-500"];
                                const km = distanceFor(f);
                                const tooFar = km !== null && km > MAX_KM;
                                const unknown = km === null;
                                const canClaim = !tooFar && !unknown;
                                return (
                                    <div
                                        key={f.id}
                                        className="space-y-4 rounded-[2rem] border border-orange-200 bg-white p-6 shadow-md shadow-orange-100 transition hover:-translate-y-1"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-xl font-extrabold">🍛 {f.name}</p>
                                                <p className="text-sm text-orange-800">📍 {f.address}</p>
                                                <a
                                                    href={mapsLink(f)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-1 inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700 transition hover:bg-orange-200"
                                                >
                                                    🗺️ Open in Google Maps
                                                </a>
                                                <p className="mt-2 text-sm font-semibold">
                                                    🌡️ {f.temperature}°C{" "}
                                                    <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${SAFETY_BADGE.verified.cls}`}>
                                                        {SAFETY_BADGE.verified.label}
                                                    </span>
                                                </p>
                                                <p className="mt-1 text-sm font-semibold">
                                                    📏{" "}
                                                    {unknown ? (
                                                        <span className="text-yellow-700">Distance unknown (location missing)</span>
                                                    ) : tooFar ? (
                                                        <span className="text-red-600">{km!.toFixed(1)} km away · too far</span>
                                                    ) : (
                                                        <span className="text-green-700">{km!.toFixed(1)} km away · in range</span>
                                                    )}
                                                </p>
                                            </div>
                                            <span className="whitespace-nowrap rounded-full bg-orange-100 px-4 py-1 text-sm font-bold text-orange-700">
                                                {f.meals} meals
                                            </span>
                                        </div>
                                        <div>
                                            <p className={`font-mono text-2xl font-bold ${tone[0]}`}>
                                                ⏱ {Math.floor(left / 60)}m {String(left % 60).padStart(2, "0")}s left
                                            </p>
                                            <div className="mt-2 h-3 overflow-hidden rounded-full bg-orange-100">
                                                <div className={`h-full rounded-full transition-all ${tone[1]}`} style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => claim(f.id)}
                                            disabled={!canClaim}
                                            className={
                                                canClaim
                                                    ? "w-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 py-3 text-lg font-bold text-white shadow-lg shadow-orange-200 transition hover:scale-[1.02] active:scale-95"
                                                    : "w-full cursor-not-allowed rounded-full bg-gray-300 py-3 text-lg font-bold text-gray-500"
                                            }
                                        >
                                            {canClaim ? "Claim this food 🤝" : tooFar ? "Too far 🚫" : "Set your location 📍"}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Blocked */}
                {blocked.length > 0 && (
                    <section>
                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">Safety check not passed</p>
                        <h2 className="mb-4 text-3xl font-extrabold text-red-600">Blocked food</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            {blocked.map((f) => {
                                const sb = SAFETY_BADGE[f.safety?.status ?? "missing"];
                                return (
                                    <div key={f.id} className="space-y-3 rounded-3xl border-2 border-red-200 bg-red-50 p-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-lg font-bold">🍛 {f.name}</p>
                                                <p className="text-sm text-orange-800">
                                                    {f.meals} meals · {f.address}
                                                </p>
                                                <p className="mt-1 text-sm font-semibold">
                                                    🌡️ {f.temperature !== null && f.temperature !== undefined ? `${f.temperature}°C` : "No valid reading"}
                                                </p>
                                            </div>
                                            <span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${sb.cls}`}>
                                                {sb.label}
                                            </span>
                                        </div>
                                        <p className="text-sm font-semibold text-red-700">🚫 {f.safety?.message}</p>
                                        <button
                                            disabled
                                            className="w-full cursor-not-allowed rounded-full bg-gray-300 py-3 font-bold text-gray-500"
                                        >
                                            Claim blocked 🚫
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Expired */}
                {expired.length > 0 && (
                    <section>
                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">Not safe anymore</p>
                        <h2 className="mb-4 text-3xl font-extrabold text-gray-600">Expired food</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            {expired.map((f) => (
                                <div
                                    key={f.id}
                                    className="flex items-center justify-between rounded-3xl border border-gray-200 bg-gray-100 p-5 opacity-80"
                                >
                                    <div>
                                        <p className="text-lg font-bold text-gray-600">🍛 {f.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {f.meals} meals · {f.address}
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-gray-300 px-4 py-1 text-sm font-semibold text-gray-700">
                                        Expired
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}