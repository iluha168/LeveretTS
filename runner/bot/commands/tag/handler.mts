import { ApplicationCommandOptionTypes, ApplicationCommandTypes, commandOptionsParser } from "discordeno"
import { register } from "../registry.mts"
import { executeTag } from "../../sandbox/executeTag.mts"
import { DiscordInteractionToLeveretMessage } from "../../transformers/DiscordInteractionToLeveretMessage.mts"
import { EvalResultToInteractionResponse } from "../../transformers/EvalResultToInteractionResponse.mts"

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
		}, {
			name: "args",
			type: ApplicationCommandOptionTypes.String,
			description: "Arguments you might want to pass to the tag",
			required: false,
		}],
	},
	async (interaction) => {
		const { name, args } = commandOptionsParser(interaction) as { name: string; args?: string }
		const res = await executeTag(
			name,
			{
				...DiscordInteractionToLeveretMessage(interaction),
				content: "%t " + name + (args ? ` ${args}` : ""),
			},
			args,
		)
		await EvalResultToInteractionResponse(res, interaction)
	},
)
