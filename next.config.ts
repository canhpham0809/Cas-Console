import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS === "true";
const repoName = "Cas-Console";
const basePath = process.env.BASE_PATH ?? (isGithubActions ? `/${repoName}` : "");

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath,
  env: {
    // Exposed to client code so plain <img>/asset references under public/ can be
    // prefixed correctly when the site is served from a sub-path (e.g. GitHub Pages).
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
