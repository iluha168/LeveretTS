import { ApplicationCommandOptionTypes, ApplicationCommandTypes } from "discordeno"
import { applicationCommandRegistry } from "../registry.mts"
import { evalCode } from "../../sandbox/engineInstance.mts"
import { DiscordInteractionToLeveretMessage } from "../../transformers/DiscordInteractionToLeveretMessage.mts"
import { EvalResultToInteractionResponse } from "../../transformers/EvalResultToInteractionResponse.mts"
import { contextsEverywhere } from "../common/contexts.mts"

applicationCommandRegistry.register(
	{
		name: "eval",
		description: "Evaluates JavaScript",
		type: ApplicationCommandTypes.ChatInput,
		contexts: contextsEverywhere,
		options: [{
			name: "code",
			type: ApplicationCommandOptionTypes.String,
			description: "JavaScript",
			required: true,
		}, {
			name: "args",
			type: ApplicationCommandOptionTypes.String,
			description: "This string will be available in your code under the name `tag.args`",
			required: false,
		}],
	},
	async (interaction, { code, args }) => {
		const deferTimeout = setTimeout(() => interaction.defer().catch(() => {}), 1000)
		const res = await evalCode({
			code,
			tag: {
				body: code,
				hops: [""],
				name: "",
				owner: `${interaction.user.id}`,
				args,
			},
			msg: {
				...DiscordInteractionToLeveretMessage(interaction),
				content: `%eval \`\`\`js\n${code}\`\`\``,
			},
		})
		clearTimeout(deferTimeout)
		await EvalResultToInteractionResponse(res, interaction)
	},
)
