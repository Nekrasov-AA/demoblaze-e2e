import type { User } from './factories/user'

const API_URL = 'https://api.demoblaze.com'

declare global {
  // Augmenting Cypress's own global namespace is the documented way to type custom commands.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /** Creates a user via POST /signup and fails if the API returns an errorMessage. */
      createUser(user: User): Chainable<void>
      /**
       * Stubs `alert` on the current window as `@alert`. Call it after the page has loaded,
       * right before the action that triggers the alert; a new page needs a new call.
       */
      stubAlert(): Chainable<void>
    }
  }
}

Cypress.Commands.add('createUser', (user: User) => {
  cy.request('POST', `${API_URL}/signup`, {
    username: user.username,
    // The UI sends the password base64-encoded; the API expects the same.
    password: btoa(user.password),
  }).then((response) => {
    // Errors come back as HTTP 200 with { errorMessage }, so the status alone proves nothing.
    expect(response.body?.errorMessage, `signup of ${user.username}`).to.equal(undefined)
  })
})

Cypress.Commands.add('stubAlert', () => {
  // Not cy.on('window:alert'): in Chrome open mode Cypress's own alert override was not
  // applied (verified with a diagnostic), so real dialogs appeared and nothing was recorded.
  // Stubbing the current window directly works in every browser and mode.
  cy.window().then((win) => {
    cy.stub(win, 'alert').as('alert')
  })
})
