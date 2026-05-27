/**
 * URL and pathname constants for the Whispering Open application
 */
export const WHISPERING_URL =
	import.meta.env.MODE === 'production'
		? 'https://github.com/dmwasielewski/whispering-open'
		: 'http://localhost:1420';

export const WHISPERING_URL_WILDCARD = `${WHISPERING_URL}/*` as const;

export const WHISPERING_RECORDINGS_PATHNAME = '/recordings' as const;

export const WHISPERING_SETTINGS_PATHNAME = '/settings' as const;
