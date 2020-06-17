'use strict';

define((require) => {
	const CustomPatterns = require('storage/custom-patterns');

	const { getSortedConnectors } = require('util/util-connector');

	const sortedConnectors = getSortedConnectors();

	const patternsModalOkBtnId = 'conn-conf-ok';
	const patternsModalAddBtnId = 'add-pattern';
	const patternsModalResetBtnId = 'conn-conf-reset';

	const patternsListId = 'conn-conf-list';
	const patternsModalId = 'conn-conf-modal';
	const patternsModalTitleId = 'url-patterns-title';

	function initialize() {
		initAddPatternDialog();
	}

	function initAddPatternDialog() {
		const modalDialog = document.getElementById(patternsModalId);
		modalDialog.addEventListener('show.bs.modal', (event) => {
			const button = event.relatedTarget;
			const connectorIndex = button.getAttribute('data-conn');

			initPatternsList(connectorIndex);
		});

		const okButton = document.getElementById(patternsModalOkBtnId);
		okButton.addEventListener('click', savePatterns);

		const addButton = document.getElementById(patternsModalAddBtnId);
		addButton.addEventListener('click', addNewPatternInput);

		const resetButton = document.getElementById(patternsModalResetBtnId);
		resetButton.addEventListener('click', resetPatterns);
	}

	async function initPatternsList(index) {
		const connector = sortedConnectors[index];

		const modalDialog = document.getElementById(patternsModalId);
		modalDialog.setAttribute('data-conn', index);

		const modalTitle = document.getElementById(patternsModalTitleId);
		modalTitle.textContent = connector.label;

		const allPatterns = await CustomPatterns.getAllPatterns();
		const patterns = allPatterns[connector.id] || [];

		const patternsList = document.getElementById(patternsListId);
		patternsList.innerHTML = '';

		for (const value of patterns) {
			patternsList.append(createNewInputContainer(value));
		}
	}

	function savePatterns() {
		const modalDialog = document.getElementById(patternsModalId);
		const patternsList = document.getElementById(patternsListId);
		const connector = getConnectorAttachedTo(modalDialog);

		const patterns = [];

		const inputs = patternsList.getElementsByTagName('input');
		for (const input of inputs) {
			const pattern = input.value;
			if (pattern.length > 0) {
				patterns.push(pattern);
			}
		}

		if (patterns.length > 0) {
			CustomPatterns.setPatterns(connector.id, patterns);
		} else {
			CustomPatterns.resetPatterns(connector.id);
		}
	}

	function addNewPatternInput() {
		const patternsList = document.getElementById(patternsListId);
		const inputContainer = createNewInputContainer();

		patternsList.append(inputContainer);
		inputContainer.getElementsByTagName('input')[0].focus();
	}

	function resetPatterns() {
		const modalDialog = document.getElementById(patternsModalId);
		const connector = getConnectorAttachedTo(modalDialog);

		CustomPatterns.resetPatterns(connector.id);
	}

	function createNewInputContainer(value) {
		const container = document.createElement('li');

		const input = document.createElement('input');
		input.setAttribute('type', 'text');
		input.classList.add('form-control');
		input.value = value || '';

		const closeButton = createCloseButton(container);

		container.classList.add('input-group');
		container.append(input, closeButton);

		return container;
	}

	function createCloseButton(parent) {
		const closeButton = document.createElement('button');
		closeButton.classList.add('btn', 'btn-outline-secondary');
		closeButton.innerHTML = '&times;';
		closeButton.addEventListener('click', () => {
			parent.remove();
		});

		return closeButton;
	}

	function getConnectorAttachedTo(modalDialog) {
		const index = modalDialog.getAttribute('data-conn');
		return sortedConnectors[index];
	}

	return { initialize };
});
