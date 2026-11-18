import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['framer-motion'],
  images: {
    domains: [
      "127.0.0.1",
      "localhost",
      "nestbuddy-api.urchdev.com",
      "nkiri.com",
      "9jarocks.net",
      "i0.wp.com",
      "img.awafim.tv",
      "awafim.moviebuzz.com.ng",
      "source.unsplash.com",
      "api.unsplash.com",
      "images.unsplash.com",
    ],
  },
};

export default nextConfig;
