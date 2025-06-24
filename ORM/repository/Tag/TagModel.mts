import type { TagRow } from "./row.mts"
import { UserModel } from "../User/UserModel.mts"

export abstract class TagModel {
	static readonly TE = new TextEncoder()

	constructor(
		public readonly name: string,
		public readonly ownerId: bigint,
	) {}

	abstract get toTagRow(): TagRow

	/** @returns How many bytes a tag takes in the database */
	abstract size(): bigint

	get owner(): UserModel {
		return new UserModel(this.ownerId)
	}
}
