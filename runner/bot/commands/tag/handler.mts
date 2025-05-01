import { ApplicationCommandOptionTypes, ApplicationCommandTypes, commandOptionsParser } from "discordeno"
import { register } from "../registry.mts"
import { executeTag } from "./executeTag.mts"

register(
	{
		name: "tag",
		description: "Fetch a tag",
		type: ApplicationCommandTypes.ChatInput,
		options: [{
			name: "name",
			type: ApplicationCommandOptionTypes.String,
			description: "Tag's name",
			required: true,
		}],
	},
	async (interaction) => {
		const { name } = commandOptionsParser(interaction) as { name: string }
		const res = await executeTag(name)
		if (res !== undefined) {
			await interaction.respond(`${res}`)
		}
	},
)
