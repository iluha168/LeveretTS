import { request } from "node:http"
import type { Util } from "../../../../../typings/leveret.d.ts"
import { Paths, type ToolHandlerResponse } from "./paths.mts"

// deno-fmt-ignore
const fetchTool = <T,>(path: Paths, body?: any) => new Promise<T>(
    (res, rej) => request(
		{
			socketPath: "tools.uds",
			path,
			method: "POST",
		},
		(message) => message
			.toArray()
			.then((chunks) => new Blob(chunks).text())
			.then(JSON.parse)
			.then((res: ToolHandlerResponse) => {
				if ("error" in res)
					throw res.error
				return res.value
			})
			.then(res)
			.catch(rej),
	).end(JSON.stringify(body)),
)

export const dumpTags = () => fetchTool<ReturnType<Util["dumpTags"]>>(Paths.dumpTags)
export const unvalidatedFindTags = (name: string) => fetchTool<ReturnType<Util["findTags"]>>(Paths.findTags, name)
export const unvalidatedFetchTag = (name: string) => fetchTool<ReturnType<Util["fetchTag"]>>(Paths.fetchTag, name)
