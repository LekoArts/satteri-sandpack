import type { MdastPluginDefinition } from 'satteri'
import type { Options } from '../index'
import { describe, expect, it } from 'vitest'
import * as publicExports from '../index'

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
})
