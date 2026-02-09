"use client";

import { withBasePath } from "@/lib/with-base-path";

type BrandLogoKind = "horizontal" | "mark";
type BrandLogoSurface = "dark" | "light";
type BrandLogoSize = "sm" | "md" | "lg";

const SOURCE_MAP: Record<BrandLogoKind, Record<BrandLogoSurface, string>> = {
  horizontal: {
    dark: "/brand/h-logo-light.svg",
    light: "/brand/h-logo-dark.svg"
  },
  mark: {
    dark: "/brand/brandmark-light.svg",
    light: "/brand/brandmark-dark.svg"
  }
};

const DIMENSIONS: Record<BrandLogoKind, Record<BrandLogoSize, { width: number; height: number }>> = {
  horizontal: {
    sm: { width: 132, height: 32 },
    md: { width: 168, height: 40 },
    lg: { width: 212, height: 50 }
  },
  mark: {
    sm: { width: 24, height: 24 },
    md: { width: 32, height: 32 },
    lg: { width: 40, height: 40 }
  }
};

export interface BrandLogoProps {
  kind: BrandLogoKind;
  surface: BrandLogoSurface;
  size?: BrandLogoSize;
  className?: string;
  dataTestId?: string;
}

export function BrandLogo(props: BrandLogoProps) {
  const size = props.size ?? "md";
  const src = withBasePath(SOURCE_MAP[props.kind][props.surface]);
  const fallbackSrc = withBasePath(
    props.kind === "horizontal" ? "/brand/h-logo-light.svg" : "/brand/brandmark-light.svg"
  );
  const dimensions = DIMENSIONS[props.kind][size];
  const alt = props.kind === "horizontal" ? "Beta Ads logo" : "Beta Ads mark";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={dimensions.width}
      height={dimensions.height}
      className={props.className}
      decoding="async"
      loading="eager"
      data-testid={props.dataTestId}
      onError={(event) => {
        const element = event.currentTarget;
        if (element.src.endsWith(fallbackSrc)) {
          return;
        }
        element.src = fallbackSrc;
      }}
    />
  );
}
