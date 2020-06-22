'use strict';

/* @ifndef DEBUG
chrome.runtime.onInstalled.addListener((event) => {
	if ('install' !== event.reason) {
		return;
	}

	chrome.tabs.create({
		url: '/ui/startup/startup.html'
	});
});
/* @endif */

/**
 * Background script entry point.
 */
require(['extension', 'storage/options', 'util/migrate'], (...modules) => {
	const [Extension, Options, Migrate] = modules;

	Migrate.migrate().then(() => {
		window.options = Options;
		window.webScrobbler = new Extension();
		window.webScrobbler.start();
	});
});
