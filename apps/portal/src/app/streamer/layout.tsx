import { StreamerShellNav } from "@/components/streamer-shell-nav";

export default function StreamerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="streamer-shell-surface min-h-screen">
      <StreamerShellNav />
      <div className="mx-auto max-w-[1700px] px-4 py-5">{children}</div>
    </div>
  );
}
