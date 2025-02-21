import type {} from "../typings/tagEvalContext.d.ts"
import { parseArgsParams } from "./lib/cli.mts"

try {
	let skipDefaultTagNameCheck = false
	const prepend = parseArgsParams(
		[],
		["arguments", "to", "prepend", "..."],
		"Executes the command mentioned in a previous or replied to message.",
		{
			"-f": () => skipDefaultTagNameCheck = true
		}
	)
	const history = util.fetchMessages()

	const ref = msg.reference?.messageId
	const target = ref ? history.find((it) => it.id === ref) : history[0]

	if (!target) {
		throw "❌ `Could not fetch the target message.`"
	}
	target.content = target.content.toLowerCase()

	const [match] = Object
		.values(
			target.content
				.match(/%t\s+(?<a>.*?)(?:\s|$)|`(?:%t\s+)?(?<b>[^]*?)`|[*]+(?:%t\s+)?(?<c>[^]*?)[*]+/)
				?.groups ?? {},
		)
		.filter((m) => m)
		// The default value
		.concat(skipDefaultTagNameCheck? [target.content] : target.content.match(/[a-z0-9-_]+/)!)
	if(!match) {
		throw "❌ Could not find a valid tag name. Try `%t that -f`!"
	}

	const args = prepend.concat(match.split(" "))

	if (args[0] === tag.name) {
		throw Array(5).fill(tag.name).join(", ") + "... The most epic recursion error ever!"
	}

	throw util.executeTag(args.shift()!, ...args)
} catch (e) {
	msg.reply(`${e}`)
}
