import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import polyfillNode from 'rollup-plugin-polyfill-node';
import path from 'path';

export default [
  {
    input: 'src/index.tsx',
    external: ['react', 'react-dom', 'three'],
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'dist/index.esm.js',
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      alias({
        entries: [
          {
            find: 'three/examples/jsm',
            replacement: path.resolve(
              'node_modules/three/examples/jsm'
            ),
          },
        ],
      }),
      resolve(),
      typescript({ tsconfig: './tsconfig.json' }),
      nodeResolve({ preferBuiltins: false }),
      commonjs(),
      json(),
      terser(),
      polyfillNode(),
    ],
  },
  {
    input: 'src/index.tsx',
    external: ['react', 'react-dom', 'three'],
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declarationDir: './dist'
      }),
       terser() // minifies generated bundles
    ],
  },
];
