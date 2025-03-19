<template>
	<div id="chat-container" class="window" :data-current-channel="channel.name" lang="">
		<div
			id="chat"
			:class="{
				'hide-motd': !store.state.settings.motd,
				'time-seconds': store.state.settings.showSeconds,
				'time-12h': store.state.settings.use12hClock,
				'colored-nicks': true, // TODO temporarily fixes themes, to be removed in next major version
			}"
		>
			<div
				:id="'chan-' + channel.id"
				class="chat-view"
				:data-type="channel.type"
				:aria-label="'Obecnie otwarty ' + channel.type"
				role="tabpanel"
			>
				<div class="header">
					<SidebarToggle />
					<span class="title" :aria-label="'Obecnie otwarty ' + channel.type">{{
						channel.name
					}}</span>
					<div v-if="channel.editTopic === true" class="topic-container">
						<input
							ref="topicInput"
							:value="channel.topic"
							class="topic-input"
							placeholder="Ustaw temat kanału"
							enterkeyhint="done"
							@keyup.enter="saveTopic"
							@keyup.esc="channel.editTopic = false"
						/>
						<span aria-label="Zapisz temat" class="save-topic" @click="saveTopic">
							<span type="button" aria-label="Zapisz temat"></span>
						</span>
					</div>
					<span
						v-else
						:title="channel.topic"
						:class="{topic: true, empty: !channel.topic}"
						@dblclick="editTopic"
						><ParsedMessage
							v-if="channel.topic"
							:network="network"
							:text="channel.topic"
					/></span>
					<button @click="toggleWebRTC" class="webrtc-toggle">📹</button>
					<MessageSearchForm
						v-if="
							store.state.settings.searchEnabled &&
							['channel', 'query'].includes(channel.type)
						"
						:network="network"
						:channel="channel"
					/>
					<button
						class="mentions"
						aria-label="Otwórz swoje wzmianki"
						@click="openMentions"
					/>
					<button
						class="menu"
						aria-label="Otwórz menu kontekstowe"
						@click="openContextMenu"
					/>
					<span
						v-if="channel.type === 'channel'"
						class="rt-tooltip tooltipped tooltipped-w"
						aria-label="Przełącz listę użytkowników"
					>
						<button
							class="rt"
							aria-label="Przełącz listę użytkowników"
							@click="store.commit('toggleUserlist')"
						/>
					</span>
				</div>
				<div v-if="showWebRTC" class="webrtc-overlay">
					<WebRtcCamera :network="network" />
					<button @click="toggleWebRTC" class="close-webrtc">❌</button>
				</div>
				<div v-if="channel.type === 'special'" class="chat-content">
					<div class="chat">
						<div class="messages">
							<div class="msg">
								<component
									:is="specialComponent"
									:network="network"
									:channel="channel"
								/>
							</div>
						</div>
					</div>
				</div>
				<div v-else class="chat-content">
					<div
						:class="[
							'scroll-down tooltipped tooltipped-w tooltipped-no-touch',
							{'scroll-down-shown': !channel.scrolledToBottom},
						]"
						aria-label="Przejdź do najnowszych wiadomości"
						@click="messageList?.jumpToBottom()"
					>
						<div class="scroll-down-arrow" />
					</div>
					<div class="chat-sidebars">
						<ChatUserList v-if="channel.type === 'channel'" :channel="channel" />
						<ChannelsList
							v-if="network.channels.length > 0"
							:network="network"
							:activeChannel="channel.name"
							@select-channel="setActiveChannel"
						/>
					</div>
					<MessageList
						ref="messageList"
						:network="network"
						:channel="channel"
						:focused="focused"
					/>
				</div>
			</div>
		</div>
		<div
			v-if="store.state.currentUserVisibleError"
			id="user-visible-error"
			@click="hideUserVisibleError"
		>
			{{ store.state.currentUserVisibleError }}
		</div>
		<ChatInput :network="network" :channel="channel" />
	</div>
</template>
<style scoped>
.chat-sidebars {
	display: flex;
	flex-direction: column; /* Ustawienie pionowe */
	width: 180px; /* Dostosuj szerokość */
	height: 100vh; /* Pełna wysokość ekranu */
	overflow-y: auto; /* Włącz przewijanie, jeśli nie mieszczą się na ekranie */
}

.userlist {
	flex: 1;
	max-height: 50%;
	overflow: auto;
}

.channellist {
	flex: 1;
	max-height: 50%;
	overflow: auto;
	width: 180px; /* Dostosuj szerokość */
}
/* Gdy `ChatUserList` jest ukryty (`display: none`), `ChannelsList` zajmuje 100% */
.userlist[style*="display: none"] ~ .channellist {
	max-height: 100%;
}

/* Gdy `ChannelsList` jest ukryty (`display: none`), `ChatUserList` zajmuje 100% */
.channellist[style*="display: none"] ~ .userlist {
	max-height: 100%;
}

