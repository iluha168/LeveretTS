import { ApplicationCommandOptionTypes, ApplicationCommandTypes, commandOptionsParser } from "discordeno"
import { register } from "../registry.mts"
import { evalCode } from "../tag/engineInstance.mts"
import { DiscordInteractionToLeveretMessage } from "../../transformers/DiscordInteractionToLeveretMessage.mts"

register(
	{
		name: "eval",
		description: "Evaluates JavaScript",
		type: ApplicationCommandTypes.ChatInput,
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
	async (interaction) => {
		const { code, args } = commandOptionsParser(interaction) as { code: string; args?: string }
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
		if (res !== undefined) {
			await interaction.respond(`${res}`)
		}
	},
)
