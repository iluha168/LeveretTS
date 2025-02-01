import { Util } from "../../typings/leveret.d.ts"

export function checkGuild(util: Util): asserts util is Util & Required<Pick<Util, "findUsers">> {
	if (!util.findUsers) {
		throw "❌ This command must be used in a server"
	}
}
