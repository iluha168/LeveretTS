import { Message } from "../../../typings/leveret.d.ts"
import { defaultUtil } from "../../runner.mts"
import { evalCode } from "./engineInstance.mts"

export const executeTag = async (name: string, msg: Omit<Message, "reply">, args?: string): ReturnType<typeof evalCode> => {
	let tag
	try {
		tag = defaultUtil.fetchTag(name)
		if (tag === null || !("body" in tag)) {
			const similarTagNames = defaultUtil.findTags(name)
			throw new Error(
				`⚠️ Tag **${name}** doesn't exist.` + (
					similarTagNames.length > 0
						? `\nDid you mean: ${
							similarTagNames
								.slice(0, 5)
								.map((n) => `**${n}**`)
								.join(", ")
						}?`
						: ""
				),
			)
		}
	} catch (e) {
		if (e instanceof Error) {
			return { content: e.message }
		}
		return { content: `${e}` }
	}
	const match = tag.body.match(/^`{3}([\S]+)?\n([\s\S]+)`{3}$/)
	if (!match?.[2]) return { content: tag.body }
	if (args) tag.args = args
	return await evalCode({
		code: match[2],
		tag,
		msg,
	})
}
