import type { TagRow } from "./row.mts"
import { UserModel } from "../User/UserModel.mts"

export abstract class TagModel {
	constructor(
		public readonly name: string,
		public readonly ownerId: bigint,
	) {}

	abstract get toTagRow(): TagRow

	get owner(): UserModel {
		return new UserModel(this.ownerId)
	}
}
