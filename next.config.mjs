/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    scrollRestoration: false,
  },
  images: {
    unoptimized: true,
    domains: ["v0.blob.com", "vercel-blob.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // headers: () => [
  //   {
  //     source: "/",
  //     headers: [
  //       {
  //         key: "Cache-Control",
  //         value: "no-cache, no-store, must-revalidate",
  //       },
  //       {
  //         key: "Pragma",
  //         value: "no-cache",
  //       },
  //       {
  //         key: "Expirex",
  //         value: "0",
  //       },
  //     ],
  //   },
  // ],
  // Füge eine Ausgabe für Debugging-Zwecke hinzu
  onDemandEntries: {
    // Periode (in ms), in der das Serverladen von Seiten überprüft wird
    maxInactiveAge: 60 * 60 * 1000,
    // Anzahl der Seiten, die im Speicher gehalten werden
    pagesBufferLength: 5,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push("@azure/msal-node");
    }
    return config;
  },
};

export default nextConfig;
