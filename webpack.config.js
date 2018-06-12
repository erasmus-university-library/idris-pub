/*** webpack.config.js ***/
const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");

const htmlWebpackPlugin = new HtmlWebpackPlugin({
    template: path.join(__dirname, "public/index.html"),
    filename: "./index.html"
});
module.exports = {
  entry: path.join(__dirname, "src/index.js"),
  output: {
    path: path.join(__dirname, "dist"),
    filename: "bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ['env', 'es2015', 'react', 'stage-0'],
            plugins: ["transform-decorators-legacy"]
          }
        }
      },
      {
        test: /\.html$/,
        use: ["html-loader"]
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
	// Match woff2 in addition to patterns like .woff?v=1.1.1.
	test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
	use: {
	  loader: "url-loader",
	  options: {
	    // Limit at 50k. Above that it emits separate files
	    limit: 50000,

	    // url-loader sets mimetype if it's passed.
	    // Without this it derives it from the file extension
	    mimetype: "application/font-woff",

	    // Output below fonts directory
	    name: "./fonts/[name].[ext]",
	  }
	  ,},
      },
    ]
  },
  plugins: [htmlWebpackPlugin],
  resolve: {
    extensions: [".js", ".jsx"]
  },
  devServer: {contentBase: __dirname + '/src'},
  devtool: 'source-map'
};
