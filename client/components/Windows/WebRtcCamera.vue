<template>
	<div class="webrtc-container">
		<div class="video-container">
			<h2>Podgląd kamery</h2>
			<video ref="localVideo" autoplay playsinline></video>
			<video ref="remoteVideo" autoplay playsinline></video>

			<div class="controls">
				<button @click="startCamera">Włącz nadawanie</button>
				<button @click="stopCamera">Wyłącz nadawanie</button>
				<button @click="getBroadcasters">Pobierz nadawców</button>
			</div>
		</div>

		<div class="broadcasters-list">
			<h3>Lista nadających użytkowników</h3>
			<ul>
				<li v-for="user in broadcasters" :key="user" @click="connectToStream(user)">
					{{ user }}
				</li>
			</ul>
		</div>
	</div>
</template>

<script lang="ts">
import {defineComponent, ref, onMounted, onUnmounted} from "vue";
import socket from "../../js/socket"; // Teraz socket jest importowany bezpośrednio
import {store} from "../../js/store";

export default defineComponent({
	name: "WebRtcCamera",
	props: {
		network: Object, // Pobieranie network z props
	},
	setup(props) {
		const localVideo = ref<HTMLVideoElement | null>(null);
		const remoteVideo = ref<HTMLVideoElement | null>(null);
		const broadcasters = ref<string[]>([]);

		const getBroadcasters = () => {
			socket.emit("webrtc:get-broadcasters");

			socket.on("webrtc:broadcasters-list", ({broadcasters: receivedBroadcasters}) => {
				broadcasters.value = receivedBroadcasters;
				console.log("Otrzymano listę nadających użytkowników:", broadcasters.value);
			});
		};

		const connectToStream = (user: string) => {
			console.log(`Łączenie z użytkownikiem: ${user}`);

			store.commit(
				"peerConnection",
				new RTCPeerConnection({
					iceServers: [{urls: "stun:stun.l.google.com:19302"}],
				})
			);

			store.state.peerConnection.onicecandidate = (event) => {
				if (event.candidate) {
					console.log("Wysyłanie kandydata ICE...");
					socket.emit("webrtc:ice-candidate", {
						sender: props.network.nick,
						target: user,
						candidate: event.candidate,
					});
				}
			};

			store.state.peerConnection.ontrack = (event) => {
				if (remoteVideo.value) {
					console.log("Odbieranie strumienia od użytkownika...");
					remoteVideo.value.srcObject = event.streams[0];
				}
			};

			socket.emit("webrtc:request-stream", {sender: props.network.nick, target: user});
		};

		const registerWebRTC = () => {
			if (!props.network.nick) {
				console.warn("Brak ID użytkownika. Nie można zarejestrować WebRTC.");
				return;
			}

			socket.emit("webrtc:register", {username: props.network.nick});

			socket.on("webrtc:registered", ({username}) => {
				if (username === props.network.nick) {
					console.log("Zarejestrowano WebRTC dla użytkownika:", username);
				}
			});
		};

		const startCamera = async () => {
			try {
				if (!store.localStream) {
					store.localStream = await navigator.mediaDevices.getUserMedia({
						video: true,
						audio: false,
					});
				}

				if (localVideo.value) {
					localVideo.value.srcObject = store.localStream;
				}
			} catch (error) {
				console.error("Błąd przy uruchamianiu kamery:", error);
			}
		};

		const stopCamera = () => {
			if (store.localStream) {
				store.localStream.getTracks().forEach((track) => track.stop());
				store.localStream = null;
			}

			if (localVideo.value) {
				localVideo.value.srcObject = null;
			}
		};

		const startCall = async () => {
			console.log("Rozpoczynanie połączenia WebRTC...");

			if (!store.localStream) {
				console.warn("Najpierw włącz kamerę!");
				return;
			}

			store.commit(
				"peerConnection",
				new RTCPeerConnection({
					iceServers: [{urls: "stun:stun.l.google.com:19302"}],
				})
			);
			console.log("RTCPeerConnection utworzone:", store.state.peerConnection);

			store.localStream.getTracks().forEach((track) => {
				store.state.peerConnection?.addTrack(track, store.localStream!);
			});

			store.state.peerConnection.ontrack = (event) => {
				if (remoteVideo.value) {
					remoteVideo.value.srcObject = event.streams[0];
				}
			};
		};

		const endCall = () => {
			if (store.state.peerConnection) {
				store.state.peerConnection.close();
				store.commit("peerConnection", null);
			}

			if (remoteVideo.value) {
				remoteVideo.value.srcObject = null;
			}
		};

		socket.on("webrtc:offer-request", async ({sender}) => {
			console.log("Otrzymano prośbę o strumień od użytkownika:", sender);

			// Tworzenie nowego połączenia
			store.commit(
				"peerConnection",
				new RTCPeerConnection({
					iceServers: [{urls: "stun:stun.l.google.com:19302"}],
				})
			);

			// Obsługa kandydatów ICE
			store.state.peerConnection.onicecandidate = (event) => {
				if (event.candidate) {
					socket.emit("webrtc:ice-candidate", {
						sender: props.network.nick,
						target: sender,
						candidate: event.candidate,
					});
					console.log("Wysłano ICE Candidate:", event.candidate);
				}
			};

			store.state.peerConnection.ontrack = (event) => {
				if (remoteVideo.value) {
					remoteVideo.value.srcObject = event.streams[0];
				}
			};

			// Dodanie strumienia lokalnego do połączenia
			if (store.localStream) {
				store.localStream.getTracks().forEach((track) => {
					store.state.peerConnection?.addTrack(track, store.localStream!);
				});
			}

			// Tworzenie i wysyłanie oferty
			const offer = await store.state.peerConnection.createOffer();
			await store.state.peerConnection.setLocalDescription(offer);

			socket.emit("webrtc:offer", {
				sender: props.network.nick,
				target: sender,
				offer,
			});

			console.log("Wysłano ofertę WebRTC:", offer);
		});

		socket.on("webrtc:offer", async ({sender, target, offer}) => {
			console.log(sender);
			console.log(offer);
			if (!store.state.peerConnection) {
				store.commit(
					"peerConnection",
					new RTCPeerConnection({
						iceServers: [{urls: "stun:stun.l.google.com:19302"}],
					})
				);

				store.state.peerConnection.onicecandidate = (event) => {
					if (event.candidate) {
						socket.emit("webrtc:ice-candidate", {
							sender: target,
							target: sender,
							candidate: event.candidate,
						});
					}
				};

				store.state.peerConnection.ontrack = (event) => {
					if (remoteVideo.value) {
						remoteVideo.value.srcObject = event.streams[0];
					}
				};

				if (store.localStream) {
					store.localStream
						.getTracks()
						.forEach((track) =>
							store.state.peerConnection?.addTrack(track, store.localStream!)
						);
				}
			}

			await store.state.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
			const answer = await store.state.peerConnection.createAnswer();
			await store.state.peerConnection.setLocalDescription(answer);

			socket.emit("webrtc:answer", {
				sender: target,
				target: sender,
				answer,
			});
		});

		socket.on("webrtc:answer", async ({sender, answer}) => {
			if (store.state.peerConnection) {
				await store.state.peerConnection.setRemoteDescription(
					new RTCSessionDescription(answer)
				);
			}
		});

		socket.on("webrtc:ice-candidate", async ({sender, candidate}) => {
			if (store.state.peerConnection) {
				await store.state.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
			}
		});

		let broadcastersInterval: number | null = null;

		onMounted(() => {
			registerWebRTC();
			getBroadcasters();
			broadcastersInterval = setInterval(getBroadcasters, 10000);
		});

		onUnmounted(() => {
			if (broadcastersInterval) {
				clearInterval(broadcastersInterval);
				broadcastersInterval = null;
			}
			endCall(); // Zatrzymujemy połączenie, ale nie kamerę
		});

		return {
			localVideo,
			remoteVideo,
			startCamera,
			stopCamera,
			startCall,
			endCall,
			getBroadcasters,
			connectToStream,
			broadcasters,
		};
	},
});
</script>

<style scoped>
.webrtc-container {
	display: flex;
	align-items: flex-start;
}

.video-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	align-self: center; /* Wyrównanie do środka */
	width: 100%;
}

.broadcasters-list {
	width: 300px;
	margin-left: 10px; /* Zmniejszony odstęp od kamer */
	padding: 10px;
	background: #f8f9fa;
	border: 1px solid #ccc;
	border-radius: 5px;
	text-align: center;
}

.webrtc-camera {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10px;
}

video {
	width: 400px;
	height: 200px;
	background: black;
	border: 1px solid #ccc;
}

.controls {
	display: flex;
	gap: 10px;
}
button {
	padding: 10px;
	background: #007bff;
	color: white;
	border: none;
	cursor: pointer;
}
button:hover {
	background: #0056b3;
}

.broadcasters-list ul {
	list-style: none;
	padding: 0;
}

.broadcasters-list li {
	padding: 5px 0;
	border-bottom: 1px solid #ddd;
	cursor: pointer;
}

.broadcasters-list li:last-child {
	border-bottom: none;
}
</style>
