import type { MdastNode } from 'satteri'

export interface SatteriSandpackOptions {
	/**
	 * Specify one or more component names to transform.
	 * These components will receive a `files` prop with the parsed code blocks.
	 * @default 'Sandpack'
	 */
	componentName?: Array<string>
}

export interface SandpackFile {
	code: string
	hidden?: boolean
	active?: boolean
	readOnly?: boolean
	showReadOnly?: boolean
}

export interface CodeMeta extends Omit<SandpackFile, 'code'> {
	name: string
}

export type CodeMetaOptions = keyof Omit<SandpackFile, 'code'>
export type CodeNode = Extract<MdastNode, { type: 'code' }>
