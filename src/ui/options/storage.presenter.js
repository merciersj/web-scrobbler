'use strict';

define((require) => {
	const { extension } = require('webextension-polyfill');

	const ScrobbleStorage = require('storage/scrobble-storage');
	const { RESULT_OK } = require('object/api-call-result');

	const { webScrobbler } = extension.getBackgroundPage();
	const ScrobbleService = webScrobbler.getScrobbleService();

	class StoragePresenter {
		constructor(view) {
			this.view = view;

			this.scrobblerMap = {};
			for (const scrobbler of ScrobbleService.getRegisteredScrobblers()) {
				this.scrobblerMap[scrobbler.getId()] = scrobbler.getLabel();
			}

			this.loadSongsFromStorage();
		}

		/** Public methods */

		async onClearButtonClicked() {
			await this.removeAllEntries();
		}

		async onEditButtonClicked(entryId) {
			await this.showEditModal(entryId);
		}

		async onModalOkButtonClicked() {
			await this.updateEditedSongInfo();
		}

		async onRemoveButonClicked(entryId) {
			await this.removeEntry(entryId);
		}

		async onScrobbleAllButtonCLicked() {
			// Imitate scrobbling with a network delay
			setTimeout(() => {
				this.removeAllEntries();
			}, 1000);
		}

		async onScrobbleButonClicked(entryId) {
			await this.scrobbleEntry(entryId);
		}

		/** Private methods */

		getScrobblerLabels(scrobblerIds) {
			return scrobblerIds.map((id) => this.scrobblerMap[id]);
		}

		async loadSongsFromStorage() {
			let entries = await ScrobbleStorage.getEntries();
			// TODO Remove this block
			if (Object.keys(entries).length === 0) {
				const songInfo = {
					artist: 'Test Artist',
					track: 'Test Track',
					album: 'Test Album',
					timestamp: 1592128557,
				};
				const scrobblerIds = ['lastfm', 'librefm'];

				await ScrobbleStorage.addSong(songInfo, scrobblerIds);
				entries = await ScrobbleStorage.getEntries();
			}

			const songCount = Object.keys(entries).length;

			this.updateView(songCount);

			if (songCount === 0) {
				return;
			}

			for (const entryId in entries) {
				const { songInfo, scrobblerIds } = entries[entryId];
				const { artist, track, album, timestamp } = songInfo;
				const date = new Date(timestamp * 1000).toLocaleString();

				const songInfoForUi = { artist, track, album, date };
				this.view.addEntry(
					entryId,
					songInfoForUi,
					this.getScrobblerLabels(scrobblerIds)
				);
			}
		}

		async scrobbleEntry(entryId) {
			const { songInfo, scrobblerIds } = await ScrobbleStorage.getEntry(
				entryId
			);
			const results = await ScrobbleService.scrobbleWithScrobblers(
				songInfo,
				scrobblerIds
			);

			const okScrobblersIds = [];
			const failedScrobblerIds = [];

			for (const result of results) {
				const scrobblerId = result.getScrobblerId();

				if (result.is(RESULT_OK)) {
					okScrobblersIds.push(scrobblerId);
				} else {
					failedScrobblerIds.push(scrobblerId);
				}
			}

			const areAllResultsOk = okScrobblersIds.length === results.length;

			if (areAllResultsOk) {
				this.removeEntry(entryId);
			} else {
				const isNeedToUpdateScrobblerIds = okScrobblersIds.length > 0;
				if (isNeedToUpdateScrobblerIds) {
					this.updateScrobblerIds(entryId, failedScrobblerIds);
				}

				const scrobblerLabels = this.getScrobblerLabels(
					failedScrobblerIds
				);
				const labelsList = scrobblerLabels.join(', ');

				// TODO Move textId to view
				this.view.showErrorAlert(`unableToScrobble: ${labelsList}`);
			}
		}

		async showEditModal(entryId) {
			const { songInfo } = await ScrobbleStorage.getEntry(entryId);
			const { artist, track, album } = songInfo;

			this.view.fillEditModal(entryId, artist, track, album);
		}

		async removeAllEntries() {
			await ScrobbleStorage.clear();

			this.view.removeEntries();
			this.updateView(0);
		}

		async removeEntry(entryId) {
			await ScrobbleStorage.removeEntry(entryId);
			const songCount = await ScrobbleStorage.getSongCount();

			this.view.removeEntry(entryId);
			this.updateView(songCount);
		}

		async updateEditedSongInfo() {
			const entryId = this.view.getEditedSongId();
			const songInfo = this.view.getEditedSong();

			await ScrobbleStorage.updateSong(entryId, songInfo);

			this.view.updateEntry(entryId, songInfo);
		}

		async updateScrobblerIds(entryId, scrobblerIds) {
			await ScrobbleStorage.updateScrobblerIds(entryId, scrobblerIds);

			this.view.updateEntryLabels(
				entryId,
				this.getScrobblerLabels(scrobblerIds)
			);
		}

		updateView(songCount) {
			const hasUnscrobbledSongs = songCount > 0;

			if (hasUnscrobbledSongs) {
				this.view.setDefaultDescription();
			} else {
				this.view.setDescriptionNoSongs();
			}

			this.view.setGlobalControlsEnabled(hasUnscrobbledSongs);
		}
	}

	return StoragePresenter;
});
