<script lang="ts">
	import * as Field from '$lib/ui/field';
	import { Input } from '$lib/ui/input';
	import { Link } from '$lib/ui/link';
	import { deviceConfig } from '$lib/state/device-config.svelte';
</script>

<Field.Field>
	<Field.Label for="openrouter-api-key">OpenRouter API Key</Field.Label>
	<Input
		id="openrouter-api-key"
		type="password"
		placeholder="Your OpenRouter API Key"
		autocomplete="off"
		bind:value={() => deviceConfig.get('apiKeys.openrouter'),
			(value) => deviceConfig.set('apiKeys.openrouter', value)}
	/>
	<Field.Description>
		You can find your OpenRouter API key in your <Link
			href="https://openrouter.ai/keys"
			target="_blank"
			rel="noopener noreferrer"
		>
			OpenRouter dashboard
		</Link>
		.
	</Field.Description>
</Field.Field>
