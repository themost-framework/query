/*eslint-env es6 */
const { babel } = require('@rollup/plugin-babel');
const commonjs = require('@rollup/plugin-commonjs');
const pkg = require('./package.json');
const dts = require('rollup-plugin-dts').default;

module.exports = [
    {
        input: 'closures/src/index.js',
        output: {
            dir: 'closures/dist',
            format: 'cjs',
            sourcemap: true
        },
        external: Object.keys(pkg.dependencies).concat(Object.keys(pkg.peerDependencies)).concat(
            [ '@themost/query' ]
        ),
        plugins: [
            commonjs(),
            babel({ babelHelpers: 'bundled' })
        ]
    },
    {
        input: 'closures/src/index.js',
        output: {
            file: 'closures/dist/index.esm.js',
            format: 'esm',
            sourcemap: true
        },
        external: Object.keys(pkg.dependencies).concat(Object.keys(pkg.peerDependencies)).concat(
            [ '@themost/query' ]
        ),
        plugins: [babel({ babelHelpers: 'bundled' })]
    },
    {
        input: 'closures/src/index.d.ts',
        output: [
            {
                file: 'closures/dist/index.d.ts'
            }
        ],
        external: Object.keys(pkg.dependencies).concat(Object.keys(pkg.peerDependencies)).concat(
            [ '@themost/query' ]
        ),
        plugins: [dts()],
    }
];
