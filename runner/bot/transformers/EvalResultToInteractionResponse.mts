import type { InteractionCallbackData } from "discordeno"
import type { bot } from "../index.mts"
import type { evalCode } from "../sandbox/engineInstance.mts"

export const EvalResultToInteractionResponse = async (
	result: Awaited<ReturnType<typeof evalCode>>,
	interaction: typeof bot.transformers.$inferredTypes.interaction,
) => {
	if (result == null) {
		await interaction.defer().catch(() => {})
		await interaction.delete()
		return
	}
	const callbackData: InteractionCallbackData = result
	if ("content" in result && result.content.length > 2000) {
		callbackData.files = [{
			name: "message.txt",
			blob: new Blob([result.content]),
		}]
		delete callbackData.content
	}
	if (callbackData.files) {
		await interaction.defer().catch(() => {})
	}
	await interaction.respond({
		...callbackData,
		allowedMentions: { parse: [] },
	})
}
