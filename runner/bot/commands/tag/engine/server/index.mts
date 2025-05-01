import { createServer } from "node:net"
import { rmSync } from "node:fs"
import { evalCode } from "./evaluation.mts"

export const runServer = (listenAt: string) => {
	rmSync(listenAt)
	createServer((socket) => {
		let code = ""
		socket.on("data", async (data) => {
			code += data.toString("utf8")
			if (data.at(-1)) return
			const output = await evalCode(code.slice(0, -1))
			socket.write(JSON.stringify(output) + "\0", "utf8")
		})
	}).listen(listenAt)
}
