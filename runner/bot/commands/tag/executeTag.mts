import { Message } from "../../../../typings/leveret.d.ts"
import { defaultUtil } from "../../../runner.mts"
import { evalCode } from "./engineInstance.mts"

export const executeTag = async (name: string, msg: Omit<Message, "reply">, args?: string) => {
	let tag
	try {
		tag = defaultUtil.fetchTag(name)
		if (tag === null || !("body" in tag)) {
			throw new Error(`⚠️ Tag **${name}** doesn't exist.`)
		}
	} catch (e) {
		if (e instanceof Error) {
			return e.message
		}
		return `${e}`
	}
	const match = tag.body.match(/^`{3}([\S]+)?\n([\s\S]+)`{3}$/)
	if (!match?.[2]) return tag.body
	if (args) tag.args = args
	return await evalCode({
		code: match[2],
		tag,
		msg,
	})
}
