import z from "https://deno.land/x/zod@v3.24.1/mod.ts"

const dbEntrySchema = z.intersection(
	z.object({
		owner: z.string().refine((s) => s.match(/^\d+$/)),
		args: z.string().optional(),
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

export type dbEntry = z.infer<typeof dbEntrySchema>

export const tags = new Map<
	string, // Tag name
	dbEntry
>()

for (
	const entry of Deno.readTextFileSync(
		import.meta.resolve("./db.txt").slice("file://".length),
	).split("\n")
) {
	if (!entry) continue
	const [name, data] = entry.split("\t")
	try {
		tags.set(name, dbEntrySchema.parse(JSON.parse(data)))
	} catch {
		console.warn("Invalid database entry:", entry)
	}
}
