export function StreamerClips() {
  return (
    <main className="space-y-4">
      <section className="streamer-card rounded-2xl p-5">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--streamer-muted)]">My clips</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Clip submission</h2>
        <p className="mt-2 text-sm text-slate-300">
          Submit approved clips to improve visibility scores and unlock additional sponsorship opportunities.
        </p>
      </section>

      <section className="streamer-card rounded-2xl p-5 text-center">
        <div className="mx-auto max-w-lg rounded-xl border border-white/15 bg-black/25 p-8">
          <p className="text-lg font-semibold text-white">No clips uploaded yet</p>
          <p className="mt-2 text-sm text-slate-300">Upload your best campaign moments once clips are available in your connected platform.</p>
          <button type="button" className="streamer-primary-btn mt-4 rounded-lg px-4 py-2 text-sm font-semibold text-white transition" disabled>
            Upload clip (coming soon)
          </button>
        </div>
      </section>
    </main>
  );
}
