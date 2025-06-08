import { TagModel } from "./TagModel.mts"
import type { TagRow } from "./row.mts"

import { fetch } from "./Repo.mts"

export class AliasTagModel extends TagModel {
	constructor(
		name: string,
		ownerId: bigint,
		public readonly refName: string,
		public readonly refArgs: string,
	) {
		super(name, ownerId)
		if (!this.refName) {
			throw new TypeError(`${AliasTagModel.name}: Invalid refName`)
		}
		if (typeof this.refArgs !== "string") {
			throw new TypeError(`${AliasTagModel.name}: Invalid refName`)
		}
	}

	override get toTagRow(): TagRow {
		return {
			name: this.name,
			owner: this.ownerId,
			type: "alias",
			body: this.refName + "\n" + this.refArgs,
		}
	}

	deref() {
		return fetch(this.refName)
	}
}
