import type { Hops, Tag } from "../typings/leveret.d.ts"
import type {} from "../typings/tagEvalContext.d.ts"
import { parseArgsParams } from "./lib/cli.mts"

type Predicate = (body: string) => unknown
;(() => {
	let matcher: string | RegExp
	const predicateLink: Predicate = (body) => !body.match(/^https?:\/{2}[^ ]+$/)
	const predicateCode: Predicate = (body) => !body.match(/^`{3}(?:js)?\s+[^]*`{3}$/)
	const predicates: Set<Predicate> = new Set([
		(body) => body.match(matcher),
		predicateLink,
		predicateCode,
	])
	let filterAsRegEx = false

	try {
		matcher = parseArgsParams(["filter"], [], {
			"--with-links": () => predicates.delete(predicateLink),
			"--with-code": () => predicates.delete(predicateCode),
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
			Array.from(predicates).every((p) => p(tag.body))
		) as (Tag & Hops)[]

	msg.reply({
		embed: {
			title: "%t||ags|| lookup",
			description: results
				.slice(0, 20)
				.map((tag) =>
					`\`%t ${tag.name.replaceAll("\n", " ")}\`: ${
						tag.body
							.replaceAll("\n", " ")
							.slice(0, 50)
					}${tag.body.length > 50 ? "…" : ""}`
				)
				.join("\n")
				.slice(0, 4096),
			footer: {
				text: `Found a total of ${results.length} tags that match.`,
			},
		},
	})
})()
