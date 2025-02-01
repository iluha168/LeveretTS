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
		// @ts-ignore filtered out actual errors
		msg.reply(e)
	}
}
