import ivm from "isolated-vm"
import type { CodeEvalProps } from "../../CodeEvalProps.mts"
import { assignCallers, createExternalFnAssigner } from "../tools/callers.mts"
import { ValidatedReply, validateReply } from "./impl/validateReply.mts"

const nullObj = new ivm.ExternalCopy(Object.create(null))

export const evalCode = async ({ code, tag, msg }: CodeEvalProps): Promise<ValidatedReply | string | undefined> => {
	const isolate = new ivm.Isolate({ memoryLimit: 64 })
	const context = await isolate.createContext()

	const jail = context.global
	await Promise.all([
		jail.set("globalThis", jail.derefInto()),
		jail.set("util", nullObj.copyInto()),
		jail.set("tag", new ivm.ExternalCopy(tag).copyInto()),
		jail.set("msg", new ivm.ExternalCopy(msg).copyInto()),
	])
	jail.release()

	const earlyExit = (value: ValidatedReply | string) => {
		earlyExit.value = value
		isolate.dispose()
	}
	earlyExit.value = null as ValidatedReply | string | null

	await Promise.all([
		assignCallers(context),
		createExternalFnAssigner("msg.reply", async (...args) => earlyExit(validateReply(args)))(context),
	])

	const scriptOrErr = await isolate.compileScript(code).catch((e) => e)
	if (!(scriptOrErr instanceof ivm.Script)) {
		if (scriptOrErr instanceof SyntaxError) {
			return `⚠️ This script has invalid syntax.\n\`\`\`js\n${scriptOrErr.message}\`\`\``
		}
		throw scriptOrErr
	}
	return await scriptOrErr
		.run(context, {
			timeout: 10_000,
			copy: true,
		})
		.then(JSON.stringify) // may return undefined if passed undefined
		.catch((e) =>
			// deno-fmt-ignore
			isolate.isDisposed
				? earlyExit.value!
				: `⚠️ Error evaluating script.\n\`\`\`js\n${e}\`\`\``
		)
}
