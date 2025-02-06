import {} from "../typings/tagEvalContext.d.ts"
import { parseArgsParams } from "./lib/cli.mts"
import { evalTag } from "./lib/evalTag.mts"
import { throwReply } from "./lib/throwReply.mts"

throwReply(() => {
	let useRegex = false
	const [replaceable, replacement, tagName] = parseArgsParams(
		["replaceable", "replacement", "tag name"],
		[],
		"Replaces specified text in a tag with another.",
		{
			"--regex": () => useRegex = true,
		},
	)

	const fetched = util.fetchTag(tagName)
	if (!(fetched && "body" in fetched)) {
		throw `⚠️ Tag **${tagName}** does not exist.\nGo \`%t lookup\` some text to replace.`
	}

	const result = evalTag(fetched)
	const matcher = useRegex ? new RegExp(replaceable, "g") : replaceable

	const replace = (o: unknown): unknown => {
		switch (typeof o) {
			case "string":
				return o.replaceAll(matcher, replacement)
			case "object":
				if (o === null) {
					return o
				}
				if (Array.isArray(o)) {
					return o.map(replace)
				}
				return Object.fromEntries(
					Object.entries(o).map(([k, v]) => [k, replace(v)]),
				)
			default:
				return o
		}
	}
	throw replace(result)
})
