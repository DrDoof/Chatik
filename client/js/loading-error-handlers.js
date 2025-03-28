"use strict";

/*
 * This is a separate file for two reasons:
 * 1. CSP policy does not allow inline javascript
 * 2. It has to be a small javascript executed before all other scripts,
 *    so that the timeout can be triggered while slow JS is loading
 */

(function () {
	const msg = document.getElementById("loading-page-message");

	if (msg) {
		msg.textContent = "Ładowanie aplikacji…";
	}

	document.getElementById("loading-reload")?.addEventListener("click", () => location.reload());

	const displayReload = () => {
		const loadingReload = document.getElementById("loading-reload");

		if (loadingReload) {
			loadingReload.style.visibility = "visible";
		}
	};

	const loadingSlowTimeout = setTimeout(() => {
		const loadingSlow = document.getElementById("loading-slow");

		if (loadingSlow) {
			loadingSlow.style.visibility = "visible";
		}

		displayReload();
	}, 5000);

	/**
	 * @param {ErrorEvent} e
	 **/
	const errorHandler = (e) => {
		if (!msg) {
			return;
		}

		msg.textContent = "Wystąpił błąd, który uniemożliwił poprawne załadowanie klienta.";

		const summary = document.createElement("summary");
		summary.textContent = "Więcej szczegółów";

		const data = document.createElement("pre");
		data.textContent = e.message; // e is an ErrorEvent

		const info = document.createElement("p");
		info.textContent = "Otwórz narzędzia deweloperskie przeglądarki, aby uzyskać więcej informacji.";

		const details = document.createElement("details");
		details.appendChild(summary);
		details.appendChild(data);
		details.appendChild(info);
		msg.parentNode?.insertBefore(details, msg.nextSibling);

		window.clearTimeout(loadingSlowTimeout);
		displayReload();
	};

	window.addEventListener("error", errorHandler);

	window.g_TheLoungeRemoveLoading = () => {
		delete window.g_TheLoungeRemoveLoading;
		window.clearTimeout(loadingSlowTimeout);
		window.removeEventListener("error", errorHandler);
		document.getElementById("loading")?.remove();
	};

	// Apply user theme as soon as possible, before any other code loads
	// This prevents flash of white while other code loads and socket connects
	try {
		const userSettings = JSON.parse(localStorage.getItem("settings") || "{}");
		const themeEl = document.getElementById("theme");

		if (!themeEl) {
			return;
		}

		if (
			typeof userSettings.theme === "string" &&
			themeEl?.dataset.serverTheme !== userSettings.theme
		) {
			themeEl.setAttribute("href", `themes/${userSettings.theme}.css`);
		}

		if (
			typeof userSettings.userStyles === "string" &&
			!/[?&]nocss/.test(window.location.search)
		) {
			const userSpecifiedCSSElement = document.getElementById("user-specified-css");

			if (!userSpecifiedCSSElement) {
				return;
			}

			userSpecifiedCSSElement.innerHTML = userSettings.userStyles;
		}
	} catch (e) {
		//
	}

	// Trigger early service worker registration
	if ("serviceWorker" in navigator) {
		navigator.serviceWorker.register("service-worker.js");

		// Handler for messages coming from the service worker

		const messageHandler = (/** @type {MessageEvent} */ event) => {
			if (event.data.type === "fetch-error") {
				// @ts-expect-error Argument of type '{ message: string; }' is not assignable to parameter of type 'ErrorEvent'.
				errorHandler({
					message: `Service worker nie mógł pobrać URL-a: ${event.data.message}`,
				});

				// Display only one fetch error
				navigator.serviceWorker.removeEventListener("message", messageHandler);
			}
		};

		navigator.serviceWorker.addEventListener("message", messageHandler);
	}
})();
