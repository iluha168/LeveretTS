import { request } from "node:http"
import { Paths } from "./paths.mts"

// deno-fmt-ignore
export const fetchTool = (path: Paths) => new Promise(
    (res, rej) => request(
		{ socketPath: "tools.uds", path },
		(message) => message
			.toArray()
			.then((chunks) => new Blob(chunks).text())
			.then(JSON.parse)
			.then(res)
			.catch(rej),
	).end(),
)
