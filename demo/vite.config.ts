import process from 'node:process'
import { defineConfig } from 'vite'

const hydrationDebug = process.env.HYDRATION_DEBUG === '1'

function hydrationDebugPlugin() {
  return {
    name: 'demo-hydration-debug',
    transformIndexHtml(html: string) {
      if (!hydrationDebug)
        return html

      return html.replace(
        '<head>',
        `<head>
    <script>
      ;(() => {
        const originalWarn = console.warn
        console.warn = (...args) => {
          const message = args.map(arg => String(arg)).join(' ')
          if (message.includes('Hydration') || message.includes('hydration')) {
            console.groupCollapsed('[Hydration debug]', ...args)
            console.log('raw args:', args)
            console.trace('hydration warning trace')
            for (const arg of args) {
              if (arg && typeof arg === 'object') {
                console.log('object arg:', arg)
                if (arg.nodeType)
                  console.log('dom node:', arg)
              }
            }
            console.groupEnd()
          }
          originalWarn.apply(console, args)
        }
      })()
    </script>`,
      )
    },
  }
}

// import { VitePWA } from 'vite-plugin-pwa'
export default defineConfig({
  define: {
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: hydrationDebug ? 'true' : 'false',
  },
  plugins: [hydrationDebugPlugin()],
})
