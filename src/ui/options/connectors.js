'use strict';

define((require) => {
	const Options = require('storage/options');

	const { getSortedConnectors } = require('util/util-connector');

	const sortedConnectors = getSortedConnectors();

	async function initialize() {
		await initConnectorsList();
	}

	async function initConnectorsList() {
		const container = document.getElementById('connectors');

		const connectorsCount = sortedConnectors.length;
		const disabledConnectors =
			await Options.getOption(Options.DISABLED_CONNECTORS);
		const toggleCheckboxState =
			Object.keys(disabledConnectors).length !== connectorsCount;

		sortedConnectors.forEach((connector, index) => {
			const { id, label } = connector;
			const entry = createConnectorEntry(index, label);

			const checkbox = entry.getElementsByTagName('input')[0];
			checkbox.addEventListener('click', function() {
				Options.setConnectorEnabled(connector, this.checked);
			});
			const isConnectorEnabled = !(id in disabledConnectors);
			checkbox.checked = isConnectorEnabled;

			container.append(entry);
		});

		const toggleCheckBox = document.getElementById('toggle');
		toggleCheckBox.checked = toggleCheckboxState;
		toggleCheckBox.addEventListener('click', function() {
			for (let i = 0; i < connectorsCount; ++i) {
				const configId = getConnectorConfigId(i);
				const checkbox = document.getElementById(configId);
				checkbox.checked = this.checked;
			}
			Options.setAllConnectorsEnabled(this.checked);
		});
	}

	function createConnectorEntry(index, label) {
		const configId = getConnectorConfigId(index);

		const icon = document.createElement('div');
		icon.classList.add('connector-icon');

		const configLink = document.createElement('a');
		configLink.setAttribute('href', '#conn-conf-modal');
		configLink.setAttribute('data-conn', index);
		configLink.setAttribute('data-toggle', 'modal');
		configLink.append(icon);

		const configCheckBox = document.createElement('input');
		configCheckBox.classList.add('form-check-input');
		configCheckBox.setAttribute('type', 'checkbox');
		configCheckBox.id = configId;

		const configLabel = document.createElement('label');
		configLabel.setAttribute('for', configId);
		configLabel.classList.add('form-check-label');
		configLabel.textContent = label;

		const checkBoxContainer = document.createElement('div');
		checkBoxContainer.classList.add('form-check', 'form-switch');
		checkBoxContainer.append(configCheckBox, configLabel);

		const itemContainer = document.createElement('div');
		itemContainer.classList.add('input-group', 'mb-2');
		itemContainer.append(configLink, checkBoxContainer);

		return itemContainer;
	}

	function getConnectorConfigId(index) {
		return `conn-${index}`;
	}

	return { initialize };
});
