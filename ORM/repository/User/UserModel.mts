import { UserTagsModel } from "./Tags/UserTagsModel.mts"

export class UserModel {
	constructor(
		public readonly id: bigint,
	) {}

	get tags(): UserTagsModel {
		return new UserTagsModel(this)
	}
}
