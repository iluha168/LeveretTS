import { fromFileUrl } from "jsr:@std/path/from-file-url"
import { Paths } from "./engine/tools/paths.mts"
import { defaultUtil } from "../../../runner.mts"

const handle = (path: Paths) => {
	switch (path) {
		case Paths.dumpTags:
			return defaultUtil.dumpTags()
	}
	const _check: never = path
}

const path = fromFileUrl(import.meta.resolve("./engine/tools.uds"))
await Deno.remove(path).catch(() => {})

Deno.serve(
	{ transport: "unix", path },
	(conn) => {
		const response = handle(new URL(conn.url).pathname as Paths)
		if (response === undefined) {
			return new Response(null, { status: 404 })
		}
		return Response.json(response)
	},
).unref()
