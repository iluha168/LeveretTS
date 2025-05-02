import { createServer } from "node:net"
import { rmSync } from "node:fs"
import { evalCode } from "./evaluation.mts"

export const runServer = (listenAt: string) => {
	rmSync(listenAt)
	createServer((socket) => {
		let packet = ""
		socket.on("data", async (data) => {
			packet += data.toString("utf8")
			if (packet.charCodeAt(-1)) return
			const output = await evalCode(JSON.parse(packet.slice(0, -1)))
			socket.write(JSON.stringify(output) + "\0", "utf8")
		})
	}).listen(listenAt)
}
