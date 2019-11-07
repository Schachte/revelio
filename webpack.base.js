module.exports = {
  // Tell webpack to run babel on every file it runs through
  // Runs bunch of es6+ code and converts to es5
  module: {
    rules: [
      {
        test: /\.js?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: [
            '@babel/preset-react',
            [
              '@babel/preset-env',
              { targets: { browsers: ['last 2 versions'] } },
            ],
          ],
        },
      },
    ],
  },
}
