<script lang="ts">
	import * as Field from '@whispering-open/ui/field';
	import { Input } from '@whispering-open/ui/input';
	import { Link } from '@whispering-open/ui/link';
	import { deviceConfig } from '$lib/state/device-config.svelte';
</script>

<Field.Field>
	<Field.Label for="deepgram-api-key">Deepgram API Key</Field.Label>
	<Input
		id="deepgram-api-key"
		type="password"
		placeholder="Your Deepgram API Key"
		autocomplete="off"
		bind:value={() => deviceConfig.get('apiKeys.deepgram'),
			(value) => deviceConfig.set('apiKeys.deepgram', value)}
	/>
	<Field.Description>
		You can find your API key in your <Link
			href="https://console.deepgram.com/project"
			target="_blank"
			rel="noopener noreferrer"
		>
			Deepgram Console
		</Link>
		. Make sure you have <Link
			href="https://console.deepgram.com/billing"
			target="_blank"
			rel="noopener noreferrer"
		>
			credits
		</Link>
		available.
	</Field.Description>
</Field.Field>
