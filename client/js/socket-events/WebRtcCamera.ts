import socket from "../socket";
import {store} from "../store";

// Obsługa wiadomości przychodzących z serwera WebRTC
socket.on("webrtc:offer", async ({sender, target, offer}) => {
	if (!store.peerConnection) {
		store.peerConnection = new RTCPeerConnection({
			iceServers: [{urls: "stun:stun.l.google.com:19302"}],
		});

		store.peerConnection.onicecandidate = (event) => {
			if (event.candidate) {
				socket.emit("webrtc:ice-candidate", {
					sender: target,
					target: sender,
					candidate: event.candidate,
				});
			}
		};

		store.peerConnection.ontrack = (event) => {
			if (store.remoteVideo) {
				store.remoteVideo.srcObject = event.streams[0];
			}
		};

		if (store.localStream) {
			store.localStream
				.getTracks()
				.forEach((track) => store.peerConnection?.addTrack(track, store.localStream));
		}
	}

	await store.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
	const answer = await store.peerConnection.createAnswer();
	await store.peerConnection.setLocalDescription(answer);

	socket.emit("webrtc:answer", {
		sender: target,
		target: sender,
		answer,
	});
});

socket.on("webrtc:answer", async ({sender, answer}) => {
	if (store.peerConnection) {
		await store.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
	}
});

socket.on("webrtc:ice-candidate", async ({sender, candidate}) => {
	if (store.peerConnection) {
		await store.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
	}
});
