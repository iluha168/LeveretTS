import type {} from "../typings/tagEvalContext.d.ts"
import { parseArgsParams } from "./lib/cli.mts"
import { throwReply } from "./lib/throwReply.mts"

function counter() {
	const state: Record<number, number> = {}
	return {
		inc(at: number) {
			state[at] ??= 0
			state[at]++
		},
		toString(...converters: ((v: string) => string)[]) {
			return Object
				.entries(state)
				.map(([v, c], i) => `**${c}** ` + (converters[i] ?? converters.at(-1))(v))
				.join(",\n") + "."
		},
		get total() {
			return Object.values(state).reduce((sum, n) => sum + n, 0)
		},
	}
}

throwReply(() => {
	parseArgsParams([], [], "Analyses all tags and gives some interesting information.")

	const recursion_chains = counter()
	const hops_len = counter()

	let chars = 0
	let codeblocks = 0

	const codeblock_delim = "`".repeat(3)
	const allTagNames = new Set(util.dumpTags())

	let bytes = allTagNames.size * 16 + allTagNames.values().reduce((sum, name) => sum + name.length, 0)

	const nonRecursiveTags = util.dumpTags(true)
	for (const tag of nonRecursiveTags) {
		const hops = tag.hops.length
		if (!("body" in tag)) {
			recursion_chains.inc(tag.hops.length)
			bytes += 8 // Referencing tag ID
			continue
		}
		const { body } = tag
		if (
			body.startsWith(codeblock_delim) && body.endsWith(codeblock_delim)
		) {
			codeblocks++
		}
		hops_len.inc(hops)
		chars += body.length
		bytes += body.length
	}

	const bannedTags = allTagNames.difference(
		new Set(
			nonRecursiveTags.map((tag) => tag.hops[0]),
		),
	).size

	throw {
		embed: {
			color: 0x22FF00,
			fields: [
				[
					`There are ${allTagNames.size} tags:`,
					hops_len.toString(
						() => `content tags (**${codeblocks}** of those are code tags) (**${chars}** *raw* characters in total)`,
						(k) => `${Array(Number(k) - 1).fill("aliases").join(" to ")}`,
					),
				],
				[
					`There are ${recursion_chains.total} alias tags that resolve to infinite loops:`,
					recursion_chains.toString(
						(len) => `resolve to loops of length ${len}`,
					),
				],
			].map(([name, value]) => ({
				name,
				value,
			})),
			footer: {
				text: `There are ${bannedTags} tags claimed by banned users.\nAssuming perfect normalization, the database takes ${bytes} bytes (~${Math.round(bytes / 1024)} KiB) of space.`,
			},
		},
	}
})
