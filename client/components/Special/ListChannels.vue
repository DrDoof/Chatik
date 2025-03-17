<template>
	<span v-if="channel.data.text">{{ channel.data.text }}</span>
	<table v-else class="channel-list">
		<thead>
			<tr>
				<th class="channel">Kanał</th>
				<th class="users">Użytkownicy</th>
				<th class="topic">Temat</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="chan in channel.data" :key="chan.channel">
				<td class="channel"><ParsedMessage :network="network" :text="chan.channel" /></td>
				<td class="users">{{ chan.num_users }}</td>
				<td class="topic"><ParsedMessage :network="network" :text="chan.topic" /></td>
			</tr>
		</tbody>
	</table>
</template>

<script lang="ts">
import {defineComponent, PropType, ref, onMounted, onUnmounted} from "vue";
import {ClientChan, ClientNetwork} from "../../js/types";
import ParsedMessage from "../ParsedMessage.vue";

export default defineComponent({
	name: "ListChannels",
	components: {
		ParsedMessage,
	},
	props: {
		network: {type: Object as PropType<ClientNetwork>, required: true},
		channel: {type: Object as PropType<ClientChan>, required: true},
	},
	setup() {
		const refreshKey = ref(0);
		let refreshInterval: number | null = null;

		// Funkcja odświeżająca komponent
		const refreshTemplate = () => {
			refreshKey.value++;
		};

		// Uruchamiamy odświeżanie co 5 sekund
		onMounted(() => {
			refreshInterval = setInterval(refreshTemplate, 60000);
		});

		// Czyszczenie interwału po usunięciu komponentu
		onUnmounted(() => {
			if (refreshInterval) {
				clearInterval(refreshInterval);
			}
		});

		return {refreshKey};
	},
});
</script>
