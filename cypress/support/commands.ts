import type { User } from './factories/user'

const API_URL = 'https://api.demoblaze.com'

declare global {
  // Augmenting Cypress's own global namespace is the documented way to type custom commands.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /** Creates a user via POST /signup and fails if the API returns an errorMessage. */
      createUser(user: User): Chainable<void>
      /** Records every native alert in a stub aliased as `@alert`. */
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
  // Listening to the window:alert event (instead of stubbing window.alert) survives page
  // reloads: login reloads the page and the product/cart pages are full page loads.
  cy.on('window:alert', cy.stub().as('alert'))
})
