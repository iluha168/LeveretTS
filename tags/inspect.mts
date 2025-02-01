import type {} from "../typings/tagEvalContext.d.ts"
import { parseArgsParams } from "./lib/cli.mts"
import { throwReply } from "./lib/throwReply.mts"

export const inspect = (what: unknown) => {
	let refs = 0
	return JSON.stringify(
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
}

throwReply(() => {
	const args = parseArgsParams([], ["code"], "Evaluates JS code and returns JSON interpretation of the result.")
	throw inspect(eval(args.join(" ") ?? "globalThis"))
})
