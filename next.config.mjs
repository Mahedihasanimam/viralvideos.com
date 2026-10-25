/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable disk pack caching in development to prevent ENOENT cache corruption
      config.cache = false
    }
    return config
  },
}

export default nextConfig
