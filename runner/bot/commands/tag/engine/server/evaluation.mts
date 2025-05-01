import ivm from "isolated-vm"
import { assignCallers } from "../tools/callers.mts"

const nullObj = new ivm.ExternalCopy(Object.create(null))

export const evalCode = async (code: string) => {
	const isolate = new ivm.Isolate({ memoryLimit: 64 })
	const context = await isolate.createContext()

	const jail = context.global
	await jail.set("globalThis", jail.derefInto())
	await jail.set("util", nullObj.copyInto())

	const util = await jail.get("util")
	await assignCallers(context)

	const script = await isolate.compileScript(code)
	try {
		return await script.run(context, {
			timeout: 10_000,
			copy: true,
		})
	} catch (e) {
		return { content: `${e}` }
	}
}
