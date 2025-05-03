import { z } from "zod"
import type { Embed as RawLeveretEmbed } from "../../../../../../typings/leveret.d.ts"

type LeveretEmbed = { embed: Omit<RawLeveretEmbed["embed"], "type"> }
type Embeds = {
	embeds: [LeveretEmbed["embed"]]
}
type Content = {
	content: string
}

export type ValidatedReply = Content | Embeds | (Content & Embeds)

const zMedia = z.strictObject({
	url: z.string().url().min(1).max(256),
	proxy_url: z.string().url().min(1).max(256).optional(),
	height: z.number().int().min(1).optional(),
	width: z.number().int().min(1).optional(),
}).optional()

const zEmbed: z.ZodType<Embeds, z.ZodTypeDef, LeveretEmbed> = z.strictObject({
	embed: z.strictObject({
		title: z.string().min(1).max(256).optional(),
		description: z.string().min(1).max(4096).optional(),
		url: z.string().url().min(1).max(256).optional(),
		timestamp: z.string().min(1).max(256).optional(),
		color: z.number().min(0x000000).max(0xFFFFFF).optional(),
		footer: z.strictObject({
			text: z.string().min(1).max(2048),
			icon_url: z.string().url().min(1).max(256).optional(),
			proxy_icon_url: z.string().url().min(1).max(256).optional(),
		}).optional(),
		image: zMedia,
		thumbnail: zMedia,
		video: zMedia,
		provider: z.strictObject({
			name: z.string().min(1).max(256),
			url: z.string().url().min(1).max(256).optional(),
		}).optional(),
		fields: z.strictObject({
			name: z.string().min(1).max(256).optional(),
			value: z.string().min(1).max(1024).optional(),
			inline: z.boolean().optional(),
		}).array().min(1).max(25).optional(),
	}).refine((embed) => JSON.stringify(embed).length <= 6000, {
		message: "Too many characters",
	}),
}).transform(({ embed }) => ({
	embeds: [embed],
}))

const zContent: z.ZodType<Content, z.ZodTypeDef, string> = z
	.string().min(1)
	.transform((content) => ({ content }))

const zArgsToReply: z.ZodType<ValidatedReply, z.ZodTypeDef, any[]> = z
	.any().array()
	.min(1).max(2)
	.pipe(z.union([
		z.tuple([zContent]),
		z.tuple([zContent, zEmbed]),
		z.tuple([zEmbed]),
	]))
	.transform(([c, e]) => ({ ...c, ...e }))

export const validateReply = (input: any[]) => {
	const { success, data } = zArgsToReply.safeParse(input)
	if (success) return data
	throw new Error("msg.reply was called with invalid arguments")
}
