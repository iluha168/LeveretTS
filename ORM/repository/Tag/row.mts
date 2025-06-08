import { z } from "npm:zod@3"
import type { TagModel } from "./TagModel.mts"
import { TxtTagModel } from "./TxtTagModel.mts"
import { JsTagModel } from "./JsTagModel.mts"
import { AliasTagModel } from "./AliasTagModel.mts"

export const zTagRow = z.strictObject({
	name: z.string()
		.min(1, "Tag name cannot be empty.")
		.max(768, "Tag name is too long!"),
	owner: z.bigint().or(z.coerce.bigint(z.number())),
	type: z.enum(["txt", "js", "alias"]),
	body: z.string()
		.max(32768, "Tag body is too long!"),
}).transform((row): TagModel => {
	switch (row.type) {
		case "txt":
			return new TxtTagModel(row.name, row.owner, row.body)
		case "js":
			return new JsTagModel(row.name, row.owner, row.body)
		case "alias": {
			const LF = row.body.indexOf("\n")
			const refName = row.body.slice(0, LF)
			const refArgs = row.body.slice(LF + 1)
			return new AliasTagModel(row.name, row.owner, refName, refArgs)
		}
	}
})

export type TagRow = z.input<typeof zTagRow>
