import { ApplicationCommandOptionTypes, InteractionTypes } from "discordeno"
import { tagsSubcommandRegister } from "./handler.mts"
import { Tags, UserModel } from "ORM"
import { tagNameOption, tagNameOptionAutocomplete } from "../common/tagNameOption.mts"
import { respondLargeString } from "../common/respondLargeString.mts"

tagsSubcommandRegister({
	type: ApplicationCommandOptionTypes.SubCommand,
	name: "chown",
	description: "Transfers ownership of a tag to another user",
	options: [tagNameOption, {
		type: ApplicationCommandOptionTypes.User,
		name: "recipient",
		description: "Target user whom you are transferring the tag to",
		required: true,
	}],
}, async (interaction, { name, recipient }) => {
	const userTags = new UserModel(interaction.user.id).tags

	if (interaction.type === InteractionTypes.ApplicationCommandAutocomplete) {
		return tagNameOptionAutocomplete(interaction, name, userTags)
	}

	const { user } = recipient
	if (!user) {
		return respondLargeString(interaction, "⚠️ Invalid target user. You must specifically mention the target user.")
	}

	const tag = await Tags.fetch(name)
	if (!tag) {
		return respondLargeString(interaction, `⚠️ Tag **${name}** doesn't exist.`)
	}
	const newTag = tag.copy((row) => row.owner = user.id)

	try {
		await userTags.edit(tag, newTag)
	} catch (e) {
		if (e instanceof Error) {
			return respondLargeString(interaction, e.message)
		}
		throw e
	}
	return respondLargeString(interaction, `✅ Transferred tag **${name}** to <@${newTag.ownerId}>.`)
})
