import { babel } from '@rollup/plugin-babel';
import dts from 'rollup-plugin-dts';
const pkg = require('./package.json');
const config = [
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.cjs.js',
        format: 'cjs',
        sourcemap: true
    },
    external: Object.keys(pkg.dependencies),
    plugins: [babel({
      babelHelpers: 'bundled'
    })]
},
{
  input: 'src/index.js',
  output: {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true
  },
  external: Object.keys(pkg.dependencies),
  plugins: [babel({
    babelHelpers: 'bundled'
  })]
},
{
  input: 'src/index.d.ts',
  output: [{ file: 'dist/index.d.ts', format: 'es' }],
  plugins: [dts({
    compilerOptions: {
      removeComments: true
    }
  })],
},
];

export default config;
