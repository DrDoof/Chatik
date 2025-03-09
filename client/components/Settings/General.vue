<template>
	<div>
		<div v-if="canRegisterProtocol || hasInstallPromptEvent">
			<h2>Aplikacja natywna</h2>
			<button
				v-if="hasInstallPromptEvent"
				type="button"
				class="btn"
				@click.prevent="nativeInstallPrompt"
			>
				Dodaj Chatika do ekranu startowego
			</button>
			<button
				v-if="canRegisterProtocol"
				type="button"
				class="btn"
				@click.prevent="registerProtocol"
			>
				Open irc:// URLs with The Lounge
			</button>
		</div>
		<div v-if="store.state.serverConfiguration?.fileUpload">
			<h2>Wgrywanie plików</h2>
			<div>
				<label class="opt">
					<input
						:checked="store.state.settings.uploadCanvas"
						type="checkbox"
						name="uploadCanvas"
					/>
					Próbuj usuać metadane pliku przed załadowaniem
					<span
						class="tooltipped tooltipped-n tooltipped-no-delay"
						aria-label="To ustawienie renderuje obraz w elemencie canvas, aby usunąć metadane z pliku.
	Może to jednak spowodować problemy z orientacją obrazu, jeśli przeglądarka nie obsługuje tej funkcji."
					>
						<button class="extra-help" />
					</span>
				</label>
			</div>
		</div>
		<div v-if="!store.state.serverConfiguration?.public">
			<h2>Synchronizacja ustawień</h2>
			<label class="opt">
				<input
					:checked="store.state.settings.syncSettings"
					type="checkbox"
					name="syncSettings"
				/>
				Synchronizuj ustawienia z innymi klientami
			</label>
			<template v-if="!store.state.settings.syncSettings">
				<div v-if="store.state.serverHasSettings" class="settings-sync-panel">
					<p>
						<strong>Warning:</strong> Zaznaczenie tego pola spowoduje zastąpienie ustawień 
						tego klienta tymi zapisanymi na serwerze.
					</p>
					<p>
						Użyj poniższego przycisku, aby włączyć synchronizację i zastąpić wszystkie 
						ustawienia już zsynchronizowane z serwerem.
					</p>
					<button type="button" class="btn btn-small" @click="onForceSyncClick">
						Włącz i synchonizuj ustawienia
					</button>
				</div>
				<div v-else class="settings-sync-panel">
					<p>
						<strong>Uwaga:</strong> Nie zsynchronizowano jeszcze żadnych ustawień. Włączenie tej opcji spowoduje zsynchronizowanie wszystkich ustawień tego klienta jako bazowych dla innych klientów.
					</p>
				</div>
			</template>
		</div>
		<div v-if="!store.state.serverConfiguration?.public">
			<h2>Automatyczna wiadomość o nieobecności</h2>

			<label class="opt">
				<label for="awayMessage" class="sr-only">Automatyczna wiadomość o nieobecności</label>
				<input
					id="awayMessage"
					:value="store.state.settings.awayMessage"
					type="text"
					name="awayMessage"
					class="input"
					placeholder="Automatyczna wiadomość, gdy Chatik nie jest otwarty"
				/>
			</label>
		</div>
	</div>
</template>

<style></style>

<script lang="ts">
import {computed, defineComponent, onMounted, ref} from "vue";
import {useStore} from "../../js/store";
import {BeforeInstallPromptEvent} from "../../js/types";

let installPromptEvent: BeforeInstallPromptEvent | null = null;

window.addEventListener("beforeinstallprompt", (e) => {
	e.preventDefault();
	installPromptEvent = e as BeforeInstallPromptEvent;
});

export default defineComponent({
	name: "GeneralSettings",
	setup() {
		const store = useStore();
		const canRegisterProtocol = ref(false);

		const hasInstallPromptEvent = computed(() => {
			// TODO: This doesn't hide the button after clicking
			return installPromptEvent !== null;
		});

		onMounted(() => {
			// Enable protocol handler registration if supported,
			// and the network configuration is not locked
			canRegisterProtocol.value =
				!!window.navigator.registerProtocolHandler &&
				!store.state.serverConfiguration?.lockNetwork;
		});

		const nativeInstallPrompt = () => {
			if (!installPromptEvent) {
				return;
			}

			installPromptEvent.prompt().catch((e) => {
				// eslint-disable-next-line no-console
				console.error(e);
			});

			installPromptEvent = null;
		};

		const onForceSyncClick = () => {
			store.dispatch("settings/syncAll", true).catch((e) => {
				// eslint-disable-next-line no-console
				console.error(e);
			});

			store
				.dispatch("settings/update", {
					name: "syncSettings",
					value: true,
					sync: true,
				})
				.catch((e) => {
					// eslint-disable-next-line no-console
					console.error(e);
				});
		};

		const registerProtocol = () => {
			const uri = document.location.origin + document.location.pathname + "?uri=%s";
			// @ts-expect-error
			// the third argument is deprecated but recommended for compatibility: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/registerProtocolHandler
			window.navigator.registerProtocolHandler("irc", uri, "The Lounge");
			// @ts-expect-error
			window.navigator.registerProtocolHandler("ircs", uri, "The Lounge");
		};

		return {
			store,
			canRegisterProtocol,
			hasInstallPromptEvent,
			nativeInstallPrompt,
			onForceSyncClick,
			registerProtocol,
		};
	},
});
</script>
