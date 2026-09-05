declare module '*.mdx' {
	import type { ComponentType, ElementType } from 'react'

	const Content: ComponentType<{
		components?: Record<string, ElementType>
	}>

	export default Content
}
