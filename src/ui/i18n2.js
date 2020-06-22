'use strict';

import { i18n } from 'webextension-polyfill';

/**
 * Return a translation string by a given string ID.
 *
 * @param {String} stringId String ID
 * @param {Array} args List of substitutions
 *
 * @return {String} Translated string
 */
export function L(stringId, ...args) {
	return i18n.getMessage(stringId, [...args]) || stringId;
}
