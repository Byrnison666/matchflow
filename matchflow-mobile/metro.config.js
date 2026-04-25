const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')
const path = require('path')

const config = getDefaultConfig(__dirname)

// Fix for @react-navigation/native subpath imports on Windows
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@react-navigation/native/src/useBackButton': path.resolve(__dirname, 'node_modules/@react-navigation/native/lib/module/useBackButton.js'),
  '@react-navigation/native/src/useDocumentTitle': path.resolve(__dirname, 'node_modules/@react-navigation/native/lib/module/useDocumentTitle.js'),
  '@react-navigation/native/src/useThenable': path.resolve(__dirname, 'node_modules/@react-navigation/native/lib/module/useThenable.js'),
}

module.exports = withNativeWind(config, { input: './global.css' })
