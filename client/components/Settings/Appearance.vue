<template>
	<div>
		<h2>Wiadomości</h2>
		<div>
			<label class="opt">
				<input :checked="store.state.settings.motd" type="checkbox" name="motd" />
				Pokazuj <abbr title="Wiadomość dnia">MOTD</abbr>
			</label>
		</div>
		<div>
			<label class="opt">
				<input
					:checked="store.state.settings.showSeconds"
					type="checkbox"
					name="showSeconds"
				/>
				Wyświetlaj sekundy przy linijkach czatu
			</label>
		</div>
		<div>
			<label class="opt">
				<input
					:checked="store.state.settings.use12hClock"
					type="checkbox"
					name="use12hClock"
				/>
				Używaj zegara 12-godzinnego
			</label>
		</div>
		<template v-if="store.state.serverConfiguration?.prefetch">
			<h2>Podgląd linków</h2>
			<div>
				<label class="opt">
					<input :checked="store.state.settings.media" type="checkbox" name="media" />
					Podgląd mediów
				</label>
			</div>
			<div>
				<label class="opt">
					<input :checked="store.state.settings.links" type="checkbox" name="links" />
					Podgląd witryn
				</label>
			</div>
		</template>
		<h2 id="label-status-messages">
			Wiadomości statusowe
			<span
				class="tooltipped tooltipped-n tooltipped-no-delay"
				aria-label="Dołączenia, odejścia, rozłączenia, wyrzucenia, zmiany nicków i zmiany trybów"
			>
				<button class="extra-help" />
			</span>
		</h2>
		<div role="group" aria-labelledby="label-status-messages">
			<label class="opt">
				<input
					:checked="store.state.settings.statusMessages === 'shown'"
					type="radio"
					name="statusMessages"
					value="shown"
				/>
				Pokazuj wiadomości statusowe pojedynczo
			</label>
			<label class="opt">
				<input
					:checked="store.state.settings.statusMessages === 'condensed'"
					type="radio"
					name="statusMessages"
					value="condensed"
				/>
				Grupuj wiadomości statusowe
			</label>
			<label class="opt">
				<input
					:checked="store.state.settings.statusMessages === 'hidden'"
					type="radio"
					name="statusMessages"
					value="hidden"
				/>
				Ukryj wszystkie wiadomości statusowe
			</label>
		</div>
		<h2>Dodatki</h2>
		<div>
			<label class="opt">
				<input
					:checked="store.state.settings.coloredNicks"
					type="checkbox"
					name="coloredNicks"
				/>
				Włącz kolorowanie nicków
			</label>
			<label class="opt">
				<input
					:checked="store.state.settings.autocomplete"
					type="checkbox"
					name="autocomplete"
				/>
				Włącz autouzupełnianie
			</label>
		</div>
		<div>
			<label class="opt" for="nickPostfix">
				Przyrostek autouzupełniania nicku
				<span
					class="tooltipped tooltipped-n tooltipped-no-delay"
					aria-label="Przyrostek dodawany do nicku po jego autouzupełnieniu (np. przecinek, dwukropek, spacja)"
				>
					<button class="extra-help" />
				</span>
			</label>
			<input
				id="nickPostfix"
				:value="store.state.settings.nickPostfix"
				type="text"
				name="nickPostfix"
				class="input"
				placeholder="Przyrostek autouzupełniania nicku (np. ', ')"
			/>
		</div>

		<h2>Skórka</h2>
		<div>
			<label for="theme-select" class="sr-only">Skórka</label>
			<select
				id="theme-select"
				:value="store.state.settings.theme"
				name="theme"
				class="input"
			>
				<option
					v-for="theme in store.state.serverConfiguration?.themes"
					:key="theme.name"
					:value="theme.name"
				>
					{{ theme.displayName }}
				</option>
			</select>
		</div>

		<div>
			<h2>Własna skórka</h2>
			<label for="user-specified-css-input" class="sr-only">
				Własna skórka. Możesz nadpisać styl CSS, wklejając go w to pole.
			</label>
			<textarea
				id="user-specified-css-input"
				:value="store.state.settings.userStyles"
				class="input"
				name="userStyles"
				placeholder="/* Możesz nadpisać styl CSS, wklejając go w to pole */"
			/>
		</div>
	</div>
</template>

<style>
textarea#user-specified-css-input {
	height: 100px;
}
</style>

<script lang="ts">
import {defineComponent} from "vue";
import {useStore} from "../../js/store";

export default defineComponent({
	name: "AppearanceSettings",
	setup() {
		const store = useStore();

		return {
			store,
		};
	},
});
</script>
