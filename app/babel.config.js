module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Expo Router plugin is included via babel-preset-expo in SDK 50+; no need to add here
      // Reanimated v4 moved its Babel plugin to react-native-worklets; keep this last
      'react-native-worklets/plugin',
    ],
  };
};