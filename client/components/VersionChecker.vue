<template>
	<div id="version-checker" :class="[store.state.versionStatus]">
		<p v-if="store.state.versionStatus === 'loading'">Sprawdzanie aktualizacji…</p>
		<p v-if="store.state.versionStatus === 'new-version'">
			Chatik <b>{{ store.state.versionData?.latest.version }}</b>
			<template v-if="store.state.versionData?.latest.prerelease"> (pre-release) </template>
			jest teraz dostępna.
			<br />

			<a :href="store.state.versionData?.latest.url" target="_blank" rel="noopener">
				Przeczytaj więcej na GitHub
			</a>
		</p>
		<p v-if="store.state.versionStatus === 'new-packages'">
			Chatik jest aktualny, ale istnieją nieaktualne pakiety Uruchom
			<code>thelounge upgrade</code> na serwerze, aby zaktualizować pakiety.
		</p>
		<template v-if="store.state.versionStatus === 'up-to-date'">
			<p>Chatik jest aktualny!</p>

			<button
				v-if="store.state.versionDataExpired"
				id="check-now"
				class="btn btn-small"
				@click="checkNow"
			>
				Sprawdź teraz
			</button>
		</template>
		<template v-if="store.state.versionStatus === 'error'">
			<p>Nie udało się pobrać informacji o najnowszym wydaniu.</p>

			<button id="check-now" class="btn btn-small" @click="checkNow">Spróbuj ponownie</button>
		</template>
	</div>
</template>

<script lang="ts">
import {defineComponent, onMounted} from "vue";
import socket from "../js/socket";
import {useStore} from "../js/store";

export default defineComponent({
	name: "VersionChecker",
	setup() {
		const store = useStore();

		const checkNow = () => {
			store.commit("versionData", null);
			store.commit("versionStatus", "loading");
			socket.emit("changelog");
		};

		onMounted(() => {
			if (!store.state.versionData) {
				checkNow();
			}
		});

		return {
			store,
			checkNow,
		};
	},
});
</script>
