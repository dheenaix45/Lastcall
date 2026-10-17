import { NextResponse } from "next/server";

type Food = { id: string; name: string; meals: number; address: string; cookedAt: number; claimed: boolean };
const g = globalThis as unknown as { foods?: Food[] };
const foods = (g.foods ??= []);

export async function GET() {
    return NextResponse.json(foods);
}

export async function POST(req: Request) {
    const b = await req.json();
    const item: Food = {
        id: crypto.randomUUID(),
        name: b.name,
        meals: Number(b.meals),
        address: b.address,
        cookedAt: Date.now() - Number(b.minsAgo || 0) * 60000,
        claimed: false,
    };
    foods.push(item);
    return NextResponse.json(item);
}

export async function PATCH(req: Request) {
    const { id } = await req.json();
    const f = foods.find((x) => x.id === id);
    if (f) f.claimed = true;
    return NextResponse.json({ ok: true });
}