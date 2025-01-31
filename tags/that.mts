import type {} from "../typings/tagEvalContext.d.ts"
import { parseArgsParams } from "./lib/cli.mts"

try {
	const history = util.fetchMessages()

	const ref = msg.reference?.messageId
	const target = ref ? history.find((it) => it.id === ref) : history[0]

	if (!target) {
		throw "❌ `Could not fetch the target message.`"
	}
	target.content = target.content.toLowerCase()

	const [match] = Object.values(
		target.content
			.match(/%t\s+(?<a>.*?)(?:\s|$)|`%t\s+(?<b>[^]*?)`/)
			?.groups ?? {},
	)
	const prepend = parseArgsParams([], ["arguments", "to", "prepend", "..."])
	const args = prepend.concat((match ?? target.content).split(" "))

	throw util.executeTag(args.shift()!, ...args)
} catch (e) {
	msg.reply(`${e}`)
}
