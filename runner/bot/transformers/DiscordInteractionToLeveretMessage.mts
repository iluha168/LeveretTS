import { Message } from "../../../typings/leveret.d.ts"
import type { bot } from "../index.mts"
import { DiscordGuildChannelToLeveretChannel } from "./DiscordChannelToLeveretChannel.mts"
import { DiscordMemberToLeveretMember, DiscordUserToLeveretUser } from "./DiscordUserToLeveretUser.mts"

export const DiscordInteractionToLeveretMessage = (interaction: typeof bot.transformers.$inferredTypes.interaction): Omit<Message, "reply"> => ({
	id: `${interaction.id}`,
	content: "",
	channelId: `${interaction.channelId ?? 0}`,
	reference: null,
	...(interaction.member
		? {
			guildId: `${interaction.guildId ?? 0}`,
			author: DiscordMemberToLeveretMember(interaction.member),
			channel: DiscordGuildChannelToLeveretChannel(interaction.channel),
		}
		: {
			guildId: null,
			author: DiscordUserToLeveretUser(interaction.user),
			channel: DiscordGuildChannelToLeveretChannel(interaction.channel),
		}),
})
