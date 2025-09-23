module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Expo Router via preset; use worklets plugin (replaces reanimated plugin)
      'react-native-worklets/plugin',
    ],
  };
};