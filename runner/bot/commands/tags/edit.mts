import { ApplicationCommandOptionTypes, InteractionTypes } from "discordeno"
import { tagsSubcommandRegister } from "./handler.mts"
import { AliasTagModel, JsTagModel, Tags, TxtTagModel, UserModel } from "ORM"
import { unreachable } from "../../util/unreachable.mts"
import { tagNameOption } from "../common/tagNameOption.mts"

tagsSubcommandRegister({
	type: ApplicationCommandOptionTypes.SubCommandGroup,
	name: "edit",
	description: "Modifies a tag",
	options: [{
		type: ApplicationCommandOptionTypes.SubCommand,
		name: "text",
		description: "Sets tag to be a text tag",
		options: [{
			...tagNameOption,
			autocomplete: true,
		}, {
			type: ApplicationCommandOptionTypes.String,
			name: "body",
			description: "Tag's new content",
			required: true,
		}],
	}, {
		type: ApplicationCommandOptionTypes.SubCommand,
		name: "code",
		description: "Sets tag to be a code tag",
		options: [{
			...tagNameOption,
			autocomplete: true,
		}, {
			type: ApplicationCommandOptionTypes.String,
			name: "js",
			description: "Tag's new code, written in JavaScript language",
			required: true,
		}],
	}, {
		type: ApplicationCommandOptionTypes.SubCommand,
		name: "alias",
		description: "Sets tag to be an alias tag",
		options: [{
			...tagNameOption,
			autocomplete: true,
		}, {
			type: ApplicationCommandOptionTypes.String,
			name: "ref",
			description: "Existing tag's name, which this one will point to",
			required: true,
		}, {
			type: ApplicationCommandOptionTypes.String,
			name: "args",
			description: "If the referenced tag is a code tag, these arguments will be passed to it",
			required: false,
		}],
	}],
}, async (interaction, { text, code, alias }) => {
	const userTags = new UserModel(interaction.user.id).tags
	const tagName = text?.name ?? code?.name ?? alias?.name ?? unreachable()

	if (interaction.type === InteractionTypes.ApplicationCommandAutocomplete) {
		return interaction.respond({
			choices: (await userTags.find(tagName))
				.values()
				.take(25)
				.map((name) => ({ name, value: name }))
				.toArray(),
		})
	}

	const tag = await Tags.fetch(tagName)
	if (!tag) {
		return interaction.respond(`⚠️ Tag **${tagName}** doesn't exist.`)
	}
	try {
		await userTags.edit(
			tag,
			// deno-fmt-ignore
			text ? new TxtTagModel(tagName, tag.ownerId, text.body) :
			code ? new JsTagModel(tagName, tag.ownerId, code.js) :
			alias ? new AliasTagModel(tagName, tag.ownerId, alias.ref, alias.args ?? "") :
			unreachable(),
		)
	} catch (e) {
		if (e instanceof Error) {
			return interaction.respond({
				content: e.message,
				allowedMentions: { parse: [] },
			})
		}
	}
	return interaction.respond(`Edited tag **${tagName}**. ✅`)
})
