<template>
	<span class="content">
		<p>
			<Username :user="{nick: message.whois.nick}" />
			<span v-if="message.whois.whowas"> jest offline, ostatnie informacje:</span>
		</p>

		<dl class="whois">
			<template v-if="message.whois.account">
				<dt>Zalogowany jako:</dt>
				<dd>{{ message.whois.account }}</dd>
			</template>

			<dt>Maska hosta:</dt>
			<dd class="hostmask">
				<ParsedMessage
					:network="network"
					:text="message.whois.ident + '@' + message.whois.hostname"
				/>
			</dd>

			<template v-if="message.whois.actual_hostname">
				<dt>Rzeczywisty host:</dt>
				<dd class="hostmask">
					<a
						:href="'https://ipinfo.io/' + message.whois.actual_ip"
						target="_blank"
						rel="noopener"
						>{{ message.whois.actual_ip }}</a
					>
					<i v-if="message.whois.actual_hostname != message.whois.actual_ip">
						({{ message.whois.actual_hostname }})</i
					>
				</dd>
			</template>

			<template v-if="message.whois.actual_username">
				<dt>Rzeczywista nazwa użytkownika:</dt>
				<dd>{{ message.whois.actual_username }}</dd>
			</template>

			<template v-if="message.whois.real_name">
				<dt>Prawdziwa nazwa:</dt>
				<dd><ParsedMessage :network="network" :text="message.whois.real_name" /></dd>
			</template>

			<template v-if="message.whois.registered_nick">
				<dt>Zarejestrowany nick:</dt>
				<dd>{{ message.whois.registered_nick }}</dd>
			</template>

			<template v-if="message.whois.channels">
				<dt>Kanały:</dt>
				<dd><ParsedMessage :network="network" :text="message.whois.channels" /></dd>
			</template>

			<template v-if="message.whois.modes">
				<dt>Tryby:</dt>
				<dd>{{ message.whois.modes }}</dd>
			</template>

			<template v-if="message.whois.special">
				<template v-for="special in message.whois.special" :key="special">
					<dt>Specjalne:</dt>
					<dd>{{ special }}</dd>
				</template>
			</template>

			<template v-if="message.whois.operator">
				<dt>Operator:</dt>
				<dd>{{ message.whois.operator }}</dd>
			</template>

			<template v-if="message.whois.helpop">
				<dt>Dostępny do pomocy:</dt>
				<dd>Tak</dd>
			</template>

			<template v-if="message.whois.bot">
				<dt>Jest botem:</dt>
				<dd>Tak</dd>
			</template>

			<template v-if="message.whois.away">
				<dt>Nieobecny:</dt>
				<dd><ParsedMessage :network="network" :text="message.whois.away" /></dd>
			</template>

			<template v-if="message.whois.secure">
				<dt>Bezpieczne połączenie:</dt>
				<dd>Tak</dd>
			</template>

			<template v-if="message.whois.certfps">
				<template v-for="certfp in message.whois.certfps" :key="certfp">
					<dt>Certyfikat:</dt>
					<dd>{{ certfp }}</dd>
				</template>
			</template>

			<template v-if="message.whois.server">
				<dt>Połączony z:</dt>
				<dd>
					{{ message.whois.server }} <i>({{ message.whois.server_info }})</i>
				</dd>
			</template>

			<template v-if="message.whois.logonTime">
				<dt>Połączono o:</dt>
				<dd>{{ localetime(message.whois.logonTime) }}</dd>
			</template>

			<template v-if="message.whois.idle">
				<dt>Nieaktywny od:</dt>
				<dd>{{ localetime(message.whois.idleTime) }}</dd>
			</template>
		</dl>
	</span>
</template>

<script lang="ts">
import {defineComponent, PropType} from "vue";
import localetime from "../../js/helpers/localetime";
import {ClientNetwork, ClientMessage} from "../../js/types";
import ParsedMessage from "../ParsedMessage.vue";
import Username from "../Username.vue";

export default defineComponent({
	name: "MessageTypeWhois",
	components: {
		ParsedMessage,
		Username,
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
	setup() {
		return {
			localetime: (date: Date) => localetime(date),
		};
	},
});
</script>
