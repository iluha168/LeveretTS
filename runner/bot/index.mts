import { load } from "jsr:@std/dotenv"
import { createBot } from "discordeno"

import { applicationCommandRegistry, interactionCreateHandler } from "./commands/registry.mts"
import {} from "./commands/tag/handler.mts"
import {} from "./commands/tags/handler.mts"
import {} from "./commands/tags/delete.mts"
import {} from "./commands/tags/edit.mts"
import {} from "./commands/eval/handler.mts"

await load({
	export: true,
	envPath: new URL(import.meta.resolve("./.env")).pathname,
})
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
			toggles: true,
			publicFlags: true,
			username: true,
			discriminator: true,
			accentColor: true,
			avatar: true,
			banner: true,
			globalName: true,
		},
		channel: {
			type: true,
			id: true,
			name: true,
			guildId: true,
		},
		member: {
			user: true,
			avatar: true,
			banner: true,
			guildId: true,
			joinedAt: true,
			premiumSince: true,
			nick: true,
			toggles: true,
			communicationDisabledUntil: true,
			roles: true,
		},
	},
})
bot.events.interactionCreate = interactionCreateHandler

await Promise.all([
	bot.start(),
	bot.rest.upsertGlobalApplicationCommands(applicationCommandRegistry.descriptions)
		.then(() => applicationCommandRegistry.forgetDescriptions()),
])
