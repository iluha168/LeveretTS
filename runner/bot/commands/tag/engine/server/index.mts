import { createServer } from "node:net"
import { rmSync } from "node:fs"
import { evalCode } from "./evaluation.mts"

export const runServer = (listenAt: string) => {
	rmSync(listenAt)
	createServer((socket) => {
		let packet = ""
		socket.on("data", async (data) => {
			packet += data.toString("utf8")
			const [code, tagJSON, empty] = packet.split("\0")
			if (empty === undefined) return
			const output = await evalCode(code, tagJSON ? JSON.parse(tagJSON) : undefined)
			socket.write(JSON.stringify(output) + "\0", "utf8")
		})
	}).listen(listenAt)
}
