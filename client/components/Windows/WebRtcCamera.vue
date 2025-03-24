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
				<div class="connection-info">
					<p>ICE state: {{ iceState }}</p>
					<p>PeerConnection state: {{ connectionState }}</p>
				</div>
			</div>
		</div>

		<div class="sidebar-lists">
			<div class="broadcasters-list">
				<h3>Lista nadających użytkowników</h3>
				<ul>
					<li v-for="user in broadcasters" :key="user" @click="connectToStream(user)">
						{{ user }}
					</li>
				</ul>
			</div>
			<div class="viewers-list">
				<h3>Lista oglądających użytkowników</h3>
				<ul>
					<li v-for="viewer in viewers" :key="viewer">
						{{ viewer }}
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import {defineComponent, ref, onMounted, onUnmounted, watchEffect} from "vue";
import socket from "../../js/socket"; // Teraz socket jest importowany bezpośrednio
import {store} from "../../js/store";

export default defineComponent({
	name: "WebRtcCamera",
	props: {
		network: Object, // Pobieranie network z props
	},
	setup(props) {
		let broadcastersInterval: NodeJS.Timeout | null = null;
		let rtcConfig = {
			iceServers: [],
		};

		const localVideo = ref<HTMLVideoElement | null>(null);
		const remoteVideo = ref<HTMLVideoElement | null>(null);
		let remoteDescriptionSet = false;
		const broadcasters = ref<string[]>([]);
		const viewers = ref<string[]>([]);
		let isRemoteDescriptionSet = false;
		const iceState = ref("");
		const connectionState = ref("");

		const getBroadcasters = () => {
			socket.emit("webrtc:get-broadcasters");

			socket.on("webrtc:broadcasters-list", ({broadcasters: receivedBroadcasters}) => {
				broadcasters.value = receivedBroadcasters;
				//console.log("Otrzymano listę nadających użytkowników:", broadcasters.value);
			});
		};

		const connectToStream = (user: string) => {
			console.log(`Łączenie z użytkownikiem: ${user}`);

			if (!store.state.incomingPeerConnections[user]) {
				store.commit("addIncomingPeerConnection", {
					sender: user,
					connection: new RTCPeerConnection(rtcConfig),
				});
			}

			const pc = store.state.incomingPeerConnections[user];

			if (!pc) {
				console.error(`Nie udało się znaleźć połączenia dla ${user}`);
				return;
			}

			iceState.value = pc.iceConnectionState;
			connectionState.value = pc.connectionState;

			pc.oniceconnectionstatechange = () => {
				console.log("🧊 ICE state:", pc.iceConnectionState);
				iceState.value = pc.iceConnectionState || "";
			};

			pc.onconnectionstatechange = () => {
				console.log("🔗 Connection state:", pc.connectionState);
				connectionState.value = pc.connectionState || "";
			};

			pc.onicegatheringstatechange = () => {
				console.log("📡 ICE gathering state:", pc.iceGatheringState);
			};

			pc.onicecandidate = (event) => {
				if (event.candidate) {
					console.log("Wysyłanie ICE Candidate (connectToStream):", event.candidate);
					socket.emit("webrtc:ice-candidate", {
						sender: props.network.nick,
						target: user,
						candidate: event.candidate,
					});
				}
			};

			pc.ontrack = (event) => {
				if (remoteVideo.value) {
					console.log("Odbieranie strumienia od użytkownika...");
					remoteVideo.value.srcObject = event.streams[0];
				}
			};

			store.state.incomingPeerConnections[user].oniceconnectionstatechange = () => {
				console.log(
					"🧊 ICE state:",
					store.state.incomingPeerConnections[user]?.iceConnectionState
				);
				iceState.value =
					store.state.incomingPeerConnections[user]?.iceConnectionState || "";
			};

			store.state.incomingPeerConnections[user].onconnectionstatechange = () => {
				console.log(
					"🔗 Connection state:",
					store.state.incomingPeerConnections[user]?.connectionState
				);
				connectionState.value =
					store.state.incomingPeerConnections[user]?.connectionState || "";
			};

			store.state.incomingPeerConnections[user].onicegatheringstatechange = () => {
				console.log(
					"📡 ICE gathering state:",
					store.state.incomingPeerConnections[user]?.iceGatheringState
				);
			};

			store.state.incomingPeerConnections[user].onicecandidate = (event) => {
				if (event.candidate) {
					console.log("Wysyłanie ICE Candidate (connectToStream):", event.candidate);
					socket.emit("webrtc:ice-candidate", {
						sender: props.network.nick,
						target: user,
						candidate: event.candidate,
					});
				}
			};

			store.state.incomingPeerConnections[user].ontrack = (event) => {
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

			socket.on("webrtc:rtc-config", ({rtcConfig: receivedConfig}) => {
				console.log("Otrzymano RTC config z serwera:", receivedConfig);
				rtcConfig = receivedConfig;
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
					socket.emit("webrtc:camera-on", {username: props.network.nick});
				}
			} catch (error) {
				console.error("Błąd przy uruchamianiu kamery:", error);
			}
		};

		const stopCamera = () => {
			if (store.localStream) {
				store.localStream.getTracks().forEach((track) => track.stop());
				store.localStream = null;
				socket.emit("webrtc:camera-off", {username: props.network.nick});
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
			const pc = new RTCPeerConnection(rtcConfig);
			store.commit("addOutgoingPeerConnection", {target: props.network.nick, connection: pc});

			console.log("RTCPeerConnection utworzone:", store.state.peerConnection);
			console.log(
				"Tworzę RTCPeerConnection z configiem:",
				JSON.stringify(rtcConfig, null, 2)
			);

			store.state.peerConnection.oniceconnectionstatechange = () => {
				console.log("🧊 ICE state:", store.state.peerConnection?.iceConnectionState);
				iceState.value = store.state.peerConnection?.iceConnectionState || "";
			};

			store.state.peerConnection.onconnectionstatechange = () => {
				console.log("🔗 Connection state:", store.state.peerConnection?.connectionState);
				connectionState.value = store.state.peerConnection?.connectionState || "";
			};
			store.state.peerConnection.onicegatheringstatechange = () => {
				console.log(
					"📡 ICE gathering state:",
					store.state.peerConnection?.iceGatheringState
				);
			};

			if (!rtcConfig.iceServers.length) {
				console.warn("⚠️ rtcConfig.iceServers jest puste! Połączenie może się nie udać.");
			}

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
				store.state.peerConnection.oniceconnectionstatechange = null;
				store.state.peerConnection.onconnectionstatechange = null;
				store.state.peerConnection.onicegatheringstatechange = null;
				store.state.peerConnection.onicecandidate = null;
				store.state.peerConnection.ontrack = null;

				store.state.peerConnection.getSenders().forEach((sender) => {
					store.state.peerConnection?.removeTrack(sender);
				});

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
			const pc = new RTCPeerConnection(rtcConfig);
			store.commit("addOutgoingPeerConnection", {target: sender, connection: pc});

			console.log(
				"Tworzę RTCPeerConnection z configiem:",
				JSON.stringify(rtcConfig, null, 2)
			);

			if (!rtcConfig.iceServers.length) {
				console.warn("⚠️ rtcConfig.iceServers jest puste! Połączenie może się nie udać.");
			}

			store.state.outgoingPeerConnections[sender].oniceconnectionstatechange = () => {
				console.log(
					"🧊 ICE state:",
					store.state.outgoingPeerConnections[sender]?.iceConnectionState
				);
				iceState.value =
					store.state.outgoingPeerConnections[sender]?.iceConnectionState || "";
			};

			store.state.outgoingPeerConnections[sender].onconnectionstatechange = () => {
				console.log(
					"🔗 Connection state:",
					store.state.outgoingPeerConnections[sender]?.connectionState
				);
				connectionState.value =
					store.state.outgoingPeerConnections[sender]?.connectionState || "";
			};
			store.state.outgoingPeerConnections[sender].onicegatheringstatechange = () => {
				console.log(
					"📡 ICE gathering state:",
					store.state.outgoingPeerConnections[sender]?.iceGatheringState
				);
			};

			// Obsługa kandydatów ICE
			store.state.outgoingPeerConnections[sender].onicecandidate = (event) => {
				if (event.candidate) {
					socket.emit("webrtc:ice-candidate", {
						sender: props.network.nick,
						target: sender,
						candidate: event.candidate,
					});
					console.log("Wysłano ICE Candidate:", event.candidate);
				}
			};

			store.state.outgoingPeerConnections[sender].ontrack = (event) => {
				if (remoteVideo.value) {
					remoteVideo.value.srcObject = event.streams[0];
				}
			};

			// Dodanie strumienia lokalnego do połączenia
			if (store.localStream) {
				store.localStream.getTracks().forEach((track) => {
					store.state.outgoingPeerConnections[sender]?.addTrack(
						track,
						store.localStream!
					);
				});
			}

			// Tworzenie i wysyłanie oferty
			const offer = await store.state.outgoingPeerConnections[sender].createOffer();
			await store.state.outgoingPeerConnections[sender].setLocalDescription(offer);

			if (store.state.outgoingPeerConnections[sender].iceGatheringState === "complete") {
				socket.emit("webrtc:offer", {
					sender: props.network.nick,
					target: sender,
					offer: store.state.outgoingPeerConnections[sender].localDescription,
				});
			} else {
				const waitForIceComplete = new Promise<void>((resolve) => {
					const checkState = () => {
						if (
							store.state.outgoingPeerConnections[sender].iceGatheringState ===
							"complete"
						) {
							store.state.outgoingPeerConnections[sender].removeEventListener(
								"icegatheringstatechange",
								checkState
							);
							resolve();
						}
					};
					store.state.outgoingPeerConnections[sender].addEventListener(
						"icegatheringstatechange",
						checkState
					);
				});
				await waitForIceComplete;

				socket.emit("webrtc:offer", {
					sender: props.network.nick,
					target: sender,
					offer: store.state.outgoingPeerConnections[sender].localDescription,
				});
			}
		});

		socket.on("webrtc:offer", async ({sender, target, offer}) => {
			console.log("Otrzymano oferte od: ", sender);

			if (!store.state.incomingPeerConnections[sender]) {
				const pc = new RTCPeerConnection(rtcConfig);
				store.commit("addIncomingPeerConnection", {target: sender, connection: pc});

				store.state.incomingPeerConnections[sender].oniceconnectionstatechange = () => {
					console.log(
						"🧊 ICE state:",
						store.state.incomingPeerConnections[sender]?.iceConnectionState
					);
					iceState.value =
						store.state.incomingPeerConnections[sender]?.iceConnectionState || "";
				};

				store.state.incomingPeerConnections[sender].onconnectionstatechange = () => {
					console.log(
						"🔗 Connection state:",
						store.state.incomingPeerConnections[sender]?.connectionState
					);
					connectionState.value =
						store.state.incomingPeerConnections[sender]?.connectionState || "";
				};
				store.state.incomingPeerConnections[sender].onicegatheringstatechange = () => {
					console.log(
						"📡 ICE gathering state:",
						store.state.incomingPeerConnections[sender]?.iceGatheringState
					);
				};

				store.state.incomingPeerConnections[sender].onicecandidate = (event) => {
					if (event.candidate) {
						socket.emit("webrtc:ice-candidate", {
							sender: target,
							target: sender,
							candidate: event.candidate,
						});
					}
				};

				store.state.incomingPeerConnections[sender].ontrack = (event) => {
					console.log("📺 ontrack fired!", event.streams);

					if (remoteVideo.value) {
						remoteVideo.value.srcObject = event.streams[0];
					}
				};

				if (store.localStream) {
					store.localStream
						.getTracks()
						.forEach((track) =>
							store.state.incomingPeerConnections[sender]?.addTrack(
								track,
								store.localStream!
							)
						);
				}
			}

			try {
				await store.state.incomingPeerConnections[sender].setRemoteDescription(
					new RTCSessionDescription(offer)
				);
				isRemoteDescriptionSet = true;

				for (const c of pendingCandidates) {
					try {
						await store.state.incomingPeerConnections[sender].addIceCandidate(
							new RTCIceCandidate(c)
						);
					} catch (e) {
						console.warn("Nie udało się dodać buforowanego ICE candidate:", e);
					}
				}
				pendingCandidates.length = 0;

				const answer = await store.state.incomingPeerConnections[sender].createAnswer();

				if (!answer) {
					console.error("❌ createAnswer() zwróciło null lub undefined!");
					return;
				}
				await store.state.incomingPeerConnections[sender].setLocalDescription(answer);

				if (store.state.incomingPeerConnections[sender].iceGatheringState === "complete") {
					socket.emit("webrtc:answer", {
						sender: target,
						target: sender,
						answer: store.state.incomingPeerConnections[sender].localDescription,
					});
					console.log(
						"Wysłano WebRTC answer do:",
						sender,
						"z konfiguracją:",
						store.state.incomingPeerConnections[sender].localDescription
					);
				} else {
					const waitForIceComplete = new Promise<void>((resolve) => {
						const checkState = () => {
							if (
								store.state.incomingPeerConnections[sender].iceGatheringState ===
								"complete"
							) {
								store.state.incomingPeerConnections[sender].removeEventListener(
									"icegatheringstatechange",
									checkState
								);
								resolve();
							}
						};

						store.state.incomingPeerConnections[sender].addEventListener(
							"icegatheringstatechange",
							checkState
						);
					});
					await waitForIceComplete;

					socket.emit("webrtc:answer", {
						sender: target,
						target: sender,
						answer: store.state.incomingPeerConnections[sender].localDescription,
					});
					console.log(
						"Wysłano WebRTC answer do:",
						sender,
						"z konfiguracją:",
						store.state.incomingPeerConnections[sender].localDescription
					);
				}
			} catch (error) {
				console.error("❌ Błąd podczas tworzenia odpowiedzi WebRTC:", error);
			}
		});

		socket.on("webrtc:answer", async ({sender, target, answer}) => {
			console.log(
				"Odebrano WebRTC answer od:",
				sender,
				"dla:",
				target,
				"z konfiguracją:",
				answer
			);

			if (store.state.outgoingPeerConnections[sender]) {
				await store.state.outgoingPeerConnections[sender].setRemoteDescription(
					new RTCSessionDescription(answer)
				);
			}
		});

		const pendingCandidates: RTCIceCandidateInit[] = [];

		socket.on("webrtc:ice-candidate", async ({sender, candidate}) => {
			console.log("Odebrano ICE-CANDIDATE");

			const rtc =
				store.state.incomingPeerConnections[sender] ||
				store.state.outgoingPeerConnections[sender];
			if (rtc) {
				if (isRemoteDescriptionSet) {
					try {
						await rtc.addIceCandidate(new RTCIceCandidate(candidate));
					} catch (e) {
						console.warn(
							"Nie udało się dodać ICE candidate od razu, wrzucam do bufora:",
							e
						);
						pendingCandidates.push(candidate);
					}
				} else {
					console.log("RemoteDescription niegotowa, buforuję ICE candidate");
					pendingCandidates.push(candidate);
				}
			}
		});

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

		watchEffect(() => {
			const allConnections = {
				...store.state.outgoingPeerConnections,
				...store.state.incomingPeerConnections,
			};

			Object.entries(allConnections).forEach(([target, pc]) => {
				if (pc) {
					pc.oniceconnectionstatechange = () => {
						console.log(`🧊 [${target}] ICE state:`, pc.iceConnectionState);
						iceState.value = pc.iceConnectionState;
					};
					pc.onconnectionstatechange = () => {
						console.log(`🔗 [${target}] Connection state:`, pc.connectionState);
						connectionState.value = pc.connectionState;

						if (pc.connectionState === "failed") {
							console.warn(`❌ Połączenie z ${target} zakończyło się błędem`);

							if (store.state.incomingPeerConnections[target]) {
								delete store.state.incomingPeerConnections[target];
								console.log(`🗑️ Usunięto połączenie przychodzące z ${target}`);
							}

							if (store.state.outgoingPeerConnections[target]) {
								delete store.state.outgoingPeerConnections[target];
								console.log(`🗑️ Usunięto połączenie wychodzące do ${target}`);
							}
						}
					};
				}
			});

			// Update viewers list based on outgoing peer connections
			viewers.value = Object.keys(store.state.outgoingPeerConnections);
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
			viewers,
			iceState,
			connectionState,
		};
	},
});
</script>

<style scoped>
.webrtc-container {
	display: flex;
	align-items: flex-start;
}

.viewers-list {
	width: 300px;
	margin-left: 10px;
	padding: 10px;
	background: #f1f3f5;
	border: 1px solid #ccc;
	border-radius: 5px;
	text-align: center;
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

.connection-info p {
	color: white;
}

.sidebar-lists {
	display: flex;
	flex-direction: column;
	margin-left: 10px;
}
</style>
