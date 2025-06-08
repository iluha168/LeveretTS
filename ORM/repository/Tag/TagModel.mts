import type { TagRow } from "./row.mts"

export abstract class TagModel {
	constructor(
		public readonly name: string,
		public readonly ownerId: bigint,
	) {}

	abstract get toTagRow(): TagRow
}
