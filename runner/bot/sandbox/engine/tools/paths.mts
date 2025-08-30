// This file is used both by deno and node!
export const Paths = {
	dumpTags: "/dumpTags",
	findTags: "/findTags",
	fetchTag: "/fetchTag",
} as const

type ValueOf<T> = T[keyof T]
export type Paths = ValueOf<typeof Paths>

export type ToolHandlerResponse = {
	error: string
} | {
	value: any
}
