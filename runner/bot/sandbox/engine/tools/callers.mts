import ivm from "isolated-vm"
import * as r from "./request.mts"

export const createExternalFnAssigner = (
	assignTo: string,
	fn: (...args: any[]) => Promise<any> | any,
	body: string = "(...a)=>$0.applySyncPromise(null,a,{arguments:{copy:!0}})",
) => {
	const fnRef = new ivm.Reference(async (...args: any[]) => new ivm.ExternalCopy(await fn.apply(null, args)).copyInto())
	return (context: ivm.Context) =>
		context.evalClosure(
			assignTo + "=" + body,
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

const validatedFetchTag = (name?: any) => {
	if (typeof name !== "string") {
		return null
	}
	return r.unvalidatedFetchTag(name)
}
const assignFetchTag = createExternalFnAssigner("util.fetchTag", validatedFetchTag)

const assignExecuteTag = createExternalFnAssigner(
	"util.executeTag",
	validatedFetchTag,
	// deno-fmt-ignore
	"(name, ...args) => {"+
		"const tag = $0.applySyncPromise(null,[name],{arguments:{copy:!0}});"+
		"if (!tag) throw new Error(`Tag ${name} doesn't exist`);"+
		"const match = tag.body.match(/^`{3}([\\S]+)?\\n([\\s\\S]+)`{3}$/);"+
		"if (!match || !match[2]) return tag.body;"+
		"return new Function('code',`with(this){"+
			"return (()=>{"+
				'"use strict";'+
				"return eval(code)"+
			"})()}"+
		"`).call({"+
			"...this,"+
			'tag: {...tag, args: args.join(" ")}'+
		"}, match[2]);}",
)

export const assignCallers = (context: ivm.Context) =>
	Promise.all([
		assignDumpTags(context),
		assignFindTags(context),
		assignFetchTag(context),
		assignExecuteTag(context),
	])
