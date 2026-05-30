import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactCompiler: true,

  images: {
    domains: ["flagcdn.com"],
  },
}

export default nextConfig