/** @type {import('next').NextConfig} */
const isGhPages = process.env.GITHUB_PAGES === 'true';
const basePath = isGhPages ? '/Learninx' : '';

const nextConfig = {
  // GitHub Pages: `actions/configure-pages` will auto-inject
  // `output: "export"` and `basePath: "/Learninx"` (derived from the
  // repo name) on the runner. The Docker build still uses
  // `output: "standalone"` because that env var is only set by the
  // Pages workflow. The env-driven branch below is a defensive fallback
  // for local testing of the static export.
  output: isGhPages ? 'export' : 'standalone',
  basePath: isGhPages ? basePath : undefined,
  images: isGhPages ? { unoptimized: true } : undefined,
  // Expose the basePath to client code so `<video src>` and other raw
  // string URLs (which Next does NOT rewrite) can be assembled correctly.
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  reactStrictMode: true,
};

module.exports = nextConfig;