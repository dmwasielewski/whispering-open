import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import * as Y from 'yjs';
import { attachBroadcastChannel } from './attach-broadcast-channel.js';

const originalBroadcastChannel = globalThis.BroadcastChannel;

class FakeBroadcastChannel {
	static names: string[] = [];
	static posted: unknown[] = [];
	static instances: FakeBroadcastChannel[] = [];
	onmessage: ((event: MessageEvent) => void) | null = null;

	constructor(public name: string) {
		FakeBroadcastChannel.names.push(name);
		FakeBroadcastChannel.instances.push(this);
	}

	postMessage(message: unknown): void {
		FakeBroadcastChannel.posted.push(message);
	}

	close(): void {}
}

describe('attachBroadcastChannel', () => {
	beforeEach(() => {
		FakeBroadcastChannel.names = [];
		FakeBroadcastChannel.posted = [];
		FakeBroadcastChannel.instances = [];
		Object.assign(globalThis, {
			BroadcastChannel:
				FakeBroadcastChannel as unknown as typeof BroadcastChannel,
		});
	});

	afterEach(() => {
		Object.assign(globalThis, { BroadcastChannel: originalBroadcastChannel });
	});

	test('defaults to ydoc.guid as the local channel key', () => {
		const ydoc = new Y.Doc({ guid: 'epicenter.fuji' });

		attachBroadcastChannel(ydoc);

		expect(FakeBroadcastChannel.names).toEqual(['yjs.epicenter.fuji']);
		ydoc.destroy();
	});

	test('does not rebroadcast updates received from BroadcastChannel', () => {
		const ydoc = new Y.Doc({ guid: 'epicenter.fuji' });

		attachBroadcastChannel(ydoc);
		const initialUpdate = Y.encodeStateAsUpdateV2(ydoc);
		FakeBroadcastChannel.instances[0]?.onmessage?.(
			new MessageEvent('message', { data: initialUpdate }),
		);

		expect(FakeBroadcastChannel.posted).toEqual([]);
		ydoc.destroy();
	});
});
