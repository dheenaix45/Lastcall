export default function WhyLastCall() {
    return (
        <main className="mx-auto max-w-3xl px-6 py-16">
            <h1 className="text-4xl font-extrabold text-orange-950">Why "LastCall"?</h1>
            <p className="mt-6 text-lg text-orange-900">
                Like the last call at a restaurant, this is the final chance for the food to be eaten. Every post comes with a 2-hour live
                countdown, and when the timer ends the food is no longer safe.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
                {[
                    ["🍳", "Kitchen posts", "Leftover food, quantity and cooked time."],
                    ["⏱️", "Timer runs", "Green, then red as the safe window closes."],
                    ["🤝", "NGO claims", "First to claim rescues the meals."],
                ].map(([e, t, d]) => (
                    <div key={t} className="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
                        <div className="text-3xl">{e}</div>
                        <h3 className="mt-2 font-bold text-orange-950">{t}</h3>
                        <p className="text-sm text-orange-800">{d}</p>
                    </div>
                ))}
            </div>
        </main>
    );
}