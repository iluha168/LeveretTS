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

	override size(): bigint {
		return BigInt(
			TagModel.TE.encode(this.name).byteLength +
				TagModel.TE.encode(this.refName).byteLength +
				1 +
				TagModel.TE.encode(this.refArgs).byteLength,
		)
	}

	deref() {
		return fetch(this.refName)
	}
}
