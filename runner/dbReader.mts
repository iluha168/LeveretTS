import z from "https://deno.land/x/zod@v3.24.1/mod.ts"

const dbEntrySchema = z.intersection(
	z.object({
		owner: z.string().refine((s) => s.match(/^\d+$/)),
	}),
	z.union([
		z.object({
			body: z.string(),
		}),
		z.object({
			alias: z.string(),
		}),
	]),
)

export const tags = new Map<
	string, // Tag name
	z.infer<typeof dbEntrySchema>
>()

for (
	const entry of Deno.readTextFileSync(
		import.meta.resolve("./db.txt").slice("file://".length),
	).split("\n")
) {
	const [name, data] = entry.split("\t")
	try {
		tags.set(name, dbEntrySchema.parse(JSON.parse(data)))
	} catch {
		console.error("Invalid database entry:", data)
		Deno.exit(1)
	}
}
