import socket from "../socket";
import upload from "../upload";
import {store} from "../store";

socket.once("configuration", function (data) {
	store.commit("serverConfiguration", data);

	// Ustawienie 'theme' zależy od serverConfiguration.themes,
	// więc ustawienia nie mogą zostać zastosowane przed tym momentem
	void store.dispatch("settings/applyAll");

	if (data.fileUpload) {
		upload.initialize();
	}

	// Jeśli localStorage zawiera motyw, który nie istnieje na tym serwerze,
	// zmień na domyślny motyw.
	const currentTheme = data.themes.find((t) => t.name === store.state.settings.theme);

	if (currentTheme === undefined) {
		void store.dispatch("settings/update", {
			name: "theme",
			value: data.defaultTheme,
			sync: true,
		});
	} else if (currentTheme.themeColor) {
		(document.querySelector('meta[name="theme-color"]') as HTMLMetaElement).content =
			currentTheme.themeColor;
	}

	if (document.body.classList.contains("public")) {
		window.addEventListener("beforeunload", (e) => {
			e.preventDefault();
			e.returnValue = "Czy na pewno chcesz opuścić tę stronę?";
		});
	}
});
