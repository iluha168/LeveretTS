import { request } from "node:http"
import { Paths } from "./paths.mts"

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
			.then(res)
			.catch(rej),
	).end(JSON.stringify(body)),
)

export const dumpTags = () => fetchTool<string[]>(Paths.dumpTags)
export const unvalidatedFindTags = (name: string) => fetchTool<string[]>(Paths.findTags, name)
