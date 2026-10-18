module.exports = function (api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
    // npm keeps expo-router inside mobile/ because the Next.js workspaces use a
    // different React version. The hoisted Expo Babel preset therefore cannot
    // auto-detect it, so register the preset's router transform explicitly.
    plugins: [
      require("babel-preset-expo/build/expo-router-plugin")
        .expoRouterBabelPlugin,
    ],
  };
};
