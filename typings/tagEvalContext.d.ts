// deno-lint-ignore-file no-var
import { Http, Message, Tag, Util } from "./leveret.d.ts"

declare global {
	var msg: Message
	var tag: Tag
	var util: Util
	var http: Http
}
