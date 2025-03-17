<template>
	<span class="content">
		<ParsedMessage :network="network" :message="message" :text="errorMessage" />
	</span>
</template>

<script lang="ts">
import ParsedMessage from "../ParsedMessage.vue";
import {computed, defineComponent, PropType} from "vue";
import {ClientNetwork, ClientMessage} from "../../js/types";

export default defineComponent({
	name: "MessageTypeError",
	components: {
		ParsedMessage,
	},
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
	setup(props) {
		const errorMessage = computed(() => {
			// TODO: enforce chan and nick fields so that we can get rid of that
			const chan = props.message.channel || "!UNKNOWN_CHAN";
			const nick = props.message.nick || "!UNKNOWN_NICK";

			switch (props.message.error) {
				case "bad_channel_key":
					return `Nie można dołączyć do ${chan} - Niepoprawny klucz kanału.`;
				case "banned_from_channel":
					return `Nie można dołączyć do ${chan} - Zostałeś zbanowany na tym kanale.`;
				case "cannot_send_to_channel":
					return `Nie można wysyłać wiadomości na kanał ${chan}`;
				case "channel_is_full":
					return `Nie można dołączyć do ${chan} - Kanał jest pełny.`;
				case "chanop_privs_needed":
					return "Nie można wykonać akcji: Nie jesteś operatorem kanału.";
				case "invite_only_channel":
					return `Nie można dołączyć do ${chan} - Kanał wymaga zaproszenia.`;
				case "no_such_nick":
					return `Użytkownik ${nick} nie jest zalogowany lub nie istnieje.`;
				case "not_on_channel":
					return "Nie można wykonać akcji: Nie jesteś na kanale.";
				case "password_mismatch":
					return "Hasło niepoprawne.";
				case "too_many_channels":
					return `Nie można dołączyć do ${chan} - Osiągnięto maksymalną liczbę dozwolonych kanałów.`;
				case "unknown_command":
					// TODO: not having message.command should never happen, so force existence
					return `Nieznana komenda: ${props.message.command || "!UNDEFINED_COMMAND_BUG"}`;
				case "user_not_in_channel":
					return `Użytkownik ${nick} nie znajduje się na kanale.`;
				case "user_on_channel":
					return `Użytkownik ${nick} jest już na kanale.`;
				default:
					if (props.message.reason) {
						return `${props.message.reason} (${
							props.message.error || "!NIEZNANY_BŁĄD"
						})`;
					}

					return props.message.error;
			}
		});

		return {
			errorMessage,
		};
	},
});
</script>
