import { TagModel } from "./TagModel.mts"
import type { TagRow } from "./row.mts"

export class TxtTagModel extends TagModel {
	constructor(
		name: string,
		ownerId: bigint,
		public readonly body: string,
	) {
		super(name, ownerId)
	}

	override get toTagRow(): TagRow {
		return {
			name: this.name,
			owner: this.ownerId,
			type: "txt",
			body: this.body,
		}
	}
}
