import { defineConfig } from 'cypress'
import codeCoverageTask from '@cypress/code-coverage/task.js'

export default defineConfig({
  component: {
    setupNodeEvents(on, config) {
      codeCoverageTask(on, config)
      return config
    },
    devServer: {
      framework: 'vue',
      bundler: 'vite'
    }
  },
  coverage: {
    report: true // allows Cypress to merge and report coverage
  }
})
