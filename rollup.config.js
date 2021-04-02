import babel from '@rollup/plugin-babel';
import external from 'rollup-plugin-peer-deps-external';
import del from 'rollup-plugin-delete';
import pkg from './package.json';

import commonjs from "rollup-plugin-commonjs";
import postcss from "rollup-plugin-postcss";
// import ascii from "rollup-plugin-ascii";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

const peerDependencies = [
  "@ant-design/compatible",
  "@ant-design/icons",
  "antd",
  "brace",
  "form-render",
  "moox",
  "react",
  "react-dom",
  "react-redux",
  "redux",
  "lodash",
  "prop-types", 
  /^antd\/.+$/,
	/^form-render\/.+$/,
	/^@ant-design\/.+$/,
	/^brace\/.+$/
]

export default {
    input: pkg.source,
    output: [
      // { file: pkg.main, format: 'cjs' },
      // { file: pkg.module, format: 'esm' },
      { file: pkg.common, format: 'umd', name: 'SchemaForm' }
    ],
  plugins: [
    resolve(),
        external(),
        babel({
          exclude: 'node_modules/**'
        }),
        commonjs({
          include: 'node_modules/**',
          namedExports: {
            'node_modules/react-is/index.js': ['isFragment', 'ForwardRef','isValidElementType','isMemo']
          }
        }),
        // ascii(),
        postcss({
          // Extract CSS to the same location where JS file is generated but with .css extension.
          extract: true,
          // Use named exports alongside default export.
          namedExports: true,
          // Minimize CSS, boolean or options for cssnano.
          minimize: true,
          // Enable sourceMap.
          sourceMap: false,
          // This plugin will process files ending with these extensions and the extensions supported by custom loaders.
          extensions: [".less", ".css"],
          use : [
            'sass', 
            ['less', { javascriptEnabled: true }]
          ],
        }),
        terser(),
        del({ targets: ['dist/*'] }),
    ],
    external: peerDependencies,
};