import type {} from "../typings/tagEvalContext.d.ts"
import { parseArgsParams } from "./lib/cli.mts"
import { throwReply } from "./lib/throwReply.mts"

throwReply(() => {
	parseArgsParams([], [], "Beep boop. Says a random byte in binary.")
	throw Math.floor(Math.random() * 256)
		.toString(2)
		.padStart(8, "0")
})
