import type { User } from '../factories/user'

export const loginModal = {
  username: () => cy.get('#loginusername'),
  password: () => cy.get('#loginpassword'),
  submitButton: () => cy.get('#logInModal').contains('button', 'Log in'),

  login(user: User) {
    loginModal.username().type(user.username)
    loginModal.password().type(user.password, { log: false })
    loginModal.submitButton().click()
  },
}
