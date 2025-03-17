import eventbus from "../eventbus";
import socket from "../socket";
import {ClientChan} from "../types";
import {ChanType} from "../../../shared/types/chan";

export default function useCloseChannel(channel: ClientChan) {
	return () => {
		if (channel.type === ChanType.LOBBY) {
			eventbus.emit(
				"confirm-dialog",
				{
					title: "Usuń sieć",
					text: `Czy na pewno chcesz opuścić i usunąć ${channel.name}? Tej operacji nie można cofnąć.`,
					button: "Usuń sieć",
				},
				(result: boolean) => {
					if (!result) {
						return;
					}

					channel.closed = true;
					socket.emit("input", {
						target: Number(channel.id),
						text: "/quit",
					});
				}
			);

			return;
		}

		channel.closed = true;

		socket.emit("input", {
			target: Number(channel.id),
			text: "/close",
		});
	};
}