.webrtc-toggle {
	margin-left: 10px;
	padding: 5px;
	cursor: pointer;
	background: #007bff;
	color: white;
	border: none;
	border-radius: 3px;
}

.webrtc-overlay {
	position: fixed;
	top: 10%;
	left: 50%;
	transform: translateX(-50%);
	width: 800px;
	height: 550px;
	background: rgba(0, 0, 0, 0.9);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
	border-radius: 5px;
	padding: 10px;
}

.close-webrtc {
	position: absolute;
	top: 5px;
	right: 5px;
	background: red;
	color: white;
	border: none;
	cursor: pointer;
	padding: 5px;
	border-radius: 3px;
}
</style>
<script lang="ts">
import socket from "../js/socket";
import eventbus from "../js/eventbus";
import ParsedMessage from "./ParsedMessage.vue";
import MessageList from "./MessageList.vue";
import ChatInput from "./ChatInput.vue";
import ChatUserList from "./ChatUserList.vue";
import ChannelsList from "./ChannelList.vue";
import SidebarToggle from "./SidebarToggle.vue";
import MessageSearchForm from "./MessageSearchForm.vue";
import ListBans from "./Special/ListBans.vue";
import ListInvites from "./Special/ListInvites.vue";
import ListChannels from "./Special/ListChannels.vue";
import ListIgnored from "./Special/ListIgnored.vue";
import {defineComponent, PropType, ref, computed, watch, nextTick, onMounted, Component} from "vue";
import WebRtcCamera from "./Windows/WebRtcCamera.vue";
import type {ClientNetwork, ClientChan} from "../js/types";
import {useStore} from "../js/store";
import {SpecialChanType, ChanType} from "../../shared/types/chan";

export default defineComponent({
	name: "Chat",
	components: {
		ParsedMessage,
		MessageList,
		ChatInput,
		ChatUserList,
		ChannelsList,
		SidebarToggle,
		MessageSearchForm,
		WebRtcCamera,
	},
	props: {
		network: {type: Object as PropType<ClientNetwork>, required: true},
		channel: {type: Object as PropType<ClientChan>, required: true},
		focused: Number,
	},
	emits: ["channel-changed"],
	setup(props, {emit}) {
		const store = useStore();

		const messageList = ref<typeof MessageList>();
		const showWebRTC = ref(false);
		const topicInput = ref<HTMLInputElement | null>(null);

		const toggleWebRTC = () => {
			showWebRTC.value = !showWebRTC.value;
		};

		const specialComponent = computed(() => {
			switch (props.channel.special) {
				case SpecialChanType.BANLIST:
					return ListBans as Component;
				case SpecialChanType.INVITELIST:
					return ListInvites as Component;
				case SpecialChanType.CHANNELLIST:
					return ListChannels as Component;
				case SpecialChanType.IGNORELIST:
					return ListIgnored as Component;
			}

			return undefined;
		});

		const channelChanged = () => {
			// Triggered when active channel is set or changed
			emit("channel-changed", props.channel);

			socket.emit("open", props.channel.id);

			if (props.channel.usersOutdated) {
				props.channel.usersOutdated = false;

				socket.emit("names", {
					target: props.channel.id,
				});
			}
		};

		const hideUserVisibleError = () => {
			store.commit("currentUserVisibleError", null);
		};

		const editTopic = () => {
			if (props.channel.type === ChanType.CHANNEL) {
				props.channel.editTopic = true;
			}
		};

		const saveTopic = () => {
			props.channel.editTopic = false;

			if (!topicInput.value) {
				return;
			}

			const newTopic = topicInput.value.value;

			if (props.channel.topic !== newTopic) {
				const target = props.channel.id;
				const text = `/topic ${newTopic}`;
				socket.emit("input", {target, text});
			}
		};

		const openContextMenu = (event: any) => {
			eventbus.emit("contextmenu:channel", {
				event: event,
				channel: props.channel,
				network: props.network,
			});
		};

		const openMentions = (event: any) => {
			eventbus.emit("mentions:toggle", {
				event: event,
			});
		};

		watch(
			() => props.channel,
			() => {
				channelChanged();
			}
		);

		watch(
			() => props.channel.editTopic,
			(newTopic) => {
				if (newTopic) {
					void nextTick(() => {
						topicInput.value?.focus();
					});
				}
			}
		);

		onMounted(() => {
			channelChanged();

			if (props.channel.editTopic) {
				void nextTick(() => {
					topicInput.value?.focus();
				});
			}
		});

		return {
			store,
			messageList,
			topicInput,
			specialComponent,
			showWebRTC,
			toggleWebRTC,
			hideUserVisibleError,
			editTopic,
			saveTopic,
			openContextMenu,
			openMentions,
		};
	},
});
</script>
