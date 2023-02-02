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
