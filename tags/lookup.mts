import type {} from "../typings/tagEvalContext.d.ts"
import { parseArgsParams } from "./lib/cli.mts"
import { throwReply } from "./lib/throwReply.mts"

type Predicate = (body: string) => unknown

throwReply(() => {
	let matcher: string | RegExp
	const predicateNotLink: Predicate = (body) => !body.match(/^https?:\/{2}[^ ]+$/)
	const predicateNotCode: Predicate = (body) => !body.match(/^`{3}(?:js)?\s+[^]*`{3}$/)
	const predicates: Set<Predicate> = new Set([
		(body) => body.match(matcher),
		predicateNotLink,
		predicateNotCode,
	])
	let filterAsRegEx = false

	matcher = parseArgsParams(["filter"], ["..."], "Searches for the given string in all tags' content.", {
		"--with-links": () => predicates.delete(predicateNotLink),
		"--with-code": () => predicates.delete(predicateNotCode),
		"--regex": () => filterAsRegEx = true,
	}).join(" ")

	if (filterAsRegEx) {
		matcher = new RegExp(matcher, "u")
	}

	const results = util.dumpTags(true)
		.map((tag) => {
			if (tag && "body" in tag && tag.hops.length === 1) {
				return tag
			}
			return null
		})
		.filter((tag) => !!tag)
		.filter((tag) => predicates.values().every((p) => p(tag.body)))

	throw {
		embed: {
			title: "%t lookup",
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
	}
})
