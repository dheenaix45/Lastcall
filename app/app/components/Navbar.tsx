"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
    { href: "/", label: "Home" },
    { href: "/kitchen", label: "Kitchen" },
    { href: "/ngo", label: "NGO" },
    { href: "/why-idea", label: "Why this idea" },
    { href: "/why-lastcall", label: "Why LastCall" },
];

export default function Navbar() {
    const path = usePathname();
    const [open, setOpen] = useState(false);

    const item = (active: boolean) =>
        `px-3 py-2 rounded-lg text-sm font-medium transition ${active ? "bg-orange-500 text-white" : "text-orange-950 hover:bg-orange-100"
        }`;

    return (
        <nav className="sticky top-0 z-40 border-b border-orange-200 bg-[#fff8ee]/90 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
                <Link href="/" className="text-xl font-extrabold text-orange-600">
                    🍲 LastCall
                </Link>

                <button className="md:hidden text-2xl" onClick={() => setOpen(!open)}>
                    {open ? "✕" : "☰"}
                </button>

                <div className="hidden items-center gap-1 md:flex">
                    {links.map((l) => (
                        <Link key={l.href} href={l.href} className={item(path === l.href)}>
                            {l.label}
                        </Link>
                    ))}
                    {/* About Us stays last */}
                    <Link href="/about" className={item(path === "/about") + " ml-4 border border-orange-300"}>
                        About Us
                    </Link>
                </div>
            </div>

            {open && (
                <div className="flex flex-col gap-1 px-6 pb-4 md:hidden">
                    {[...links, { href: "/about", label: "About Us" }].map((l) => (
                        <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className={item(path === l.href)}>
                            {l.label}
                        </Link>
                    ))}
                </div>
            )}
        </nav>
    );
}