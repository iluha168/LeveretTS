import ivm from "isolated-vm"
import type { Hops, Tag } from "../../../../../../typings/leveret.d.ts"
import { assignCallers } from "../tools/callers.mts"

const nullObj = new ivm.ExternalCopy(Object.create(null))

export const evalCode = async (code: string, tag?: Tag & Hops) => {
	const isolate = new ivm.Isolate({ memoryLimit: 64 })
	const context = await isolate.createContext()

	const jail = context.global
	await jail.set("globalThis", jail.derefInto())
	await jail.set("util", nullObj.copyInto())

	const util = await jail.get("util")
	await assignCallers(context)

	await jail.set("tag", new ivm.ExternalCopy(tag).copyInto())

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
