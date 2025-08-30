// This file is used both by deno and node!
import type { Embed as RawLeveretEmbed } from "../../../../../typings/leveret.d.ts"

export type LeveretEmbed = { embed: Omit<RawLeveretEmbed["embed"], "type"> }

export type Embeds = {
	embeds: [LeveretEmbed["embed"]]
}

export type Content = {
	content: string
}

export type ValidatedReply = Content | Embeds
