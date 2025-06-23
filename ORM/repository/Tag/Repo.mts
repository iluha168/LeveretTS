import { db } from "../../connection/index.mts"
import { TagRow, zTagRow } from "./row.mts"
import type { TagModel } from "./TagModel.mts"

import { distance as levenshtein } from "jsr:@alg/levenshtein@^0.0.4"

/**
 * Cache stores ALL of the tags for now
 */
const cache = new Map<TagModel["name"], TagModel>()

// Will become async if the cache no longer stores all tags
// deno-lint-ignore require-await
export async function fetch(name: string) {
	return cache.get(name)
}

export async function save(tagRow: TagRow, affectDB = true) {
	const { error, data: tagModel } = zTagRow.safeParse(tagRow)
	if (error) {
		throw new TypeError(error.issues.map((i) => i.message).join("\n"))
	}
	if (affectDB) {
		const rowPack = [tagRow.name, tagRow.owner, tagRow.type, tagRow.body]
		await db.execute(
			`INSERT INTO Tag(name, owner, type, body) VALUES(?,?,?,?)
			ON DUPLICATE KEY UPDATE name=?,owner=?,type=?,body=?`,
			[...rowPack, ...rowPack],
		)
	}
	cache.set(tagRow.name, tagModel)
}

export async function remove(tagRow: TagRow) {
	const { affectedRows } = await db.execute(
		"DELETE FROM Tag WHERE name=? AND owner=?",
		[tagRow.name, tagRow.owner],
	)
	if (!affectedRows) throw new Error("Failed to delete tag", { cause: tagRow })
	cache.delete(tagRow.name)
}

export async function* fetchTagNames(): AsyncGenerator<string> {
	yield* cache.keys()
}

const findTagNamesLevenshteinOptions = { maxCost: 8, deletion: 6, substitution: 4, insertion: 0.1 }
export async function findTagNames(targetName: string): Promise<string[]> {
	const candidates: [string, number][] = []
	for await (const name of fetchTagNames()) {
		const distance: number = levenshtein(targetName, name, findTagNamesLevenshteinOptions)
		if (distance > 8) continue
		candidates.push([name, distance] as const)
	}
	return candidates
		.sort(([, a], [, b]) => a - b)
		.splice(0, 50)
		.map(([name]) => name)
}

await db.useConnection(async (conn) => {
	const { iterator: tagRows } = await conn.execute(
		"SELECT * FROM Tag",
		[],
		true,
	)
	for await (const tagRow of tagRows) {
		await save(tagRow, false)
	}
})
