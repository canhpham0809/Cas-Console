import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS === "true";
const repoName = "Cas-Console";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.BASE_PATH ?? (isGithubActions ? `/${repoName}` : ""),
  assetPrefix: process.env.BASE_PATH ?? (isGithubActions ? `/${repoName}` : ""),
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
