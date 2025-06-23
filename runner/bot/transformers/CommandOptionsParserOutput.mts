import type { ApplicationCommandOptionTypes, CreateSlashApplicationCommand } from "discordeno"
import type { bot } from "../index.mts"

type ResolveApplicationCommandOption<T extends NonNullable<CreateSlashApplicationCommand["options"]>[0]> = {
	[ApplicationCommandOptionTypes.String]: string
	[ApplicationCommandOptionTypes.Number]: number
	[ApplicationCommandOptionTypes.Integer]: number
	[ApplicationCommandOptionTypes.Boolean]: boolean
	[ApplicationCommandOptionTypes.SubCommandGroup]: CommandOptionsParserOutput<T["options"]>
	[ApplicationCommandOptionTypes.SubCommand]: CommandOptionsParserOutput<T["options"]>
	[ApplicationCommandOptionTypes.Attachment]: typeof bot.transformers.$inferredTypes.attachment
	[ApplicationCommandOptionTypes.Channel]: typeof bot.transformers.$inferredTypes.channel
	[ApplicationCommandOptionTypes.Role]: typeof bot.transformers.$inferredTypes.role
	[ApplicationCommandOptionTypes.User]: {
		user?: typeof bot.transformers.$inferredTypes.user
		member?: typeof bot.transformers.$inferredTypes.member
	}
	[ApplicationCommandOptionTypes.Mentionable]: typeof bot.transformers.$inferredTypes.role | {
		user?: typeof bot.transformers.$inferredTypes.user
		member?: typeof bot.transformers.$inferredTypes.member
	}
}[T["type"]]

// deno-fmt-ignore
export type CommandOptionsParserOutput<T extends CreateSlashApplicationCommand['options']> =
	T extends NonNullable<T> ? {
		[K in keyof T as K extends `${number}` ? T[K]['name'] : never]: K extends `${number}` ? (
            ResolveApplicationCommandOption<T[K]> | (
                T[K]['required'] extends true ? never : undefined
            )
		) : never
	} : Record<never, never>
