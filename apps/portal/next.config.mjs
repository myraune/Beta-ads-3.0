/** @type {import('next').NextConfig} */
const isGithubPages = process.env.NEXT_PUBLIC_GITHUB_PAGES === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    unoptimized: true
  },
  ...(isGithubPages
    ? {
        output: "export",
        basePath,
        assetPrefix: basePath ? `${basePath}/` : undefined,
        trailingSlash: true
      }
    : {})
};

export default nextConfig;
