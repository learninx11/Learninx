/** @type {import('next').NextConfig} */
const nextConfig = {
  // GitHub Pages: `actions/configure-pages` will auto-inject
  // `output: "export"` and `basePath: "/Learninx"` (derived from the
  // repo name) on the runner. The Docker build still uses
  // `output: "standalone"` because that env var is only set by the
  // Pages workflow. The env-driven branch below is a defensive fallback
  // for local testing of the static export.
  output: process.env.GITHUB_PAGES === 'true' ? 'export' : 'standalone',
  basePath: process.env.GITHUB_PAGES === 'true' ? '/Learninx' : undefined,
  images: process.env.GITHUB_PAGES === 'true' ? { unoptimized: true } : undefined,
  reactStrictMode: true,
};

module.exports = nextConfig;