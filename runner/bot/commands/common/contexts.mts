import { DiscordInteractionContextType } from "discordeno"

export const contextsEverywhere: DiscordInteractionContextType[] = [
	DiscordInteractionContextType.Guild,
	DiscordInteractionContextType.BotDm,
	DiscordInteractionContextType.PrivateChannel,
]
