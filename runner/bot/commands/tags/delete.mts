import { ApplicationCommandOptionTypes } from "discordeno"
import { tagsSubcommandRegister } from "./handler.mts"
import { Tags, UserModel } from "ORM"
import { tagNameOption } from "../common/tagNameOption.mts"

tagsSubcommandRegister({
	type: ApplicationCommandOptionTypes.SubCommand,
	name: "delete",
	description: "Deletes a tag",
	options: [tagNameOption],
}, async (interaction, { name }) => {
	const tag = await Tags.fetch(name)
	if (!tag) {
		return interaction.respond(`⚠️ Tag **${name}** doesn't exist.`)
	}
	try {
		await new UserModel(interaction.user.id).tags.remove(tag)
	} catch (e) {
		if (e instanceof Error) {
			return interaction.respond(e.message)
		}
	}
	return interaction.respond(`✅ Deleted tag **${name}**.`)
})
