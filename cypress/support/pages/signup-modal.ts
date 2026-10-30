import type { User } from '../factories/user'

export const signupModal = {
  username: () => cy.get('#sign-username'),
  password: () => cy.get('#sign-password'),
  submitButton: () => cy.get('#signInModal').contains('button', 'Sign up'),

  signup(user: User) {
    signupModal.username().type(user.username)
    signupModal.password().type(user.password, { log: false })
    signupModal.submitButton().click()
  },
}
