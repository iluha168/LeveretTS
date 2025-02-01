import { EvalContext } from "../typings/leveret.d.ts"
import type {} from "../typings/tagEvalContext.d.ts"
import { parseArgsParams } from "./lib/cli.mts"
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
			if (!fetched || !("body" in fetched)) {
				chunks.push(`\`%t ${name} does not have text.\``)
				continue
			}

			const match = fetched.body.match(/^`{3}([\S]+)?\n([\s\S]+)`{3}$/)
			if (!match?.[2]) {
				chunks.push(fetched.body)
				continue
			}

			let hasNotUsed = true
			const result = new Function(
				"code",
				`with(this){return (()=>{"use strict";return eval(code)})()}`,
			).call(
				{
					util,
					msg: Object.assign(
						Object.create(null),
						msg,
						{
							reply: (...args: unknown[]) => {
								chunks.push(`${args.join(" ")}`)
								hasNotUsed = false
							},
						},
					),
					tag: {
						...fetched,
						args: undefined,
					},
				} satisfies EvalContext,
				match[2],
			)
			if (hasNotUsed) {
				chunks.push(`${result}`)
			}
		} catch {
			chunks.push(`\`%t ${name} does not exist.\``)
		}
	}

	throw chunks.join(separator)
})
