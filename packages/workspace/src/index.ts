/**
 * Browser-safe workspace surface used by Whispering Open.
 *
 * Keep this root barrel narrow during extraction. Exporting cloud sync,
 * daemon, auth, encryption, or server helpers from here pulls their dependency
 * chains into the app even when Whispering Open does not import them.
 */
export { DateTimeString } from './shared/datetime-string';

export {
	createDisposableCache,
	type DisposableCache,
} from './cache/disposable-cache.js';

export { attachBroadcastChannel } from './document/attach-broadcast-channel.js';
export { attachIndexedDb } from './document/attach-indexed-db.js';
export {
	attachKv,
	type InferKvValue,
	type Kv,
	type KvDefinitions,
} from './document/attach-kv.js';
export {
	attachTable,
	attachTables,
	type BaseRow,
	type InferTableRow,
	type Table,
	type Tables,
} from './document/attach-table.js';
export { defineKv } from './document/define-kv.js';
export { defineTable } from './document/define-table.js';
