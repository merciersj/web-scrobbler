'use strict';

const fs = require('fs');
const path = require('path');

const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');

/**
 * A main entry point.
 *
 * @type {String}
 */
const mainEntry = 'core/background/main';

/**
 * A path to the main entry point.
 *
 * @type {String}
 */
const mainEntryPath = getEntryJsPath(mainEntry);

/**
 * A list of UI popup names. Each name is a name of HTML file of the popup.
 *
 * @type {Array}
 */
const uiPopups = getUiPopupNames();

/**
 * A list of UI page names. Each name is a directory where all files related
 * to the page are stored.
 *
 * @type {Array}
 */
const uiPages = ['options', 'startup', 'vue'];

/**
 * A default chunk for UI popups with no chunk.
 *
 * @type {String}
 */
const defaultPopupChunk = 'ui/popups/base-popup';

const chunkDir = 'shared';
const buildDir = 'build';
const iconsDir = 'icons';
const srcDir = 'src';
const vendorDir = 'vendor';

const vendorFiles = ['metadata-filter/dist/filter.js'];
const extensionFiles = [
	'manifest.json',
	'_locales/',

	'connectors/',
	'core/content/',
];
const extensionIcons = [
	`${srcDir}/${iconsDir}/`,
	'node_modules/bootstrap-icons/icons/',
	'node_modules/simple-icons/icons/github.svg',
	'node_modules/simple-icons/icons/twitter.svg',
];
const projectFiles = [
	'LICENSE.md',
	'README.md',
	'package-lock.json',
	'package.json',
];

const preprocessorFlagNames = {
	chrome: 'CHROME',
	development: 'DEBUG',
	firefox: 'FIREFOX',
	production: 'RELEASE',
};

const defaultBrowser = 'chrome';

/**
 * A list of CSS styles shared across UI modules. These styles will be extracted
 * as separate chunks.
 *
 * @type {Array}
 */
const sharedStyles = ['bootstrap', 'base-popup', 'base'];

const modeDevelopment = 'development';
const modeProduction = 'production';

class WatchExtensionFilesPlugin {
	apply(compiler) {
		compiler.hooks.beforeCompile.tap(
			'WatchExtensionFilesPlugin',
			(params) => {
				extensionFiles.forEach((path) =>
					params.compilationDependencies.add(
						resolve(`${srcDir}/${path}`)
					)
				);
				projectFiles.forEach((path) =>
					params.compilationDependencies.add(resolve(path))
				);
			}
		);
	}
}

module.exports = (browserArg) => {
	// TODO Validate
	const browser = browserArg || getBrowserFromArgs() || defaultBrowser;

	const preprocessorFlags = {
		[preprocessorFlagNames[browser]]: true,
		[preprocessorFlagNames[getMode()]]: true,
	};

	return {
		devtool: getDevtool(),
		devServer: {
			// https://github.com/webpack/webpack-dev-server/issues/1604
			disableHostCheck: true,
		},
		entry: makeEntries(),
		mode: getMode(),
		module: {
			rules: [
				{
					test: /\.css$/i,
					use: [MiniCssExtractPlugin.loader, 'css-loader'],
				},
				{
					test: /\.html$/,
					loader: 'html-loader',
					exclude: /node_modules/,
				},
				{
					test: /\.js$/,
					use: {
						loader: 'preprocess-loader',
						options: preprocessorFlags,
					},
				},
				{
					test: /\.vue$/,
					loader: 'vue-loader',
				},
			],
		},
		optimization: makeOptimization(),
		output: {
			chunkFilename: `${chunkDir}/[name].js`,
			filename: '[name].js',
			path: resolve(buildDir),
			publicPath: '/',
		},
		plugins: makePlugins(),
		resolve: {
			alias: {
				connectors: resolve(`${srcDir}/core/connectors`),
			},
			modules: [
				resolve(`${srcDir}/core/background`),
				resolve(srcDir),
				'node_modules',
			],
		},
		stats: 'minimal',
	};
};

/**
 * Return a browser identifier from a command line argument.
 *
 * @return {String} Browser identifier
 */
function getBrowserFromArgs() {
	return process.argv[2];
}

/**
 * Return a style of source mapping. Returns false (means no source maps are
 * generated) if the current mode is production.
 *
 * @return {String} Devtool name
 */
function getDevtool() {
	if (getMode() === modeProduction) {
		return false;
	}

	return 'inline-cheap-source-map';
}

/**
 * Return a path to a given entry.
 * If the path is not exists, return a null value.
 *
 * @param  {String} entryName Full entry name
 * @return {String} Path to entry
 */
function getEntryJsPath(entryName) {
	const jsPath = resolve(`src/${entryName}.js`);
	if (fs.existsSync(jsPath)) {
		return jsPath;
	}

	return null;
}

/**
 * Get current mode from the Node.js environment variable. Return "development"
 * mode, if Node.js environment variable is not set.
 *
 * @return {String} Mode value
 */
