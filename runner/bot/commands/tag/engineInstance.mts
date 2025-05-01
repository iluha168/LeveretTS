import { fromFileUrl } from "jsr:@std/path/from-file-url"
import {} from "./toolsProvider.mts"

const f = (path: string) => fromFileUrl(import.meta.resolve(path))

new Deno.Command(f("./engine/launch.sh"), {
	cwd: f("./engine/"),
	stdin: "null",
	stderr: "inherit",
	stdout: "inherit",
}).spawn()

const sandboxPath = {
	transport: "unix",
	path: f("./engine/sandbox.uds"),
} satisfies Deno.UnixAddr

export const evalCode = async (code: string) => {
	const sock = await Deno.connect(sandboxPath)
	const toWrite = new TextEncoder().encode(code + "\0")
	for (
		let written = 0;
		written < toWrite.byteLength;
		written += await sock.write(toWrite.subarray(written))
	);
	let json = ""
	for await (
		const chunk of sock.readable
			.pipeThrough(new TextDecoderStream())
	) {
		json += chunk
		if (!chunk.charCodeAt(-1)) break
	}
	sock.close()
	return JSON.parse(json.slice(0, -1))
}
