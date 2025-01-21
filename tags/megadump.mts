import type {} from "../global.d.ts"

if (!tag.args) {
	throw "Usage: %t megadump 400-1000"
}
const [rangeB, rangeE] = tag.args.split("-").map(Number)

msg.reply(
	util
		.dumpTags()
		.slice(rangeB, rangeE)
		.map((n) => {
			let alias_target
			let content
			try {
				const tag = util.fetchTag(n)!
				if (tag.hops.length > 1) {
					alias_target = tag.hops[1]
				} else {
					content = tag
				}
			} catch (e) {
				;[n, alias_target] = Array.from((e as Error).message
					.matchAll(/\*\*(.*?)\*\*/g))
					.map((m) => m[1])
			}
			return n + "\t" +
				(alias_target ? alias_target : JSON.stringify(content))
		})
		.join("\n") + "\n",
)
