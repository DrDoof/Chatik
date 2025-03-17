import socket from "../socket";
import {store} from "../store";
import {switchToChannel} from "../router";
import {ClientNetwork} from "../../js/types";

socket.on("msg:special", function (data) {
	const netChan = store.getters.findChannel(data.chan);

	if (!netChan) {
		return;
	}

	netChan.channel.data = data.data;
	switchToChannel(netChan.channel);
});

socket.on("msg:chanlist", function (data) {
	console.log(data);
	const network: ClientNetwork | undefined = store.state.networks[0];

	if (!network) {
		console.error("❌ Brak obiektu sieci dla danych kanałów!");
		return;
	}

	if (!Array.isArray(data.data)) {
		console.error("❌ Nieprawidłowy format danych kanałów!", data.data);
		return;
	}

	const channelList = [...data.data];

	network.allChannels = channelList.map((chan) => ({
		channel: chan.channel || "Nieznany kanał", // Nazwa kanału
		num_users: chan.num_users, // Liczba użytkowników
		topic: chan.topic || "", // Temat kanału
		tags: chan.tags || {}, // Znaczniki (opcjonalne)
	}));

	//const allChannels = store.getters.findChannel(data.chan);
	//
	//if (!netChan) {
	//	return;
	//}
	//
	//netChan.channel.data = data.data;
	//switchToChannel(netChan.channel);
});
