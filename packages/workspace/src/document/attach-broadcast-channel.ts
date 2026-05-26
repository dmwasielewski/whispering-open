import * as Y from 'yjs';

const BC_ORIGIN = Symbol.for('@whispering-open/workspace/bc-origin');
const BROADCAST_CHANNEL_ORIGINS: readonly unknown[] = [BC_ORIGIN];

function isBroadcastChannelOrigin(origin: unknown): boolean {
	return BROADCAST_CHANNEL_ORIGINS.includes(origin);
}

/**
 * Local-only BroadcastChannel cross-tab sync for a Yjs document.
 *
 * Broadcasts every local `updateV2` to same-origin tabs and applies incoming
 * updates from other tabs. Defaults the channel key to `ydoc.guid` so only
 * docs for the same local workspace communicate. Callers can pass a custom
 * key when they need stricter isolation between local document instances.
 *
 * Skips re-broadcasting updates that arrived from BroadcastChannel itself.
 * Without that guard, delivered updates would be re-broadcast to other tabs,
 * and those tabs would re-send them.
 *
 * No-ops gracefully when `BroadcastChannel` is unavailable (Node.js, SSR,
 * older browsers).
 */
export function attachBroadcastChannel(
	ydoc: Y.Doc,
	channelKey: string = ydoc.guid,
): void {
	if (typeof BroadcastChannel === 'undefined') {
		return;
	}

	const channel = new BroadcastChannel(`yjs.${channelKey}`);

	const handleUpdate = (update: Uint8Array, origin: unknown) => {
		if (isBroadcastChannelOrigin(origin)) return;
		channel.postMessage(update);
	};
	ydoc.on('updateV2', handleUpdate);

	channel.onmessage = (event: MessageEvent) => {
		Y.applyUpdateV2(ydoc, new Uint8Array(event.data), BC_ORIGIN);
	};

	ydoc.once('destroy', () => {
		ydoc.off('updateV2', handleUpdate);
		channel.close();
	});
}
