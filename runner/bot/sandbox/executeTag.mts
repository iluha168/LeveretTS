import { evalCode } from "./engineInstance.mts"

import { Message } from "../../../typings/leveret.d.ts"
import { fetchTag } from "../util/fetchTag.mts"
import { findTagNames } from "ORM"

export const executeTag = async (name: string, msg: Omit<Message, "reply">, args?: string): ReturnType<typeof evalCode> => {
	let tag
	try {
		tag = await fetchTag(name)
		if (tag === null || !("body" in tag)) {
			const similarTagNames = await findTagNames(name)
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
