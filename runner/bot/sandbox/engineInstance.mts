import { fromFileUrl } from "path/from-file-url"
import { CodeEvalProps } from "./CodeEvalProps.mts"
import type { ValidatedReply } from "./engine/tools/ValidatedReply.d.ts"
import {} from "./toolsProvider.mts"

const f = (path: string) => fromFileUrl(import.meta.resolve(path))

new Deno.Command(f("./engine/launch.sh"), {
	cwd: f("./engine/"),
	stdin: "null",
	stderr: "inherit",
	stdout: "inherit",
}).spawn().unref()

const sandboxPath = {
	transport: "unix",
	path: f("./engine/sandbox.uds"),
} satisfies Deno.UnixAddr

export const evalCode = async (props: CodeEvalProps): Promise<ValidatedReply | undefined> => {
	const sock = await Deno.connect(sandboxPath)
	const toWrite = new TextEncoder().encode(
		JSON.stringify(props) + "\0",
	)
	for (
		let written = 0;
		written < toWrite.byteLength;
		written += await sock.write(toWrite.subarray(written))
	);
	let json = ""
	const TD = new TextDecoder()
	for await (const chunk of sock.readable) {
		json += TD.decode(chunk)
		if (!chunk.at(-1)) break
	}
	try {
		sock.close()
	} catch { /* ignored */ }
	json = json.slice(0, -1)
	json = json ? JSON.parse(json) : undefined
	return typeof json === "string" ? { content: json } : json
}
