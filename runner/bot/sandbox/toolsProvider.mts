import { fromFileUrl } from "jsr:@std/path/from-file-url"
import { Paths, ToolHandlerResponse } from "./engine/tools/paths.mts"
import { defaultUtil } from "../../runner.mts"

const handle = async (path: Paths, data: Promise<unknown>) => {
	switch (path) {
		case Paths.dumpTags:
			return defaultUtil.dumpTags()
		case Paths.findTags:
			return defaultUtil.findTags((await data) as string)
		case Paths.fetchTag:
			return defaultUtil.fetchTag((await data) as string)
	}
	const _check: never = path
}

const path = fromFileUrl(import.meta.resolve("./engine/tools.uds"))
await Deno.remove(path).catch(() => {})

Deno.serve(
	{ transport: "unix", path },
	async (conn) => {
		const response: ToolHandlerResponse = await handle(
			new URL(conn.url).pathname as Paths,
			conn.json().catch(() => null),
		)
			.then((v) => ({
				value: v,
			}))
			.catch((e) => ({
				error: `${e}`,
			}))
		if (response === undefined) {
			return new Response(null, { status: 404 })
		}
		return Response.json(response)
	},
).unref()
