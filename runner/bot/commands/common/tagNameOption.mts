import { ApplicationCommandOption, ApplicationCommandOptionTypes } from "discordeno"
import { Tags, type UserTagsModel } from "ORM"
import type { Interaction } from "../registry.mts"

/**
 * Do not forget to provide autocomplete if you are using this option!
 */
export const tagNameOption = {
	name: "name",
	type: ApplicationCommandOptionTypes.String,
	description: "Tag's name",
	required: true,
	minLength: 1,
	maxLength: 768,
	autocomplete: true,
} as const satisfies ApplicationCommandOption

export const tagNameOptionAutocomplete = async (
	interaction: Interaction,
	tagName: string,
	userTags?: UserTagsModel,
) => interaction.respond({
	choices: (await Tags.findTagNames(tagName, userTags?.user.id))
		.values()
		.take(25)
		.map((name) => ({ name, value: name }))
		.toArray(),
})
