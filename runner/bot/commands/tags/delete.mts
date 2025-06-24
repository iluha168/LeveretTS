import { ApplicationCommandOptionTypes, InteractionTypes } from "discordeno"
import { tagsSubcommandRegister } from "./handler.mts"
import { Tags, UserModel } from "ORM"
import { tagNameOption, tagNameOptionAutocomplete } from "../common/tagNameOption.mts"

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
		return interaction.respond(`⚠️ Tag **${name}** doesn't exist.`)
	}
	try {
		await userTags.remove(tag)
	} catch (e) {
		if (e instanceof Error) {
			return interaction.respond({
				content: e.message,
				allowedMentions: { parse: [] },
			})
		}
	}
	return interaction.respond(`✅ Deleted tag **${name}**.`)
})
