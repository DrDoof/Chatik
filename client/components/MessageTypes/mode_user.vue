<template>
	<span class="content">
		Twój tryb użytkownika to <b>{{ message.raw_modes }}</b>
	</span>
</template>

<script lang="ts">
import {defineComponent, PropType} from "vue";
import {ClientNetwork, ClientMessage} from "../../js/types";

export default defineComponent({
	name: "MessageChannelMode",
	props: {
		network: {
			type: Object as PropType<ClientNetwork>,
			required: true,
		},
		message: {
			type: Object as PropType<ClientMessage>,
			required: true,
		},
	},
});
</script>
