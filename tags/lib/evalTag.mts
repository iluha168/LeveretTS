import { EvalContext, Hops, Tag } from "../../typings/leveret.d.ts"

export const evalTag = (tag: Tag & Hops, args?: string) => {
	const match = tag.body.match(/^`{3}([\S]+)?\n([\s\S]+)`{3}$/)
	const code = match?.[2]
	if (!code) {
		return tag.body
	}

	let reply: unknown[] = []
	let didReply = false

	const result: unknown = new Function(
		"code",
		`with(this){return (()=>{"use strict";return eval(code)})()}`,
	).call(
		{
			util,
			http,
			msg: Object.assign(
				Object.create(null),
				msg,
				{
					reply: (...args: unknown[]) => {
						reply = args
						didReply = true
					},
				},
			),
			tag: {
				...tag,
				args: args ?? tag.args,
			},
		} satisfies EvalContext,
		code,
	)

	return didReply ? reply : result
}
