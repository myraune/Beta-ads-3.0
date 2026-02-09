import Link from "next/link";

export default function OverlayHomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
        <h1 className="text-xl font-semibold">Beta Overlay App</h1>
        <p className="mt-2 text-sm text-slate-300">Use this app through the overlay route with a key parameter.</p>
        <Link href="/overlay?key=demo" className="mt-4 inline-block text-sm text-cyan-300 underline">
          Open demo route
        </Link>
      </div>
    </main>
  );
}
