import { ApplicationCommandOptionTypes, InteractionTypes } from "discordeno"
import { tagsSubcommandRegister } from "./handler.mts"
import { Tags, UserModel } from "ORM"
import { tagNameOption, tagNameOptionAutocomplete } from "../common/tagNameOption.mts"
import { respondLargeString } from "../common/respondLargeString.mts"

tagsSubcommandRegister({
	type: ApplicationCommandOptionTypes.SubCommand,
	name: "delete",
	description: "Deletes a tag",
	options: [tagNameOption],
}, async (interaction, { name }) => {
	const userTags = new UserModel(interaction.user.id).tags
	if (interaction.type === InteractionTypes.ApplicationCommandAutocomplete) {
		return tagNameOptionAutocomplete(interaction, name, userTags)
	}

	const tag = await Tags.fetch(name)
	if (!tag) {
		return respondLargeString(interaction, `⚠️ Tag **${name}** doesn't exist.`)
	}
	try {
		await userTags.remove(tag)
	} catch (e) {
		if (e instanceof Error) {
			return respondLargeString(interaction, e.message)
		}
		throw e
	}
	return respondLargeString(interaction, `✅ Deleted tag **${name}**.`)
})
