import { type ApplicationCommandOptionTypes, commandOptionsParser, type CreateSlashApplicationCommand } from "discordeno"
import type { CommandOptionsParserOutput } from "../transformers/CommandOptionsParserOutput.mts"
import type { bot } from "../index.mts"

export type Interaction = typeof bot.transformers.$inferredTypes.interaction
export type Handler<T> = (interaction: Interaction, options: T) => Promise<unknown>
// deno-lint-ignore no-explicit-any
type Hanydler = Handler<any>

type CreateSlashSubCommandOption = NonNullable<CreateSlashApplicationCommand["options"]>[0]

class Registry<
	Description extends { name: string; options?: CreateSlashSubCommandOption[] },
> {
	constructor(public readonly registryLabel: string) {}
	public readonly descriptions: Description[] = []
	public readonly handlers: Map<string, Hanydler> = new Map()
	private readonly subRegistryGCs: (typeof this.forgetDescriptions)[] = []

	register<const D extends Description>(
		description: D,
		handler: NoInfer<Handler<CommandOptionsParserOutput<D["options"]>>>,
	) {
		console.debug("Registering", `${this.registryLabel}/${description.name}`)
		this.descriptions.push(description)
		this.handlers.set(description.name, handler)
	}

	registerSubRegistry(description: Omit<Description, "options">) {
		const subRegistry = new Registry<
			CreateSlashSubCommandOption & { type: ApplicationCommandOptionTypes.SubCommand | ApplicationCommandOptionTypes.SubCommandGroup }
		>(
			`${this.registryLabel}/${description.name}`,
		)
		this.subRegistryGCs.push(() => subRegistry.forgetDescriptions())
		this.register(
			{ ...description, options: subRegistry.descriptions } as Description,
			async (interaction, options) => {
				const [[subName, subOptions]] = Object.entries(options)
				const handler = subRegistry.handlers.get(subName)
				if (!handler) {
					return console.warn("No handler for interaction called", description.name, subName)
				}
				await handler(interaction, subOptions)
			},
		)
		return subRegistry.register.bind(subRegistry)
	}

	forgetDescriptions() {
		queueMicrotask(() => {
			for (const gc of this.subRegistryGCs.splice(0)) {
				if (gc() <= 0) throw new Error("A subregistry must not be empty")
			}
		})
		return this.descriptions.splice(0).length
	}
}

export const applicationCommandRegistry = new Registry<CreateSlashApplicationCommand>("Commands")

export const interactionCreateHandler = async (interaction: Interaction) => {
	if (!interaction.data) return
	const handler = applicationCommandRegistry.handlers.get(interaction.data.name)
	if (!handler) {
		return console.warn("No handler for interaction called", interaction.data.name)
	}
	try {
		await handler(interaction, commandOptionsParser(interaction))
	} catch (e) {
		if (e instanceof Error) {
			console.error(`Application command "${interaction.data.name}" failed`, e)
		} else throw e
	}
}
