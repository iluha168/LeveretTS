import { ApplicationCommandOptionTypes } from "discordeno"
import { tagsSubcommandRegister } from "./handler.mts"
import { UserModel } from "ORM"

tagsSubcommandRegister({
	type: ApplicationCommandOptionTypes.SubCommand,
	name: "quota",
	description: "Find out how much free space a user has in the database",
	options: [{
		type: ApplicationCommandOptionTypes.User,
		name: "user",
		description: "Whom to show the information about",
		required: false,
	}],
}, async (interaction, { user }) => {
	const { id } = user?.user ?? interaction.user
	const UserIs = id === interaction.user.id ? "You're" : `<@${id}> is`
	const quota = await new UserModel(id).size()
	const percent = Math.round(100 * Number(quota) / Number(UserModel.MAX_SIZE))
	return interaction.respond({
		content: `ℹ️ ${UserIs} using **${Number(quota) / 1024}**/**${Number(UserModel.MAX_SIZE) / 1024}** KiB of the available storage (**${percent}%**).`,
		allowedMentions: { parse: [] },
	})
})
