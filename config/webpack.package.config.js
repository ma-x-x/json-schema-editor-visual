const paths = require('./paths');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  entry: paths.appPackageJs,
  mode: "production",
  output: {
    publicPath: "/dist/",
    libraryTarget: "umd",
    library: ['schema'],
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.less$/,
        use: ["style-loader", "css-loader", {
          loader: 'less-loader',
          options: {
            javascriptEnabled: true,
          },
        }]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new BundleAnalyzerPlugin(
    {
      analyzerMode: 'server',
      analyzerHost: '127.0.0.1',
      analyzerPort: 8889,
      reportFilename: 'report.html',
      defaultSizes: 'parsed',
      openAnalyzer: true,
      generateStatsFile: false,
      statsFilename: 'stats.json',
      statsOptions: null,
      logLevel: 'info'
    }
    ),
  ],
  externals: [
    { react: { commonjs: "react", commonjs2: "react", amd: 'react', root: ['React'] } },
    { "react-redux": { commonjs: "react-redux", commonjs2: "react-redux", amd: "react-redux" } },
    { lodash: { commonjs: "lodash", commonjs2: "lodash", amd: 'lodash', root: ['_'] } },
    { brace: { commonjs: "brace", commonjs2: "brace", amd: 'brace', root: ['ace'] } },
    { moox: { commonjs: "moox", commonjs2: "moox", amd: 'moox' } },
    { "react-dom": { commonjs: "react-dom", commonjs2: "react-dom", amd: 'react-dom', root: ['ReactDom'] } },
    { redux: { commonjs: "redux", commonjs2: "redux", amd: 'redux' } },
    { "prop-types": { commonjs: "prop-types", commonjs2: "prop-types", amd: 'prop-types' } },
    { "moment": { commonjs: "moment", commonjs2: "moment", amd: 'moment' } },
    { antd: { commonjs: "antd", commonjs2: "antd", amd: 'antd' } },
    { "form-render": { commonjs: "form-render", commonjs2: "form-render", amd: 'form-render', root: ['FormRender'] } },
    // 匹配以 "library/" 开始的所有依赖
    /^antd\/.+$/,
	/^form-render\/.+$/,
	/^@ant-design\/.+$/,
	/^brace\/.+$/
  ]
};
