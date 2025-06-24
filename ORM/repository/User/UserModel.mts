import { db } from "../../connection/index.mts"
import { UserTagsModel } from "./Tags/UserTagsModel.mts"

export class UserModel {
	static MAX_SIZE: bigint = 1024n * 1024n // 1 mebibyte

	constructor(
		public readonly id: bigint,
	) {}

	get tags(): UserTagsModel {
		return new UserTagsModel(this)
	}

	/** @returns How many bytes a user takes in the database */
	async size(): Promise<bigint> {
		const [{ bytes }]: { bytes: `${bigint}` | null }[] = await db.query(
			`SELECT (
			(SELECT SUM(length(name)+length(body)) as bytes FROM Tag WHERE owner=? GROUP BY owner)
		) as bytes`,
			[this.id],
		)
		if (!bytes) return 0n
		return BigInt(bytes)
	}
}
