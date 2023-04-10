/**
 * 	Check that app links, i.e redirect url, does not lead to unauthorized path
 * @param url
 * @returns The url if valid, else change to "/notes"
 */
export const validateAppUrl = (url: string) => {
	let appUrls = ['/notes', '/'];
	if (appUrls.includes(url)) {
		return url;
	}
	return '/notes';
};

export function isKeyOfObject<T extends object>(key: string | number | symbol, obj: T): key is keyof T {
	return key in obj;
}

/**
 * Convert the language used in markdown codeblock to corresponding languages in Prism Syntax Highligher
 * https://github.com/react-syntax-highlighter/react-syntax-highlighter/blob/master/AVAILABLE_LANGUAGES_PRISM.MD
 * @param markdownLanguage
 */
export const getPrismLanguage = (markdownLanguage: string) => {
	const mapping = {
		js: 'javascript',
		html: 'cshtml',
		ts: 'typescript',
	};

	if (isKeyOfObject(markdownLanguage, mapping)) {
		return mapping[markdownLanguage];
	}

	// For cases that haven't been covered, the markdown language and the Prism language should match
	return markdownLanguage || 'text';
};
