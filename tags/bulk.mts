import type {} from "../typings/tagEvalContext.d.ts"
import { parseArgsParams } from "./lib/cli.mts"
import { evalTag } from "./lib/evalTag.mts"
import { throwReply } from "./lib/throwReply.mts"

throwReply(() => {
	let separator = "\n"
	let printErrors = true

	const args = parseArgsParams(
		["tag name"],
		["tag name", "..."],
		"Executes a lot of tags at once. The results are contatenated with a configurable separator. Does not support embeds!",
		{
			"--ignore-err": () => printErrors = false,
		},
		[
			[/^--sep=([^]*)$/, (it) => separator = it, "--sep=separator"],
		],
	)

	const chunks: string[] = []
	const err = printErrors ? chunks.push.bind(chunks) : () => {}

	for (const name of args) {
		let fetched
		try {
			fetched = util.fetchTag(name)
			if (!fetched) {
				throw 0
			}
		} catch {
			err(`\`%t ${name} does not exist.\``)
			continue
		}

		if (!("body" in fetched)) {
			err(`\`%t ${name} does not have text.\``)
			continue
		}

		try {
			chunks.push(`${evalTag(fetched)}`)
		} catch (e) {
			err(`${e}`)
		}
	}

	throw chunks.join(separator)
})
