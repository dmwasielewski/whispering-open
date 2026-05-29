import { rpc } from '$lib/query';
import {
	getSelectedTranscriptionService,
	isTranscriptionServiceConfigured,
} from '$lib/settings/transcription-validation';
import { TRANSCRIPTION_SERVICES } from '$lib/services/transcription/registry';
import { settings } from '$lib/state/settings.svelte';

/**
 * Checks if the user has configured the necessary API keys/settings for their selected transcription service.
 * If the selected service has no model but another service does, silently switches to the configured one.
 * Shows an onboarding toast only if truly nothing is configured.
 */
export function registerOnboarding() {
	const selectedService = getSelectedTranscriptionService();

	if (!selectedService || !isTranscriptionServiceConfigured(selectedService)) {
		// Try to find any already-configured service and switch to it silently
		const configured = TRANSCRIPTION_SERVICES.find((s) =>
			isTranscriptionServiceConfigured(s),
		);
		if (configured) {
			settings.set('transcription.service', configured.id);
			return;
		}

		// Truly nothing configured — show welcome once (no persist)
		rpc.notify.info({
			title: 'Welcome to Whispering Open!',
			description: selectedService
				? `Please configure your ${selectedService.name} model file to get started.`
				: 'Please select a transcription service to get started.',
			action: {
				type: 'link',
				label: 'Configure',
				href: '/settings/transcription',
			},
		});
	}
}
