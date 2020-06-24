'use strict';

/**
 * This class provides a base interface for custom storage wrappers.
 */
class CustomStorage {
	/**
	 * Remove all data from the storage.
	 */
	async clear() {
		throw new Error('This function must be overridden!');
	}

	/**
	 * Return data from the storage.
	 *
	 * @return {Object} Storage data
	 */
	async getDataFromStorage() {
		throw new Error('This function must be overridden!');
	}

	/**
	 * Overwrite a given data to the storage.
	 *
	 * @param {Object} data Data to save
	 * @return {Object} Storage data
	 */
	// eslint-disable-next-line no-unused-vars
	async saveDataToStorage(data) {
		throw new Error('This function must be overridden!');
	}

	/**
	 * Append a given data in the storage.
	 *
	 * @param {Object} data Data to save
	 * @return {Object} Storage data
	 */
	// eslint-disable-next-line no-unused-vars
	async updateDataInStorage(data) {
		throw new Error('This function must be overridden!');
	}
}

define(() => CustomStorage);
