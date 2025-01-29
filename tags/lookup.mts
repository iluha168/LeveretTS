import type { Hops, Tag } from "../typings/leveret.d.ts"
import type {} from "../typings/tagEvalContext.d.ts"

type Predicate = (body: string) => unknown
;(() => {
	const args = (tag.args ?? "").split(" ")

	let matcher: string | RegExp
	const predicates: Predicate[] = [
		(body) => body.match(matcher),
	]
	let filterAsRegEx = false

	arg_loop: for (;; args.shift()) {
		switch (args[0]) {
			case undefined:
				return msg.reply(
					"%t lookup [--no-code] [--no-link] [--regex] <filter>",
				)
			case "--no-link":
				predicates.push((body) => !body.match(/^https?:\/{2}[^ ]+$/))
				break
			case "--no-code":
				predicates.push((body) => !body.match(/^`{3}(?:js)?\s+[^]*`{3}$/))
				break
			case "--regex":
				filterAsRegEx = true
				break
			default:
				break arg_loop
		}
	}

	matcher = args.join(" ")
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
