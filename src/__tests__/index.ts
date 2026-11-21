import type { MdastPluginDefinition } from 'satteri'
import type { Options } from '../index'
import { readFileSync } from 'node:fs'
import { evaluate, mdxToJs } from 'satteri'
import { describe, expect, it } from 'vitest'
import * as publicExports from '../index'
import { ERRORS } from '../utils'

function fixture(name: string): string {
	return readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8')
}

function compile(name: string, options?: Options): string {
	const result = mdxToJs(fixture(name), {
		mdastPlugins: [publicExports.default(options)],
	})

	expect(result).not.toBeInstanceOf(Promise)
	return result.code.replace(/\s+/g, ' ')
}

describe('satteriSandpack', () => {
	it('exports only the default runtime API', () => {
		expect(Object.keys(publicExports).sort()).toEqual(['default'])
	})

	it('creates a synchronous named plugin without options', () => {
		const plugin = publicExports.default()
		const definition: MdastPluginDefinition = plugin
		const options: Options = {}

		expect(options).toEqual({})
		expect(definition).toBe(plugin)
		expect(plugin).not.toBeInstanceOf(Promise)
		expect(plugin.name).toBe('satteri-sandpack')
		expect(plugin.mdxJsxFlowElement).toBeTypeOf('function')
	})

	it('transforms the default component with every supported file option', () => {
		const code = compile('standard.mdx')

		expect(code).toContain('template: "react"')
		expect(code).toContain('files: { "App.js": {')
		expect(code).toContain('"active": true')
		expect(code).toContain('"hidden": true')
		expect(code).toContain('"readOnly": true')
		expect(code).toContain('"showReadOnly": true')
		expect(code).toContain('children:')
		expect(code).toContain('Hello World')
	})

	it('supports a custom component name', () => {
		const code = compile('custom-component.mdx', { componentName: ['Playground'] })

		expect(code).toContain('const { Playground } = _components;')
		expect(code).toContain('files: { "App.js": {')
		expect(code).toContain('Custom component')
	})

	it('supports multiple configured names and matching components', () => {
		const code = compile('multiple-component-names.mdx', {
			componentName: ['Playground', 'MinimalPlayground'],
		})

		expect(code).toContain('files: { "first.js": {')
		expect(code).toContain('files: { "second.js": {')
		expect(code.match(/files:/g)).toHaveLength(2)
	})

	it('recursively collects nested code blocks', () => {
		const code = compile('nested.mdx')

		expect(code).toContain('files: { "nested.js": {')
		expect(code).toContain('"hidden": true')
	})

	it('uses the final code block when filenames are duplicated', () => {
		const code = compile('duplicate-names.mdx')

		expect(code).toContain('files: { "duplicate.js": {')
		expect(code).toContain('"code": "export const value = \'second version\'"')
		expect(code).toContain('"active": true')
	})

	it('preserves existing props and appends generated files after author files', () => {
		const code = compile('existing-props-files.mdx')
		const authorFiles = 'files: { "original.js": { "code": "original" } }'
		const generatedFiles = 'files: { "generated.js": {'

		expect(code).toContain('template: "react"')
		expect(code).toContain('custom: "preserved"')
		expect(code).toContain(authorFiles)
		expect(code).toContain(generatedFiles)
		expect(code.indexOf(authorFiles)).toBeLessThan(code.indexOf(generatedFiles))
		expect(code).toContain('children:')
	})

	it('emits an empty files object for an empty matching component', () => {
		expect(compile('empty.mdx')).toContain('files: {}')
	})

	it('leaves unmatched components unchanged', () => {
		const code = compile('unmatched.mdx')

		expect(code).toContain('const { NotSandpack } = _components;')
		expect(code).not.toContain('files:')
		expect(code).toContain('ignored = true')
	})

	it('passes code verbatim to the component at runtime', () => {
		const received: Array<Record<string, unknown>> = []
		const jsx = (type: unknown, props: unknown): unknown => typeof type === 'function' ? type(props) : null
		const result = evaluate(fixture('special-characters.mdx'), {
			Fragment: Symbol('Fragment'),
			jsx,
			jsxs: jsx,
			mdastPlugins: [publicExports.default()],
		})

		if (result instanceof Promise)
			throw new TypeError('Expected synchronous evaluation')

		const Content = result.default as (props: { components: Record<string, unknown> }) => unknown
		Content({ components: { Sandpack: (props: Record<string, unknown>) => received.push(props) } })

		expect(received).toHaveLength(1)
		expect(received[0]?.template).toBe('vanilla')
		expect(received[0]?.files).toEqual({
			'index.js': {
				code: [
					'const name = "Sätteri ✨"',
					// eslint-disable-next-line no-template-curly-in-string -- authored code contains a template literal
					'const greeting = `Hello ${name}, it\'s {not} an expression`',
					'const pattern = /\\d+\\.\\s*\\\\n/g',
					'',
					'document.body.innerHTML = \'<script>alert(1)</script>\' + greeting',
				].join('\n'),
				active: true,
			},
			'styles.css': {
				code: 'body::after { content: "\\201C quoted \\201D"; }',
				hidden: true,
			},
		})
	})

	it('throws malformed metadata errors through mdxToJs', () => {
		expect(() => mdxToJs('<Sandpack>\n\n```js active\ncode\n```\n\n</Sandpack>', {
			mdastPlugins: [publicExports.default()],
		})).toThrow(ERRORS.MISSING_NAME)
	})
})
