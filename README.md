# satteri-sandpack

Author [Sandpack](https://sandpack.codesandbox.io/docs) files as fenced code blocks in MDX compiled by [Sätteri](https://github.com/withastro/satteri).

`@lekoarts/satteri-sandpack` is a native, synchronous Sätteri MDAST plugin. It is not a remark/unified plugin and does not require a remark compatibility layer.

## Installation

This package is ESM only and requires Node.js 22 or newer. It supports Sätteri `>=0.10.5` within the package's `^0.10.5` peer range.

```shell
pnpm add @lekoarts/satteri-sandpack satteri
```

Install and render a Sandpack component separately, such as `@codesandbox/sandpack-react`. This plugin only creates the component's `files` prop during MDX compilation.

## Usage

Given this MDX:

````mdx
<Sandpack template="react">

```js name=App.js active
import { NAME } from './constants.js'

export default function App() {
  return <h1>Hello {NAME}</h1>
}
```

```js name=constants.js readOnly
export const NAME = 'World'
```

</Sandpack>
````

The plugin appends a `files` expression equivalent to:

```jsx
<Sandpack
	template="react"
	files={{
		'App.js': {
			code: 'import { NAME } from \'./constants.js\'\n\nexport default function App() {\n  return <h1>Hello {NAME}</h1>\n}',
			active: true,
		},
		'constants.js': {
			code: 'export const NAME = \'World\'',
			readOnly: true,
		},
	}}
>
	{/* Existing MDX children remain here. */}
</Sandpack>
```

Existing attributes and children are preserved. If the component already has a `files` attribute, the generated attribute is appended after it. If multiple blocks use the same filename, the final block wins.

### Direct `mdxToJs` integration

```js
import satteriSandpack from '@lekoarts/satteri-sandpack'
import { mdxToJs } from 'satteri'

const result = mdxToJs(source, {
	mdastPlugins: [satteriSandpack()],
})

console.log(result.code)
```

The plugin is synchronous, so adding it does not make `mdxToJs` return a Promise.

### Vite integration

Use the plugin through `vite-plugin-satteri`:

```ts
import satteriSandpack from '@lekoarts/satteri-sandpack'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import satteri from 'vite-plugin-satteri'

export default defineConfig({
	plugins: [
		react(),
		satteri({
			mdastPlugins: [satteriSandpack({ componentName: ['Playground'] })],
		}),
	],
})
```

A complete Vite + React application is available in [`examples/vite-react`](./examples/vite-react/).

## Code-block metadata

Every fenced code block inside a matching component requires non-empty metadata containing `name=...`:

````md
```js name=filename.js active
console.log('Hello World')
```
````

The filename may be followed by any of these boolean Sandpack file flags:

- `active` — forwards `active: true`
- `hidden` — forwards `hidden: true`
- `readOnly` — forwards `readOnly: true`
- `showReadOnly` — forwards `showReadOnly: true`, commonly alongside `readOnly`

Flags may appear in any order and are included only when present. Code blocks nested more deeply inside the matching MDX flow component are collected recursively.

Invalid metadata throws during compilation:

- missing metadata: code blocks cannot have empty metadata
- missing or empty `name=...`: code blocks must have a `name` attribute
- unknown tokens: only `active`, `hidden`, `readOnly`, and `showReadOnly` are accepted after the filename

## Configuration

The default component name is `Sandpack`:

```js
satteriSandpack()
```

Use `componentName` for a custom component:

```js
satteriSandpack({ componentName: ['Playground'] })
```

Pass multiple names when the same document uses more than one wrapper:

```js
satteriSandpack({
	componentName: ['Playground', 'MinimalPlayground'],
})
```

Only matching MDX flow elements are transformed. Nameless and unmatched elements are left unchanged.

## API

The package has one runtime export: the default `satteriSandpack` factory. It also exports its configuration type as `Options`.

### `satteriSandpack(options?)`

Returns a named Sätteri `MdastPluginDefinition`.

### `Options`

```ts
interface Options {
	componentName?: Array<string>
}
```

## Development

```shell
pnpm install
pnpm test
pnpm typecheck
pnpm lint
pnpm build
pnpm --dir examples/vite-react build
pnpm check
```

The repository uses Changesets for releases. No changeset is included while preparing the initial unpublished `1.0.0` release; adding one now would incorrectly schedule a subsequent version bump.
