import { UserModel } from "../UserModel.mts"

export class UserTagsModel {
	constructor(
		public readonly user: UserModel,
	) {}
}
