const { merge } = require('webpack-merge');
const configPackage = require('../config/webpack.package.config');

module.exports = merge(configPackage, {
    mode: 'production',
});