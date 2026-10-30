import { defineConfig } from 'cypress'
import { plugin as cypressGrepPlugin } from '@cypress/grep/plugin'

export default defineConfig({
  // Read by @cypress/grep. Both flags only take effect when a grep/grepTags filter is passed.
  expose: {
    // Skip spec files that contain no matching tests (decided in Node before the browser opens).
    grepFilterSpecs: true,
    // Drop non-matching tests from the run instead of reporting them as "pending".
    grepOmitFiltered: true,
  },
  retries: {
    // Headless/CI: one retry to absorb flakiness of a shared public demo site.
    runMode: 1,
    // Interactive: no retries, so failures are visible immediately while debugging.
    openMode: 0,
  },
  video: false,
  screenshotOnRunFailure: true,
  e2e: {
    baseUrl: 'https://www.demoblaze.com',
    setupNodeEvents(_on, config) {
      cypressGrepPlugin(config)
      return config
    },
  },
})
