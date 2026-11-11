const path = require( 'path' );
const entries = require( 'webpack-glob-entries' );
const defaultConfig = require( '@wordpress/scripts/config/webpack.config.js' );
const { BundleAnalyzerPlugin } = require( 'webpack-bundle-analyzer' );
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );

const isProduction = process.env.NODE_ENV === 'production';

const webpack = require( 'webpack' );

module.exports = {
	...defaultConfig,
	entry: {
		wishlist: './assets/src/js/wishlist.js',
		'lp-wishlist': './assets/src/js/lp-wishlist.js',
		'blocks/course-button-wishlist':
			'./assets/src/js/gutenberg/blocks/course-button-wishlist/index.js',
	},
	output: {
		filename: '[name]' + ( isProduction ? '.min.js' : '.js' ),
		path: path.resolve( __dirname, './assets/dist/js/' ),
	},
	plugins: [
		...defaultConfig.plugins,
		process.env.WP_BUNDLE_ANALYZER && new BundleAnalyzerPlugin(),
		! process.env.WP_NO_EXTERNALS && new DependencyExtractionWebpackPlugin(),
	].filter( Boolean ),
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [ '@wordpress/babel-preset-default' ],
					},
				},
			},
			{
				test: /\.css$/i,
				use: [ 'style-loader', 'css-loader' ],
			},
		],
	},
};
