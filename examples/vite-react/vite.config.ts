import satteriSandpack from '@lekoarts/satteri-sandpack'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import satteri from 'vite-plugin-satteri'

export default defineConfig({
	plugins: [
		react(),
		satteri({
			mdastPlugins: [
				satteriSandpack({
					componentName: ['Playground'],
				}),
			],
		}),
	],
})
