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

	const point_to_nothing = counter()
	const recursion_chains = counter()
	const hops_len = counter()

	let chars = 0
	let tagsCount = 0
	let bytes = 0
	let codeblocks = 0

	const codeblock_delim = "`".repeat(3)
	for (const tagName of util.dumpTags()) {
		tagsCount++
		bytes += tagName.length + 16 // Owner Snowflake + tag ID
		try {
			const tag = util.fetchTag(tagName)!
			const hops = tag.hops.length
			if (!("body" in tag)) {
				point_to_nothing.inc(hops)
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
		} catch (e) {
			const loop_tags = Array.from((e as Error).message
				.matchAll(/\*\*(.*?)\*\*/g))
				.map((m) => m[1])
			recursion_chains.inc(loop_tags.length)
			bytes += 8 // Referencing tag ID
		}
	}

	throw {
		embed: {
			color: 0x22FF00,
			fields: [
				[
					`There are ${tagsCount} tags:`,
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
				[
					`There are ${point_to_nothing.total} aliases that lead to deleted tags:`,
					point_to_nothing.toString(
						(len) => Array(Number(len)).fill("aliases").join(" to "),
					),
				],
			].map(([name, value]) => ({
				name,
				value,
			})),
			footer: {
				text: `Assuming perfect normalization, the database takes ${bytes} bytes (~${Math.round(bytes / 1024)} KiB) of space.`,
			},
		},
	}
})
