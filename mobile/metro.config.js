const { getDefaultConfig } = require("expo/metro-config");
const path = require("node:path");

// Keep the Expo project root anchored to mobile/ when started through the
// repository's npm workspace command.
const config = getDefaultConfig(__dirname);
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  "expo-secure-store": path.resolve(__dirname, "..", "node_modules", "expo-secure-store"),
};

// The Next.js workspaces use React 19.2, while Expo SDK 54 requires React
// 19.1 and React Native 0.81. Force those runtimes (and react-dom, used by the
// web target) to the mobile
// workspace, while preserving normal hierarchical resolution for nested Expo
// packages such as @expo/metro-runtime.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === "react" ||
    moduleName.startsWith("react/") ||
    moduleName === "react-dom" ||
    moduleName.startsWith("react-dom/") ||
    moduleName === "react-native" ||
    moduleName.startsWith("react-native/")
  ) {
    return context.resolveRequest(
      context,
      path.resolve(__dirname, "node_modules", moduleName),
      platform,
    );
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
