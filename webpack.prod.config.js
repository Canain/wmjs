/// <reference path="typings/main.d.ts" />
const webpack = require('webpack');

module.exports = {
	entry: './src/ts/browser/main.ts',
	output: {
		filename: './pub/bundle.js',
	},
	module: {
		loaders: [
			{
				test: /\.ts$/,
				loader: 'babel?presets[]=es2015!ts'
			},
			{
				test: /\.json$/,
				loader: 'json-loader'
			},
			{
				test: /\.scss$/,
				loaders: ["style", "css?sourceMap", "sass?sourceMap"]
			}
		]
	},
	node: {
		fs: 'empty'
	},
	resolve: {
		modulesDirectories: ['node_modules'],
		extensions: ['', '.webpack.js', '.web.js', '.ts', '.js']
	}
};