'use strict';

define((require) => {
	const SavedEdits = require('storage/saved-edits');

	const EXPORT_FILENAME = 'local-cache.json';

	const editedTracksListId = 'edited-track-content';

	const exportBtnId = 'export-edited';
	const importBtnId = 'import-edited';
	const clearBtnId = 'clear-edited';

	// FIXME Remove this
	const BrowserStorage = require('storage/browser-storage');
	const localCache = BrowserStorage.getStorage(BrowserStorage.LOCAL_CACHE);

	function initialize() {
		initializeList();

		initializeButtons();
	}

	function initializeButtons() {
		const exportButton = document.getElementById(exportBtnId);
		const importButton = document.getElementById(importBtnId);
		const clearButton = document.getElementById(clearBtnId);

		exportButton.addEventListener('click', (e) => {
			e.preventDefault();
			exportLocalCache();
		});

		importButton.addEventListener('click', (e) => {
			e.preventDefault();
			importLocalStorage();
		});

		clearButton.addEventListener('click', (e) => {
			e.preventDefault();
			clearLocalCache();
		});
	}

	/**
	 * Export content of LocalCache storage to a file.
	 */
	async function exportLocalCache() {
		const data = await SavedEdits.getSongInfoStorage();
		const dataStr = JSON.stringify(data, null, 2);
		const blob = new Blob([dataStr], { type: 'application/octet-stream' });
		const url = URL.createObjectURL(blob);

		const a = document.createElement('a');
		a.href = url;
		a.download = EXPORT_FILENAME;
		a.dispatchEvent(new MouseEvent('click'));
		a.remove();

		URL.revokeObjectURL(url);
	}

	/**
	 * Import LocalCache storage from a file.
	 */
	function importLocalStorage() {
		const fileInput = document.createElement('input');

		fileInput.style.display = 'none';
		fileInput.type = 'file';
		fileInput.accept = '.json';
		fileInput.acceptCharset = 'utf-8';

		document.body.append(fileInput);
		fileInput.initialValue = fileInput.value;
		fileInput.addEventListener('change', readFile);
		fileInput.click();

		function readFile() {
			if (fileInput.value !== fileInput.initialValue) {
				const file = fileInput.files[0];

				const reader = new FileReader();
				reader.onloadend = (event) => {
					const dataStr = event.target.result;
					const data = JSON.parse(dataStr);

					localCache.update(data).then(() => {
						fileInput.remove();
					});
				};
				reader.readAsText(file, 'utf-8');
			}
		}
	}

	async function initializeList() {
		const editedTracksContainer = document.getElementById(
			editedTracksListId
		);
		editedTracksContainer.innerHTML = '';

		const data = await SavedEdits.getSongInfoStorage();
		const editedTracksCount = Object.keys(data).length;

		if (editedTracksCount === 0) {
			showNoEditedTracksDescription();
		} else {
			showEditedTracksDescription();
			updateViewEditedDialogTitle(editedTracksCount);

			for (const songId in data) {
				const { artist, track, album } = data[songId];
				const liItem = createTrackItem(artist, track, album);

				const removeButton = liItem.getElementsByTagName('button')[0];
				removeButton.addEventListener('click', async () => {
					await SavedEdits.removeSongInfoById(songId);

					const cacheSize = Object.keys(data).length;

					if (cacheSize === 0) {
						showNoEditedTracksDescription();
					} else {
						updateViewEditedDialogTitle(cacheSize);
					}
				});

				editedTracksContainer.append(liItem);
			}
		}
	}

	function showNoEditedTracksDescription() {
		const editedTracksDesc = document.getElementById('edited-tracks-desc');
		editedTracksDesc.hidden = true;

		const editedTracksSection = document.getElementById('edited-tracks-section');
		editedTracksSection.hidden = true;

		const noEditedTracksDesc = document.getElementById('no-edited-tracks-desc');
		noEditedTracksDesc.hidden = false;
	}

	function showEditedTracksDescription() {
		const editedTracksDesc = document.getElementById('edited-tracks-desc');
		editedTracksDesc.hidden = false;

		const editedTracksSection = document.getElementById('edited-tracks-section');
		editedTracksSection.hidden = false;

		const noEditedTracksDesc = document.getElementById('no-edited-tracks-desc');
		noEditedTracksDesc.hidden = true;
	}

	function updateViewEditedDialogTitle(editedTracksCount) {
		document
			.getElementById('edited-tracks-count-title')
			.setAttribute('data-i18n-arg0', editedTracksCount);
	}

	function createTrackItem(artist, track, album) {
		const liItem = document.createElement('li');
		liItem.textContent = `${artist} — ${track}`;

		const removeBtn = createCloseButton(liItem);
		removeBtn.classList.add('close', 'close-btn');

		if (album) {
			liItem.setAttribute('data-i18n-title', 'albumTooltip');
			liItem.setAttribute('data-i18n-title-arg0', album);
		}

		liItem.append(removeBtn);

		return liItem;
	}

	// TODO Remove duplicate
	function createCloseButton(parent) {
		const closeButton = document.createElement('button');
		closeButton.setAttribute('type', 'button');
		closeButton.innerHTML = '&times;';
		closeButton.addEventListener('click', () => {
			parent.remove();
		});

		return closeButton;
	}

	function clearLocalCache() {
		SavedEdits.clear();
	}

	return { initialize };
});
