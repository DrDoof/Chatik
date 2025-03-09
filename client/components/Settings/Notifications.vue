<template>
	<div>
		<template v-if="!store.state.serverConfiguration?.public">
			<h2>Powiadomienia push</h2>
			<div>
				<button
					id="pushNotifications"
					type="button"
					class="btn"
					:disabled="
						store.state.pushNotificationState !== 'supported' &&
						store.state.pushNotificationState !== 'subscribed'
					"
					@click="onPushButtonClick"
				>
					<template v-if="store.state.pushNotificationState === 'subscribed'">
						Anuluj subskrypcję powiadomień push
					</template>
					<template v-else-if="store.state.pushNotificationState === 'loading'">
						Ładowanie…
					</template>
					<template v-else> Zasubskrybuj powiadomienia push </template>
				</button>
				<div v-if="store.state.pushNotificationState === 'nohttps'" class="error">
					<strong>Ostrzeżenie</strong>: Powiadomienia push są obsługiwane tylko przez połączenia HTTPS.
				</div>
				<div v-if="store.state.pushNotificationState === 'unsupported'" class="error">
					<strong>Ostrzeżenie</strong>:
					<span>Twoja przeglądarka nie obsługuje powiadomień push.</span>
				</div>
			</div>
		</template>

		<h2>Powiadomienia przeglądarki</h2>
		<div>
			<label class="opt">
				<input
					id="desktopNotifications"
					:checked="store.state.settings.desktopNotifications"
					:disabled="store.state.desktopNotificationState === 'nohttps'"
					type="checkbox"
					name="desktopNotifications"
				/>
				Włącz powiadomienia przeglądarki<br />
				<div v-if="store.state.desktopNotificationState === 'unsupported'" class="error">
					<strong>Ostrzeżenie</strong>: Twoja przeglądarka nie obsługuje powiadomień.
				</div>
				<div
					v-if="store.state.desktopNotificationState === 'nohttps'"
					id="warnBlockedDesktopNotifications"
					class="error"
				>
					<strong>Ostrzeżenie</strong>: Powiadomienia są obsługiwane tylko przez połączenia HTTPS.
				</div>
				<div
					v-if="store.state.desktopNotificationState === 'blocked'"
					id="warnBlockedDesktopNotifications"
					class="error"
				>
					<strong>Ostrzeżenie</strong>: Powiadomienia są zablokowane przez Twoją przeglądarkę.
				</div>
			</label>
		</div>
		<div>
			<label class="opt">
				<input
					:checked="store.state.settings.notification"
					type="checkbox"
					name="notification"
				/>
				Włącz dźwięk powiadomień
			</label>
		</div>
		<div>
			<div class="opt">
				<button id="play" @click.prevent="playNotification">Odtwórz dźwięk</button>
			</div>
		</div>

		<div>
			<label class="opt">
				<input
					:checked="store.state.settings.notifyAllMessages"
					type="checkbox"
					name="notifyAllMessages"
				/>
				Włącz powiadomienia dla wszystkich wiadomości
			</label>
		</div>

		<div v-if="!store.state.serverConfiguration?.public">
			<label class="opt">
				<label for="highlights" class="opt">
					Własne wyróżnienia
					<span
						class="tooltipped tooltipped-n tooltipped-no-delay"
						aria-label="Jeśli wiadomość zawiera którykolwiek z tych wyrażeń oddzielonych przecinkami, zostanie wyróżniona."
					>
						<button class="extra-help" />
					</span>
				</label>
				<input
					id="highlights"
					:value="store.state.settings.highlights"
					type="text"
					name="highlights"
					class="input"
					autocomplete="off"
					placeholder="Oddzielone przecinkami, np.: słowo, więcej słów, inne słowo"
				/>
			</label>
		</div>

		<div v-if="!store.state.serverConfiguration?.public">
			<label class="opt">
				<label for="highlightExceptions" class="opt">
					Wyjścia wyróżnień
					<span
						class="tooltipped tooltipped-n tooltipped-no-delay"
						aria-label="Jeśli wiadomość zawiera któreś z tych wyrażeń oddzielonych przecinkami, nie zostanie wyróżniona, nawet jeśli zawiera Twój pseudonim lub wyrażenia zdefiniowane w niestandardowych wyróżnieniach."
					>
						<button class="extra-help" />
					</span>
				</label>
				<input
					id="highlightExceptions"
					:value="store.state.settings.highlightExceptions"
					type="text"
					name="highlightExceptions"
					class="input"
					autocomplete="off"
					placeholder="Oddzielone przecinkami, np.: słowo, więcej słów, inne słowo"
				/>
			</label>
		</div>
	</div>
</template>

<script lang="ts">
import {computed, defineComponent} from "vue";
import {useStore} from "../../js/store";
import webpush from "../../js/webpush";

export default defineComponent({
	name: "NotificationSettings",
	setup() {
		const store = useStore();

		const isIOS = computed(
			() =>
				[
					"iPad Simulator",
					"iPhone Simulator",
					"iPod Simulator",
					"iPad",
					"iPhone",
					"iPod",
				].includes(navigator.platform) ||
				// iPad on iOS 13 detection
				(navigator.userAgent.includes("Mac") && "ontouchend" in document)
		);

		const playNotification = () => {
			const pop = new Audio();
			pop.src = "audio/pop.wav";

			// eslint-disable-next-line
			pop.play();
		};

		const onPushButtonClick = () => {
			webpush.togglePushSubscription();
		};

		return {
			isIOS,
			store,
			playNotification,
			onPushButtonClick,
		};
	},
});
</script>
