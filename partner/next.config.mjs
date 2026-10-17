// partner/next.config.mjs
/** @type {import("next").NextConfig} */
const nextConfig = {
  transpilePackages: ["@pickelton/api", "@pickelton/types", "@pickelton/utils"],
};

export default nextConfig;
