import type { CodeMetaOptions } from './types'

export const CODE_META_OPTIONS = [
	'active',
	'hidden',
	'readOnly',
	'showReadOnly',
] as const

export function isCodeMetaOption(key: string): key is CodeMetaOptions {
	return CODE_META_OPTIONS.includes(key as CodeMetaOptions)
}

export const ERRORS = {
	EMPTY_META: 'Code blocks inside <Sandpack> components cannot have empty metadata. Be sure to provide a file name.',
	INVALID_META: (attr: string) => `Invalid meta attribute "${attr}" found in a code block inside <Sandpack> component. Be sure to use one of these valid attributes: ${CODE_META_OPTIONS.join(', ')}.`,
	MISSING_NAME: 'Code blocks inside <Sandpack> components must have a "name" attribute in their metadata.',
}
