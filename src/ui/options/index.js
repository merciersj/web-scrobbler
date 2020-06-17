'use strict';

require([
	'webextension-polyfill',
	'options/accounts',
	'options/connectors',
	'options/dialogs',
	'options/edited-tracks',
	'options/options',
	'util/util-browser',
	'bootstrap',
],
(browser, Accounts, Connectors, Dialogs, EditedTracks, Options, Util, bootstrap) => {
	const GITHUB_RELEASES_URL =
		'https://github.com/web-scrobbler/web-scrobbler/releases/tag';
	// const GITHUB_RAW_SRC =
	// 	'https://github.com/web-scrobbler/web-scrobbler/blob/master/src/';

	const accountsTabId = 'sidebar-accounts-tab';
	const optionsTabId = 'sidebar-options-tab';

	const latestReleaseLinkId = 'latest-release';
	// const privacyLinkId = 'privacy-url';

	async function initialize() {
		await Promise.all([
			Connectors.initialize(),
			Accounts.initialize(),
			Dialogs.initialize(),
			EditedTracks.initialize(),
			Options.initialize(),
		]);

		updateSections();
		updateUrls();
	}

	async function updateSections() {
		switch (location.hash) {
			case '#accounts':
				expandAccountsSection();
				break;
			case '#options':
				expandOptionsSection();
				break;
		}
	}

	async function updateUrls() {
		/* GitHub releases URL */

		const extVersion = browser.runtime.getManifest().version;
		const releaseNotesUrl = `${GITHUB_RELEASES_URL}/v${extVersion}`;

		const latestReleaseLink = document.getElementById(latestReleaseLinkId);
		latestReleaseLink.setAttribute('href', releaseNotesUrl);

		/* Privacy policy URL */

		// const privacyPolicyFile = await Util.getPrivacyPolicyFilename();
		// const privacyPolicyUrl = `${GITHUB_RAW_SRC}/${privacyPolicyFile}`;

		// const privacyLink = document.getElementById(privacyLinkId);
		// privacyLink.setAttribute('href', privacyPolicyUrl);
	}

	function expandAccountsSection() {
		showTab(accountsTabId);
	}

	function expandOptionsSection() {
		showTab(optionsTabId);
	}

	function showTab(tabId) {
		const tabElement = document.getElementById(tabId);
		new bootstrap.Tab(tabElement).show();
	}

	initialize();
});
