import type {} from "../typings/tagEvalContext.d.ts"
import { parseArgsParams } from "./lib/cli.mts"
import { throwReply } from "./lib/throwReply.mts"

throwReply(() => {
	parseArgsParams([], [], "Executes a random tag.")

	const all = util.dumpTags()
	const chosen = all[Math.floor(Math.random() * all.length)]
	throw util.executeTag(chosen, tag.args ?? "")
})
