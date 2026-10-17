export default function About() {
    return (
        <main className="mx-auto max-w-3xl px-6 py-16">
            <div className="text-center">
                <div className="float inline-block text-6xl">🍲</div>
                <h1 className="mt-4 text-4xl font-extrabold text-orange-950">About Us</h1>
                <p className="mt-2 text-xl font-bold text-orange-500">Team Noob Compilers</p>
            </div>

            <p className="mt-8 text-lg text-orange-900">
                We are Team <span className="font-bold">Noob Compilers</span>. We built LastCall in 12 hours at
                TechByte '26 to connect kitchens with NGOs before good food goes to waste.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
                    <h3 className="font-bold text-orange-950">🎯 Our Mission</h3>
                    <p className="mt-2 text-orange-800">
                        Rescue hot leftover food within its 2-hour safe window and get it to people who need it.
                    </p>
                </div>
                <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
                    <h3 className="font-bold text-orange-950">🌍 SDGs We Support</h3>
                    <p className="mt-2 text-orange-800">
                        SDG 2 (Zero Hunger) and SDG 12 (Responsible Consumption and Production).
                    </p>
                </div>
            </div>

            <div className="mt-8 rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
                <h3 className="font-bold text-orange-950">👥 Team Members</h3>
                <ul className="mt-2 space-y-1 text-orange-800">
                    <li>• Member 1 name</li>
                    <li>• Member 2 name</li>
                    <li>• Member 3 name</li>
                </ul>
            </div>
        </main>
    );
}