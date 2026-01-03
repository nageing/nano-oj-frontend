import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
// import monacoEditorPlugin from 'vite-plugin-monaco-editor'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    // (monacoEditorPlugin as any).default
    //     ? (monacoEditorPlugin as any).default({ languageWorkers: ['editorWorkerService', 'typescript', 'json', 'html'] })
    //     : monacoEditorPlugin({ languageWorkers: ['editorWorkerService', 'typescript', 'json', 'html'] })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
