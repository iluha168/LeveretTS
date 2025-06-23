import { AliasTagModel, JsTagModel, Tags, TxtTagModel } from "ORM"
import { Util } from "../../../typings/leveret.d.ts"

const unreachable = () => {
	throw new RangeError("Unreachable")
}

export const fetchTag = async (name: string): Promise<
	ReturnType<Util["fetchTag"]>
> => {
	const hops = [name]
	let tag = await Tags.fetch(name)
	let args: string | undefined

	for (;;) { // Alias-resolving loop
		if (tag === undefined) {
			return hops.length > 1 ? { hops } : null
		}
		if (!(tag instanceof AliasTagModel)) {
			break
		}

		const { refName: alias, refArgs } = tag
		if (hops.includes(alias)) {
			const chain = hops.concat([alias]).map((n) => `**${n}**`).join(" -> ")
			throw new Error(`⚠️ Epic recursion error: ${chain}.`)
		}
		hops.push(alias)
		tag = await Tags.fetch(alias)
		if (tag) args ??= refArgs
	}
	return {
		name: tag.name,
		owner: `${tag.ownerId}`,
		body: // deno-fmt-ignore
			tag instanceof TxtTagModel ? tag.body :
            tag instanceof JsTagModel ? ("```js\n" + tag.code + "```") :
            unreachable(),
		hops: hops.slice(),
		args,
	}
}
