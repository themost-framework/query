import { babel } from '@rollup/plugin-babel';
import dts from 'rollup-plugin-dts';

const config = [{
  input: 'src/index.js',
  output: [
    { file: 'dist/index.cjs.js', format: 'cjs' },
    { file: 'dist/index.esm.js', format: 'esm' }
  ],
  plugins: [babel({
    sourceMaps: true
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
