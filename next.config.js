/** @type {import('next').NextConfig} */

const isGhPages = process.env.GITHUB_PAGES === 'true';

const nextConfig = {
  output: isGhPages ? 'export' : 'standalone',

  // Custom domain: https://learninx.site
  basePath: '',

  images: isGhPages
    ? {
        unoptimized: true,
      }
    : undefined,

  env: {
    NEXT_PUBLIC_BASE_PATH: '',
  },

  reactStrictMode: true,
};

module.exports = nextConfig;
