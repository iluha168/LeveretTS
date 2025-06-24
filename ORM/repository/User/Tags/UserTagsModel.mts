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

	async edit(tag: TagModel, newTag: TagModel) {
		if (tag.ownerId !== this.user.id) {
			throw new Error(`⚠️ You can only edit your own tags. Tag is owned by <@${tag.ownerId}>.`)
		}
		if (tag.name !== newTag.name) {
			const err = new Error(`Renaming tags is not supported. Tried to rename **${tag.name}** to **${newTag.name}**.`)
			console.error(err) // This is a programmer's mistake, not user's, we want to see this error
			throw err
		}
		const newTagRow = newTag.toTagRow
		if (tag.ownerId !== newTag.ownerId) {
			// Change of ownership, aka a move. The receiving user loses space.
			if (await newTag.owner.size() + BigInt(newTagRow.body.length) + BigInt(newTagRow.name.length) > UserModel.MAX_SIZE) {
				throw new Error(`⚠️ <@${newTag.ownerId}> would run out of storage space.`)
			}
		} else {
			// Edit in-place, consider losing space as tag owner.
			if (await tag.owner.size() - BigInt(tag.toTagRow.body.length) + BigInt(newTagRow.body.length) > UserModel.MAX_SIZE) {
				throw new Error(`⚠️ <@${tag.ownerId}> would run out of storage space.`)
			}
		}
		return await Tags.save(newTagRow)
	}

	async add(newTag: TagModel) {
		if (newTag.ownerId !== this.user.id) {
			throw new Error(`⚠️ Cannot create tags as another user.`)
		}
		const oldTag = await Tags.fetch(newTag.name)
		if (oldTag) {
			throw new Error(`⚠️ Tag **${newTag.name}** already exists, and is owned by <@${oldTag.ownerId}>.`)
		}
		const newTagRow = newTag.toTagRow
		if (await newTag.owner.size() + BigInt(newTagRow.body.length) + BigInt(newTagRow.name.length) > UserModel.MAX_SIZE) {
			throw new Error(`⚠️ <@${newTag.ownerId}> would run out of storage space.`)
		}
		return await Tags.save(newTagRow)
	}

	async find(namePart: string) {
		return await Tags.findTagNames(namePart, this.user.id)
	}
}
