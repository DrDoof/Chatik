<template>
	<div id="help" class="window" role="tabpanel" aria-label="Help">
		<div class="header">
			<SidebarToggle />
		</div>
		<div class="container">
			<h1 class="title">Help</h1>

			<h2 class="help-version-title">
				<span>O Czatiku</span>
				<small>
					v{{ store.state.serverConfiguration?.version }} (<router-link
						id="view-changelog"
						to="/changelog"
						>informacje o wydaniu</router-link
					>)
				</small>
			</h2>

			<div class="about">
				<VersionChecker />

				<template v-if="store.state.serverConfiguration?.gitCommit">
					<p>
						The Lounge is running from source (<a
							:href="`https://github.com/thelounge/thelounge/tree/${store.state.serverConfiguration?.gitCommit}`"
							target="_blank"
							rel="noopener"
							>commit <code>{{ store.state.serverConfiguration?.gitCommit }}</code></a
						>).
					</p>

					<ul>
						<li>
							Compare
							<a
								:href="`https://github.com/thelounge/thelounge/compare/${store.state.serverConfiguration?.gitCommit}...master`"
								target="_blank"
								rel="noopener"
								>between
								<code>{{ store.state.serverConfiguration?.gitCommit }}</code> and
								<code>master</code></a
							>
							to see what you are missing
						</li>
						<li>
							Compare
							<a
								:href="`https://github.com/thelounge/thelounge/compare/${store.state.serverConfiguration?.version}...${store.state.serverConfiguration?.gitCommit}`"
								target="_blank"
								rel="noopener"
								>between
								<code>{{ store.state.serverConfiguration?.version }}</code> and
								<code>{{ store.state.serverConfiguration?.gitCommit }}</code></a
							>
							to see your local changes
						</li>
					</ul>
				</template>

				<p>
					<a
						href="https://chatik.pl/"
						target="_blank"
						rel="noopener"
						class="website-link"
						>Website</a
					>
				</p>
				<p>
					<a
						href="https://chatik.pl/docs/"
						target="_blank"
						rel="noopener"
						class="documentation-link"
						>Dokumentacja</a
					>
				</p>
				<p>
					<a
						href="https://github.com/thelounge/thelounge/issues/new"
						target="_blank"
						rel="noopener"
						class="report-issue-link"
						>Zgłoś problem…</a
					>
				</p>
			</div>

			<h2 v-if="isTouch">Gesty</h2>

			<div v-if="isTouch" class="help-item">
				<div class="subject gesture">Przesunięcie jednym palcem w lewo</div>
				<div class="description">
					<p>Ukryj pasek boczny.</p>
				</div>
			</div>

			<div v-if="isTouch" class="help-item">
				<div class="subject gesture">Przesunięcie jednym palcem w prawo</div>
				<div class="description">
					<p>Pokaż pasek boczny.</p>
				</div>
			</div>

			<div v-if="isTouch" class="help-item">
				<div class="subject gesture">Przesunięcie dwoma palcami w lewo</div>
				<div class="description">
					<p>Przełącz na następne okno na liście kanałów.</p>
				</div>
			</div>

			<div v-if="isTouch" class="help-item">
				<div class="subject gesture">Przesunięcie dwoma palcami w prawo</div>
				<div class="description">
					<p> Przełącz na poprzednie okno na liście kanałów.</p>
				</div>
			</div>

			<h2>Skróty klawiaturowe</h2>

			<div class="help-item">
				<div class="subject">
					<span v-if="!isApple"><kbd>Alt</kbd> <kbd>Shift</kbd> <kbd>↓</kbd></span>
					<span v-else><kbd>⌥</kbd> <kbd>⇧</kbd> <kbd>↓</kbd></span>
				</div>
				<div class="description">
					<p> Przełącz na następne lobby na liście kanałów.</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<span v-if="!isApple"><kbd>Alt</kbd> <kbd>Shift</kbd> <kbd>↑</kbd></span>
					<span v-else><kbd>⌥</kbd> <kbd>⇧</kbd> <kbd>↑</kbd></span>
				</div>
				<div class="description">
					<p>Przełącz na poprzednie lobby na liście kanałów.</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<span v-if="!isApple"><kbd>Alt</kbd> <kbd>Shift</kbd> <kbd>←</kbd></span>
					<span v-else><kbd>⌥</kbd> <kbd>⇧</kbd> <kbd>←</kbd></span>
				</div>
				<div class="description">
					<p>Zwiń bieżącą sieć.</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<span v-if="!isApple"><kbd>Alt</kbd> <kbd>Shift</kbd> <kbd>→</kbd></span>
					<span v-else><kbd>⌥</kbd> <kbd>⇧</kbd> <kbd>→</kbd></span>
				</div>
				<div class="description">
					<p>Rozwiń bieżącą sieć..</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<span v-if="!isApple"><kbd>Alt</kbd> <kbd>↓</kbd></span>
					<span v-else><kbd>⌥</kbd> <kbd>↓</kbd></span>
				</div>
				<div class="description">
					<p>Switch to the next window in the channel list.</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<span v-if="!isApple"><kbd>Alt</kbd> <kbd>↑</kbd></span>
					<span v-else><kbd>⌥</kbd> <kbd>↑</kbd></span>
				</div>
				<div class="description">
					<p>Switch to the previous window in the channel list.</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<span v-if="!isApple"><kbd>Alt</kbd> <kbd>Ctrl</kbd> <kbd>↓</kbd></span>
					<span v-else><kbd>⌥</kbd> <kbd>⌘</kbd> <kbd>↓</kbd></span>
				</div>
				<div class="description">
					<p>Przełącz na następne okno z nieprzeczytanymi wiadomościami na liście kanałów.</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<span v-if="!isApple"><kbd>Alt</kbd> <kbd>Ctrl</kbd> <kbd>↑</kbd></span>
					<span v-else><kbd>⌥</kbd> <kbd>⌘</kbd> <kbd>↑</kbd></span>
				</div>
				<div class="description">
					<p>Przełącz na poprzednie okno z nieprzeczytanymi wiadomościami na liście kanałów.</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<span v-if="!isApple"><kbd>Alt</kbd> <kbd>A</kbd></span>
					<span v-else><kbd>⌥</kbd> <kbd>A</kbd></span>
				</div>
				<div class="description">
					<p>Przełącz na pierwsze okno z nieprzeczytanymi wiadomościami.</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<span v-if="!isApple"><kbd>Alt</kbd> <kbd>S</kbd></span>
					<span v-else><kbd>⌥</kbd> <kbd>S</kbd></span>
				</div>
				<div class="description">
					<p>Przełącz pasek boczny..</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<span v-if="!isApple"><kbd>Alt</kbd> <kbd>U</kbd></span>
					<span v-else><kbd>⌥</kbd> <kbd>U</kbd></span>
				</div>
				<div class="description">
					<p>Toggle channel user list.</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<span v-if="!isApple"><kbd>Alt</kbd> <kbd>J</kbd></span>
					<span v-else><kbd>⌥</kbd> <kbd>J</kbd></span>
				</div>
				<div class="description">
					<p>Przełącz listę użytkowników kanału.</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<span v-if="!isApple"><kbd>Alt</kbd> <kbd>M</kbd></span>
					<span v-else><kbd>⌥</kbd> <kbd>M</kbd></span>
				</div>
				<div class="description">
					<p>Przełącz wyskakujące okno z ostatnimi wzmiankami.</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<span v-if="!isApple"><kbd>Alt</kbd> <kbd>/</kbd></span>
					<span v-else><kbd>⌥</kbd> <kbd>/</kbd></span>
				</div>
				<div class="description">
					<p>Przełącz do menu pomocy.</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<span><kbd>Esc</kbd></span>
				</div>
				<div class="description">
					<p>
						Zamknij bieżące okno kontekstowe (menu kontekstowe, przeglądarka obrazów, 
						edycja tematu itp.) i usuń fokus z pola wprowadzania.
					</p>
				</div>
			</div>

			<h2>Skróty formatowania</h2>

			<div class="help-item">
				<div class="subject">
					<span v-if="!isApple"><kbd>Ctrl</kbd> <kbd>K</kbd></span>
					<span v-else><kbd>⌘</kbd> <kbd>K</kbd></span>
				</div>
				<div class="description">
										<p>
						Oznacz dowolny tekst wpisany po tym skrócie jako kolorowy. Po użyciu tego 
						skrótu wpisz liczbę całkowitą z zakresu <code>0—15</code>, aby wybrać 
						żądany kolor, lub skorzystaj z menu autouzupełniania, aby wybrać nazwę koloru 
						(zobacz poniżej).
					</p>
					<p>
						Kolor tła można określić, dodając po przecinku kolejną liczbę całkowitą 
						z zakresu <code>0—15</code> po numerze koloru pierwszego planu 
						(autouzupełnianie również działa).
					</p>
					<p>
						Referencję kolorów można znaleźć
						<a
							href="https://modern.ircdocs.horse/formatting.html#colors"
							target="_blank"
							rel="noopener"
							>tutaj</a>
						.
					</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<span v-if="!isApple"><kbd>Ctrl</kbd> <kbd>B</kbd></span>
					<span v-else><kbd>⌘</kbd> <kbd>B</kbd></span>
				</div>
				<div class="description">
					<p>
						Oznacz cały tekst wpisany po tym skrócie jako
						<span class="irc-bold">pogrubiony</span>.
					</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<span v-if="!isApple"><kbd>Ctrl</kbd> <kbd>U</kbd></span>
					<span v-else><kbd>⌘</kbd> <kbd>U</kbd></span>
				</div>
				<div class="description">
					<p>
						Oznacz cały tekst wpisany po tym skrócie jako
						<span class="irc-underline">podkreślony</span>.
					</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<span v-if="!isApple"><kbd>Ctrl</kbd> <kbd>I</kbd></span>
					<span v-else><kbd>⌘</kbd> <kbd>I</kbd></span>
				</div>
				<div class="description">
					<p>
						Oznacz cały tekst wpisany po tym skrócie jako
						<span class="irc-italic">kursywę</span>.
					</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<span v-if="!isApple"><kbd>Ctrl</kbd> <kbd>S</kbd></span>
					<span v-else><kbd>⌘</kbd> <kbd>S</kbd></span>
				</div>
				<div class="description">
					<p>
						Oznacz cały tekst wpisany po tym skrócie jako
						<span class="irc-strikethrough">przekreślony</span>.
					</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<span v-if="!isApple"><kbd>Ctrl</kbd> <kbd>M</kbd></span>
					<span v-else><kbd>⌘</kbd> <kbd>M</kbd></span>
				</div>
				<div class="description">
					<p>
						Oznacz cały tekst wpisany po tym skrócie jako
						<span class="irc-monospace">jednolity</span>.
					</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<span v-if="!isApple"><kbd>Ctrl</kbd> <kbd>O</kbd></span>
					<span v-else><kbd>⌘</kbd> <kbd>O</kbd></span>
				</div>
				<div class="description">
					<p>
						Zresetuj formatowanie całego tekstu wpisanego po tym skrócie do domyślnego.
					</p>
				</div>
			</div>

			<h2>Autocompletion</h2>

				<p>
					Aby automatycznie uzupełniać pseudonimy, kanały, komendy i emoji, wpisz jeden z
					poniższych znaków, aby otworzyć listę sugestii. Użyj klawiszy <kbd>↑</kbd> i
					<kbd>↓</kbd>, aby podświetlić element, a następnie wstaw go, naciskając <kbd>Tab</kbd> lub
					<kbd>Enter</kbd> (lub klikając wybrany element).
				</p>
				<p>Autouzupełnianie można wyłączyć w ustawieniach.</p>
			

			<div class="help-item">
				<div class="subject">
					<code>@</code>
				</div>
				<div class="description">
					<p>Pseudonim</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<code>#</code>
				</div>
				<div class="description">
					<p>Kanał</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<code>/</code>
				</div>
				<div class="description">
					<p>Komendy (zobacz listę komend poniżej)</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<code>:</code>
				</div>
				<div class="description">
					<p>
						Emoji (uwaga: wymaga wpisania co najmniej dwóch znaków, aby uniknąć konfliktu
						z popularnymi emotikonami, takimi jak <code>:)</code>)
					</p>
				</div>
			</div>

			<h2>Komendy</h2>

			<div class="help-item">
				<div class="subject">
					<code>/away [wiadomość]</code>
				</div>
				<div class="description">
					<p>Ustaw status "Zaraz wracam" z opcjonalną wiadomością.</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<code>/back</code>
				</div>
				<div class="description">
					<p>Usuń status "Zaraz wracam" (ustawiony za pomocą <code>/away</code>).</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<code>/ban nick</code>
				</div>
				<div class="description">
					<p>Zbanuj użytkownika na bieżącym kanale (<code>+b</code>). Może to być 
						pseudonim lub maska hosta.</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<code>/banlist</code>
				</div>
				<div class="description">
					<p>Załaduj listę zbanowanych użytkowników dla bieżącego kanału.</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<code>/collapse</code>
				</div>
				<div class="description">
					<p>
						Zwiń wszystkie podglądy w bieżącym kanale (odwrotność polecenia
						<code>/expand</code>).
					</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<code>/connect host [port]</code>
				</div>
				<div class="description">
					<p>
						Połącz się z nową siecią IRC. Jeśli <code>port</code> zaczyna się od
						znaku <code>+</code>, połączenie będzie zabezpieczone przy użyciu TLS.
					</p>
					<p>Alias: <code>/server</code></p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<code>/ctcp target cmd [args]</code>
				</div>
				<div class="description">
					<p>
						Wyślij żądanie <abbr title="Client-to-client protocol">CTCP</abbr>.
						Więcej na ten temat można przeczytać w
						<a
							href="https://en.wikipedia.org/wiki/Client-to-client_protocol"
							target="_blank"
							rel="noopener"
							>dedykowanym artykule na Wikipedii</a
						>.
					</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<code>/deop nick [...nick]</code>
				</div>
				<div class="description">
					<p>
						Usuń uprawnienia operatora (<code>-o</code>) jednemu lub kilku użytkownikom
						na bieżącym kanale.
					</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<code>/devoice nick [...nick]</code>
				</div>
				<div class="description">
					<p>
						Usuń uprawnienia do mówienia (<code>-v</code>) jednemu lub kilku użytkownikom
						na bieżącym kanale.
					</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<code>/disconnect [message]</code>
				</div>
				<div class="description">
					<p>Rozłącz się z bieżącą siecią z opcjonalną wiadomością.</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<code>/expand</code>
				</div>
				<div class="description">
					<p>
						Rozwiń wszystkie podglądy w bieżącym kanale (odwrotność polecenia
						<code>/collapse</code>).
					</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<code>/invite nick [channel]</code>
				</div>
				<div class="description">
					<p>
						Zaproś użytkownika na określony kanał. Jeśli
						<code>channel</code> zostanie pominięty, użytkownik zostanie zaproszony na bieżący
						kanał.
					</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<code>/ignore nick</code>
				</div>
				<div class="description">
					<p>
						Zablokuj wszystkie wiadomości od określonego użytkownika w bieżącej sieci. Może to
						być pseudonim lub maska hosta.
					</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<code>/ignorelist</code>
				</div>
				<div class="description">
					<p>Załaduj listę ignorowanych użytkowników dla bieżącej sieci.</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<code>/join channel [password]</code>
				</div>
				<div class="description">
					<p>
						Dołącz do kanału. Hasło jest wymagane tylko w chronionych kanałach i zazwyczaj
						może zostać pominięte.
					</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<code>/kick nick [reason]</code>
				</div>
				<div class="description">
					<p>Wyrzuć użytkownika z bieżącego kanału.</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<code>/kickban nick [reason]</code>
				</div>
				<div class="description">
					<p>
						Wyrzuć i zbanuj (<code>+b</code>) użytkownika z bieżącego kanału. W przeciwieństwie
						do <code>/ban</code>, można używać tylko pseudonimów (a nie masek hostów).
					</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<code>/list</code>
				</div>
				<div class="description">
					<p>Pobierz listę dostępnych kanałów w tej sieci.</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<code>/me message</code>
				</div>
				<div class="description">
					<p>
						Wyślij wiadomość akcji na bieżący kanał. Chatik wyświetli ją w tekście,
						jakby była napisana w trzeciej osobie.
					</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<code>/mode flags [args]</code>
				</div>
				<div class="description">
					<p>
						Ustaw określone flagi dla bieżącego kanału, jeśli aktywne okno to kanał;
						dla innego użytkownika, jeśli aktywne okno to okno prywatnej wiadomości;
						lub dla siebie, jeśli aktywne okno to okno serwera.
					</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<code>/msg channel message</code>
				</div>
				<div class="description">
					<p>Wyślij wiadomość na określony kanał.</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<code>/mute [...channel]</code>
				</div>
				<div class="description">
					<p>
						Zablokuj powiadomienia dla kanału. Wyłącza to wskaźnik podświetlenia,
						ukrywa wzmianki i blokuje powiadomienia push. Wyciszenie lobby sieciowego
						wycisza całą sieć. Jeśli nie podano kanału, zostanie wyciszony bieżący
						kanał. Cofnij zmiany poleceniem <code>/unmute</code>.
					</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<code>/nick newnick</code>
				</div>
				<div class="description">
					<p>Zmień swój pseudonim w bieżącej sieci.</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<code>/notice channel message</code>
				</div>
				<div class="description">
					<p>Wyślij wiadomość powiadomienia na określony kanał.</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<code>/op nick [...nick]</code>
				</div>
				<div class="description">
					<p>Przyznaj uprawnienia operatora (<code>+o</code>) jednemu lub kilku użytkownikom na bieżącym kanale.</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<code>/part [channel]</code>
				</div>
				<div class="description">
					<p>
						Zamknij określony kanał lub okno prywatnej wiadomości, lub bieżący
						kanał, jeśli <code>channel</code> nie został podany.
					</p>
					<p>Aliasy: <code>/close</code>, <code>/leave</code></p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<code>/rejoin</code>
				</div>
				<div class="description">
					<p>
						Opuszcza i natychmiast ponownie dołącza do bieżącego kanału. Przydatne do szybkiego uzyskania 
						uprawnień operatora od ChanServ na pustym kanale.
					</p>
					<p>Alias: <code>/cycle</code></p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<code>/query nick</code>
				</div>
				<div class="description">
					<p>Wyślij prywatną wiadomość do określonego użytkownika.</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<code>/quit [message]</code>
				</div>
				<div class="description">
					<p>Rozłącz się z bieżącą siecią, opcjonalnie podając wiadomość.</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<code>/raw message</code>
				</div>
				<div class="description">
					<p>Wyślij surową wiadomość do bieżącej sieci IRC.</p>
					<p>Aliasy: <code>/quote</code>, <code>/send</code></p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<code>/slap nick</code>
				</div>
				<div class="description">
					<p>Uderz kogoś pstrągiem na bieżącym kanale!</p>
				</div>
			</div>

			<div v-if="store.state.settings.searchEnabled" class="help-item">
				<div class="subject">
					<code>/search query</code>
				</div>
				<div class="description">
					<p>Wyszukaj wiadomości w bieżącym kanale / u użytkownika</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<code>/topic [newtopic]</code>
				</div>
				<div class="description">
					<p>
						Pobierz temat bieżącego kanału. Jeśli podano <code>newtopic</code>,
						ustawi nowy temat na bieżącym kanale.
					</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<code>/unban nick</code>
				</div>
				<div class="description">
					<p>
						Usuń bana (<code>-b</code>) użytkownika na bieżącym kanale. Może to być
						pseudonim lub maska hosta.
					</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<code>/unignore nick</code>
				</div>
				<div class="description">
					<p>
						Odblokuj wiadomości od określonego użytkownika w bieżącej sieci. Może to być
						pseudonim lub maska hosta.
					</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<code>/unmute [...channel]</code>
				</div>
				<div class="description">
					<p>
						Anuluj wyciszenie określonych kanałów lub bieżącego kanału, jeśli nie podano kanału.
						Zobacz <code>/mute</code>, aby uzyskać więcej informacji.
					</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<code>/voice nick [...nick]</code>
				</div>
				<div class="description">
					<p>
						Przyznaj prawo głosu (<code>+v</code>) jednemu lub kilku użytkownikom na bieżącym kanale.
					</p>
				</div>
			</div>

			<div class="help-item">
				<div class="subject">
					<code>/whois nick</code>
				</div>
				<div class="description">
					<p>Pobierz informacje o podanym użytkowniku w bieżącej sieci.</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import {defineComponent, ref} from "vue";
import {useStore} from "../../js/store";
import SidebarToggle from "../SidebarToggle.vue";
import VersionChecker from "../VersionChecker.vue";

export default defineComponent({
	name: "Help",
	components: {
		SidebarToggle,
		VersionChecker,
	},
	setup() {
		const store = useStore();
		const isApple = navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i) || false;
		const isTouch = navigator.maxTouchPoints > 0;

		return {
			isApple,
			isTouch,
			store,
		};
	},
});
</script>
