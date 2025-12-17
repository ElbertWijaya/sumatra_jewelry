module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Use Worklets plugin (replaces Reanimated plugin on RN 0.81)
      'react-native-worklets/plugin',
    ],
  };
};