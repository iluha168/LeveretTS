import type { CreateApplicationCommand } from "discordeno"
import type { bot } from "../index.mts"

type Interaction = typeof bot.transformers.$inferredTypes.interaction
export type Handler = (interaction: Interaction) => Promise<void>

const descriptions: Map<string, CreateApplicationCommand> = new Map()
const handlers: Map<string, Handler> = new Map()

export const register = (
	description: CreateApplicationCommand,
	handler: Handler,
) => {
	console.debug("Registering", description.name)
	descriptions.set(description.name, description)
	handlers.set(description.name, handler)
}

export const bakeDescriptions = () => {
	queueMicrotask(() => descriptions.clear())
	return Array.from(descriptions.values())
}

export const interactionCreateHandler = async (interaction: Interaction) => {
	if (!interaction.data) return
	const handler = handlers.get(interaction.data.name)
	if (!handler) {
		return console.warn("No handler for interaction called", interaction.data.name)
	}
	await handler(interaction)
}
