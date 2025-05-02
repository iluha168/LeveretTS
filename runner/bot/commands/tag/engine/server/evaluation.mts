import ivm from "isolated-vm"
import type { CodeEvalProps } from "../../CodeEvalProps.mts"
import { assignCallers } from "../tools/callers.mts"

const nullObj = new ivm.ExternalCopy(Object.create(null))

export const evalCode = async ({ code, tag, msg }: CodeEvalProps) => {
	const isolate = new ivm.Isolate({ memoryLimit: 64 })
	const context = await isolate.createContext()

	const jail = context.global
	await jail.set("globalThis", jail.derefInto())

	await Promise.all([
		jail.set("util", nullObj.copyInto()),
		jail.set("tag", new ivm.ExternalCopy(tag).copyInto()),
		jail.set("msg", new ivm.ExternalCopy(msg).copyInto()),
	])

	await assignCallers(context)

	const script = await isolate.compileScript(code)
	try {
		return await script.run(context, {
			timeout: 10_000,
			copy: true,
		})
	} catch (e) {
		return `⚠️ Error evaluating script.\n\`\`\`js\n${e}\`\`\``
	}
}
