import { ApplicationCommandOptionTypes, InteractionTypes } from "discordeno"
import { tagsSubcommandRegister } from "./handler.mts"
import { AliasTagModel, JsTagModel, Tags, TxtTagModel } from "ORM"
import { tagNameOption, tagNameOptionAutocomplete } from "../common/tagNameOption.mts"
import { unreachable } from "../../util/unreachable.mts"

tagsSubcommandRegister({
	type: ApplicationCommandOptionTypes.SubCommand,
	name: "raw",
	description: "Shows information about an alias tag, other tags will always be uploaded as files.",
	options: [tagNameOption],
}, async (interaction, { name }) => {
	if (interaction.type === InteractionTypes.ApplicationCommandAutocomplete) {
		return tagNameOptionAutocomplete(interaction, name)
	}
	const tag = await Tags.fetch(name)
	if (!tag) return interaction.respond(`⚠️ Tag **${name}** doesn't exist.`)
	if (tag instanceof TxtTagModel) {
		return interaction.respond({
			files: [{ name: "message.txt", blob: new Blob([tag.body]) }],
		})
	}
	if (tag instanceof JsTagModel) {
		return interaction.respond({
			files: [{ name: "message.js", blob: new Blob([tag.code]) }],
		})
	}
	if (tag instanceof AliasTagModel) {
		return interaction.respond({
			content: `Tag **${tag.name}** is an alias of **${tag.refName}**${tag.refArgs && ` (with args \`${tag.refArgs}\`)`}.`,
			allowedMentions: { parse: [] },
		})
	}
	unreachable()
})
