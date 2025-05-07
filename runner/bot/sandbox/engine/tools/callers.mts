import ivm from "isolated-vm"
import * as r from "./request.mts"

export const createExternalFnAssigner = (
	assignTo: string,
	fn: (...args: any[]) => Promise<any> | any,
) => {
	const fnRef = new ivm.Reference(async (...args: any[]) => new ivm.ExternalCopy(await fn.apply(null, args)).copyInto())
	return (context: ivm.Context) =>
		context.evalClosure(
			assignTo + "=(...a)=>$0.applySyncPromise(null,a,{arguments:{copy:!0}})",
			[fnRef],
		)
}

const assignDumpTags = createExternalFnAssigner("util.dumpTags", r.dumpTags)

const assignFindTags = createExternalFnAssigner("util.findTags", (name?) => {
	if (typeof name !== "string") {
		throw new Error("No input name specified")
	}
	return r.unvalidatedFindTags(name)
})

const assignFetchTag = createExternalFnAssigner("util.fetchTag", (name?) => {
	if (typeof name !== "string") {
		return null
	}
	return r.unvalidatedFetchTag(name)
})

export const assignCallers = (context: ivm.Context) =>
	Promise.all([
		assignDumpTags(context),
		assignFindTags(context),
		assignFetchTag(context),
	])
