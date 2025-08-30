import { z } from "zod"
import type { Content, Embeds, LeveretEmbed, ValidatedReply } from "../../tools/ValidatedReply.d.ts"

const zMedia = z.strictObject({
	url: z.url().min(1).max(256),
	proxy_url: z.url().min(1).max(256).optional(),
	height: z.number().int().min(1).optional(),
	width: z.number().int().min(1).optional(),
}).optional()

const embedNeedsAtLeastOneOf: string[] = ["title", "description", "footer", "provider", "fields"]

const zEmbed: z.ZodType<Embeds, LeveretEmbed> = z.strictObject({
	embed: z.strictObject({
		title: z.string().min(1).max(256).optional(),
		description: z.string().min(1).max(4096).optional(),
		url: z.url().min(1).max(256).optional(),
		timestamp: z.iso.datetime().optional(),
		color: z.number().min(0x000000).max(0xFFFFFF).optional(),
		footer: z.strictObject({
			text: z.string().min(1).max(2048),
			icon_url: z.url().min(1).max(256).optional(),
			proxy_icon_url: z.url().min(1).max(256).optional(),
		}).optional(),
		image: zMedia,
		thumbnail: zMedia,
		video: zMedia,
		provider: z.strictObject({
			name: z.string().min(1).max(256),
			url: z.url().min(1).max(256).optional(),
		}).optional(),
		fields: z.strictObject({
			name: z.string().min(1).max(256),
			value: z.string().min(1).max(1024),
			inline: z.boolean().optional(),
		}).array().min(1).max(25).optional(),
	}).refine((embed) => JSON.stringify(embed).length <= 6000, {
		message: "Too many characters",
	}),
})
	.transform(({ embed }) => embed)
	.refine(
		(embed) => Object.keys(embed).some((k) => embedNeedsAtLeastOneOf.includes(k)),
		{ error: `at least one embed property such as ${embedNeedsAtLeastOneOf.join(", ")} is required` },
	)
	.transform((embed) => ({ embeds: [embed] }))

const zContent: z.ZodType<Content, string> = z
	.string().min(1)
	.transform((content) => ({ content }))

const zArgsToReply: z.ZodType<ValidatedReply, any[]> = z
	.any().array()
	.min(1).max(2)
	.pipe(z.union([
		z.tuple([zContent]),
		z.tuple([zContent, zEmbed]),
		z.tuple([zEmbed]),
	], { error: "Expected args to be one of: content; embed; content, embed" }))
	.transform(([c, e]) => ({ ...c, ...e }))

export const validateReply = (input: any[]) => {
	const { success, data, error } = zArgsToReply.safeParse(input)
	if (success) return data
	throw new Error(
		"msg.reply was called with invalid arguments:\n" +
			z.prettifyError(error),
	)
}