function getMode() {
	return process.env.NODE_ENV || modeDevelopment;
}

function getUiPopupNames() {
	return ['disabled', 'go-play-music', 'error', 'unsupported'];
	// const popupsDir = resolve('src/ui/popups/');

	// return fs
	// 	.readdirSync(popupsDir)
	// 	.filter((file) => {
	// 		return file.endsWith('.html');
	// 	})
	// 	.map((file) => {
	// 		return path.basename(file, '.html');
	// 	});
}

/**
 * Return a new entry object for a given UI page.
 *
 * @param  {String} page UI page name (the name of directory)
 * @return {Object} Entry object
 */
function getUiPageJsEntry(page) {
	const entryName = `ui/${page}/index`;
	const entryPath = getEntryJsPath(entryName);

	return { entryName, entryPath };
}

/**
 * Return a new entry object for a given UI popup.
 *
 * @param  {String} popup UI popuo name (the name of HTML file)
 * @return {Object} Entry object
 */
function getUiPopupJsEntry(popup) {
	const entryName = `ui/popups/${popup}`;
	const entryPath = getEntryJsPath(entryName);

	return { entryName, entryPath };
}

/**
 * Get an array of UI pages entries.
 *
 * @return {Array} Array of UI pages entries
 */
function getUiPagesEntries() {
	return uiPages.map((page) => getUiPageJsEntry(page));
}

/**
 * Get an array of UI popups entries.
 *
 * @return {Array} Array of UI popups entries
 */
function getUiPopupsEntries() {
	return uiPopups.map((popup) => getUiPopupJsEntry(popup));
}

/**
 * Make a list of enty points.
 *
 * @return {Object} Object containting entry points
 */
function makeEntries() {
	const entries = {
		[mainEntry]: resolve(mainEntryPath),
	};

	const uiEntries = [
		...getUiPagesEntries(),
		...getUiPopupsEntries(),

		getUiPopupJsEntry('base-popup'),
	];
	for (const { entryName, entryPath } of uiEntries) {
		if (entryPath !== null) {
			entries[entryName] = entryPath;
		}
	}

	return entries;
}

/**
 * Make an array of HtmlWebpackPlugin for a given list of entries.
 *
 * Each entry can represent either an UI page, or an UI popup. If an entry has
 * no chunk (i.e. no custom JS file), a default chunk will be used instead.
 *
 * @param {Array} entries Array of entries
 * @param {String} defaultChunk Default chunk used as a fallback value
 * @return {Array} Array of webpack plugins
 */
function makeHtmlPluginsFromEntries(entries, defaultChunk = null) {
	const plugins = [];

	for (const { entryName, entryPath } of entries) {
		let chunk = entryName;

		if (entryPath === null) {
			if (defaultChunk === null) {
				throw new Error(`No chunk for ${entryName} is specified`);
			}

			chunk = defaultChunk;
		}

		plugins.push(
			new HtmlWebpackPlugin({
				chunks: [chunk],
				template: resolve(`${srcDir}/${entryName}.html`),
				filename: `${entryName}.html`,
			})
		);
	}

	return plugins;
}

function makeOptimization() {
	const optimization = {};

	if (getMode() === modeProduction) {
		optimization.minimizer = [
			new TerserJSPlugin({}),
			new OptimizeCSSAssetsPlugin({}),
		];
	}

	const cacheGroups = {};
	for (const style of sharedStyles) {
		cacheGroups[style] = {
			name: style,
			test: new RegExp(`${style}\\.css$`),
			chunks: 'all',
			enforce: true,
		};
	}
	optimization.splitChunks = { cacheGroups };

	return optimization;
}

/**
 * Make a list of webpack plugins used to build the extension.
 *
 * @return {Array} Array of webpack plugins
 */
function makePlugins() {
	const patterns = [
		...vendorFiles.map((path) => {
			return {
				from: resolve(`node_modules/${path}`),
				to: resolve(`${buildDir}/${vendorDir}`),
			};
		}),
		...extensionFiles.map((path) => {
			return {
				from: resolve(`${srcDir}/${path}`),
				to: resolve(`${buildDir}/${path}`),
			};
		}),
		...extensionIcons.map((path) => {
			return {
				from: resolve(path),
				to: resolve(`${buildDir}/${iconsDir}`),
			};
		}),
		...projectFiles.map((path) => {
			return {
				from: resolve(path),
				to: resolve(`${buildDir}/${path}`),
			};
		}),
	];

	return [
		new VueLoaderPlugin(),
		new MiniCssExtractPlugin({
			chunkFilename: `${chunkDir}/[name].css`,
			filename: '[name].css',
		}),
		new CopyPlugin({ patterns }),
		...makeHtmlPluginsFromEntries(getUiPagesEntries()),
		...makeHtmlPluginsFromEntries(getUiPopupsEntries(), defaultPopupChunk),
		new WatchExtensionFilesPlugin(),
		new WriteFilePlugin(),
	];
}

function resolve(p) {
	return path.resolve(__dirname, p);
}
