<template>
	<aside
		ref="channellist"
		class="channellist"
		:aria-label="'Lista kanałów'"
		@mouseleave="removeHoverChannel"
	>
		<div class="count">
			<input
				ref="input"
				:value="channelSearchInput"
				:placeholder="'Szukaj kanału...'"
				type="search"
				class="chanelsearch"
				aria-label="Szukaj kanału"
				tabindex="-1"
				@input="setChannelSearchInput"
			/>
		</div>
		<div class="channels">
			<div class="channels">
				<div>
					<span v-if="channels.length === 0"> Ładowanie listy kanałów... </span>
					<div
						v-else-if="channels && network.status && network.status.connected"
						class="channel-list"
					>
						<span v-for="chan in channels" :key="chan.channel" class="channel-item">
							<ParsedMessage :network="network" :text="chan.channel" />
							( {{ chan.num_users }} )
						</span>
					</div>
				</div>
			</div>
		</div>
	</aside>
</template>
<script lang="ts">
import {defineComponent, PropType, ref, computed, onMounted, onUnmounted, watch} from "vue";
import {useStore} from "vuex";
import {ClientChan, ClientNetwork} from "../../js/types";
import ParsedMessage from "./ParsedMessage.vue";

export default defineComponent({
	name: "ListChannels",
	components: {
		ParsedMessage,
	},
	props: {
		network: {type: Object as PropType<ClientNetwork>, required: true},
		channel: {type: Object as PropType<ClientChan>, required: true},
	},
	setup(props) {
		const refreshKey = ref(0);
		let refreshInterval: number | null = null;

		const channels = ref(props.network.allChannels);

		watch(
			() => props.network.allChannels,
			(newChannels) => {
				channels.value = newChannels; // ✅ Aktualizacja `channels`
			},
			{deep: true}
		);
		// Funkcja odświeżająca komponent
		const refreshTemplate = () => {
			refreshKey.value++;
		};

		// Uruchamiamy odświeżanie co 5 sekund
		onMounted(() => {
			refreshInterval = setInterval(refreshTemplate, 5000);
		});

		// Czyszczenie interwału po usunięciu komponentu
		onUnmounted(() => {
			if (refreshInterval) {
				clearInterval(refreshInterval);
			}
		});

		return {channels, refreshKey};
	},
});
</script>
<style scoped>
.channel-tiem:hover {
	background: #40444b;
}

.channel-tiem.active {
	background: #5865f2;
}
</style>
