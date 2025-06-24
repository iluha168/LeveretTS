import { ApplicationCommandOptionTypes, InteractionTypes } from "discordeno"
import { tagsSubcommandRegister } from "./handler.mts"
import { AliasTagModel, JsTagModel, TxtTagModel, UserModel } from "ORM"
import { unreachable } from "../../util/unreachable.mts"
import { tagNameOption, tagNameOptionAutocomplete } from "../common/tagNameOption.mts"
import { respondLargeString } from "../common/respondLargeString.mts"

tagsSubcommandRegister({
	type: ApplicationCommandOptionTypes.SubCommandGroup,
	name: "add",
	description: "Creates a tag",
	options: [{
		type: ApplicationCommandOptionTypes.SubCommand,
		name: "text",
		description: "Creates a text tag",
		options: [{
			...tagNameOption,
			autocomplete: false,
		}, {
			type: ApplicationCommandOptionTypes.String,
			name: "body",
			description: "Tag's content",
			required: true,
		}],
	}, {
		type: ApplicationCommandOptionTypes.SubCommand,
		name: "code",
		description: "Creates a code tag",
		options: [{
			...tagNameOption,
			autocomplete: false,
		}, {
			type: ApplicationCommandOptionTypes.String,
			name: "js",
			description: "Tag's code, written in JavaScript language",
			required: true,
		}],
	}, {
		type: ApplicationCommandOptionTypes.SubCommand,
		name: "alias",
		description: "Creates an alias tag",
		options: [{
			...tagNameOption,
			autocomplete: false,
		}, {
			type: ApplicationCommandOptionTypes.String,
			name: "ref",
			description: "Existing tag's name, which this one will point to",
			required: true,
			autocomplete: true,
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
		return tagNameOptionAutocomplete(interaction, alias!.ref)
	}

	try {
		await userTags.add(
			// deno-fmt-ignore
			text ? new TxtTagModel(tagName, userTags.user.id, text.body) :
			code ? new JsTagModel(tagName, userTags.user.id, code.js) :
			alias ? new AliasTagModel(tagName, userTags.user.id, alias.ref, alias.args ?? "") :
			unreachable(),
		)
	} catch (e) {
		if (e instanceof Error) {
			return respondLargeString(interaction, e.message)
		}
		throw e
	}
	return respondLargeString(interaction, `✅ Created tag **${tagName}**.`)
})
