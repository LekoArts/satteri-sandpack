import type { MdxJsxAttributeNode, MdxJsxFlowElement } from 'satteri'
import type { CodeNode } from '../types'
import { describe, expect, it } from 'vitest'
import { collectSandpackFiles, resolveCodeMeta, transformSandpackNode } from '../node'
import { ERRORS } from '../utils'

function code(meta: string | null, value = ''): CodeNode {
	return {
		type: 'code',
		lang: 'js',
		meta,
		value,
	}
}

describe('resolveCodeMeta', () => {
	it.each([null, '', ' \t\n '])('throws when metadata is empty: %j', (meta) => {
		expect(() => resolveCodeMeta(code(meta))).toThrow(ERRORS.EMPTY_META)
	})

	it.each(['active', 'name='])('throws when a non-empty name is missing: %s', (meta) => {
		expect(() => resolveCodeMeta(code(meta))).toThrow(ERRORS.MISSING_NAME)
	})

	it('throws for an unknown option', () => {
		expect(() => resolveCodeMeta(code('name=test.js invalid'))).toThrow(ERRORS.INVALID_META('invalid'))
	})

	it('parses a name without options', () => {
		expect(resolveCodeMeta(code('name=test.js'))).toEqual({ name: 'test.js' })
	})

	it('parses every supported boolean option', () => {
		expect(resolveCodeMeta(code('name=test.js active hidden readOnly showReadOnly'))).toEqual({
			name: 'test.js',
			active: true,
			hidden: true,
			readOnly: true,
			showReadOnly: true,
		})
	})

	it('splits metadata on arbitrary whitespace', () => {
		expect(resolveCodeMeta(code('\tname=test.js\nactive   readOnly\t'))).toEqual({
			name: 'test.js',
			active: true,
			readOnly: true,
		})
	})
})

describe('sandpack node transformation', () => {
	it('lets the final duplicate filename win', () => {
		const node: MdxJsxFlowElement = {
			type: 'mdxJsxFlowElement',
			name: 'Sandpack',
			attributes: [],
			children: [
				code('name=duplicate.js hidden', 'first'),
				code('name=duplicate.js active', 'second'),
			],
		}

		expect(collectSandpackFiles(node)).toEqual({
			'duplicate.js': {
				code: 'second',
				active: true,
			},
		})
	})

	it('returns a replacement that reuses the original node fields and appends files', () => {
		const originalAttribute: MdxJsxAttributeNode = {
			type: 'mdxJsxAttribute',
			name: 'template',
			value: 'react',
		}
		const node: MdxJsxFlowElement = {
			type: 'mdxJsxFlowElement',
			name: 'Sandpack',
			attributes: [originalAttribute],
			children: [
				code('name=App.js showReadOnly', 'export default 1'),
			],
			data: { retained: true },
			position: {
				start: { line: 1, column: 1, offset: 0 },
				end: { line: 3, column: 12, offset: 42 },
			},
		}

		const result = transformSandpackNode(node)
		const generatedAttribute = result.attributes.at(-1)

		expect(result).not.toBe(node)
		expect(result.name).toBe(node.name)
		expect(result.children).toBe(node.children)
		expect(result.data).toBe(node.data)
		expect(result.position).toBe(node.position)
		expect(result.attributes[0]).toBe(originalAttribute)
		expect(generatedAttribute).toEqual({
			type: 'mdxJsxAttribute',
			name: 'files',
			value: {
				type: 'mdxJsxAttributeValueExpression',
				value: '{"App.js":{"code":"export default 1","showReadOnly":true}}',
			},
		})
	})
})
