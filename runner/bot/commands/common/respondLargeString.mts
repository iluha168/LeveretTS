import type { Interaction } from "../registry.mts"

/**
 * Responds to the {@linkcode interaction}, uploading {@linkcode str} as a file, if necessary.
 * Passing strings *too large* will result in an error message shown to the user.
 */
export const respondLargeString = (
	interaction: Interaction,
	str: string,
) => {
	if (str.length < 2000) {
		return interaction.respond({
			content: str,
			allowedMentions: { parse: [] },
		})
	}
	if (new TextEncoder().encode(str).byteLength < 4 * 1024 * 1024) {
		return interaction.respond({
			files: [{
				name: "message.txt",
				blob: new Blob([str]),
			}],
		})
	}
	return interaction.respond("🛑 Response is >4 MBytes. Not going to bother sending that.")
}
