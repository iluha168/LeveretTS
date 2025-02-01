import type {} from "../typings/tagEvalContext.d.ts"
import { parseArgsParams } from "./lib/cli.mts"
import { throwReply } from "./lib/throwReply.mts"

throwReply(() => {
	parseArgsParams([], [], "Beep boop. Says 0 or 1.")
	throw String(Number(Boolean(Math.random() > 0.5)))
})
