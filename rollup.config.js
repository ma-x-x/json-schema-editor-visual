import babel from '@rollup/plugin-babel';
import external from 'rollup-plugin-peer-deps-external';
import del from 'rollup-plugin-delete';
import pkg from './package.json';

import commonjs from "rollup-plugin-commonjs";
import postcss from "rollup-plugin-postcss";
import ascii from "rollup-plugin-ascii";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

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
        commonjs(),
        ascii(),
        postcss({
          // Extract CSS to the same location where JS file is generated but with .css extension.
          extract: true,
          // Use named exports alongside default export.
          namedExports: true,
          // Minimize CSS, boolean or options for cssnano.
          minimize: true,
          // Enable sourceMap.
          sourceMap: true,
          // This plugin will process files ending with these extensions and the extensions supported by custom loaders.
          extensions: [".less", ".css"],
        }),
        terser(),
        del({ targets: ['dist/*'] }),
    ],
    external: Object.keys(pkg.peerDependencies || {}),
};