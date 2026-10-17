import { NextResponse } from "next/server";

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
  claimedAt?: number;
  distanceKm?: number;
};

const WINDOW = 120 * 60000; // 2-hour safe window
const MIN_HOT_TEMP = 60; // °C
const MAX_KM = 15; // pickup radius

function num(x: unknown): number | null {
  if (x === undefined || x === null || String(x).trim() === "") return null;
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

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

function checkSafety(raw: unknown): { temperature: number | null; safety: Safety } {
  if (raw === undefined || raw === null || String(raw).trim() === "") {
    return { temperature: null, safety: { status: "missing", message: "No temperature recorded" } };
  }
  const t = Number(raw);
  if (!Number.isFinite(t) || t < 0 || t > 150) {
    return { temperature: null, safety: { status: "invalid", message: "Temperature is not a valid reading" } };
  }
  if (t < MIN_HOT_TEMP) {
    return { temperature: t, safety: { status: "failed", message: `Below the safe limit of ${MIN_HOT_TEMP}°C` } };
  }
  return { temperature: t, safety: { status: "verified", message: "Temperature is in the safe range" } };
}

const g = globalThis as unknown as { __foods?: Food[] };
if (!g.__foods) g.__foods = [];
const foods = () => g.__foods as Food[];

export async function GET() {
  return NextResponse.json(foods());
}

export async function POST(req: Request) {
  const b = await req.json();
  const meals = Number(b.meals ?? b.quantity) || 1;

  let cookedAt = Date.now();
  if (b.cookedAt !== undefined && b.cookedAt !== "") {
    const t = typeof b.cookedAt === "number" ? b.cookedAt : new Date(b.cookedAt).getTime();
    if (!Number.isNaN(t)) cookedAt = t;
  } else if (b.minsAgo !== undefined) {
    cookedAt = Date.now() - Number(b.minsAgo) * 60000;
  }

  const { temperature, safety } = checkSafety(b.temperature);

  let lat = num(b.lat);
  let lng = num(b.lng);
  if (lat === null || lng === null || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    lat = null;
    lng = null;
  }

  const food: Food = {
    id: crypto.randomUUID(),
    name: String(b.name || "Food"),
    meals,
    address: String(b.address || ""),
    cookedAt,
    temperature,
    safety,
    lat,
    lng,
    claimed: false,
  };
  foods().push(food);
  return NextResponse.json(food);
}

export async function PATCH(req: Request) {
  const b = await req.json();
  const food = foods().find((f) => f.id === b.id);
  if (!food) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (food.claimed) return NextResponse.json({ error: "Already claimed" }, { status: 409 });
  if (food.cookedAt + WINDOW <= Date.now())
    return NextResponse.json({ error: "Expired" }, { status: 410 });

  // Safety gate
  if (food.safety.status !== "verified")
    return NextResponse.json({ error: `Blocked: ${food.safety.message}` }, { status: 403 });

  // Distance gate
  let km: number | null = num(b.demoKm); // demo override
  if (km === null) {
    const nLat = num(b.ngoLat);
    const nLng = num(b.ngoLng);
    if (food.lat !== null && food.lng !== null && nLat !== null && nLng !== null) {
      km = haversineKm(food.lat, food.lng, nLat, nLng);
    }
  }
  if (km === null)
    return NextResponse.json(
      { error: "Blocked: location missing, distance cannot be checked" },
      { status: 403 }
    );
  if (km > MAX_KM)
    return NextResponse.json(
      { error: `Blocked: pickup is ${km.toFixed(1)} km away (limit ${MAX_KM} km)` },
      { status: 403 }
    );

  food.claimed = true;
  food.claimedBy = String(b.ngoName || "").trim() || "An NGO";
  food.claimedAt = Date.now();
  food.distanceKm = Math.round(km * 10) / 10;
  return NextResponse.json(food);
}