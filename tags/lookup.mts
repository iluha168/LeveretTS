import type { Hops, Tag } from "../typings/leveret.d.ts"
import type {} from "../typings/tagEvalContext.d.ts"
import { parseArgsParams } from "./lib/cli.mts"

type Predicate = (body: string) => unknown
;(() => {
	let matcher: string | RegExp
	const predicates: Predicate[] = [
		(body) => body.match(matcher),
	]
	let filterAsRegEx = false

	try {
		matcher = parseArgsParams("<filter>", {
			"--no-link": () => predicates.push((body) => !body.match(/^https?:\/{2}[^ ]+$/)),
			"--no-code": () => predicates.push((body) => !body.match(/^`{3}(?:js)?\s+[^]*`{3}$/)),
			"--regex": () => filterAsRegEx = true,
		}).join(" ")
	} catch (e) {
		return msg.reply(e as string)
	}

	if (filterAsRegEx) {
		matcher = new RegExp(matcher, "u")
	}

	const results = util.dumpTags()
		.map((name) => {
			try {
				const tag = util.fetchTag(name)
				if (tag && "body" in tag && tag.hops.length === 1) {
					return tag
				}
			} catch {
				return null
			}
			return null
		})
		.filter((tag) =>
			tag &&
			predicates.every((p) => p(tag.body))
		) as (Tag & Hops)[]

	msg.reply({
		embed: {
			title: "%t||ags|| lookup",
			description: results
				.slice(0, 30)
				.map((tag) =>
					`\`%t ${tag.name.replaceAll("\n", " ")}\`: ${
						tag.body
							.replaceAll("\n", " ")
							.slice(0, 100)
					}${tag.body.length > 100 ? "…" : ""}`
				)
				.join("\n")
				.slice(0, 4096),
			footer: {
				text: `Found a total of ${results.length} tags that match.`,
			},
		},
	})
})()
