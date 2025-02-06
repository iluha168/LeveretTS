/**
 * A top-level pattern useful to call msg.reply once and exit, since it does not exit by default.
 * @param body Body of the tag
 */
export function throwReply(body: () => unknown) {
	try {
		body()
	} catch (e) {
		if (e instanceof Error) {
			throw e
		}
		if (Array.isArray(e)) {
			// @ts-ignore Leveret will handle
			return msg.reply(...e)
		}
		// @ts-ignore Leveret will handle
		return msg.reply(e)
	}
}
