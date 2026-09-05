import type { MdastNode, MdxJsxAttributeNode, MdxJsxFlowElement } from 'satteri'
import type { CodeMeta, CodeNode, SandpackFile } from './types'
import { ERRORS, isCodeMetaOption } from './utils'

export function resolveCodeMeta(codeNode: CodeNode): CodeMeta {
	if (!codeNode.meta?.trim())
		throw new Error(ERRORS.EMPTY_META)

	const meta: Partial<CodeMeta> = {}

	for (const attr of codeNode.meta.trim().split(/\s+/)) {
		if (attr.startsWith('name=')) {
			meta.name = attr.slice(5)
		}
		else if (isCodeMetaOption(attr)) {
			meta[attr] = true
		}
		else {
			throw new Error(ERRORS.INVALID_META(attr))
		}
	}

	if (!meta.name)
		throw new Error(ERRORS.MISSING_NAME)

	return meta as CodeMeta
}

export function collectSandpackFiles(node: Readonly<MdxJsxFlowElement>): Record<string, SandpackFile> {
	const files: Record<string, SandpackFile> = {}

	for (const child of node.children)
		collectCodeFiles(child, files)

	return files
}

export function transformSandpackNode(node: Readonly<MdxJsxFlowElement>): MdxJsxFlowElement {
	const files = collectSandpackFiles(node)
	const filesAttribute: MdxJsxAttributeNode = {
		type: 'mdxJsxAttribute',
		name: 'files',
		value: {
			type: 'mdxJsxAttributeValueExpression',
			value: JSON.stringify(files),
		},
	}

	return {
		...node,
		attributes: [...node.attributes, filesAttribute],
	}
}

function collectCodeFiles(node: MdastNode, files: Record<string, SandpackFile>): void {
	if (node.type === 'code') {
		const meta = resolveCodeMeta(node)
		files[meta.name] = {
			code: node.value,
			...(meta.active && { active: true }),
			...(meta.hidden && { hidden: true }),
			...(meta.readOnly && { readOnly: true }),
			...(meta.showReadOnly && { showReadOnly: true }),
		}
	}

	if ('children' in node) {
		for (const child of node.children)
			collectCodeFiles(child, files)
	}
}
