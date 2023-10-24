const path = require('path');

function createFileName(fileName, targetName, webPackMode) {
  return (webPackMode === 'development')
    && `${ fileName }.dev.${ targetName }.umd.js`
    || `${ fileName }.prod.[contenthash].${ targetName }.umd.js`
}
function augmentLibraryConfig(targetName, config) {
  return (targetName === 'web')
    && { ...config, export: 'default' }
    || config;
}

function createTargetSpecificConfig(libraryName, fileName, targetName, webPackMode) {
  return {
    optimization: {
      nodeEnv: webPackMode,
      usedExports: true,
    },
    mode: webPackMode,
    target: targetName,
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: createFileName(fileName, targetName, webPackMode),
      library: augmentLibraryConfig(targetName, {
        name: libraryName,
        type: 'umd',
      }),
    },
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {/*
              presets: [
                ['@babel/preset-env', { targets: "defaults" } ],
              ], */
              "presets": [
                [
                  "@babel/preset-env",
                  {
                    "targets": {
                      "node": "current",
                    },
                  },
                ],
              ],
            },
          },
          "sideEffects": false,
        },
      ],
    },
  };
}

module.exports = (env, webPackArgs) => [
  createTargetSpecificConfig('s2m', 'signaling-state', 'web', webPackArgs.mode),
  createTargetSpecificConfig('s2m', 'signaling-state', 'node', webPackArgs.mode),
];
