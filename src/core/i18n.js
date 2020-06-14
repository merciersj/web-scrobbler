'use strict';

/**
 * Node attributes that define how node content will be localized.
 *
 * There're following supported attributes:
 *  - data-i18n: replace value of `textContent` property by localized text;
 *  - data-i18n-title: replace value of `title` attribute by localized text;
 *  - data-i18n-placeholder: replace value of `placeholder` attribute by localized text.
 *
 * @type {Array}
 */
const i18nAttrs = ['data-i18n', 'data-i18n-title', 'data-i18n-placeholder'];
const i18nArgumentAttrs = [
	'data-i18n-arg',
	'data-i18n-title-arg',
	'data-i18n-placeholder-arg',
];

const maxArgumentsCount = 9;

const domParser = new DOMParser();

/**
 * Localize all nodes.
 */
function localizeDocument() {
	// Localize static nodes
	localizeNodeRecursively(document);

	// Localize dynamic nodes
	new MutationObserver(onDocumentChange).observe(document.body, {
		attributes: true,
		childList: true,
		subtree: true,
	});
}

/**
 * Called when document is changed.
 *
 * @param  {Array} mutations Array of MutationRecords
 */
function onDocumentChange(mutations) {
	for (const mutation of mutations) {
		switch (mutation.type) {
			case 'attributes': {
				const { attributeName, target } = mutation;

				let isI18nArgumentChanged = i18nAttrs.includes(attributeName);
				if (!isI18nArgumentChanged) {
					for (const i18nAttribute of i18nArgumentAttrs) {
						if (attributeName.startsWith(i18nAttribute)) {
							isI18nArgumentChanged = true;
						}
					}
				}

				if (isI18nArgumentChanged) {
					localizeNodeRecursively(target);
				}

				break;
			}

			case 'childList': {
				for (const node of mutation.addedNodes) {
					localizeNodeRecursively(node);
				}
			}
		}
	}
}

/**
 * Localize given element.
 * @param  {Object} element Element to localize
 */
function localizeElement(element) {
	if (!(element instanceof Element)) {
		return;
	}

	for (const attr of i18nAttrs) {
		if (!element.hasAttribute(attr)) {
			continue;
		}

		const tag = element.getAttribute(attr);
		const args = getArgumentsFromElement(element, attr);
		const text = chrome.i18n.getMessage(tag, args) || tag;

		switch (attr) {
			case 'data-i18n':
				if (hasHtmlTags(text)) {
					const nodes = makeNodes(text);
					if (nodes) {
						nodes.forEach((n) => {
							element.append(n);
						});
					} else {
						// Fallback
						element.textContent = text;
					}
				} else {
					element.textContent = text;
				}
				break;

			case 'data-i18n-title':
				element.setAttribute('title', text);
				break;

			case 'data-i18n-placeholder':
				element.setAttribute('placeholder', text);
				break;
		}
	}
}

/**
 * Return a list of placeholder arguments from a given element.
 *
 * @param {Element} element Element
 * @param {String} i18nAttr I18n attribute
 * @return {Array} List of placeholder arguments
 */
function getArgumentsFromElement(element, i18nAttr) {
	const i18nAruments = [];

	for (let i = 0; i < maxArgumentsCount; i++) {
		const attributeName = `${i18nAttr}-arg${i}`;
		const attributeValue = element.getAttribute(attributeName);

		if (!attributeValue) {
			break;
		}

		i18nAruments.push(attributeValue);
	}

	return i18nAruments;
}

/**
 * Localize a given node and its children.
 * @param  {Object} node Node to localize
 */
function localizeNodeRecursively(node) {
	localizeElement(node);

	switch (node.nodeType) {
		case Node.ELEMENT_NODE:
		case Node.DOCUMENT_NODE:
			for (const attr of i18nAttrs) {
				const nodes = node.querySelectorAll(`[${attr}]`);
				nodes.forEach(localizeElement);
			}
			break;
	}
}

/**
 * Create array of nodes which can be applied to node to be translated.
 * @param  {String} rawHtml String contains HTML code
 * @return {Array} Array of nodes from given text
 */
function makeNodes(rawHtml) {
	const body = domParser.parseFromString(rawHtml, 'text/html').body;
	return [...body.childNodes].filter((a) => {
		return a.nodeType === a.TEXT_NODE || a.tagName === 'A';
	});
}

/**
 * Check if given text contains HTML tags
 * @param  {String} text String supposed to have HTML tags
 * @return {Boolean} Check result
 */
function hasHtmlTags(text) {
	return /<.+?>/.test(text);
}

document.addEventListener('DOMContentLoaded', localizeDocument);
