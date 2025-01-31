import type {} from "../typings/tagEvalContext.d.ts"

let refs = 0

export const inspect = (what: unknown) =>
	JSON.stringify(
		what,
		(_, v) => {
			if (v === what && refs++) return
			switch (typeof v) {
				case "function":
				case "symbol":
				case "bigint":
					return v.toString()
			}
			return v
		},
		4,
	)

msg.reply(inspect(eval(tag.args ?? "globalThis")))
