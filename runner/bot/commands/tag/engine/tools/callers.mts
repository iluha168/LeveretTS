import ivm from "isolated-vm"
import { fetchTool } from "./request.mts"
import { Paths } from "./paths.mts"

export const createExternalFnAssigner = (
	assignTo: string,
	fn: (...args: any[]) => Promise<any>,
) => {
	const fnRef = new ivm.Reference(async (...args: any[]) => new ivm.ExternalCopy(await fn.apply(null, args)).copyInto())
	return (context: ivm.Context) =>
		context.evalClosure(
			assignTo + "=(...a)=>$0.applySyncPromise(null,a,{arguments:{copy:!0}})",
			[fnRef],
		)
}

const assignDumpTags = createExternalFnAssigner("util.dumpTags", fetchTool.bind(null, Paths.dumpTags))

export const assignCallers = (context: ivm.Context) =>
	Promise.all([
		assignDumpTags(context),
	])
