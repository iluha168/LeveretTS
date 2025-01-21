import type {} from "../global.d.ts"

function counter() {
	const state: Record<number, number> = {}
	return {
		inc(at: number) {
			state[at] ??= 0
			state[at]++
		},
		toString(...converters: ((e: [string, number]) => string)[]) {
			return Object
				.entries(state)
				.map((e, i) => (converters[i] ?? converters.at(-1))(e))
				.join(",\n") + "."
		},
		get total() {
			return Object.values(state).reduce((sum, n) => sum + n, 0)
		},
	}
}

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

msg.reply({
	embed: {
		color: 0x22FF00,
		fields: [{
			name: `There are ${tagsCount} tags:`,
			value: hops_len.toString(
				([, c]) => `**${c}** content tags (**${codeblocks}** of those are code tags) (**${chars}** *raw* characters in total)`,
				([k, c]) =>
					`**${c}** ` +
					Array(Number(k) - 1).fill("aliases").join(" to "),
			),
		}, {
			name: `There are ${recursion_chains.total} alias tags that resolve to infinite loops:`,
			value: recursion_chains.toString(
				([len, c]) => `**${c}** resolve to loops of length ${len}`,
			),
		}, {
			name: `There are ${point_to_nothing.total} aliases that lead to deleted tags:`,
			value: point_to_nothing.toString(
				([len, c]) =>
					`**${c}** ` +
					Array(Number(len)).fill("aliases").join(" to "),
			),
		}],
		footer: {
			text: `Assuming perfect normalization, the database takes at least ${bytes} bytes (~${Math.round(bytes / 1024)} KiB, ~${Math.round(bytes / 1024 / 1024)} MiB) of space.`,
		},
	},
})
