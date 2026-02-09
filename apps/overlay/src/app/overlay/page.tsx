import { OverlayClient } from "@/components/overlay-client";

export default function OverlayPage({
  searchParams
}: {
  searchParams: {
    key?: string;
  };
}) {
  const key = searchParams.key ?? "";

  return <OverlayClient overlayKey={key} />;
}
