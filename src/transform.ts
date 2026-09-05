import type { SatteriSandpackOptions } from './types'
import { defineMdastPlugin } from 'satteri'

export default function satteriSandpack(options?: Readonly<SatteriSandpackOptions>) {
	const componentName = options?.componentName ?? ['Sandpack']

	return defineMdastPlugin({
		name: 'satteri-sandpack',
		mdxJsxFlowElement(node) {
			if (!node.name || !componentName.includes(node.name))
				return null
		},
	})
}
