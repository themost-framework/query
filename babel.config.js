module.exports = {
    sourceMaps: 'both',
    retainLines: true,
    presets: [
        [
            '@babel/preset-env',
            {
                targets: {
                    node: 'current'
                }
            }
        ]
    ],
    plugins: [
    ]
};
