/** @type {import('next').NextConfig} */
const nextConfig = {
  // Handle webpack configuration for Leaflet
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't attempt to load Leaflet on the server side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  }
}

module.exports = nextConfig
