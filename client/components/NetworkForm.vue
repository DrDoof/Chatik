<template>
	<div id="connect" class="window" role="tabpanel" aria-label="Połącz">
		<div class="header">
			<SidebarToggle />
		</div>
		<form class="container" method="post" action="" @submit.prevent="onSubmit">
			<h1 class="title">
				<template v-if="defaults.uuid">
					<input v-model="defaults.uuid" type="hidden" name="uuid" />
					Edytuj {{ defaults.name }}
				</template>
				<template v-else>
					Połącz
					<template
						v-if="config?.lockNetwork && store?.state.serverConfiguration?.public"
					>
						do {{ defaults.name }}
					</template>
				</template>
			</h1>
			<template v-if="!config?.lockNetwork">
				<h2>Ustawienia sieci</h2>
				<div class="connect-row">
					<label for="connect:name">Nazwa</label>
					<input
						id="connect:name"
						v-model.trim="defaults.name"
						class="input"
						name="name"
						maxlength="100"
					/>
				</div>
				<div class="connect-row">
					<label for="connect:host">Serwer</label>
					<div class="input-wrap">
						<input
							id="connect:host"
							v-model.trim="defaults.host"
							class="input"
							name="host"
							aria-label="Adres serwera"
							maxlength="255"
							required
						/>
						<span id="connect:portseparator">:</span>
						<input
							id="connect:port"
							v-model="defaults.port"
							class="input"
							type="number"
							min="1"
							max="65535"
							name="port"
							aria-label="Port serwera"
						/>
					</div>
				</div>
				<div class="connect-row">
					<label for="connect:password">Hasło</label>
					<RevealPassword
						v-slot:default="slotProps"
						class="input-wrap password-container"
					>
						<input
							id="connect:password"
							v-model="defaults.password"
							class="input"
							:type="slotProps.isVisible ? 'text' : 'password'"
							placeholder="Hasło serwera (opcjonalne)"
							name="password"
							maxlength="300"
						/>
					</RevealPassword>
				</div>
				<div class="connect-row">
					<label></label>
					<div class="input-wrap">
						<label class="tls">
							<input
								v-model="defaults.tls"
								type="checkbox"
								name="tls"
								:disabled="defaults.hasSTSPolicy"
							/>
							Użyj bezpiecznego połączenia (TLS)
							<span
								v-if="defaults.hasSTSPolicy"
								class="tooltipped tooltipped-n tooltipped-no-delay"
								aria-label="Ta sieć ma politykę ścisłego bezpieczeństwa transportu, nie będziesz mógł wyłączyć TLS"
								>🔒 STS</span
							>
						</label>
						<label class="tls">
							<input
								v-model="defaults.rejectUnauthorized"
								type="checkbox"
								name="rejectUnauthorized"
							/>
							Zezwalaj tylko na zaufane certyfikaty
						</label>
					</div>
				</div>

				<h2>Ustawienia proxy</h2>
				<div class="connect-row">
					<label></label>
					<div class="input-wrap">
						<label for="connect:proxyEnabled">
							<input
								id="connect:proxyEnabled"
								v-model="defaults.proxyEnabled"
								type="checkbox"
								name="proxyEnabled"
							/>
							Włącz proxy
						</label>
					</div>
				</div>
				<template v-if="defaults.proxyEnabled">
					<div class="connect-row">
						<label for="connect:proxyHost">Adres SOCKS</label>
						<div class="input-wrap">
							<input
								id="connect:proxyHost"
								v-model.trim="defaults.proxyHost"
								class="input"
								name="proxyHost"
								aria-label="Serwer proxy"
								maxlength="255"
							/>
							<span id="connect:proxyPortSeparator">:</span>
							<input
								id="connect:proxyPort"
								v-model="defaults.proxyPort"
								class="input"
								type="number"
								min="1"
								max="65535"
								name="proxyPort"
								aria-label="Port SOCKS"
							/>
						</div>
					</div>

					<div class="connect-row">
						<label for="connect:proxyUsername">Nazwa użytkownika proxy</label>
						<input
							id="connect:proxyUsername"
							ref="proxyUsernameInput"
							v-model.trim="defaults.proxyUsername"
							class="input username"
							name="proxyUsername"
							maxlength="100"
							placeholder="Nazwa użytkownika proxy"
						/>
					</div>

					<div class="connect-row">
						<label for="connect:proxyPassword">Hasło proxy</label>
						<RevealPassword
							v-slot:default="slotProps"
							class="input-wrap password-container"
						>
							<input
								id="connect:proxyPassword"
								ref="proxyPassword"
								v-model="defaults.proxyPassword"
								class="input"
								:type="slotProps.isVisible ? 'text' : 'password'"
								placeholder="Hasło proxy"
								name="proxyPassword"
								maxlength="300"
							/>
						</RevealPassword>
					</div>
				</template>
			</template>
			<template v-else-if="config.lockNetwork && !store.state.serverConfiguration?.public">
				<h2>Ustawienia sieci</h2>
				<div class="connect-row">
					<label for="connect:name">Nazwa</label>
					<input
						id="connect:name"
						v-model.trim="defaults.name"
						class="input"
						name="name"
						maxlength="100"
					/>
				</div>
				<div class="connect-row">
					<label for="connect:password">Hasło</label>
					<RevealPassword
						v-slot:default="slotProps"
						class="input-wrap password-container"
					>
						<input
							id="connect:password"
							v-model="defaults.password"
							class="input"
							:type="slotProps.isVisible ? 'text' : 'password'"
							placeholder="Hasło serwera (opcjonalne)"
							name="password"
							maxlength="300"
						/>
					</RevealPassword>
				</div>
			</template>

			<h2>Preferencje użytkownika</h2>
			<div class="connect-row">
				<label for="connect:nick">Nick</label>
				<input
					id="connect:nick"
					v-model="defaults.nick"
					class="input nick"
					name="nick"
					pattern="[^\s:!@]+"
					maxlength="100"
					required
					@input="onNickChanged"
				/>
			</div>
			<template v-if="!config?.useHexIp">
				<div class="connect-row">
					<label for="connect:username">Nazwa użytkownika</label>
					<input
						id="connect:username"
						ref="usernameInput"
						v-model.trim="defaults.username"
						class="input username"
						name="username"
						maxlength="100"
					/>
				</div>
			</template>
			<div class="connect-row">
				<label for="connect:realname">Prawdziwe imię</label>
				<input
					id="connect:realname"
					v-model.trim="defaults.realname"
					class="input"
					name="realname"
					maxlength="300"
				/>
			</div>
			<div class="connect-row">
				<label for="connect:leaveMessage">Wiadomość przy opuszczeniu</label>
				<input
					id="connect:leaveMessage"
					v-model.trim="defaults.leaveMessage"
					autocomplete="off"
					class="input"
					name="leaveMessage"
					placeholder="Chatik Web Client - https://chatik.pl"
				/>
			</div>
			<template v-if="defaults.uuid && !store.state.serverConfiguration?.public">
				<div class="connect-row">
					<label for="connect:commands">
						Polecenia
						<span
							class="tooltipped tooltipped-ne tooltipped-no-delay"
							aria-label="Jedno /polecenie na linię. Każde polecenie zostanie wykonane w zakładce serwera po nowym połączeniu"
						>
							<button class="extra-help" />
						</span>
					</label>
					<textarea
						id="connect:commands"
						ref="commandsInput"
						autocomplete="off"
						:value="defaults.commands ? defaults.commands.join('\n') : ''"
						class="input"
						name="commands"
						@input="resizeCommandsInput"
					/>
				</div>
			</template>
			<template v-else-if="!defaults.uuid">
				<div class="connect-row">
					<label for="connect:channels">Kanały</label>
					<input
						id="connect:channels"
						v-model.trim="defaults.join"
						class="input"
						name="join"
					/>
				</div>
			</template>

			<template v-if="store.state.serverConfiguration?.public">
				<template v-if="config?.lockNetwork">
					<div class="connect-row">
						<label></label>
						<div class="input-wrap">
							<label class="tls">
								<input v-model="displayPasswordField" type="checkbox" />
								Mam hasło
							</label>
						</div>
					</div>
					<div v-if="displayPasswordField" class="connect-row">
						<label for="connect:password">Hasło</label>
						<RevealPassword
							v-slot:default="slotProps"
							class="input-wrap password-container"
						>
							<input
								id="connect:password"
								ref="publicPassword"
								v-model="defaults.password"
								class="input"
								:type="slotProps.isVisible ? 'text' : 'password'"
								placeholder="Hasło serwera (opcjonalne)"
								name="password"
								maxlength="300"
							/>
						</RevealPassword>
					</div>
				</template>
			</template>
			<template v-else>
				<h2 id="label-auth">Uwierzytelnianie</h2>
				<div class="connect-row connect-auth" role="group" aria-labelledby="label-auth">
					<label class="opt">
						<input
							:checked="!defaults.sasl"
							type="radio"
							name="sasl"
							value=""
							@change="setSaslAuth('')"
						/>
						Brak uwierzytelniania
					</label>
					<label class="opt">
						<input
							:checked="defaults.sasl === 'plain'"
							type="radio"
							name="sasl"
							value="plain"
							@change="setSaslAuth('plain')"
						/>
						Nazwa użytkownika + hasło (SASL PLAIN)
					</label>
					<label
						v-if="!store.state.serverConfiguration?.public && defaults.tls"
						class="opt"
					>
						<input
							:checked="defaults.sasl === 'external'"
							type="radio"
							name="sasl"
							value="external"
							@change="setSaslAuth('external')"
						/>
						Certyfikat klienta (SASL EXTERNAL)
					</label>
				</div>

				<template v-if="defaults.sasl === 'plain'">
					<div class="connect-row">
						<label for="connect:username">Konto</label>
						<input
							id="connect:saslAccount"
							v-model.trim="defaults.saslAccount"
							class="input"
							name="saslAccount"
							maxlength="100"
							required
						/>
					</div>
					<div class="connect-row">
						<label for="connect:password">Hasło</label>
						<RevealPassword
							v-slot:default="slotProps"
							class="input-wrap password-container"
						>
							<input
								id="connect:saslPassword"
								v-model="defaults.saslPassword"
								class="input"
								:type="slotProps.isVisible ? 'text' : 'password'"
								name="saslPassword"
								maxlength="300"
								required
							/>
						</RevealPassword>
					</div>
				</template>
				<div v-else-if="defaults.sasl === 'external'" class="connect-sasl-external">
					<p>The Lounge automatycznie generuje i zarządza certyfikatem klienta.</p>
					<p>
						Na serwerze IRC musisz poinformować usługi, aby dołączyły odcisk certyfikatu
						(certfp) do twojego konta, na przykład:
					</p>
					<pre><code>/msg NickServ CERT ADD</code></pre>
				</div>
			</template>

			<div>
				<button type="submit" class="btn" :disabled="disabled ? true : false">
					<template v-if="defaults.uuid">Zapisz sieć</template>
					<template v-else>Połącz</template>
				</button>
			</div>
		</form>
	</div>
