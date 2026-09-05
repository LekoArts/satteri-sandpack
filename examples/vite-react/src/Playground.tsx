import type { ComponentProps } from 'react'
import { Sandpack } from '@codesandbox/sandpack-react'

type PlaygroundProps = Pick<ComponentProps<typeof Sandpack>, 'files' | 'template' | 'customSetup'>

export function Playground({ files, template, customSetup }: PlaygroundProps) {
	return <Sandpack theme="auto" files={files} template={template} customSetup={customSetup} />
}
