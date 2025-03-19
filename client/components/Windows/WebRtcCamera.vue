<template>
	<div class="webrtc-camera">
		<h2>Podgląd kamery</h2>
		<video ref="localVideo" autoplay playsinline></video>
		<video ref="remoteVideo" autoplay playsinline></video>

		<div class="controls">
			<button @click="startCamera">Włącz kamerę</button>
			<button @click="stopCamera">Wyłącz kamerę</button>
			<button @click="startCall">Rozpocznij połączenie</button>
			<button @click="endCall">Zakończ połączenie</button>
		</div>
	</div>
</template>

<script lang="ts">
import {defineComponent, ref, onUnmounted} from "vue";

export default defineComponent({
	name: "WebRtcCamera",
	setup() {
		const localVideo = ref<HTMLVideoElement | null>(null);
		const remoteVideo = ref<HTMLVideoElement | null>(null);
		let localStream: MediaStream | null = null;
		let peerConnection: RTCPeerConnection | null = null;

		const signalingServer = new WebSocket("wss://chatik.pl/chat/");

		const startCamera = async () => {
			try {
				localStream = await navigator.mediaDevices.getUserMedia({
					video: true,
					audio: false,
				});
				if (localVideo.value) {
					localVideo.value.srcObject = localStream;
				}
			} catch (error) {
				console.error("Błąd przy uruchamianiu kamery:", error);
			}
		};

		const stopCamera = () => {
			if (localStream) {
				localStream.getTracks().forEach((track) => track.stop());
				localStream = null;
			}
			if (localVideo.value) {
				localVideo.value.srcObject = null;
			}
		};

		const startCall = async () => {
			if (!localStream) {
				console.warn("Najpierw włącz kamerę!");
				return;
			}

			peerConnection = new RTCPeerConnection({
				iceServers: [{urls: "stun:stun.l.google.com:19302"}],
			});

			localStream.getTracks().forEach((track) => {
				peerConnection?.addTrack(track, localStream!);
			});

			peerConnection.onicecandidate = (event) => {
				if (event.candidate) {
					signalingServer.send(
						JSON.stringify({type: "ice-candidate", candidate: event.candidate})
					);
				}
			};

			peerConnection.ontrack = (event) => {
				if (remoteVideo.value) {
					remoteVideo.value.srcObject = event.streams[0];
				}
			};

			const offer = await peerConnection.createOffer();
			await peerConnection.setLocalDescription(offer);

			signalingServer.send(JSON.stringify({type: "offer", offer}));
		};

		const endCall = () => {
			if (peerConnection) {
				peerConnection.close();
				peerConnection = null;
			}
			if (remoteVideo.value) {
				remoteVideo.value.srcObject = null;
			}
		};

		signalingServer.onmessage = async (event) => {
			const message = JSON.parse(event.data);

			if (message.type === "offer") {
				if (!peerConnection) {
					peerConnection = new RTCPeerConnection({
						iceServers: [{urls: "stun:stun.l.google.com:19302"}],
					});

					peerConnection.onicecandidate = (event) => {
						if (event.candidate) {
							signalingServer.send(
								JSON.stringify({type: "ice-candidate", candidate: event.candidate})
							);
						}
					};

					peerConnection.ontrack = (event) => {
						if (remoteVideo.value) {
							remoteVideo.value.srcObject = event.streams[0];
						}
					};

					if (localStream) {
						localStream
							.getTracks()
							.forEach((track) => peerConnection?.addTrack(track, localStream));
					}
				}

				await peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer));
				const answer = await peerConnection.createAnswer();
				await peerConnection.setLocalDescription(answer);

				signalingServer.send(JSON.stringify({type: "answer", answer}));
			}

			if (message.type === "answer" && peerConnection) {
				await peerConnection.setRemoteDescription(
					new RTCSessionDescription(message.answer)
				);
			}

			if (message.type === "ice-candidate" && peerConnection) {
				await peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
			}
		};

		onUnmounted(() => {
			stopCamera();
			endCall();
			signalingServer.close();
		});

		return {
			localVideo,
			remoteVideo,
			startCamera,
			stopCamera,
			startCall,
			endCall,
		};
	},
});
</script>

<style scoped>
.webrtc-camera {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10px;
}

video {
	width: 300px;
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
</style>
