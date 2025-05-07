// This file is used both by deno and node!
export const enum Paths {
	dumpTags = "/dumpTags",
	findTags = "/findTags",
	fetchTag = "/fetchTag",
}

export type ToolHandlerResponse = {
	error: string
} | {
	value: any
}
