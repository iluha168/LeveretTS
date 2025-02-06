import type {} from "../typings/tagEvalContext.d.ts"
import { parseArgsParams } from "./lib/cli.mts"
import { evalTag } from "./lib/evalTag.mts"
import { throwReply } from "./lib/throwReply.mts"

throwReply(() => {
	let separator = "\n"

	const args = parseArgsParams(
		["tag name", "tag name"],
		["..."],
		"Executes a lot of tags at once. The results are contatenated with a configurable separator. Does not support embeds!",
		{},
		[
			[/^--sep=([^]*)$/, (it) => separator = it, "--sep=separator"],
		],
	)

	const chunks: string[] = []

	for (const name of args) {
		try {
			const fetched = util.fetchTag(name)
			if (!fetched) {
				throw 0
			}
			if (!("body" in fetched)) {
				chunks.push(`\`%t ${name} does not have text.\``)
				continue
			}

			try {
				chunks.push(`${evalTag(fetched)}`)
			} catch (e) {
				chunks.push(`${e}`)
			}
		} catch {
			chunks.push(`\`%t ${name} does not exist.\``)
		}
	}

	throw chunks.join(separator)
})
