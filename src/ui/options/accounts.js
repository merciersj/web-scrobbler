'use strict';

const propsModalId = 'scrobbler-props';
const propsModalBodyId = 'scrobbler-props-body';
const propsModalTitleId = 'scrobbler-props-title';
const propsModalOkBtnId = 'scrobbler-ok';

define((require) => {
	const { getCurrentTab } = require('util/util-browser');
	const { extension, tabs } = require('webextension-polyfill');

	const { webScrobbler } = extension.getBackgroundPage();
	const ScrobbleService = webScrobbler.getScrobbleService();

	const scrobblerPropertiesMap = {
		listenbrainz: {
			userApiUrl: {
				title: 'accountsUserApiUrl',
				placeholder: 'accountsUserApiUrlPlaceholder',
			},
			userToken: {
				type: 'password',
				title: 'accountsUserToken',
				placeholder: 'accountsUserTokenPlaceholder',
			},
		},
	};

	async function initialize() {
		await createAccountViews();
		setupEventListeners();
		setupDialog();
	}

	async function setupEventListeners() {
		const tab = await getCurrentTab();
		tabs.onActivated.addListener((activeInfo) => {
			if (tab.id === activeInfo.tabId) {
				createAccountViews();
			}
		});
	}

	async function createAccountViews() {
		const scrobblers = ScrobbleService.getRegisteredScrobblers();
		for (const scrobbler of scrobblers) {
			createAccountContainer(scrobbler);
			fillAccountContainer(scrobbler);
		}
	}

	function createAccountContainer(scrobbler) {
		const containerId = scrobbler.getId();
		if (document.getElementById(containerId) !== null) {
			return;
		}

		const accountContainer = document.createElement('li');
		accountContainer.id = containerId;
		accountContainer.classList.add('list-group-item');

		const accountsList = document.getElementById('accounts-wrapper');
		accountsList.append(accountContainer);
	}

	async function fillAccountContainer(scrobbler) {
		const accountBody = document.getElementById(scrobbler.getId());

		let session = null;
		try {
			session = await scrobbler.getSession();
		} catch (err) {
			// Do nothing
		}

		const label = document.createElement('h4');
		label.classList.add('cart-title');
		label.textContent = scrobbler.getLabel();

		const buttons = document.createElement('div');

		const authStr = document.createElement('span');
		authStr.classList.add('card-text');

		if (session) {
			const userName = session.sessionName || 'anonimous';

			authStr.setAttribute('data-i18n', 'accountsSignedInAs');
			authStr.setAttribute('data-i18n-arg0', userName);
		} else {
			authStr.setAttribute('data-i18n', 'accountsNotSignedIn');
		}

		if (!session) {
			const signInBtn = createButton('accountsSignIn');
			signInBtn.addEventListener('click', () => {
				webScrobbler.authenticateScrobbler(scrobbler);
			});

			buttons.append(signInBtn);
		}

		if (scrobbler.getUsedDefinedProperties().length > 0) {
			const propsBtn = createButton('accountsScrobblerProps');
			propsBtn.setAttribute('data-toggle', 'modal');
			propsBtn.setAttribute('data-scrobbler-id', scrobbler.getId());
			propsBtn.setAttribute('href', '#scrobbler-props');

			buttons.append(propsBtn);
		}

		if (session) {
			const profileUrl = await scrobbler.getProfileUrl();
			if (profileUrl) {
				const profileBtn = createButton('accountsProfile');
				profileBtn.addEventListener('click', () => {
					tabs.create({ url: profileUrl });
				});

				buttons.append(profileBtn);
			}

			const logoutBtn = createButton('accountsSignOut');
			logoutBtn.addEventListener('click', async () => {
				await scrobbler.signOut();
				await fillAccountContainer(scrobbler);
			});

			buttons.append(logoutBtn);
		}

		accountBody.innerHTML = '';
		accountBody.append(label, authStr, buttons);
	}

	function fillPropsDialog(scrobbler) {
		const scrobblerLabel = scrobbler.getLabel();
		const scrobblerId = scrobbler.getId();

		const modal = document.getElementById(propsModalId);
		const title = document.getElementById(propsModalTitleId);

		const body = document.getElementById(propsModalBodyId);
		body.innerHTML = '';

		const props = scrobblerPropertiesMap[scrobblerId];
		for (const propId in props) {
			const { placeholder, title, type } = props[propId];
			const value = scrobbler[propId];

			body.append(createPropConainer({
				propId, placeholder, title, type, value,
			}));
		}

		title.setAttribute('data-i18n', 'accountsSignedInAs');
		title.setAttribute('data-i18n-arg0', scrobblerLabel);

		modal.setAttribute('data-scrobbler-id', scrobblerId);
	}

	function setupDialog() {
		// const modalDialog = document.getElementById(propsModalId);
		$('#scrobbler-props').on('show.bs.modal', (event) => {
			const button = event.relatedTarget;
			const scrobblerId = button.getAttribute('data-scrobbler-id');

			fillPropsDialog(ScrobbleService.getScrobblerById(scrobblerId));
		});

		const okButton = document.getElementById(propsModalOkBtnId);
		okButton.addEventListener('click', onOkButtonClick);
	}

	async function onOkButtonClick() {
		const modal = document.getElementById(propsModalId);
		const scrobblerId = modal.getAttribute('data-scrobbler-id');
		const scrobbler = ScrobbleService.getScrobblerById(scrobblerId);

		const userProps = {};
		const scrobblerProps = scrobblerPropertiesMap[scrobblerId];

		for (const propId in scrobblerProps) {
			const input = document.getElementById(propId);
			const value = input.value || null;

			userProps[propId] = value;
		}

		await webScrobbler.applyUserProperties(scrobbler, userProps);
		fillAccountContainer(scrobbler);
	}

	function createButton(labelId) {
		const button = document.createElement('a');
		button.classList.add('card-link');
		button.setAttribute('href', '#');
		button.setAttribute('data-i18n', labelId);
		return button;
	}

	function createPropConainer(prop) {
		const { propId, placeholder, title, type, value } = prop;

		const formGroup = document.createElement('div');
		formGroup.className = 'form-group';

		const label = document.createElement('label');
		label.setAttribute('data-i18n', title);

		const input = document.createElement('input');
		input.setAttribute('data-i18n-placeholder', placeholder);
		input.className = 'form-control';
		input.value = value || null;
		input.id = propId;
		if (type) {
			input.type = type;
		}

		formGroup.append(label, input);
		return formGroup;
	}

	return { initialize };
});
