import { UserModel } from "../UserModel.mts"
import * as Tags from "../../Tag/Repo.mts"
import type { TagModel } from "../../Tag/TagModel.mts"

export class UserTagsModel {
	constructor(
		public readonly user: UserModel,
	) {}

	async remove(tag: TagModel) {
		if (tag.ownerId !== this.user.id) {
			throw new Error(`⚠️ You can only delete your own tags. Tag is owned by <@${tag.ownerId}>.`)
		}
		return await Tags.remove(tag.toTagRow)
	}
}
