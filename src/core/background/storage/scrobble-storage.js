'use strict';

define((require) => {
	const BrowserStorage = require('storage/browser-storage');
	const ScrobbleStorageModel = require('storage/scrobble-storage.model');

	class ScrobbleStorageImpl extends ScrobbleStorageModel {
		/** @override */
		constructor() {
			super();

			this.storage = BrowserStorage.getStorage(
				BrowserStorage.SCROBBLE_STORAGE
			);
			/* @ifdef DEBUG */
			this.storage.debugLog();
			/* @endif */
		}

		/** @override */
		async clear() {
			await this.storage.clear();
		}

		/** @override */
		async getData() {
			return this.storage.get();
		}

		/** @override */
		async saveData(data) {
			await this.storage.set(data);
		}
	}

	return new ScrobbleStorageImpl();
});
