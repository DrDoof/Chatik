<template>
	<div>
		<div
			v-if="
				!store.state.serverConfiguration?.public &&
				!store.state.serverConfiguration?.ldapEnabled
			"
			id="change-password"
			role="group"
			aria-labelledby="label-change-password"
		>
			<h2 id="label-change-password">Zmień hasło</h2>
			<div class="password-container">
				<label for="current-password" class="sr-only">Wpisz aktualne hasło</label>
				<RevealPassword v-slot:default="slotProps">
					<input
						id="current-password"
						v-model="old_password"
						autocomplete="current-password"
						:type="slotProps.isVisible ? 'text' : 'password'"
						name="old_password"
						class="input"
						placeholder="Podaj aktualne hasło"
					/>
				</RevealPassword>
			</div>
			<div class="password-container">
				<label for="new-password" class="sr-only">Podaj nowe hasło</label>
				<RevealPassword v-slot:default="slotProps">
					<input
						id="new-password"
						v-model="new_password"
						:type="slotProps.isVisible ? 'text' : 'password'"
						name="new_password"
						autocomplete="new-password"
						class="input"
						placeholder="Wprowadź nowe hasło"
					/>
				</RevealPassword>
			</div>
			<div class="password-container">
				<label for="new-password-verify" class="sr-only">Powtórz nowe hasło</label>
				<RevealPassword v-slot:default="slotProps">
					<input
						id="new-password-verify"
						v-model="verify_password"
						:type="slotProps.isVisible ? 'text' : 'password'"
						name="verify_password"
						autocomplete="new-password"
						class="input"
						placeholder="Powtórz nowe hasło"
					/>
				</RevealPassword>
			</div>
			<div
				v-if="passwordChangeStatus && passwordChangeStatus.success"
				class="feedback success"
			>
				Pomyślnie zaktualizowano hasło
			</div>
			<div
				v-else-if="passwordChangeStatus && passwordChangeStatus.error"
				class="feedback error"
			>
				{{ passwordErrors[passwordChangeStatus.error] }}
			</div>
			<div>
				<button type="submit" class="btn" @click.prevent="changePassword">
					Zmień hasło
				</button>
			</div>
		</div>

		<div v-if="!store.state.serverConfiguration?.public" class="session-list" role="group">
			<h2>Sesje</h2>

			<h3>Bieżąca sesja</h3>
			<Session v-if="currentSession" :session="currentSession" />

			<template v-if="activeSessions.length > 0">
				<h3>Aktywne sesje</h3>
				<Session
					v-for="session in activeSessions"
					:key="session.token"
					:session="session"
				/>
			</template>

			<h3>Pozostałe sesje</h3>
			<p v-if="store.state.sessions.length === 0">Ładowanie…</p>
			<p v-else-if="otherSessions.length === 0">
				<em>Nie masz innych aktywnych sesji na innych urządzeniach.</em>
			</p>
			<Session
				v-for="session in otherSessions"
				v-else
				:key="session.token"
				:session="session"
			/>
		</div>
	</div>
</template>

<script lang="ts">
import socket from "../../js/socket";
import RevealPassword from "../RevealPassword.vue";
import Session from "../Session.vue";
import {computed, defineComponent, onMounted, PropType, ref} from "vue";
import {useStore} from "../../js/store";

export default defineComponent({
	name: "UserSettings",
	components: {
		RevealPassword,
		Session,
	},
	setup() {
		const store = useStore();

		const passwordErrors = {
			missing_fields: "Proszę wypełnić wszystkie pola",
			password_mismatch: "Oba pola nowego hasła muszą być zgodne",
			password_incorrect: "Pole aktualnego hasła nie zgadza się z hasłem Twojego konta",
			update_failed: "Nie udało się zaktualizować hasła",
		};

		const passwordChangeStatus = ref<{
			success: boolean;
			error: keyof typeof passwordErrors;
		}>();

		const old_password = ref("");
		const new_password = ref("");
		const verify_password = ref("");

		const currentSession = computed(() => {
			return store.state.sessions.find((item) => item.current);
		});

		const activeSessions = computed(() => {
			return store.state.sessions.filter((item) => !item.current && item.active > 0);
		});

		const otherSessions = computed(() => {
			return store.state.sessions.filter((item) => !item.current && !item.active);
		});

		onMounted(() => {
			socket.emit("sessions:get");
		});

		const changePassword = () => {
			const data = {
				old_password: old_password.value,
				new_password: new_password.value,
				verify_password: verify_password.value,
			};

			if (!data.old_password || !data.new_password || !data.verify_password) {
				passwordChangeStatus.value = {
					success: false,
					error: "missing_fields",
				};
				return;
			}

			if (data.new_password !== data.verify_password) {
				passwordChangeStatus.value = {
					success: false,
					error: "password_mismatch",
				};
				return;
			}

			socket.once("change-password", (response) => {
				// TODO type
				passwordChangeStatus.value = response as any;
			});

			socket.emit("change-password", data);
		};

		return {
			store,
			passwordChangeStatus,
			passwordErrors,
			currentSession,
			activeSessions,
			otherSessions,
			changePassword,
			old_password,
			new_password,
			verify_password,
		};
	},
});
</script>
