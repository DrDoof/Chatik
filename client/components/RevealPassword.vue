<template>
	<div>
		<slot :is-visible="isVisible" />
		<span
			ref="revealButton"
			type="button"
			:class="[
				'reveal-password tooltipped tooltipped-n tooltipped-no-delay',
				{'reveal-password-visible': isVisible},
			]"
			:aria-label="isVisible ? 'Ukryj hasło' : 'Pokaż hasło'"
			@click="onClick"
		>
			<span :aria-label="isVisible ? 'Ukryj hasło' : 'Pokaż hasło'" />
		</span>
	</div>
</template>

<script lang="ts">
import {defineComponent, ref} from "vue";

export default defineComponent({
	name: "RevealPassword",
	setup() {
		const isVisible = ref(false);

		const onClick = () => {
			isVisible.value = !isVisible.value;
		};

		return {
			isVisible,
			onClick,
		};
	},
});
</script>
