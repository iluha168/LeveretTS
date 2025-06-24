import { type TagRow, zTagRow } from "./row.mts"
import { UserModel } from "../User/UserModel.mts"

export abstract class TagModel {
	static readonly TE = new TextEncoder()

	constructor(
		public readonly name: string,
		public readonly ownerId: bigint,
	) {}

	abstract get toTagRow(): TagRow

	copy(makeChanges?: (row: Omit<TagRow, "type">) => void): this {
		const row = this.toTagRow
		makeChanges?.(row)
		const copy = zTagRow.parse(row)

		// This operation keeps the same subclass type
		return copy as this
	}

	/** @returns How many bytes a tag takes in the database */
	abstract size(): bigint

	get owner(): UserModel {
		return new UserModel(this.ownerId)
	}
}
