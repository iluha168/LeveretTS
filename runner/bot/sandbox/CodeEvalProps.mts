import { Hops, Message, Tag } from "../../../typings/leveret.d.ts"

export type CodeEvalProps = {
	code: string
	tag?: Tag & Hops
	msg: Omit<Message, "reply">
}
