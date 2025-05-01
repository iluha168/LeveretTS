import type {} from "../typings/tagEvalContext.d.ts"
import type { dbEntry } from "../runner/dbReader.mts"

if (!tag.args) {
	throw "Usage: %t megadump 400-1000"
}
const [rangeB, rangeE] = tag.args.split("-").map(Number)

msg.reply(
	util
		.dumpTags()
		.slice(rangeB, rangeE)
		.map((name) => {
			let owner: string = "0"
			let alias: string | null = null
			let body: string = ""
			let args: string | undefined
			try {
				const tag = util.fetchTag(name)!
				if ("body" in tag) {
					;({ body, owner, args } = tag)
					args ||= undefined
				}
				if (tag.hops.length > 1) {
					alias = tag.hops[1]
				}
			} catch (e) {
				;[, alias] = Array.from((e as Error).message
					.matchAll(/\*\*(.*?)\*\*/g))
					.map((m) => m[1])
			}
			return name + "\t" + JSON.stringify(
				(alias ? { owner, alias, args } : { owner, body, args }) satisfies dbEntry,
			)
		})
		.join("\n") + "\n",
)
