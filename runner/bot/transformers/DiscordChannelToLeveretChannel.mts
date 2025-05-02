import { Channel, GuildChannel } from "../../../typings/leveret.d.ts"
import type { bot } from "../index.mts"

export const DiscordChannelToLeveretChannel = (channel: Partial<typeof bot.transformers.$inferredTypes.channel>): Channel => ({
	id: `${channel.id ?? 0}`,
	name: channel.name ?? "",
	createdTimestamp: Date.now(),
	messages: [],
})

export const DiscordGuildChannelToLeveretChannel = (channel: Partial<typeof bot.transformers.$inferredTypes.channel>): GuildChannel => ({
	id: `${channel.id ?? 0}`,
	name: channel.name ?? "",
	createdTimestamp: Date.now(),
	messages: [],
	guildId: `${channel.guildId ?? 0}`,
})
