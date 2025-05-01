import {} from "jsr:@std/dotenv/load"
import { createBot } from "discordeno"

import { bakeDescriptions, interactionCreateHandler } from "./commands/registry.mts"
import {} from "./commands/tag/handler.mts"

export const bot = createBot({
	events: {
		ready() {
			console.debug("Bot started!")
		},
	},
	token: Deno.env.get("DISCORD_TOKEN")!,
	desiredProperties: {
		interaction: {
			channel: true,
			channelId: true,
			context: true,
			data: true,
			guild: true,
			guildId: true,
			id: true,
			member: true,
			message: true,
			token: true,
			type: true,
			user: true,
		},
		user: {
			id: true,
		},
	},
})
bot.events.interactionCreate = interactionCreateHandler

await Promise.all([
	bot.start(),
	bot.rest.upsertGlobalApplicationCommands(bakeDescriptions()),
])
