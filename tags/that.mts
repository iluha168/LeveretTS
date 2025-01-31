import type {} from "../typings/tagEvalContext.d.ts"

try {
	const history = util.fetchMessages()

	const ref = msg.reference?.messageId
	const target = ref ? history.find((it) => it.id === ref) : history[0]

	if (!target) {
		throw "❌ `Could not fetch the target message.`"
	}

	const [match] = Object.values(
		target.content
			.match(/%t\s+(?<a>.*?)(?:\s|$)|`%t\s+(?<b>[^]*?)`/)
			?.groups ?? {},
	)
	const args = (match ?? target.content).split(" ")

	throw util.executeTag(args.shift()!, ...args)
} catch (e) {
	msg.reply(`${e}`)
}
