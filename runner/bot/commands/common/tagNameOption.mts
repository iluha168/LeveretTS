import { ApplicationCommandOption, ApplicationCommandOptionTypes } from "discordeno"

export const tagNameOption = {
	name: "name",
	type: ApplicationCommandOptionTypes.String,
	description: "Tag's name",
	required: true,
	minLength: 1,
	maxLength: 768,
} satisfies ApplicationCommandOption
