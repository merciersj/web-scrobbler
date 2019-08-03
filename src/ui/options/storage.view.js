'use strict';

const unscrobbledDescId = 'page-description';
const btnClearId = 'btn-clear';
const btnScrobbleAllId = 'btn-scrobble-all';

class StorageView {
	constructor() {
		this.initControls();

		this.presenter = this.getPresenter();
	}

	getPresenter() {
		throw new Error('This function must be overridden!');
	}

	/** Public methods. */

	addEntry(songId, songInfo, scrobblerLabels) {
		const entryItem = this.createEntry(songId, songInfo, scrobblerLabels);
		this.songListContainer.append(entryItem);
	}

	getEditedSong() {
		const modalInputNames = ['artist', 'track', 'album', 'albumArtist'];
		const modalInputMap = {};

		for (const inputName of modalInputNames) {
			const inputId = `edit-song-${inputName}`;

			modalInputMap[inputName] = document.getElementById(inputId).value;
		}

		return modalInputMap;
	}

	getEditedSongId() {
		const modal = document.getElementById('edit-song');
		return modal.getAttribute('data-song-id');
	}

	fillEditModal(songId, artist, track, album, albumArtist) {
		const modalInputsMap = { artist, track, album, albumArtist };

		for (const inputName in modalInputsMap) {
			const inputValue = modalInputsMap[inputName];
			if (inputValue) {
				const inputId = `edit-song-${inputName}`;

				document.getElementById(inputId).value = inputValue;
			}
		}

		const modal = document.getElementById('edit-song');
		modal.setAttribute('data-song-id', songId);
	}

	removeEntries() {
		this.songListContainer.innerHTML = '';
	}

	removeEntry(songId) {
		document.getElementById(songId).remove();
	}

	setGlobalControlsEnabled(isEnabled) {
		const clearBtn = document.getElementById(btnClearId);
		const scrobbleAllBtn = document.getElementById(btnScrobbleAllId);

		clearBtn.disabled = !isEnabled;
		scrobbleAllBtn.disabled = !isEnabled;
	}

	setDefaultDescription() {
		document
			.getElementById(unscrobbledDescId)
			.setAttribute('data-i18n', 'scrobbleStorageDescDefault');
	}

	setDescriptionNoSongs() {
		document
			.getElementById(unscrobbledDescId)
			.setAttribute('data-i18n', 'scrobbleStorageDescNoSongs');
	}

	showErrorAlert(messageId) {
		this.showAlert('alert-danger', messageId);
	}

	showSuccessAlert(messageId) {
		this.showAlert('alert-success', messageId);
	}

	updateEntry(songId, songInfo) {
		const { artist, track, album } = songInfo;

		const trackEntry = document.getElementById(songId);
		trackEntry.querySelector(
			'.artist-track'
		).textContent = `${artist} — ${track}`;
		trackEntry
			.querySelector('.album')
			.setAttribute('data-i18n-arg0', album);
	}

	updateEntryLabels(songId, scrobblerLabels) {
		const trackEntry = document.getElementById(songId);
		const labelContainer = trackEntry.querySelector('.scrobbler-labels');
		labelContainer.innerHTML = '';

		for (const label of scrobblerLabels) {
			labelContainer.append(this.createBadge(label));
		}
	}

	/** Private methods. */

	createEntry(songId, songInfo, scrobblerLabels) {
		const { artist, track, album, date } = songInfo;

		const artistTrackItem = document.createElement('div');
		artistTrackItem.className = 'artist-track';
		artistTrackItem.textContent = `${artist} — ${track}`;

		const albumInfoItem = document.createElement('div');
		albumInfoItem.className = 'album';
		if (album) {
			albumInfoItem.setAttribute('data-i18n', 'fromAlbum');
			albumInfoItem.setAttribute('data-i18n-arg0', album);
		}

		const btnEdit = this.createButton('buttonEdit');
		btnEdit.setAttribute('href', '#edit-song');
		btnEdit.setAttribute('data-toggle', 'modal');
		btnEdit.addEventListener('click', () => {
			this.presenter.onEditButtonClicked(songId);
		});

		const btnScrobble = this.createButton('buttonScrobble');
		btnScrobble.addEventListener('click', () => {
			this.presenter.onScrobbleButonClicked(songId);
		});

		const btnRemove = this.createButton('buttonRemove');
		btnRemove.addEventListener('click', () => {
			this.presenter.onRemoveButonClicked(songId);
		});

		const controlContainer = document.createElement('div');
		controlContainer.append(btnEdit, btnScrobble, btnRemove);

		const trackInfoContainer = document.createElement('div');
		trackInfoContainer.className = 'mb-2';
		trackInfoContainer.append(artistTrackItem, albumInfoItem);

		const labelContainer = document.createElement('div');
		labelContainer.className = 'scrobbler-labels';
		for (const label of scrobblerLabels) {
			labelContainer.append(this.createBadge(label));
		}

		const dateElement = document.createElement('small');
		dateElement.className = 'date text-muted';
		dateElement.textContent = date;

		const infoContainer = document.createElement('div');
		infoContainer.className =
			'info-container mb-2 d-flex justify-content-between align-items-center';
		infoContainer.append(labelContainer, dateElement);

		const entryContainer = document.createElement('div');
		entryContainer.id = songId;
		entryContainer.className = 'mb-4';
		entryContainer.append(
			infoContainer,
			trackInfoContainer,
			controlContainer
		);

		return entryContainer;
	}

	createAlert(alertType, messageId) {
		const alertTextElement = document.createElement('div');
		alertTextElement.setAttribute('data-i18n', messageId);

		const alertCrossElement = document.createElement('span');
		alertCrossElement.setAttribute('aria-hidden', true);
		alertCrossElement.innerHTML = '&times;';

		const alertCloseButton = document.createElement('button');
		alertCloseButton.type = 'button';
		alertCloseButton.className = 'close';
		alertCloseButton.setAttribute('data-dismiss', 'alert');
		alertCloseButton.setAttribute('aria-label', 'Close');

		alertCloseButton.append(alertCrossElement);

		const alertElement = document.createElement('div');
		alertElement.classList.add('alert');
		alertElement.classList.add(alertType);
		alertElement.classList.add('alert-dismissible');
		alertElement.classList.add('fade');
		alertElement.classList.add('show');
		alertElement.setAttribute('role', 'alert');

		alertElement.append(alertTextElement, alertCloseButton);

		return alertElement;
	}

	createBadge(label) {
		const badgeElement = document.createElement('span');
		badgeElement.className = 'badge badge-primary';
		badgeElement.textContent = label;

		return badgeElement;
	}

	createButton(nameId) {
		const button = document.createElement('a');
		button.className = 'card-link';
		button.href = '#';
		button.setAttribute('data-i18n', nameId);

		return button;
	}

	initControls() {
		this.rootContainer = document.getElementById('root');
		this.songListContainer = document.getElementById('song-list');

		const clearBtn = document.getElementById(btnClearId);
		clearBtn.addEventListener('click', () => {
			this.presenter.onClearButtonClicked();
		});

		const scrobbleAllBtn = document.getElementById(btnScrobbleAllId);
		scrobbleAllBtn.addEventListener('click', () => {
			this.presenter.onScrobbleAllButtonCLicked();
		});

		const modalBtnOk = document.getElementById('edit-song-btn-ok');
		modalBtnOk.addEventListener('click', () => {
			this.presenter.onModalOkButtonClicked();
		});
	}

	showAlert(alertType, messageId) {
		const alertElement = this.createAlert(alertType, messageId);
		this.rootContainer.append(alertElement);
	}
}

define(() => StorageView);
