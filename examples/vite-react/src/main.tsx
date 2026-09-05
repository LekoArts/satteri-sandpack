import React from 'react'
import { createRoot } from 'react-dom/client'
import Content from './content.mdx'
import { Playground } from './Playground'
import './styles.css'

const root = document.querySelector('#root')

if (!root)
	throw new Error('Missing root element')

createRoot(root).render(
	<React.StrictMode>
		<main>
			<Content components={{ Playground }} />
		</main>
	</React.StrictMode>,
)
