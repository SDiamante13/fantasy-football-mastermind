const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './index.web.js',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules\/(?!(react-native|@react-native|@react-navigation|react-native-screens|react-native-safe-area-context|react-native-web))/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { modules: false }],
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
            plugins: [
              ['@babel/plugin-proposal-class-properties', { loose: true }],
              ['@babel/plugin-transform-private-methods', { loose: true }],
              ['@babel/plugin-transform-private-property-in-object', { loose: true }],
            ],
          },
        },
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    alias: {
      'react-native$': 'react-native-web',
      'react-native/Libraries/Text/TextInput': 'react-native-web/dist/exports/TextInput',
      'react-native/Libraries/Components/View/View': 'react-native-web/dist/exports/View',
      'react-native/Libraries/Text/Text': 'react-native-web/dist/exports/Text',
      'react-native/Libraries/Components/ScrollView/ScrollView': 'react-native-web/dist/exports/ScrollView',
      'react-native/Libraries/Lists/FlatList': 'react-native-web/dist/exports/FlatList',
      'react-native/Libraries/Components/TouchableOpacity/TouchableOpacity': 'react-native-web/dist/exports/TouchableOpacity',
      'react-native/Libraries/StyleSheet/StyleSheet': 'react-native-web/dist/exports/StyleSheet',
      'react-native/Libraries/Animated/Animated': 'react-native-web/dist/exports/Animated',
      'react-native/Libraries/Components/SafeAreaView/SafeAreaView': 'react-native-web/dist/exports/SafeAreaView',
      'react-native-safe-area-context': 'react-native-safe-area-context/lib/module',
    },
    extensions: ['.web.js', '.web.ts', '.web.tsx', '.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      inject: true,
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 8080,
    open: true,
    hot: true,
    historyApiFallback: true,
  },
  devtool: 'source-map',
};