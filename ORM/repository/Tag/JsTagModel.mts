import { TagModel } from "./TagModel.mts"
import type { TagRow } from "./row.mts"

export class JsTagModel extends TagModel {
	constructor(
		name: string,
		ownerId: bigint,
		public readonly code: string,
	) {
		super(name, ownerId)
	}

	override get toTagRow(): TagRow {
		return {
			name: this.name,
			owner: this.ownerId,
			type: "js",
			body: this.code,
		}
	}
}
