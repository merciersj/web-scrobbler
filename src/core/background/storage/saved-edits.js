'use strict';

define((require) => {
	const BrowserStorage = require('storage/browser-storage');
	const SavedEditsModel = require('storage/saved-edits.model');

	class SavedEditsImpl extends SavedEditsModel {
		constructor() {
			super();

			this.songInfoStorage = BrowserStorage.getStorage(
				BrowserStorage.LOCAL_CACHE
			);
			/* @ifdef DEBUG */
			this.songInfoStorage.debugLog();
			/* @endif */
		}

		/** @override */
		async clear() {
			return await this.songInfoStorage.clear();
		}

		/** @override */
		async getDataFromStorage() {
			return await this.songInfoStorage.get();
		}

		/** @override */
		async saveDataToStorage(data) {
			return await this.songInfoStorage.set(data);
		}

		/** @override */
		async updateDataInStorage(data) {
			return await this.songInfoStorage.update(data);
		}
	}

	return new SavedEditsImpl();
});
