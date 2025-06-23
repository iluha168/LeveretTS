import { ApplicationCommandTypes } from "discordeno"
import { applicationCommandRegistry } from "../registry.mts"

export const tagsSubcommandRegister = applicationCommandRegistry.registerSubRegistry({
	name: "tags",
	description: "Manage tags",
	type: ApplicationCommandTypes.ChatInput,
})
