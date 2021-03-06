/*** webpack.config.js ***/
const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ManifestPlugin = require("webpack-manifest-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const BabelEnginePlugin = require('babel-engine-plugin');
const webpack = require("webpack");
const htmlWebpackPlugin = new HtmlWebpackPlugin({
    template: path.join(__dirname, "public/index.html"),
    filename: "./index.html"
});



module.exports = {
  entry: path.join(__dirname, "src/index.js"),
  output: {
    path: path.join(__dirname, "../api/idris/static/dist/web"),
    filename: "[name].[hash].js"
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
	test: /\.(js|jsx)$/,
	exclude: /node_modules/,
	use: [{loader: "babel-loader",
               options: {
		 presets: ['env', 'es2015', 'react', 'stage-0'],
		 plugins: ["transform-decorators-legacy"]
               }
	      },
	      'eslint-loader']
      },
      {
	test: /\.(png|svg|csl|xml)$/,
	use: [
	  {
	    loader: 'file-loader',
	    options: {
	      name: '[name].[hash].[ext]',
	      publicPath: function(url) {
	      return '/static/' + url;
	      }
	    }
	  }
	]
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
  plugins: [htmlWebpackPlugin,
	    new BabelEnginePlugin({presets: ['env']}),
	    new ManifestPlugin(),
	    new webpack.ProvidePlugin({
	      "Promise": "es6-promise-promise",
	    }),
	    new CleanWebpackPlugin(['../api/idris/static/dist/web'])],
  resolve: {
    extensions: [".js", ".jsx"]
  },
  devServer: {contentBase: __dirname + '/src',
	      publicPath: '/static/',
	      //publicPath: '/' + (process.env.OUTPUT_PATH || 'edit') + '/',
              allowedHosts: ['.localhost']},
  devtool: 'source-map'
};
