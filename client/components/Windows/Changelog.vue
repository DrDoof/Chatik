<template>
	<div id="changelog" class="window" aria-label="Dziennik zmian">
		<div class="header">
			<SidebarToggle />
		</div>
		<div class="container">
			<router-link id="back-to-help" to="/help">« Pomoc</router-link>

			<template
				v-if="store.state.versionData?.current && store.state.versionData?.current.version"
			>
				<h1 class="title">
				Informacje o wydaniu dla wersji {{ store.state.versionData.current.version }}
				</h1>

				<template v-if="store.state.versionData.current.changelog">
					<h3>Wprowadzenie</h3>
					<div
						ref="changelog"
						class="changelog-text"
						v-html="store.state.versionData.current.changelog"
					></div>
				</template>
				<template v-else>
					<p>Nie można pobrać dziennika zmian dla tej wersji z GitHub.</p>
					<p>
						<a
							v-if="store.state.serverConfiguration?.version"
							:href="`https://github.com/thelounge/thelounge/releases/tag/v${store.state.serverConfiguration?.version}`"
							target="_blank"
							rel="noopener"
							>Zobacz informacje o wydaniu tej wersji na GitHub</a
						>
					</p>
				</template>
			</template>
			<p v-else>Ładowanie dziennika zmian…</p>
		</div>
	</div>
</template>

<script lang="ts">
import {defineComponent, onMounted, onUpdated, ref} from "vue";
import socket from "../../js/socket";
import {useStore} from "../../js/store";
import SidebarToggle from "../SidebarToggle.vue";

export default defineComponent({
	name: "Changelog",
	components: {
		SidebarToggle,
	},
	setup() {
		const store = useStore();
		const changelog = ref<HTMLDivElement | null>(null);

		const patchChangelog = () => {
			if (!changelog.value) {
				return;
			}

			const links = changelog.value.querySelectorAll("a");

			links.forEach((link) => {
				// Make sure all links will open a new tab instead of exiting the application
				link.setAttribute("target", "_blank");
				link.setAttribute("rel", "noopener");

				if (link.querySelector("img")) {
					// Add required metadata to image links, to support built-in image viewer
					link.classList.add("toggle-thumbnail");
				}
			});
		};

		onMounted(() => {
			if (!store.state.versionData) {
				socket.emit("changelog");
			}

			patchChangelog();
		});

		onUpdated(() => {
			patchChangelog();
		});

		return {
			store,
		};
	},
});
</script>