</template>

<style>
#connect .connect-auth {
	display: block;
	margin-bottom: 10px;
}

#connect .connect-auth .opt {
	display: block;
	width: 100%;
}

#connect .connect-auth input {
	margin: 3px 10px 0 0;
}

#connect .connect-sasl-external {
	padding: 10px;
	border-radius: 2px;
	background-color: #d9edf7;
	color: #31708f;
}

#connect .connect-sasl-external pre {
	margin: 0;
	user-select: text;
}
</style>

<script lang="ts">
import RevealPassword from "./RevealPassword.vue";
import SidebarToggle from "./SidebarToggle.vue";
import {defineComponent, nextTick, PropType, ref, watch} from "vue";
import {useStore} from "../js/store";
import {ClientNetwork} from "../js/types";
import localStorage from "../js/localStorage";

export type NetworkFormDefaults = Partial<ClientNetwork> & {
	join?: string;
};

export default defineComponent({
	name: "NetworkForm",
	components: {
		RevealPassword,
		SidebarToggle,
	},
	props: {
		handleSubmit: {
			type: Function as PropType<(network: ClientNetwork) => void>,
			required: true,
		},
		defaults: {
			type: Object as PropType<NetworkFormDefaults>,
			required: true,
		},
		disabled: Boolean,
	},
	setup(props) {
		const store = useStore();
		const config = ref(store.state.serverConfiguration);
		const previousUsername = ref(props.defaults?.username);

		const savedDefaults = localStorage.get("savedDefaults");

		if (savedDefaults) {
			try {
				const parsedDefaults = JSON.parse(savedDefaults);
				Object.keys(parsedDefaults).forEach((key) => {
					if (key !== "password" && key !== "saslPassword") {
						props.defaults[key] = parsedDefaults[key];
					}
				});
			} catch (e) {
				console.error("Błąd odczytu savedDefaults:", e);
			}
		}

		const displayPasswordField = ref(false);
		const publicPassword = ref<HTMLInputElement | null>(null);

		watch(displayPasswordField, (newValue) => {
			if (newValue) {
				void nextTick(() => {
					publicPassword.value?.focus();
				});
			}
		});

		const commandsInput = ref<HTMLInputElement | null>(null);

		const resizeCommandsInput = () => {
			if (!commandsInput.value) {
				return;
			}

			// Reset height first so it can down size
			commandsInput.value.style.height = "";

			// 2 pixels to account for the border
			commandsInput.value.style.height = `${Math.ceil(
				commandsInput.value.scrollHeight + 2
			)}px`;
		};

		watch(
			// eslint-disable-next-line
			() => props.defaults?.commands,
			() => {
				void nextTick(() => {
					resizeCommandsInput();
				});
			}
		);

		watch(
			// eslint-disable-next-line
			() => props.defaults?.tls,
			(isSecureChecked) => {
				const ports = [6667, 6697];
				const newPort = isSecureChecked ? 0 : 1;

				// If you disable TLS and current port is 6697,
				// set it to 6667, and vice versa
				if (props.defaults?.port === ports[newPort]) {
					props.defaults.port = ports[1 - newPort];
				}
			}
		);

		const setSaslAuth = (type: string) => {
			if (props.defaults) {
				props.defaults.sasl = type;
			}
		};

		const usernameInput = ref<HTMLInputElement | null>(null);

		const onNickChanged = (event: Event) => {
			if (!usernameInput.value) {
				return;
			}

			const usernameRef = usernameInput.value;

			if (!usernameRef.value || usernameRef.value === previousUsername.value) {
				usernameRef.value = (event.target as HTMLInputElement)?.value;
			}

			previousUsername.value = (event.target as HTMLInputElement)?.value;
		};

		const onSubmit = (event: Event) => {
			const formData = new FormData(event.target as HTMLFormElement);
			const data: Partial<ClientNetwork> = {};

			formData.forEach((value, key) => {
				data[key] = value;
			});

			const filteredData = {...data};
			delete filteredData.password;
			delete filteredData.saslPassword;
			localStorage.set("savedDefaults", JSON.stringify(filteredData));

			props.handleSubmit(data as ClientNetwork);
		};

		return {
			store,
			config,
			displayPasswordField,
			publicPassword,
			commandsInput,
			resizeCommandsInput,
			setSaslAuth,
			usernameInput,
			onNickChanged,
			onSubmit,
		};
	},
});
</script>
