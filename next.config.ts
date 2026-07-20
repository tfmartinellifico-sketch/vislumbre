import type { NextConfig } from "next";
import { SITE_DOMAIN } from "./src/lib/site";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "vislumbre-beta.vercel.app" }],
        destination: `https://${SITE_DOMAIN}/:path*`,
        permanent: true,
      },
      // www → apex: configure na Vercel (Domains), não aqui — redirect duplo causa loop.
    ];
  },
};

export default nextConfig;
