import { ApplicationCommandTypes } from "discordeno"
import { applicationCommandRegistry } from "../registry.mts"
import { contextsEverywhere } from "../common/contexts.mts"

export const tagsSubcommandRegister = applicationCommandRegistry.registerSubRegistry({
	name: "tags",
	description: "Manage tags",
	type: ApplicationCommandTypes.ChatInput,
	contexts: contextsEverywhere,
})
