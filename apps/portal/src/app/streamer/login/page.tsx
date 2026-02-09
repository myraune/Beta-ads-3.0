"use client";

import { useRouter } from "next/navigation";
import { StreamerLoginScreen } from "@/components/streamer-login-screen";

export default function StreamerLoginPage() {
  const router = useRouter();

  return <StreamerLoginScreen onConnected={() => router.push("/streamer")} />;
}
