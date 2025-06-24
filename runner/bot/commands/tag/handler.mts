import { ApplicationCommandOptionTypes, ApplicationCommandTypes } from "discordeno"
import { applicationCommandRegistry } from "../registry.mts"
import { executeTag } from "../../sandbox/executeTag.mts"
import { DiscordInteractionToLeveretMessage } from "../../transformers/DiscordInteractionToLeveretMessage.mts"
import { EvalResultToInteractionResponse } from "../../transformers/EvalResultToInteractionResponse.mts"
import { tagNameOption } from "../common/tagNameOption.mts"

applicationCommandRegistry.register(
	{
		name: "tag",
		description: "Fetch a tag",
		type: ApplicationCommandTypes.ChatInput,
		options: [tagNameOption, {
			name: "args",
			type: ApplicationCommandOptionTypes.String,
			description: "Arguments you might want to pass to the tag",
			required: false,
		}],
	},
	async (interaction, { name, args }) => {
		const deferTimeout = setTimeout(() => interaction.defer().catch(() => {}), 1000)
		const res = await executeTag(
			name,
			{
				...DiscordInteractionToLeveretMessage(interaction),
				content: "%t " + name + (args ? ` ${args}` : ""),
			},
			args,
		)
		clearTimeout(deferTimeout)
		await EvalResultToInteractionResponse(res, interaction)
	},
)
