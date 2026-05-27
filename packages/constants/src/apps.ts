/**
 * Vite/Tauri URL metadata retained for Whispering Open during extraction.
 */

export const APPS = {
	AUDIO: {
		port: 1420,
		urls: ['https://github.com/dmwasielewski/whispering-open'],
	},
} as const;

export type AppId = keyof typeof APPS;

/**
 * Local dev URL for an app, derived from its `port`. Single owner for the
 * `http://localhost:<port>` shape: CORS trusted origins, the API runtime's
 * dev classifier, and the OAuth seed all read this.
 */
export function localUrl(app: { port: number }): string {
	return `http://localhost:${app.port}`;
}
