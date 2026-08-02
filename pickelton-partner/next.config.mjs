// pickelton-app/apps/web/next.config.mjs
/** @type {import("next").NextConfig} */
const nextConfig = {
  transpilePackages: ["@pickelton/api", "@pickelton/types", "@pickelton/constants", "@pickelton/utils"],
};

export default nextConfig;
