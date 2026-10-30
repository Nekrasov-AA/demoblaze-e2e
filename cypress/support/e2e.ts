import { register as registerCypressGrep } from '@cypress/grep'

// Filters tests in the browser by title/tags; the config plugin only filters spec files.
registerCypressGrep()
